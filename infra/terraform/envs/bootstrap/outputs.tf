# Output the S3 bucket name for Terraform state
output "backend_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  value       = module.backend.s3_bucket_name
}

# Output the DynamoDB table name for state locking
output "backend_dynamodb_table" {
  description = "Name of the DynamoDB table for state locking"
  value       = module.backend.dynamodb_table_name
}

# Output the backend configuration for other Terraform configs
output "backend_config" {
  description = "Backend configuration for other Terraform configs"
  value = {
    bucket         = module.backend.s3_bucket_name
    key            = "terraform.tfstate"
    region         = var.aws_region
    dynamodb_table = module.backend.dynamodb_table_name
    encrypt        = true
  }
}