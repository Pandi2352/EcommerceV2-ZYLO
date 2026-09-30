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

### TASK-002: PostgreSQL Database & TypeORM Setup
- **Module**: `server/src/config/database.config.ts`
- **Status**: `READY` (Configured, ready for database instance boot)
- **Priority**: High (Blocker)
- **Requirements**:
  - PostgreSQL connection configured using `@nestjs/typeorm` and `pg`.
  - Environment variables loaded via `@nestjs/config`.
  - Health check endpoint `GET /api/v1/health` checking database connectivity.
- **Acceptance Criteria**:
  - Backend connects to local or Dockerized PostgreSQL 16 on boot.
  - `GET /api/v1/health` returns status `200` with `"database": "connected"`.

---

### TASK-003: React + Vite + Tailwind + React Router DOM + Axios
- **Module**: `client/`
- **Status**: `DONE`
- **Priority**: High (Blocker)
- **Requirements**:
  - Vite React TypeScript template initialized.
  - Tailwind CSS configured with custom color tokens (`indigo`, `slate`, `emerald`, `rose`).
  - React Router DOM v6 router hierarchy with layout shells.
  - Axios HTTP client configured with base URL and cookie support.
- **Acceptance Criteria**:
  - Frontend launches via `npm run dev --prefix client`.
  - Frontend successfully queries `GET /api/v1/health` and renders the connection status.

---

## 2. Sprint 2: Authentication & User Accounts (Day 2 Focus)

### TASK-004: User & Address PostgreSQL Entities
- **Module**: `server/src/modules/users/`
- **Status**: `TODO`
- **Requirements**:
  - TypeORM `User` entity (UUID, email UNIQUE, password_hash, role ENUM).
  - TypeORM `Address` entity linked to `User` with `isDefault` flag.

### TASK-005: NestJS AuthModule & Passport JWT
- **Module**: `server/src/modules/auth/`
- **Status**: `TODO`
- **Requirements**:
  - Register, Login, Refresh, and Logout controllers with Swagger annotations.
  - Dual JWT tokens in HttpOnly cookies.
  - `JwtAuthGuard`, `RolesGuard`, and `@CurrentUser()` decorator.

---

## 3. Sprint 3: Catalog Management (Day 3-5 Focus)

### TASK-006: Category & Brand Domain Modules
- **Module**: `server/src/modules/categories/`
- **Status**: `TODO`
- **Requirements**:
  - Category entity with self-referencing `parentId` for subcategories.
  - Slug generation and Admin CRUD endpoints documented in Swagger.

### TASK-007: Product Catalog & Variant Matrix
- **Module**: `server/src/modules/products/`
- **Status**: `TODO`
- **Requirements**:
  - Entities for `Product`, `ProductImage`, and `ProductVariant`.
  - Multi-filter search endpoint with pagination, price range, and category filter.

---

## 4. Sprint 4: Commerce Flow (Day 6-8 Focus)

### TASK-008: Cart & Server-Side Pricing Engine
- **Module**: `server/src/modules/cart/`
- **Status**: `TODO`
- **Requirements**:
  - `Cart` and `CartItem` entities.
  - Live stock verification and server-side subtotal computation.

### TASK-009: Transactional Order Placement & Stock Lock
- **Module**: `server/src/modules/orders/`
- **Status**: `TODO`
- **Requirements**:
  - TypeORM transaction reserving stock with row lock (`FOR UPDATE`).
  - Order state machine supporting `PENDING` to `DELIVERED`.

---

## 5. Sprint 5: Admin Control Plane (Day 9-10 Focus)

### TASK-010: Admin Dashboard & Order Management
- **Module**: `client/src/pages/admin/`
- **Status**: `TODO`
- **Requirements**:
  - Admin KPIs (Revenue, Orders, Low Stock SKUs).
  - Order management table with status transitions.
