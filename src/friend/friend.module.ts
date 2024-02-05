import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { DbModule } from 'src/db/db.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { GroupModule } from 'src/group/group.module';
import { GroupService } from 'src/group/group.service';

@Module({
  controllers: [FriendController],
  providers: [FriendService, JwtService, GroupService],
  imports: [GroupModule, DbModule, TokensModule, UsersModule],
  exports: [FriendModule],
})
export class FriendModule {}
