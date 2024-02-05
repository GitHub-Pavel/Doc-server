import { CookieService } from 'src/auth/cookie.service';
import { UsersService } from 'src/users/users.service';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/roles/roles.guard';
import { UserDeleteDto } from '../dto/user.dto';
import { Request, Response } from 'express';

@ApiTags('User')
@Controller('user')
@ApiSecurity('Access-Key')
@UseGuards(AuthGuard('access'))
export class UsersController {
  constructor(
    private usersService: UsersService,
    private cookieService: CookieService,
  ) {}

  @ApiOkResponse()
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('MOD'))
  @UseGuards(AuthGuard('access'))
  async deleteUser(@Param() userDeleteDto: UserDeleteDto) {
    await this.usersService.deleteUser(+userDeleteDto.id);
  }

  @ApiOkResponse()
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('HELPER'))
  @UseGuards(AuthGuard('access'))
  async delete(@Req() req: Request, @Res() res: Response) {
    this.cookieService.removeToken(res, 'refresh');
    this.cookieService.removeToken(res, 'access');
    await this.usersService.delete(req);
  }
}
