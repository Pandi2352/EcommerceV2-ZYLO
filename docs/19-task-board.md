# Task Board & Sprint Tracker

## 1. Sprint 1: Core Foundation & Infrastructure (Day 1 Focus)

### TASK-001: NestJS Scaffolding & Swagger Documentation
- **Module**: `server/`
- **Status**: `DONE`
- **Priority**: High (Blocker)
- **Requirements**:
  - NestJS application configured with strict TypeScript compiler options.
  - Global `ValidationPipe` enabled (`whitelist: true`, `transform: true`).
  - Swagger OpenAPI integration mounted at `/api/docs` via `DocumentBuilder`.
  - Global `HttpExceptionFilter` and `TransformInterceptor`.
- **Acceptance Criteria**:
  - `npm run start:dev --prefix server` starts successfully.
  - Navigating to `http://localhost:5000/api/docs` renders the interactive Swagger UI.

---

### TASK-002: MongoDB & Mongoose Setup
- **Module**: `server/src/config/database.config.ts`
- **Status**: `DONE` (one sub-item remaining: DB check in health endpoint)
- **Priority**: High (Blocker)
- **Requirements**:
  - MongoDB connection configured using `@nestjs/mongoose` and `mongoose`.
  - Environment variables loaded via `@nestjs/config`.
  - Health check endpoint `GET /api/v1/health` checking database connectivity.
- **Acceptance Criteria**:
  - Backend connects to local or Dockerized MongoDB 7 on boot.
  - [ ] **Remaining**: `GET /api/v1/health` returns status `200` with `"database": "connected"` (the health endpoint does not check DB connectivity yet).

---

### TASK-003: React + Vite + Tailwind + React Router DOM + Axios
- **Module**: `apps/storefront/`, `apps/admin/`, `packages/shared/` (originally `client/`, split in TASK-005C)
- **Status**: `DONE`
- **Priority**: High (Blocker)
- **Requirements**:
  - Vite React TypeScript template initialized.
  - Tailwind CSS configured with custom color tokens (`indigo`, `slate`, `emerald`, `rose`).
  - React Router DOM v7 router hierarchy with layout shells.
  - Axios HTTP client configured with base URL and cookie support.
- **Acceptance Criteria**:
  - Frontends launch via `npm run dev:storefront` and `npm run dev:admin`.
  - Frontend successfully queries `GET /api/v1/health` and renders the connection status.

---

## 2. Sprint 2: Authentication & User Accounts (Day 2 Focus)

### TASK-004: User & Address Mongoose Schemas
- **Module**: `server/src/modules/users/`
- **Status**: `DONE`
- **Requirements**:
  - Mongoose `User` schema in `schemas/` (UUID string `_id`, unique email index, password hash, role enum).
  - `Address` subdocument schema embedded in `User` with `isDefault` flag.

### TASK-005: NestJS AuthModule & Passport JWT
- **Module**: `server/src/modules/auth/`
- **Status**: `DONE`
- **Requirements**:
  - Register, Login, Refresh (token rotation with reuse detection), Logout, and Me endpoints with Swagger annotations.
  - Dual JWT tokens in HttpOnly cookies.
  - `JwtAuthGuard` and `RolesGuard` registered globally, plus the `@CurrentUser()` decorator.

### TASK-005B: MVP 1 — Complete Authentication (line-items Module 1)
- **Module**: `server/src/modules/{auth,audit,mail}/`, `packages/shared/src/auth/`
- **Status**: `DONE`
- **Delivered** (details in [11-auth-rbac.md](./11-auth-rbac.md)):
  - Separate storefront / admin login endpoints; role hierarchy `SUPER_ADMIN ⊇ ADMIN ⊇ SUPPORT_AGENT`.
  - Email verification, forgot/reset password, change password, reuse prevention, forced first-login change.
  - Lockout after 5 failures, logout from all devices, security audit log (IP + user agent) with admin UI.
  - TOTP two-factor with QR setup and one-time backup codes; Google OAuth2 with account linking.
- **Verification**: 57-check end-to-end API scenario suite passing; client and server build with 0 errors.
- **Follow-ups**: configure real SMTP and Google credentials per environment; add automated tests to CI (see testing strategy).

### TASK-005C: Split storefront and admin into separate apps
- **Module**: `apps/storefront/`, `apps/admin/`, `packages/shared/`, `docker/web.Dockerfile`
- **Status**: `DONE`
- **Delivered** (rationale in [ADR-007](./20-decision-log.md)):
  - `client/` split into `apps/storefront` (dev `localhost:5176`) and `apps/admin` (dev `127.0.0.1:5175`, routes without the `/admin` prefix).
  - Shared UI kit, hooks, API client and auth building blocks moved to `packages/shared` (`@zylo/shared`, imported via `@shared/*`).
  - Root npm workspaces (`apps/*`, `packages/*`) with `dev:*` / `build:*` scripts; server stays a standalone install.
  - Each app admits only its own roles via `PortalProvider` + `AuthProvider`; server `ADMIN_URL` points staff email links at the admin origin.
  - `docker/web.Dockerfile` (`APP=storefront|admin`) replaces `docker/client.Dockerfile`; compose runs `storefront` and `admin` services.
- **Verification**: storefront bundle contains no admin code (427 KB → 404 KB).

---

## 3. Sprint 3: Catalog Management (Day 3-5 Focus)

### TASK-006: Category & Brand Domain Modules
- **Module**: `server/src/modules/categories/`
- **Status**: `TODO`
- **Requirements**:
  - Category schema with self-referencing `parentId` for subcategories.
  - Slug generation and Admin CRUD endpoints documented in Swagger.

### TASK-007: Product Catalog & Variant Matrix
- **Module**: `server/src/modules/products/`
- **Status**: `TODO`
- **Requirements**:
  - Mongoose schemas for `Product`, `ProductImage`, and `ProductVariant`.
  - Multi-filter search endpoint with pagination, price range, and category filter.

---

## 4. Sprint 4: Commerce Flow (Day 6-8 Focus)

### TASK-008: Cart & Server-Side Pricing Engine
- **Module**: `server/src/modules/cart/`
- **Status**: `TODO`
- **Requirements**:
  - `Cart` and `CartItem` schemas.
  - Live stock verification and server-side subtotal computation.

### TASK-009: Transactional Order Placement & Stock Lock
- **Module**: `server/src/modules/orders/`
- **Status**: `TODO`
- **Requirements**:
  - Mongoose session transaction reserving stock with a conditional atomic decrement (`$inc` guarded by `stock: { $gte: qty }`).
  - Order state machine supporting `PENDING` to `DELIVERED`.

---

## 5. Sprint 5: Admin Control Plane (Day 9-10 Focus)

### TASK-010: Admin Dashboard & Order Management
- **Module**: `apps/admin/src/pages/`
- **Status**: `TODO`
- **Requirements**:
  - Admin KPIs (Revenue, Orders, Low Stock SKUs).
  - Order management table with status transitions.
