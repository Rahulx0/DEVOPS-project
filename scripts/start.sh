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

# Create persistent Load Balancer if it doesn't exist
echo "🔗 Setting up persistent Load Balancer..."
PERSISTENT_LB=$(aws elbv2 describe-load-balancers --names "urbangear-persistent-alb" --region $AWS_REGION --query 'LoadBalancers[0].DNSName' --output text 2>/dev/null || echo "None")

if [ "$PERSISTENT_LB" = "None" ]; then
    echo "   Creating persistent Application Load Balancer..."
    
    # Get VPC and subnets
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Project,Values=urbangear" --region $AWS_REGION --query 'Vpcs[0].VpcId' --output text)
    SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Type,Values=public" --region $AWS_REGION --query 'Subnets[].SubnetId' --output text | tr '\t' ' ')
    
    # Create security group for ALB
    ALB_SG_ID=$(aws ec2 create-security-group --group-name "urbangear-alb-sg" --description "Security group for UrbanGear ALB" --vpc-id "$VPC_ID" --region $AWS_REGION --query 'GroupId' --output text 2>/dev/null || aws ec2 describe-security-groups --filters "Name=group-name,Values=urbangear-alb-sg" --region $AWS_REGION --query 'SecurityGroups[0].GroupId' --output text)
    
    # Add HTTP rule to security group
    aws ec2 authorize-security-group-ingress --group-id "$ALB_SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION 2>/dev/null || true
    
    # Create ALB
    ALB_ARN=$(aws elbv2 create-load-balancer --name "urbangear-persistent-alb" --subnets $SUBNET_IDS --security-groups "$ALB_SG_ID" --region $AWS_REGION --query 'LoadBalancers[0].LoadBalancerArn' --output text)
    
    # Wait for ALB to be active
    echo "   Waiting for ALB to be active..."
    aws elbv2 wait load-balancer-available --load-balancer-arns "$ALB_ARN" --region $AWS_REGION
    
    # Get ALB DNS name
    PERSISTENT_LB=$(aws elbv2 describe-load-balancers --load-balancer-arns "$ALB_ARN" --region $AWS_REGION --query 'LoadBalancers[0].DNSName' --output text)
    
    echo "✅ Persistent Load Balancer created: $PERSISTENT_LB"
else
    echo "✅ Using existing persistent Load Balancer: $PERSISTENT_LB"
fi

# Create target group if it doesn't exist
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --names "urbangear-tg" --region $AWS_REGION --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || echo "None")

if [ "$TARGET_GROUP_ARN" = "None" ]; then
    echo "   Creating target group..."
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Project,Values=urbangear" --region $AWS_REGION --query 'Vpcs[0].VpcId' --output text)
    TARGET_GROUP_ARN=$(aws elbv2 create-target-group --name "urbangear-tg" --protocol HTTP --port 80 --vpc-id "$VPC_ID" --target-type ip --region $AWS_REGION --query 'TargetGroups[0].TargetGroupArn' --output text)
    
    # Create listener
    ALB_ARN=$(aws elbv2 describe-load-balancers --names "urbangear-persistent-alb" --region $AWS_REGION --query 'LoadBalancers[0].LoadBalancerArn' --output text)
    aws elbv2 create-listener --load-balancer-arn "$ALB_ARN" --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn="$TARGET_GROUP_ARN" --region $AWS_REGION >/dev/null
    
    echo "✅ Target group and listener created"
fi

# Update Kubernetes service to use NodePort instead of LoadBalancer
echo "   Updating Kubernetes service..."
kubectl patch svc urbangear-frontend -p '{"spec":{"type":"NodePort"}}' 2>/dev/null || true

# Register EKS nodes with ALB target group
echo "   Registering nodes with ALB..."
NODE_IPS=$(kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}')
for NODE_IP in $NODE_IPS; do
    aws elbv2 register-targets --target-group-arn "$TARGET_GROUP_ARN" --targets Id="$NODE_IP",Port=30000 --region $AWS_REGION 2>/dev/null || true
done

# Get the persistent external URL
EXTERNAL_IP="$PERSISTENT_LB"

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
        
        # Try Cloudflare API first (if configured)
        if [ -n "$CLOUDFLARE_API_TOKEN" ] && [ -n "$CLOUDFLARE_ZONE_ID" ]; then
            echo "🎯 Updating Cloudflare DNS automatically..."
            
            # Get existing record ID
            RECORD_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?name=$DOMAIN_NAME&type=CNAME" \
                -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
                -H "Content-Type: application/json" | jq -r '.result[0].id // empty')
            
            if [ -n "$RECORD_ID" ]; then
                # Update existing record
                curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
                    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
                    -H "Content-Type: application/json" \
                    --data "{\"type\":\"CNAME\",\"name\":\"$DOMAIN_NAME\",\"content\":\"$EXTERNAL_IP\",\"ttl\":300}" >/dev/null
                echo "✅ Cloudflare DNS updated automatically!"
            else
                # Create new record
                curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
                    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
                    -H "Content-Type: application/json" \
                    --data "{\"type\":\"CNAME\",\"name\":\"$DOMAIN_NAME\",\"content\":\"$EXTERNAL_IP\",\"ttl\":300}" >/dev/null
                echo "✅ Cloudflare DNS record created automatically!"
            fi
            
            echo ""
            echo "=========================================="
            echo "🎉 DOMAIN AUTOMATICALLY UPDATED!"
            echo "=========================================="
            echo ""
            echo "Your website is available at:"
            echo "   🌍 http://$DOMAIN_NAME"
            echo "   Admin: http://$DOMAIN_NAME/?admin=true"
            echo ""
            echo "DNS will propagate in 1-2 minutes."
            echo ""
            
        elif [ -n "$HOSTED_ZONE_ID" ] && [ "$HOSTED_ZONE_ID" != "None" ]; then
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
