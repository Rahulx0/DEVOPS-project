# Cost-Optimized On-Demand Deployment Guide

This guide explains how to deploy your e-commerce application on AWS with **minimal costs** using on-demand deployment and teardown scripts.

## 💰 Cost Breakdown

### When Running (Demo Mode)
| Resource | Cost | Notes |
|----------|------|-------|
| EKS Control Plane | $0.10/hour | ~$2.40/day |
| t3.small Spot Instance | ~$0.006/hour | 70% cheaper than on-demand |
| NAT Gateway | $0.045/hour | ~$1.08/day |
| Load Balancer | $0.025/hour | ~$0.60/day |
| **Total Running** | **~$0.18/hour** | **~$4.32/day** |

### When Stopped (Storage Only)
| Resource | Cost | Notes |
|----------|------|-------|
| S3 State Bucket | $0.023/month | Minimal storage |
| DynamoDB Table | $0.25/month | On-demand pricing |
| ECR Images | $0.10/GB/month | ~1-2 GB typical |
| **Total Stopped** | **~$0.40/month** | **~$0.013/day** |

### Cost Savings
- **Running 24/7**: ~$130/month
- **On-demand (2 hours/day)**: ~$8.64/month + $0.40 = **~$9/month**
- **Savings**: **93% cost reduction!**

## 🚀 Quick Start

### Prerequisites
1. AWS Account with credentials configured
2. AWS CLI installed and configured
3. Docker installed
4. kubectl installed
5. Terraform installed (v1.13+)

### Option 1: Using Scripts (Recommended)

#### Deploy for Demo
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy everything
./scripts/deploy-on-demand.sh
```

This will:
1. ✅ Create S3 bucket and DynamoDB table (if needed)
2. ✅ Provision VPC, subnets, NAT gateway
3. ✅ Create EKS cluster with spot instances
4. ✅ Build and push Docker image to ECR
5. ✅ Deploy application to Kubernetes
6. ✅ Provide you with the application URL

**Time**: ~15-20 minutes

#### Teardown After Demo
```bash
# Destroy expensive resources, keep storage
./scripts/teardown-demo.sh
```

This will:
1. ✅ Delete Kubernetes resources
2. ✅ Destroy EKS cluster
3. ✅ Remove NAT gateways and load balancers
4. ✅ Keep S3 bucket and ECR images for quick re-deployment

**Time**: ~10-15 minutes

#### Destroy Everything
```bash
# Complete cleanup (including state storage)
./scripts/destroy-all-resources.sh
```

### Option 2: Using GitHub Actions

#### Setup
1. Add AWS credentials to GitHub Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (optional, defaults to us-west-2)

#### Deploy
1. Go to **Actions** tab in GitHub
2. Select **Deploy On-Demand** workflow
3. Click **Run workflow**
4. Choose action: **deploy**
5. Wait ~15-20 minutes
6. Check workflow summary for application URL

#### Teardown
1. Go to **Actions** tab
2. Select **Deploy On-Demand** workflow
3. Click **Run workflow**
4. Choose action: **teardown**
5. Wait ~10-15 minutes

#### Destroy All
1. Go to **Actions** tab
2. Select **Deploy On-Demand** workflow
3. Click **Run workflow**
4. Choose action: **destroy-all**
5. Confirm in production environment
6. Wait ~15 minutes

## 🏗️ Architecture

### Cost Optimizations Applied

1. **Spot Instances**: 70% cheaper than on-demand
   - Uses `t3.small` spot instances
   - Suitable for dev/demo environments
   - Automatic replacement if terminated

2. **Single NAT Gateway**: 50% savings
   - One NAT gateway instead of two
   - Sufficient for demo traffic
   - Still provides high availability

3. **Minimal Node Count**: 
   - 1 node (can scale to 2 if needed)
   - Reduces compute costs significantly

4. **Smaller Instance Type**:
   - `t3.small` (2 vCPU, 2GB RAM) instead of `t3.medium`
   - 50% cost reduction
   - Adequate for demo workloads

5. **Disabled ECR Scanning**:
   - Saves scanning costs
   - Can enable for production

6. **Image Retention**:
   - Keep only 5 recent images
   - Reduces storage costs

## 📋 Manual Deployment Steps

If you prefer manual control:

### 1. Bootstrap
```bash
cd infra/terraform/envs/bootstrap
terraform init
terraform apply
```

### 2. Deploy Infrastructure
```bash
cd ../dev
terraform init
terraform plan
terraform apply
```

### 3. Configure kubectl
```bash
aws eks update-kubeconfig --name urbangear-dev-cluster --region us-west-2
```

### 4. Build and Push Image
```bash
cd app
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $(terraform -chdir=../infra/terraform/envs/dev output -raw ecr_repository_url)

