# Playbook: Flobase Frontend Deploy

**Last verified:** 2026-03-16  
**Success rate:** ✅ Proven

## Prerequisites
- Node.js installed
- AWS CLI configured
- S3 bucket: `flobase-dashboard-prod`
- CloudFront: `EAJ0UGQ8HMKT1`

## Steps

```bash
# 1. Navigate to frontend
cd ~/.openclaw/workspace/flobase-capital-platform/frontend-v2

# 2. Install deps (if needed)
npm install

# 3. Build
npm run build

# 4. Deploy to S3 — IMPORTANT: exclude /data/ folder (contains generated JSON files)
aws s3 sync dist/ s3://flobase-dashboard-prod --delete \
  --exclude "data/*" --region us-east-1

# 5. Regenerate creditor_insights.json after deploy
aws lambda invoke \
  --function-name flobase-api-handler \
  --payload '{"__task":"generate-creditor-insights"}' \
  --cli-binary-format raw-in-base64-out /tmp/gen.json \
  --region us-east-1

# 5. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id EAJ0UGQ8HMKT1 \
  --paths "/*"
```

## Verification
```bash
# Check S3 upload
aws s3 ls s3://flobase-dashboard-prod --recursive | head -10

# Check CloudFront invalidation status
aws cloudfront list-invalidations \
  --distribution-id EAJ0UGQ8HMKT1 \
  --query 'InvalidationList.Items[0].Status'

# Live URL
open https://portal.flobase.ai
```

## Common Errors
- Build fails → Check `npm run build` output, usually a TSX type error
- S3 access denied → Check IAM role has `s3:PutObject` on `flobase-dashboard-prod`
- CloudFront still shows old → Invalidation takes 1-2 min, check status above
