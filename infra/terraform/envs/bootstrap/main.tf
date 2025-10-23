# Bootstrap Terraform Backend
# This creates the S3 bucket and DynamoDB table needed for remote state
# Run this FIRST before any other Terraform configurations

terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "urbangear-ecommerce"
      Environment = "bootstrap"
      ManagedBy   = "terraform"
    }
  }
}

# Generate a unique bucket name
locals {
  bucket_name = "${var.project_name}-terraform-state-${random_id.bucket_suffix.hex}"
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

module "backend" {
  source = "../../modules/backend"
  
  bucket_name          = local.bucket_name
  dynamodb_table_name  = "${var.project_name}-terraform-locks"
  environment          = "bootstrap"
}