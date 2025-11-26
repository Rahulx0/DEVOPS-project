# 🚀 Deployment Scripts

Simple scripts to deploy and manage your e-commerce website on AWS with minimal cost.

## 📋 Available Scripts

| Script | Purpose | Time | Cost Impact |
|--------|---------|------|-------------|
| `start.sh` | Deploy website | 15-20 min | Starts ~$0.18/hour |
| `stop.sh` | Stop website | 10-15 min | Stops ~$4/day |
| `status.sh` | Check status | 30 sec | No cost |
| `fix.sh` | Clean up issues | 5-10 min | No cost |

## 🎯 Quick Start

### First Time Setup

1. **Check current status:**
   ```bash
   ./scripts/status.sh
   ```

2. **If resources exist, clean them up:**
   ```bash
   ./scripts/fix.sh
   ```

3. **Deploy your website:**
   ```bash
   ./scripts/start.sh
   ```
   ☕ Takes 15-20 minutes. Grab a coffee!

4. **Check your website:**
   ```bash
   ./scripts/status.sh
   ```
   Copy the URL and open in browser.

5. **When done, stop to save money:**
   ```bash
   ./scripts/stop.sh
   ```

## 📖 Detailed Usage

### start.sh - Deploy Website

Deploys your complete e-commerce platform to AWS.

**What it does:**
1. Creates S3 bucket and DynamoDB table for Terraform state
2. Provisions VPC, subnets, NAT gateway
3. Creates EKS cluster with spot instances
4. Builds and pushes Docker image to ECR
5. Deploys application to Kubernetes
6. Provides you with the website URL

**Usage:**
```bash
./scripts/start.sh
```

**Time:** 15-20 minutes

**Cost:** Starts ~$0.18/hour (~$4/day)

**Requirements:**
- AWS credentials configured (`aws configure`)
- Docker running
- kubectl installed

### stop.sh - Stop Website

Destroys all AWS resources to stop costs.

**What it does:**
1. Deletes Kubernetes resources (load balancers)
2. Destroys EKS cluster and nodes
3. Removes VPC and networking
4. Optionally removes S3 bucket and DynamoDB table

**Usage:**
```bash
./scripts/stop.sh
```

**Time:** 10-15 minutes

**Cost Savings:** ~$4/day → ~$0.013/day (99.7% reduction!)

**Options:**
- Keep S3/DynamoDB: ~$0.40/month (allows quick restart)
- Delete everything: $0/month (slower restart)

### status.sh - Check Status

Shows what's currently running and estimated costs.

**What it shows:**
- EKS cluster status
- Number of nodes
- NAT gateways
- Load balancers
- VPC status
- ECR repository
- S3 bucket
- DynamoDB table
- Current hourly/daily/monthly costs
- Application URL (if running)

**Usage:**
```bash
./scripts/status.sh
```

**Time:** 30 seconds

**Example output:**
```
✓ EKS Cluster - RUNNING (~$0.10/hour)
  └─ Nodes: 1 x t3.small spot (~$0.006/hour each)
✓ NAT Gateways: 1 (~$0.045/hour each)
✓ Load Balancers: 1 (~$0.025/hour each)

💰 Cost Estimate:
Hourly:  ~$0.18/hour
Daily:   ~$4.32/day
Monthly: ~$131/month

🌐 Application URL: http://a1b2c3d4-123456789.us-west-2.elb.amazonaws.com
```

### fix.sh - Clean Up Issues

Cleans up orphaned resources and fixes deployment issues.

**When to use:**
- Deployment failed midway
- Resources are stuck
- Can't deploy or destroy
- Bootstrap issues
- Orphaned load balancers

**What it does:**
1. Deletes orphaned Kubernetes resources
2. Removes stuck load balancers
3. Cleans up target groups
4. Optionally removes S3 buckets
5. Optionally removes DynamoDB table
6. Cleans local Terraform state

**Usage:**
```bash
./scripts/fix.sh
```

**Time:** 5-10 minutes

**Safety:** Asks for confirmation before deleting anything

