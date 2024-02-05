import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export type SendResponse = {
  send: 'auth-secret' | 'activation-link' | false;
};

type SendTemplateProps = {
  data: string;
  heading: string;
  description: string;
  type: 'activation' | 'secret';
};

@Injectable()
export class SendService {
  constructor(private readonly mailerService: MailerService) {}

  async activationLink(to: string, link: string): Promise<SendResponse> {
    try {
      const context: SendTemplateProps = {
        data: link,
        type: 'activation',
        heading: 'Верефикация аккаунта',
        description: 'Перейдите по ссылке чтобы активировать ваш акканут.',
      };
      await this.mailerService.sendMail({
        to,
        context,
        from: 'noreply@docjw.com',
        subject: 'Verification Account',
        template: 'email-send-template',
      });
      return { send: 'activation-link' };
    } catch {
      return { send: false };
    }
  }

  async authSecret(to: string, secret: string): Promise<SendResponse> {
    try {
      const context: SendTemplateProps = {
        data: secret,
        type: 'secret',
        heading: 'Секретный ключ для авторизации',
        description:
          'Скопируйте и вставьте ключ в приложении, чтобы авторизироваться как пользователь.',
      };
      await this.mailerService.sendMail({
        to,
        context,
        subject: 'Authorization',
        from: 'noreply@docjw.com',
        template: 'email-send-template',
      });
      return { send: 'auth-secret' };
    } catch {
      return { send: false };
    }
  }
}
