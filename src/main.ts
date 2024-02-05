import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (process.env.SWAGGER_DOCUMENTATION === 'show') {
    const config = new DocumentBuilder()
      .addApiKey(
        {
          type: 'apiKey',
          name: 'Access-Key',
          description: process.env.ACCESS_KEY,
        },
        'Access-Key',
      )
      .setTitle('API Docs')
      .build();
    const document = SwaggerModule.createDocument(app, config, {});
    SwaggerModule.setup('documentation', app, document);
  }

  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
