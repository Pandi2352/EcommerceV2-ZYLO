# Step-by-Step Development Phases & Daily Plan

## 1. Tomorrow's Starting Scope: Day 1 Execution Blueprint

Tomorrow's singular focus is **scaffolding the core foundations cleanly** with NestJS, PostgreSQL, TypeORM, Swagger, React, Vite, and Tailwind.

```
Day 1 Workflow:
NestJS Scaffolding ──► PostgreSQL + TypeORM ──► Swagger Setup ──► Health API ──► React + Tailwind Client ──► Verify
```

### Day 1 Step-by-Step Checklist
1. **Initialize Backend Scaffolding (`server/` — NestJS)**:
   - Scaffold NestJS application with TypeScript (`nest new server` or package initialization).
   - Install dependencies: `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/swagger`, `class-validator`, `class-transformer`, `@nestjs/config`, `cookie-parser`, `helmet`.
   - Setup `config/database.config.ts` connecting to local PostgreSQL.
   - Configure `main.ts` with global `ValidationPipe`, cookie parser, and Swagger OpenAPI mounted at `/api/docs`.
   - Create a clean `HealthModule` with `GET /api/v1/health` checking DB ping.
2. **Initialize Frontend Scaffolding (`client/` — React + TS)**:
   - React + TypeScript + Vite project initialized.
   - Install and configure `tailwindcss`, `postcss`, `autoprefixer`.
   - Install `react-router-dom`, `axios`, `lucide-react`.
   - Setup base layout with Header, Navigation bar, and Footer.
   - Configure Axios client pointing to `http://localhost:5000/api/v1`.
3. **Verify Local Connectivity**:
   - Start PostgreSQL instance (local or via Docker: `docker compose up -d postgres`).
   - Start NestJS backend (`npm run start:dev --prefix server`).
   - Open `http://localhost:5000/api/docs` and execute health check via Swagger UI.
   - Start React frontend (`npm run dev --prefix client`) and verify health status is rendered.

---

## 2. Daily Progression (Days 2 to 10)

### Day 2: Authentication & User Accounts (NestJS AuthModule)
- PostgreSQL `User` and `Address` entities with bcrypt hashing.
- DTOs: `RegisterDto`, `LoginDto` with `class-validator` rules.
- Passport JWT strategy with HttpOnly cookies (`access_token`, `refresh_token`).
- NestJS guards: `JwtAuthGuard`, `RolesGuard`, and `@CurrentUser()` decorator.
- React Auth state, Login page, Register page, and `ProtectedRoute` using React Router DOM.

### Day 3: Categories & Product Catalog Backend
- `Category`, `Brand`, `Product`, `ProductImage`, and `ProductVariant` TypeORM entities.
- Category & Product CRUD controllers decorated with Swagger `@ApiTags` and `@ApiOperation`.
- Pagination, multi-filter search queries using TypeORM query builder.

### Day 4: Product Discovery & Storefront UI
- Home Page with hero banner, category grid, and featured items.
- Shop / Catalog Page with faceted sidebar (categories, price slider, sort dropdown).
- Search bar querying backend text search via Axios.
- Responsive Product Card grid with Tailwind styling.

### Day 5: Product Details Page (PDP) & Variants
- PDP layout: Image gallery with thumbnail selection and zoom.
- Variant switcher (Size, Color) updating active SKU, price, and stock badge.
- Stock availability indicator ("In Stock", "Out of Stock").
- "Add to Cart" and "Buy Now" interactions.

### Day 6: Shopping Cart & Wishlist
- `Cart` and `CartItem` entities and NestJS `CartModule`.
- Live stock verification during cart additions and quantity updates.
- Server-side price calculation.
- React Cart drawer and dedicated `/cart` page with line item subtotal calculations.

### Day 7: Checkout & Coupon Engine
- `CheckoutPage` multi-step flow using React Router DOM: Address selection ➔ Shipping ➔ Coupon input.
- `CouponsModule` in NestJS: Validity engine (dates, min spend, max discount) and discount calculation.
- Order summary review showing subtotal, discount, tax, and grand total.

### Day 8: Order Placement, Transactions & Payments
- PostgreSQL transaction in `OrdersService`: Pessimistic lock (`SELECT ... FOR UPDATE`), inventory decrement, and order creation.
- Order state machine (`PENDING` ➔ `CONFIRMED`).
- Cash on Delivery (COD) flow and Payment Gateway integration (Stripe / Razorpay test mode).
- Customer order history page (`/account/orders`).

### Day 9: Admin Management Control Plane
- Admin layout with sidebar navigation (`/admin/dashboard`).
- KPI metrics cards: Total revenue, order count, active users, low-stock SKUs.
- Admin Order management table: Status transitions (`SHIPPED` ➔ `DELIVERED`).
- Admin Product and Category management forms.

### Day 10: Reviews, Inventory Alerts & Polishing
- Reviews module: Customer feedback submission (verified purchases only) & admin moderation.
- Low-stock dashboard alerts.
- End-to-end testing of complete customer checkout journey.
