# Architecture Decision Log (ADRs)

## Record Format
Each Architecture Decision Record (ADR) outlines the Context, Decision, Rationale, and Consequences of significant technical choices.

---

## ADR-001: Adoption of NestJS & TypeScript for Backend
- **Status**: Accepted
- **Context**: The backend needs an enterprise architecture that supports modular scalability, clear dependency injection, standardized request lifecycles (guards, pipes, interceptors), and maintainable domain separation.
- **Decision**: Standardize on **NestJS 10+** with strict TypeScript.
- **Consequences**:
  - Provides a structured framework out of the box (modules, controllers, providers).
  - Built-in dependency injection simplifies unit testing and service decoupling.

---

## ADR-002: Adoption of MongoDB & Mongoose for Persistence
- **Status**: Accepted
- **Context**: The platform requires a high-throughput, flexible document database that integrates natively with NestJS (`@nestjs/mongoose`), supports easy local inspection via **MongoDB Compass**, and provides seamless scaling to cloud **MongoDB Atlas**.
- **Decision**: Standardize on **MongoDB 7+** with **Mongoose 9+** (`@nestjs/mongoose`).
- **Consequences**:
  - Flexible document schemas with `@Prop()` validation and subdocument embedding (e.g. addresses, cart items, order items).
  - Simple local developer experience with MongoDB Compass (`mongodb://127.0.0.1:27017/zylo`) and instant cloud deployment via `MONGO_URI`.
  - Atomicity achieved via MongoDB atomic operations (`findOneAndUpdate`, `$inc`) and multi-document session transactions.

---

## ADR-003: Automated API Documentation via Swagger (OpenAPI)
- **Status**: Accepted
- **Context**: Multiple developers and AI agents need an up-to-date, interactive, executable contract for all REST endpoints without maintaining manual documentation that drifts.
- **Decision**: Standardize on `@nestjs/swagger` with DTO decorators (`@ApiProperty()`) mounted at `/api/docs`.
- **Consequences**:
  - Interactive UI for live endpoint testing.
  - Can export `openapi.json` for automated client code generation.

---

## ADR-004: Server-Side Single Source of Truth for Commerce
- **Status**: Accepted
- **Context**: Allowing client applications to compute order totals or submit item prices exposes the platform to price tampering fraud.
- **Decision**: The NestJS backend calculates all subtotals, tax, shipping, and coupon discounts. Frontend sends only product IDs, quantities, and addresses.
- **Consequences**:
  - Completely prevents price manipulation attacks.
  - Requires cart API calls to re-verify prices against active catalog records.

---

## ADR-005: Dual-Token JWT in HttpOnly Cookies with Passport.js
- **Status**: Accepted
- **Context**: Storing JWT tokens in browser `localStorage` or `sessionStorage` exposes sessions to Cross-Site Scripting (XSS) extraction.
- **Decision**: Issue access tokens (15 min) and refresh tokens (7 days) exclusively in `HttpOnly`, `SameSite=Lax`, `Secure` cookies, verified by NestJS Passport JWT strategies.
- **Consequences**:
  - Shields tokens from JavaScript access.
  - Requires CORS configuration to permit credentials across client and server origins.

---

## ADR-006: React Router DOM v7 and Axios for Client
- **Status**: Accepted
- **Context**: The client application needs clean client-side routing with nested layouts and robust HTTP communication.
- **Decision**: Standardize on **React Router DOM v7+** for declarative routing and **Axios** with response interceptors for silent token refresh.
- **Consequences**:
  - Consistent layout routing and route guards (`ProtectedRoute`, `AdminRoute`).
  - Seamless handling of expired tokens without disruptive user logouts.

---

## ADR-007: Separate Storefront and Admin Apps in One Monorepo
- **Status**: Accepted
- **Context**: The single `client/` app shipped the customer storefront and the staff console in one bundle. Every customer downloaded admin code, both portals shared one origin and session cookie jar, and the admin could not be hardened or deployed on its own.
- **Decision**: Split the frontend into `apps/storefront` (customer site) and `apps/admin` (staff console), with code used by both in `packages/shared` (`@zylo/shared`, consumed as TypeScript source via the `@shared/*` alias, no build step). The repo root uses npm workspaces (`apps/*`, `packages/*`); the NestJS `server/` stays a standalone install. Each app wraps `<PortalProvider config={...}><AuthProvider>`, and a session whose role does not belong to the app is treated as signed out (storefront admits `CUSTOMER`; admin admits `SUPPORT_AGENT`, `ADMIN`, `SUPER_ADMIN`). Admin routes drop the `/admin` prefix. Both apps are built by `docker/web.Dockerfile` (`--build-arg APP=storefront|admin`).
- **Consequences**:
  - Customers no longer download admin code: the storefront bundle contains no admin strings and shrank from 427 KB to 404 KB.
  - The admin can live on its own domain (e.g. `admin.zylo.com`) with its own session and stricter hardening (IP allowlist/VPN, CSP). In development it runs on `127.0.0.1:5175` so its cookies stay separate from the storefront on `localhost:5176`.
  - The two apps deploy independently, and the storefront is free to adopt SSR later without affecting the admin.
  - The server needs two origins: `CLIENT_URL` (storefront; customer email links, Google OAuth) and `ADMIN_URL` (admin; staff password-reset links).
  - `packages/shared` must never import from an app; code is placed by who uses it (storefront only, admin only, or both).
