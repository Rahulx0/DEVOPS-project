# UrbanGear DevOps Pipeline - Complete End-to-End Flow

## 🎯 Project Overview

This document describes the complete DevOps pipeline from local development to production deployment on AWS EKS.

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                       COMPLETE DEVOPS PIPELINE                       │
└─────────────────────────────────────────────────────────────────────┘

1. LOCAL DEVELOPMENT
   ├── React/Vite Application (app/)
   ├── Docker Multi-stage Build
   └── Local Testing (docker-compose)

2. VERSION CONTROL
   ├── Git Repository (Local)
   └── GitHub Repository (rahul branch)

3. CI/CD PIPELINE (GitHub Actions)
   ├── Triggered on: git push origin rahul
   ├── Jobs:
   │   ├── Test: npm build + lint
   │   ├── Security Scan: Trivy vulnerability scan
   │   ├── Build: Docker image build
   │   └── Push: Upload to AWS ECR
   └── Outputs: Docker image in ECR

4. AWS INFRASTRUCTURE (Terraform)
   ├── Backend: S3 + DynamoDB (state management)
   ├── VPC: Networking (subnets, NAT, security groups)
   ├── EKS: Kubernetes cluster (2 t3.medium nodes)
   └── ECR: Container registry

5. KUBERNETES DEPLOYMENT
   ├── Manifests: Deployment + Service + Ingress
   ├── Kustomize: Environment-specific configs
   └── Pods: 2 replicas running

6. ACCESS METHODS
   ├── Port Forward: localhost:8080
   ├── NodePort: Node IP:NodePort
   └── Load Balancer: (blocked - AWS restriction)
```

---

## 🚀 Complete Workflow Steps

### Phase 1: Infrastructure Setup ✅

```bash
# 1. Bootstrap Terraform Backend
cd infra/terraform/envs/bootstrap
terraform init
terraform apply -auto-approve

# Created:
# - S3 bucket: urbangear-terraform-state-cda6af11
# - DynamoDB table: urbangear-terraform-locks

# 2. Deploy VPC
cd ../dev
terraform init
terraform plan
terraform apply -auto-approve

# Created 20 resources:
# - VPC with public/private subnets
# - NAT gateways
# - Security groups
# - Route tables

# 3. Deploy EKS & ECR
terraform apply -auto-approve

# Created 7 resources:
# - EKS cluster: urbangear-dev-cluster
# - Node group: 2x t3.medium instances
# - ECR repository: urbangear-dev-frontend
# - IAM roles and policies
```

**Status**: ✅ All infrastructure deployed and operational

---

### Phase 2: Application Containerization ✅

```bash
# Build Docker image locally
cd app/
docker build --target production -t urbangear-frontend:local .

# Test locally
docker run -p 8080:80 urbangear-frontend:local
# Access: http://localhost:8080

# Or use docker-compose
cd ..
docker-compose up --build
# Access: http://localhost:8080
```

**Status**: ✅ Docker builds successfully, ~21MB production image

---

### Phase 3: Git & GitHub Setup ✅

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit: Complete DevOps infrastructure"

# Connect to GitHub
git remote add origin https://github.com/Rahulx0/DEVOPS-project.git
git checkout -b rahul
git push -u origin rahul
```

**Status**: ✅ Code pushed to GitHub `rahul` branch

---

### Phase 4: CI/CD Pipeline Setup ✅

**GitHub Secrets Added:**
```
AWS_ACCESS_KEY_ID        → Your AWS access key
AWS_SECRET_ACCESS_KEY    → Your AWS secret key
AWS_REGION              → us-west-2
ECR_REPOSITORY          → urbangear-dev-frontend
EKS_CLUSTER_NAME        → urbangear-dev-cluster
```

**Workflow Triggers:**
- Push to `rahul` or `main` branch
- Pull request to `rahul` or `main` branch

**Workflow Jobs:**

1. **Test Job** (2-3 min)
   - Checkout code
   - Setup Node.js 20
   - Install dependencies
   - Build application
   - Run linter

2. **Security Scan Job** (1-2 min)
   - Scan code with Trivy
   - Upload results to GitHub Security tab

