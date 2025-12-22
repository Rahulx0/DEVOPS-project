# Variable for bucket name
variable "bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  type        = string
}

# Variable for DynamoDB table name
variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table for Terraform state locking"
  type        = string
  default     = "terraform-state-lock"
}

# Variable for environment
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}