# ADR-001: Event-Driven Import Pipeline

**Date:** 2026-03-21  
**Status:** Accepted  
**Deciders:** Simon, Fas

## Context

The vintage import feature initially used a synchronous Lambda pattern:
1. Frontend uploads CSV (base64 in JSON body)
2. Lambda parses CSV, inserts to RDS
3. Returns success/error

**Problems:**
- WAF blocks base64 payloads >8KB (triggers XSS/RFI rules)
- No retry handling (CSV parse failures lost)
- No DLQ (failures vanish silently)
- Timeout risk (large CSVs >29s)

## Decision

Migrate to **event-driven async pipeline**:

```
Frontend → S3 (presigned URL) → SQS → Lambda (parser) → RDS
                                      ↓
                                  DLQ (failures)
```

**Components:**
1. **S3 presigned URL** — bypasses WAF, direct upload
2. **SQS queue** — decouples upload from processing
3. **Parser Lambda** — idempotent, retries safe
4. **DLQ** — failures logged, alerting triggered
5. **Step Functions** (future) — orchestrate multi-stage imports

## Consequences

### Positive
- ✅ WAF bypass (S3 upload, not API body)
- ✅ Idempotency (X-Idempotency-Key header)
- ✅ DLQ visibility (failures don't vanish)
- ✅ Timeout eliminated (async processing)
- ✅ Scale independent (upload vs. parse)

### Negative
- ⚠️ Added complexity (SQS, DLQ, async polling)
- ⚠️ Frontend needs poll/status endpoint
- ⚠️ S3 storage cost (~$0.023/GB/mo)

### Trade-offs
- Chose async over sync for resilience
- Chose SQS over Step Functions for simplicity (v1)
- Chose presigned URL over multipart for WAF bypass

## Compliance

- **Security:** S3 bucket private, presigned URL 5-min expiry
- **FinOps:** S3 cost negligible at 100 imports/day (~$50/mo)
- **Observability:** SQS metrics (ApproximateNumberOfMessagesVisible)

## Migration Plan

1. Deploy SQS queue + DLQ
2. Update Lambda to poll SQS (not API Gateway)
3. Frontend: presigned URL flow
4. Deprecate sync endpoint (30-day sunset)

---

**Reviewed by:** Simon v4.1  
**Next review:** 2026-06-21 (quarterly)
