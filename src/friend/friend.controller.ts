import {
  CreateFriendDto,
  DeleteManyFriendsDto,
  FindFriendDto,
  FriendPageDto,
  FriendPageResponseDto,
  FriendResponseDto,
  FriendsResponseDto,
  UpdateFriendDto,
  UpdateFriendsGroupDto,
} from '../dto/friend.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/roles/roles.guard';
import { FriendService } from './friend.service';

@ApiTags('Friend')
@Controller('friend')
@ApiSecurity('Access-Key')
@UseGuards(AuthGuard('access'))
export class FriendController {
  constructor(private friendService: FriendService) {}

  @Post('page')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('HELPER'))
  @ApiOkResponse({ type: FriendPageResponseDto })
  async findPage(
    @Body() friendPageDto: FriendPageDto,
  ): Promise<FriendPageResponseDto> {
    return await this.friendService.findPage(
      friendPageDto.paged,
      friendPageDto.limit,
      friendPageDto.search,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('HELPER'))
  @ApiOkResponse({ type: FriendsResponseDto })
  async findFriends(): Promise<FriendsResponseDto> {
    return await this.friendService.findFriends();
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RoleGuard('HELPER'))
  @ApiOkResponse({ type: FriendResponseDto })
  async create(
    @Body() createFriendDto: CreateFriendDto,
  ): Promise<FriendResponseDto> {
    return await this.friendService.create(
      createFriendDto.chars,
      createFriendDto.groupId,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('HELPER'))
  @ApiOkResponse({ type: FriendResponseDto })
  async findOne(
    @Param() findFriendDto: FindFriendDto,
  ): Promise<FriendResponseDto> {
    return await this.friendService.findById(+findFriendDto.id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('HELPER'))
  @ApiOkResponse({ type: FriendResponseDto })
  async updateOne(
    @Body() updateFriendDto: UpdateFriendDto,
    @Param() findFriendDto: FindFriendDto,
  ): Promise<FriendResponseDto> {
    return await this.friendService.updateOne(
      +findFriendDto.id,
      updateFriendDto.chars,
      updateFriendDto.groupId,
    );
  }

  @Put('update-group')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('HELPER'))
  @ApiOkResponse({ type: FriendsResponseDto })
  async updateGroup(
    @Body() updateFriendsGroupDto: UpdateFriendsGroupDto,
  ): Promise<FriendsResponseDto> {
    return await this.friendService.updateGroup(
      updateFriendsGroupDto.ids,
      updateFriendsGroupDto.groupId,
    );
  }

  @ApiOkResponse()
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('HELPER'))
  async deleteMany(@Body() deleteManyFriendsDto: DeleteManyFriendsDto) {
    await this.friendService.deleteMany(deleteManyFriendsDto.ids);
  }
}
