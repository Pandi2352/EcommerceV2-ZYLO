# Application Security Guidelines

## 1. Zero-Trust Security in NestJS & MongoDB

Every incoming HTTP request is treated as untrusted. The backend relies on NoSQL injection defenses, strict DTO validation pipes, and route guards to enforce absolute isolation.

---

## 2. Core OWASP Protections

### 2.1 NoSQL Injection Defense
- **Validated DTOs Only**: Every query and body input passes through a `class-validator` DTO (`whitelist: true`) before it reaches a Mongoose filter.
- **Cast to Primitives**: Cast filter values to the expected primitive type (`String(...)`, `Number(...)`) so an attacker cannot smuggle in operator objects such as `{ "$ne": null }`.
- **Reject Operator Keys**: Reject any user-supplied key that starts with `$` in filter input.
- **Mongoose Safeguards**: Enable `sanitizeFilter` and keep `strictQuery` on, so injected query operators and unknown paths are stripped.
- **Forbidden**: Never pass raw `req.query` / `req.body` objects into filters:
  ```typescript
  // STRICTLY FORBIDDEN
  this.userModel.findOne({ email: req.body.email });

  // MANDATORY (validated DTO, cast to primitive)
  this.userModel.findOne({ email: String(dto.email) });
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
Allowed origins come from `CLIENT_URL` (storefront) and `ADMIN_URL` (admin console) in the root `.env`. Both accept comma-separated lists. The same variables also set the Vite dev servers' host and port (`packages/shared/vite.base.ts`), so the browser origin always matches the allowlist.

| App | Default origin | Env var |
|---|---|---|
| Storefront | `http://localhost:5176` | `CLIENT_URL` |
| Admin console | `http://127.0.0.1:5175` (own cookie jar in dev) | `ADMIN_URL` |

Policy (`server/src/config/cors.config.ts`):
- Only listed origins get CORS headers. Other origins are logged and the browser blocks the response.
- `credentials: true`, so HttpOnly auth cookies can be sent; this requires an explicit allowlist, never `*`.
- Allowed headers: `Content-Type`, `Authorization`, `X-Requested-With`. Preflight responses are cached for 10 minutes.
- Requests without an `Origin` header (same-origin, curl, health checks) are not cross-origin and pass through.
- In development both apps call the API through their own `/api` proxy, so browser traffic is same-origin; CORS matters when an app calls the API directly on another origin.

---

## 3. Webhook Cryptographic Verification
- Payment webhooks (Stripe / Razorpay) verify HMAC-SHA256 signatures against raw request buffers before processing order status transitions.
