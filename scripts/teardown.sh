#!/bin/bash
# ============================================================
# CloudPulse — Teardown Script
# ============================================================
# Removes all CloudPulse resources from Kubernetes.
# Usage: ./scripts/teardown.sh
# ============================================================

set -e

echo "============================================"
echo "  CloudPulse — Teardown"
echo "============================================"
echo ""
echo "⚠️  This will delete ALL CloudPulse resources!"
read -p "Are you sure? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "🗑️  Deleting CloudPulse resources..."

kubectl delete -f k8s/ingress/ --ignore-not-found
kubectl delete -f k8s/scaling/ --ignore-not-found
kubectl delete -f k8s/monitoring/ --ignore-not-found
kubectl delete -f k8s/frontend/ --ignore-not-found
kubectl delete -f k8s/backend/ --ignore-not-found
kubectl delete -f k8s/namespace.yaml --ignore-not-found

echo ""
echo "✅ All CloudPulse resources deleted!"
echo ""
