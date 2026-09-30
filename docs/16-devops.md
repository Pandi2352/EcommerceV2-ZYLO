# DevOps, Containerization & Deployment

## 1. Local Development Containerization

The project uses Docker Compose to orchestrate **MongoDB 7**, the **NestJS Backend API**, and the two React web apps: the **storefront** and the **admin console**. Both web apps are built from the same `docker/web.Dockerfile`.

### 1.1 `docker-compose.yml`
```yaml
services:
  mongodb:
    image: mongo:7.0
    container_name: zylo-mongodb
    restart: unless-stopped
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db
    networks:
      - zylo-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  server:
    build:
      context: .
      dockerfile: docker/server.Dockerfile
    container_name: zylo-server
    restart: unless-stopped
    ports:
      - '5000:5000'
    environment:
      NODE_ENV: production
      PORT: 5000
      API_PREFIX: /api/v1
      MONGO_URI: ${MONGO_URI:-mongodb://mongodb:27017/zylo}
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET:-zylo_super_secret_access_jwt_key_2026}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:-zylo_super_secret_refresh_jwt_key_2026}
      CLIENT_URL: ${CLIENT_URL:-http://localhost:5176}
      ADMIN_URL: ${ADMIN_URL:-http://127.0.0.1:5175}
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - zylo-network

  # Customer storefront (e.g. zylo.com)
  storefront:
    build:
      context: .
      dockerfile: docker/web.Dockerfile
      args:
        APP: storefront
    container_name: zylo-storefront
    restart: unless-stopped
    ports:
      - '5176:80'
    depends_on:
      server:
        condition: service_healthy
    networks:
      - zylo-network

  # Admin console (e.g. admin.zylo.com). Open it at http://127.0.0.1:5175 locally so
  # its cookies stay separate from the storefront's (cookies ignore ports).
  admin:
    build:
      context: .
      dockerfile: docker/web.Dockerfile
      args:
        APP: admin
        VITE_STOREFRONT_URL: ${CLIENT_URL:-http://localhost:5176}
    container_name: zylo-admin
    restart: unless-stopped
    ports:
      - '5175:80'
    depends_on:
      server:
        condition: service_healthy
    networks:
      - zylo-network

volumes:
  mongo-data:
    driver: local

networks:
  zylo-network:
    driver: bridge
```

---

## 2. Multi-Stage Dockerfile Specifications

### 2.1 Backend Dockerfile (`docker/server.Dockerfile`)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/main.js"]
```

### 2.2 Web Dockerfile (`docker/web.Dockerfile`)
One Dockerfile builds either web app, selected with `--build-arg APP=storefront|admin`. It copies the root `package.json` + `package-lock.json`, `packages/shared` and `apps/$APP`, installs only that workspace, builds it, and serves `dist` with NGINX. `docker/nginx.conf` (shared by both apps) handles the SPA fallback and proxies `/api` to the `server` container.

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
ARG APP=storefront
ARG VITE_STOREFRONT_URL
ENV VITE_STOREFRONT_URL=${VITE_STOREFRONT_URL}
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/${APP}/package.json apps/${APP}/
RUN npm ci --workspace @zylo/${APP} --include-workspace-root --legacy-peer-deps
COPY packages/shared/ packages/shared/
COPY apps/${APP}/ apps/${APP}/
RUN npm run build --workspace @zylo/${APP}

# Stage 2: NGINX Static Server
FROM nginx:alpine AS runner
ARG APP=storefront
COPY --from=builder /repo/apps/${APP}/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build an image by hand:
```bash
docker build -f docker/web.Dockerfile --build-arg APP=admin -t zylo-admin .
```

---

## 3. Environment Variables Standard (`.env.example`)

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# MongoDB Database
MONGO_URI=mongodb://127.0.0.1:27017/zylo

# Security & JWT Tokens
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# App origins (CORS + email links)
# CLIENT_URL = storefront (customer email links, Google OAuth)
# ADMIN_URL  = admin console (staff password-reset links); 127.0.0.1 in dev for a separate cookie jar
CLIENT_URL=http://localhost:5176
ADMIN_URL=http://127.0.0.1:5175

# Payment Gateway (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 4. Health Check Endpoint
- Route: `GET /api/v1/health`
- Verifies: NestJS process uptime, memory usage, and MongoDB database connectivity.
- Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-30T10:25:00.000Z",
  "uptime": 340.2,
  "database": "connected"
}
```
