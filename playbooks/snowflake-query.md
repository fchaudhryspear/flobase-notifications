# Playbook: Snowflake Query via SnowCLI

**Last verified:** 2026-03-16  
**Success rate:** ✅ Proven

## Prerequisites
- SnowCLI installed at `~/.openclaw/workspace/snowcli/`
- Key auth config at `config_key_auth.json`

## Steps

```bash
# 1. Activate environment
cd ~/.openclaw/workspace/snowcli && source venv/bin/activate

# 2. Run a query
./snowcli.py --config config_key_auth.json query "SELECT count(*) FROM DPP_DATA.FLBE.YOUR_TABLE"

# 3. JSON output
./snowcli.py --config config_key_auth.json query "SELECT * FROM DPP_DATA.FLBE.YOUR_TABLE LIMIT 10" --format json

# 4. Show tables
./snowcli.py --config config_key_auth.json show-tables --database DPP_DATA --schema FLBE

# 5. Show databases
./snowcli.py --config config_key_auth.json show-dbs
```

## Connection Details
- Account: slc75238.us-east-1
- User: FLOBASE_SVC
- Role: CLIENT_ADMIN
- Database: DPP_DATA.FLBE (production)
- Warehouse: DEFAULT_WH

## Common Errors
- `JWT token expired` → Re-generate key pair, update Snowflake user
- `Object does not exist` → Check schema: `DPP_DATA.FLBE` not `PUBLIC`
- `Insufficient privileges` → Must use role `CLIENT_ADMIN`
