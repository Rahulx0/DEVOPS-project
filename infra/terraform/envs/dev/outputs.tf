output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "eks_cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = module.ecr.repository_url
}

output "aws_load_balancer_controller_role_arn" {
  description = "ARN of the AWS Load Balancer Controller IAM role"
  value       = module.eks.aws_load_balancer_controller_role_arn
}

output "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS"
  value       = module.acm.certificate_arn
}

output "certificate_validation_records" {
  description = "DNS validation records for the certificate"
  value       = module.acm.domain_validation_options
}

output "certificate_status" {
  description = "Status of the ACM certificate"
  value       = module.acm.certificate_status
}
