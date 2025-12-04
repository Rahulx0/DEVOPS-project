# 🐧 Arch Linux Setup Guide

## Next Steps for Arch Linux

### 1. Install GitHub CLI

```bash
# Install from official repos
sudo pacman -S github-cli

# Or from AUR (if you prefer)
yay -S github-cli
```

Verify installation:
```bash
gh --version
```

### 2. Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts:
1. Choose: **GitHub.com**
2. Choose: **HTTPS** (recommended)
3. Choose: **Login with a web browser**
4. Copy the one-time code
5. Press Enter to open browser
6. Paste code and authorize

Verify authentication:
```bash
gh auth status
```

### 3. Configure AWS Secrets in GitHub

#### Option A: Via Web Browser

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

   **Secret 1:**
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: Your AWS access key

   **Secret 2:**
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: Your AWS secret key

#### Option B: Via GitHub CLI

```bash
# Set AWS_ACCESS_KEY_ID
gh secret set AWS_ACCESS_KEY_ID

# Set AWS_SECRET_ACCESS_KEY
gh secret set AWS_SECRET_ACCESS_KEY
```

When prompted, paste your AWS credentials.

Verify secrets:
```bash
gh secret list
```

### 4. Verify Prerequisites

Check what you already have:

```bash
# AWS CLI (should already be installed)
aws --version

# Git (should already be installed)
git --version

# GitHub CLI (just installed)
gh --version

# Optional: kubectl (for getting app URL)
kubectl version --client 2>/dev/null || echo "Not installed (optional)"
```

### 5. Deploy Your Website

```bash
cd ~/path/to/urbangear-e-commerce
./scripts/start.sh
```

**What happens:**
1. Checks if gh CLI is installed ✓
2. Verifies GitHub authentication ✓
3. Optionally commits and pushes changes
4. Triggers GitHub Actions workflow
5. Monitors deployment with live progress (15-20 min)
6. Shows application URL when ready

### 6. Monitor Deployment

The script automatically monitors, but you can also:

```bash
# View all workflow runs
gh run list --workflow=deploy-on-demand.yml

# Watch specific run
gh run watch <run-id>

# View logs
gh run view <run-id> --log
```

### 7. Stop When Done

```bash
./scripts/stop.sh
```

This destroys all infrastructure and saves costs.

## 🔧 Arch-Specific Tips

### Install Optional Tools

```bash
# kubectl (to get app URL automatically)
sudo pacman -S kubectl

# jq (for JSON parsing in scripts)
sudo pacman -S jq

# bc (for cost calculations)
sudo pacman -S bc
```

### Update System First

```bash
sudo pacman -Syu
```

### AUR Helper (if needed)

If you don't have `yay`:

```bash
sudo pacman -S --needed git base-devel
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
```

## 🚀 Quick Start Commands

```bash
# 1. Install GitHub CLI
sudo pacman -S github-cli

# 2. Authenticate
gh auth login

# 3. Configure secrets (via CLI)
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY

# 4. Deploy
./scripts/start.sh

# 5. Stop when done
./scripts/stop.sh
```

## 📊 Check Current Status

```bash
./scripts/status.sh
```

## 🎯 Typical Workflow

### For Interviews/Demos

**1 hour before:**
```bash
./scripts/start.sh
```

**During interview:**
- Show live website
- Explain DevOps pipeline
- Discuss cost optimization

**After interview:**
```bash
./scripts/stop.sh
```

### For Development

**Local development:**
```bash
cd app
npm install
npm run dev
# Open http://localhost:5173
```

**Cloud testing:**
```bash
./scripts/start.sh
# Test cloud features
./scripts/stop.sh
```

## 🐛 Troubleshooting

### "gh: command not found"

```bash
sudo pacman -S github-cli
```

### "Not authenticated"

```bash
gh auth login
```

### "Workflow failed"

```bash
gh run list --workflow=deploy-on-demand.yml
gh run view <run-id> --log
```

### "AWS secrets not configured"

```bash
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
```

## 💡 Arch Linux Advantages

- ✅ Rolling release - always latest packages
- ✅ AUR - access to any tool you need
- ✅ Lightweight - fast script execution
- ✅ Pacman - fast package management

## 📚 Documentation

- **DEPLOYMENT-UPDATED.md** - What changed
- **GITHUB-ACTIONS-DEPLOYMENT.md** - Complete guide
- **QUICK-START.md** - Simple guide
- **scripts/README.md** - Script details

## ✅ Checklist

- [ ] Install GitHub CLI: `sudo pacman -S github-cli`
- [ ] Authenticate: `gh auth login`
- [ ] Configure AWS secrets in GitHub
- [ ] Test deployment: `./scripts/start.sh`
- [ ] Verify website is live
- [ ] Stop resources: `./scripts/stop.sh`

## 🎉 You're Ready!

Your Arch Linux system is perfect for this workflow. The scripts will run fast and efficiently.

```bash
./scripts/start.sh
```

---

**BTW, I use Arch** 😎
