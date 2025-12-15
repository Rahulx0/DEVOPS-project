#!/bin/bash
# Quick Route 53 setup for urbangear.qzz.io

set -e

DOMAIN="urbangear.qzz.io"
LOAD_BALANCER="a328b4122161848b0b4835353e811fa4-1043458251.us-east-1.elb.amazonaws.com"

echo "🌐 Setting up Route 53 for $DOMAIN"
echo ""

# Create hosted zone
echo "Creating hosted zone..."
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone --name "$DOMAIN" --caller-reference "$(date +%s)" --query 'HostedZone.Id' --output text)
echo "✅ Hosted zone created: $HOSTED_ZONE_ID"

# Get nameservers
echo ""
echo "Getting nameservers..."
aws route53 get-hosted-zone --id "$HOSTED_ZONE_ID" --query 'DelegationSet.NameServers' --output table

# Create CNAME record
echo ""
echo "Creating CNAME record..."
cat > /tmp/cname-record.json << EOF
{
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "$DOMAIN",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [
                    {
                        "Value": "$LOAD_BALANCER"
                    }
                ]
            }
        }
    ]
}
EOF

aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch file:///tmp/cname-record.json
rm /tmp/cname-record.json

echo ""
echo "=========================================="
echo "✅ Route 53 Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy the nameservers shown above"
echo "2. Update them in your DigitalPlat domain settings"
echo "3. Wait 5-30 minutes for DNS propagation"
echo ""
echo "Your site will then be available at:"
echo "   🌍 http://$DOMAIN"
echo "   Admin: http://$DOMAIN/?admin=true"