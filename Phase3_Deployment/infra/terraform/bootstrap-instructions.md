# Terraform Backend Setup Instructions

## Prerequisites
1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.7 installed

## Step 1: Bootstrap the Backend
This creates the S3 bucket and DynamoDB table needed for remote state management.

```bash
cd infra/terraform/envs/bootstrap
terraform init
terraform plan
terraform apply
```

## Step 2: Get Backend Configuration
After applying, note the outputs:

```bash
terraform output backend_config
```

## Step 3: Configure Other Environments
Use the output values to configure backend for other Terraform environments:

```hcl
terraform {
  backend "s3" {
    bucket         = "urbangear-terraform-state-<suffix>"
    key            = "envs/dev/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "urbangear-terraform-locks"
    encrypt        = true
  }
}
```

## Important Notes
- The bootstrap configuration uses local state initially
- After creating the backend, you can migrate this to remote state too
- Keep the bootstrap state file safe - it's needed to destroy the backend resources

## Cleanup
To destroy the backend (careful!):

```bash
cd infra/terraform/envs/bootstrap
terraform destroy
```