# 05 — Dockerization

## 🎯 What You'll Learn
- Building Docker images for frontend and backend
- Multi-stage builds and why they matter
- Docker Compose for local development
- Image optimization techniques

---

## Build the Backend Image

```bash
cd backend

# Build the image
docker build -t cloudpulse-backend:latest .

# Expected output:
# [1/2] FROM node:18-alpine AS builder
# [2/2] COPY package*.json ./
# ...
# => exporting to image
# => naming to docker.io/library/cloudpulse-backend:latest

# Check image size
docker images cloudpulse-backend
# REPOSITORY          TAG       SIZE
# cloudpulse-backend  latest    ~80MB  (Alpine!)

# Run the container
docker run -d -p 8080:8080 --name backend cloudpulse-backend:latest

# Test it
curl http://localhost:8080/api/health
# {"status":"healthy",...}

# View logs
docker logs backend

# Stop and remove
docker stop backend && docker rm backend
```

---

## Build the Frontend Image

```bash
cd frontend

# Build (this takes ~2 minutes for npm install + React build)
docker build -t cloudpulse-frontend:latest .

# Check size — should be tiny (~25MB because of nginx:alpine)
docker images cloudpulse-frontend
# REPOSITORY           TAG       SIZE
# cloudpulse-frontend  latest    ~25MB

# Run
docker run -d -p 3000:80 --name frontend cloudpulse-frontend:latest

# Test
curl http://localhost:3000
# Returns HTML of the React app
```

---

## Why Multi-Stage Builds?

```
WITHOUT multi-stage:
┌──────────────────────────┐
│ Node.js 18 (900MB)       │
│ + node_modules (200MB)   │
│ + source code (5MB)      │
│ + build tools            │
│ = ~1.1GB image 😱        │
└──────────────────────────┘

WITH multi-stage:
┌──────────────────────────┐
│ Stage 1: Node.js         │  ← Only used for building
│ npm install + npm build  │  ← Discarded after build
└──────────┬───────────────┘
           ↓ COPY build output only
┌──────────────────────────┐
│ Stage 2: nginx:alpine    │
│ + build output (5MB)     │
│ = ~25MB image 🎉         │  ← This is the final image
└──────────────────────────┘
```

> **💡 Impact:** Smaller images = faster pulls = faster deployments = less storage costs. In production, this matters when deploying to 100+ pods.

---

## Docker Compose (Local Development)

```bash
# From the project root
cd CloudPulse

# Start everything
docker-compose up --build

# This starts:
# - Backend    → http://localhost:8080
# - Frontend   → http://localhost:3000
# - Prometheus → http://localhost:9090
# - Grafana    → http://localhost:3001

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag images with your Docker Hub username
docker tag cloudpulse-backend:latest YOUR_USERNAME/cloudpulse-backend:latest
docker tag cloudpulse-frontend:latest YOUR_USERNAME/cloudpulse-frontend:latest

# Push to Docker Hub
docker push YOUR_USERNAME/cloudpulse-backend:latest
docker push YOUR_USERNAME/cloudpulse-frontend:latest

# Verify on https://hub.docker.com — your images should appear there
```

---

## Troubleshooting Docker

| Error | Cause | Fix |
|-------|-------|-----|
| `EACCES permission denied` | Not in docker group | `sudo usermod -aG docker $USER && newgrp docker` |
| `no space left on device` | Disk full | `docker system prune -a` |
| `port already in use` | Another container on same port | `docker ps` → stop the other container |
| Build fails at `npm ci` | No package-lock.json | Run `npm install` first to generate it |

---

## ✅ Checkpoint

- [ ] Backend image builds successfully
- [ ] Frontend image builds successfully
- [ ] `docker-compose up` starts all 4 services
- [ ] Images pushed to Docker Hub

**Next:** [06 — Kubernetes Deployment →](06-k8s-deployment.md)
