# Kubernetes Manifests

Kubernetes YAML for the UrbanGear application.

## Layout
- `base/` – application deployment, service, and ingress baseline
- `overlays/prod/` – production environment with increased resources and replicas

## Current Resources
- **Deployment**: UrbanGear frontend with NGINX serving the React SPA
- **Service**: ClusterIP service exposing port 80
- **Ingress**: AWS ALB ingress for external access
- **Kustomization**: Base configuration with environment-specific overlays

## Usage
```bash
# Deploy to development (base)
kubectl apply -k base/

# Deploy to production
kubectl apply -k overlays/prod/
```

## Next Steps
1. Replace PLACEHOLDER_ECR_URI with actual ECR repository URL
2. Set up ArgoCD to automatically sync these manifests
3. Add ConfigMap and Secret for environment-specific configuration
