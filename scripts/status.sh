#!/bin/bash
# Status Script - Check what's running and costs
# Shows current AWS resources and estimated costs

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
export AWS_REGION="${AWS_REGION:-us-west-2}"
export AWS_PAGER=""

echo "=========================================="
echo "📊 AWS Resource Status"
echo "=========================================="
echo ""
echo "Region: $AWS_REGION"
echo "Account: $(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo 'Not configured')"
echo ""

TOTAL_HOURLY_COST=0

# Check EKS Cluster
echo "Infrastructure Resources:"
echo "-------------------------"
if aws eks describe-cluster --name urbangear-dev-cluster --region $AWS_REGION &>/dev/null 2>&1; then
    echo "✓ EKS Cluster - RUNNING (~\$0.10/hour)"
    TOTAL_HOURLY_COST=$(echo "$TOTAL_HOURLY_COST + 0.10" | bc)
    
    NODE_COUNT=$(aws eks describe-nodegroup --cluster-name urbangear-dev-cluster --nodegroup-name urbangear-dev-nodes --region $AWS_REGION --query 'nodegroup.scalingConfig.desiredSize' --output text 2>/dev/null || echo "0")
    if [ "$NODE_COUNT" -gt 0 ]; then
        echo "  └─ Nodes: $NODE_COUNT x t3.small spot (~\$0.006/hour each)"
        NODE_COST=$(echo "$NODE_COUNT * 0.006" | bc)
        TOTAL_HOURLY_COST=$(echo "$TOTAL_HOURLY_COST + $NODE_COST" | bc)
    fi
else
    echo "✗ EKS Cluster - NOT RUNNING"
fi

# Check NAT Gateways
NAT_COUNT=$(aws ec2 describe-nat-gateways --region $AWS_REGION --filter "Name=tag:Project,Values=urbangear-ecommerce" "Name=state,Values=available" --query 'NatGateways | length(@)' --output text 2>/dev/null || echo "0")
if [ "$NAT_COUNT" -gt 0 ]; then
    echo "✓ NAT Gateways: $NAT_COUNT (~\$0.045/hour each)"
    NAT_COST=$(echo "$NAT_COUNT * 0.045" | bc)
    TOTAL_HOURLY_COST=$(echo "$TOTAL_HOURLY_COST + $NAT_COST" | bc)
else
    echo "✗ NAT Gateways - NOT RUNNING"
fi

# Check Load Balancers
LB_COUNT=$(aws elbv2 describe-load-balancers --region $AWS_REGION --query "LoadBalancers[?contains(LoadBalancerName, 'k8s')] | length(@)" --output text 2>/dev/null || echo "0")
if [ "$LB_COUNT" -gt 0 ]; then
    echo "✓ Load Balancers: $LB_COUNT (~\$0.025/hour each)"
    LB_COST=$(echo "$LB_COUNT * 0.025" | bc)
    TOTAL_HOURLY_COST=$(echo "$TOTAL_HOURLY_COST + $LB_COST" | bc)
else
    echo "✗ Load Balancers - NOT RUNNING"
fi

# Check VPC
VPC_ID=$(aws ec2 describe-vpcs --region $AWS_REGION --filters "Name=tag:Project,Values=urbangear-ecommerce" --query 'Vpcs[0].VpcId' --output text 2>/dev/null || echo "None")
if [ "$VPC_ID" != "None" ]; then
    echo "✓ VPC - EXISTS (no hourly cost)"
else
    echo "✗ VPC - NOT FOUND"
fi

echo ""
echo "Storage Resources:"
echo "------------------"

# Check ECR
if aws ecr describe-repositories --repository-names urbangear-dev-frontend --region $AWS_REGION &>/dev/null 2>&1; then
    IMAGE_COUNT=$(aws ecr list-images --region $AWS_REGION --repository-name urbangear-dev-frontend --query 'imageIds | length(@)' --output text 2>/dev/null || echo "0")
    echo "✓ ECR Repository - EXISTS"
    echo "  └─ Images: $IMAGE_COUNT (~\$0.10/GB/month)"
else
    echo "✗ ECR Repository - NOT FOUND"
fi

# Check S3
BUCKET_NAME=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'urbangear-terraform-state')].Name" --output text 2>/dev/null | head -1 || echo "")
if [ -n "$BUCKET_NAME" ]; then
    echo "✓ S3 State Bucket - EXISTS (~\$0.023/month)"
else
    echo "✗ S3 State Bucket - NOT FOUND"
fi

# Check DynamoDB
if aws dynamodb describe-table --table-name urbangear-terraform-locks --region $AWS_REGION &>/dev/null 2>&1; then
    echo "✓ DynamoDB Table - EXISTS (~\$0.25/month)"
else
    echo "✗ DynamoDB Table - NOT FOUND"
fi

echo ""
echo "=========================================="
echo "💰 Cost Estimate"
echo "=========================================="
echo ""

if (( $(echo "$TOTAL_HOURLY_COST > 0" | bc -l) )); then
    DAILY_COST=$(echo "$TOTAL_HOURLY_COST * 24" | bc)
    MONTHLY_COST=$(echo "$TOTAL_HOURLY_COST * 730" | bc)
    
    echo "⚠️  RESOURCES ARE RUNNING!"
    echo ""
    echo "Hourly:  ~\$$TOTAL_HOURLY_COST/hour"
    echo "Daily:   ~\$$DAILY_COST/day"
    echo "Monthly: ~\$$MONTHLY_COST/month"
    echo ""
    echo "💡 To stop costs: ./scripts/stop.sh"
else
    echo "✅ No expensive resources running!"
    echo ""
    echo "Storage only: ~\$0.40/month"
    echo ""
    echo "💡 To deploy: ./scripts/start.sh"
fi

echo ""

# Check if cluster is accessible
if aws eks describe-cluster --name urbangear-dev-cluster --region $AWS_REGION &>/dev/null 2>&1; then
    echo "=========================================="
    echo "🌐 Application Status"
    echo "=========================================="
    echo ""
    
    aws eks update-kubeconfig --name urbangear-dev-cluster --region $AWS_REGION --alias urbangear &>/dev/null || true
    
    echo "Pods:"
    kubectl get pods 2>/dev/null || echo "  Unable to connect"
    
    echo ""
    echo "Services:"
    kubectl get svc 2>/dev/null || echo "  Unable to connect"
    
    echo ""
    LB_URL=$(kubectl get svc urbangear-frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    if [ -n "$LB_URL" ]; then
        echo "🌐 Application URL: http://$LB_URL"
    else
        echo "⏳ LoadBalancer not ready yet"
    fi
    echo ""
fi
