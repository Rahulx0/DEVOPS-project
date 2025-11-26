# 🚀 Quick Start - Deploy Your Website in 3 Commands

## TL;DR

```bash
# 1. Check status
./scripts/status.sh

# 2. Deploy website via GitHub Actions (15-20 min)
./scripts/start.sh

# 3. Stop when done (10-15 min)
./scripts/stop.sh
```

**New!** Deployment now uses **GitHub Actions** - no need for local Terraform/Docker!

## 💰 Cost Summary

| Status | Cost | When |
|--------|------|------|
| **Running** | ~$4/day | During demos |
| **Stopped** | ~$0.40/month | Between demos |
| **Destroyed** | $0 | Long-term |

## 📋 Prerequisites

### Required (for GitHub Actions deployment)

```bash
# Install GitHub CLI
# Ubuntu/Debian:
sudo apt install gh

# macOS:
brew install gh

# Authenticate
gh auth login
```

### Optional (for local operations)

```bash
# AWS CLI (for stop.sh and status.sh)
aws --version

# kubectl (to get application URL)
kubectl version --client

# Configure AWS credentials
aws configure
```

**Note:** You no longer need Terraform or Docker installed locally! GitHub Actions handles all deployment.

## 🎯 First Time Setup

### Step 1: Check Current Status

```bash
./scripts/status.sh
```

This shows:
- What resources are running
- Current costs
- Application URL (if deployed)

### Step 2: Clean Up (if needed)

If you have old resources:

```bash
./scripts/fix.sh
```

This removes orphaned resources and prepares for fresh deployment.

### Step 3: Deploy Your Website

```bash
./scripts/start.sh
```

**What happens:**
1. ✅ Creates S3 bucket for Terraform state
2. ✅ Provisions VPC with subnets
3. ✅ Creates EKS cluster (1 spot instance)
4. ✅ Builds Docker image
5. ✅ Deploys to Kubernetes
6. ✅ Provides website URL

**Time:** 15-20 minutes ☕

**Output:**
```
✅ Website is LIVE!
🌐 URL: http://a1b2c3d4-123456789.us-west-2.elb.amazonaws.com
💰 Cost: ~$0.18/hour (~$4/day)
⚠️  Remember to run ./scripts/stop.sh when done!
```

### Step 4: Access Your Website

Open the URL in your browser. You should see your e-commerce site!

### Step 5: Stop When Done

```bash
./scripts/stop.sh
```

**Options:**
- Keep S3/DynamoDB: Quick restart (~$0.40/month)
- Delete everything: Slower restart ($0/month)

**Recommendation:** Keep S3/DynamoDB for quick restarts.

## 🔄 Daily Workflow

### For Interviews/Demos

**Morning (1 hour before):**
```bash
./scripts/start.sh
```

**During interview:**
- Show your live website
- Explain architecture
- Discuss cost optimizations

**After interview (immediately!):**
```bash
./scripts/stop.sh
```

### For Development

**Local development (FREE):**
```bash
cd app
npm install
npm run dev
# Open http://localhost:5173
```

**Cloud testing (when needed):**
```bash
./scripts/start.sh
# Test cloud features
./scripts/stop.sh
```

## 📊 Understanding Costs

### Running Costs (per hour)
- EKS Control Plane: $0.10
- t3.small Spot: $0.006
- NAT Gateway: $0.045
- Load Balancer: $0.025
- **Total: $0.18/hour**

### Daily Cost
- $0.18 × 24 = **$4.32/day**

### Monthly Cost (if left running)
- $0.18 × 730 = **$131/month**

### Optimized Monthly Cost
- Deploy 2 hours/day for 5 days: $1.80
- Storage (30 days): $0.40
- **Total: $2.20/month** (98% savings!)

## 🛠️ Available Scripts

| Script | Purpose | Time |
|--------|---------|------|
| `start.sh` | Deploy website | 15-20 min |
| `stop.sh` | Stop website | 10-15 min |
| `status.sh` | Check status | 30 sec |
| `fix.sh` | Clean up issues | 5-10 min |

See `scripts/README.md` for detailed documentation.

## 🚨 Troubleshooting

### Deployment Issues

**Problem:** "AWS credentials not configured"
```bash
aws configure
```

**Problem:** "Docker not running"
```bash
# Start Docker Desktop
```

**Problem:** "Deployment failed midway"
```bash
./scripts/fix.sh
./scripts/start.sh
```

### Access Issues

**Problem:** "Can't access website URL"
```bash
# Wait 2-3 minutes for LoadBalancer
./scripts/status.sh
```

**Problem:** "kubectl can't connect"
```bash
aws eks update-kubeconfig --name urbangear-dev-cluster --region us-west-2
```

### Cost Issues

**Problem:** "Costs higher than expected"
```bash
# Check what's running
./scripts/status.sh

# Stop everything
./scripts/stop.sh
```

**Problem:** "Forgot to stop after demo"
```bash
# Stop immediately
./scripts/stop.sh
```

## 💡 Pro Tips

1. **Set reminders:** Deploy 1 hour before, stop immediately after
2. **Test first:** Practice run the day before important demos
3. **Monitor costs:** Run `status.sh` daily
4. **Use local dev:** Only deploy to AWS when necessary
5. **Keep storage:** Don't delete S3/DynamoDB for quick restarts

## 📚 Next Steps

### Learn More
- **Script Details:** `scripts/README.md`
- **Full Documentation:** `docs/COST-OPTIMIZED-DEPLOYMENT.md`
- **Architecture:** `docs/architecture.md`

### Customize
- Modify Terraform: `infra/terraform/envs/dev/`
- Update app: `app/src/`
- Change Kubernetes config: `manifests/overlays/prod/`

### Automate
- Use GitHub Actions: `.github/workflows/deploy-on-demand.yml`
- Set up scheduled deployments
- Add monitoring and alerts

## ✅ Success Checklist

- [ ] AWS credentials configured
- [ ] Docker installed and running
- [ ] kubectl installed
- [ ] Ran `status.sh` to check current state
- [ ] Ran `fix.sh` to clean up (if needed)
- [ ] Successfully deployed with `start.sh`
- [ ] Accessed website in browser
- [ ] Stopped with `stop.sh` after testing
- [ ] Verified costs are minimal with `status.sh`

## 🎉 You're Ready!

Your cost-optimized DevOps pipeline is ready to use. Deploy when you need it, stop when you don't.

**Start now:**
```bash
./scripts/start.sh
```

**Questions?** Check `scripts/README.md` for detailed help.
