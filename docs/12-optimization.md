# 12 — Optimization

## 🎯 Tips for Production Readiness

---

## Image Size Optimization

| Technique | Before | After |
|-----------|--------|-------|
| Use Alpine base | 900MB | 80MB |
| Multi-stage build | 1.1GB | 25MB |
| .dockerignore | +200MB | Clean |
| npm ci --production | +50MB dev deps | Removed |

```bash
# Check your image sizes
docker images | grep cloudpulse
# cloudpulse-frontend   latest   25MB  ← Nginx Alpine
# cloudpulse-backend    latest   80MB  ← Node Alpine
```

---

## Resource Tuning for t2.micro

Recommended limits for 1GB RAM + 1GB swap:

| Component | CPU Request | CPU Limit | Mem Request | Mem Limit |
|-----------|------------|-----------|-------------|-----------|
| Backend (x2) | 50m | 100m | 64Mi | 128Mi |
| Frontend (x2) | 25m | 50m | 32Mi | 64Mi |
| Prometheus | 100m | 200m | 128Mi | 256Mi |
| Grafana | 100m | 200m | 128Mi | 256Mi |
| **Total** | **450m** | **900m** | **576Mi** | **1152Mi** |

> With swap, this fits on t2.micro. Without swap, it WILL crash.

---

## Security Hardening

1. **Non-root containers** — Already done in our Dockerfiles
2. **Read-only filesystem** — Add `readOnlyRootFilesystem: true` in pod security context
3. **Network policies** — Restrict pod-to-pod communication
4. **Secrets management** — Use K8s Secrets instead of env vars for passwords
5. **Image scanning** — Use `docker scout` or Trivy to scan for vulnerabilities

```yaml
# Example: Security context in deployment
spec:
  containers:
    - name: backend
      securityContext:
        runAsNonRoot: true
        readOnlyRootFilesystem: true
        allowPrivilegeEscalation: false
```

---

## Performance Tips

1. **Enable gzip** in Nginx (already done in our nginx.conf)
2. **Set proper cache headers** for static assets
3. **Use connection pooling** for database connections (if added later)
4. **Implement rate limiting** with Express middleware
5. **Monitor with Prometheus alerts** for proactive response

---

**Next:** [13 — Interview Preparation →](13-interview-prep.md)
