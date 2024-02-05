import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Body,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  SignInDto,
  SignUpDto,
  AuthConfirmDto,
  SignInResponseDto,
  SignUpResponseDto,
} from '../dto/auth.dto';
import { CookieService } from './cookie.service';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthGuard } from './auth.guard';
import { NoTokensGuard } from 'src/tokens/tokens.guard';
import { UserResponseDto } from 'src/dto/user.dto';

@ApiTags('Auth')
@Controller('auth')
@ApiSecurity('Access-Key')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
  ) {}

  @Post('sign-up')
  @UseGuards(NoTokensGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: SignUpResponseDto })
  signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    const { email, password, username } = signUpDto;
    return this.authService.signUp(username, email, password);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @UseGuards(NoTokensGuard)
  @ApiOkResponse({ type: SignInResponseDto })
  signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignInResponseDto> {
    return this.authService.signIn(signInDto.username, signInDto.password, res);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('auth'))
  @ApiOkResponse({ type: UserResponseDto })
  async authConfirm(
    @Req() req: Request,
    @Body() authConfirmDto: AuthConfirmDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const { accessToken, refreshToken, user } =
      await this.authService.authConfirm(authConfirmDto.secret, req);
    this.cookieService.setToken(res, refreshToken, 'refresh');
    this.cookieService.setToken(res, accessToken, 'access');
    this.cookieService.removeToken(res, 'auth');
    return { user };
  }

  @Get('sign-out')
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('access'))
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.signOut(
      req.cookies[CookieService.tokenKeys.refresh],
    );
    this.cookieService.removeToken(res, 'refresh');
    this.cookieService.removeToken(res, 'access');
  }

  @Get('refresh-tokens')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('refresh'))
  @ApiOkResponse({ type: UserResponseDto })
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const { accessToken, refreshToken, user } =
      await this.authService.refreshTokens(req);
    this.cookieService.setToken(res, refreshToken, 'refresh');
    this.cookieService.setToken(res, accessToken, 'access');
    return { user };
  }
}
