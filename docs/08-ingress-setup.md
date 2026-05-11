# 08 — Ingress Setup

## 🎯 What You'll Learn
- What Ingress is and why you need it
- How k3s Traefik Ingress works
- Verifying routes
- Debugging ingress issues

---

## Why Ingress?

**Without Ingress (NodePort approach):**
```
http://EC2_IP:30001  →  Frontend
http://EC2_IP:30002  →  Backend
http://EC2_IP:30003  →  Grafana
```
Problem: Users must remember port numbers. Not professional.

**With Ingress:**
```
http://EC2_IP/          →  Frontend
http://EC2_IP/api       →  Backend
http://EC2_IP/grafana   →  Grafana
```
One port (80), clean URLs, professional.

---

## k3s + Traefik

k3s comes with **Traefik** Ingress Controller pre-installed. No extra setup needed!

```bash
# Verify Traefik is running
kubectl get pods -n kube-system | grep traefik
# traefik-xxx   1/1   Running   0   5m

# Check our ingress
kubectl get ingress -n cloudpulse
# NAME                 CLASS    HOSTS   ADDRESS        PORTS   AGE
# cloudpulse-ingress   <none>   *       172.31.x.x     80      2m

# Describe for details
kubectl describe ingress cloudpulse-ingress -n cloudpulse
```

---

## Test the Routes

```bash
# Frontend (should return HTML)
curl http://YOUR_EC2_IP/

# Backend API (should return JSON)
curl http://YOUR_EC2_IP/api/health

# Backend status
curl http://YOUR_EC2_IP/api/status
```

---

## Troubleshooting Ingress

| Problem | Check | Fix |
|---------|-------|-----|
| 404 Not Found | `kubectl describe ingress` | Verify path and service names match |
| 502 Bad Gateway | `kubectl get pods` | Backend pods may be crashing |
| Connection refused | Security Groups | Ensure port 80 is open in AWS |
| Traefik not running | `kubectl get pods -n kube-system` | Restart k3s: `sudo systemctl restart k3s` |

---

## ✅ Checkpoint

- [ ] `curl http://EC2_IP/` returns the React app
- [ ] `curl http://EC2_IP/api/health` returns JSON
- [ ] Ingress shows correct rules

**Next:** [09 — CI/CD Setup →](09-cicd-setup.md)
