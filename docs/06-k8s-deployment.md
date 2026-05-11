# 06 — Kubernetes Deployment

## 🎯 What You'll Learn
- Applying Kubernetes manifests
- Understanding each YAML field
- Verifying deployments
- Rolling updates and rollbacks

---

## Deploy CloudPulse to k3s

### Step 1: Update Image Names
Before deploying, update the deployment files with your Docker Hub username:

```bash
# Replace placeholder with your actual Docker Hub username
sed -i 's/YOUR_DOCKERHUB_USERNAME/your-actual-username/g' k8s/backend/deployment.yaml
sed -i 's/YOUR_DOCKERHUB_USERNAME/your-actual-username/g' k8s/frontend/deployment.yaml
```

### Step 2: Apply Manifests (In Order)

```bash
# 1. Create the namespace first (it's the container for everything else)
kubectl apply -f k8s/namespace.yaml
# Output: namespace/cloudpulse created

# 2. Deploy backend (ConfigMap → Deployment → Service)
kubectl apply -f k8s/backend/
# Output:
# configmap/backend-config created
# deployment.apps/cloudpulse-backend created
# service/cloudpulse-backend created

# 3. Deploy frontend
kubectl apply -f k8s/frontend/
# Output:
# deployment.apps/cloudpulse-frontend created
# service/cloudpulse-frontend created

# 4. Deploy monitoring
kubectl apply -f k8s/monitoring/
# Output: prometheus and grafana resources created

# 5. Apply ingress rules
kubectl apply -f k8s/ingress/
# Output: ingress.networking.k8s.io/cloudpulse-ingress created
```

### Step 3: Verify Everything

```bash
# Check all pods are Running
kubectl get pods -n cloudpulse
# NAME                                  READY   STATUS    RESTARTS   AGE
# cloudpulse-backend-xxx-yyy            1/1     Running   0          30s
# cloudpulse-backend-xxx-zzz            1/1     Running   0          30s
# cloudpulse-frontend-xxx-aaa           1/1     Running   0          25s
# cloudpulse-frontend-xxx-bbb           1/1     Running   0          25s
# prometheus-xxx-ccc                    1/1     Running   0          20s
# grafana-xxx-ddd                       1/1     Running   0          20s

# Check services
kubectl get services -n cloudpulse
# NAME                  TYPE        CLUSTER-IP      PORT(S)
# cloudpulse-backend    ClusterIP   10.43.x.x       8080/TCP
# cloudpulse-frontend   ClusterIP   10.43.x.x       80/TCP
# prometheus            NodePort    10.43.x.x       9090:30090/TCP
# grafana               NodePort    10.43.x.x       3000:30030/TCP

# Check ingress
kubectl get ingress -n cloudpulse
# NAME                 HOSTS   ADDRESS        PORTS   AGE
# cloudpulse-ingress   *       172.31.x.x     80      15s

# Test backend from inside the cluster
kubectl run test --rm -it --image=busybox -n cloudpulse -- wget -qO- http://cloudpulse-backend:8080/api/health
```

---

## Understanding the YAML

Every K8s YAML has 4 required fields:

```yaml
apiVersion: apps/v1       # Which API version to use
kind: Deployment           # What type of resource
metadata:                  # Name, namespace, labels
  name: my-app
  namespace: cloudpulse
spec:                      # The desired state (what you want)
  replicas: 2
  ...
```

### Resource Limits Explained
```yaml
resources:
  requests:                # Minimum guaranteed resources
    memory: "64Mi"         # Pod needs at least 64MB
    cpu: "50m"             # 50 millicores (5% of 1 CPU)
  limits:                  # Maximum allowed resources
    memory: "128Mi"        # Pod is killed (OOMKilled) if it exceeds this
    cpu: "100m"            # Pod is throttled if it exceeds this
```

> **💡 Why limits matter on Free Tier:** Without limits, one runaway pod could consume all 1GB RAM and crash everything. Limits prevent this.

---

## Rolling Updates

When you update your image, K8s does a **rolling update** — it gradually replaces old pods with new ones:

```bash
# Update the image (triggers rolling update)
kubectl set image deployment/cloudpulse-backend \
  backend=your-username/cloudpulse-backend:v2 \
  -n cloudpulse

# Watch the rollout
kubectl rollout status deployment/cloudpulse-backend -n cloudpulse
# Waiting for deployment "cloudpulse-backend" rollout to finish:
#   1 out of 2 new replicas have been updated...
#   2 out of 2 new replicas have been updated...
#   deployment "cloudpulse-backend" successfully rolled out

# Rollback if something goes wrong
kubectl rollout undo deployment/cloudpulse-backend -n cloudpulse
```

---

## ✅ Checkpoint

- [ ] All pods are Running (`kubectl get pods -n cloudpulse`)
- [ ] Services are created with correct ports
- [ ] Ingress is configured
- [ ] You can access the frontend via EC2 IP

**Next:** [07 — Monitoring Setup →](07-monitoring-setup.md)
