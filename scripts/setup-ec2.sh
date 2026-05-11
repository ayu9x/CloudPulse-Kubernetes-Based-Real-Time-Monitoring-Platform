#!/bin/bash
# ============================================================
# CloudPulse — EC2 Setup Script
# ============================================================
# Run this script on a fresh Ubuntu EC2 instance to install
# everything needed for CloudPulse: Docker, k3s, kubectl.
#
# Usage: chmod +x setup-ec2.sh && sudo ./setup-ec2.sh
# ============================================================

set -e  # Exit on any error

echo "============================================"
echo "  CloudPulse — EC2 Setup Script"
echo "============================================"
echo ""

# ----- 1. System Update -----
echo "📦 [1/6] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
echo "✅ System updated!"
echo ""

# ----- 2. Create Swap File (Critical for 1GB RAM) -----
echo "💾 [2/6] Creating 1GB swap file..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap file created and enabled!"
else
    echo "ℹ️  Swap file already exists, skipping."
fi
echo ""

# ----- 3. Install Docker -----
echo "🐳 [3/6] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker $USER
    sudo systemctl enable docker
    sudo systemctl start docker
    echo "✅ Docker installed!"
else
    echo "ℹ️  Docker already installed."
fi
echo ""

# ----- 4. Install k3s (Lightweight Kubernetes) -----
echo "☸️  [4/6] Installing k3s..."
if ! command -v k3s &> /dev/null; then
    curl -sfL https://get.k3s.io | sh -s - --docker --write-kubeconfig-mode 644
    echo "✅ k3s installed!"
else
    echo "ℹ️  k3s already installed."
fi
echo ""

# ----- 5. Configure kubectl -----
echo "🔧 [5/6] Configuring kubectl..."
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
export KUBECONFIG=~/.kube/config
echo 'export KUBECONFIG=~/.kube/config' >> ~/.bashrc
echo "✅ kubectl configured!"
echo ""

# ----- 6. Install helpful tools -----
echo "🛠️  [6/6] Installing helper tools..."
sudo apt-get install -y jq htop curl wget git
echo "✅ Helper tools installed!"
echo ""

# ----- Verification -----
echo "============================================"
echo "  🎉 Setup Complete! Verification:"
echo "============================================"
echo ""
echo "Docker version:"
docker --version
echo ""
echo "k3s version:"
k3s --version
echo ""
echo "kubectl version:"
kubectl version --short 2>/dev/null || kubectl version --client
echo ""
echo "Kubernetes nodes:"
kubectl get nodes
echo ""
echo "Swap status:"
free -h | grep -i swap
echo ""
echo "============================================"
echo "  ✅ EC2 is ready for CloudPulse!"
echo "  Next: Run ./scripts/deploy.sh"
echo "============================================"
