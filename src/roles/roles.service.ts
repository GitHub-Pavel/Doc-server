import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { DbService } from 'src/db/db.service';
import { UserResponseDto } from 'src/dto/user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RolesService {
  constructor(
    private usersService: UsersService,
    private dbService: DbService,
  ) {}

  async userActivate(id: number): Promise<UserResponseDto> {
    const { user } = await this.usersService.findWithData({ id });

    if (!user) {
      throw new BadRequestException({ type: 'user-not-founded' });
    }

    if (!user.roles.includes('NOTACTIVE')) {
      throw new BadRequestException({ type: 'user-activated' });
    }

    if (
      !(await this.dbService.user.update({
        where: { id },
        data: { roles: ['HELPER'] },
      }))
    ) {
      throw new BadRequestException({ type: 'user-not-update' });
    }

    return await this.usersService.findWithData({ id });
  }

  async pushRole(id: number, role: Role) {
    if (!Object.keys(Role).filter((expectRole) => role === expectRole).length) {
      throw new BadRequestException({ type: 'role-not-exists' });
    }

    const { user } = await this.usersService.findWithData({ id });

    if (user.roles.filter((expectRole) => expectRole === role).length) {
      throw new BadRequestException({ type: 'user-has-role' });
    }

    const roles = [...user.roles, role];
    await this.dbService.user.update({ where: { id }, data: { roles } });
    return await this.usersService.findWithData({ id });
  }
}
