import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { DbModule } from 'src/db/db.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { SendService } from './send.service';
import { EmailController } from './email.controller';

@Module({
  providers: [EmailService, SendService],
  imports: [DbModule, TokensModule],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
