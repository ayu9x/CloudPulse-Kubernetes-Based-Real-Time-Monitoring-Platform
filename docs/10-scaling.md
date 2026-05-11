# 10 — Scaling

## 🎯 What You'll Learn
- Manual scaling with kubectl
- Horizontal Pod Autoscaler (HPA)
- Load testing to trigger auto-scaling

---

## Manual Scaling

```bash
# Scale backend to 3 replicas
kubectl scale deployment cloudpulse-backend --replicas=3 -n cloudpulse

# Watch pods being created
kubectl get pods -n cloudpulse -w
# cloudpulse-backend-xxx-new   0/1   ContainerCreating   0   2s
# cloudpulse-backend-xxx-new   1/1   Running             0   5s

# Scale down to 1
kubectl scale deployment cloudpulse-backend --replicas=1 -n cloudpulse
```

---

## Horizontal Pod Autoscaler (HPA)

HPA automatically adjusts pod count based on CPU/memory usage.

```bash
# Apply the HPA
kubectl apply -f k8s/scaling/hpa.yaml

# Check HPA status
kubectl get hpa -n cloudpulse
# NAME          REFERENCE                      TARGETS   MINPODS   MAXPODS   REPLICAS
# backend-hpa   Deployment/cloudpulse-backend   15%/70%   1         4         1

# Watch HPA in action
kubectl get hpa -n cloudpulse -w
```

### How it works:
- CPU < 70% → Keep current replicas (or scale down)
- CPU > 70% → Add 1 pod (up to max 4)
- Cooldown: 30s before scaling up, 120s before scaling down

---

## Load Testing

Generate load to trigger auto-scaling:

```bash
# Simple load test with a loop
for i in $(seq 1 1000); do
  curl -s http://localhost/api/status > /dev/null &
done

# Or use 'hey' tool (install: apt install hey)
# hey -n 1000 -c 50 http://YOUR_EC2_IP/api/status

# Watch pods scale up
kubectl get hpa -n cloudpulse -w
```

> **⚠️ Note:** On t2.micro, be careful with heavy load testing. The instance only has 1 vCPU and HPA needs the metrics-server (included with k3s) to read CPU usage.

---

## ✅ Checkpoint

- [ ] Can manually scale deployments
- [ ] HPA is applied and showing targets
- [ ] Understand auto-scaling concepts

**Next:** [11 — Troubleshooting →](11-troubleshooting.md)
