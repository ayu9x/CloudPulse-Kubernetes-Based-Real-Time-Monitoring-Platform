# 13 — Interview Preparation

## 🎓 DevOps Interview Questions & Answers

Use these to prepare for interviews. Every answer references something you built in CloudPulse.

---

## 📝 Resume Bullet Points

Use these on your resume:

> - **Built CloudPulse**, a Kubernetes-based real-time monitoring platform with React dashboard, Node.js API, Prometheus/Grafana stack, and GitHub Actions CI/CD pipeline deployed on AWS EC2
> - Containerized microservices using **multi-stage Docker builds** (reduced image size by 95%) and orchestrated with **k3s Kubernetes**, implementing rolling updates, HPA auto-scaling, and health probes
> - Designed **CI/CD pipeline** with GitHub Actions for automated Docker image builds, registry pushes, and zero-downtime Kubernetes deployments via SSH
> - Implemented **Prometheus metrics collection** with custom counters, histograms, and gauges, visualized through **Grafana dashboards** with auto-provisioned datasources
> - Configured **Traefik Ingress** for path-based routing, **resource limits** for Free Tier optimization, and comprehensive monitoring with liveness/readiness probes

---

## How to Explain CloudPulse in an Interview

> "I built CloudPulse, a full-stack monitoring platform deployed on AWS. The frontend is a React dashboard that shows real-time server metrics — CPU, memory, pod health. The backend is a Node.js API that exposes Prometheus metrics endpoints. Everything runs in Docker containers orchestrated by Kubernetes on a single EC2 instance using k3s. I set up Prometheus to scrape metrics every 15 seconds and Grafana for dashboards. The CI/CD pipeline uses GitHub Actions — when I push to main, it builds Docker images, pushes to Docker Hub, SSHes into EC2, and deploys with kubectl. I also implemented auto-scaling with HPA and zero-downtime rolling updates."

---

## 🐳 Docker Questions (15)

**Q1: What is Docker and why do we use it?**
> Docker is a containerization platform that packages applications and their dependencies into lightweight, portable containers. Unlike VMs, containers share the host OS kernel, making them faster to start and more resource-efficient. In CloudPulse, I used Docker to ensure the app runs identically in development and production.

**Q2: What is the difference between a Docker image and a container?**
> An **image** is a read-only blueprint (like a class). A **container** is a running instance of that image (like an object). You can run multiple containers from one image. In CloudPulse, I build images with `docker build` and run containers with `docker run`.

**Q3: What is a multi-stage Docker build?**
> A multi-stage build uses multiple FROM statements. Stage 1 builds the app (needs Node.js, npm). Stage 2 copies only the build output to a minimal image (nginx:alpine). This reduced my frontend image from ~1GB to ~25MB.

**Q4: What is the difference between CMD and ENTRYPOINT?**
> **CMD** provides default arguments that can be overridden at runtime. **ENTRYPOINT** sets the main command that always runs. `CMD ["node", "server.js"]` can be overridden with `docker run myimage bash`. `ENTRYPOINT ["node"]` always runs node.

**Q5: What is Docker Compose?**
> Docker Compose defines and runs multi-container applications using a YAML file. In CloudPulse, `docker-compose.yaml` starts frontend, backend, Prometheus, and Grafana together with `docker-compose up`.

**Q6: How does Docker networking work?**
> Docker creates virtual networks. Containers on the same network can reach each other by container name. In docker-compose, all services share a bridge network, so the frontend can reach the backend at `http://backend:8080`.

**Q7: What is a .dockerignore file?**
> Like .gitignore but for Docker. It excludes files from the build context (node_modules, .git). This makes builds faster and images smaller.

**Q8: How do you optimize Docker images?**
> Use Alpine base images, multi-stage builds, .dockerignore, install only production dependencies (`npm ci --only=production`), and order Dockerfile instructions by change frequency for better layer caching.

**Q9: What are Docker volumes?**
> Volumes persist data beyond container lifecycles. In CloudPulse, Prometheus and Grafana use volumes to retain metrics data even if containers restart.

**Q10: What is the difference between COPY and ADD in Dockerfile?**
> COPY simply copies files. ADD can also extract tar archives and download URLs. Best practice: use COPY unless you specifically need ADD's features.

**Q11: How do you pass environment variables to Docker?**
> Use `-e` flag: `docker run -e PORT=8080 myimage`, or `env_file` in docker-compose, or ENV in Dockerfile. In K8s, we use ConfigMaps and Secrets.

**Q12: What are Docker layers?**
> Each Dockerfile instruction creates a layer. Layers are cached — if a layer hasn't changed, Docker reuses the cached version. This is why we copy package.json before source code.

**Q13: What is Docker health check?**
> HEALTHCHECK instruction tells Docker how to verify a container is working. `HEALTHCHECK CMD wget --spider http://localhost:8080/api/health`. Unhealthy containers can be auto-restarted.

