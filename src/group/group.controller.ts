import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/roles/roles.guard';
import { GroupService } from './group.service';
import {
  CreateGroupDto,
  DeleteManyGroupsDto,
  GroupResponseDto,
  GroupsResponseDto,
} from '../dto/group.dto';

@ApiTags('Group')
@Controller('group')
@ApiSecurity('Access-Key')
@UseGuards(AuthGuard('access'))
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('HELPER'))
  @ApiOkResponse({ type: GroupsResponseDto })
  async findMany(): Promise<GroupsResponseDto> {
    return await this.groupService.findMany();
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RoleGuard('GROUPMOD'))
  @ApiOkResponse({ type: GroupResponseDto })
  async create(
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    return await this.groupService.create(
      createGroupDto.number,
      createGroupDto.leadId,
    );
  }

  @ApiOkResponse()
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('GROUPMOD'))
  async deleteMany(@Body() deleteManyFriendsDto: DeleteManyGroupsDto) {
    await this.groupService.deleteMany(deleteManyFriendsDto.ids);
  }
}
