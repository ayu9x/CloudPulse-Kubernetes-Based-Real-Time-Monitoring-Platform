# ============================================================
# CloudPulse Backend — Dockerfile
# ============================================================
# Multi-stage build using Node.js 18 Alpine for minimal image size.
# Alpine Linux is ~5MB vs Ubuntu's ~70MB = faster pulls in K8s.
# ============================================================

# Stage 1: Build dependencies
FROM node:18-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files first (Docker layer caching optimization)
# If package.json hasn't changed, Docker reuses cached node_modules
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# ============================================================

# Stage 2: Production image
FROM node:18-alpine

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S cloudpulse -u 1001

WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY src/ ./src/
COPY package.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the API port
EXPOSE 8080

# Switch to non-root user
USER cloudpulse

# Health check — Kubernetes also does this, but Docker health checks
# are useful for docker-compose and standalone Docker usage
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start the application
CMD ["node", "src/server.js"]
