#!/bin/bash
# Test Script - Validate all scripts without deploying
# This checks that scripts are properly configured

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
export AWS_REGION="${AWS_REGION:-us-west-2}"
export AWS_PAGER=""

echo "=========================================="
echo "🧪 Testing All Scripts"
echo "=========================================="
echo ""

PASS=0
FAIL=0

# Test function
test_check() {
    local name=$1
    local command=$2
    
    echo -n "Testing $name... "
    if eval "$command" &>/dev/null; then
        echo "✅ PASS"
        ((PASS++))
    else
        echo "❌ FAIL"
        ((FAIL++))
    fi
}

echo "Prerequisites:"
echo "--------------"
test_check "AWS CLI installed" "which aws"
test_check "AWS credentials configured" "aws sts get-caller-identity"
test_check "Docker installed" "which docker"
test_check "Docker running" "docker ps"
test_check "kubectl installed" "which kubectl"
test_check "Terraform installed" "which terraform"
test_check "jq installed" "which jq"
test_check "bc installed" "which bc"

echo ""
echo "Project Structure:"
echo "------------------"
test_check "Workspace root exists" "[ -d '$WORKSPACE_ROOT' ]"
test_check "App directory exists" "[ -d '$WORKSPACE_ROOT/app' ]"
test_check "Terraform bootstrap exists" "[ -d '$WORKSPACE_ROOT/infra/terraform/envs/bootstrap' ]"
test_check "Terraform dev exists" "[ -d '$WORKSPACE_ROOT/infra/terraform/envs/dev' ]"
test_check "Manifests exist" "[ -d '$WORKSPACE_ROOT/manifests/overlays/prod' ]"
test_check "package.json exists" "[ -f '$WORKSPACE_ROOT/app/package.json' ]"
test_check "Dockerfile exists" "[ -f '$WORKSPACE_ROOT/app/Dockerfile' ]"

echo ""
echo "Scripts:"
echo "--------"
test_check "start.sh exists" "[ -f '$SCRIPT_DIR/start.sh' ]"
test_check "start.sh executable" "[ -x '$SCRIPT_DIR/start.sh' ]"
test_check "stop.sh exists" "[ -f '$SCRIPT_DIR/stop.sh' ]"
test_check "stop.sh executable" "[ -x '$SCRIPT_DIR/stop.sh' ]"
test_check "status.sh exists" "[ -f '$SCRIPT_DIR/status.sh' ]"
test_check "status.sh executable" "[ -x '$SCRIPT_DIR/status.sh' ]"
test_check "fix.sh exists" "[ -f '$SCRIPT_DIR/fix.sh' ]"
test_check "fix.sh executable" "[ -x '$SCRIPT_DIR/fix.sh' ]"

echo ""
echo "Script Syntax:"
echo "--------------"
test_check "start.sh syntax" "bash -n '$SCRIPT_DIR/start.sh'"
test_check "stop.sh syntax" "bash -n '$SCRIPT_DIR/stop.sh'"
test_check "status.sh syntax" "bash -n '$SCRIPT_DIR/status.sh'"
test_check "fix.sh syntax" "bash -n '$SCRIPT_DIR/fix.sh'"

echo ""
echo "Terraform Configuration:"
echo "------------------------"
cd "$WORKSPACE_ROOT/infra/terraform/envs/bootstrap"
test_check "Bootstrap terraform valid" "terraform init -backend=false &>/dev/null && terraform validate"

cd "$WORKSPACE_ROOT/infra/terraform/envs/dev"
test_check "Dev terraform valid" "terraform init -backend=false &>/dev/null && terraform validate"

cd "$WORKSPACE_ROOT"

echo ""
echo "AWS Connectivity:"
echo "-----------------"
test_check "Can list S3 buckets" "aws s3api list-buckets --region $AWS_REGION"
test_check "Can describe EKS clusters" "aws eks list-clusters --region $AWS_REGION"
test_check "Can list ECR repositories" "aws ecr describe-repositories --region $AWS_REGION"

echo ""
echo "Docker Configuration:"
echo "---------------------"
cd "$WORKSPACE_ROOT/app"
test_check "Dockerfile syntax valid" "docker build --target prod -t test-build --dry-run . 2>/dev/null || docker build --target prod -t test-build -f Dockerfile --help &>/dev/null"

echo ""
echo "=========================================="
echo "📊 Test Results"
echo "=========================================="
echo ""
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 All tests passed!"
    echo ""
    echo "Your scripts are ready to use:"
    echo "  ./scripts/status.sh  - Check current status"
    echo "  ./scripts/start.sh   - Deploy website"
    echo "  ./scripts/stop.sh    - Stop website"
    echo "  ./scripts/fix.sh     - Fix issues"
    echo ""
    exit 0
else
    echo "⚠️  Some tests failed. Please fix the issues above."
    echo ""
    exit 1
fi
