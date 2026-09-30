# Application Security Guidelines

## 1. Zero-Trust Security in NestJS & PostgreSQL

Every incoming HTTP request is treated as untrusted. The backend relies on parameterized queries, strict DTO validation pipes, and route guards to enforce absolute isolation.

---

## 2. Core OWASP Protections

### 2.1 SQL Injection Defense
- **Parameterized Queries**: All database queries executed through TypeORM repositories or query builders automatically use parameterized queries (`$1, $2, ...`).
- **Forbidden**: Never use string concatenation to build raw SQL strings:
  ```typescript
  // STRICTLY FORBIDDEN
  queryRunner.query(`SELECT * FROM products WHERE name = '${input}'`);

  // MANDATORY
  queryRunner.query('SELECT * FROM products WHERE name = $1', [input]);
  ```

### 2.2 Strict DTO Whitelisting
NestJS `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` automatically strips or rejects any payload containing properties not defined in the corresponding DTO, preventing parameter pollution and mass-assignment vulnerabilities.

### 2.3 Rate Limiting with `@nestjs/throttler`
```typescript
// server/src/app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute globally
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```
- Critical auth endpoints (`/auth/login`, `/auth/register`) override throttler limits to maximum 5 requests per minute using `@Throttle({ default: { limit: 5, ttl: 60000 } })`.

### 2.4 IDOR (Insecure Direct Object Reference) Prevention
When accessing or modifying customer-scoped data (orders, cart, addresses):
- Extract `userId` strictly from the authenticated JWT token via `@CurrentUser('id')`.
- Ensure queries enforce `WHERE user_id = :userId`.

### 2.5 Security Headers (Helmet in NestJS)
```typescript
// server/src/main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  // ...
}
```

### 2.6 CORS Whitelisting
```typescript
app.enableCors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
  ],
  credentials: true, // Allows HttpOnly cookies to pass
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
```

---

## 3. Webhook Cryptographic Verification
- Payment webhooks (Stripe / Razorpay) verify HMAC-SHA256 signatures against raw request buffers before processing order status transitions.
