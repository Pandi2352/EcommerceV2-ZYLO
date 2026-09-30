# ==========================================
# Multi-Stage Dockerfile for the React + Vite web apps
# Build either app with:  --build-arg APP=storefront | admin
# ==========================================

# Stage 1: Build & Compile
FROM node:20-alpine AS builder

ARG APP=storefront
ARG VITE_STOREFRONT_URL

ENV VITE_STOREFRONT_URL=${VITE_STOREFRONT_URL}

WORKDIR /repo

# Install workspace dependencies (root lockfile covers apps/* and packages/*)
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/${APP}/package.json apps/${APP}/
RUN npm ci --workspace @zylo/${APP} --include-workspace-root --legacy-peer-deps

# Copy the shared package and the selected app, then build it
COPY packages/shared/ packages/shared/
COPY apps/${APP}/ apps/${APP}/
RUN npm run build --workspace @zylo/${APP}

# Stage 2: Production NGINX Web Server
FROM nginx:alpine AS runner

ARG APP=storefront

# Remove default NGINX welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy production static build artifacts
COPY --from=builder /repo/apps/${APP}/dist /usr/share/nginx/html

# SPA routing + /api reverse proxy (same config for both apps)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck for NGINX web server
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
