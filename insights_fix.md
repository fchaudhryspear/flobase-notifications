# Insights Dashboard Fix

## Problem
Dashboard not loading, showing only 3726 clients

## Root Causes (likely)
1. **DSC-scoped filtering** - User is `dsc_admin` or `dsc_viewer` and sees only their DSC's 3726 clients
2. **Query timeout** - One of the 11 queries timing out
3. **Missing `client_debts` data** - Table exists but no data

## Quick Fixes

### 1. Verify User Role (add to token)
Check if user has `role: "flobase_admin"` or `flobase_manager`. If not, they're DSC-scoped.

### 2. Add Client Debts Data
If `client_debts` table is empty, run the Creditori ingestion:

```bash
# Trigger Snowflake ingestion Lambda
curl -X POST https://api.flobase.ai/purchase/load \
  -H "Authorization: Bearer <token>"
```

### 3. Add Indexes to Speed Up Queries

```sql
-- For insights queries
CREATE INDEX IF NOT EXISTS idx_clients_is_latest_clear ON clients(is_latest_record, first_payment_clear_date);
CREATE INDEX IF NOT EXISTS idx_clients_dsc_latest ON clients(dsc_id, is_latest_record);
CREATE INDEX IF NOT EXISTS idx_client_debts_creditor ON client_debts(creditor_name) WHERE creditor_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_ledger_date ON payment_ledger(payment_date);
```

### 4. Break Down Query Load
The `handle_insights` function runs 11 queries sequentially. Add caching:

```python
# At top of lambda_function.py
try:
    import redis
    INSIGHTS_CACHE_TTL = 300  # 5 minutes
except ImportError:
    INSIGHTS_CACHE_TTL = 0
```

Then wrap queries with cache:

```python
def _cache_insights(user_role, user_dsc_id):
    r = _get_redis()
    if not r:
        return None
    key = f"insights:v2:{user_role}:{user_dsc_id or 'all'}"
    data = r.get(key)
    if data:
        return json.loads(data)
    return None

def _set_insights(user_role, user_dsc_id, data):
    r = _get_redis()
    if not r:
        return
    key = f"insights:v2:{user_role}:{user_dsc_id or 'all'}"
    try:
        r.setex(key, INSIGHTS_CACHE_TTL, json.dumps(data))
    except Exception:
        pass
```

Then in `handle_insights`:

```python
# At start of function, before queries
if not date_params:  # Only cache when no date filter
    cached = _cache_insights(user['role'], user.get('dsc_id'))
    if cached:
        return json_response(200, data=cached, request_id=request_id)
```

### 5. Fix `total_clients` Metric
Currently counts only clients with cleared payments. Fix:

```python
# After all queries, add:
total_all_clients = query_one(
    "SELECT COUNT(*) FROM clients WHERE is_latest_record = true" + 
    (f" AND dsc_id = %s" if _is_dsc_scoped(user) else ""),
    ([user['dsc_id']] if _is_dsc_scoped(user) else None)
)

# In response:
'summary': {
    'total_clients': total_all_clients.get('count', 0),  # All clients
    'active_clients': total_clients_in_window,  # With cleared payments
    ...
}
```

## Files to Modify
1. `backend/lambdas/api-handler/lambda_function.py` - Add caching + fix metrics
2. Run SQL indexes (see above)

— Simon qwen3-coder-next