3. **Build Job** (3-5 min)
   - Configure AWS credentials
   - Login to ECR
   - Build Docker image with buildx
   - Tag: commit-sha + latest
   - Push to ECR
   - Output image URI

4. **Deploy Job** (2-3 min) - Only on push to main/rahul
   - Configure kubectl for EKS
   - Apply Kubernetes manifests
   - Verify deployment rollout

**Status**: ✅ CI/CD working - 5+ images in ECR

---

### Phase 5: Kubernetes Deployment ✅

```bash
# Configure kubectl
aws eks update-kubeconfig --name urbangear-dev-cluster --region us-west-2

# Verify cluster access
kubectl get nodes
# Expected: 2 nodes in Ready state

# Deploy application
kubectl apply -k manifests/base/

# Verify deployment
kubectl get pods
# Expected: 2 pods running

kubectl get svc
# Expected: urbangear-frontend-service (ClusterIP)

kubectl get ingress
# Expected: urbangear-frontend-ingress (no ADDRESS due to AWS restriction)
```

**Status**: ✅ Application deployed, 2 pods running

---

## 🔄 Complete End-to-End Test Flow

### Test 1: Code Change → Automatic Deployment

```bash
# Step 1: Make a code change
cd /home/kratos/Downloads/urbangear-e-commerce\(1\)/app/src
echo "// Test CI/CD pipeline" >> App.tsx

# Step 2: Commit and push
git add .
git commit -m "test: Trigger CI/CD pipeline"
git push origin rahul

# Step 3: Monitor GitHub Actions
# Visit: https://github.com/Rahulx0/DEVOPS-project/actions
# Watch all 4 jobs execute

# Step 4: Verify new image in ECR
aws ecr describe-images --repository-name urbangear-dev-frontend --region us-west-2 --max-items 1 --no-cli-pager

# Step 5: Check deployment updated
kubectl get pods -w
# Watch for new pods with new image
```

---

### Test 2: Access the Running Application

**Method 1: Port Forward (Recommended)**
```bash
# Forward port 8080 to the service
kubectl port-forward svc/urbangear-frontend-service 8080:80

# Access in browser
# URL: http://localhost:8080
```

**Method 2: NodePort**
```bash
# Change service to NodePort
kubectl patch svc urbangear-frontend-service -p '{"spec":{"type":"NodePort"}}'

# Get NodePort
kubectl get svc urbangear-frontend-service
# Note the NodePort (e.g., 30123)

# Get node IP
kubectl get nodes -o wide
# Note the EXTERNAL-IP

# Access in browser
# URL: http://<NODE-IP>:<NODE-PORT>
```

**Method 3: Exec into Pod**
```bash
# Get pod name
export POD_NAME=$(kubectl get pods -l app=urbangear-frontend -o jsonpath='{.items[0].metadata.name}')

# Test from inside cluster
kubectl exec -it $POD_NAME -- curl localhost:80

# Expected: HTML content of the React app
```

---

## 📊 Current System Status

### Infrastructure Status
```bash
# Check Terraform state
cd infra/terraform/envs/dev
terraform show

# Resources Created:
# - 20 VPC resources
# - 7 EKS/ECR resources
# Total: 27 resources managed by Terraform
```

### Kubernetes Status
```bash
# Cluster info
kubectl cluster-info

# Node status
kubectl get nodes -o wide

# All resources
kubectl get all

# Pod logs
kubectl logs -l app=urbangear-frontend --tail=50

# Pod describe
kubectl describe pod -l app=urbangear-frontend
```

### ECR Images
```bash
# List all images
aws ecr describe-images \
  --repository-name urbangear-dev-frontend \
  --region us-west-2 \
  --no-cli-pager

# Expected: Multiple images with different SHAs
```

### GitHub Actions
```bash
# View recent workflow runs
# Visit: https://github.com/Rahulx0/DEVOPS-project/actions

# Check latest run status
# All jobs should show green checkmarks
```

---

## 🎯 Quick Start Commands

