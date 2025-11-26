#!/bin/bash
# Start Script - Deploy website via GitHub Actions
# This triggers the deployment workflow and monitors progress

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
export AWS_REGION="${AWS_REGION:-us-west-2}"

echo "=========================================="
echo "🚀 Starting Website Deployment"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed!"
    echo ""
    echo "Install it with:"
    echo "  • Ubuntu/Debian: sudo apt install gh"
    echo "  • macOS: brew install gh"
    echo "  • Or visit: https://cli.github.com/"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &>/dev/null; then
    echo "❌ Not authenticated with GitHub!"
    echo ""
    echo "Run: gh auth login"
    echo ""
    exit 1
fi

echo "✓ GitHub CLI installed and authenticated"
echo ""

# Get current branch and repo
cd "$WORKSPACE_ROOT"
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")

if [ -z "$REPO" ]; then
    echo "❌ Not in a GitHub repository!"
    echo "Make sure you're in the project directory and it's a GitHub repo."
    exit 1
fi

echo "Repository: $REPO"
echo "Branch: $CURRENT_BRANCH"
echo ""

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "⚠️  You have uncommitted changes."
    read -p "Commit and push them? (yes/no): " commit_changes
    
    if [ "$commit_changes" = "yes" ]; then
        echo ""
        read -p "Commit message: " commit_msg
        git add .
        git commit -m "${commit_msg:-Deploy website}"
        git push origin $CURRENT_BRANCH
        echo "✓ Changes committed and pushed"
        echo ""
    else
        echo "⚠️  Continuing with existing code..."
        echo ""
    fi
fi

# Trigger the workflow
echo "=========================================="
echo "🎬 Triggering Deployment Workflow"
echo "=========================================="
echo ""

echo "Triggering 'Deploy On-Demand' workflow with action: deploy"
echo ""

# Trigger the workflow
gh workflow run deploy-on-demand.yml \
    --ref $CURRENT_BRANCH \
    -f action=deploy

echo "✓ Workflow triggered!"
echo ""
echo "Waiting for workflow to start..."
sleep 5

# Get the latest workflow run
RUN_ID=$(gh run list --workflow=deploy-on-demand.yml --limit 1 --json databaseId -q '.[0].databaseId')

if [ -z "$RUN_ID" ]; then
    echo "❌ Could not find workflow run!"
    echo "Check manually: gh run list"
    exit 1
fi

echo "✓ Workflow started (Run ID: $RUN_ID)"
echo ""

# Watch the workflow
echo "=========================================="
echo "📊 Monitoring Deployment Progress"
echo "=========================================="
echo ""
echo "This will take approximately 15-20 minutes..."
echo ""

# Watch the workflow with live updates
gh run watch $RUN_ID --exit-status

# Check if successful
RUN_STATUS=$(gh run view $RUN_ID --json conclusion -q .conclusion)

echo ""
echo "=========================================="

if [ "$RUN_STATUS" = "success" ]; then
    echo "✅ Deployment Successful!"
    echo "=========================================="
    echo ""
    
    # Try to get the application URL from workflow logs
    echo "Getting application details..."
    echo ""
    
    # Wait a bit for resources to be ready
    sleep 10
    
    # Get LoadBalancer URL
    if command -v kubectl &> /dev/null; then
        # Update kubeconfig
        aws eks update-kubeconfig --name urbangear-dev-cluster --region $AWS_REGION &>/dev/null || true
        
        echo "Checking for application URL..."
        for i in {1..6}; do
            LB_URL=$(kubectl get svc urbangear-frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
            if [ -n "$LB_URL" ]; then
                echo "🌐 Application URL: http://$LB_URL"
                break
            fi
            if [ $i -lt 6 ]; then
                echo "  ⏳ Waiting for LoadBalancer... (attempt $i/6)"
                sleep 10
            fi
        done
        
        if [ -z "$LB_URL" ]; then
            echo "⏳ LoadBalancer is still provisioning"
            echo "   Run this command in a few minutes:"
            echo "   kubectl get svc urbangear-frontend"
        fi
    else
        echo "💡 Install kubectl to get the application URL automatically"
        echo "   Or check the workflow logs for the URL"
    fi
    
    echo ""
    echo "📊 View deployment details:"
    echo "   gh run view $RUN_ID"
    echo ""
    echo "💰 Current cost: ~\$0.18/hour (~\$4/day)"
    echo ""
    echo "⚠️  Remember to stop when done:"
    echo "   ./scripts/stop.sh"
    echo ""
    
else
    echo "❌ Deployment Failed!"
    echo "=========================================="
    echo ""
    echo "View error details:"
    echo "   gh run view $RUN_ID"
    echo ""
    echo "View logs:"
    echo "   gh run view $RUN_ID --log"
    echo ""
    exit 1
fi
