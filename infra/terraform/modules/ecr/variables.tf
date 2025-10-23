variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "urbangear"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "image_tag_mutability" {
  description = "The tag mutability setting for the repository. Must be one of: MUTABLE or IMMUTABLE"
  type        = string
  default     = "MUTABLE"
}

variable "scan_on_push" {
  description = "Indicates whether images are scanned after being pushed to the repository"
  type        = bool
  default     = true
}

variable "encryption_type" {
  description = "The encryption type to use for the repository. Valid values are AES256 or KMS"
  type        = string
  default     = "AES256"
}

variable "kms_key_id" {
  description = "The KMS key to use when encryption_type is KMS. If not specified, uses the default AWS managed key for ECR"
  type        = string
  default     = null
}

variable "enable_cross_account_access" {
  description = "Enable cross-account access to the ECR repository"
  type        = bool
  default     = false
}

variable "allowed_account_ids" {
  description = "List of AWS account IDs that are allowed to access the ECR repository"
  type        = list(string)
  default     = []
}

variable "max_image_count" {
  description = "Maximum number of tagged images to keep"
  type        = number
  default     = 10
}

variable "untagged_image_days" {
  description = "Number of days to keep untagged images"
  type        = number
  default     = 1
}