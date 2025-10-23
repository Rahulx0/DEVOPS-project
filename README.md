# UrbanGear Platform

Monorepo for the UrbanGear e-commerce training project. The goal is to evolve the existing Vite + React storefront into a production-ready deployment backed by Terraform, Kubernetes, GitHub Actions, and ArgoCD.

## Repository Layout
- `app/` – frontend application (Vite + React)
- `infra/terraform/` – Terraform modules and environment definitions for AWS
- `manifests/` – Kubernetes manifests and Kustomize overlays
- `ci/` – GitHub Actions workflows and shared assets
- `docs/` – architecture notes, workflow plan, and runbooks

## Getting Started
1. Install prerequisites: Node.js 20+, Docker, Terraform, AWS CLI.
2. Start the frontend locally:
   ```fish
   cd app
   npm install
   npm run dev
   ```
3. Build and run the container locally:
   ```fish
   cd ..
   docker compose up --build
   ```
   The production image serves on `http://localhost:8080`.
4. Follow the staged roadmap in `docs/workflow-plan.md` for the infrastructure and CI/CD rollout.

## Status
- ✅ Frontend relocated under `app/`
- ✅ Docker baseline (multi-stage build + compose)
- ✅ Docker containerization tested and working
- ✅ Terraform backend modules and bootstrap configuration
- ✅ Architecture documentation
- ✅ Terraform backend successfully bootstrapped in AWS
- ✅ Dev environment configured with remote state
- ✅ VPC and networking infrastructure deployed
- 🚧 Next: EKS cluster and ECR repository modules

Document major decisions in `docs/` before introducing infrastructure or automation changes.

## DevOps workflow (current)

Below is a high-level diagram of the end-to-end pipeline we've built so far and the current status of each component.

```mermaid
flowchart LR
   LocalDev[Local Dev (Vite + React)] -->|git push| GitHub[GitHub]
   GitHub -->|CI build| GitHubActions[GitHub Actions CI]
   GitHubActions -->|build & push| ECR[AWS ECR]
   ECR -->|images| ArgoCD[ArgoCD (planned)]
   ArgoCD -->|deploy| EKS[AWS EKS]
   EKS -->|runs| Kubernetes[Application (manifests/kustomize)]
   EKS -->|networking| VPC[AWS VPC]
   Terraform[Terraform] -. provisions .-> VPC
   Terraform -. provisions .-> EKS
   Terraform -. provisions .-> ECR
   note right of GitHubActions: CI: build image, run tests, push to ECR
   note right of ArgoCD: (not installed yet) GitOps CD to watch manifests repo
```

### Per-tool status
- GitHub: ⬜ Repository not connected yet — local project only
- GitHub Actions: ⬜ CI workflow files created (in `.github/workflows`) but not pushed/tested — needs GitHub repo connection
- Docker: ✅ Multi-stage Dockerfile + `docker-compose` set up under `app/`
- AWS ECR: ✅ Repository created (`urbangear-dev-frontend`) — images can be pushed
- Terraform: ✅ Backend bootstrapped (S3 + DynamoDB), modules for VPC/EKS/ECR present; apply started (EKS was interrupted, re-apply required)
- AWS VPC: ✅ Network infrastructure deployed and healthy
- AWS EKS: 🚧 Cluster creation in progress / interrupted — needs resume (`terraform apply` in `infra/terraform/envs/dev`)
- Kubernetes manifests: ✅ Base manifests and `kustomize` overlays created (`manifests/`) and updated with ECR image URL
- ArgoCD: ⬜ Not installed / planned

### Notes and artifacts
- ECR repository URL (example): `484907531725.dkr.ecr.us-west-2.amazonaws.com/urbangear-dev-frontend`
- Kubernetes manifests updated to reference the ECR repository (see `manifests/base/deployment.yaml`)
- Terraform state: remote backend stored in the configured S3 bucket (see `infra/terraform/backend/`)

### Next steps (short-term)
1. Resume EKS cluster creation and finish Terraform apply in `infra/terraform/envs/dev` (this will create the cluster endpoint and node groups).
2. Configure `kubectl` locally (`aws eks update-kubeconfig`) once EKS is ready.
3. Build and push a test image to ECR (or let GitHub Actions do this) and verify pods pull the image.
4. Deploy manifests to the cluster for a smoke test.
5. Install ArgoCD and wire it to the `manifests/` directory for GitOps-based continuous deployment.

If you'd like, I can (a) re-run `terraform apply` to finish EKS, (b) build & push a local test image to ECR, and (c) create a short ArgoCD installation playbook.

