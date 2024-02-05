import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { SendResponse } from 'src/email/send.service';

export class SignUpDto {
  @ApiProperty({ example: 'example@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MyUsername8' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @MinLength(8, {
    message:
      'Password is too short. Minimal length is 8 characters, but actual is $value',
  })
  password: string;
}

export class SignInDto {
  @ApiProperty({ example: 'MyUsername8' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  password: string;
}

export class AuthConfirmDto {
  @ApiProperty({ example: 'njw4j' })
  @IsNotEmpty()
  secret: string;
}

export class SignInResponseDto {
  @ApiProperty({ example: Date.now() + 2 * 60 * 1000 })
  authTokenExpire: number;

  @ApiProperty({
    example: 'auth-secret',
    type: 'auth-secret | activation-link | false',
  })
  send: SendResponse['send'];
}

export class SignUpResponseDto {
  @ApiProperty({
    example: 'activation-link',
    type: 'auth-secret | activation-link | false',
  })
  send: SendResponse['send'];
}
