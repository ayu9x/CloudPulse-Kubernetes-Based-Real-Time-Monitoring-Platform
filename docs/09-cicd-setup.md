# 09 — CI/CD Setup

## 🎯 What You'll Learn
- CI/CD concepts and why they matter
- Setting up GitHub Actions
- Configuring secrets
- Pipeline walkthrough

---

## What is CI/CD?

**CI (Continuous Integration):** Automatically build and test code on every push.
**CD (Continuous Deployment):** Automatically deploy tested code to production.

```
Developer pushes code
       ↓
GitHub Actions triggers
       ↓
┌─── CI Phase ───┐
│ Install deps   │
│ Run tests      │
│ Build app      │
└───────┬────────┘
        ↓
┌─── CD Phase ───┐
│ Build Docker   │
│ Push to Hub    │
│ SSH to EC2     │
│ kubectl apply  │
└───────┬────────┘
        ↓
App is deployed! 🚀
```

> **🏢 Industry Standard:** Every tech company uses CI/CD. Manual deployments are error-prone and slow. CI/CD = faster releases, fewer bugs, happier teams.

---

## Setup GitHub Secrets

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

| Secret Name | Value | Where to get it |
|-------------|-------|-----------------|
| `DOCKER_USERNAME` | Your Docker Hub username | hub.docker.com |
| `DOCKER_PASSWORD` | Your Docker Hub password or access token | hub.docker.com → Security |
| `EC2_HOST` | Your EC2 public IP | AWS Console → EC2 |
| `EC2_SSH_KEY` | Contents of your .pem file | Copy the entire file content |

```bash
# To get the SSH key content:
cat cloudpulse-key.pem
# Copy EVERYTHING including -----BEGIN RSA PRIVATE KEY----- and -----END RSA PRIVATE KEY-----
```

---

## Pipeline Explanation

The pipeline (`.github/workflows/ci-cd.yaml`) has 3 jobs:

### Job 1: Build & Test
- Triggers on every push and PR to `main`
- Installs Node.js dependencies
- Builds the frontend React app

### Job 2: Docker Build & Push
- Only runs on push to `main` (not PRs)
- Builds Docker images for frontend and backend
- Tags with commit SHA for traceability
- Pushes to Docker Hub

### Job 3: Deploy to K8s
- SSHes into your EC2 instance
- Pulls latest code
- Updates K8s manifests with correct image names
- Applies all manifests with kubectl
- Restarts deployments to pull new images
- Waits for rollout to complete

---

## Trigger the Pipeline

```bash
# Make a change
echo "# Updated" >> README.md

# Commit and push
git add .
git commit -m "trigger ci/cd pipeline"
git push origin main

# Go to GitHub → Actions tab → Watch the pipeline run!
```

---

## ✅ Checkpoint

- [ ] GitHub secrets are configured
- [ ] Pipeline triggers on push to main
- [ ] Docker images are pushed to Docker Hub
- [ ] EC2 deployment succeeds

**Next:** [10 — Scaling →](10-scaling.md)
