# 14 — Jenkins CI/CD Setup

## 🎯 What You'll Learn
- Install Jenkins on EC2
- Configure Jenkins credentials
- Set up the CloudPulse pipeline
- Run and monitor builds

---

## Why Jenkins?

| Feature | GitHub Actions | Jenkins |
|---------|---------------|---------|
| Hosting | GitHub-hosted (free for public repos) | Self-hosted (you control everything) |
| Setup | Zero — built into GitHub | Install on your own server |
| Plugins | Limited (marketplace actions) | 1800+ plugins |
| Flexibility | YAML-based workflows | Groovy-based Jenkinsfile (very powerful) |
| Industry Use | Startups, open source | Enterprises, banks, large companies |

> **💡 Interview Tip:** Most enterprise companies use Jenkins. Having both GitHub Actions AND Jenkins on your resume shows versatility. Interviewers love hearing "I've used both."

---

## Step 1: Install Jenkins on EC2

```bash
# Install Java 17 (Jenkins requires Java)
sudo apt update
sudo apt install -y fontconfig openjdk-17-jre

# Verify Java
java -version
# Expected: openjdk version "17.x.x"

# Add Jenkins repository
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install -y jenkins

# Start Jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins

# Get the initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
# Copy this password — you'll need it for the web UI
```

---

## Step 2: Access Jenkins UI

1. Open `http://YOUR_EC2_IP:8080` in your browser
2. Paste the initial admin password
3. Click **"Install suggested plugins"** (wait ~5 minutes)
4. Create your admin user
5. Finish setup

> **⚠️ Security Group:** Make sure port **8080** is open in your EC2 Security Group for Jenkins access.

---

## Step 3: Install Required Plugins

Go to **Manage Jenkins → Plugins → Available**. Install:

| Plugin | Purpose |
|--------|---------|
| **Docker Pipeline** | Build and push Docker images |
| **SSH Agent** | SSH into EC2 for deployment |
| **Pipeline** | Jenkinsfile support (usually pre-installed) |
| **Git** | Git integration (usually pre-installed) |
| **NodeJS** | Node.js tool installer |

Click **"Install without restart"**, then restart Jenkins.

---

## Step 4: Add Jenkins to Docker Group

```bash
# Jenkins needs Docker access to build images
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

---

## Step 5: Configure Credentials

Go to **Manage Jenkins → Credentials → (global) → Add Credentials**:

### Docker Hub Credentials
- **Kind:** Username with password
- **ID:** `dockerhub-creds`
- **Username:** Your Docker Hub username
- **Password:** Your Docker Hub password or access token

### EC2 SSH Key
- **Kind:** SSH Username with private key
- **ID:** `ec2-ssh-key`
- **Username:** `ubuntu`
- **Private Key:** Paste your `.pem` file contents

### EC2 Host
- **Kind:** Secret text
- **ID:** `ec2-host`
- **Secret:** Your EC2 public IP address

---

## Step 6: Create the Pipeline

1. Click **"New Item"** on Jenkins dashboard
2. Enter name: `CloudPulse`
3. Select **"Pipeline"** → click OK
4. Under **Pipeline** section:
   - **Definition:** Pipeline script from SCM
   - **SCM:** Git
   - **Repository URL:** `https://github.com/YOUR_USERNAME/CloudPulse.git`
   - **Branch:** `*/main`
   - **Script Path:** `Jenkinsfile`
5. Click **Save**

---

## Step 7: Run the Pipeline

1. Click **"Build Now"** on the CloudPulse pipeline page
2. Watch the stages execute in the **Stage View**
3. Click on a stage to see its console output

### Pipeline Stages

```
┌──────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────────┐   ┌────────────┐
│ Checkout │──→│ Build & Test │──→│ Docker Build │──→│ Docker Push │──→│ Deploy K8s │
│          │   │  (parallel)  │   │              │   │ (main only) │   │(main only) │
└──────────┘   └──────────────┘   └──────────────┘   └─────────────┘   └────────────┘
```

---

## Step 8: Set Up Webhooks (Auto-trigger)

To trigger Jenkins automatically on every git push:

1. In Jenkins: Go to `CloudPulse` → **Configure** → **Build Triggers**
2. Check **"GitHub hook trigger for GITScm polling"**
3. In GitHub: Go to repo **Settings** → **Webhooks** → **Add webhook**
   - **Payload URL:** `http://YOUR_EC2_IP:8080/github-webhook/`
   - **Content type:** `application/json`
   - **Events:** Just the push event
4. Click **"Add webhook"**

Now every push to `main` automatically triggers a Jenkins build!

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Jenkins can't access Docker | `sudo usermod -aG docker jenkins && sudo systemctl restart jenkins` |
| Pipeline fails at npm ci | Node.js not installed — install NodeJS plugin and configure in Global Tool Config |
| SSH to EC2 fails | Check ec2-ssh-key credential has the correct private key |
| Port 8080 blocked | Add port 8080 to EC2 Security Group inbound rules |
| Webhook not triggering | Verify EC2 IP in webhook URL, check Jenkins logs |

---

## Jenkins vs GitHub Actions — Interview Answer

> "In CloudPulse, I implemented CI/CD with both GitHub Actions and Jenkins. GitHub Actions is great for open-source projects because it's built into GitHub and free for public repos. Jenkins gives you full control — I installed it on the same EC2 instance, configured Docker and SSH credentials, and set up a declarative pipeline with parallel build stages, Docker image caching, and automated K8s deployment. Jenkins is the industry standard for enterprises because of its plugin ecosystem and flexibility."

---

## ✅ Checkpoint

- [ ] Jenkins accessible at `http://EC2_IP:8080`
- [ ] Credentials configured (Docker Hub, SSH, EC2 host)
- [ ] Pipeline created pointing to Jenkinsfile
- [ ] Build runs successfully through all stages
- [ ] Webhook triggers builds on push (optional)
