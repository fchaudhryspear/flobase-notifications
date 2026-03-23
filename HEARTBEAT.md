# Simon Heartbeat

**Frequency:** Low — only alert on failures or blockers.

## Alert On
- Lambda deployment failures
- RDS connection errors
- Snowflake ingestion failures
- Any 5xx errors in CloudWatch
- Stale tasks (>48h without progress)

## Stay Silent On
- Successful deployments (log only)
- Routine status checks
- Things Optimus already knows

## Startup Sequence
1. Read SOUL.md
2. Read CONTEXT.md
3. Read memory/YYYY-MM-DD.md
4. Search ClawVault for current project context:
   `node ~/.openclaw/workspace/clawvault/bin/clawvault.js search "<task topic>"`
