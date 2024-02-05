import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Render,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailActivateDto } from '../dto/email.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

export type EmailConfirmPageProps = {
  apiUrl: string;
  heading: string;
  type: 'error' | 'success';
  description: boolean | string;
};

@Controller('email')
@ApiSecurity('Access-Key')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @ApiTags('Confirm')
  @Get('confirm/:key')
  @Render('email-confirm-page')
  async confirm(
    @Param() emailActivateDto: EmailActivateDto,
  ): Promise<EmailConfirmPageProps> {
    const data = await this.emailService.confirm(emailActivateDto.key);
    return {
      ...data,
      apiUrl: process.env.API_URL as string,
    };
  }
}
