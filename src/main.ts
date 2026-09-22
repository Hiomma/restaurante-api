import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = (
        process.env.CORS_ORIGIN || 'http://localhost:3001'
      ).split(',');
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
    }),
  );

  app.use(
    '/auth/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50,
    }),
  );

  app.use(
    '/auth/register',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
