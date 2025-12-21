#!/bin/bash
# Trigger Complete DevOps Stack Deployment

set -e

echo "=========================================="
echo "🚀 Deploying Complete DevOps Stack"
echo "=========================================="
echo ""
echo "This will install:"
echo "  ✅ AWS Load Balancer Controller"
echo "  ✅ ArgoCD (GitOps)"
echo "  ✅ Prometheus + Grafana (Monitoring)"
echo "  ✅ RBAC (Access Control)"
echo "  ✅ Network Policies (Security)"
echo ""
echo "And deploy your application with:"
echo "  ✅ Docker Build & Push to ECR"
echo "  ✅ 256 Unit Tests (98.61% coverage)"
echo "  ✅ SonarCloud Code Quality"
echo "  ✅ Trivy Security Scan"
echo ""

# Check git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "rahul" ]; then
    echo "⚠️  Warning: You're not on 'rahul' branch"
    read -p "Switch to 'rahul' branch? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout rahul
        echo "✅ Switched to 'rahul' branch"
    fi
fi

# Trigger workflow
echo ""
echo "Creating empty commit..."
git commit --allow-empty -m "deploy: complete devops stack - $(date '+%Y-%m-%d %H:%M:%S')"

echo "Pushing to GitHub..."
git push origin $(git branch --show-current)

echo ""
echo "=========================================="
echo "✅ Deployment Triggered!"
echo "=========================================="
echo ""
echo "Monitor: https://github.com/Rahulx0/DEVOPS-project/actions"
echo ""
echo "Expected time: ~8-12 minutes"
echo ""
echo "What's being installed:"
echo "  1. ALB Controller (for external access)"
echo "  2. ArgoCD (GitOps automation)"
echo "  3. Prometheus + Grafana (monitoring)"
echo "  4. RBAC roles (access control)"
echo "  5. Network policies (pod security)"
echo ""
echo "After completion, access:"
echo "  • App: kubectl get ingress"
echo "  • ArgoCD: kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "  • Grafana: kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80"
echo ""
echo "=========================================="
