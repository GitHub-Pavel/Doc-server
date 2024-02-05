import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { DbModule } from 'src/db/db.module';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService, JwtService],
  imports: [UsersModule, DbModule, TokensModule],
})
export class RolesModule {}
