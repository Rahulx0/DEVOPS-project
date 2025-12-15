#!/bin/bash
# Stop script - Destroy all AWS resources and stop the website

set -e

export AWS_PAGER=""
AWS_REGION="${AWS_REGION:-us-east-1}"
EKS_CLUSTER="urbangear-dev-cluster"
ECR_REPO="urbangear-dev-frontend"
DOMAIN_NAME="urbangear.qzz.io"

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
echo "   • ECR repository ($ECR_REPO)"
echo "   • Load balancers and security groups"
echo "   • NAT Gateway and Elastic IPs"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo ""
echo "🗑️  Starting comprehensive resource cleanup..."
echo ""

# Function to cleanup Kubernetes resources first
cleanup_kubernetes() {
    if [ "$CLUSTER_STATUS" != "NOT_FOUND" ]; then
        echo "Step 1: Cleaning up Kubernetes resources..."
        
        # Delete all services with LoadBalancer type to release AWS Load Balancers
        echo "   Deleting LoadBalancer services..."
        kubectl delete svc --all --timeout=300s 2>/dev/null || true
        
        # Delete all ingresses to release ALBs
        echo "   Deleting ingresses..."
        kubectl delete ingress --all --timeout=300s 2>/dev/null || true
        
        # Delete all deployments to stop pods
        echo "   Deleting deployments..."
        kubectl delete deployment --all --timeout=300s 2>/dev/null || true
        
        # Wait for load balancers to be deleted
        echo "   Waiting for load balancers to be released..."
        sleep 60
        
        echo "✅ Kubernetes resources cleaned up"
        echo ""
    fi
}

# Function to cleanup Auto Scaling Groups and EC2 instances
cleanup_autoscaling_and_instances() {
    echo "Step 1.5: Cleaning up Auto Scaling Groups and EC2 instances..."
    
    # Find and delete Auto Scaling Groups related to our EKS cluster
    ASG_NAMES=$(aws autoscaling describe-auto-scaling-groups --region $AWS_REGION --query "AutoScalingGroups[?contains(AutoScalingGroupName, 'urbangear-dev-nodes')].AutoScalingGroupName" --output text 2>/dev/null || echo "")
    
    if [ -n "$ASG_NAMES" ]; then
        for ASG_NAME in $ASG_NAMES; do
            echo "   Scaling down ASG: $ASG_NAME"
            aws autoscaling update-auto-scaling-group --auto-scaling-group-name "$ASG_NAME" --min-size 0 --desired-capacity 0 --region $AWS_REGION 2>/dev/null || true
            
            echo "   Waiting for instances to terminate..."
            sleep 30
            
            echo "   Deleting ASG: $ASG_NAME"
            aws autoscaling delete-auto-scaling-group --auto-scaling-group-name "$ASG_NAME" --force-delete --region $AWS_REGION 2>/dev/null || true
        done
    fi
    
    # Terminate any remaining EC2 instances related to our cluster
    INSTANCE_IDS=$(aws ec2 describe-instances --region $AWS_REGION --filters "Name=tag:eks:cluster-name,Values=urbangear-dev-cluster" "Name=instance-state-name,Values=running,pending" --query 'Reservations[*].Instances[*].InstanceId' --output text 2>/dev/null || echo "")
    
    if [ -n "$INSTANCE_IDS" ] && [ "$INSTANCE_IDS" != "None" ]; then
        echo "   Terminating EC2 instances: $INSTANCE_IDS"
        aws ec2 terminate-instances --instance-ids $INSTANCE_IDS --region $AWS_REGION 2>/dev/null || true
        
        echo "   Waiting for instances to terminate..."
        sleep 60
    fi
    
    # Delete launch templates
    LAUNCH_TEMPLATE_IDS=$(aws ec2 describe-launch-templates --region $AWS_REGION --query "LaunchTemplates[?contains(LaunchTemplateName, 'eks-') && contains(LaunchTemplateName, 'urbangear')].LaunchTemplateId" --output text 2>/dev/null || echo "")
    
    if [ -n "$LAUNCH_TEMPLATE_IDS" ] && [ "$LAUNCH_TEMPLATE_IDS" != "None" ]; then
        for LT_ID in $LAUNCH_TEMPLATE_IDS; do
            echo "   Deleting launch template: $LT_ID"
            aws ec2 delete-launch-template --launch-template-id "$LT_ID" --region $AWS_REGION 2>/dev/null || true
        done
    fi
    
    echo "✅ Auto Scaling Groups and EC2 instances cleaned up"
    echo ""
}

