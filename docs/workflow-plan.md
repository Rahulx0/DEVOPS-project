# End-to-End Deployment Workflow Plan
<!-- CI: pipeline test 2025-11-20 -->

## 1. Project Overview
- **Product**: UrbanGear React storefront served via Vite
- **Goal**: Deliver production-grade deployment on AWS EKS with GitOps automation
- **Code Structure Proposal**:
  - `app/` – frontend (current repo contents will migrate here)
  - `infra/terraform/` – Infrastructure as Code modules and environments
  - `manifests/` – Kubernetes YAML (base + overlays)
  - `ci/` – GitHub Actions workflows
  - `docs/` – architecture, runbooks, diagrams

## 2. High-Level Workflow
```
Local Dev -> GitHub Push -> GitHub Actions -> AWS ECR -> ArgoCD -> EKS -> End Users
            ^                                            |
            |--------------------------------------------|
```

## 3. Phase Breakdown

| Phase | Title | Key Outcomes |
|-------|-------|--------------|
| 0 | Prep & Baseline | Document architecture, ensure local run (`npm run dev`) and Docker build |
| 1 | AWS Foundations | Create IAM users/roles, configure AWS CLI, set up Terraform state bucket + DynamoDB |
| 2 | Infrastructure | Build Terraform modules for VPC, EKS, ECR, Route53, ACM; apply to AWS |
| 3 | Application Containerization | Dockerfile, docker-compose for local testing, push to ECR |
| 4 | Kubernetes Manifests | Deployments, Services, Ingress, ConfigMaps, Secrets; parameterize via Kustomize |
| 5 | Networking & Domain | Ingress Controller (NGINX), Route53 records, ACM TLS, external-dns integration |
| 6 | CI/CD Automation | GitHub Actions for build/test/push; ArgoCD app sync to EKS |
| 7 | Operations | Monitoring, logging, rollout strategy, runbooks |

## 4. Immediate Next Actions
1. **AWS IAM Setup**: Establish required users/roles and credential management approach.
2. **Bootstrap Backend**: Run Terraform bootstrap to create S3/DynamoDB backend resources.
3. **VPC Module**: Create networking infrastructure module for AWS VPC, subnets, and security groups.

## 5. Tooling Checklist
- Node.js, npm (validated)
- Docker Engine + Compose
- Terraform >= 1.7
- AWS CLI v2
- kubectl & eksctl (for bootstrapping)
- Helm (for ingress controller)

## 6. Risks & Mitigation
- **State Management**: Use remote Terraform state with locking.
- **IAM Security**: Enforce least privilege via dedicated roles.
- **Cost Control**: Use teardown automation and tagging.

## 7. Success Criteria
- Automated pipeline from git push to production deployment.
- HTTPS-accessible custom domain fronting the app via NGINX Ingress.
- All infra reproducible via Terraform.
- Students can repeat full lifecycle end-to-end.
