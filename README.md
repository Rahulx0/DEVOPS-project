# E-Commerce DevOps Project - Simple Guide

## 🎯 Two Commands. That's It.

### Start Website (15-20 minutes)
```bash
./scripts/start.sh
```

This will:
- Create AWS infrastructure (VPC, EKS, ECR)
- Build and deploy your e-commerce application
- Give you a live URL

**Cost while running:** ~$4/day

### Stop Website (10-15 minutes)
```bash
./scripts/stop.sh
```

This will:
- Destroy all AWS resources
- Stop all costs
- Optionally keep S3 bucket for quick restart

**Cost when stopped:** $0 (or $0.40/month if keeping S3)

## 💰 Cost Breakdown

| Status | Cost | When |
|--------|------|------|
| Running | ~$4/day | During demos/interviews |
| Stopped | $0-0.40/month | Between demos |

## 📋 Prerequisites

```bash
# Install AWS CLI
# Install Docker
# Install kubectl
# Install Terraform

# Configure AWS
aws configure
```

## 🚀 Quick Start

### First Time
```bash
# 1. Clone repo
git clone <your-repo>
cd urbangear-e-commerce

# 2. Start website
./scripts/start.sh

# 3. Wait 15-20 minutes ☕

# 4. Open the URL provided

# 5. When done, stop it
./scripts/stop.sh
```

### For Interviews
```bash
# 1 hour before interview
./scripts/start.sh

# Show your live site during interview

# Immediately after interview
./scripts/stop.sh
```

## 🎤 Interview Talking Points

"I built an end-to-end DevOps pipeline with:"
- Infrastructure as Code (Terraform)
- Container orchestration (Kubernetes on EKS)
- CI/CD automation (GitHub Actions)
- Cost optimization (93% reduction using spot instances)
- Two-command deployment and teardown

## 📁 Project Structure

```
.
├── app/                    # React e-commerce application
├── infra/terraform/        # Infrastructure as Code
│   ├── modules/           # Reusable Terraform modules
│   └── envs/              # Environment configs
├── manifests/             # Kubernetes manifests
├── scripts/
│   ├── start.sh          # 🚀 Start everything
│   └── stop.sh           # 🛑 Stop everything
└── .github/workflows/     # CI/CD pipelines
```

## 🔧 What Gets Created

### When You Run `start.sh`:
- **VPC** with public/private subnets
- **EKS Cluster** with spot instances (t3.small)
- **ECR Repository** for Docker images
- **NAT Gateway** for private subnet internet access
- **Load Balancer** for application access
- **S3 Bucket** for Terraform state
- **DynamoDB Table** for state locking

### When You Run `stop.sh`:
Everything above gets destroyed (except optionally S3/DynamoDB)

## ⚠️ Important

- **Always run `stop.sh` after demos** - Set a phone reminder!
- **Deploy 1 hour before interviews** - Gives time for provisioning
- **Test locally first** - Run `cd app && npm run dev`
- **Check AWS billing** - Monitor your costs weekly

## 🐛 Troubleshooting

### "AWS credentials not configured"
```bash
aws configure
```

### "Permission denied"
```bash
chmod +x scripts/*.sh
```

### "Deployment taking too long"
- EKS cluster: 10-15 minutes (normal)
- Node provisioning: 3-5 minutes (normal)
- Total: 15-20 minutes is expected

### "Can't access URL"
```bash
# Check if LoadBalancer is ready
kubectl get svc urbangear-frontend

# If pending, wait 2-3 more minutes
```

### "Stop script fails"
```bash
# Manually delete load balancers first
kubectl delete svc urbangear-frontend

# Wait 30 seconds, then retry
./scripts/stop.sh
```

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│              AWS Cloud                   │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  VPC (10.0.0.0/16)                 │ │
│  │                                     │ │
│  │  ┌──────────┐    ┌──────────┐     │ │
│  │  │ Public   │    │ Public   │     │ │
│  │  │ Subnet   │    │ Subnet   │     │ │
│  │  └────┬─────┘    └────┬─────┘     │ │
│  │       │               │            │ │
│  │       └───────┬───────┘            │ │
│  │               │                    │ │
│  │         ┌─────▼─────┐              │ │
│  │         │ NAT GW    │              │ │
│  │         └─────┬─────┘              │ │
│  │               │                    │ │
│  │  ┌────────────▼──────────────┐    │ │
│  │  │ Private Subnets           │    │ │
│  │  │                           │    │ │
│  │  │  ┌──────────────────┐    │    │ │
│  │  │  │ EKS Cluster      │    │    │ │
│  │  │  │ - 1 t3.small     │    │    │ │
│  │  │  │ - Spot instance  │    │    │ │
│  │  │  └──────────────────┘    │    │ │
│  │  └───────────────────────────┘    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌──────┐  ┌──────┐  ┌──────────┐      │
│  │ ECR  │  │  S3  │  │ DynamoDB │      │
│  └──────┘  └──────┘  └──────────┘      │
└─────────────────────────────────────────┘
```

## 🎓 Key Optimizations

1. **Spot Instances** - 70% cheaper than on-demand
2. **t3.small** - 50% cheaper than t3.medium
3. **Single NAT Gateway** - 50% savings
4. **On-demand deployment** - Only pay when running

## 📚 Full Documentation

For detailed information, see:
- `docs/architecture.md` - System architecture
- `docs/COST-OPTIMIZED-DEPLOYMENT.md` - Cost details
- `.github/workflows/` - CI/CD pipelines

## 🤝 Contributing

This is a portfolio/learning project. Feel free to fork and customize!

## 📄 License

MIT License

---

**Remember:** Two commands. `start.sh` and `stop.sh`. That's all you need! 🚀
