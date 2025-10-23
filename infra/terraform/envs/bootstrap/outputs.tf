output "backend_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  value       = module.backend.s3_bucket_name
}

output "backend_dynamodb_table" {
  description = "Name of the DynamoDB table for state locking"
  value       = module.backend.dynamodb_table_name
}

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