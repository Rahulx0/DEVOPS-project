# 🔧 Fix Git Sync Issues

## Current Issue

You're seeing:
```
error: failed to push some refs
hint: Updates were rejected because the remote contains work that you do not have locally
```

And:
```
HTTP 404: workflow deploy-on-demand.yml not found on the default branch
```

## Quick Fix

### Option 1: Use Sync Script (Recommended)

```bash
./scripts/sync-repo.sh
```

This will:
1. ✅ Commit your changes
2. ✅ Pull remote changes
3. ✅ Merge automatically
4. ✅ Push to remote
5. ✅ Check if workflow exists

### Option 2: Manual Fix

```bash
# 1. Pull remote changes
git pull --rebase origin rahul

# 2. Push your changes
git push origin rahul

# 3. Check if workflow exists
gh workflow list

# 4. If workflow not found, merge to main
git checkout main
git merge rahul
git push origin main

# 5. Now deploy
./scripts/start.sh
```

## Why This Happened

1. **Remote has changes**: Someone (or another process) pushed to the remote
2. **Workflow not on default branch**: GitHub Actions workflows must be on the default branch (usually `main` or `master`)

## Solution Steps

### Step 1: Sync Your Repository

```bash
cd scripts
bash sync-repo.sh
```

### Step 2: Merge to Default Branch

If you're on a feature branch (`rahul`), you need to merge to the default branch:

```bash
# Check current branch
git branch --show-current

# If on feature branch, merge to main
git checkout main
git pull origin main
git merge rahul
git push origin main
```

### Step 3: Deploy

```bash
./scripts/start.sh
```

## Understanding the Workflow

GitHub Actions workflows must be on the **default branch** to be triggered. 

**Your situation:**
- Current branch: `rahul`
- Default branch: probably `main` or `master`
- Workflow file: `.github/workflows/deploy-on-demand.yml`

**Solution:**
The workflow file needs to be on the default branch.

## Quick Commands

### Check which branch has the workflow

```bash
# List workflows
gh workflow list

# If empty, workflow not on default branch
```

### Merge feature branch to main

```bash
git checkout main
git pull origin main
git merge rahul
git push origin main
```

### Verify workflow exists

```bash
gh workflow list
# Should show: Deploy On-Demand
```

### Now deploy

```bash
./scripts/start.sh
```

## Alternative: Deploy from Main Branch

If you want to deploy from main branch directly:

```bash
# Switch to main
git checkout main

# Pull latest
git pull origin main

# Merge your feature branch
git merge rahul

# Push
git push origin main

# Deploy
./scripts/start.sh
```

## Troubleshooting

### "Workflow still not found"

Wait 1-2 minutes after pushing, then:
```bash
gh workflow list
```

### "Merge conflicts"

```bash
# See conflicts
git status

# Resolve conflicts in your editor
# Then:
git add .
git commit -m "Resolve conflicts"
git push origin main
```

### "Can't push to main"

If main branch is protected:
1. Create a Pull Request
2. Merge via GitHub UI
3. Then run `./scripts/start.sh`

## Best Practice

For future deployments:

1. **Work on feature branches** for development
2. **Merge to main** when ready to deploy
3. **Deploy from main** branch
4. **Keep main stable** and deployable

## Quick Reference

```bash
# Sync repository
./scripts/sync-repo.sh

# Merge to main
git checkout main
git merge rahul
git push origin main

# Deploy
./scripts/start.sh

# Stop
./scripts/stop.sh
```

---

**Need help?** Run `./scripts/sync-repo.sh` - it will guide you through the process!
