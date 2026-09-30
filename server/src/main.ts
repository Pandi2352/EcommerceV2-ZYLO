import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Behind a reverse proxy (nginx in Docker), trust X-Forwarded-For so rate
  // limiting keys on the real client IP instead of the proxy's.
  const trustProxy = config.get<string>('TRUST_PROXY');
  if (trustProxy) {
    app.set('trust proxy', /^\d+$/.test(trustProxy) ? parseInt(trustProxy, 10) : trustProxy);
  }

  // Security Middleware
  app.use(helmet());
  app.use(cookieParser());

  // CORS Configuration: credentialed requests require an explicit origin allowlist
  const allowedOrigins = [config.get<string>('CLIENT_URL'), config.get<string>('ADMIN_URL')]
    .flatMap((value) => (value ? value.split(',') : []))
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global API Prefix
  const apiPrefix = config.get<string>('API_PREFIX', '/api/v1');
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

  const port = parseInt(config.get<string>('PORT', '5000'), 10);
  await app.listen(port);

  logger.log(`=======================================================`);
  logger.log(`🚀 ZYLO API is running on: http://localhost:${port}/${apiPrefix.replace(/^\//, '')}`);
  logger.log(`📚 Swagger OpenAPI Docs:        http://localhost:${port}/api/docs`);
  logger.log(`🩺 Health Check:                http://localhost:${port}/${apiPrefix.replace(/^\//, '')}/health`);
  logger.log(`=======================================================`);
}

bootstrap();
