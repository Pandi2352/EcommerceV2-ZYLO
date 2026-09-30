# ZYLO — Production E-Commerce Platform

A modular, production-ready e-commerce platform built with **React**, **TypeScript**, **Tailwind CSS**, **React Router DOM**, and **Axios** on the frontend, and **NestJS**, **TypeScript**, **MongoDB**, **Mongoose**, and **Swagger** on the backend.

---

## 🚀 Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, React Router DOM v7, Axios, Lucide React
- **Backend**: NestJS 12, TypeScript, Swagger / OpenAPI (`@nestjs/swagger`), Class-Validator, Passport.js JWT
- **Database & Persistence**: MongoDB 7+ with `@nestjs/mongoose` and `mongoose` (Compass / Atlas compatible)
- **Infrastructure**: Docker Compose (`mongo:7.0`), Multi-stage Dockerfiles

---

## 📁 Repository Structure

```
zylo-platform/
│
├── client/                     # Frontend (React + TS + Tailwind + Vite)
├── server/                     # Backend (NestJS + TypeScript REST API)
├── shared/                     # Shared DTOs, Enums, and TypeScript types
├── docker/                     # Dockerfiles & NGINX configurations
├── docs/                       # Architecture, PRD, and Engineering Documentation
├── .ai/                        # Guidance and context pointer for AI agents
├── line-items.md               # 23-module actionable development checklist
├── version-control.ts          # Centralized version control for FE & BE packages
├── docker-compose.yml          # Local container orchestrator (MongoDB, Server, Client)
├── .env.example                # Environment variables template
└── README.md                   # Repository overview & setup guide
```

---

## 📚 Project Documentation & Single Source of Truth

All system designs, database schemas, and AI agent instructions are centrally documented in the [`docs/`](./docs) directory:

- 📋 [**Checklist of All Line Items**](./line-items.md) — 23-module feature-by-feature checklist
- 📖 [**Documentation Master Index**](./docs/README.md) — Directory of all specifications
- 🎯 [**Product Requirements (PRD)**](./docs/01-product-requirements.md) — Full customer & admin requirements
- 📐 [**System Architecture**](./docs/04-architecture.md) — NestJS modular design & sequence flows
- 🗄️ [**Database Design & Schemas**](./docs/07-database-design.md) — MongoDB collections, indexes, and Mongoose schemas
- 🔌 [**API Specification & Swagger**](./docs/08-api-specification.md) — REST contracts & DTO specs
- ⚖️ [**Business Rules**](./docs/12-business-rules.md) — Authoritative commerce, pricing, and stock rules
- 🤖 [**AI Agent Rules**](./docs/21-ai-agent-rules.md) — Collaboration protocols for Codex, Claude, and Antigravity
- ⚡ [**Developer Quickstart Guide**](./docs/QUICKSTART.md) — Day 1 local environment setup

---

## ⚡ Quickstart (Day 1 Starting Guide)

### 1. Prerequisites
- **Node.js**: v20+ LTS
- **npm**: v9+
- **MongoDB**: Local MongoDB instance (connectable via MongoDB Compass at `mongodb://127.0.0.1:27017/zylo`) or MongoDB Atlas or Docker

### 2. Database Connection
- Set your `MONGO_URI` in `.env`:
  ```bash
  # Local MongoDB (Compass)
  MONGO_URI=mongodb://127.0.0.1:27017/zylo

  # Or start MongoDB container via Docker Compose
  docker compose up -d mongodb
  ```

### 3. Backend Setup (NestJS)
```bash
cd server
npm install
npm run start:dev
```
- Interactive Swagger API Documentation: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- API Health Endpoint: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

### 4. Frontend Setup (React + Vite)
```bash
cd client
npm install
npm run dev
```
- Storefront UI: [http://localhost:5173](http://localhost:5173)

---

## 🔒 Security Standards
- Dual JWT tokens stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
- Strict NoSQL injection mitigation via Mongoose schemas & Class-Validator sanitization.
- DTO validation pipe with strict payload whitelisting.
- Rate limiting via `@nestjs/throttler` on public and authentication routes.
- Rate limiting via `@nestjs/throttler` on public and authentication routes.
