import { Injectable, BadRequestException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import ShortUniqueId from 'short-unique-id';
import { TokensService } from 'src/tokens/tokens.service';
import { SendService } from './send.service';
import { v4 as uuidv4 } from 'uuid';
import { EmailResponseDto } from '../dto/email.dto';
import { EmailConfirmPageProps } from './email.controller';

@Injectable()
export class EmailService {
  constructor(
    private dbService: DbService,
    private tokensService: TokensService,
    private sendService: SendService,
  ) {}

  async findByEmail(emailAddress: string) {
    const email = await this.dbService.email.findFirst({
      where: { email: emailAddress },
    });
    if (!email) {
      throw new BadRequestException({ type: 'email-not-founded' });
    }
    return email;
  }

  findByUserId(userId: number) {
    return this.dbService.email.findFirst({ where: { userId } });
  }

  findById(id: number) {
    return this.dbService.email.findFirst({ where: { id } });
  }

  findByActivationLink(activationLink: string) {
    return this.dbService.email.findFirst({ where: { activationLink } });
  }

  async confirm(
    uniqueKey: string,
  ): Promise<Omit<EmailConfirmPageProps, 'apiUrl'>> {
    const email = await this.findByActivationLink(uniqueKey);

    if (!email || email.isActivated) {
      return {
        type: 'error',
        description: false,
        heading: 'Что-то пошло не так...',
      };
    }

    if (
      !(await this.dbService.email.update({
        where: { id: email.id },
        data: {
          isActivated: true,
          activationLink: null,
        },
      }))
    ) {
      throw new BadRequestException({ type: 'email-not-actvate' });
    }

    return {
      type: 'success',
      heading: 'Пользователь активирован!',
      description: 'Ожидайте когда модераторы одобрят ваш акканут...',
    };
  }

  async create(userId: number, email: string) {
    try {
      await this.findByEmail(email);
    } catch {
      if (!(await this.dbService.user.findFirst({ where: { id: userId } }))) {
        throw new BadRequestException({ type: 'user-not-exists' });
      }

      const activationLink = uuidv4();
      const link = process.env.API_URL + '/email/confirm/' + activationLink;
      await this.dbService.email.create({
        data: { userId, email, activationLink },
      });
      return await this.sendService.activationLink(email, link);
    }
    throw new BadRequestException({ type: 'email-exists' });
  }

  async generateSecret(userId: number) {
    const email = await this.findByUserId(userId);

    if (!email) {
      throw new BadRequestException({ type: 'email-not-exists' });
    }

    if (!email.isActivated) {
      throw new BadRequestException({ type: 'email-not-activated' });
    }

    const secret = new ShortUniqueId({ length: 5 }).randomUUID();
    const emailData = await this.dbService.email.update({
      where: { userId },
      data: { secret },
    });
    const { send } = await this.sendService.authSecret(emailData.email, secret);
    const authToken = await this.getAuthToken(userId);

    return { ...authToken, send };
  }

  async activateSecret(userId: number, secret: string, authToken: string) {
    const email = await this.findByUserId(userId);

    if (!email) {
      throw new BadRequestException({ type: 'email-not-exists' });
    }

    if (!email.isActivated) {
      throw new BadRequestException({ type: 'email-not-activated' });
    }

    if (email.secret !== secret) {
      throw new BadRequestException({ type: 'wrong-secret' });
    }

    if (email.authToken !== authToken) {
      throw new BadRequestException({ type: 'wrong-token' });
    }

    return await this.setAuthProperty(email.id);
  }

  private async getAuthToken(userId: number) {
    const email = await this.findByUserId(userId);

    if (!email) {
      throw new BadRequestException({ type: 'email-not-exists' });
    }

    if (!email.secret) {
      throw new BadRequestException({ type: 'secret-not-exists' });
    }

    if (!email.isActivated) {
      throw new BadRequestException({ type: 'email-not-activated' });
    }

    const authToken = await this.tokensService.generateAuthToken(userId);
    await this.dbService.email.update({
      where: { id: email.id },
      data: { authToken: authToken.token },
    });
    return authToken;
  }

  private async setAuthProperty(id: number): Promise<EmailResponseDto> {
    const email = await this.dbService.email.update({
      where: { id },
      data: {
        secret: null,
        authToken: null,
      },
    });

    return { email };
  }
}
