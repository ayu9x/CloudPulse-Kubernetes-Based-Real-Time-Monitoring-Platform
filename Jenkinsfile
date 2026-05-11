// ============================================================
// CloudPulse — Jenkins CI/CD Pipeline (Jenkinsfile)
// ============================================================
// Declarative pipeline that builds, tests, pushes Docker images,
// and deploys to a Kubernetes cluster on AWS EC2.
//
// Prerequisites on Jenkins server:
//   - Docker installed and Jenkins user in docker group
//   - kubectl configured (or deploy via SSH)
//   - Credentials configured:
//       • dockerhub-creds  (Username/Password for Docker Hub)
//       • ec2-ssh-key      (SSH Private Key for EC2)
//   - Environment variables:
//       • EC2_HOST          (EC2 public IP)
//       • DOCKER_USERNAME   (Docker Hub username)
// ============================================================

pipeline {
    agent any

    // ── Environment Variables ──────────────────────────────────
    environment {
        DOCKER_USERNAME = credentials('dockerhub-creds-usr')   // Username part
        DOCKER_PASSWORD = credentials('dockerhub-creds-psw')   // Password part
        DOCKER_CREDS    = credentials('dockerhub-creds')       // Combined
        EC2_HOST        = credentials('ec2-host')
        IMAGE_TAG       = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'latest'}"
    }

    // ── Pipeline Options ───────────────────────────────────────
    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    // ── Stages ─────────────────────────────────────────────────
    stages {

        // ── Stage 1: Checkout ──────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Code checked out — Branch: ${env.BRANCH_NAME ?: 'main'}"
            }
        }

        // ── Stage 2: Install & Build ───────────────────────────
        stage('Build & Test') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            echo '✅ Backend dependencies installed'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'REACT_APP_API_URL="" npm run build'
                            echo '✅ Frontend built successfully'
                        }
                    }
                }
            }
        }

        // ── Stage 3: Docker Build ──────────────────────────────
        stage('Docker Build') {
            steps {
                echo "🐳 Building Docker images with tag: ${IMAGE_TAG}"

                sh """
                    docker build -t ${DOCKER_USERNAME}/cloudpulse-backend:${IMAGE_TAG} \
                                 -t ${DOCKER_USERNAME}/cloudpulse-backend:latest \
                                 ./backend

                    docker build -t ${DOCKER_USERNAME}/cloudpulse-frontend:${IMAGE_TAG} \
                                 -t ${DOCKER_USERNAME}/cloudpulse-frontend:latest \
                                 ./frontend
                """

                echo '✅ Docker images built'
            }
        }

        // ── Stage 4: Docker Push ───────────────────────────────
        stage('Docker Push') {
            when {
                branch 'main'
            }
            steps {
                sh "echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin"

                sh """
                    docker push ${DOCKER_USERNAME}/cloudpulse-backend:${IMAGE_TAG}
                    docker push ${DOCKER_USERNAME}/cloudpulse-backend:latest
                    docker push ${DOCKER_USERNAME}/cloudpulse-frontend:${IMAGE_TAG}
                    docker push ${DOCKER_USERNAME}/cloudpulse-frontend:latest
                """

                echo '✅ Docker images pushed to Docker Hub'
            }
        }

        // ── Stage 5: Deploy to Kubernetes ──────────────────────
        stage('Deploy to K8s') {
            when {
                branch 'main'
            }
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            cd ~/CloudPulse || git clone https://github.com/${env.GIT_URL?.replaceAll("https://github.com/", "")?.replaceAll(".git", "") ?: "your-username/CloudPulse"}.git ~/CloudPulse && cd ~/CloudPulse
                            git pull origin main

                            # Update image names
                            sed -i "s|YOUR_DOCKERHUB_USERNAME|${DOCKER_USERNAME}|g" k8s/backend/deployment.yaml
                            sed -i "s|YOUR_DOCKERHUB_USERNAME|${DOCKER_USERNAME}|g" k8s/frontend/deployment.yaml

                            # Apply manifests
                            kubectl apply -f k8s/namespace.yaml
                            kubectl apply -f k8s/backend/
                            kubectl apply -f k8s/frontend/
                            kubectl apply -f k8s/monitoring/
                            kubectl apply -f k8s/ingress/

                            # Rolling restart
                            kubectl rollout restart deployment/cloudpulse-backend -n cloudpulse
                            kubectl rollout restart deployment/cloudpulse-frontend -n cloudpulse

                            # Wait for rollout
                            kubectl rollout status deployment/cloudpulse-backend -n cloudpulse --timeout=120s
                            kubectl rollout status deployment/cloudpulse-frontend -n cloudpulse --timeout=120s

                            echo "✅ Deployment completed!"
                        '
                    """
                }
            }
        }
    }

    // ── Post Actions ───────────────────────────────────────────
    post {
        success {
            echo '''
            ╔══════════════════════════════════════════╗
            ║  ✅ CloudPulse Pipeline — SUCCESS        ║
            ║                                          ║
            ║  Frontend:   http://EC2_IP               ║
            ║  Backend:    http://EC2_IP/api/health     ║
            ║  Prometheus: http://EC2_IP:30090          ║
            ║  Grafana:    http://EC2_IP:30030          ║
            ╚══════════════════════════════════════════╝
            '''
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above for errors.'
        }
        always {
            // Clean up Docker images to save disk space
            sh 'docker system prune -f || true'
            cleanWs()
        }
    }
}
