# Simon Playbooks

Proven, tested sequences for common tasks. Use these as starting points instead of figuring things out from scratch.

## Available Playbooks
- `lambda-deploy.md` — Deploy/update a Lambda function
- `flobase-frontend-deploy.md` — Build and deploy Flobase frontend to S3/CloudFront
- `snowflake-query.md` — Run Snowflake queries via SnowCLI
- `rds-migration.md` — Run DB migrations on Flobase RDS

## How to Use
Before starting a task, check if there's a playbook:
```bash
node ~/.openclaw/workspace/clawvault/bin/clawvault.js search "playbook <task>"
```

## How to Add a New Playbook
When a task succeeds cleanly, save the exact steps as a new `.md` file here.
Format: title, prerequisites, exact commands in order, verification steps.
