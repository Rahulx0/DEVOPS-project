# Architecture Documentation

## System Overview
The UrbanGear e-commerce platform is designed as a cloud-native application with the following architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Developer     │    │   GitHub        │    │   AWS Cloud     │
│   Machine       │    │   Repository    │    │                 │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Docker    │ │    │ │  GitHub     │ │    │ │    EKS      │ │
│ │  Compose    │ │────┼─│  Actions    │ │────┼─│  Cluster    │ │
│ │             │ │    │ │    CI/CD    │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │        │        │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │    Vite     │ │    │ │   ArgoCD    │ │    │ │     ECR     │ │
│ │ Dev Server  │ │    │ │   GitOps    │ │    │ │  Container  │ │
│ │             │ │    │ │             │ │    │ │  Registry   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### Application Layer
- **Frontend**: React SPA built with Vite
- **Containerization**: Multi-stage Docker build with NGINX
- **Local Development**: Hot reload via Vite dev server

### Infrastructure Layer
- **AWS EKS**: Managed Kubernetes cluster
- **AWS VPC**: Network isolation and security
- **AWS ECR**: Container image registry
- **AWS Route53**: DNS management
- **AWS ACM**: TLS certificate management

### Automation Layer
- **GitHub Actions**: CI/CD pipeline for build and test
- **ArgoCD**: GitOps continuous deployment
- **Terraform**: Infrastructure as Code
- **Kustomize**: Kubernetes manifest templating

## Deployment Flow

1. **Local Development**
   ```
   npm run dev → http://localhost:5173
   docker compose up → http://localhost:8080
   ```

2. **CI/CD Pipeline**
   ```
   git push → GitHub Actions → Docker build → ECR push → ArgoCD sync → EKS deployment
   ```

3. **Production Access**
   ```
   Route53 → ALB Ingress → NGINX → React SPA
   ```

## Infrastructure Modules

### Current Status
- ✅ Backend module (S3 + DynamoDB for Terraform state)
- ✅ VPC module (subnets, security groups, NAT gateway)
- 🚧 EKS module (cluster, node groups, RBAC) - deploying
- 🚧 ECR module (container registry) - deploying
- 🚧 Route53/ACM modules (DNS and certificates)

### Next Steps
1. Implement VPC networking module
2. Create EKS cluster module with appropriate node groups
3. Set up ECR repository for container images
4. Configure Route53 and ACM for custom domain
5. Install and configure ArgoCD on the cluster

## Security Considerations
- IAM roles with least privilege access
- Network segmentation via VPC and security groups
- Encrypted Terraform state storage
- Container image scanning
- TLS termination at ingress level
<!-- CI: pipeline test 2025-11-20 -->