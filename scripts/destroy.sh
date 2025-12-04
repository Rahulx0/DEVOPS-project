#!/bin/bash
# Destroy script - removes all AWS resources to stop costs

set -e

export AWS_PAGER=""
AWS_REGION="${AWS_REGION:-us-west-2}"

echo "🛑 Destroying Resources"
echo ""
echo "This will destroy:"
echo "  - EKS Cluster and nodes"
echo "  - VPC and networking"
echo "  - ECR images"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Delete Kubernetes resources
echo ""
echo "Step 1: Cleaning Kubernetes resources..."
aws eks update-kubeconfig --name urbangear-dev-cluster --region $AWS_REGION 2>/dev/null || true
kubectl delete svc urbangear-frontend --ignore-not-found=true 2>/dev/null || true
kubectl delete deployment urbangear-frontend --ignore-not-found=true 2>/dev/null || true
echo "  Waiting 30 seconds..."
sleep 30

# Destroy infrastructure
echo ""
echo "Step 2: Destroying infrastructure (10-15 min)..."
cd "$WORKSPACE_ROOT/infra/terraform/envs/dev"
terraform init -input=false
terraform destroy -auto-approve

echo ""
echo "=========================================="
echo "✅ Resources Destroyed!"
echo "=========================================="
echo ""
echo "💰 Cost: $0/month (only S3 bucket remains)"
echo ""
echo "To redeploy: ./scripts/deploy.sh"
echo ""
