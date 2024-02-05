import { EmailProps } from 'src/dto/email.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  username: string;
  email: string;
  roles: Role[];
  hash: string;
  salt: string;
}

export class UserResponseDto {
  @ApiProperty({
    example: {
      id: 1,
      roles: ['HELPER'],
      username: 'MyUsername8',
      email: {
        email: 'example@gmail.com',
        id: 1,
        userId: 1,
        isActivated: true,
      },
    },
    type: 'User',
  })
  user: {
    id: number;
    roles: Role[];
    username: string;
    email: EmailProps;
    hash?: string;
    salt?: string;
  };
}

export class UserDeleteDto {
  @ApiProperty({ example: 1, type: 'string' })
  id: string;
}
