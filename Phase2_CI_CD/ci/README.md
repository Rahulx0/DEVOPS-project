# CI/CD Workflows

This directory will store GitHub Actions workflow files and shared templates.

## Planned Workflows
- `build-and-push.yml` – build Docker image, run tests, push to ECR.
- `deploy.yml` – optional manual trigger to kick ArgoCD sync.

## Next Steps
1. Create GitHub Actions workflow leveraging AWS credentials and caching.
2. Integrate image tagging strategy (commit SHA + semver).
3. Ensure ArgoCD watches the manifests repo and reacts on manifest updates.
