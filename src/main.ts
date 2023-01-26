import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Sentry.init();
  const config = new DocumentBuilder()
    .setTitle('WorldAthletics Proxy API')
    .setDescription('The worldathletics proxy API description')
    .setVersion('1.0')
    .addTag('worldathletics')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
