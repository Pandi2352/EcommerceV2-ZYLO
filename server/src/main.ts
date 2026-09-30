import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Middleware
  app.use(helmet());
  app.use(cookieParser());

  // CORS Configuration
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global API Prefix
  const apiPrefix = process.env.API_PREFIX || '/api/v1';
  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''));

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global Response Transform Interceptor & Error Filter
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Dedicated OpenAPI Swagger Setup
  setupSwagger(app);

  const port = parseInt(process.env.PORT || '5000', 10);
  await app.listen(port);

  logger.log(`=======================================================`);
  logger.log(`🚀 ZYLO API is running on: http://localhost:${port}/${apiPrefix.replace(/^\//, '')}`);
  logger.log(`📚 Swagger OpenAPI Docs:        http://localhost:${port}/api/docs`);
  logger.log(`🩺 Health Check:                http://localhost:${port}/${apiPrefix.replace(/^\//, '')}/health`);
  logger.log(`=======================================================`);
}

bootstrap();
