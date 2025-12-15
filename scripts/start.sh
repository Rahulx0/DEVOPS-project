#!/bin/bash
# Start script - Deploy application and get external URL

set -e

export AWS_PAGER=""
AWS_REGION="${AWS_REGION:-us-east-1}"
EKS_CLUSTER="urbangear-dev-cluster"

# Domain configuration
DOMAIN_NAME="urbangear.qzz.io"
USE_CUSTOM_DOMAIN="true"

echo "========================================"
echo "🚀 Starting UrbanGear Deployment"
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
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
    
    cd "$WORKSPACE_ROOT/infra/terraform/envs/dev"
    
    echo "Step 1: Initializing Terraform..."
    terraform init
    
    echo ""
    echo "Step 2: Creating infrastructure..."
    terraform apply -auto-approve
    
    echo ""
    echo "✅ Infrastructure created!"
    cd "$WORKSPACE_ROOT"
    
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

# Wait for nodes to be ready
echo "Waiting for EKS nodes to be ready..."
for i in {1..20}; do
    NODE_COUNT=$(kubectl get nodes --no-headers 2>/dev/null | wc -l)
    if [ "$NODE_COUNT" -gt 0 ]; then
        echo "✅ $NODE_COUNT node(s) ready"
        break
    fi
    echo "   Waiting for nodes... ($i/20)"
    sleep 30
done

if [ "$NODE_COUNT" -eq 0 ]; then
    echo "⚠️  No nodes ready yet, but continuing with deployment..."
fi
echo ""

# Create fake commit and trigger workflow
echo "Step 3: Triggering deployment workflow..."

# Ensure we're in the workspace root for git operations
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$WORKSPACE_ROOT"

git add . 2>/dev/null || true
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || echo "No new changes to commit"
git push origin rahul 2>/dev/null || echo "Already up to date"

# Wait for workflow
sleep 5
RUN_ID=$(gh run list --workflow="Build and Deploy" --branch rahul --limit 1 --json databaseId -q '.[0].databaseId')

if [ -n "$RUN_ID" ]; then
    echo ""
    echo "⏳ Watching workflow run: $RUN_ID"
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
echo "📦 Pod Status:"
kubectl get pods -l app=urbangear-frontend
echo ""

echo "🖥️  Node Status:"
kubectl get nodes
echo ""

echo "⚙️  Auto Scaling Group Status:"
aws autoscaling describe-auto-scaling-groups --region $AWS_REGION --query "AutoScalingGroups[?contains(AutoScalingGroupName, 'urbangear-dev-nodes')].[AutoScalingGroupName,DesiredCapacity,Instances[0].InstanceId]" --output table 2>/dev/null || echo "   No ASG found"
echo ""

# Get external URL
echo "🌐 Getting external URL..."
EXTERNAL_IP=""
for i in {1..30}; do
    EXTERNAL_IP=$(kubectl get svc urbangear-frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    if [ -n "$EXTERNAL_IP" ]; then
        break
    fi
    echo "   Waiting for LoadBalancer... ($i/30)"
    sleep 10
done

if [ -n "$EXTERNAL_IP" ]; then
    echo ""
    echo "=========================================="
    echo "🎉 Your website is LIVE at:"
    echo ""
    echo "   🌍 http://$EXTERNAL_IP"
    echo ""
    echo "   Admin panel: http://$EXTERNAL_IP/?admin=true"
    echo "=========================================="
    echo ""
    
    # Automatic domain setup
    if [ "$USE_CUSTOM_DOMAIN" = "true" ] && [ -n "$DOMAIN_NAME" ]; then
        echo "🌐 Setting up custom domain: $DOMAIN_NAME"
        echo ""
        
        # Check if domain uses Route 53
        HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?contains(Name, 'qzz.io')].Id" --output text 2>/dev/null | head -1 || echo "")
        
        if [ -n "$HOSTED_ZONE_ID" ] && [ "$HOSTED_ZONE_ID" != "None" ]; then
            echo "🎯 Found Route 53 hosted zone: $HOSTED_ZONE_ID"
            echo "   Creating DNS record automatically..."
            
            # Create Route 53 record
            cat > /tmp/dns-record.json << EOF
{
    "Changes": [
        {
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "$DOMAIN_NAME",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [
                    {
                        "Value": "$EXTERNAL_IP"
                    }
                ]
            }
        }
    ]
}
EOF

            CHANGE_ID=$(aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch file:///tmp/dns-record.json --query 'ChangeInfo.Id' --output text 2>/dev/null || echo "")
            
            if [ -n "$CHANGE_ID" ]; then
                echo "✅ DNS record created! Change ID: $CHANGE_ID"
                echo "⏳ Waiting for DNS propagation..."
                aws route53 wait resource-record-sets-changed --id "$CHANGE_ID" 2>/dev/null || sleep 30
                
                echo ""
                echo "=========================================="
                echo "🎉 DOMAIN SETUP COMPLETE!"
                echo "=========================================="
                echo ""
                echo "Your website is now available at:"
                echo "   🌍 http://$DOMAIN_NAME"
                echo "   🌍 http://www.$DOMAIN_NAME (if configured)"
                echo ""
                echo "   Admin panel: http://$DOMAIN_NAME/?admin=true"
                echo ""
                
                # Clean up
                rm -f /tmp/dns-record.json
            else
                echo "⚠️  Could not create DNS record automatically."
                echo "   Please set up DNS manually (see instructions below)."
            fi
        else
            echo "⚠️  Route 53 hosted zone not found for qzz.io domain."
            echo ""
            echo "📋 MANUAL DNS SETUP REQUIRED:"
            echo ""
            echo "Please configure DNS with your qzz.io provider:"
            echo "   Type: CNAME"
            echo "   Name: urbangear"
            echo "   Value: $EXTERNAL_IP"
            echo "   TTL: 300 (5 minutes)"
            echo ""
            echo "After DNS propagation (5-10 minutes):"
            echo "   🌍 http://$DOMAIN_NAME"
            echo "   Admin: http://$DOMAIN_NAME/?admin=true"
            echo ""
        fi
    fi
    
    echo "✅ Website is running with 1 pod"
    echo "💰 Cost-optimized: Single t3.small spot instance"
else
    echo "⚠️  Could not get external IP. Check LoadBalancer status:"
    kubectl get svc urbangear-frontend
fi