docker build -t urbangear:latest --target prod .
docker tag urbangear:latest $(terraform -chdir=../infra/terraform/envs/dev output -raw ecr_repository_url):latest
docker push $(terraform -chdir=../infra/terraform/envs/dev output -raw ecr_repository_url):latest
```

### 5. Deploy to Kubernetes
```bash
cd ../manifests/overlays/prod
kubectl apply -k .
```

### 6. Get Application URL
```bash
kubectl get svc urbangear-frontend
```

## 🔍 Monitoring Costs

### AWS Cost Explorer
1. Go to AWS Console → Cost Explorer
2. Filter by tag: `Project=urbangear-ecommerce`
3. View daily costs

### CLI Command
```bash
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics BlendedCost \
  --filter file://cost-filter.json
```

## 🛡️ Best Practices

### For Demo/Interview
1. **Deploy 1 hour before**: Ensure everything is running
2. **Test the URL**: Verify application is accessible
3. **Teardown immediately after**: Don't forget!
4. **Set calendar reminder**: To avoid overnight costs

### For Development
1. **Use local development**: Run `npm run dev` locally
2. **Deploy only for testing**: Use cloud only when needed
3. **Automate teardown**: Set up scheduled GitHub Actions

### For Production
1. **Use on-demand instances**: Not spot
2. **Enable auto-scaling**: Based on traffic
3. **Use multiple NAT gateways**: For high availability
4. **Enable ECR scanning**: For security
5. **Set up monitoring**: CloudWatch, Prometheus

## 🚨 Troubleshooting

### Deployment Fails
```bash
# Check Terraform state
cd infra/terraform/envs/dev
terraform state list

# Check EKS cluster
aws eks describe-cluster --name urbangear-dev-cluster --region us-west-2

# Check nodes
kubectl get nodes
```

### Application Not Accessible
```bash
# Check pods
kubectl get pods

# Check service
kubectl get svc urbangear-frontend

# Check logs
kubectl logs -l app=urbangear-frontend
```

### Teardown Fails
```bash
# Manually delete load balancers
aws elbv2 describe-load-balancers --region us-west-2
aws elbv2 delete-load-balancer --load-balancer-arn <arn>

# Force destroy
cd infra/terraform/envs/dev
terraform destroy -auto-approve
```

## 📊 Comparison: Traditional vs On-Demand

| Aspect | Traditional 24/7 | On-Demand |
|--------|------------------|-----------|
| Monthly Cost | ~$130 | ~$9 |
| Deployment Time | Always ready | 15-20 min |
| Teardown Time | N/A | 10-15 min |
| Best For | Production | Demo/Dev |
| Savings | 0% | 93% |

## 🎯 Use Cases

### Perfect For:
- ✅ Portfolio demos
- ✅ Interview presentations
- ✅ Client demonstrations
- ✅ Development testing
- ✅ Learning DevOps

### Not Recommended For:
- ❌ Production workloads
- ❌ 24/7 availability requirements
- ❌ High-traffic applications
- ❌ Mission-critical systems

## 📚 Additional Resources

- [AWS EKS Pricing](https://aws.amazon.com/eks/pricing/)
- [EC2 Spot Instances](https://aws.amazon.com/ec2/spot/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

## 🤝 Contributing

Found ways to reduce costs further? Submit a PR!

## 📝 License

MIT License - See LICENSE file for details
