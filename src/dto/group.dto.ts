import { ApiProperty } from '@nestjs/swagger';
import { Group } from '@prisma/client';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @ApiProperty({ example: 1 })
  leadId?: number;
}

export class GroupResponseDto {
  @ApiProperty({ example: { id: 1, group: 1, leadId: 1 }, type: 'Group' })
  group: Group;
}

export class GroupsResponseDto {
  @ApiProperty({
    example: [
      { id: 1, group: 1, leadId: 1 },
      { id: 2, group: 2, leadId: 1 },
    ],
    type: 'Group[]',
  })
  groups: Group[];

  constructor(groups: Group[] = []) {
    this.groups = groups;
  }
}

export class DeleteManyGroupsDto {
  @IsArray()
  @ApiProperty({ example: [1, 2, 3], type: 'groupId[]' })
  ids: number[];
}
