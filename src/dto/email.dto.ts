import { ApiProperty } from '@nestjs/swagger';

export type EmailProps = {
  id: number;
  isActivated: boolean;
  userId: number;
  email: string;
};

export class EmailCreateDto {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'example@gmail.com' })
  email: string;
}

export class EmailActivateDto {
  @ApiProperty({ example: 'sdhui-siri-349-jfj-40jkdjf-jdj' })
  key: string;
}

export class EmailResponseDto {
  @ApiProperty({
    example: {
      email: 'example@gmail.com',
      id: 1,
      isActivated: true,
      userId: 1,
    },
  })
  email: EmailProps;
}
