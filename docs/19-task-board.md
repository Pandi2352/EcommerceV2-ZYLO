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
- **Module**: `client/`
- **Status**: `DONE`
- **Priority**: High (Blocker)
- **Requirements**:
  - Vite React TypeScript template initialized.
  - Tailwind CSS configured with custom color tokens (`indigo`, `slate`, `emerald`, `rose`).
  - React Router DOM v7 router hierarchy with layout shells.
  - Axios HTTP client configured with base URL and cookie support.
- **Acceptance Criteria**:
  - Frontend launches via `npm run dev --prefix client`.
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
- **Module**: `client/src/pages/admin/`
- **Status**: `TODO`
- **Requirements**:
  - Admin KPIs (Revenue, Orders, Low Stock SKUs).
  - Order management table with status transitions.
