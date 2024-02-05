import {
  CanActivate,
  ExecutionContext,
  mixin,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { CookieService } from 'src/auth/cookie.service';
import { UsersService } from 'src/users/users.service';

export const RoleGuard = (role: Role, noRole = false) => {
  class RolesGuardClass implements CanActivate {
    constructor(
      @Inject(JwtService) readonly jwtService: JwtService,
      @Inject(UsersService) readonly usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request: Request = context.switchToHttp().getRequest();
      const token = request.cookies[CookieService.tokenKeys.access];
      const { sub: id } = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      const { user } = await this.usersService.findWithData({ id });
      const roleFusion = user.roles.filter((userRole) => userRole === role);

      if (user.roles.includes('ADMIN')) {
        return true;
      }

      if ((roleFusion.length && noRole) || (!roleFusion.length && !noRole)) {
        throw new UnauthorizedException();
      }

      return true;
    }
  }

  return mixin(RolesGuardClass);
};
