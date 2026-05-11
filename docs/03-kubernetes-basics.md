# 03 — Kubernetes Basics

## 🎯 What You'll Learn
- What Kubernetes is and why it's needed
- Core objects: Pods, Deployments, Services, Ingress
- Installing k3s on EC2
- Essential kubectl commands

---

## What is Kubernetes (K8s)?

**Problem:** Docker runs containers on ONE machine. What happens when you have hundreds of containers across dozens of servers?

**Solution:** Kubernetes **orchestrates** containers — it decides WHERE to run them, HOW MANY to run, and WHAT to do when they crash.

### Real-World Analogy
Think of Kubernetes as an **airport control tower**:
- **Containers** = Airplanes
- **Nodes** = Runways
- **Kubernetes** = Air traffic controller (decides which plane lands where, reroutes if a runway is blocked)

> **🏢 Industry Impact:** Kubernetes is used by Google, Amazon, Microsoft, and 96% of organizations. It's THE most in-demand DevOps skill.

---

## K8s Architecture

```
┌─────────────────────────────────────────────┐
│              Control Plane                    │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ API      │ │ Scheduler│ │ Controller  │  │
│  │ Server   │ │          │ │ Manager     │  │
│  └─────────┘ └──────────┘ └─────────────┘  │
│  ┌─────────────────────────────────────┐    │
│  │             etcd (database)          │    │
│  └─────────────────────────────────────┘    │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────↓────────────────────────┐
│              Worker Node                     │
│  ┌─────────┐ ┌───────────┐ ┌────────────┐  │
│  │ kubelet  │ │ kube-proxy│ │ Container  │  │
│  │          │ │           │ │ Runtime    │  │
│  └─────────┘ └───────────┘ └────────────┘  │
│                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ Pod  │ │ Pod  │ │ Pod  │ │ Pod  │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
└──────────────────────────────────────────────┘
```

| Component | Role |
|-----------|------|
| **API Server** | Front door — all commands go through here |
| **Scheduler** | Decides which node runs a new pod |
| **Controller Manager** | Ensures desired state matches actual state |
| **etcd** | Database storing all cluster state |
| **kubelet** | Agent on each node, manages pods |
| **kube-proxy** | Handles networking on each node |

---

## Core K8s Objects

### 1. Pod 🫛
The smallest deployable unit. Contains one or more containers.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
    - name: app
      image: nginx
      ports:
        - containerPort: 80
```

### 2. Deployment 📦
Manages pods — ensures N replicas are always running.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3          # Always keep 3 pods running
  selector:
    matchLabels:
      app: my-app
  template:
    spec:
      containers:
        - name: app
          image: nginx
```

### 3. Service 🔌
Provides a stable IP/DNS for a set of pods.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  type: ClusterIP       # Internal access only
  selector:
    app: my-app
  ports:
    - port: 80
```

**Service Types:**
| Type | Access | Use Case |
|------|--------|----------|
| ClusterIP | Inside cluster only | Backend APIs |
| NodePort | External via NodeIP:Port | Development/testing |
| LoadBalancer | External via cloud LB | Production (costs $$$) |

### 4. Ingress 🌐
Routes external HTTP traffic to services based on URL path.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
spec:
  rules:
    - http:
        paths:
          - path: /api
            backend:
              service:
                name: backend
          - path: /
            backend:
              service:
                name: frontend
```

---

## Why k3s (Not Minikube)?

| Feature | Minikube | k3s |
|---------|----------|-----|
| RAM needed | 2GB+ | 512MB |
| Disk | 20GB+ | 200MB binary |
| Production-like | No (VM-based) | Yes (real K8s) |
| Built-in Ingress | No | Yes (Traefik) |
| t2.micro compatible | ❌ No | ✅ Yes |

**k3s** is a certified Kubernetes distribution that's lightweight enough for our 1GB RAM EC2 instance.

---

## Install k3s on EC2

```bash
# Install k3s with Docker as container runtime
curl -sfL https://get.k3s.io | sh -s - --docker --write-kubeconfig-mode 644

# Wait 30 seconds for k3s to start, then verify
sleep 30

# Configure kubectl
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
export KUBECONFIG=~/.kube/config
echo 'export KUBECONFIG=~/.kube/config' >> ~/.bashrc

# Verify the cluster is running
kubectl get nodes
# Expected:
# NAME          STATUS   ROLES                  AGE   VERSION
# ip-172-31-X   Ready    control-plane,master   30s   v1.28.x+k3s1

# Check system pods
kubectl get pods -A
# Expected: traefik, coredns, metrics-server all Running
```

---

## Essential kubectl Commands

```bash
# === VIEWING RESOURCES ===
kubectl get pods                     # List pods in default namespace
kubectl get pods -n cloudpulse       # List pods in 'cloudpulse' namespace
kubectl get pods -A                  # List pods in ALL namespaces
kubectl get deployments              # List deployments
kubectl get services                 # List services
kubectl get all -n cloudpulse        # List everything in a namespace

# === DETAILED INFO ===
kubectl describe pod <pod-name>      # Detailed pod info (events, errors)
kubectl logs <pod-name>              # View pod logs
kubectl logs <pod-name> -f           # Stream logs (like tail -f)

# === CREATING/UPDATING ===
kubectl apply -f deployment.yaml     # Create/update from YAML file
kubectl apply -f k8s/                # Apply all YAML files in a directory

# === DEBUGGING ===
kubectl exec -it <pod> -- /bin/sh    # Open shell inside pod
kubectl get events -n cloudpulse     # View cluster events (errors show here)

# === SCALING ===
kubectl scale deployment myapp --replicas=5  # Scale to 5 pods

# === DELETING ===
kubectl delete -f deployment.yaml    # Delete resources from YAML
kubectl delete pod <pod-name>        # Delete a specific pod
```

---

## ✅ Checkpoint

- [ ] k3s is installed and running
- [ ] `kubectl get nodes` shows Ready status
- [ ] You understand Pods, Deployments, Services, Ingress
- [ ] You can run basic kubectl commands

**Next:** [04 — App Development →](04-app-development.md)
