# GitHub Actions CI/CD Setup Guide

This guide explains how to configure GitHub Actions secrets and enable the CI/CD pipeline for the UrbanGear platform.

## 📋 Prerequisites

Before setting up GitHub Actions, ensure you have:
- ✅ GitHub repository created and code pushed
- ✅ AWS account with appropriate permissions
- ✅ AWS ECR repository created (`urbangear-dev-frontend`)
- ✅ AWS EKS cluster deployed (or in progress)
- ✅ AWS IAM user with programmatic access

---

## 🔑 Step 1: Create AWS IAM User for GitHub Actions

### 1.1 Create IAM User
```bash
# Create a dedicated IAM user for GitHub Actions
aws iam create-user --user-name github-actions-urbangear
```

### 1.2 Create IAM Policy

Create a file named `github-actions-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster",
        "eks:ListClusters"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

Apply the policy:
```bash
# Create the policy
aws iam create-policy \
  --policy-name GitHubActionsUrbanGearPolicy \
  --policy-document file://github-actions-policy.json

# Attach the policy to the user
aws iam attach-user-policy \
  --user-name github-actions-urbangear \
  --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/GitHubActionsUrbanGearPolicy
```

### 1.3 Create Access Keys
```bash
# Create access keys for the user
aws iam create-access-key --user-name github-actions-urbangear
```

**Important**: Save the output! You'll need:
- `AccessKeyId`
- `SecretAccessKey`

---

## 🔐 Step 2: Add Secrets to GitHub Repository

### 2.1 Navigate to Repository Settings
1. Go to your GitHub repository: `https://github.com/Rahulx0/DEVOPS-project`
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### 2.2 Add Required Secrets

Add the following secrets one by one:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS access key from Step 1.3 | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key from Step 1.3 | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region where resources are deployed | `us-west-2` |
| `ECR_REPOSITORY` | ECR repository name | `urbangear-dev-frontend` |
| `EKS_CLUSTER_NAME` | EKS cluster name | `urbangear-dev-cluster` |

**Note**: Secret names must use underscores, not hyphens (e.g., `ECR_REPOSITORY`, not `ECR-REPOSITORY`).

### 2.3 Verify Secrets
After adding all secrets, you should see them listed (values will be hidden for security).

---

## 🚀 Step 3: Test the CI/CD Pipeline

### 3.1 Trigger a Build

The pipeline will automatically trigger when you:
- Push code to `main` or `rahul` branch
- Create a pull request to `main` or `rahul` branch

To manually trigger a build:
```bash
# Make a small change
echo "# CI/CD Pipeline Active" >> docs/github-actions-setup.md

# Commit and push
git add docs/github-actions-setup.md
git commit -m "test: Trigger CI/CD pipeline"
git push origin rahul
```

### 3.2 Monitor the Workflow

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You should see a new workflow run starting
4. Click on the workflow to see detailed logs

### 3.3 Workflow Stages

The pipeline has 4 parallel jobs:

#### 🧪 Test Job
- Checks out code
- Sets up Node.js 20
- Installs dependencies
- Runs build
- Runs linter

#### 🔒 Security Scan Job
- Runs Trivy vulnerability scanner
- Scans for security issues in code and dependencies
- Uploads results to GitHub Security tab

#### 🏗️ Build Job
- Builds Docker image from `app/` directory
- Tags image with commit SHA and `latest`
- Pushes to AWS ECR
- Updates deployment manifest
- Uploads manifest as artifact

#### 🚢 Deploy Job (only on push to main/rahul)
- Downloads the updated manifest
- Configures kubectl for EKS
- Applies Kubernetes manifests
- Verifies deployment rollout

---

## 🔍 Step 4: Verify Deployment

### 4.1 Check ECR for Images
```bash
# List images in ECR
aws ecr describe-images \
  --repository-name urbangear-dev-frontend \
  --region us-west-2
```

### 4.2 Check Kubernetes Deployment
```bash
# Configure kubectl (if not already done)
aws eks update-kubeconfig \
  --name urbangear-dev-cluster \
  --region us-west-2

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# Check deployment details
kubectl describe deployment urbangear-frontend
```

### 4.3 Get Application URL
```bash
# Get the load balancer URL
kubectl get ingress

# Or get the service endpoint
kubectl get svc urbangear-frontend-service
```

---

## 🐛 Troubleshooting

### Issue: Workflow fails at ECR push
**Solution**: Verify AWS credentials and ECR repository exists
```bash
# Test AWS credentials
aws sts get-caller-identity

# Check ECR repository
aws ecr describe-repositories --repository-names urbangear-dev-frontend
```

### Issue: Workflow fails at EKS deployment
**Solution**: Ensure EKS cluster is fully deployed
```bash
# Check EKS cluster status
aws eks describe-cluster --name urbangear-dev-cluster --query 'cluster.status'
```

### Issue: "Repository not found" error
**Solution**: Verify ECR repository name matches in workflow
```bash
# List all ECR repositories
aws ecr describe-repositories
```

### Issue: Permission denied errors
**Solution**: Verify IAM policy has all required permissions
```bash
# Test ECR permissions
aws ecr get-authorization-token

# Test EKS permissions
aws eks list-clusters
```

---

## 📊 Monitoring CI/CD Pipeline

### View Workflow Runs
- GitHub Actions tab shows all workflow runs
- Green checkmark = success
- Red X = failure
- Yellow dot = in progress

### Workflow Notifications
Enable notifications:
1. Go to repository **Settings** → **Notifications**
2. Enable email/Slack notifications for failed workflows

### Security Scanning Results
View security scan results:
1. Go to **Security** tab
2. Click **Code scanning alerts**
3. Review any vulnerabilities found by Trivy

---

## 🔄 Updating the Pipeline

### Modify Workflow
Edit `.github/workflows/build-and-deploy.yml` to:
- Change trigger branches
- Add new jobs
- Modify deployment steps
- Add more tests

### Add Environment Variables
Update `env:` section in workflow file:
```yaml
env:
  AWS_REGION: us-west-2
  ECR_REPOSITORY: urbangear-dev-frontend
  EKS_CLUSTER_NAME: urbangear-dev-cluster
  KUBE_NAMESPACE: default
  # Add more here
```

---

## ✅ Checklist

- [ ] AWS IAM user created for GitHub Actions
- [ ] IAM policy attached with ECR and EKS permissions
- [ ] Access keys generated and saved securely
- [ ] All GitHub secrets added to repository
- [ ] Workflow file updated for correct branch (`rahul`)
- [ ] Test commit pushed to trigger pipeline
- [ ] Workflow run completed successfully
- [ ] Docker image visible in ECR
- [ ] Application deployed to EKS
- [ ] Application accessible via load balancer

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS ECR User Guide](https://docs.aws.amazon.com/ecr/)
- [AWS EKS User Guide](https://docs.aws.amazon.com/eks/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

## 🎯 Next Steps

After CI/CD is working:
1. Set up ArgoCD for GitOps deployment
2. Add Prometheus + Grafana for monitoring
3. Configure horizontal pod autoscaling
4. Set up automated testing in pipeline
5. Implement blue-green or canary deployments

