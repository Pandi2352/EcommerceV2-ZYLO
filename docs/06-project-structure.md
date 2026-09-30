# Project Directory Structure & Code Organization

## 1. Top-Level Monorepo Structure

```
ecommerce-platform/
│
├── apps/
│   ├── storefront/             # Customer site (React 19 + Vite + Tailwind v4 + React Router 7)
│   │   ├── src/                #   dev http://localhost:5176, prod e.g. zylo.com
│   │   ├── index.html
│   │   ├── package.json        #   @zylo/storefront
│   │   ├── tsconfig*.json      #   `@shared/*` path alias
│   │   └── vite.config.ts      #   resolve.alias @shared, publicDir -> packages/shared/public
│   └── admin/                  # Staff console (same stack)
│       └── ...                 #   dev http://127.0.0.1:5175, prod e.g. admin.zylo.com
│
├── packages/
│   └── shared/                 # @zylo/shared — consumed as TypeScript source, no build step
│       ├── public/             # Brand assets (favicon, logo, loader) served by both apps
│       ├── src/
│       └── package.json
│
├── server/                     # Backend Application (NestJS + TypeScript); NOT a workspace —
│   │                           #   install with `npm install --workspaces=false` inside server/
│   ├── src/                    # NestJS source code
│   ├── test/                   # E2E test suites
│   ├── nest-cli.json           # NestJS CLI configuration
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                       # Project Documentation & Architecture Guides
│   ├── 00-project-context.md
│   ├── ...
│   └── 21-ai-agent-rules.md
│
├── docker/                     # Container configurations
│   ├── server.Dockerfile
│   ├── web.Dockerfile          # Builds either web app: --build-arg APP=storefront|admin
│   └── nginx.conf              # SPA fallback + /api proxy (both web apps)
│
├── package.json                # npm workspaces ["apps/*", "packages/*"] + root scripts
├── package-lock.json           # Single lockfile for the workspaces (one hoisted React copy)
├── docker-compose.yml          # Orchestrates mongodb, server, storefront, admin
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

## 3. Frontend Architecture (`apps/` + `packages/shared/`)

The customer storefront and the admin console are two separate Vite apps. Code used by both lives in `packages/shared` and is imported through the `@shared/*` alias (Vite `resolve.alias` + tsconfig `paths`), e.g. `import { Button } from '@shared/ui'`. There is no build step for the shared package; each app compiles it as part of its own source.

### 3.1 Shared Package (`packages/shared/src/`)

```
packages/shared/src/
├── ui/                         # Button, InputField, PasswordField, Checkbox, SelectField, Badge,
│                               #   SectionCard, DataTable, Pagination, Alert, PageLoader,
│                               #   ZyloLogo, CornerDots
├── hooks/                      # useForm, useAsyncAction, useApiQuery
├── api/
│   ├── client.ts               # Axios instance, unwrap, getApiError, onSessionExpired
│   └── auth.service.ts
├── auth/
│   ├── PortalContext.tsx       # Each app provides its portal, routes and allowed roles
│   ├── AuthContext.tsx         # Session state; a role outside the portal counts as signed out
│   ├── ProtectedRoute.tsx
│   ├── PublicOnlyRoute.tsx
│   ├── components/             # AuthCard, LoginForm, MfaChallengeForm, ChangePasswordForm,
│   │                           #   TwoFactorSettings, AccountSecuritySections, ...
│   └── pages/                  # MfaVerifyPage, ForgotPasswordPage, ResetPasswordPage
├── pages/                      # NotFoundPage, ComingSoonPage
├── types/
├── constants/                  # roles, errorCodes, storageKeys
└── utils/                      # validators, passwordPolicy, redirect, format
```

### 3.2 Storefront (`apps/storefront/src/`)

```
apps/storefront/src/
├── assets/
├── components/layout/          # CustomerLayout, Navbar, TopBar, CategoryRail
├── config/portal.ts            # PortalProvider config (admits CUSTOMER)
├── features/auth/              # AccountMenu, EmailVerificationBanner, AuthSplitLayout,
│                               #   SocialAuthButtons (Google), hooks
├── pages/
│   ├── auth/                   # VerifyEmailPage
│   ├── account/                # AccountSecurityPage (/account/security)
│   └── customer/               # HomePage, LoginPage, RegisterPage
├── routes/                     # AppRoutes
├── App.tsx                     # <PortalProvider config={...}><AuthProvider> ... routes
└── main.tsx
```

### 3.3 Admin Console (`apps/admin/src/`)

Admin routes have no `/admin` prefix: `/`, `/login`, `/login/verify`, `/change-password`, `/settings`, `/audit-logs`, `/products`, ...

```
apps/admin/src/
├── components/layout/          # AdminLayout, AdminSidebar, AdminHeader
├── config/portal.ts            # PortalProvider config (admits SUPPORT_AGENT, ADMIN, SUPER_ADMIN)
├── features/audit/             # Audit log table columns and filters
├── pages/                      # AdminLoginPage, AdminDashboardPage, AdminChangePasswordPage,
│                               #   AdminSecurityPage (/settings), AdminAuditLogsPage
├── routes/                     # AppRoutes, routePaths, plannedRoutes
├── services/audit.service.ts
├── App.tsx                     # <PortalProvider config={...}><AuthProvider> ... routes
└── main.tsx
```

"View storefront" links in the admin use `VITE_STOREFRONT_URL`.

### 3.4 Where Does New Code Go?

| Used by | Location |
| --- | --- |
| Storefront only | `apps/storefront/` |
| Admin only | `apps/admin/` |
| Both apps | `packages/shared/` |

`packages/shared` must never import from an app. If shared code needs app-specific behaviour, pass it in (props or `PortalContext`) instead of importing it.
