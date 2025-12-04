#!/bin/bash
# Deploy script - triggers workflow and starts port-forward

set -e

export AWS_PAGER=""
AWS_REGION="${AWS_REGION:-us-west-2}"
EKS_CLUSTER="urbangear-dev-cluster"

echo "🚀 Deploying Website"
echo ""

# Push changes to trigger workflow
git add . 2>/dev/null || true
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || echo "No changes to commit"
git push origin rahul 2>/dev/null || echo "Already up to date"

echo ""
echo "⏳ Waiting for workflow to complete..."
echo ""

# Get latest run and wait
sleep 5
RUN_ID=$(gh run list --workflow="Build and Deploy" --branch rahul --limit 1 --json databaseId -q '.[0].databaseId')

if [ -n "$RUN_ID" ]; then
    echo "Watching workflow run: $RUN_ID"
    gh run watch $RUN_ID --exit-status || {
        echo "❌ Workflow failed! Check: gh run view $RUN_ID --log-failed"
        exit 1
    }
fi

echo ""
echo "✅ Deployment complete!"
echo ""

# Update kubeconfig
aws eks update-kubeconfig --name $EKS_CLUSTER --region $AWS_REGION

# Check pods
echo "📦 Pods:"
kubectl get pods -l app=urbangear-frontend

echo ""
echo "🌐 Starting port-forward..."
echo ""
echo "Access your website at: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop"
echo ""

kubectl port-forward svc/urbangear-frontend 8080:80
