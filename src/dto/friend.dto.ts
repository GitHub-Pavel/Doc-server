import { ApiProperty } from '@nestjs/swagger';
import { Friend, Group, Place } from '@prisma/client';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export type FriendResponse = Omit<Friend, 'groupId'> & {
  places: Place[];
  group: Group | null;
};

export class FriendPageDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 0 })
  paged: number;

  @ApiProperty({ example: 10 })
  limit?: number;

  @ApiProperty({ example: 'ПТ', type: 'string | number | null | undefined' })
  search?: string | number | null;
}

export class CreateFriendDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'ПТ' })
  chars: string;

  @ApiProperty({ example: 1 })
  groupId: number | null;
}

export class FindFriendDto {
  @IsNotEmpty()
  @ApiProperty({ example: '1' })
  id: string;
}

export class UpdateFriendDto {
  @ApiProperty({ example: 1 })
  groupId?: number | null;

  @ApiProperty({ example: 'ПТ' })
  chars?: string;

  @ApiProperty({ example: [1, 2, 3], type: 'placeId[]' })
  places?: number[];
}

export class UpdateFriendsGroupDto {
  @IsArray()
  @ApiProperty({ example: [1, 2, 3], type: 'friendId[]' })
  ids: number[];

  @IsNumber()
  @ApiProperty({ example: 1 })
  groupId: number;
}

export class DeleteManyFriendsDto {
  @IsArray()
  @ApiProperty({ example: [1, 2, 3], type: 'friendId[]' })
  ids: number[];
}

export class FriendResponseDto {
  @ApiProperty({
    example: {
      chars: 'ПТ',
      group: {
        id: 1,
        group: 324,
      },
      id: 1,
      places: [
        {
          id: 1,
          isOnHands: true,
          friendId: 1,
          takeAt: Date.now(),
          number: 121,
        },
      ],
    },
    type: 'Friend',
  })
  friend: FriendResponse;
}

export class FriendsResponseDto {
  @ApiProperty({
    example: [
      {
        chars: 'ПТ',
        groupId: 1,
        id: 1,
        group: {
          id: 1,
          group: 324,
        },
        places: [
          {
            id: 1,
            isOnHands: true,
            friendId: 1,
            takeAt: Date.now(),
            number: 121,
          },
        ],
      },
      {
        chars: 'СХ',
        groupId: 1,
        id: 2,
        group: null,
        places: [
          {
            id: 3,
            isOnHands: true,
            friendId: 2,
            takeAt: Date.now(),
            number: 314,
          },
        ],
      },
    ],
    type: 'Friend[]',
  })
  friends: FriendResponse[];

  constructor(friends: FriendResponse[] = []) {
    this.friends = friends;
  }
}

export class FriendPageResponseDto extends FriendsResponseDto {
  @ApiProperty({ example: 10, type: 'number | undefined' })
  lastPage?: number;
}
