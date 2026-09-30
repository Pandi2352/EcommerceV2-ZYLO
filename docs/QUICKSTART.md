# Developer Quickstart & Onboarding Guide

This document is your step-by-step guide to setting up your local development environment on Day 1.

---

## 1. System Prerequisites
Before running commands, ensure your machine has:
- **Node.js**: `v20.x` or higher (`node -v`)
- **npm**: `v9.x` or higher (`npm -v`)
- **MongoDB**: Local MongoDB instance (tested with **MongoDB Compass** at `mongodb://127.0.0.1:27017/zylo`), Docker, or MongoDB Atlas
- **Git**

---

## 2. Environment Variables Configuration
A default `.env` is configured in the root:

```env
# Application
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# MongoDB Connection String
# Local (MongoDB Compass): mongodb://127.0.0.1:27017/zylo
# Docker Compose: mongodb://mongodb:27017/zylo
# MongoDB Atlas (Production): mongodb+srv://<user>:<password>@cluster0.mongodb.net/zylo?retryWrites=true&w=majority
MONGO_URI=mongodb://127.0.0.1:27017/zylo

# Authentication & Security
JWT_ACCESS_SECRET=zylo_super_secret_access_jwt_key_2026_dev
JWT_REFRESH_SECRET=zylo_super_secret_refresh_jwt_key_2026_dev
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# App origins (CORS + email links): CLIENT_URL = storefront, ADMIN_URL = admin console
CLIENT_URL=http://localhost:5176
ADMIN_URL=http://127.0.0.1:5175

# Uploads
UPLOAD_DIR=./uploads
```

---

## 3. Database Initialization (MongoDB)

### Option A: Local MongoDB & MongoDB Compass (Recommended for Local Dev)
1. Ensure your local MongoDB service is active.
2. Open **MongoDB Compass** and connect to:
   ```
   mongodb://127.0.0.1:27017
   ```
3. Your database will be named `zylo`.

### Option B: Docker Container
```bash
# Launch MongoDB 7 container in background
docker compose up -d mongodb

# Verify container is running and healthy
docker ps
```

---

## 4. Install Dependencies

```bash
# From the repo root: installs apps/storefront, apps/admin and packages/shared (npm workspaces)
npm install

# The server is installed on its own (it is not a workspace)
cd server
npm install --workspaces=false
cd ..
```

---

## 5. Backend Launch (NestJS)

```bash
# From the repo root
npm run dev:server
```

### Verification Checks:
1. Open [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health) ➔ Should return status `200` with `{ status: "ok" }`.
2. Open [http://localhost:5000/api/docs](http://localhost:5000/api/docs) ➔ Interactive Swagger UI should render with all API tags.

---

## 6. Frontend Launch (React + Vite)

Run each app in its own terminal from the repo root:

```bash
npm run dev:storefront   # customer site  -> http://localhost:5176
npm run dev:admin        # staff console  -> http://127.0.0.1:5175
```

The admin runs on `127.0.0.1` instead of `localhost` on purpose: cookies ignore ports, so `localhost:5176` and `127.0.0.1:5175` would share session cookies. The different host gives the admin its own cookie jar, the same isolation separate domains give in production.

### Verification Checks:
1. Open [http://localhost:5176](http://localhost:5176) and confirm the storefront navigation bar and hero layout are visible.
2. Open [http://127.0.0.1:5175](http://127.0.0.1:5175) and confirm the admin sign-in page renders.

Other root scripts: `npm run build:web` (both apps), `build:storefront`, `build:admin`, `build:server`, `lint:web`, `seed`.

---

## 7. Daily Task Execution Reference
Follow the active task backlog in [line-items.md](../line-items.md) and [19-task-board.md](./19-task-board.md).