**Q14: What port does your backend run on?**
> Port 8080 inside the container. The Dockerfile has `EXPOSE 8080`. In K8s, the Service maps port 8080 to the container port.

**Q15: How do you debug a running container?**
> `docker logs <id>` for logs, `docker exec -it <id> /bin/sh` to open a shell, `docker inspect <id>` for configuration details.

---

## ☸️ Kubernetes Questions (15)

**Q1: What is Kubernetes and why do we need it?**
> Kubernetes orchestrates containers across multiple machines. It handles scheduling, scaling, self-healing, and networking. Docker runs containers on ONE machine; K8s manages containers across a CLUSTER. In CloudPulse, K8s ensures my backend always has 2 replicas and restarts crashed pods automatically.

**Q2: What is a Pod?**
> The smallest deployable unit in K8s. A pod contains one or more containers that share networking and storage. In CloudPulse, each backend instance runs in its own pod.

**Q3: What is the difference between a Deployment and a Pod?**
> A Pod is a single instance. A Deployment manages multiple pod replicas, handles rolling updates, and ensures desired state. You rarely create Pods directly — you create Deployments.

**Q4: What are the types of Kubernetes Services?**
> **ClusterIP** (internal only, default), **NodePort** (external via node port), **LoadBalancer** (cloud load balancer). In CloudPulse, backend/frontend use ClusterIP (accessed via Ingress), Prometheus/Grafana use NodePort.

**Q5: What is an Ingress?**
> An Ingress routes external HTTP traffic to internal services based on URL paths. Like a reverse proxy. In CloudPulse, `/` goes to frontend, `/api` goes to backend. K3s uses Traefik as the Ingress controller.

**Q6: What are liveness and readiness probes?**
> **Liveness:** "Is the pod alive?" Fails → K8s restarts it. **Readiness:** "Can the pod handle traffic?" Fails → K8s removes it from the Service. In CloudPulse, both probe `/api/health`.

**Q7: What is a rolling update?**
> K8s gradually replaces old pods with new ones during deployment. `maxSurge: 1` creates 1 new pod before killing old ones. `maxUnavailable: 0` ensures zero downtime.

**Q8: What is a Namespace?**
> A virtual cluster within a cluster for resource isolation. CloudPulse runs in the `cloudpulse` namespace, separate from `kube-system`.

**Q9: What is a ConfigMap vs a Secret?**
> ConfigMap stores non-sensitive config (PORT, LOG_LEVEL). Secret stores sensitive data (passwords, API keys) in base64 encoding. Both inject as env vars or files.

**Q10: What is HPA (Horizontal Pod Autoscaler)?**
> HPA automatically scales pod count based on metrics. In CloudPulse, when CPU exceeds 70%, HPA adds pods (up to 4). When load drops, it removes pods (down to 1).

**Q11: How does K8s networking work?**
> Every pod gets a unique IP. Services provide stable DNS names. CoreDNS resolves service names to IPs. In CloudPulse, the frontend reaches backend via `cloudpulse-backend:8080`.

**Q12: What happens when a pod crashes?**
> The Deployment controller detects the crashed pod and creates a new one to maintain the desired replica count. This is "self-healing."

**Q13: What is k3s vs minikube vs EKS?**
> **k3s**: Lightweight, production-grade K8s (512MB RAM). **Minikube**: Development-focused K8s in a VM (2GB+ RAM). **EKS**: AWS managed K8s ($73/month). I chose k3s for Free Tier compatibility.

**Q14: What is kubectl?**
> The command-line tool for interacting with K8s clusters. `kubectl apply -f` creates resources, `kubectl get pods` lists pods, `kubectl logs` shows logs.

**Q15: How do you rollback a deployment?**
> `kubectl rollout undo deployment/cloudpulse-backend -n cloudpulse`. K8s keeps revision history and reverts to the previous version.

---

## 🔄 CI/CD Questions (10)

**Q1: What is CI/CD?**
> **CI (Continuous Integration):** Automatically build and test on every code push. **CD (Continuous Deployment):** Automatically deploy tested code. CloudPulse uses GitHub Actions for both.

**Q2: Explain your CI/CD pipeline.**
> Push to main → GitHub Actions triggers → Install deps + build → Build Docker images → Push to Docker Hub → SSH into EC2 → kubectl apply to deploy → Rollout status check. Three jobs: build, docker, deploy.

**Q3: What is GitHub Actions?**
> A CI/CD platform built into GitHub. Workflows are defined in YAML. Free for public repos (2000 min/month for private). Each job runs on a fresh Ubuntu VM.

**Q4: How do you store secrets in CI/CD?**
> GitHub repo Settings → Secrets. They're encrypted and only available during workflow runs. Never hardcode secrets in code or YAML.

**Q5: What triggers your pipeline?**
> `on: push: branches: [main]` — triggers on pushes to main. `on: pull_request: branches: [main]` — triggers on PRs to main (only build job, not deploy).

**Q6: How do you handle deployment failures?**
> The pipeline uses `kubectl rollout status --timeout=120s`. If it fails, the rollout is incomplete and previous pods remain. I can rollback with `kubectl rollout undo`.

