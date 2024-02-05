import { TokensModule } from 'src/tokens/tokens.module';
import { PasswordService } from './password.service';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from '../email/email.module';
import { AuthController } from './auth.controller';
import { CookieService } from './cookie.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthController],
  imports: [UsersModule, EmailModule, TokensModule],
  providers: [PasswordService, CookieService, AuthService, JwtService],
})
export class AuthModule {}