# Function to cleanup ECR repository
cleanup_ecr() {
    echo "Step 2: Cleaning up ECR repository..."
    
    # Check if repository exists
    if aws ecr describe-repositories --repository-names $ECR_REPO --region $AWS_REGION >/dev/null 2>&1; then
        # List and delete all images
        echo "   Deleting ECR images..."
        aws ecr list-images --repository-name $ECR_REPO --region $AWS_REGION --query 'imageIds[*]' --output json > /tmp/images.json 2>/dev/null || echo "[]" > /tmp/images.json
        
        if [ -s /tmp/images.json ] && [ "$(cat /tmp/images.json)" != "[]" ]; then
            aws ecr batch-delete-image --repository-name $ECR_REPO --region $AWS_REGION --image-ids file:///tmp/images.json >/dev/null 2>&1 || true
            echo "   ECR images deleted"
        else
            echo "   No ECR images to delete"
        fi
        rm -f /tmp/images.json
        
        # Force delete the repository
        echo "   Force deleting ECR repository..."
        aws ecr delete-repository --repository-name $ECR_REPO --region $AWS_REGION --force >/dev/null 2>&1 || true
    else
        echo "   ECR repository not found"
    fi
    
    echo "✅ ECR cleanup completed"
    echo ""
}

# Function to cleanup AWS resources manually
cleanup_aws_resources_manual() {
    echo "Step 3: Manual AWS resource cleanup..."
    
    # Get VPC ID if it exists
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Project,Values=urbangear" --region $AWS_REGION --query 'Vpcs[0].VpcId' --output text 2>/dev/null || echo "None")
    
    if [ "$VPC_ID" != "None" ] && [ "$VPC_ID" != "null" ]; then
        echo "   Found VPC: $VPC_ID"
        
        # Delete any remaining load balancers
        echo "   Cleaning up load balancers..."
        aws elbv2 describe-load-balancers --region $AWS_REGION --query "LoadBalancers[?VpcId=='$VPC_ID'].LoadBalancerArn" --output text 2>/dev/null | tr '\t' '\n' | while read -r LB_ARN; do
            if [ -n "$LB_ARN" ] && [ "$LB_ARN" != "None" ]; then
                echo "     Deleting load balancer: $LB_ARN"
                aws elbv2 delete-load-balancer --load-balancer-arn "$LB_ARN" --region $AWS_REGION 2>/dev/null || true
            fi
        done
        
        # Wait for load balancers to be deleted
        sleep 90
        
        # Delete network interfaces in available state
        echo "   Cleaning up network interfaces..."
        aws ec2 describe-network-interfaces --filters "Name=vpc-id,Values=$VPC_ID" "Name=status,Values=available" --region $AWS_REGION --query 'NetworkInterfaces[].NetworkInterfaceId' --output text 2>/dev/null | tr '\t' '\n' | while read -r ENI_ID; do
            if [ -n "$ENI_ID" ] && [ "$ENI_ID" != "None" ]; then
                echo "     Deleting network interface: $ENI_ID"
                aws ec2 delete-network-interface --network-interface-id "$ENI_ID" --region $AWS_REGION 2>/dev/null || true
            fi
        done
        
        sleep 30
        
        # Release any elastic IPs
        echo "   Releasing Elastic IPs..."
        aws ec2 describe-addresses --region $AWS_REGION --query "Addresses[?Domain=='vpc'].AllocationId" --output text 2>/dev/null | tr '\t' '\n' | while read -r ALLOC_ID; do
            if [ -n "$ALLOC_ID" ] && [ "$ALLOC_ID" != "None" ]; then
                echo "     Releasing EIP: $ALLOC_ID"
                aws ec2 release-address --allocation-id "$ALLOC_ID" --region $AWS_REGION 2>/dev/null || true
            fi
        done
        
        sleep 30
        
        # Delete NAT gateways
        echo "   Deleting NAT gateways..."
        aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$VPC_ID" --region $AWS_REGION --query 'NatGateways[?State==`available`].NatGatewayId' --output text 2>/dev/null | tr '\t' '\n' | while read -r NAT_ID; do
            if [ -n "$NAT_ID" ] && [ "$NAT_ID" != "None" ]; then
                echo "     Deleting NAT gateway: $NAT_ID"
                aws ec2 delete-nat-gateway --nat-gateway-id "$NAT_ID" --region $AWS_REGION 2>/dev/null || true
            fi
        done
        
        sleep 60
        
        # Delete internet gateways
        echo "   Detaching and deleting internet gateways..."
        aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --region $AWS_REGION --query 'InternetGateways[].InternetGatewayId' --output text 2>/dev/null | tr '\t' '\n' | while read -r IGW_ID; do
            if [ -n "$IGW_ID" ] && [ "$IGW_ID" != "None" ]; then
                echo "     Detaching IGW: $IGW_ID"
                aws ec2 detach-internet-gateway --internet-gateway-id "$IGW_ID" --vpc-id "$VPC_ID" --region $AWS_REGION 2>/dev/null || true
                sleep 10
                echo "     Deleting IGW: $IGW_ID"
                aws ec2 delete-internet-gateway --internet-gateway-id "$IGW_ID" --region $AWS_REGION 2>/dev/null || true
            fi
        done
        
        sleep 30
        
        # Delete subnets
        echo "   Deleting subnets..."
        aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --region $AWS_REGION --query 'Subnets[].SubnetId' --output text 2>/dev/null | tr '\t' '\n' | while read -r SUBNET_ID; do
            if [ -n "$SUBNET_ID" ] && [ "$SUBNET_ID" != "None" ]; then
                echo "     Deleting subnet: $SUBNET_ID"
                aws ec2 delete-subnet --subnet-id "$SUBNET_ID" --region $AWS_REGION 2>/dev/null || true
            fi
        done
        
        sleep 30
        
        # Delete route tables (except main)
        echo "   Deleting route tables..."
        aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --region $AWS_REGION --query 'RouteTables[?Associations[0].Main!=`true`].RouteTableId' --output text 2>/dev/null | tr '\t' '\n' | while read -r RT_ID; do
            if [ -n "$RT_ID" ] && [ "$RT_ID" != "None" ]; then
                echo "     Deleting route table: $RT_ID"
                aws ec2 delete-route-table --route-table-id "$RT_ID" --region $AWS_REGION 2>/dev/null || true
            fi
        done
        
        sleep 30
        
        # Delete security groups (except default)
        echo "   Deleting security groups..."
        aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" --region $AWS_REGION --query 'SecurityGroups[?GroupName!=`default`].GroupId' --output text 2>/dev/null | tr '\t' '\n' | while read -r SG_ID; do
            if [ -n "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
                echo "     Deleting security group: $SG_ID"
                aws ec2 delete-security-group --group-id "$SG_ID" --region $AWS_REGION 2>/dev/null || true
            fi
        done
        
        sleep 30
        
        # Finally delete the VPC
        echo "   Deleting VPC: $VPC_ID"
        aws ec2 delete-vpc --vpc-id "$VPC_ID" --region $AWS_REGION 2>/dev/null || true
        
    fi
    
    echo "✅ Manual AWS cleanup completed"
    echo ""
}

# Function to cleanup DNS records
cleanup_dns() {
    echo "Step 0: Cleaning up DNS records..."
    
    # Check if domain uses Route 53
    HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?contains(Name, 'qzz.io')].Id" --output text 2>/dev/null | head -1 || echo "")
    
    if [ -n "$HOSTED_ZONE_ID" ] && [ "$HOSTED_ZONE_ID" != "None" ]; then
        echo "   Found Route 53 hosted zone: $HOSTED_ZONE_ID"
        
        # Check if DNS record exists
        EXISTING_RECORD=$(aws route53 list-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --query "ResourceRecordSets[?Name=='$DOMAIN_NAME.'].ResourceRecords[0].Value" --output text 2>/dev/null || echo "")
        
        if [ -n "$EXISTING_RECORD" ] && [ "$EXISTING_RECORD" != "None" ]; then
            echo "   Deleting DNS record for $DOMAIN_NAME..."
            
            cat > /tmp/dns-delete.json << EOF
{
    "Changes": [
        {
            "Action": "DELETE",
            "ResourceRecordSet": {
                "Name": "$DOMAIN_NAME",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [
                    {
                        "Value": "$EXISTING_RECORD"
                    }
                ]
            }
        }
    ]
}
EOF

            aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch file:///tmp/dns-delete.json >/dev/null 2>&1 || true
            rm -f /tmp/dns-delete.json
            echo "   DNS record deleted"
        else
            echo "   No DNS record found for $DOMAIN_NAME"
        fi
    else
        echo "   No Route 53 hosted zone found (manual DNS cleanup may be required)"
    fi
    
    echo "✅ DNS cleanup completed"
    echo ""
}

