import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CookieService } from 'src/auth/cookie.service';

@Injectable()
export class TokensService {
  private tokenSecrets = {
    access: process.env.JWT_ACCESS_SECRET,
    refresh: process.env.JWT_REFRESH_SECRET,
    auth: process.env.JWT_AUTH_SECRET,
  };

  constructor(
    private jwtService: JwtService,
    private dbService: DbService,
  ) {}

  async generateTokens(userId: number) {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId },
      { expiresIn: '15m', secret: process.env.JWT_ACCESS_SECRET },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId },
      { expiresIn: '3d', secret: process.env.JWT_REFRESH_SECRET },
    );
    const token = this.dbService.refreshToken.findFirst({
      where: { token: refreshToken },
    });
    if (!token) {
      await this.dbService.refreshToken.create({
        data: { userId, token: refreshToken },
      });
    }
    return { accessToken, refreshToken };
  }

  async generateAuthToken(userId: number) {
    const token = await this.jwtService.signAsync(
      { sub: userId },
      { expiresIn: '2m', secret: process.env.JWT_AUTH_SECRET },
    );
    return { token, authTokenExpire: Date.now() + 2 * 60 * 1000 };
  }

  async validateToken(
    request: Request,
    tokenType: keyof typeof this.tokenSecrets,
  ) {
    const token = request.cookies[CookieService.tokenKeys[tokenType]];

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.tokenSecrets[tokenType],
      });
      const field = tokenType === 'auth' ? tokenType : 'user';
      if (
        !(await this.dbService.user.findFirst({ where: { id: payload.sub } }))
      ) {
        throw new UnauthorizedException();
      }
      request[field] = payload;
    } catch {
      if (tokenType === 'access') {
        throw new UnauthorizedException({ type: 'invalid-token' });
      }
      throw new UnauthorizedException();
    }

    return token;
  }

  async removeRefreshToken(token: string) {
    if (await this.findByToken(token)) {
      this.dbService.refreshToken.delete({ where: { token } });
    }
  }

  findByUserId(userId: number) {
    return this.dbService.refreshToken.findMany({ where: { userId } });
  }

  findByToken(token: string) {
    return this.dbService.refreshToken.findMany({ where: { token } });
  }
}
