#!/bin/bash
# Start script - Deploy infrastructure and application

set -e

export AWS_PAGER=""
AWS_REGION="${AWS_REGION:-us-west-2}"
EKS_CLUSTER="urbangear-dev-cluster"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "========================================"
echo "🚀 UrbanGear Deployment"
echo "========================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI not installed"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl not installed"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform not installed"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "❌ GitHub CLI not installed"; exit 1; }
echo "✅ All prerequisites installed"
echo ""

# Check if cluster exists
echo "Checking EKS cluster status..."
CLUSTER_STATUS=$(aws eks describe-cluster --name $EKS_CLUSTER --region $AWS_REGION --query 'cluster.status' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$CLUSTER_STATUS" = "NOT_FOUND" ]; then
    echo "⚠️  Cluster not found. Creating infrastructure..."
    echo ""
    echo "This will take approximately 15-20 minutes."
    echo ""
    
    # Initialize and apply Terraform
    cd "$WORKSPACE_ROOT/infra/terraform/envs/dev"
    
    echo "Step 1: Initializing Terraform..."
    terraform init -input=false
    
    echo ""
    echo "Step 2: Creating infrastructure..."
    terraform apply -auto-approve
    
    echo ""
    echo "✅ Infrastructure created!"
    
elif [ "$CLUSTER_STATUS" = "ACTIVE" ]; then
    echo "✅ Cluster is already running"
else
    echo "⏳ Cluster status: $CLUSTER_STATUS"
    echo "Waiting for cluster to be ready..."
    aws eks wait cluster-active --name $EKS_CLUSTER --region $AWS_REGION
fi

echo ""

# Update kubeconfig
echo "Configuring kubectl..."
aws eks update-kubeconfig --name $EKS_CLUSTER --region $AWS_REGION
echo "✅ kubectl configured"
echo ""

# Push code and trigger workflow
echo "Step 3: Triggering deployment workflow..."
cd "$WORKSPACE_ROOT"

git add . 2>/dev/null || true
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || echo "No new changes to commit"
git push origin rahul 2>/dev/null || echo "Already up to date"

# Wait for workflow
sleep 5
RUN_ID=$(gh run list --workflow="Build and Deploy" --branch rahul --limit 1 --json databaseId -q '.[0].databaseId')

if [ -n "$RUN_ID" ]; then
    echo ""
    echo "Watching workflow run: $RUN_ID"
    gh run watch $RUN_ID --exit-status || {
        echo "❌ Workflow failed! Check: gh run view $RUN_ID --log-failed"
        exit 1
    }
fi

echo ""
echo "========================================"
echo "✅ Deployment Complete!"
echo "========================================"
echo ""

# Show status
echo "📦 Pods:"
kubectl get pods -l app=urbangear-frontend
echo ""

# Check for LoadBalancer
echo "🌐 Checking service..."
LB_URL=$(kubectl get svc urbangear-frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

if [ -n "$LB_URL" ]; then
    echo ""
    echo "🎉 Your website is live at:"
    echo "   http://$LB_URL"
    echo ""
else
    echo ""
    echo "Starting port-forward (LoadBalancer not available)..."
    echo ""
    echo "🌐 Access your website at: http://localhost:8080"
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    kubectl port-forward svc/urbangear-frontend 8080:80
fi
