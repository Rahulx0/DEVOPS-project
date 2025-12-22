# Terraform Infrastructure

This folder hosts Terraform configuration for provisioning AWS resources for the UrbanGear e-commerce platform.

## Structure
- `modules/` – reusable Terraform modules (backend, vpc, eks, ecr, route53, acm)
- `envs/` – environment-specific configurations
  - `bootstrap/` – creates S3 backend and DynamoDB table for state management
  - `dev/` – development environment infrastructure
  - `prod/` – production environment infrastructure (coming soon)

## Getting Started

### 1. Bootstrap Backend
First, create the remote state backend:

```bash
cd envs/bootstrap
terraform init
terraform plan
terraform apply
```

### 2. Configure Development Environment
After bootstrap, update `envs/dev/main.tf` with the backend configuration from bootstrap outputs, then:

```bash
cd ../dev
terraform init
terraform plan
terraform apply
```

## Next Modules to Add
- VPC and networking (subnets, security groups, NAT gateway)
- EKS cluster and node groups
- ECR repository for container images
- Route53 hosted zone and ACM certificates
- ArgoCD installation and configuration
