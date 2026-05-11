# ☁️ CloudPulse — Kubernetes-Based Real-Time Monitoring Platform

<div align="center">

![CloudPulse](https://img.shields.io/badge/CloudPulse-v1.0.0-6366f1?style=for-the-badge)
![Kubernetes](https://img.shields.io/badge/Kubernetes-k3s-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Free_Tier-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?style=for-the-badge&logo=grafana&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=for-the-badge&logo=jenkins&logoColor=white)

**A production-style, beginner-friendly DevOps project for learning Kubernetes, Docker, CI/CD, and Cloud Monitoring — all on AWS Free Tier.**

[Quick Start](#-quick-start) · [Architecture](#-architecture) · [Documentation](#-documentation) · [Interview Prep](#-interview-preparation)

</div>

---

## 🎯 What is CloudPulse?

CloudPulse is a **full-stack monitoring platform** that demonstrates real-world DevOps practices:

- **React Dashboard** — Real-time monitoring UI with glassmorphic design
- **Express.js API** — REST API with Prometheus metrics endpoint
- **Docker** — Multi-stage containerized builds
- **Kubernetes (k3s)** — Production-like cluster on a single EC2 instance
- **Prometheus + Grafana** — Industry-standard monitoring stack
- **GitHub Actions + Jenkins CI/CD** — Automated build, push, and deploy pipelines
- **AWS Free Tier** — Runs entirely on a t2.micro instance ($0/month)

---

## 🏗️ Architecture

```
User (Browser)
      ↓
AWS EC2 Instance (t2.micro, Ubuntu 22.04)
      ↓
┌─────────────────────────────────────────┐
│          k3s Kubernetes Cluster         │
│                                         │
│  ┌──────────┐     ┌───────────────┐    │
│  │ Traefik   │────→│  Frontend Pod │    │
│  │ Ingress   │     │  (React+Nginx)│    │
│  │ Controller│     └───────────────┘    │
│  │           │     ┌───────────────┐    │
│  │  / → FE   │────→│  Backend Pod  │    │
│  │  /api → BE │     │  (Express.js) │    │
│  └──────────┘     └───────┬───────┘    │
│                           │ /metrics    │
│  ┌──────────┐     ┌──────↓────────┐    │
│  │  Grafana  │←───│  Prometheus   │    │
│  │  :30030   │     │  :30090       │    │
│  └──────────┘     └───────────────┘    │
└─────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Tailwind CSS, Recharts | Monitoring dashboard UI |
| Backend | Node.js, Express.js, prom-client | REST API + Prometheus metrics |
| Containerization | Docker (multi-stage Alpine) | Package applications |
| Orchestration | Kubernetes (k3s) | Container management |
| Monitoring | Prometheus + Grafana | Metrics collection & visualization |
| CI/CD | GitHub Actions + Jenkins | Automated deployment pipelines |
| Cloud | AWS EC2 (Free Tier) | Infrastructure |
| Ingress | Traefik (k3s built-in) | HTTP routing |

---

## 🚀 Quick Start

### Option 1: Local Development (Docker Compose)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/CloudPulse.git
cd CloudPulse

# Start all services locally
docker-compose up --build

# Access:
# Frontend:   http://localhost:3000
# Backend:    http://localhost:8080
# Prometheus: http://localhost:9090
# Grafana:    http://localhost:3001 (admin/cloudpulse123)
```

### Option 2: AWS EC2 Deployment (Full Kubernetes)

```bash
# 1. Launch EC2 (see docs/01-aws-setup.md)
# 2. SSH into your instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# 3. Clone and setup
git clone https://github.com/YOUR_USERNAME/CloudPulse.git
cd CloudPulse
chmod +x scripts/*.sh
sudo ./scripts/setup-ec2.sh

# 4. Deploy to Kubernetes
./scripts/deploy.sh YOUR_DOCKERHUB_USERNAME

# Access:
# Frontend:   http://YOUR_EC2_IP
# Backend:    http://YOUR_EC2_IP/api/health
# Prometheus: http://YOUR_EC2_IP:30090
# Grafana:    http://YOUR_EC2_IP:30030 (admin/cloudpulse123)
```

---

## 📖 Documentation

Follow the guides in order for a complete learning experience:

| # | Guide | Topics |
|---|-------|--------|
| 01 | [AWS Setup](docs/01-aws-setup.md) | EC2, Security Groups, SSH, Swap |
| 02 | [Docker Basics](docs/02-docker-basics.md) | Images, Containers, Dockerfiles |
| 03 | [Kubernetes Basics](docs/03-kubernetes-basics.md) | Pods, Deployments, Services, k3s |
| 04 | [App Development](docs/04-app-development.md) | Backend API, Frontend Dashboard |
| 05 | [Dockerization](docs/05-dockerization.md) | Multi-stage builds, Optimization |
| 06 | [K8s Deployment](docs/06-k8s-deployment.md) | Manifests, kubectl, Rolling Updates |
| 07 | [Monitoring Setup](docs/07-monitoring-setup.md) | Prometheus, Grafana, PromQL |
| 08 | [Ingress Setup](docs/08-ingress-setup.md) | Traefik, Routing, TLS |
| 09 | [CI/CD Setup](docs/09-cicd-setup.md) | GitHub Actions, Automation |
| 10 | [Scaling](docs/10-scaling.md) | HPA, Load Testing |
| 11 | [Troubleshooting](docs/11-troubleshooting.md) | 20+ Common Issues & Fixes |
| 12 | [Optimization](docs/12-optimization.md) | Image Size, Resources, Security |
| 13 | [Interview Prep](docs/13-interview-prep.md) | 50+ DevOps Interview Q&A |
| 14 | [Jenkins Setup](docs/14-jenkins-setup.md) | Jenkins Pipeline, Webhooks |

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check (K8s probes) |
| `/api/status` | GET | Server status + pod info |
| `/api/metrics` | GET | Application metrics (JSON) |
| `/api/logs` | GET | Recent application logs |
| `/metrics` | GET | Prometheus metrics (scrape target) |

---

## 🎓 Interview Preparation

This project covers **every major DevOps interview topic**:

- ✅ Docker containerization & multi-stage builds
- ✅ Kubernetes deployments, services, ingress
- ✅ Prometheus monitoring & Grafana dashboards
- ✅ CI/CD pipelines with GitHub Actions & Jenkins
- ✅ AWS cloud infrastructure (EC2, Security Groups)
- ✅ Auto-scaling with HPA
- ✅ Rolling updates & zero-downtime deployments

**Resume bullet point:**
> Built CloudPulse, a Kubernetes-based real-time monitoring platform with React dashboard, Express.js API, Prometheus/Grafana monitoring stack, and GitHub Actions + Jenkins CI/CD pipelines, deployed on AWS EC2 using k3s.

See [docs/13-interview-prep.md](docs/13-interview-prep.md) for 50+ interview questions with answers.

---

## 📂 Project Structure

```
CloudPulse/
├── frontend/           # React monitoring dashboard
├── backend/            # Express.js API server
├── k8s/                # Kubernetes manifests
│   ├── backend/        # Backend deployment & service
│   ├── frontend/       # Frontend deployment & service
│   ├── monitoring/     # Prometheus & Grafana
│   ├── ingress/        # Traefik ingress rules
│   └── scaling/        # HPA auto-scaling
├── .github/workflows/  # GitHub Actions CI/CD
├── Jenkinsfile         # Jenkins CI/CD pipeline
├── scripts/            # Setup & deploy scripts
├── docs/               # Step-by-step guides
└── docker-compose.yaml # Local development
```

---

## ⚠️ AWS Free Tier Notes

| Resource | Free Tier Limit | CloudPulse Usage |
|----------|----------------|------------------|
| EC2 | 750 hrs/month t2.micro | ✅ 1 instance |
| EBS | 30 GB | ✅ 8 GB |
| Data Transfer | 15 GB/month outbound | ✅ Minimal |

> **Important:** Stop your EC2 instance when not using it to preserve Free Tier hours.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/awesome`
3. Commit changes: `git commit -m 'Add awesome feature'`
4. Push: `git push origin feature/awesome`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>Built with ❤️ for learning DevOps and Cloud Engineering</strong>
</div>
