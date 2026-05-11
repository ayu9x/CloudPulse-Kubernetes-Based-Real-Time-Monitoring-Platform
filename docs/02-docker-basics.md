# 02 — Docker Basics

## 🎯 What You'll Learn
- What Docker is and why it matters
- Core concepts: Images, Containers, Layers
- Installing Docker on Ubuntu
- Essential Docker commands
- Dockerfile best practices

---

## What is Docker?

**Problem:** "It works on my machine!" — The most common DevOps nightmare.

**Solution:** Docker packages your application AND its dependencies into a **container** — a lightweight, standalone, executable package.

Think of it like shipping containers in real life:
- **Without Docker:** You ship furniture loose on a truck. It breaks, gets mixed up, doesn't fit.
- **With Docker:** Everything goes in a standard container. Fits on any truck, ship, or train. Always arrives intact.

### Key Concepts

| Concept | Real-World Analogy | Explanation |
|---------|-------------------|-------------|
| **Image** | Blueprint/Recipe | A read-only template with your app code + dependencies |
| **Container** | Running Instance | A live, running instance of an image |
| **Dockerfile** | Recipe Instructions | Step-by-step instructions to build an image |
| **Registry** | App Store | Where images are stored (Docker Hub, ECR) |
| **Layer** | Cake Layers | Each Dockerfile instruction creates a cached layer |
| **Volume** | External Hard Drive | Persistent storage that survives container restarts |

> **🏢 Real-World Usage:** Netflix, Spotify, PayPal, and nearly every tech company uses Docker. It's the foundation of modern DevOps. On your resume, Docker experience is mandatory for DevOps roles.

---

## Install Docker on EC2

```bash
# The official Docker installation script (works on Ubuntu/Debian)
curl -fsSL https://get.docker.com | sudo sh

# Add your user to the docker group (so you don't need 'sudo' every time)
sudo usermod -aG docker $USER

# Apply group changes (or log out and back in)
newgrp docker

# Verify installation
docker --version
# Expected: Docker version 24.x.x

# Test with hello-world
docker run hello-world
# Expected: "Hello from Docker!" message
```

**What each command does:**
- `curl -fsSL https://get.docker.com | sh` — Downloads and runs Docker's official install script
- `usermod -aG docker $USER` — Adds you to the `docker` group so you can run Docker without `sudo`
- `docker run hello-world` — Pulls the `hello-world` image from Docker Hub and runs it

---

## Essential Docker Commands

```bash
# === IMAGE COMMANDS ===
docker images                       # List all local images
docker pull nginx:alpine            # Download an image
docker build -t myapp:v1 .          # Build image from Dockerfile
docker rmi myapp:v1                 # Remove an image

# === CONTAINER COMMANDS ===
docker ps                           # List running containers
docker ps -a                        # List ALL containers (including stopped)
docker run -d -p 8080:80 nginx      # Run container in background, map port
docker stop <container_id>          # Stop a container
docker rm <container_id>            # Remove a container
docker logs <container_id>          # View container logs
docker exec -it <id> /bin/sh        # Open a shell inside a container

# === CLEANUP ===
docker system prune -a              # Remove everything unused (saves disk space!)
```

### Port Mapping Explained
```
docker run -p 8080:80 nginx
              ↑     ↑
         HOST:CONTAINER
```
- **8080** = Port on YOUR machine (EC2)
- **80** = Port INSIDE the container
- Traffic to EC2:8080 → forwarded to Container:80

---

## Docker Networking

When containers need to talk to each other:

```bash
# Create a network
docker network create mynetwork

# Run containers on the same network
docker run -d --name backend --network mynetwork myapp-backend
docker run -d --name frontend --network mynetwork myapp-frontend

# Now frontend can reach backend using the container NAME as hostname:
# http://backend:8080
```

> **💡 In Kubernetes**, networking is handled automatically. Every pod gets an IP, and Services provide stable DNS names. You don't need to manage Docker networks manually.

---

## Dockerfile Best Practices

### 1. Use Multi-Stage Builds
```dockerfile
# Stage 1: Build (large, has dev tools)
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (tiny, only what's needed)
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
```
Result: **~25MB** instead of **~1GB**

### 2. Order Instructions by Change Frequency
```dockerfile
# Rarely changes → cached
COPY package*.json ./
RUN npm ci

# Changes often → not cached (but layers above ARE cached)
COPY src/ ./src/
```

### 3. Use .dockerignore
```
node_modules
.git
*.md
```
This prevents copying unnecessary files into the image.

### 4. Run as Non-Root
```dockerfile
RUN adduser -S appuser
USER appuser
```
Security best practice — if the container is compromised, the attacker has limited permissions.

---

## ✅ Checkpoint

- [ ] Docker is installed (`docker --version`)
- [ ] `docker run hello-world` works
- [ ] You understand Images vs Containers
- [ ] You know the basic Docker commands

**Next:** [03 — Kubernetes Basics →](03-kubernetes-basics.md)
