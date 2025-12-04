#!/bin/bash
# Simple deployment script - triggers build and deploy workflow

set -e

echo "🚀 Deploying Website"
echo ""

# Commit and push to trigger workflow
echo "Committing changes..."
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

echo "Pushing to rahul branch..."
git push origin rahul

echo ""
echo "✅ Pushed to rahul branch!"
echo ""
echo "The 'Build and Deploy' workflow will start automatically."
echo ""
echo "View progress:"
echo "  https://github.com/Rahulx0/DEVOPS-project/actions"
echo ""
echo "Or watch in terminal:"
echo "  gh run watch"
echo ""
