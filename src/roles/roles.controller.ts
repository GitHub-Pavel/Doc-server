import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RoleGuard } from './roles.guard';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PushRoleDto, UserActivateDto } from '../dto/role.dto';
import { RolesService } from './roles.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserResponseDto } from 'src/dto/user.dto';

@ApiTags('Role')
@Controller('role')
@ApiSecurity('Access-Key')
@UseGuards(AuthGuard('access'))
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiOkResponse()
  @ApiTags('Confirm')
  @Get('activate/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('MOD'))
  async userActivate(@Param() userActivateDto: UserActivateDto) {
    await this.rolesService.userActivate(+userActivateDto.id);
  }

  @Put('push')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard('ADMIN'))
  @ApiOkResponse({ type: UserResponseDto })
  async pushRole(@Body() pushRoleDto: PushRoleDto): Promise<UserResponseDto> {
    return await this.rolesService.pushRole(pushRoleDto.id, pushRoleDto.role);
  }
}