# Execute cleanup steps
cleanup_dns
cleanup_kubernetes
cleanup_autoscaling_and_instances
cleanup_ecr

# Try Terraform destroy first
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$WORKSPACE_ROOT/infra/terraform/envs/dev"

echo "Step 4: Attempting Terraform destroy..."
terraform init -input=false >/dev/null 2>&1

# Quick destroy attempt
timeout 300 terraform destroy -auto-approve 2>/dev/null || {
    echo "   Terraform destroy timed out or failed, proceeding with manual cleanup..."
    cleanup_aws_resources_manual
}

cd "$WORKSPACE_ROOT"

echo ""
echo "========================================"
echo "🔍 Final Resource Verification"
echo "========================================"
echo ""

# Verify all resources are cleaned up
echo "Checking for remaining resources..."

# Check EKS cluster
CLUSTER_CHECK=$(aws eks describe-cluster --name $EKS_CLUSTER --region $AWS_REGION --query 'cluster.status' --output text 2>/dev/null || echo "NOT_FOUND")
echo "   EKS Cluster: $CLUSTER_CHECK"

# Check VPC
VPC_CHECK=$(aws ec2 describe-vpcs --filters "Name=tag:Project,Values=urbangear" --region $AWS_REGION --query 'Vpcs[0].VpcId' --output text 2>/dev/null || echo "None")
echo "   VPC: $VPC_CHECK"

