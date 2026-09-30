# Authentication & Role-Based Access Control (RBAC) in NestJS

## 1. Authentication Architecture

ZYLO uses **Passport.js** and **JWT** integrated into **NestJS**, issuing short-lived access tokens and long-lived refresh tokens securely via HttpOnly cookies.

```
+-----------------------------------------------------------------------------------------------+
|                                  NESTJS AUTH & RBAC LIFECYCLE                                 |
|                                                                                               |
|   1. Login / Register  ──► AuthController calls AuthService.validateUser()                    |
|                             - Issues accessToken (15 min) in HttpOnly cookie                  |
|                             - Issues refreshToken (7 days) in HttpOnly cookie                 |
|                                                                                               |
|   2. Request Flow      ──► [JwtAuthGuard] ➔ Passport JwtStrategy extracts cookie/header       |
|                             - Validates cryptographic signature via JWT_SECRET                |
|                             - Injects authenticated user payload into req.user                |
|                                                                                               |
|   3. Role Verification ──► [RolesGuard] checks Reflector metadata against req.user.role       |
|                             - Allows execution if user has @Roles('ADMIN')                    |
|                             - Throws 403 ForbiddenException if unauthorized                   |
|                                                                                               |
|   4. Logout            ──► POST /api/v1/auth/logout clears auth cookies                       |
+-----------------------------------------------------------------------------------------------+
```

---

## 2. NestJS Auth Guard & Passport JWT Strategy

### 2.1 Passport JWT Strategy
```typescript
// server/src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.access_token,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'secretKey',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
```

---

## 3. NestJS Roles Guard & Decorators

### 3.1 `@Roles()` Custom Decorator
```typescript
// server/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### 3.2 Roles Guard Implementation
```typescript
// server/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No role restriction specified
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
```

---

## 4. Current User Custom Decorator (`@CurrentUser()`)

```typescript
// server/src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);
```

---

## 5. Role Hierarchy & Permission Matrix

| Action / Capability | CUSTOMER | ADMIN |
|---|---|---|
| Browse Public Catalog & Search | Allowed | Allowed |
| Manage Personal Cart & Wishlist | Allowed | Allowed |
| Checkout & Place Orders | Allowed | Allowed |
| View Own Order History | Allowed | Allowed |
| Write Product Review | Allowed (if fulfilled) | Allowed |
| Create / Edit Products & Variants | **Forbidden** | **Allowed** |
| Create / Edit Categories & Brands | **Forbidden** | **Allowed** |
| View All Customer Orders | **Forbidden** | **Allowed** |
| Advance Order Status (`SHIPPED`, etc.)| **Forbidden** | **Allowed** |
| Adjust Inventory Quantities | **Forbidden** | **Allowed** |
| Manage Promotional Coupons | **Forbidden** | **Allowed** |
| View Admin Dashboard Analytics | **Forbidden** | **Allowed** |
