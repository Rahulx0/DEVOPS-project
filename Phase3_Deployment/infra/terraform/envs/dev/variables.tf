# Variable for AWS region
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

# Variable for project name
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "urbangear"
}

# Variable for environment
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

# Variable for EKS configuration
variable "eks_config" {
  description = "EKS cluster configuration"
  type = object({
    kubernetes_version = string
    instance_types     = list(string)
    desired_capacity   = number
    max_capacity       = number
    min_capacity       = number
    capacity_type      = string
    disk_size          = number
  })
  default = {
    kubernetes_version = "1.28"
    instance_types     = ["t3.small"]
    desired_capacity   = 1
    max_capacity       = 2
    min_capacity       = 1
    capacity_type      = "SPOT"
    disk_size          = 20
  }
}

# Variable for VPC configuration
variable "vpc_config" {
  description = "VPC network configuration"
  type = object({
    vpc_cidr             = string
    public_subnet_count  = number
    private_subnet_count = number
    enable_nat_gateway   = bool
    nat_gateway_count    = number
  })
  default = {
    vpc_cidr             = "10.0.0.0/16"
    public_subnet_count  = 2
    private_subnet_count = 2
    enable_nat_gateway   = true
    nat_gateway_count    = 1
  }
}

# Variable for ECR configuration
variable "ecr_config" {
  description = "ECR repository configuration"
  type = object({
    image_tag_mutability = string
    scan_on_push         = bool
    max_image_count      = number
  })
  default = {
    image_tag_mutability = "MUTABLE"
    scan_on_push         = false
    max_image_count      = 5
  }
}