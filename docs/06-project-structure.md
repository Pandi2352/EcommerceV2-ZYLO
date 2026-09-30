# Project Directory Structure & Code Organization

## 1. Top-Level Monorepo Structure

```
ecommerce-platform/
│
├── client/                     # Frontend Application (React + TS + Tailwind + Vite)
│   ├── public/                 # Static assets, favicon, logos
│   ├── src/                    # React source code
│   ├── index.html              # Vite entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                     # Backend Application (NestJS + TypeScript)
│   ├── src/                    # NestJS source code
│   ├── test/                   # E2E test suites
│   ├── nest-cli.json           # NestJS CLI configuration
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                     # Shared Contracts (DTOs, Enums, Interfaces)
│   ├── src/
│   │   ├── types/
│   │   ├── enums/
│   │   └── constants/
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                       # Project Documentation & Architecture Guides
│   ├── 00-project-context.md
│   ├── ...
│   └── 21-ai-agent-rules.md
│
├── docker/                     # Container configurations
│   ├── client.Dockerfile
│   ├── server.Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml          # Orchestrates MongoDB, NestJS, and React
├── .env.example
├── .gitignore
└── README.md
```

---

## 2. Server Architecture Details (`server/src/` — NestJS)

```
server/src/
├── common/                     # Cross-cutting NestJS infrastructure
│   ├── decorators/             # Custom decorators (@CurrentUser, @Roles, @Public)
│   ├── filters/                # Global exception filters (HttpExceptionFilter)
│   ├── guards/                 # Route guards (JwtAuthGuard, RolesGuard)
│   ├── interceptors/           # TransformResponseInterceptor, LoggingInterceptor
│   ├── middleware/             # Cookie parser, Morgan logging middleware
│   └── pipes/                  # Custom validation pipes
│
├── config/                     # Configuration services
│   ├── database.config.ts      # Mongoose MongoDB connection options
│   └── app.config.ts           # Port, CORS, JWT secrets, environment loader
│
├── database/                   # Indexes & database seeders
│   └── seeds/                  # Seed scripts for initial Admin and catalog data
│
├── modules/                    # Modular feature domains
│   ├── auth/                   # Authentication, JWT strategy, refresh tokens
│   ├── users/                  # User accounts, addresses, profiles
│   ├── categories/             # Product taxonomy & hierarchical categories
│   ├── products/               # Products, variants, images, stock
│   ├── cart/                   # Customer shopping cart & line items
│   ├── wishlist/               # Customer wishlist items
│   ├── orders/                 # Order placement, state machine, items
│   ├── payments/               # Payment intents, gateway verification, webhooks
│   ├── coupons/                # Discounts, promotional codes, usage rules
│   ├── reviews/                # Ratings, customer feedback, review moderation
│   └── admin/                  # Dashboard aggregations, KPI queries
│
├── app.module.ts               # Root module orchestrating all feature modules
└── main.ts                     # Bootstrap entry point (Swagger, CORS, validation)
```

### Modular Domain Blueprint (`server/src/modules/products/`)
Every feature module follows the standard NestJS modular layout:
```
products/
├── dto/
│   ├── create-product.dto.ts   # Class-validator rules & Swagger @ApiProperty()
│   ├── update-product.dto.ts   # PartialType extension of create DTO
│   └── product-query.dto.ts    # Pagination, filter, and sorting query DTO
├── schemas/
│   ├── product.schema.ts       # Mongoose Schema with @Prop(), indexes, subdocuments
│   └── product-image.schema.ts # Subdocument schema for multiple product images
├── products.controller.ts      # Route handlers decorated with @Controller and @ApiTags
├── products.service.ts         # Business logic, price rules, and Mongoose operations
└── products.module.ts          # @Module definition registering controllers & MongooseModel
```

---

## 3. Client Architecture Details (`client/src/` — React + TS)

```
client/src/
├── assets/                     # SVGs, brand logos, placeholder images
│
├── components/                 # Reusable UI components
│   ├── common/                 # Button, Input, Modal, Badge, Spinner
│   ├── layout/                 # Navbar, Footer, AdminSidebar, Container
│   ├── feedback/               # Toast, Skeleton, EmptyState, ErrorBoundary
│   └── product/                # ProductCard, PriceTag, RatingStars, VariantSelector
│
├── features/                   # Domain features & custom React hooks
│   ├── auth/                   # LoginForm, RegisterForm, useAuth hook
│   ├── catalog/                # FilterSidebar, SearchBar, useProductSearch
│   ├── cart/                   # CartDrawer, CartItemRow, useCart hook
│   ├── checkout/               # AddressSelector, PaymentPicker, OrderSummary
│   ├── orders/                 # OrderTimeline, InvoiceView, OrderList
│   └── admin/                  # ProductTable, OrderStatusModal, StatCard
│
├── pages/                      # Page-level route views (React Router DOM)
│   ├── public/                 # HomePage, ShopPage, ProductDetailPage
│   ├── auth/                   # LoginPage, RegisterPage, ForgotPasswordPage
│   ├── customer/               # AccountPage, OrdersPage, CheckoutPage, WishlistPage
│   └── admin/                  # DashboardPage, AdminProductsPage, AdminOrdersPage
│
├── services/                   # HTTP client layer (Axios)
│   ├── api.ts                  # Axios instance configured with baseURL and auth cookies
│   ├── auth.service.ts
│   ├── product.service.ts
│   ├── cart.service.ts
│   └── order.service.ts
│
├── routes/                     # React Router route trees & route guards
│   ├── AppRoutes.tsx           # BrowserRouter and Route declarations
│   ├── ProtectedRoute.tsx      # Customer authentication guard
│   └── AdminRoute.tsx          # Admin role guard
│
├── store/                      # Client state management (Zustand or Context)
│   ├── useAuthStore.ts
│   └── useCartStore.ts
│
├── types/                      # Frontend UI types (re-exports shared DTOs)
├── utils/                      # Currency formatting, date helpers, slug utilities
├── App.tsx                     # Top-level providers and layout wrappers
└── main.tsx                    # Vite entry point mounting the React root DOM
```
