#!/bin/bash
# Stop Script - Destroy all AWS resources
# This removes everything to stop costs

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
export AWS_REGION="${AWS_REGION:-us-west-2}"

echo "=========================================="
echo "🛑 Stopping Website & Destroying Resources"
echo "=========================================="
echo ""
echo "This will destroy:"
echo "  - EKS Cluster and nodes"
echo "  - VPC and networking"
echo "  - Load balancers"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

# Clean up Kubernetes resources first
echo ""
echo "Step 1: Cleaning Kubernetes resources..."
if aws eks describe-cluster --name urbangear-dev-cluster --region $AWS_REGION &>/dev/null; then
    aws eks update-kubeconfig --name urbangear-dev-cluster --region $AWS_REGION || true
    kubectl delete svc --all-namespaces --field-selector spec.type=LoadBalancer --ignore-not-found=true || true
    echo "  Waiting 30 seconds for AWS cleanup..."
    sleep 30
fi

# Destroy infrastructure
echo ""
echo "Step 2: Destroying infrastructure (10-15 min)..."
cd "$WORKSPACE_ROOT/infra/terraform/envs/dev"
terraform init -input=false
terraform destroy -auto-approve || {
    echo "  Retrying..."
    sleep 30
    terraform destroy -auto-approve
}
echo "✓ Infrastructure destroyed"

# Optional: Destroy bootstrap
echo ""
read -p "Also destroy S3 bucket and DynamoDB? (yes/no): " destroy_backend

if [ "$destroy_backend" = "yes" ]; then
    cd "$WORKSPACE_ROOT/infra/terraform/envs/bootstrap"
    BUCKET_NAME=$(terraform output -raw backend_bucket_name 2>/dev/null || echo "")
    if [ -n "$BUCKET_NAME" ]; then
        echo "  Emptying S3 bucket..."
        aws s3 rm s3://$BUCKET_NAME --recursive --region $AWS_REGION || true
    fi
    terraform destroy -auto-approve
    echo "✓ Backend destroyed"
fi

echo ""
echo "=========================================="
echo "✅ All Resources Stopped!"
echo "=========================================="
echo ""
if [ "$destroy_backend" = "yes" ]; then
    echo "💰 Cost: \$0/month"
else
    echo "💰 Cost: ~\$0.40/month (S3 + DynamoDB)"
fi
echo ""
echo "To restart: ./scripts/start.sh"
echo ""
