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