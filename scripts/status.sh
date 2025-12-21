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
ALB_URL=$(kubectl get ingress urbangear-frontend-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)
if [ -n "$ALB_URL" ]; then
    echo "   URL:   http://${ALB_URL}"
    echo "   Admin: http://${ALB_URL}/?admin=true"
else
    echo "   Status: ALB still provisioning..."
fi
echo ""

# ArgoCD
echo "🔄 ARGOCD (GitOps)"
echo "----------------------------------------"
if kubectl get namespace argocd &>/dev/null; then
    ARGOCD_PASS=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d)
    echo "   URL:      https://localhost:8080"
    echo "   Username: admin"
    echo "   Password: ${ARGOCD_PASS}"
else
    echo "   Status: Not installed"
fi
echo ""

# Grafana
echo "📊 GRAFANA (Monitoring)"
echo "----------------------------------------"
if kubectl get namespace monitoring &>/dev/null; then
    echo "   URL:      http://localhost:3000"
    echo "   Username: admin"
    echo "   Password: prom-operator"
else
    echo "   Status: Not installed"
fi
echo ""

# Prometheus
echo "📈 PROMETHEUS (Metrics)"
echo "----------------------------------------"
if kubectl get namespace monitoring &>/dev/null; then
    echo "   URL:      http://localhost:9090"
else
    echo "   Status: Not installed"
fi
echo ""

echo "=========================================="
echo "✅ Port-forwarding is running in background"
echo "=========================================="
echo ""
echo "To stop port-forwarding: pkill -f 'kubectl port-forward'"
echo ""
echo "=========================================="
