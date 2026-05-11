# 01 — AWS Setup Guide

## 🎯 What You'll Learn
- Create an AWS account (Free Tier)
- Launch an EC2 instance
- Configure Security Groups
- Connect via SSH
- Create a swap file for k3s

---

## 📋 Prerequisites
- A credit/debit card (AWS requires one, but Free Tier = $0)
- An email address
- PuTTY (Windows) or Terminal (Mac/Linux)

---

## Step 1: Create an AWS Account

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click **"Create an AWS Account"**
3. Enter email, password, and account name
4. Select **"Personal"** account type
5. Enter payment information (won't be charged for Free Tier)
6. Complete phone verification
7. Select the **"Basic Support — Free"** plan

> **💡 Why AWS?** AWS is the #1 cloud provider (33% market share). Learning AWS is essential for any DevOps career. EC2 Free Tier gives you 750 hours/month of a t2.micro instance for 12 months — that's enough to run 24/7 for free.

---

## Step 2: Launch an EC2 Instance

### 2a. Navigate to EC2
1. Sign in to the [AWS Console](https://console.aws.amazon.com)
2. Search for **"EC2"** in the top search bar
3. Click **"Launch Instance"**

### 2b. Configure the Instance

| Setting | Value | Why |
|---------|-------|-----|
| **Name** | `CloudPulse-Server` | Easy identification |
| **AMI** | Ubuntu Server 22.04 LTS (Free tier eligible) | Industry standard Linux distro |
| **Instance type** | t2.micro | Free Tier: 1 vCPU, 1GB RAM |
| **Key pair** | Create new → `cloudpulse-key` → Download .pem | For SSH access |
| **Storage** | 20 GB gp3 (increase from 8GB default) | Need space for Docker images |

> **⚡ Why t2.micro?** It's the only Free Tier eligible instance type. It has 1 vCPU and 1 GB RAM. This is tight for Kubernetes, which is why we use k3s (lightweight) instead of full Kubernetes (minikube), and add a swap file.

### 2c. Key Pair
- Click **"Create new key pair"**
- Name: `cloudpulse-key`
- Type: RSA
- Format: `.pem` (Linux/Mac) or `.ppk` (Windows/PuTTY)
- Click **"Create key pair"** — the file downloads automatically
- **⚠️ Save this file safely! You cannot download it again.**

---

## Step 3: Configure Security Groups

Security Groups are like a firewall for your EC2 instance. They control which traffic can reach your server.

### Create a new Security Group

Click **"Edit"** next to Network settings, then **"Create security group"**.

Add these **Inbound Rules**:

| Type | Port | Source | Why |
|------|------|--------|-----|
| SSH | 22 | My IP | Remote terminal access |
| HTTP | 80 | Anywhere (0.0.0.0/0) | Frontend via Ingress |
| Custom TCP | 3000 | Anywhere | Frontend (development) |
| Custom TCP | 8080 | Anywhere | Backend API |
| Custom TCP | 9090 | Anywhere | Prometheus UI |
| Custom TCP | 30000-32767 | Anywhere | Kubernetes NodePort range |

> **🔒 Security Note:** In production, you'd restrict these to specific IPs. For learning, "Anywhere" is fine. The NodePort range (30000-32767) is needed because K8s exposes services on random ports in this range.

### Why Each Port Matters:
- **Port 22 (SSH):** You need this to connect to your server terminal
- **Port 80 (HTTP):** The Ingress controller listens here for web traffic
- **Port 3000:** React dev server (if running without Docker)
- **Port 8080:** Express.js backend API
- **Port 9090:** Prometheus web UI for querying metrics
- **Port 30000-32767:** Kubernetes allocates NodePorts in this range (Grafana uses 30030, Prometheus uses 30090)

---

## Step 4: Launch & Connect via SSH

### 4a. Launch the Instance
1. Review all settings
2. Click **"Launch Instance"**
3. Wait 1-2 minutes for it to start
4. Go to **Instances** → Find your instance
5. Copy the **Public IPv4 address** (e.g., `54.123.45.67`)

### 4b. Connect via SSH

**Linux/Mac:**
```bash
# Set correct permissions on the key file
chmod 400 cloudpulse-key.pem

# Connect to your EC2 instance
ssh -i cloudpulse-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

**Windows (PowerShell):**
```powershell
ssh -i cloudpulse-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

**Expected output:**
```
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-1049-aws x86_64)
ubuntu@ip-172-31-XX-XX:~$
```

> **💡 Concept:** SSH (Secure Shell) creates an encrypted tunnel between your computer and the EC2 instance. The `.pem` file is your private key — anyone with this file can access your server, so keep it safe!

### 4c. Verify the Instance
```bash
# Check system info
uname -a
# Expected: Linux ip-172-31-XX-XX 5.15.0-1049-aws ... x86_64

# Check memory (should show ~1GB)
free -h
# Expected: Mem: 978Mi

# Check disk space
df -h /
# Expected: ~20GB available

# Check CPU
nproc
# Expected: 1
```

---

## Step 5: Create Swap File (CRITICAL)

> **⚠️ This step is essential!** With only 1GB RAM, the K8s cluster and all pods will exceed memory without swap. Your pods WILL crash with `OOMKilled` errors if you skip this.

```bash
# Create a 1GB swap file
sudo fallocate -l 1G /swapfile

# Set correct permissions (only root can read/write)
sudo chmod 600 /swapfile

# Format as swap space
sudo mkswap /swapfile

# Enable the swap
sudo swapon /swapfile

# Make it permanent (survives reboot)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap is active
free -h
```

**Expected output after swap:**
```
              total        used        free      shared  buff/cache   available
Mem:          978Mi       150Mi       450Mi       1.0Mi       377Mi       678Mi
Swap:         1.0Gi          0B       1.0Gi
```

> **💡 What is Swap?** Swap is disk space used as "virtual RAM". When physical RAM is full, Linux moves less-used data to swap. It's slower than RAM but prevents crashes. Think of it as overflow parking for memory.

---

## Step 6: System Update

```bash
# Update package lists
sudo apt-get update -y

# Upgrade installed packages
sudo apt-get upgrade -y

# Install useful tools
sudo apt-get install -y curl wget git jq htop
```

> **💡 Why update?** Fresh EC2 instances have outdated packages. Updating ensures you get the latest security patches and bug fixes. `jq` is for parsing JSON, `htop` is an interactive process monitor.

---

## 💰 Cost Optimization Tips

| Tip | Savings |
|-----|---------|
| Stop instance when not learning | Preserves Free Tier hours |
| Use 20GB storage (not 30GB) | Stays within free EBS limit |
| Don't attach Elastic IPs unused | $3.65/month if not attached |
| Set billing alerts | Avoid surprise charges |

### Set Up a Billing Alert
1. Go to **AWS Billing** → **Budgets**
2. Create a budget: **$1/month**
3. Add email notification at 80% threshold
4. You'll be alerted if anything goes over Free Tier

---

## ✅ Checkpoint

Before proceeding, verify:
- [ ] EC2 instance is running (green "Running" state)
- [ ] You can SSH into the instance
- [ ] Swap file is active (`free -h` shows 1.0Gi swap)
- [ ] System is updated
- [ ] Security group has all required ports open

**Next:** [02 — Docker Basics →](02-docker-basics.md)
