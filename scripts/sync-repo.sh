#!/bin/bash
# Sync Repository Script
# Fixes git conflicts and syncs with remote

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$WORKSPACE_ROOT"

echo "=========================================="
echo "🔄 Repository Sync"
echo "=========================================="
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "You have uncommitted changes."
    echo ""
    git status --short
    echo ""
    read -p "Commit these changes? (yes/no): " commit_changes
    
    if [ "$commit_changes" = "yes" ]; then
        read -p "Commit message: " commit_msg
        git add .
        git commit -m "${commit_msg:-Sync repository}"
        echo "✓ Changes committed"
    else
        echo "⚠️  Stashing changes..."
        git stash
        echo "✓ Changes stashed (restore with: git stash pop)"
    fi
    echo ""
fi

# Fetch latest changes
echo "Fetching latest changes from remote..."
git fetch origin
echo "✓ Fetched"
echo ""

# Check if behind remote
LOCAL=$(git rev-parse @ 2>/dev/null || echo "")
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "Your branch is behind remote."
    echo ""
    read -p "Pull and merge? (yes/no): " pull_changes
    
    if [ "$pull_changes" = "yes" ]; then
        echo "Pulling changes..."
        git pull --rebase origin $CURRENT_BRANCH
        echo "✓ Pulled and merged"
    else
        echo "⚠️  Skipping pull"
    fi
    echo ""
fi

# Push changes
echo "Pushing to remote..."
if git push origin $CURRENT_BRANCH 2>&1; then
    echo "✓ Pushed successfully"
else
    echo "⚠️  Push failed or nothing to push"
fi

echo ""
echo "=========================================="
echo "✅ Repository Synced!"
echo "=========================================="
echo ""

# Check if workflow exists on remote
echo "Checking for workflow file..."
if gh workflow list 2>/dev/null | grep -q "Deploy On-Demand"; then
    echo "✓ Workflow 'Deploy On-Demand' found"
    echo ""
    echo "You can now run: ./scripts/start.sh"
else
    echo "⚠️  Workflow 'Deploy On-Demand' not found on default branch"
    echo ""
    echo "If you're on a feature branch ($CURRENT_BRANCH):"
    echo "  1. Merge to main/master branch"
    echo "  2. Or push workflow to default branch"
    echo ""
    echo "Available workflows:"
    gh workflow list 2>/dev/null || echo "  None found"
fi

echo ""
