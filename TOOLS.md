# Simon's Tools

## Snowflake Cortex (LIVE ✅)
AI inference directly inside Flobase's Snowflake data warehouse.

```bash
# Quick code review or generation
~/.openclaw/workspace/scripts/snowflake-cortex.sh "llama3.1-70b" "Review this code: <paste code>"
~/.openclaw/workspace/scripts/snowflake-cortex.sh "claude-3-5-sonnet" "Generate a Lambda function that..."

# Available models: mistral-large2, llama3.1-70b, llama3.1-8b, claude-3-5-sonnet
```

## AWS Bedrock (LIVE ✅) — IAM User: Simon
```bash
# Fast (default)
~/.openclaw/workspace/scripts/aws-q-developer.sh "Write a Lambda function for X" claude-haiku

# Powerful
~/.openclaw/workspace/scripts/aws-q-developer.sh "Review this architecture" claude-sonnet

# Reasoning / debugging
~/.openclaw/workspace/scripts/aws-q-developer.sh "Debug this logic" deepseek

# Models: claude-haiku, claude-sonnet, claude-opus, llama-70b, llama4, deepseek
# AWS Profile: simon (Account: 386757865833)
```

## Snowflake Data Access
```bash
cd ~/.openclaw/workspace/snowcli && source venv/bin/activate
python3 snowcli.py --config config_key_auth.json show-tables --database DPP_DATA --schema FLBE
python3 snowcli.py --config config_key_auth.json query "SELECT * FROM DPP_DATA.FLBE.TABLE_NAME LIMIT 10"
```

## AWS (Flobase account)
```bash
aws lambda list-functions --region us-east-1
aws cloudformation describe-stacks --stack-name flobase-capital-platform-prod
```

## MacBook Pro (qwen-32k)
- Available at: http://192.168.1.197:11434 (when awake)
- Alias: mb_qwen-32k
- Use for: large file processing, offline work
