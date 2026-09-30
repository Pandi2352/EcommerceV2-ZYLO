# E-Commerce Platform — Project Context

## 1. Project Identification
- **Project Name**: ZYLO (Production-Grade E-Commerce Platform)
- **Repository Root**: `d:/mern/ecommerceV2`
- **Architecture Style**: Modular Monolith (NestJS Architecture: Modules ➔ Controllers ➔ Services ➔ Schemas/Models ➔ MongoDB)
- **Application Type**: Multi-tier Web Application (React Storefront + Admin Portal + NestJS REST API + Swagger)

---

## 2. Vision & Mission
To build a highly structured, scalable, type-safe, and resilient e-commerce platform using **React, TypeScript, Tailwind CSS, React Router DOM, Axios** on the frontend and **NestJS, TypeScript, MongoDB, Mongoose, Swagger** on the backend. The codebase is designed as an enterprise production blueprint demonstrating dependency injection, modular encapsulation, document database modeling, index optimization, role-based security, automated OpenAPI documentation, and end-to-end type safety.

---

## 3. Technology Pillars
### Active Stack (Core Project & MVP)
- **Frontend**:
  - React 19 (TypeScript)
  - Vite
  - Tailwind CSS v4
  - React Router DOM v7
  - Axios (with auth interceptors)
  - React Hook Form + Zod (or Class-Validator)
  - Lucide React (Icons)
- **Backend**:
  - NestJS 12 (TypeScript)
  - Node.js (v20+ LTS)
  - Swagger / OpenAPI (`@nestjs/swagger`)
  - Class-Validator & Class-Transformer for DTO validation
  - Passport.js & JWT (`@nestjs/passport`, `@nestjs/jwt`)
  - Bcryptjs for password hashing
- **Database & Persistence**:
  - MongoDB 7+ (local via MongoDB Compass, Atlas, or Docker)
  - Mongoose 9+ with `@nestjs/mongoose`
- **Security & Infrastructure**:
  - Helmet, CORS, `@nestjs/throttler` (Rate Limiting)
  - Cookie-parser for HttpOnly JWT cookies
  - Docker & Docker Compose (MongoDB, NestJS API, React Client)

### Future Expansion Pillars (Post-MVP)
- **Caching**: Redis (`@nestjs/cache-manager`)
- **Background Queues**: BullMQ (`@nestjs/bullmq`)
- **Real-time WebSockets**: NestJS WebSockets (`@nestjs/websockets`, Socket.io)
- **Object Storage**: AWS S3 / Cloudinary (abstracted via storage provider)
- **Search Engine**: PostgreSQL Full-Text Search (tsvector) evolving to Meilisearch
- **AI Integrations**: OpenAI / Gemini APIs with structured validation pipelines

---

## 4. User Personas
1. **Customer (Shopper)**:
   - Registers, authenticates, manages addresses, profile, orders, and reviews.
   - Discovers items through categories, keyword search, price/brand filters.
   - Manages cart and wishlist; completes checkout with COD or online payment.
2. **Admin (Store Operations & Fulfillment)**:
   - Manages products, categories, brands, variants, and stock replenishment.
   - Operates order fulfillment pipeline (`PENDING` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED`).
   - Manages customers, promotional coupons, reviews, and reviews analytics.
3. **Seller / Merchant (Phase 7 - Future)**:
   - Multi-vendor tenancy and vendor payout management.

---

## 5. Architectural Maturity Evolution
```
[Phase 1-4: Core MVP] ──► [Phase 5: Performance & Async] ──► [Phase 6-7: Business & AI] ──► [Phase 8: Enterprise Prod]
• NestJS Monolith         • Redis Caching                 • Multi-vendor             • Microservices / K8s (if needed)
• PostgreSQL Relational   • BullMQ Queue Workers          • AI Recommendations       • Distributed Tracing
• React + Tailwind Client • WebSockets Real-time Tracking • Automated Promotions     • Global CDN & NGINX SSL
• Swagger Documentation   • S3 Cloud Object Storage       • Semantic Search          • CI/CD Deployment Pipelines
```

---

## 6. Non-Negotiable Engineering Laws
1. **Anti-Feature-Creep Directive**: No AI agent or developer may introduce Redis, BullMQ, WebSockets, Kafka, or AI integrations until the Phase 1–4 Core MVP commerce loop is fully operational.
2. **Server as Single Source of Truth**: All commerce math (prices, discounts, stock, coupon validity, tax, shipping) is strictly computed on the NestJS backend.
3. **NestJS Architecture Purity**:
   - `Controllers` handle HTTP routing, request DTO validation, and Swagger annotations.
   - `Services` implement business logic, pricing math, and transactional workflows.
   - `Repositories / Entities` handle database interaction via PostgreSQL ORM.
   - No direct SQL queries inside controllers or React components.
4. **Interactive API Documentation**: All endpoints must be decorated with Swagger OpenAPI annotations (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`).
