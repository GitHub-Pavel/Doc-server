import { UserResponseDto } from 'src/dto/user.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { CreateUserDto } from '../dto/user.dto';
import { EmailService } from 'src/email/email.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CookieService } from 'src/auth/cookie.service';

// TODO: Remove hash and salt from API Queries
@Injectable()
export class UsersService {
  constructor(
    private dbService: DbService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async findWithData(where: Record<string, unknown>): Promise<UserResponseDto> {
    const userResponseDto = new UserResponseDto();
    const userData = await this.dbService.user.findFirst({ where });

    if (!userData) {
      throw new BadRequestException({ type: 'user-not-founded' });
    }

    const emailData = await this.emailService.findByUserId(userData.id);

    if (!emailData) {
      throw new BadRequestException({ type: 'email-not-founded' });
    }

    const { activationLink, authToken, secret, ...email } = emailData;
    userResponseDto.user = { ...userData, email };
    return userResponseDto;
  }

  hasUsers() {
    return this.dbService.user.count();
  }

  async create(createUserDto: CreateUserDto) {
    const { email, ...data } = createUserDto;

    if (
      await this.dbService.user.findFirst({
        where: { username: data.username },
      })
    ) {
      throw new BadRequestException({ type: 'username-exists' });
    }

    if (await this.dbService.email.findFirst({ where: { email } })) {
      throw new BadRequestException({ type: 'email-exists' });
    }

    const { id } = await this.dbService.user.create({ data });
    return await this.emailService.create(id, email);
  }

  async deleteUser(id: number) {
    await this.findWithData({ id });
    await this.dbService.email.delete({ where: { userId: id } });
    await this.dbService.user.delete({ where: { id } });
  }

  async delete(req: Request) {
    const token = req.cookies[CookieService.tokenKeys.access];
    const { sub } = await this.jwtService.signAsync(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
    await this.findWithData({ id: +sub });
    await this.dbService.email.delete({ where: { userId: +sub } });
    await this.dbService.user.delete({ where: { id: +sub } });
  }
}
