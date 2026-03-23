# Idempotent Lambda Import Pattern

**Version:** 1.0  
**Last updated:** 2026-03-21  
**Author:** Simon v4.1

## Problem

Import APIs are called multiple times (network retries, user double-clicks). Without idempotency:
- Duplicate rows in RDS
- Inflated metrics
- Data corruption

## Solution

**Idempotency Key Pattern:**

```python
import hashlib
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
idempotency_table = dynamodb.Table('IdempotencyKeys')

def put_idempotency_key(import_id, idempotency_key, ttl_hours=24):
    """Store idempotency key with TTL."""
    import hashlib
    key_hash = hashlib.sha256(idempotency_key.encode()).hexdigest()
    
    idempotency_table.put_item(
        Item={
            'idempotency_key': key_hash,
            'import_id': import_id,
            'ttl': int(time.time()) + (ttl_hours * 3600),
            'status': 'PROCESSING',
        },
        ConditionExpression='attribute_not_exists(idempotency_key)',
    )
    return True

def lambda_handler(event, context):
    # Extract idempotency key from header
    idempotency_key = event['headers'].get('X-Idempotency-Key', event['requestContext']['requestId'])
    
    # Check if already processed
    try:
        put_idempotency_key(event['import_id'], idempotency_key)
    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            # Already processed, return cached result
            return get_cached_result(idempotency_key)
        raise
    
    # Process import
    result = process_csv_import(event)
    
    # Cache result
    cache_result(idempotency_key, result)
    
    return result
```

## Key Points

| Aspect | Implementation |
|--------|----------------|
| **Key Source** | `X-Idempotency-Key` header (client-generated UUID) |
| **Fallback** | `requestContext.requestId` (API Gateway request ID) |
| **Storage** | DynamoDB with TTL (24h auto-expiry) |
| **Condition** | `attribute_not_exists` — fails if key exists |
| **Response** | Return cached result on duplicate key |

## Frontend Usage

```typescript
// Generate idempotency key per import attempt
const idempotencyKey = crypto.randomUUID();

const res = await fetch('/vintages/import', {
  method: 'POST',
  headers: {
    'X-Idempotency-Key': idempotencyKey,
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
});
```

## Testing

```bash
# First call (should process)
curl -X POST https://.../import \
  -H "X-Idempotency-Key: test-123" \
  -d '{"dsc_id":"test",...}'

# Second call (should return cached, not re-process)
curl -X POST https://.../import \
  -H "X-Idempotency-Key: test-123" \
  -d '{"dsc_id":"test",...}'
```

## Related

- ADR-001: Event-Driven Import Pipeline
- `modules/import-pipeline-cdk/` (IaC module)
- `api-specs/vintages-import.yaml` (OpenAPI spec)
