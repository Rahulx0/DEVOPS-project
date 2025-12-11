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
    bucket         = "urbangear"
    key            = "envs/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "urbangear"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
  
  default_tags {
    tags = {
      Project     = "urbangear-ecommerce"
      Environment = "dev"
      ManagedBy   = "terraform"
    }
  }
}

# VPC and Networking - Cost Optimized
module "vpc" {
  source = "../../modules/vpc"
  
  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr            = "10.0.0.0/16"
  public_subnet_count = 2
  private_subnet_count = 2
  enable_nat_gateway  = true
  nat_gateway_count   = 1  # Single NAT gateway saves $0.045/hour
}

# EKS Cluster - Cost Optimized
module "eks" {
  source = "../../modules/eks"
  
  project_name              = var.project_name
  environment               = var.environment
  vpc_id                    = module.vpc.vpc_id
  public_subnet_ids         = module.vpc.public_subnet_ids
  private_subnet_ids        = module.vpc.private_subnet_ids
  cluster_security_group_id = module.vpc.eks_cluster_security_group_id
  
  kubernetes_version = "1.28"
  instance_types     = ["t3.small"]  # $0.0208/hour vs t3.medium $0.0416/hour
  desired_capacity   = 1             # Single node for demo
  max_capacity       = 2
  min_capacity       = 1
  capacity_type      = "SPOT"        # 70% cost savings
  disk_size          = 20
}

# ECR Repository - Cost Optimized
module "ecr" {
  source = "../../modules/ecr"
  
  project_name         = var.project_name
  environment          = var.environment
  image_tag_mutability = "MUTABLE"
  scan_on_push         = false  # Disable scanning to save costs
  max_image_count      = 5      # Keep fewer images
}

# Future modules:
# - Route53 and ACM certificates