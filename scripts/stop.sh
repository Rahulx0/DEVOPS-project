#!/bin/bash
# Stop script - Destroy all AWS resources and stop the website

set -e

export AWS_PAGER=""
AWS_REGION="${AWS_REGION:-us-east-1}"
EKS_CLUSTER="urbangear-dev-cluster"

echo "========================================"
echo "🛑 Stopping UrbanGear & Destroying Resources"
echo "========================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI not installed"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl not installed"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform not installed"; exit 1; }
echo "✅ All prerequisites installed"
echo ""

# Check if cluster exists
echo "Checking EKS cluster status..."
CLUSTER_STATUS=$(aws eks describe-cluster --name $EKS_CLUSTER --region $AWS_REGION --query 'cluster.status' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$CLUSTER_STATUS" = "NOT_FOUND" ]; then
    echo "✅ Cluster already destroyed"
else
    echo "🔍 Found active cluster: $EKS_CLUSTER"
    
    # Update kubeconfig
    echo "Configuring kubectl..."
    aws eks update-kubeconfig --name $EKS_CLUSTER --region $AWS_REGION
    
    # Show current status
    echo ""
    echo "📦 Current running pods:"
    kubectl get pods -l app=urbangear-frontend 2>/dev/null || echo "   No pods found"
    echo ""
    
    # Get external URL before destroying
    EXTERNAL_IP=$(kubectl get svc urbangear-frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    if [ -n "$EXTERNAL_IP" ]; then
        echo "🌐 Website currently running at: http://$EXTERNAL_IP"
        echo ""
    fi
fi

# Confirm destruction
echo "⚠️  WARNING: This will destroy ALL AWS resources and stop the website!"
echo ""
echo "Resources to be destroyed:"
echo "   • EKS Cluster ($EKS_CLUSTER)"
echo "   • VPC and networking components"
echo "   • ECR repository (urbangear-dev-frontend)"
echo "   • Load balancers and security groups"
echo "   • NAT Gateway and Elastic IPs"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo ""
echo "🗑️  Starting resource destruction..."
echo ""

# Destroy infrastructure with Terraform
cd "infra/terraform/envs/dev"

echo "Step 1: Initializing Terraform..."
terraform init -input=false

echo ""
echo "Step 2: Destroying infrastructure..."
echo "⏳ This will take approximately 10-15 minutes..."
terraform destroy -auto-approve

echo ""
echo "========================================"
echo "✅ All Resources Destroyed!"
echo "========================================"
echo ""
echo "💰 Cost savings: All AWS resources stopped"
echo "🌐 Website is no longer accessible"
echo ""
echo "To restart the website, run: ./scripts/start.sh"