# UrbanGear Deployment Scripts

Simple scripts to manage your e-commerce application deployment on AWS.

## 🚀 Scripts

### `start.sh` - Deploy & Start Website
Deploys the application and provides the live external URL.

```bash
./scripts/start.sh
```

**What it does:**
- Creates AWS infrastructure (EKS, VPC, ECR) if not exists
- Creates a fake git commit to trigger CI/CD workflow
- Builds and deploys the application
- Provides the external URL where your website is live

**Output:** External URL like `http://a957fffba63a0404da30cee457d1b2ac-1445347431.us-east-1.elb.amazonaws.com`

### `stop.sh` - Stop Website & Destroy Resources
Destroys all AWS resources to stop costs.

```bash
./scripts/stop.sh
```

**What it does:**
- Confirms destruction with user
- Destroys all AWS resources (EKS, VPC, Load Balancers, etc.)
- Stops all costs
- Website becomes inaccessible

## 💰 Cost Optimization

- **Running**: Single t3.small spot instance (~$0.01/hour)
- **Stopped**: $0/hour (all resources destroyed)

## 🔄 Typical Workflow

1. **Start development:**
   ```bash
   ./scripts/start.sh
   ```
   
2. **Work on your application** - Access via the provided external URL

3. **Stop when done:**
   ```bash
   ./scripts/stop.sh
   ```

## ⏱️ Timing

- **Start**: ~15-20 minutes (first time), ~3-5 minutes (subsequent)
- **Stop**: ~10-15 minutes

## 📋 Prerequisites

- AWS CLI configured
- kubectl installed
- Terraform installed
- GitHub CLI (gh) installed
- Git repository with GitHub Actions configured