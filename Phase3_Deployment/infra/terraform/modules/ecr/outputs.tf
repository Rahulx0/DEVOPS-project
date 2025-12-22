# Output repository ARN
output "repository_arn" {
  description = "Full ARN of the repository"
  value       = aws_ecr_repository.main.arn
}

# Output repository name
output "repository_name" {
  description = "Name of the repository"
  value       = aws_ecr_repository.main.name
}

# Output repository URL
output "repository_url" {
  description = "The URL of the repository"
  value       = aws_ecr_repository.main.repository_url
}

# Output registry ID
output "registry_id" {
  description = "The registry ID where the repository was created"
  value       = aws_ecr_repository.main.registry_id
}
