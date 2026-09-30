# ==========================================
# Multi-Stage Dockerfile for React + Vite Frontend
# ==========================================

# Stage 1: Build & Compile
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for frontend environment variables
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME="ZYLO"

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

# Copy dependency manifests and install
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps

# Copy client source code & configurations
COPY client/ ./

# Compile production static bundle into /app/dist
RUN npm run build

# Stage 2: Production NGINX Web Server
FROM nginx:alpine AS runner

# Remove default NGINX welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy production static build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom NGINX configuration for React SPA routing & API reverse proxy
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck for NGINX web server
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
