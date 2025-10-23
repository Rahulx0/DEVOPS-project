# Development Environment Infrastructure
# TODO: Configure backend after bootstrap is complete

terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Backend configuration - created by bootstrap
  backend "s3" {
    bucket         = "urbangear-terraform-state-cda6af11"
    key            = "envs/dev/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "urbangear-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "urbangear-ecommerce"
      Environment = "dev"
      ManagedBy   = "terraform"
    }
  }
}

# VPC and Networking
module "vpc" {
  source = "../../modules/vpc"
  
  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr            = "10.0.0.0/16"
  public_subnet_count = 2
  private_subnet_count = 2
  enable_nat_gateway  = true
  nat_gateway_count   = 2
}

# EKS Cluster
module "eks" {
  source = "../../modules/eks"
  
  project_name              = var.project_name
  environment               = var.environment
  vpc_id                    = module.vpc.vpc_id
  public_subnet_ids         = module.vpc.public_subnet_ids
  private_subnet_ids        = module.vpc.private_subnet_ids
  cluster_security_group_id = module.vpc.eks_cluster_security_group_id
  
  kubernetes_version = "1.28"
  instance_types     = ["t3.medium"]
  desired_capacity   = 2
  max_capacity       = 4
  min_capacity       = 1
}

# ECR Repository
module "ecr" {
  source = "../../modules/ecr"
  
  project_name         = var.project_name
  environment          = var.environment
  image_tag_mutability = "MUTABLE"
  scan_on_push         = true
  max_image_count      = 10
}

# Future modules:
# - Route53 and ACM certificates