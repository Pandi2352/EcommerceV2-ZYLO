# ZYLO Project Documentation Index

Welcome to the **ZYLO** engineering documentation. This directory serves as the centralized **Single Source of Truth** for developers and AI agents (**Antigravity**, **Codex**, **Claude**).

### Technology Baseline
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, React Router DOM v7, Axios, Lucide React
- **Backend**: NestJS 12, TypeScript, Swagger / OpenAPI (`/api/docs`), Class-Validator, Passport JWT
- **Database**: MongoDB 7+ with `@nestjs/mongoose` and `mongoose` (Compass / Atlas compatible)
- **Infrastructure**: Docker Compose, Multi-stage Dockerfiles

---

## Documentation Directory

| Document | Responsibility |
|---|---|
| [00-project-context.md](file:///d:/mern/ecommerceV2/docs/00-project-context.md) | High-level project identity, goals, architecture pillars, and non-negotiables. |
| [01-product-requirements.md](file:///d:/mern/ecommerceV2/docs/01-product-requirements.md) | Full PRD covering customer storefront and admin portal capabilities. |
| [02-feature-roadmap.md](file:///d:/mern/ecommerceV2/docs/02-feature-roadmap.md) | 9-phase development lifecycle roadmap from Day 1 to Production. |
| [03-mvp-scope.md](file:///d:/mern/ecommerceV2/docs/03-mvp-scope.md) | The anti-feature-creep matrix: Must Have, Should Have, and Banned for MVP. |
| [04-architecture.md](file:///d:/mern/ecommerceV2/docs/04-architecture.md) | NestJS modular architecture, dependency injection, and MongoDB sequence flows. |
| [05-tech-stack.md](file:///d:/mern/ecommerceV2/docs/05-tech-stack.md) | Approved technologies, versions, library choices, and prohibited tools. |
| [06-project-structure.md](file:///d:/mern/ecommerceV2/docs/06-project-structure.md) | Monorepo layout, NestJS module anatomy, and client feature folders. |
| [07-database-design.md](file:///d:/mern/ecommerceV2/docs/07-database-design.md) | Complete MongoDB document schemas, collections, indexes, and ERD. |
| [08-api-specification.md](file:///d:/mern/ecommerceV2/docs/08-api-specification.md) | Swagger OpenAPI specs (`/api/docs`), DTOs, query filters, and endpoint contracts. |
| [09-frontend-guidelines.md](file:///d:/mern/ecommerceV2/docs/09-frontend-guidelines.md) | React, TypeScript, Tailwind, React Router DOM, Axios, and 4-state UI rules. |
| [10-backend-guidelines.md](file:///d:/mern/ecommerceV2/docs/10-backend-guidelines.md) | NestJS controllers, services, DTOs, Mongoose sessions, and Swagger rules. |
| [11-auth-rbac.md](file:///d:/mern/ecommerceV2/docs/11-auth-rbac.md) | NestJS Passport JWT, HttpOnly cookies, RolesGuard, and RBAC matrix. |
| [12-business-rules.md](file:///d:/mern/ecommerceV2/docs/12-business-rules.md) | Inviolable commerce logic: server pricing, atomic stock updates, state machine. |
| [13-ui-ux-guidelines.md](file:///d:/mern/ecommerceV2/docs/13-ui-ux-guidelines.md) | Design tokens, color system, typography, cards, and responsive rules. |
| [14-security-guidelines.md](file:///d:/mern/ecommerceV2/docs/14-security-guidelines.md) | NoSQL injection defense, NestJS Throttler, Helmet, and secure cookies. |
| [15-testing-strategy.md](file:///d:/mern/ecommerceV2/docs/15-testing-strategy.md) | Testing pyramid (NestJS TestModule, Vitest, Supertest, Playwright). |
| [16-devops.md](file:///d:/mern/ecommerceV2/docs/16-devops.md) | MongoDB 7 Docker Compose, NestJS Dockerfile, env template, and health check. |
| [17-ai-features.md](file:///d:/mern/ecommerceV2/docs/17-ai-features.md) | Post-MVP AI features with strict deterministic business guardrails. |
| [18-development-phases.md](file:///d:/mern/ecommerceV2/docs/18-development-phases.md) | Daily execution plan starting with Day 1 foundation setup. |
| [19-task-board.md](file:///d:/mern/ecommerceV2/docs/19-task-board.md) | Active sprint backlog, task acceptance criteria, and progress tracker. |
| [20-decision-log.md](file:///d:/mern/ecommerceV2/docs/20-decision-log.md) | Architecture Decision Records (ADRs for NestJS, MongoDB, Swagger, React). |
| [21-ai-agent-rules.md](file:///d:/mern/ecommerceV2/docs/21-ai-agent-rules.md) | Operating guidelines and division of labor for Antigravity, Codex, and Claude. |

---

## Starting Blueprint
To start Day 1 foundation setup, refer directly to [18-development-phases.md](file:///d:/mern/ecommerceV2/docs/18-development-phases.md#1-tomorrows-starting-scope-day-1-execution-blueprint) and [19-task-board.md](file:///d:/mern/ecommerceV2/docs/19-task-board.md#1-sprint-1-core-foundation--infrastructure-day-1-focus).
