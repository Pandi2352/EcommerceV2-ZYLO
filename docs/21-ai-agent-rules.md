# AI Agent Engineering Rules & Collaboration Protocol

## 1. Multi-Agent Division of Responsibilities

When collaborating with **Codex**, **Claude**, and **Antigravity**, each agent must operate within its primary domain to avoid conflicts:

```
                         docs/ & Swagger /api/docs
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       ▼                             ▼                             ▼
     Codex                         Claude                      Antigravity
(NestJS & MongoDB)         (Architecture & Review)         (React & Visuals)
- NestJS Modules & Services - Code & PR Review             - React Components
- Mongoose Schemas & DTOs   - Threat Modeling              - Tailwind CSS Styling
- Swagger API Decorators    - Document Schema Audit        - React Router DOM Routes
- Controllers & Guards      - Edge Case Identification     - Axios Client & Forms
- Backend Unit Tests        - Documentation Updates        - Browser Tests
```

---

## 2. Universal Agent Directives (All AI Agents Must Comply)

1. **NestJS Architecture Compliance**:
   - Every new domain feature MUST be organized as a NestJS Module with its own Controller, Service, Schemas, and DTOs.
   - Always inject dependencies via constructor injection. Never instantiate services using `new Service()`.
2. **Mandatory Swagger Documentation**:
   - Every controller MUST be decorated with `@ApiTags()`.
   - Every endpoint method MUST have `@ApiOperation()` and relevant `@ApiResponse()`.
   - Every DTO property MUST have `@ApiProperty()` or `@ApiPropertyOptional()`.
3. **Strict NoSQL Security & Indexing**:
   - Never pass raw, unvalidated query objects directly into Mongoose filters. Always sanitize and validate inputs using DTOs with `class-validator` to eliminate NoSQL injection risks.
   - Define proper indexes on frequently queried fields (`slug`, `category`, `email`, `orderNumber`).
4. **Never Invent Requirements**:
   - Confine changes to the active task. Do not install unrequested dependencies or introduce unnecessary abstractions.
5. **No Giant Files**:
   - Keep components and services modular (< 200 lines). Break complex logic into sub-services or helper functions.
6. **Zero TypeScript Errors**:
   - Never use `any` to bypass compiler errors. Utilize explicit interfaces or shared DTO types.

---

## 3. Strict "DO NOT" List for AI Agents

- **DO NOT** execute database queries inside NestJS controllers or React components.
- **DO NOT** accept prices, discounts, or order totals from the frontend; calculate them in NestJS services.
- **DO NOT** hardcode secrets or database credentials; load them via `@nestjs/config` from `.env`.
- **DO NOT** store JWT tokens in browser `localStorage` or `sessionStorage`.
- **DO NOT** omit Swagger decorators on newly created API endpoints.

---

## 4. Pre-Completion Verification Checklist

Before reporting a task as completed to the user, the agent MUST verify:

- [ ] `npm run build --prefix server` and `npm run build --prefix client` compile with 0 errors.
- [ ] Endpoints are registered in Swagger and visible at `/api/docs`.
- [ ] All inputs are strictly validated via DTOs with `class-validator`.
- [ ] Database mutations use PostgreSQL transactions where financial or inventory consistency is required.
- [ ] UI states account for all 4 states: Loading, Error, Empty, and Success.
- [ ] Relevant documentation or task status in `docs/19-task-board.md` has been updated.
