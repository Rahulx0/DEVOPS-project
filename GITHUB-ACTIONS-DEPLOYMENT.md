# 🚀 GitHub Actions Deployment Guide

## Overview

Your deployment now works through **GitHub Actions workflows** instead of running Terraform locally. This gives you:

- ✅ Centralized deployment logs
- ✅ No need for local Terraform/Docker
- ✅ Consistent environment
- ✅ Easy monitoring and rollback
- ✅ Deployment history

## Prerequisites

### 1. Install GitHub CLI

```bash
# Ubuntu/Debian
sudo apt install gh

# macOS
brew install gh

# Or download from: https://cli.github.com/
```

### 2. Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts to authenticate.

### 3. Configure AWS Secrets

Your repository needs these secrets configured:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add these secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (optional, defaults to us-west-2)

## 🎯 Quick Start

### Deploy Website

```bash
./scripts/start.sh
```

**What it does:**
1. Checks prerequisites (gh CLI, authentication)
2. Commits and pushes any changes (optional)
3. Triggers GitHub Actions workflow
4. Monitors deployment progress with live updates
5. Shows application URL when ready

**Time:** 15-20 minutes

### Stop Website

```bash
./scripts/stop.sh
```

**What it does:**
1. Destroys infrastructure locally using Terraform
2. Cleans up all AWS resources
3. Optionally removes S3/DynamoDB

**Time:** 10-15 minutes

## 📖 Detailed Usage

### start.sh - Deploy via GitHub Actions

```bash
cd scripts
bash start.sh
```

**Interactive prompts:**
- Commit uncommitted changes? (yes/no)
- Commit message (if yes)

**Output:**
```
========================================
🚀 Starting Website Deployment
========================================

✓ GitHub CLI installed and authenticated

Repository: your-username/urbangear-e-commerce
Branch: main

========================================
🎬 Triggering Deployment Workflow
========================================

✓ Workflow triggered!
✓ Workflow started (Run ID: 123456789)

========================================
📊 Monitoring Deployment Progress
========================================

This will take approximately 15-20 minutes...

[Live workflow progress shown here]

========================================
✅ Deployment Successful!
========================================

🌐 Application URL: http://a1b2c3d4-123456789.us-west-2.elb.amazonaws.com

💰 Current cost: ~$0.18/hour (~$4/day)

⚠️  Remember to stop when done:
   ./scripts/stop.sh
```

### Monitoring Deployment

The script automatically monitors the workflow, but you can also:

**View workflow runs:**
```bash
gh run list --workflow=deploy-on-demand.yml
```

**Watch a specific run:**
```bash
gh run watch <run-id>
```

**View run details:**
```bash
gh run view <run-id>
```

**View logs:**
```bash
gh run view <run-id> --log
```

### Manual Workflow Trigger

You can also trigger workflows manually:

**Via GitHub CLI:**
```bash
gh workflow run deploy-on-demand.yml -f action=deploy
```

**Via GitHub Web UI:**
1. Go to Actions tab
2. Select "Deploy On-Demand"
3. Click "Run workflow"
4. Choose action: deploy
5. Click "Run workflow"

## 🔄 Workflow Actions

### deploy
Deploys complete infrastructure and application

**Steps:**
1. Bootstrap (S3 + DynamoDB)
2. Deploy infrastructure (VPC, EKS, ECR)
3. Build and push Docker image
4. Deploy to Kubernetes
5. Output application URL

### teardown
Removes infrastructure but keeps storage

**Steps:**
1. Clean Kubernetes resources
2. Destroy EKS cluster
3. Remove VPC and networking
4. Keep S3 bucket and DynamoDB

### destroy-all
Complete cleanup including storage

**Steps:**
1. Clean Kubernetes resources
2. Destroy infrastructure
3. Remove S3 bucket
4. Remove DynamoDB table

## 💰 Cost Management

### Check Current Costs

```bash
./scripts/status.sh
```

### Cost Breakdown

**Running (via GitHub Actions):**
- EKS Control Plane: $0.10/hour
- t3.small Spot: ~$0.006/hour
- NAT Gateway: $0.045/hour
- Load Balancer: $0.025/hour
- **Total: ~$0.18/hour = ~$4/day**

**Stopped (storage only):**
- S3 Bucket: ~$0.023/month
- DynamoDB: ~$0.25/month
- ECR Images: ~$0.10/GB/month
- **Total: ~$0.40/month**

