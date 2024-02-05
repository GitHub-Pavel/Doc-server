import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { PasswordService } from './auth/password.service';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { RolesModule } from './roles/roles.module';
import { FriendModule } from './friend/friend.module';
import { GroupModule } from './group/group.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
import { AccessKeyMiddleware } from './middlewares/access-key.middleware';

const viewsPath = join(__dirname, '../views');
const dotenv = process.env.DOTENV_FILE
  ? process.env.DOTENV_FILE!
  : 'development.env';

const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: [dotenv],
};

@Module({
  imports: [
    DbModule,
    AuthModule,
    UsersModule,
    ConfigModule.forRoot(configOptions),
    EmailModule,
    RolesModule,
    FriendModule,
    GroupModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: process.env.SMTP_URL,
        template: {
          dir: viewsPath,
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [PasswordService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AccessKeyMiddleware)
      .exclude({ path: '/email/confirm/:key', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
