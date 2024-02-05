import { TokensService } from './tokens.service';
import { DbModule } from 'src/db/db.module';
import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [TokensService, JwtService],
  exports: [TokensService],
  imports: [DbModule],
})
export class TokensModule {}
