import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Group } from '@prisma/client';
import { DbService } from 'src/db/db.service';
import { GroupService } from 'src/group/group.service';
import {
  FriendPageResponseDto,
  FriendResponseDto,
  FriendsResponseDto,
} from '../dto/friend.dto';
import { GroupResponseDto } from 'src/dto/group.dto';

type CreateType = {
  chars: string;
  groupId?: number;
};

type UpdateOneType = {
  chars?: string;
  groupId?: number;
};

@Injectable()
export class FriendService {
  constructor(
    private dbService: DbService,
    private groupService: GroupService,
  ) {}

  async findPage(
    paged: number,
    limit?: number,
    search?: string | number | null,
  ): Promise<FriendPageResponseDto> {
    const searchParams: any = {};
    const friendPageResponseDto = new FriendPageResponseDto();

    if (paged < 0) {
      throw new BadRequestException({ type: 'page-not-correct' });
    }

    if (search) {
      console.log(+search);

      if (+search) {
        const group = await this.groupService.findByGroupNumber(+search);
        if (group) searchParams.where = { groupId: group.id };
      }
      if (!+search) searchParams.where = { chars: { contains: search } };
    }

    const _limit = limit || 10;
    const allPosts = await this.dbService.friend.count(searchParams);
    const friends = await this.dbService.friend.findMany({
      ...searchParams,
      take: _limit,
      skip: paged * _limit,
    });
    friendPageResponseDto.lastPage = Math.floor(allPosts / _limit);

    if (!friends.length) {
      throw new NotFoundException();
    }

    for (let i = 0; i < friends.length; i++) {
      const id = friends[i].id;
      const { friend } = await this.findById(id);
      friendPageResponseDto.friends.push(friend);
    }

    return friendPageResponseDto;
  }

  async create(
    chars: string,
    groupId: number | null,
  ): Promise<FriendResponseDto> {
    let group: Group | null = null;
    const friendResponseDto = new FriendResponseDto();

    if (await this.dbService.friend.findFirst({ where: { chars } })) {
      throw new BadRequestException({ type: 'friend-exists' });
    }

    if (groupId) {
      const _group = await this.groupService.findById(groupId);

      if (!_group) {
        throw new NotFoundException({ type: 'group-not-founded' });
      }

      group = _group.group;
    }

    friendResponseDto.friend = {
      group,
      places: [],
      ...(await this.dbService.friend.create({
        data: { groupId: group?.id, chars },
      })),
    };

    return friendResponseDto;
  }

  async findById(id: number): Promise<FriendResponseDto> {
    let group: GroupResponseDto['group'] | null = null;
    const friendResponseDto = new FriendResponseDto();
    const friend = await this.dbService.friend.findFirst({
      where: { id },
    });

    if (!friend) {
      throw new NotFoundException();
    }

    const places =
      (await this.dbService.place.findMany({
        where: { friendId: friend.id },
      })) || [];

    if (friend.groupId) {
      const _group = await this.groupService.findById(friend.groupId);
      if (_group.group) {
        group = _group.group;
      }
    }

    friendResponseDto.friend = { ...friend, places, group };
    return friendResponseDto;
  }

  async updateOne(
    id: number,
    chars?: string,
    groupId?: number | null,
  ): Promise<FriendResponseDto> {
    const friendResponseDto = await this.findById(id);

    if (!friendResponseDto.friend) {
      throw new NotFoundException({ type: 'friend-not-found' });
    }

    if (chars) {
      const charsFriend = await this.dbService.friend.findFirst({
        where: { chars },
      });
      if (charsFriend && charsFriend.chars !== friendResponseDto.friend.chars) {
        throw new UnauthorizedException({ type: 'friend-exists' });
      }
      friendResponseDto.friend.chars = chars;
    }

    if (groupId) {
      const { group } = await this.groupService.findById(groupId);

      if (!group) {
        throw new NotFoundException({ type: 'group-not-founded' });
      }

      if (friendResponseDto.friend.group) {
        const prevGroupDto = await this.groupService.findById(
          friendResponseDto.friend.group.id,
        );

        if (prevGroupDto.group.leadId === id) {
          await this.dbService.group.update({
            where: { id: prevGroupDto.group.id },
            data: { leadChars: null, leadId: null },
          });
        }
      }

      friendResponseDto.friend.group = group || null;
    }

    if (chars || groupId) {
      await this.dbService.friend.update({
        where: { id },
        data: {
          chars: friendResponseDto.friend.chars,
          groupId: groupId === null ? null : friendResponseDto.friend.group?.id,
        },
      });
    }

    return friendResponseDto;
  }

  async updateGroup(
    ids: number[],
    groupId: number,
  ): Promise<FriendsResponseDto> {
    const friendsResponseDto = new FriendsResponseDto();

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      await this.dbService.friend.update({ where: { id }, data: { groupId } });
      const { friend } = await this.findById(id);
      friendsResponseDto.friends.push(friend);
    }

    return friendsResponseDto;
  }

  async deleteMany(ids: number[]) {
    ids.map(async (id) => {
      const group = await this.dbService.group.findFirst({
        where: { leadId: id },
      });
      await this.dbService.friend.delete({ where: { id } });
      if (group) {
        await this.dbService.group.update({
          where: { id: group.id },
          data: { leadChars: null, leadId: null },
        });
      }
    });
  }

  async findFriends(): Promise<FriendsResponseDto> {
    const friendsResponseDto = new FriendsResponseDto();
    const friends = await this.dbService.friend.findMany();

    for (let i = 0; i < friends.length; i++) {
      const id = friends[i].id;
      const { friend } = await this.findById(id);
      friendsResponseDto.friends.push(friend);
    }

    return friendsResponseDto;
  }
}
