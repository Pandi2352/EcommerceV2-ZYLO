# ==========================================
# Multi-Stage Dockerfile for NestJS API
# ==========================================

# Stage 1: Build & Compile
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY server/package*.json ./
RUN npm ci --legacy-peer-deps

# Copy backend source code & tsconfig
COPY server/ ./

# Compile TypeScript to JavaScript in /dist
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy compiled artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory for local file attachments with proper node user permissions
RUN mkdir -p /app/uploads && chown -R node:node /app

# Switch to unprivileged non-root user for security
USER node

# Healthcheck checking the NestJS /api/v1/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/v1/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

EXPOSE 5000

# Start production NestJS application
CMD ["node", "dist/main.js"]
