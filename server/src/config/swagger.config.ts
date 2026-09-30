import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configure and initialize OpenAPI Swagger documentation for ZYLO API
 */
export function setupSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ZYLO E-Commerce REST API')
    .setDescription(
      'Enterprise-grade NestJS REST API with MongoDB, Mongoose, UUID entities, and dual JWT cookie authentication.'
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT access token (or authenticate via cookies)',
        in: 'header',
      },
      'JWT-auth'
    )
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'HttpOnly access token cookie',
    })
    .addTag('Health', 'System status and operational readiness checks')
    .addTag('Auth', 'Customer & Admin authentication, session tokens, and password management')
    .addTag('Users', 'User account profiles, preferences, and delivery addresses')
    .addTag('Categories', 'Catalog taxonomy, hierarchical categories, and navigation tags')
    .addTag('Products', 'Product catalog, variant matrices, pricing, and inventory')
    .addTag('Cart', 'Shopping cart items, guest carts, and quantity updates')
    .addTag('Orders', 'Order placement, checkout state machine, and customer order history')
    .addTag('Admin', 'Operations control plane, dashboard KPIs, and management tools')
    .addTag('Audit', 'Security audit trail: sign-ins, lockouts, password and MFA changes')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'ZYLO API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
