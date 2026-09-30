# Technology Stack & Tooling Standards

## 1. Primary Technology Stack

### 1.1 Frontend (Storefront & Admin)
| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Runtime & Library** | React + TypeScript | React 19, TS 6+ | Declarative component UI, enterprise type safety |
| **Build Tool** | Vite | 8+ | Instant HMR, lightning-fast build pipeline |
| **Styling** | Tailwind CSS | v4 (`@tailwindcss/vite`) | CSS-first styling, zero config, lightning fast compilation |
| **Routing** | React Router DOM | v7 | Client-side routing, nested layouts, protected route guards |
| **HTTP Client** | Axios | 1.20+ | Interceptors for auto-refreshing JWTs and unified error extraction |
| **Icons** | Lucide React | Latest | Clean, lightweight, consistent SVG icon set |

### 1.2 Backend (API & Business Logic)
| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Framework** | NestJS | 12+ | Enterprise-grade modular framework, native Dependency Injection, TypeScript-first |
| **Language & Runtime** | TypeScript + Node.js | TS 6+, Node 20 LTS | Strong static typing, modern ECMAScript features |
| **API Documentation** | Swagger / OpenAPI | `@nestjs/swagger` 12+ | Auto-generated interactive API docs, schemas, and live test console at `/api/docs` |
| **DTO Validation** | class-validator & class-transformer | Latest | Declarative decorator-based DTO validation with automatic error formatting |
| **Authentication** | Passport.js & JWT | `@nestjs/jwt`, `@nestjs/passport` | Robust authentication strategies and reusable route guards (`JwtAuthGuard`) |
| **Password Hashing**| bcryptjs | Latest | Industry standard salted key derivation |
| **Security & Utilities** | Helmet, Throttler, Cookie-Parser | Latest | Security headers, rate limiting, and HttpOnly cookie management |

### 1.3 Database & Persistence
| Layer | Technology | Version | Usage |
|---|---|---|---|
| **Document Database**| MongoDB | 7+ | Flexible document model, indexing, high write performance, local Compass & Atlas cloud support |
| **ODM / Modeling** | Mongoose | 9+ (`@nestjs/mongoose`) | Schema validation, lifecycle hooks, document typing, populate queries |

### 1.4 Containerization
| Tool | Image | Role |
|---|---|---|
| **Docker Compose** | Modern Compose | Local orchestrator for MongoDB, NestJS, and React |
| **Database Container** | `mongo:7.0` | Lightweight, isolated local MongoDB document database |

---

## 2. Centralized Version Control (`version-control.ts`)
- All dependency versions across frontend (`apps/storefront/package.json`, `apps/admin/package.json`) and backend (`server/package.json`) are centrally governed by `version-control.ts` at the project root.
- Running `npm run sync:versions` automatically validates and synchronizes package versions to ensure zero dependency drift.

---

## 3. Shared Workspace Standards (`shared/`)
- TypeScript interfaces, DTO definitions, and domain enums (`OrderStatus`, `UserRole`, `PaymentStatus`).
- Zero heavy dependencies; ensures direct type reusability across React client and NestJS backend.
