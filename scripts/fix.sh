#!/bin/bash
# Fix Script - Clean up orphaned resources
# Use this if deployment fails or resources are stuck

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
export AWS_REGION="${AWS_REGION:-us-west-2}"
export AWS_PAGER=""

echo "=========================================="
echo "🔧 Resource Cleanup & Fix"
echo "=========================================="
echo ""
echo "This will clean up:"
echo "  - Orphaned load balancers"
echo "  - Stuck security groups"
echo "  - Old S3 buckets"
echo "  - DynamoDB tables"
echo "  - Local Terraform state"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Step 1: Cleaning Kubernetes resources..."
if aws eks describe-cluster --name urbangear-dev-cluster --region $AWS_REGION &>/dev/null 2>&1; then
    aws eks update-kubeconfig --name urbangear-dev-cluster --region $AWS_REGION || true
    kubectl delete svc --all-namespaces --field-selector spec.type=LoadBalancer --ignore-not-found=true || true
    kubectl delete ingress --all --all-namespaces --ignore-not-found=true || true
    echo "  Waiting 30 seconds..."
    sleep 30
fi

echo ""
echo "Step 2: Cleaning orphaned load balancers..."
LBS=$(aws elbv2 describe-load-balancers --region $AWS_REGION --query "LoadBalancers[?contains(LoadBalancerName, 'k8s')].LoadBalancerArn" --output text 2>/dev/null || true)
if [ -n "$LBS" ]; then
    for lb in $LBS; do
        echo "  - Deleting: $lb"
        aws elbv2 delete-load-balancer --load-balancer-arn $lb --region $AWS_REGION || true
    done
    sleep 10
fi

echo ""
echo "Step 3: Cleaning target groups..."
TGS=$(aws elbv2 describe-target-groups --region $AWS_REGION --query "TargetGroups[?contains(TargetGroupName, 'k8s')].TargetGroupArn" --output text 2>/dev/null || true)
if [ -n "$TGS" ]; then
    for tg in $TGS; do
        echo "  - Deleting: $tg"
        aws elbv2 delete-target-group --target-group-arn $tg --region $AWS_REGION || true
    done
fi

echo ""
echo "Step 4: Checking bootstrap resources..."

# Check DynamoDB
if aws dynamodb describe-table --table-name urbangear-terraform-locks --region $AWS_REGION &>/dev/null 2>&1; then
    echo "  Found DynamoDB table"
    read -p "  Delete it? (yes/no): " delete_dynamo
    if [ "$delete_dynamo" = "yes" ]; then
        aws dynamodb delete-table --table-name urbangear-terraform-locks --region $AWS_REGION
        echo "  ✓ Deleted"
    fi
fi

# Check S3 buckets
BUCKETS=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'urbangear-terraform-state')].Name" --output text 2>/dev/null || echo "")
if [ -n "$BUCKETS" ]; then
    echo "  Found S3 buckets: $BUCKETS"
    read -p "  Delete them? (yes/no): " delete_s3
    if [ "$delete_s3" = "yes" ]; then
        for bucket in $BUCKETS; do
            echo "    - Emptying: $bucket"
            aws s3 rm s3://$bucket --recursive --region $AWS_REGION || true
            
            # Delete versions
            aws s3api list-object-versions --bucket $bucket --region $AWS_REGION --output json 2>/dev/null | \
            jq -r '.Versions[]?, .DeleteMarkers[]? | "--key \"\(.Key)\" --version-id \"\(.VersionId)\""' | \
            while read args; do
                eval aws s3api delete-object --bucket $bucket --region $AWS_REGION $args 2>/dev/null || true
            done
            
            echo "    - Deleting: $bucket"
            aws s3api delete-bucket --bucket $bucket --region $AWS_REGION || true
        done
        echo "  ✓ Deleted"
    fi
fi

echo ""
echo "Step 5: Cleaning local Terraform state..."
cd "$WORKSPACE_ROOT"

if [ -d "infra/terraform/envs/bootstrap/.terraform" ]; then
    rm -rf infra/terraform/envs/bootstrap/.terraform
    echo "  ✓ Removed bootstrap .terraform"
fi

if [ -f "infra/terraform/envs/bootstrap/terraform.tfstate" ]; then
    rm -f infra/terraform/envs/bootstrap/terraform.tfstate*
    echo "  ✓ Removed bootstrap state"
fi

if [ -d "infra/terraform/envs/dev/.terraform" ]; then
    rm -rf infra/terraform/envs/dev/.terraform
    echo "  ✓ Removed dev .terraform"
fi

if [ -f "infra/terraform/envs/dev/terraform.tfstate" ]; then
    rm -f infra/terraform/envs/dev/terraform.tfstate*
    echo "  ✓ Removed dev state"
fi

echo ""
echo "=========================================="
echo "✅ Cleanup Complete!"
echo "=========================================="
echo ""
echo "You can now run: ./scripts/start.sh"
echo ""
