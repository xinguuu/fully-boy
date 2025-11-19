import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SentryExceptionFilter } from './filters/sentry-exception.filter';
import { initSentry } from './config/sentry.config';

async function bootstrap() {
  // Initialize Sentry FIRST
  initSentry('auth-service');

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Apply filters (Sentry filter should be first to catch all errors)
  app.useGlobalFilters(
    new SentryExceptionFilter(),
    new HttpExceptionFilter(),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Auth Service is running on: http://localhost:${port}`);
}

bootstrap();