## 🎬 Typical Workflow

### For Interviews/Demos

**1 hour before:**
```bash
./scripts/start.sh
```

**During interview:**
- Show live website
- Explain GitHub Actions CI/CD
- Discuss infrastructure as code

**After interview:**
```bash
./scripts/stop.sh
```

### For Development

**Local development:**
```bash
cd app
npm run dev
# Open http://localhost:5173
```

**Deploy to cloud:**
```bash
./scripts/start.sh
# Test cloud features
./scripts/stop.sh
```

## 🚨 Troubleshooting

### "gh: command not found"

Install GitHub CLI:
```bash
# Ubuntu/Debian
sudo apt install gh

# macOS
brew install gh
```

### "Not authenticated with GitHub"

```bash
gh auth login
```

### "Workflow failed"

View error details:
```bash
gh run list --workflow=deploy-on-demand.yml
gh run view <run-id> --log
```

Common issues:
- AWS credentials not configured in GitHub Secrets
- Insufficient AWS permissions
- Resource limits reached

### "Can't find workflow run"

Wait a few seconds and try:
```bash
gh run list --workflow=deploy-on-demand.yml
```

### "LoadBalancer not ready"

Wait 2-3 minutes, then:
```bash
kubectl get svc urbangear-frontend
```

## 📊 Monitoring

### View All Workflow Runs

```bash
gh run list --workflow=deploy-on-demand.yml --limit 10
```

### View Specific Run

```bash
gh run view <run-id>
```

### Download Logs

```bash
gh run download <run-id>
```

### Cancel Running Workflow

```bash
gh run cancel <run-id>
```

### Re-run Failed Workflow

```bash
gh run rerun <run-id>
```

## 🔐 Security

### GitHub Secrets

Never commit AWS credentials to your repository. Always use GitHub Secrets:

1. Repository Settings → Secrets and variables → Actions
2. Add secrets (never visible after creation)
3. Reference in workflows: `${{ secrets.AWS_ACCESS_KEY_ID }}`

### Best Practices

- ✅ Use IAM roles with minimal permissions
- ✅ Rotate AWS credentials regularly
- ✅ Enable MFA on AWS account
- ✅ Review workflow logs for sensitive data
- ✅ Use environment protection rules

## 📈 Advantages of GitHub Actions

### vs Local Deployment

| Aspect | Local | GitHub Actions |
|--------|-------|----------------|
| Setup | Terraform, Docker, kubectl | Just gh CLI |
| Consistency | Depends on local env | Always same |
| Logs | Terminal only | Persistent, searchable |
| History | None | Full deployment history |
| Rollback | Manual | Easy re-run |
| Team | Individual | Shared visibility |

### Benefits

1. **No Local Dependencies**: Don't need Terraform, Docker, or kubectl locally
2. **Consistent Environment**: Same setup every time
3. **Audit Trail**: Complete deployment history
4. **Easy Rollback**: Re-run previous successful deployment
5. **Team Collaboration**: Everyone can see deployment status
6. **Centralized Logs**: All logs in one place

## 🎓 Learning Resources

### GitHub CLI

- Documentation: https://cli.github.com/manual/
- Workflow commands: `gh workflow --help`
- Run commands: `gh run --help`

### GitHub Actions

- Documentation: https://docs.github.com/en/actions
- Workflow syntax: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions
- Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets

## 💡 Pro Tips

1. **Save Run IDs**: Keep track of successful deployments
2. **Use Branches**: Test on feature branches before main
3. **Monitor Costs**: Check `./scripts/status.sh` daily
4. **Set Reminders**: Don't forget to teardown after demos
5. **Review Logs**: Check workflow logs for optimization opportunities

## 🆘 Need Help?

### Quick Commands

```bash
# Check status
./scripts/status.sh

# View recent workflows
gh run list --workflow=deploy-on-demand.yml

# Get help
gh workflow --help
gh run --help
```

### Common Commands

```bash
# Deploy
./scripts/start.sh

# Stop
./scripts/stop.sh

# Check status
./scripts/status.sh

# View workflows
gh run list

# Watch deployment
gh run watch <run-id>
```

---

**Ready to deploy?** Run `./scripts/start.sh` and let GitHub Actions handle everything! 🚀
