import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Friend, Group } from '@prisma/client';
import { DbService } from 'src/db/db.service';
import { GroupResponseDto, GroupsResponseDto } from 'src/dto/group.dto';

@Injectable()
export class GroupService {
  constructor(private dbService: DbService) {}

  async create(group: number, leadId?: number): Promise<GroupResponseDto> {
    let friend: Friend | null = null;
    const groupResponseDto = new GroupResponseDto();
    const createParams: Omit<Group, 'id'> = {
      group,
      leadId: null,
      leadChars: null,
    };

    if (await this.dbService.group.findFirst({ where: { group } })) {
      throw new BadRequestException({ type: 'group-exists' });
    }

    if (leadId) {
      friend = await this.dbService.friend.findFirst({
        where: { id: leadId },
      });

      if (friend) {
        createParams.leadId = leadId;
        createParams.leadChars = friend.chars;
      }
    }

    groupResponseDto.group = await this.dbService.group.create({
      data: createParams,
    });

    if (friend) {
      await this.dbService.friend.update({
        where: { id: friend.id },
        data: { groupId: groupResponseDto.group.id },
      });
      const existsGroups = await this.dbService.group.findMany({
        where: { leadId: friend.id, id: { not: groupResponseDto.group.id } },
      });
      existsGroups.map(
        async (existsGroup) =>
          await this.dbService.group.update({
            where: { id: existsGroup.id },
            data: { leadChars: null, leadId: null },
          }),
      );
    }

    return groupResponseDto;
  }

  async findByGroupNumber(groupNumber: number) {
    return await this.dbService.group.findFirst({
      where: { group: groupNumber },
    });
  }

  async findMany(): Promise<GroupsResponseDto> {
    const groupsResponseDto = new GroupsResponseDto();
    groupsResponseDto.groups = await this.dbService.group.findMany({
      orderBy: [{ group: 'asc' }],
    });
    return groupsResponseDto;
  }

  async findById(id: number): Promise<GroupResponseDto> {
    const groupResponseDto = new GroupResponseDto();
    const group = await this.dbService.group.findFirst({
      where: { id },
    });
    if (!group) {
      throw new NotFoundException();
    }
    groupResponseDto.group = group;
    return groupResponseDto;
  }

  async deleteMany(ids: number[]) {
    ids.map(async (groupId) => {
      if (!groupId) return;
      const friends = await this.dbService.friend.findMany({
        where: { groupId },
      });
      friends.map(async ({ id }) => {
        await this.dbService.friend.update({
          where: { id },
          data: { groupId: null },
        });
      });
      await this.dbService.group.delete({ where: { id: groupId } });
    });
  }
}
