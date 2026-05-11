# ============================================================
# CloudPulse Frontend — Dockerfile
# ============================================================
# Two-stage build:
#   Stage 1: Node.js builds the React app (npm run build)
#   Stage 2: Nginx serves the static build files
# Final image is ~25MB (Nginx Alpine) instead of ~1GB (Node + src)
# ============================================================

# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (layer caching optimization)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install && npm cache clean --force

# Copy source code
COPY public/ ./public/
COPY src/ ./src/

# Set the API URL for production build
# In K8s with Ingress, the frontend is served from the same origin
# so we use a relative path (empty string = same origin)
ENV REACT_APP_API_URL=""

# Build the production bundle
RUN npm run build

# ============================================================

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the React build output to Nginx's serving directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/nginx-health || exit 1

# Start Nginx in foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]
