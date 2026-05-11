#!/bin/bash
# ============================================================
# CloudPulse — Deploy Script
# ============================================================
# Builds Docker images, pushes to Docker Hub, and deploys
# all Kubernetes manifests.
#
# Usage: ./scripts/deploy.sh <your-dockerhub-username>
# ============================================================

set -e

DOCKER_USER=${1:-"YOUR_DOCKERHUB_USERNAME"}

if [ "$DOCKER_USER" = "YOUR_DOCKERHUB_USERNAME" ]; then
    echo "❌ Error: Please provide your Docker Hub username"
    echo "Usage: ./scripts/deploy.sh <your-dockerhub-username>"
    exit 1
fi

echo "============================================"
echo "  CloudPulse — Deploying..."
echo "  Docker Hub user: $DOCKER_USER"
echo "============================================"
echo ""

# ----- 1. Build Docker Images -----
echo "🔨 [1/5] Building Docker images..."
docker build -t $DOCKER_USER/cloudpulse-backend:latest ./backend
docker build -t $DOCKER_USER/cloudpulse-frontend:latest ./frontend
echo "✅ Images built!"
echo ""

# ----- 2. Push to Docker Hub -----
echo "📤 [2/5] Pushing images to Docker Hub..."
docker push $DOCKER_USER/cloudpulse-backend:latest
docker push $DOCKER_USER/cloudpulse-frontend:latest
echo "✅ Images pushed!"
echo ""

# ----- 3. Update K8s manifests with Docker username -----
echo "📝 [3/5] Updating Kubernetes manifests..."
sed -i "s|YOUR_DOCKERHUB_USERNAME|${DOCKER_USER}|g" k8s/backend/deployment.yaml
sed -i "s|YOUR_DOCKERHUB_USERNAME|${DOCKER_USER}|g" k8s/frontend/deployment.yaml
echo "✅ Manifests updated!"
echo ""

# ----- 4. Apply Kubernetes Manifests -----
echo "☸️  [4/5] Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
echo "  → Namespace created"

kubectl apply -f k8s/backend/configmap.yaml
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml
echo "  → Backend deployed"

kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml
echo "  → Frontend deployed"

kubectl apply -f k8s/monitoring/prometheus-config.yaml
kubectl apply -f k8s/monitoring/prometheus-deployment.yaml
kubectl apply -f k8s/monitoring/prometheus-service.yaml
echo "  → Prometheus deployed"

kubectl apply -f k8s/monitoring/grafana-datasource.yaml
kubectl apply -f k8s/monitoring/grafana-deployment.yaml
kubectl apply -f k8s/monitoring/grafana-service.yaml
echo "  → Grafana deployed"

kubectl apply -f k8s/ingress/ingress.yaml
echo "  → Ingress configured"
echo ""

# ----- 5. Verify Deployment -----
echo "🔍 [5/5] Verifying deployment..."
echo ""
echo "Waiting for pods to be ready..."
sleep 10

kubectl get pods -n cloudpulse
echo ""
kubectl get services -n cloudpulse
echo ""
kubectl get ingress -n cloudpulse
echo ""

echo "============================================"
echo "  ✅ CloudPulse Deployed Successfully!"
echo ""
echo "  🌐 Frontend:    http://<EC2_IP>"
echo "  🔌 Backend API: http://<EC2_IP>/api/health"
echo "  📊 Prometheus:  http://<EC2_IP>:30090"
echo "  📈 Grafana:     http://<EC2_IP>:30030"
echo "     Login:       admin / cloudpulse123"
echo "============================================"
