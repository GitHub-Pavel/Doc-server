import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { DbModule } from 'src/db/db.module';
import { GroupController } from './group.controller';
import { TokensModule } from 'src/tokens/tokens.module';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [GroupService, JwtService],
  imports: [DbModule, TokensModule, UsersModule],
  exports: [GroupModule],
  controllers: [GroupController],
})
export class GroupModule {}