**Q7: What is the difference between CI and CD?**
> CI ensures code quality (build, test). CD ensures code reaches production (deploy). You can have CI without CD, but not CD without CI.

**Q8: How do you deploy to EC2 from GitHub Actions?**
> Using `appleboy/ssh-action` to SSH into EC2 with a private key stored in GitHub Secrets. The script pulls code and runs kubectl commands.

**Q9: What is image tagging strategy?**
> I tag with both `latest` and the Git commit SHA. SHA provides traceability (which commit is deployed). `latest` provides convenience.

**Q10: How would you add testing to the pipeline?**
> Add a `test` step: `npm test` for unit tests, `curl` for API smoke tests, or use tools like Jest, Cypress, or k6 for load tests.

---

## 📊 Monitoring Questions (5)

**Q1: How does Prometheus work?**
> Prometheus uses a PULL model — it scrapes HTTP endpoints (/metrics) at regular intervals. It stores time-series data and supports PromQL for querying. In CloudPulse, it scrapes the backend every 15 seconds.

**Q2: What are the Prometheus metric types?**
> **Counter** (only goes up: request count), **Gauge** (goes up and down: CPU usage), **Histogram** (distribution: response time percentiles), **Summary** (like histogram but calculates quantiles client-side).

**Q3: What is Grafana?**
> A visualization platform that connects to data sources (Prometheus, InfluxDB, etc.) and creates dashboards. It doesn't store data — it queries Prometheus.

**Q4: How do you set up alerting?**
> In Prometheus: define alerting rules (e.g., "alert if CPU > 90% for 5 minutes"). Alertmanager routes alerts to Slack, email, PagerDuty.

**Q5: What metrics would you monitor in production?**
> The **Four Golden Signals**: Latency (response time), Traffic (request rate), Errors (error rate), Saturation (CPU/memory usage).

---

## ☁️ AWS Questions (5)

**Q1: What is EC2?**
> Elastic Compute Cloud — virtual servers in AWS. You choose instance type (CPU/RAM), AMI (OS), and pay by the hour. t2.micro is Free Tier (750 hours/month).

**Q2: What are Security Groups?**
> Virtual firewalls controlling inbound/outbound traffic. Stateful — if you allow inbound, the response is automatically allowed outbound.

**Q3: Why Free Tier?**
> Demonstrates cost-awareness and optimization skills. Shows you can build production-quality systems without expensive managed services.

**Q4: What is the difference between EC2 and ECS/EKS?**
> **EC2**: Raw VMs, you manage everything. **ECS**: AWS-managed Docker orchestration. **EKS**: AWS-managed Kubernetes ($73/month). I used EC2+k3s to stay on Free Tier.

**Q5: How do you secure an EC2 instance?**
> SSH key (not password), Security Groups (least privilege ports), updates (`apt upgrade`), non-root users, swap file for stability.

---

## 🎭 Scenario Questions (5)

**Q1: A pod keeps crashing. How do you debug?**
> 1. `kubectl get pods` — check status (CrashLoopBackOff?) 2. `kubectl logs <pod>` — check application errors 3. `kubectl describe pod <pod>` — check events 4. `kubectl exec -it <pod> -- /bin/sh` — inspect inside the container 5. Check resource limits — might be OOMKilled.

**Q2: Your app is slow. How do you investigate?**
> 1. Check Prometheus metrics (response time histogram) 2. Check CPU/memory usage (kubectl top pods) 3. Check HPA status (is it scaling?) 4. Look at Grafana dashboards for trends 5. Check if one pod is receiving too much traffic (Service load balancing issue).

**Q3: How would you handle a production outage?**
> 1. Check pod status immediately 2. Check recent deployments (rollback if needed) 3. Check logs for errors 4. Check infrastructure (EC2 health, disk space) 5. Communicate status to stakeholders 6. Post-mortem after resolution.

**Q4: How do you implement zero-downtime deployments?**
> Rolling updates with `maxSurge: 1, maxUnavailable: 0`. New pods start before old ones stop. Readiness probes ensure traffic only goes to ready pods. In CloudPulse, K8s handles this automatically.

**Q5: How would you scale CloudPulse for 10x traffic?**
> 1. Increase HPA maxReplicas 2. Move to larger EC2 instance (or multiple nodes) 3. Add caching (Redis) 4. Use AWS ALB instead of NodePort 5. Consider EKS for multi-node cluster 6. Add database for persistent metrics.

---

## 🎯 Quick Study Checklist

- [ ] Can explain Docker images vs containers
- [ ] Can explain Kubernetes Pods, Deployments, Services
- [ ] Can explain CI/CD pipeline flow
- [ ] Can explain Prometheus pull-based monitoring
- [ ] Can explain rolling updates and zero-downtime
- [ ] Can debug a crashing pod step by step
- [ ] Can explain the CloudPulse architecture end-to-end
- [ ] Can write 3+ resume bullet points from this project
