import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DbModule } from 'src/db/db.module';
import { UsersController } from './users.controller';
import { EmailModule } from 'src/email/email.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { JwtService } from '@nestjs/jwt';
import { CookieService } from 'src/auth/cookie.service';

@Module({
  providers: [UsersService, JwtService, CookieService],
  imports: [DbModule, EmailModule, TokensModule],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