## 💰 Cost Breakdown

### Running (Demo Mode)
- EKS Control Plane: $0.10/hour
- t3.small Spot Instance: ~$0.006/hour
- NAT Gateway: $0.045/hour
- Load Balancer: $0.025/hour
- **Total: ~$0.18/hour = ~$4/day**

### Stopped (Storage Only)
- S3 State Bucket: ~$0.023/month
- DynamoDB Table: ~$0.25/month
- ECR Images: ~$0.10/GB/month
- **Total: ~$0.40/month**

### Completely Destroyed
- **Total: $0/month**

## 🔄 Typical Workflow

### For Interviews/Demos

**1 hour before:**
```bash
./scripts/start.sh
```

**During interview:**
- Show your live website
- Explain the architecture
- Discuss cost optimizations

**Immediately after:**
```bash
./scripts/stop.sh
```
(Choose "no" to keep S3/DynamoDB for quick restart)

### For Development

**Local development (FREE):**
```bash
cd app
npm install
npm run dev
# Open http://localhost:5173
```

**Only deploy to AWS when needed:**
```bash
./scripts/start.sh
# Test cloud features
./scripts/stop.sh
```

## 🚨 Troubleshooting

### "AWS credentials not configured"
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter region: us-west-2
```

### "Deployment failed"
```bash
# Clean up and try again
./scripts/fix.sh
./scripts/start.sh
```

### "Can't destroy resources"
```bash
# Force cleanup
./scripts/fix.sh
# Then try stop again
./scripts/stop.sh
```

### "Terraform state locked"
```bash
# Remove the lock from DynamoDB
aws dynamodb delete-item \
  --table-name urbangear-terraform-locks \
  --key '{"LockID":{"S":"urbangear-terraform-state-XXXXX/envs/dev/terraform.tfstate"}}'
```

### "LoadBalancer not ready"
```bash
# Wait 2-3 minutes, then check again
./scripts/status.sh
```

## 📊 Monitoring Costs

### Check current costs:
```bash
./scripts/status.sh
```

### AWS Cost Explorer:
1. Go to AWS Console → Cost Explorer
2. Filter by tag: `Project=urbangear-ecommerce`
3. View daily costs

### Set up billing alerts:
1. AWS Console → Billing → Budgets
2. Create budget: $10/month
3. Set alert at 80% ($8)

## 🎓 Best Practices

### ✅ DO:
- Run `status.sh` before and after deployments
- Deploy 1 hour before interviews
- Stop immediately after demos
- Keep S3/DynamoDB for quick restarts
- Set calendar reminders to stop
- Check costs weekly

### ❌ DON'T:
- Leave resources running overnight
- Forget to stop after demos
- Deploy for local development
- Delete S3/DynamoDB unless necessary
- Ignore cost alerts

## 🔐 Security Notes

- Scripts use your AWS credentials from `~/.aws/credentials`
- No credentials are stored in scripts
- All resources are tagged with `Project=urbangear-ecommerce`
- S3 buckets have encryption enabled
- Public access is blocked on all S3 buckets

## 📚 Additional Resources

- **Full Documentation:** `../docs/COST-OPTIMIZED-DEPLOYMENT.md`
- **Quick Start:** `../QUICK-START.md`
- **Architecture:** `../docs/architecture.md`
- **GitHub Actions:** `../.github/workflows/deploy-on-demand.yml`

## 🆘 Need Help?

1. Check script output for error messages
2. Run `./scripts/status.sh` to see current state
3. Try `./scripts/fix.sh` to clean up issues
4. Check AWS Console for resource status
5. Review logs: `kubectl logs -l app=urbangear-frontend`

## 💡 Pro Tips

1. **Save time:** Keep S3/DynamoDB between demos
2. **Save money:** Set phone reminder to stop after demos
3. **Test first:** Do a practice run before important demos
4. **Monitor costs:** Check `status.sh` daily
5. **Use local dev:** Only deploy to AWS when necessary

---

**Ready to deploy?** Run `./scripts/start.sh` and grab a coffee! ☕
