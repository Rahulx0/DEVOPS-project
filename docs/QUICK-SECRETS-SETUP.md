# Quick Setup: GitHub Actions Secrets

## 🎯 What You Need to Do Right Now

Go to: **https://github.com/Rahulx0/DEVOPS-project/settings/secrets/actions**

Then add these 5 secrets by clicking **"New repository secret"** for each:

---

## 📝 Secrets to Add

### 1. AWS_ACCESS_KEY_ID
```
Get this by running:
aws configure get aws_access_key_id

OR create new IAM user with ECR/EKS permissions
```

### 2. AWS_SECRET_ACCESS_KEY
```
Get this by running:
aws configure get aws_secret_access_key

OR get from new IAM user creation output
```

### 3. AWS_REGION
```
us-west-2
```

### 4. ECR_REPOSITORY
```
urbangear-dev-frontend
```

### 5. EKS_CLUSTER_NAME
```
urbangear-dev-cluster
```

---

## ⚡ Quick Commands (if using existing AWS credentials)

```bash
# Get your current AWS credentials
echo "AWS_ACCESS_KEY_ID:"
aws configure get aws_access_key_id

echo ""
echo "AWS_SECRET_ACCESS_KEY:"
aws configure get aws_secret_access_key

echo ""
echo "AWS_REGION:"
aws configure get region
```

---

## ✅ After Adding Secrets

1. All 5 secrets should be listed in GitHub Settings
2. Make a small commit to trigger the workflow:
   ```bash
   echo "# Testing CI" >> README.md
   git add README.md
   git commit -m "test: Trigger GitHub Actions"
   git push origin rahul
   ```

3. Check the workflow run:
   - Go to: https://github.com/Rahulx0/DEVOPS-project/actions
   - You should see a new workflow run

---

## 🚨 Important Notes

- **Never commit AWS credentials to git**
- The secrets are encrypted and only visible to GitHub Actions
- If workflow fails, check the Actions tab for error logs
- The full setup guide is in `docs/github-actions-setup.md`

---

## 🐛 If You Don't Have IAM Permissions

You may need to create a dedicated IAM user. See the full guide:
`docs/github-actions-setup.md` - Step 1

Or ask your AWS administrator to:
1. Create IAM user: `github-actions-urbangear`
2. Attach policies: `AmazonEC2ContainerRegistryPowerUser`, `AmazonEKSClusterPolicy`
3. Generate access keys
4. Share the access key ID and secret with you

