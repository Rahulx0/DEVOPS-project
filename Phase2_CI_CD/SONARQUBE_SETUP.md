# SonarQube Integration Guide

## 🎯 Overview
This guide will help you integrate SonarQube/SonarCloud for code quality analysis in your UrbanGear e-commerce project.

## 📋 Prerequisites
- GitHub account
- Repository pushed to GitHub
- Admin access to your repository

---

## 🚀 Option 1: SonarCloud (Recommended - Free)

### Step 1: Sign Up for SonarCloud
1. Go to [sonarcloud.io](https://sonarcloud.io)
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"**
4. Authorize SonarCloud to access your GitHub account

### Step 2: Import Your Repository
1. Click **"+"** → **"Analyze new project"**
2. Select your **urbangear-e-commerce** repository
3. Click **"Set Up"**

### Step 3: Get Your Organization Key
1. In SonarCloud, go to **"My Account"** → **"Organizations"**
2. Copy your **organization key** (e.g., `your-github-username`)
3. Update `sonar-project.properties`:
   ```properties
   sonar.organization=your-github-username
   ```

### Step 4: Generate SonarCloud Token
1. Go to **"My Account"** → **"Security"**
2. Click **"Generate Tokens"**
3. Name: `GitHub Actions`
4. Type: **User Token**
5. Click **"Generate"**
6. **Copy the token** (you won't see it again!)

### Step 5: Add Token to GitHub Secrets
1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `SONAR_TOKEN`
5. Value: [paste your SonarCloud token]
6. Click **"Add secret"**

### Step 6: Configure Analysis Method
1. In SonarCloud, select your project
2. Go to **"Administration"** → **"Analysis Method"**
3. Choose **"GitHub Actions"**
4. Turn **OFF** "Automatic Analysis"

### Step 7: Push Changes
```bash
git add .
git commit -m "Add SonarQube integration"
git push origin rahul
```

### Step 8: View Results
1. Go to your GitHub Actions tab
2. Wait for the workflow to complete
3. Go to [sonarcloud.io](https://sonarcloud.io)
4. View your project dashboard with:
   - **Bugs**
   - **Vulnerabilities**
   - **Code Smells**
   - **Coverage**
   - **Duplications**
   - **Security Hotspots**

---

## 🏢 Option 2: Self-Hosted SonarQube (Advanced)

### Requirements
- Server with 2GB+ RAM
- Docker installed

### Quick Setup with Docker
```bash
# Run SonarQube container
docker run -d --name sonarqube \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  sonarqube:latest

# Access at http://localhost:9000
# Default credentials: admin/admin
```

### Configure Project
1. Login to SonarQube (http://localhost:9000)
2. Create new project
3. Generate token
4. Add token to GitHub Secrets as `SONAR_TOKEN`
5. Update `sonar-project.properties`:
   ```properties
   sonar.host.url=http://your-server:9000
   ```

---

## 📊 Understanding SonarQube Metrics

### Quality Gate
- **Passed**: Code meets quality standards
- **Failed**: Issues need attention

### Key Metrics
- **Bugs**: Actual errors in code
- **Vulnerabilities**: Security issues
- **Code Smells**: Maintainability issues
- **Coverage**: % of code tested
- **Duplications**: Repeated code blocks
- **Technical Debt**: Time to fix all issues

### Ratings (A-E)
- **A**: Excellent (0-5% issues)
- **B**: Good (6-10%)
- **C**: Average (11-20%)
- **D**: Poor (21-50%)
- **E**: Very Poor (>50%)

---

## 🎯 Quality Goals

### Recommended Targets
- **Bugs**: 0
- **Vulnerabilities**: 0
- **Code Coverage**: >80%
- **Duplications**: <3%
- **Maintainability Rating**: A or B
- **Reliability Rating**: A
- **Security Rating**: A

---

## 🔧 Local Analysis (Optional)

### Install SonarScanner
```bash
# macOS
brew install sonar-scanner

# Linux
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
unzip sonar-scanner-cli-5.0.1.3006-linux.zip
export PATH=$PATH:$PWD/sonar-scanner-5.0.1.3006-linux/bin
```

### Run Local Scan
```bash
# From project root
sonar-scanner \
  -Dsonar.projectKey=urbangear-ecommerce \
  -Dsonar.sources=app/src \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=YOUR_TOKEN
```

---

## 🐛 Troubleshooting

### Issue: "No analysis found"
**Solution**: Make sure you disabled "Automatic Analysis" in SonarCloud

### Issue: "Coverage not showing"
**Solution**: 
1. Install test dependencies:
   ```bash
   cd app
   npm install --save-dev vitest @vitest/coverage-v8
   ```
2. Run tests with coverage:
   ```bash
   npm run test:coverage
   ```

### Issue: "Token authentication failed"
**Solution**: 
1. Regenerate token in SonarCloud
2. Update GitHub secret `SONAR_TOKEN`

### Issue: "Project not found"
**Solution**: Check `sonar.projectKey` matches your SonarCloud project key

---

## 📈 Next Steps

1. **Review Dashboard**: Check your code quality metrics
2. **Fix Issues**: Start with bugs and vulnerabilities
3. **Add Tests**: Improve code coverage
4. **Set Quality Gate**: Define your quality standards
5. **Monitor Trends**: Track improvements over time

---

## 🔗 Useful Links

- [SonarCloud Dashboard](https://sonarcloud.io)
- [SonarQube Documentation](https://docs.sonarqube.org)
- [Quality Gate Documentation](https://docs.sonarqube.org/latest/user-guide/quality-gates/)
- [SonarCloud GitHub Action](https://github.com/SonarSource/sonarcloud-github-action)

---

## 💡 Pro Tips

1. **Run locally before pushing** to catch issues early
2. **Set up pre-commit hooks** to enforce quality
3. **Review SonarCloud reports** in pull requests
4. **Focus on new code** - don't try to fix everything at once
5. **Use quality gate** to block merging of poor quality code

---

## 🎉 Success!

Once configured, every push will automatically:
- ✅ Analyze code quality
- ✅ Check for bugs and vulnerabilities
- ✅ Calculate code coverage
- ✅ Report results in GitHub Actions
- ✅ Show quality badge in README

Your code quality journey starts now! 🚀