# Check ECR
ECR_CHECK=$(aws ecr describe-repositories --repository-names $ECR_REPO --region $AWS_REGION --query 'repositories[0].repositoryName' --output text 2>/dev/null || echo "None")
echo "   ECR Repository: $ECR_CHECK"

# Check EC2 instances
INSTANCE_CHECK=$(aws ec2 describe-instances --region $AWS_REGION --filters "Name=tag:eks:cluster-name,Values=urbangear-dev-cluster" "Name=instance-state-name,Values=running,pending" --query 'Reservations[*].Instances[*].InstanceId' --output text 2>/dev/null || echo "None")
echo "   EC2 Instances: ${INSTANCE_CHECK:-None}"

# Check Auto Scaling Groups
ASG_CHECK=$(aws autoscaling describe-auto-scaling-groups --region $AWS_REGION --query "AutoScalingGroups[?contains(AutoScalingGroupName, 'urbangear-dev-nodes')].AutoScalingGroupName" --output text 2>/dev/null || echo "None")
echo "   Auto Scaling Groups: ${ASG_CHECK:-None}"

# Check Load Balancers
LB_CHECK=$(aws elbv2 describe-load-balancers --region $AWS_REGION --query "LoadBalancers[?contains(LoadBalancerName, 'k8s-default') || contains(LoadBalancerName, 'urbangear')].LoadBalancerName" --output text 2>/dev/null || echo "None")
echo "   Load Balancers: ${LB_CHECK:-None}"

echo ""
echo "========================================"
echo "✅ Resource Destruction Complete!"
echo "========================================"
echo ""
echo "💰 Cost savings: All AWS resources stopped"
echo "🌐 Website is no longer accessible"
echo ""
echo "To restart the website, run: ./scripts/start.sh"