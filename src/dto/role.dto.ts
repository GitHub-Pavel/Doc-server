import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserActivateDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: string;
}

export class PushRoleDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: 'GROUPMOD' })
  @IsNotEmpty()
  @IsString()
  role: Role;
}
