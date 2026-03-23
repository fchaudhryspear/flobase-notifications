# CONTEXT.md — Simon's Stack Knowledge

## Flobase Capital Platform
- **URL:** https://portal.flobase.ai
- **S3:** flobase-dashboard-prod (64KB SPA)
- **CloudFront:** EAJ0UGQ8HMKT1
- **API:** https://fxzma34u7a.execute-api.us-east-1.amazonaws.com/Prod
- **Auth:** Cognito us-east-1_p8zDDh0py, client 4kd0f4ckoikss5cla64t9mmdq2
- **User:** faisal@flobase.ai / group flobase_admin
- **Stack:** flobase-capital-platform-prod (UPDATE_COMPLETE)
- **RDS:** flobase-prod.cu52siwak795.us-east-1.rds.amazonaws.com:5432
- **Repo:** flobase-capital-platform (GitHub: fchaudhryspear)
- **Backend Lambdas (9):** api-handler, snowflake-ingestion, eligibility-engine, waterfall-calculator, comp-template-checker, fee-reconciliation, forth-writeback, sofr-feed, db-migrate
- **Frontend:** 37 TSX components, Vite+React+TypeScript+Tailwind, dark mode, Recharts

### Critical Field Mappings (don't get wrong)
- EPF = pre_hurdle_dsc_pct (NOT pre_hurdle_flobase_pct)
- DSC Fees = EPF% × Total Enrolled Debt
- Vintage naming: CODE_YYYY_MON_DD (e.g. CLG_2026_MAR_11)
- Chargeback = $ amount subtracted from purchase price directly
- enrolled_debt_cleared → enrolled_debt
- advance_percentage → advance_pct
- total_funded → total_debt_funded
- total_cancelled → cancelled_debt
- waterfall_results table doesn't exist — use tranche_master.total_fees_collected fallback

## Mission Control
- **URL:** https://missioncontrol.credologi.com
- **Stack:** mission-control-api (AWS SAM, Node.js Lambda)
- **Lambda:** MonitoringFunction, runtime nodejs20.x
- **Cognito:** us-east-1_M6lTgVQaw
- **Last fix:** formattedResults mapping in app.js

## Snowflake
- **Account:** slc75238.us-east-1
- **User:** FLOBASE_SVC (service account)
- **Role:** CLIENT_ADMIN
- **Database:** DPP_DATA.FLBE (production), USER$ORGFLBE.PUBLIC (personal)
- **Warehouse:** DEFAULT_WH
- **CLI path:** `~/.openclaw/workspace/snowcli/`
```bash
cd ~/.openclaw/workspace/snowcli && source venv/bin/activate
./snowcli.py --config config_key_auth.json <command>
```

## AWS Infrastructure
- **Region:** us-east-1 (primary)
- **GitHub org:** Versatly / fchaudhryspear

## MacBook Pro (Local Dev)
- **IP:** 192.168.1.197
- **User:** faisalchaudhry
- **SSH:** `ssh -i ~/.ssh/id_rsa faisalchaudhry@192.168.1.197`
- **Ollama URL:** http://192.168.1.197:11434
- **Models:** qwen2.5-coder:32b (primary, pinned), qwen2.5:72b, deepseek-r1:70b

## NexDev
- **Path:** `~/.openclaw/workspace/`
- **Key files:** nexdev_executor.py, integration_layer.py, MO_ROUTING.md
- **QwenCoder model ID:** qwen-coder-plus (NOT qwen-coder)
