# 11 — Troubleshooting Guide

## 🎯 Common Issues & Solutions

---

## Docker Issues

### 1. `docker: command not found`
```bash
# Docker not installed
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2. `permission denied while trying to connect to Docker daemon`
```bash
sudo usermod -aG docker $USER
newgrp docker
# If that doesn't work, log out and back in
```

### 3. `no space left on device`
```bash
# Clean up unused images and containers
docker system prune -a -f
docker volume prune -f
# Check disk space
df -h
```

### 4. Docker build fails at `npm ci`
```bash
# Missing package-lock.json
cd backend  # or frontend
npm install  # Generates package-lock.json
# Then rebuild
docker build -t myimage .
```

---

## Kubernetes Pod Issues

### 5. Pod stuck in `CrashLoopBackOff`
```bash
# Check why the pod is crashing
kubectl logs <pod-name> -n cloudpulse
kubectl describe pod <pod-name> -n cloudpulse

# Common causes:
# - Application error (check logs)
# - Wrong image name (check deployment YAML)
# - Missing environment variables (check ConfigMap)
# - Port mismatch (containerPort must match app's PORT)
```

### 6. Pod stuck in `ImagePullBackOff`
```bash
# Check the exact error
kubectl describe pod <pod-name> -n cloudpulse | grep -A5 "Events"

# Common fixes:
# 1. Image name typo → fix in deployment YAML
# 2. Private image → create imagePullSecret
# 3. Image doesn't exist → push to Docker Hub first
docker push YOUR_USERNAME/cloudpulse-backend:latest
```

### 7. Pod shows `OOMKilled`
```bash
# Pod exceeded memory limit
# Fix: Increase memory limit in deployment YAML
resources:
  limits:
    memory: "256Mi"  # Increase from 128Mi

# Also ensure swap is enabled on EC2
free -h  # Should show swap
```

### 8. Pod stuck in `Pending`
```bash
# Check events
kubectl describe pod <pod-name> -n cloudpulse

# Common causes:
# - Insufficient resources → reduce requests/limits
# - No node available → check: kubectl get nodes
```

---

## k3s Issues

### 9. k3s won't start
```bash
# Check k3s status
sudo systemctl status k3s

# View k3s logs
sudo journalctl -u k3s -f

# Restart k3s
sudo systemctl restart k3s

# If still failing, reinstall
/usr/local/bin/k3s-uninstall.sh
curl -sfL https://get.k3s.io | sh -s - --docker --write-kubeconfig-mode 644
```

### 10. `kubectl: connection refused`
```bash
# Kubeconfig not set
export KUBECONFIG=~/.kube/config
# Or copy the config
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
```

---

## EC2 Networking Issues

### 11. Can't access from browser
```bash
# Check Security Group has the port open (AWS Console → EC2 → Security Groups)
# Ports needed: 80, 3000, 8080, 9090, 30000-32767

# Check if the service is actually listening
sudo netstat -tlnp | grep :80
# Or
sudo ss -tlnp | grep :80
```

### 12. SSH connection timeout
```bash
# Check:
# 1. EC2 instance is running
# 2. Security Group allows port 22 from your IP
# 3. Correct key file: ssh -i cloudpulse-key.pem ubuntu@IP
# 4. Your IP may have changed → update Security Group
```

---

## Monitoring Issues

### 13. Prometheus shows target as DOWN
```bash
# Check backend is running
kubectl get pods -n cloudpulse | grep backend

# Test metrics endpoint from inside cluster
kubectl exec -it <backend-pod> -n cloudpulse -- wget -qO- http://localhost:8080/metrics

# Check Prometheus config
kubectl describe configmap prometheus-config -n cloudpulse
```

### 14. Grafana can't connect to Prometheus
```bash
# Verify Prometheus service exists
kubectl get svc prometheus -n cloudpulse

# Test from Grafana pod
kubectl exec -it <grafana-pod> -n cloudpulse -- wget -qO- http://prometheus:9090/api/v1/status/config

# The datasource URL should be: http://prometheus.cloudpulse.svc:9090
```

### 15. Grafana login not working
```bash
# Default credentials: admin / cloudpulse123
# If changed and forgotten, reset:
kubectl exec -it <grafana-pod> -n cloudpulse -- grafana-cli admin reset-admin-password cloudpulse123
```

---

## Ingress Issues

### 16. Ingress returns 404
```bash
# Check ingress configuration
kubectl describe ingress cloudpulse-ingress -n cloudpulse

# Verify Traefik is running
kubectl get pods -n kube-system | grep traefik

# Check if services are correctly named
kubectl get svc -n cloudpulse
```

### 17. Ingress returns 502 Bad Gateway
```bash
# Backend pods are crashing or not ready
kubectl get pods -n cloudpulse
kubectl logs <backend-pod> -n cloudpulse

# Check readiness probe
kubectl describe pod <backend-pod> -n cloudpulse | grep -A5 "Readiness"
```

---

## General Debugging Commands

```bash
# View all events (errors show here)
kubectl get events -n cloudpulse --sort-by='.lastTimestamp'

# Get pod details
kubectl describe pod <name> -n cloudpulse

# View real-time logs
kubectl logs -f <pod-name> -n cloudpulse

# Open shell in pod
kubectl exec -it <pod-name> -n cloudpulse -- /bin/sh

# Check resource usage
kubectl top pods -n cloudpulse
kubectl top nodes

# Nuclear option: delete and recreate everything
kubectl delete namespace cloudpulse
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/monitoring/
kubectl apply -f k8s/ingress/
```

---

**Next:** [12 — Optimization →](12-optimization.md)
