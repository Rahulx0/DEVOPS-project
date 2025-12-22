# Complete DevOps Stack Deployment

## One Command Deployment

```bash
./scripts/start.sh
```

## What Gets Deployed

### Infrastructure Components

| Component | Purpose | Pods | Access |
|-----------|---------|------|--------|
| **AWS Load Balancer Controller** | Creates ALB for external access | 2 | Automatic |
| **ArgoCD** | GitOps continuous deployment | 7 | Port-forward 8080 |
| **Prometheus** | Metrics collection | 1 | Port-forward 9090 |
| **Grafana** | Monitoring dashboards | 1 | Port-forward 3000 |
| **Your Application** | Frontend app | 1 | Via ALB URL |

**Total**: ~12 pods

### Security & Access Control

- ✅ **RBAC**: Developer and Admin roles configured
- ✅ **Network Policies**: Pod-level traffic control
- ✅ **Security Scanning**: Trivy vulnerability checks
- ✅ **Code Quality**: SonarCloud analysis (98.61% coverage)

## Deployment Flow

```
./scripts/start.sh
   ↓
Empty commit → GitHub
   ↓
GitHub Actions Triggered
   ↓
┌─────────────────────────────────┐
│  Parallel Jobs (3-5 min)        │
│  ├─ Build & Push to ECR         │
│  ├─ Run 256 Tests               │
│  ├─ SonarCloud Analysis         │
│  └─ Trivy Security Scan         │
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│  Setup Infrastructure (3-5 min) │
│  ├─ ALB Controller              │
│  ├─ ArgoCD                      │
│  ├─ Prometheus + Grafana        │
│  └─ RBAC + Network Policies     │
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│  Deploy Application (2-3 min)   │
│  - Apply manifests              │
│  - Rolling update               │
│  - ALB provisioning             │
└─────────────────────────────────┘
   ↓
Complete Stack Running! 🎉
```

## Access Points

### Application
```bash
kubectl get ingress urbangear-frontend-ingress
```

### ArgoCD
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# https://localhost:8080
# Username: admin
# Password: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### Grafana
```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# http://localhost:3000
# Username: admin
# Password: prom-operator
```

### Prometheus
```bash
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# http://localhost:9090
```

## Verify Installation

```bash
# Check all components
kubectl get pods -A

# Check application
kubectl get deployment,pods,svc,ingress -n default

# Check ArgoCD
kubectl get pods -n argocd

# Check monitoring
kubectl get pods -n monitoring

# Check RBAC
kubectl get roles,rolebindings

# Check network policies
kubectl get networkpolicies
```

## Cost Breakdown (Monthly)

| Component | Cost |
|-----------|------|
| EKS Control Plane | $73 |
| 1x t3.small SPOT node | ~$5 |
| 1x NAT Gateway | ~$32 |
| ALB | ~$16 |
| ECR Storage | ~$1 |
| **Total** | **~$127/month** |

**Note**: All Kubernetes components run on the same node, no extra EC2 costs.

## What Each Component Does

### ALB Controller
- Watches Kubernetes Ingress resources
- Automatically creates/updates AWS Application Load Balancers
- Routes external traffic to your pods

### ArgoCD
- Monitors Git repository for changes
- Automatically syncs Kubernetes manifests
- Provides UI for deployment visualization
- Self-healing: reverts manual changes

### Prometheus
- Collects metrics from all pods
- Stores time-series data
- Provides query interface
- Triggers alerts based on rules

### Grafana
- Visualizes Prometheus metrics
- Pre-configured dashboards for:
  - Kubernetes cluster overview
  - Node metrics
  - Pod metrics
  - Application performance

### RBAC
- **Developer Role**: Read-only + deployment updates
- **Admin Role**: Full namespace access
- **Cluster Admin**: Full cluster access

### Network Policies
- Default deny all traffic
- Explicit allow rules for:
  - Frontend → Internet (for APIs)
  - ALB → Frontend
  - Prometheus → All pods (metrics)

## Troubleshooting

### Check Workflow Status
```bash
# Visit GitHub Actions
https://github.com/Rahulx0/DEVOPS-project/actions
```

### Component Not Starting
```bash
# Check pod status
kubectl get pods -A

# Check specific pod logs
kubectl logs -n <namespace> <pod-name>

# Describe pod for events
kubectl describe pod -n <namespace> <pod-name>
```

### ALB Not Created
```bash
# Check ingress
kubectl describe ingress urbangear-frontend-ingress

# Check ALB Controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller
```

### ArgoCD Not Syncing
```bash
# Check application status
kubectl get applications -n argocd

# Check ArgoCD logs
kubectl logs -n argocd deployment/argocd-application-controller
```

## Cleanup

To remove everything:

```bash
# Delete application
kubectl delete -k manifests/overlays/prod/

# Delete monitoring
helm uninstall prometheus -n monitoring
kubectl delete namespace monitoring

# Delete ArgoCD
kubectl delete namespace argocd

# Delete ALB Controller
helm uninstall aws-load-balancer-controller -n kube-system

# Destroy infrastructure
cd infra/terraform/envs/dev
terraform destroy
```

## Next Steps

1. **Configure Custom Domain** (optional)
   - Update Route53 DNS to point to ALB
   - Configure SSL/TLS certificates

2. **Set Up Alerts** (optional)
   - Configure Prometheus alert rules
   - Set up Slack/email notifications

3. **Add More Environments** (optional)
   - Create staging environment
   - Configure multi-region deployment

4. **Implement Auto-Scaling** (optional)
   - Configure HPA (Horizontal Pod Autoscaler)
   - Set up Cluster Autoscaler

## Summary

✅ **One command** deploys complete stack  
✅ **All DevOps tools** integrated  
✅ **Production-ready** architecture  
✅ **Cost-optimized** for learning/demo  
✅ **Fully automated** CI/CD pipeline  

Just run `./scripts/start.sh` and you're done! 🚀