```bash
# 1. Check cluster is running
kubectl get nodes

# 2. Check app is deployed
kubectl get pods

# 3. Access the application
kubectl port-forward svc/urbangear-frontend-service 8080:80
# Open: http://localhost:8080

# 4. Trigger new deployment
cd /home/kratos/Downloads/urbangear-e-commerce\(1\)
echo "# Update $(date)" >> README.md
git add README.md
git commit -m "test: CI/CD pipeline"
git push origin rahul

# 5. Watch deployment
kubectl get pods -w
```

---

## 📈 Monitoring & Debugging

### Check Application Logs
```bash
# Real-time logs from all pods
kubectl logs -f -l app=urbangear-frontend

# Logs from specific pod
kubectl logs <pod-name>

# Previous container logs (if pod restarted)
kubectl logs <pod-name> --previous
```

### Check Deployment Status
```bash
# Deployment details
kubectl describe deployment urbangear-frontend

# Rollout status
kubectl rollout status deployment urbangear-frontend

# Rollout history
kubectl rollout history deployment urbangear-frontend
```

### Check Service & Networking
```bash
# Service details
kubectl describe svc urbangear-frontend-service

# Endpoints
kubectl get endpoints urbangear-frontend-service

# Network policies
kubectl get networkpolicies
```

### Check Events
```bash
# All events
kubectl get events --sort-by='.lastTimestamp'

# Events for specific resource
kubectl describe pod <pod-name>
```

---

## 🐛 Troubleshooting

### Issue: Pods not starting
```bash
# Check pod events
kubectl describe pod <pod-name>

# Check image pull status
kubectl get pods -o jsonpath='{.items[*].status.containerStatuses[*].state}'

# Force pull new image
kubectl rollout restart deployment urbangear-frontend
```

### Issue: Service not accessible
```bash
# Check service endpoints
kubectl get endpoints

# Test from another pod
kubectl run test-pod --image=busybox -it --rm -- wget -O- http://urbangear-frontend-service
```

### Issue: GitHub Actions failing
```bash
# Check secrets are set
# Visit: https://github.com/Rahulx0/DEVOPS-project/settings/secrets/actions

# Re-run failed workflow
# Visit: https://github.com/Rahulx0/DEVOPS-project/actions
# Click on failed run → "Re-run all jobs"
```

---

## 🎉 Success Criteria

### ✅ All Systems Operational

- [x] Terraform infrastructure deployed (27 resources)
- [x] EKS cluster running (2 nodes healthy)
- [x] Application pods running (2/2 ready)
- [x] GitHub Actions pipeline working
- [x] Docker images in ECR
- [x] kubectl access configured
- [x] Application accessible via port-forward

### ⚠️ Known Limitations

- **Load Balancer**: AWS account doesn't support ALB creation yet
  - **Workaround**: Use port-forward or NodePort
  - **Solution**: Contact AWS Support or wait for account verification

---

## 🔗 Important URLs

- **GitHub Repository**: https://github.com/Rahulx0/DEVOPS-project
- **GitHub Actions**: https://github.com/Rahulx0/DEVOPS-project/actions
- **Branch**: `rahul`
- **ECR Repository**: `484907531725.dkr.ecr.us-west-2.amazonaws.com/urbangear-dev-frontend`
- **EKS Cluster**: `urbangear-dev-cluster` (us-west-2)

---

## 📚 Next Steps

1. **Contact AWS Support** to enable ALB creation
2. **Install ArgoCD** for GitOps-based deployment
3. **Add Prometheus + Grafana** for monitoring
4. **Set up Horizontal Pod Autoscaling**
5. **Implement Blue-Green or Canary deployments**
6. **Add SSL/TLS with cert-manager**

---

## 🎓 What You've Built

You now have a **production-ready DevOps pipeline** that includes:

- ✅ Infrastructure as Code (Terraform)
- ✅ Automated CI/CD (GitHub Actions)
- ✅ Container Orchestration (Kubernetes on EKS)
- ✅ Container Registry (AWS ECR)
- ✅ Security Scanning (Trivy)
- ✅ Version Control (Git/GitHub)
- ✅ Environment Management (Kustomize)
- ✅ Cloud Infrastructure (AWS VPC, EKS, ECR, S3, DynamoDB)

**Congratulations!** 🎉 This is a complete, enterprise-grade DevOps setup!

