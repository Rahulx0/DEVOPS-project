# HTTPS Setup Guide

## Overview
Your application now has automated SSL/HTTPS support integrated into the infrastructure pipeline. The certificate is automatically created using AWS Certificate Manager (ACM).

## What Was Done

### 1. Infrastructure Changes
- ✅ Created ACM Terraform module for SSL certificate provisioning
- ✅ Integrated certificate into main Terraform configuration
- ✅ Updated GitHub Actions to automatically inject certificate ARN
- ✅ Configured ingress for HTTPS with HTTP→HTTPS redirect

### 2. Current Status
The pipeline will now:
1. Create an ACM certificate for `urbangear.qzz.io`
2. Output DNS validation records
3. Automatically configure the ALB ingress with HTTPS

## DNS Validation Required

### Step 1: Wait for Pipeline to Complete
The current pipeline run will create the certificate and output the validation records.

### Step 2: Get Validation Records
After the "Terraform Apply" step completes, check the pipeline logs for output like:

```
⚠️  IMPORTANT: Add DNS validation record to qzz.io:
Name: _abc123.urbangear.qzz.io
Type: CNAME
Value: _xyz789.acm-validations.aws.
```

### Step 3: Add DNS Record
Go to your DNS provider (qzz.io) and add the CNAME record:
- **Type**: CNAME
- **Name**: Copy from pipeline output (e.g., `_abc123.urbangear.qzz.io`)
- **Value**: Copy from pipeline output (e.g., `_xyz789.acm-validations.aws.`)
- **TTL**: 300 (or default)

### Step 4: Wait for Validation
- ACM will automatically validate the certificate once DNS propagates
- This usually takes 5-30 minutes
- You can check status in AWS Console → Certificate Manager

### Step 5: Verify HTTPS
Once validated, your site will be accessible at:
- ✅ `https://urbangear.qzz.io` (secure)
- ✅ `http://urbangear.qzz.io` (redirects to HTTPS)

## Manual Certificate Check

To check certificate status manually:

```bash
asp  # Switch to AWS profile

# List certificates
aws acm list-certificates --region us-east-1

# Get certificate details
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:924612597584:certificate/YOUR_CERT_ID \
  --region us-east-1
```

## Troubleshooting

### Certificate Not Validating
- Verify DNS record was added correctly
- Check DNS propagation: `dig _abc123.urbangear.qzz.io CNAME`
- Wait up to 30 minutes for validation

### Ingress Not Using HTTPS
- Check certificate status is "ISSUED"
- Verify ingress has correct certificate ARN annotation
- Check ALB listener configuration in AWS Console

### Still Getting HTTP
- Clear browser cache
- Check ingress annotations include `ssl-redirect: '443'`
- Verify ALB has both HTTP:80 and HTTPS:443 listeners

## Next Steps for Production Payments

Once HTTPS is working:

1. **Sign up for Razorpay Live Account**
   - Go to https://razorpay.com
   - Complete KYC verification
   - Get live API keys

2. **Deploy Payment Backend**
   - Backend code is ready in `backend/` directory
   - Add Razorpay keys as Kubernetes secrets
   - Deploy backend service to EKS

3. **Update Frontend**
   - Point to backend API instead of direct Razorpay
   - Use live Razorpay key from backend

## Cost Impact
- ACM certificates: **FREE**
- HTTPS on ALB: **No additional cost**
- Total impact: **$0/month**

## Security Benefits
✅ Encrypted traffic (required for payments)
✅ Browser trust indicators
✅ SEO benefits
✅ Razorpay compliance
✅ PCI DSS requirements met
