#!/bin/bash
# Get all access details and start port-forwarding automatically

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
EKS_CLUSTER="urbangear-dev-cluster"

echo "=========================================="
echo "🔍 Fetching DevOps Stack Status"
echo "=========================================="
echo ""

# Update kubeconfig
aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER 2>/dev/null

echo "📊 Cluster Status:"
echo "=========================================="
kubectl get nodes
echo ""

echo "📦 Pod Status:"
echo "=========================================="
kubectl get pods -A | grep -v "Completed"
echo ""

# Kill any existing port-forwards
echo "🔄 Setting up port-forwarding..."
pkill -f "kubectl port-forward" 2>/dev/null || true
sleep 2

# Start port-forwarding in background
echo "   Starting ArgoCD port-forward (8080)..."
kubectl port-forward svc/argocd-server -n argocd 8080:443 &>/dev/null &
ARGOCD_PID=$!

echo "   Starting Grafana port-forward (3000)..."
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80 &>/dev/null &
GRAFANA_PID=$!

echo "   Starting Prometheus port-forward (9090)..."
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090 &>/dev/null &
PROMETHEUS_PID=$!

sleep 3

echo ""
echo "=========================================="
echo "🎉 ACCESS DETAILS (Port-forwarding active)"
echo "=========================================="
echo ""

# Application URL
echo "🌐 APPLICATION"
echo "----------------------------------------"
# Try to get ALB URL from ingress
ALB_URL=$(kubectl get ingress urbangear-frontend-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

# If ingress not found, try service
if [ -z "$ALB_URL" ]; then
    ALB_URL=$(kubectl get svc urbangear-frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
fi

# Check if ALB URL is available and display application URLs
if [ -n "$ALB_URL" ] && [ "$ALB_URL" != "null" ]; then
    echo "   URL:   http://${ALB_URL}"
    echo "   Admin: http://${ALB_URL}/?admin=true"
else
    echo "   Status: ALB still provisioning..."
    # Show service status for debugging
    echo "   Debug: Checking services..."
    kubectl get svc,ingress 2>/dev/null | grep urbangear || echo "   No urbangear services found"
fi
echo ""

# ArgoCD
echo "🔄 ARGOCD (GitOps)"
echo "----------------------------------------"
# Check if ArgoCD is running by looking for pods
if kubectl get pods -n argocd 2>/dev/null | grep -q "argocd-server.*Running"; then
    echo "   URL:      https://localhost:8080"
    echo "   Username: admin"
    
    # Try multiple methods to get ArgoCD password
    ARGOCD_PASS=""
    
    # Method 1: Try the initial admin secret
    ARGOCD_PASS=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d 2>/dev/null || echo "")
    
    # Method 2: If secret doesn't exist, generate/reset password
    if [ -z "$ARGOCD_PASS" ]; then
        echo "   Status: Generating admin password..."
        # Get the server pod name
        SERVER_POD=$(kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-server -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
        if [ -n "$SERVER_POD" ]; then
            # Try to get current password or set a new one
            ARGOCD_PASS=$(kubectl -n argocd exec $SERVER_POD -- argocd admin initial-password 2>/dev/null | head -1 || echo "")
        fi
    fi
    
    # Method 3: Default fallback
    if [ -z "$ARGOCD_PASS" ]; then
        ARGOCD_PASS="admin"
        echo "   Note: Using default password. Reset via: kubectl -n argocd patch secret argocd-secret -p '{\"data\":{\"admin.password\":null,\"admin.passwordMtime\":null}}'"
    fi
    
    echo "   Password: ${ARGOCD_PASS}"
else
    echo "   Status: Not running (check pods above)"
fi
echo ""

# Grafana
echo "📊 GRAFANA (Monitoring)"
echo "----------------------------------------"
# Check if Grafana is running by looking for pods
if kubectl get pods -n monitoring 2>/dev/null | grep -q "prometheus-grafana"; then
    echo "   URL:      http://localhost:3000"
    echo "   Username: admin"
    
    # Try multiple methods to get Grafana password
    GRAFANA_PASS=""
    
    # Method 1: Try prometheus-grafana secret
    GRAFANA_PASS=$(kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" 2>/dev/null | base64 -d 2>/dev/null || echo "")
    
    # Method 2: If not found, try alternative secret names
    if [ -z "$GRAFANA_PASS" ]; then
        GRAFANA_PASS=$(kubectl get secret -n monitoring -l app.kubernetes.io/name=grafana -o jsonpath="{.items[0].data.admin-password}" 2>/dev/null | base64 -d 2>/dev/null || echo "")
    fi
    
    # Method 3: Default password
    if [ -z "$GRAFANA_PASS" ]; then
        GRAFANA_PASS="prom-operator"
    fi
    
    echo "   Password: $GRAFANA_PASS"
else
    echo "   Status: Not installed"
fi
echo ""

# Prometheus
echo "📈 PROMETHEUS (Metrics)"
echo "----------------------------------------"
# Check if Prometheus is running by looking for pods
if kubectl get pods -n monitoring 2>/dev/null | grep -q "prometheus-prometheus"; then
    echo "   URL:      http://localhost:9090"
else
    echo "   Status: Not installed"
fi
echo ""

echo "=========================================="
echo "✅ Port-forwarding is running in background"
echo "=========================================="
echo ""

# Add overall status summary
echo "📋 DEPLOYMENT SUMMARY"
echo "----------------------------------------"
APP_PODS=$(kubectl get pods -l app=urbangear-frontend --no-headers 2>/dev/null | wc -l)
ARGOCD_PODS=$(kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-server --no-headers 2>/dev/null | wc -l)
GRAFANA_PODS=$(kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana --no-headers 2>/dev/null | wc -l)

echo "   Application Pods: $APP_PODS"
echo "   ArgoCD Status: $([ $ARGOCD_PODS -gt 0 ] && echo "✅ Running" || echo "❌ Not Running")"
echo "   Monitoring Status: $([ $GRAFANA_PODS -gt 0 ] && echo "✅ Running" || echo "❌ Not Running")"

# Show cost information
echo ""
echo "💰 COST STATUS"
echo "----------------------------------------"
NODES=$(kubectl get nodes --no-headers 2>/dev/null | wc -l)
echo "   Active Nodes: $NODES (t3.small SPOT instances)"
echo "   Estimated Cost: ~$$(echo "$NODES * 0.01" | bc 2>/dev/null || echo "0.02")/hour"

echo ""
echo "To stop port-forwarding: pkill -f 'kubectl port-forward'"
echo "To destroy all resources: ./Phase2_CI_CD/scripts/stop.sh"
echo ""
echo "=========================================="
