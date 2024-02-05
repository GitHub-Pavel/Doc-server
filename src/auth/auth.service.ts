import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from 'src/users/users.service';
import { EmailService } from '../email/email.service';
import { PasswordService } from './password.service';
import { CookieService } from './cookie.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { Request, Response } from 'express';
import { UserResponseDto } from 'src/dto/user.dto';

/**
 * Interesting but not correct example:
 * const noUser = (
 *   await Promise.allSettled([
 *     this.usersService.findWithData({ username }),
 *     this.emailService.findByEmail(email),
 *   ])
 * ).filter((res) => res.status === 'fulfilled');
 *
 * if (!noUser.length) throw [];
 */

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private passwordService: PasswordService,
    private tokensService: TokensService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private cookieService: CookieService,
  ) {}

  async signUp(username: string, email: string, password: string) {
    try {
      const roles: Role[] = ['NOTACTIVE'];
      if (!(await this.usersService.hasUsers())) {
        roles[0] = 'HELPER';
        roles.push('MOD');
        roles.push('ADMIN');
        roles.push('GROUPMOD');
      }

      const salt = this.passwordService.getSalt();
      const hash = this.passwordService.getHash(password, salt);
      const createUser = { hash, salt, username, roles, email };

      return await this.usersService.create(createUser);
    } catch {
      throw new BadRequestException({ type: 'wrong-sign-in-data' });
    }
  }

  async signIn(username: string, password: string, res: Response) {
    const userResponseDto = new UserResponseDto();

    try {
      const { user } = await this.usersService.findWithData({ username });
      if (this.passwordService.getHash(password, user.salt!) !== user.hash)
        throw [];
      userResponseDto.user = user;
    } catch {
      throw new BadRequestException({ type: 'wrong-sign-in-data' });
    }

    userResponseDto.user.roles.map((role) => {
      if (role === 'NOTACTIVE') {
        throw new UnauthorizedException({ type: 'user-not-activated' });
      }
    });

    const { token, ...user } = await this.emailService.generateSecret(
      userResponseDto.user.id,
    );
    this.cookieService.setToken(res, token, 'auth');
    return user;
  }

  async authConfirm(secret: string, req: Request) {
    const authToken = req.cookies[CookieService.tokenKeys.auth];
    const { sub: id } = await this.jwtService.verifyAsync(authToken, {
      secret: process.env.JWT_AUTH_SECRET,
    });
    const tokens = await this.tokensService.generateTokens(id);
    await this.emailService.activateSecret(id, secret, authToken);
    const {
      user: { hash, salt, ...user },
    } = await this.usersService.findWithData({
      id,
    });

    this.removeExpiredRefreashToken(user.id);
    return { ...tokens, user };
  }

  async signOut(refreshToken: string) {
    await this.tokensService.removeRefreshToken(refreshToken);
  }

  async refreshTokens(req: Request) {
    const token = req.cookies[CookieService.tokenKeys.refresh];
    const { sub: id } = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    const {
      user: { hash, salt, ...user },
    } = await this.usersService.findWithData({
      id,
    });
    const tokens = await this.tokensService.generateTokens(id);
    await this.tokensService.removeRefreshToken(token);
    return { ...tokens, user };
  }

  private async removeExpiredRefreashToken(userId: number) {
    const tokens = await this.tokensService.findByUserId(userId);

    if (!tokens.length) return;

    tokens.forEach(async ({ token }) => {
      try {
        await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_REFRESH_SECRET,
        });
      } catch {
        await this.tokensService.removeRefreshToken(token);
      }
    });
  }
}
