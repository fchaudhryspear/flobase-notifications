# Playbook: Lambda Deploy (flobase-api-handler)

## Problem
Lambda deployed with bare zip (no dependencies) → `ImportModuleError: No module named 'psycopg2'` → all endpoints dead.

## Root Cause Pattern
When deploying via SAM/CDK without explicit dependency bundling, the zip only contains `lambda_function.py` (~3KB). psycopg2 must be bundled in the same directory.

## Fix
```bash
cd ~/.openclaw/workspace/flobase-capital-platform/backend/lambdas/api-handler
zip -r /tmp/flobase-api-handler.zip . \
  --exclude "*.pyc" --exclude "__pycache__/*" --exclude ".git/*"
aws lambda update-function-code \
  --function-name flobase-api-handler \
  --zip-file fileb:///tmp/flobase-api-handler.zip
```

## Verify
```bash
aws lambda invoke \
  --function-name flobase-api-handler \
  --payload '{"httpMethod":"GET","path":"/users","headers":{},"queryStringParameters":null,"body":null}' \
  --cli-binary-format raw-in-base64-out /tmp/test.json
cat /tmp/test.json | python3 -m json.tool
```
Expected: HTTP 401 (auth required) = Lambda healthy.

## Dependencies in zip (must be present)
- `psycopg2/` + `psycopg2_binary.libs/`
- `boto3/` + `botocore/`
- `cryptography/`
- `cffi/` + `_cffi_backend.*.so`

## Warm-up after deploy
```bash
for i in 1 2 3; do
  aws lambda invoke --function-name flobase-api-handler \
    --payload '{"httpMethod":"GET","path":"/dashboard/portfolio",...}' \
    --cli-binary-format raw-in-base64-out /tmp/w$i.json &
done; wait
```

## Notes
- Lambda is VPC-only (no public RDS access from local)
- Use flobase-db-migrate Lambda for direct SQL execution
- ZIP target size: ~21MB compressed
