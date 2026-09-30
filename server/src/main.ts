import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
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
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      process.env.ADMIN_URL || 'http://localhost:5174',
      "*"
    ],
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

  // Swagger OpenAPI Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ZYLO E-Commerce REST API')
    .setDescription(
      'Production-grade NestJS REST API with MongoDB, Mongoose, and OpenAPI Swagger documentation.'
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT bearer token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addCookieAuth('access_token')
    .addTag('Health', 'System and database health checks')
    .addTag('Auth', 'Authentication, token refresh, and password recovery')
    .addTag('Users', 'User accounts, addresses, and customer profiles')
    .addTag('Categories', 'Hierarchical catalog taxonomy and categories')
    .addTag('Brands', 'Brand directory and manufacturer management')
    .addTag('Products', 'Product catalog, variant matrices, and stock')
    .addTag('Cart', 'Shopping cart items and server-side pricing')
    .addTag('Wishlist', 'Customer saved items and wishlist management')
    .addTag('Orders', 'Order placement, state machine, and customer history')
    .addTag('Payments', 'Payment intent, gateway verification, and webhooks')
    .addTag('Coupons', 'Promotional discounts and coupon validation')
    .addTag('Reviews', 'Verified buyer ratings and customer reviews')
    .addTag('Admin', 'Operations control plane, dashboard KPIs, and inventory')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'ZYLO API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
    },
  });

  const port = parseInt(process.env.PORT || '5000', 10);
  await app.listen(port);

  logger.log(`=======================================================`);
  logger.log(`🚀 ZYLO API is running on: http://localhost:${port}/${apiPrefix.replace(/^\//, '')}`);
  logger.log(`📚 Swagger OpenAPI Docs:        http://localhost:${port}/api/docs`);
  logger.log(`🩺 Health Check:                http://localhost:${port}/${apiPrefix.replace(/^\//, '')}/health`);
  logger.log(`=======================================================`);
}

bootstrap();
