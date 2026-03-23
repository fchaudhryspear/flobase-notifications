import asyncio
import sys
import glob
from pathlib import Path

# Hook into your existing executor
sys.path.append('/Users/faisalshomemacmini/.openclaw/workspace/agents/shared')
from executor import query_ollama, clean_llm_output

async def main():
    print("🚀 Forcing Simon to build the DevOps Deployment Configs...")

    # Grab Simon's source code for context
    routes_path = Path('/Users/faisalshomemacmini/.openclaw/workspace/simon/src/routes/notificationRoutes.ts')
    if not routes_path.exists():
        print("❌ Could not find Simon's source code!")
        return
    routes_content = routes_path.read_text()

    prompt = f"""You are Simon, acting as a Senior DevOps Engineer. Based on the following Express.js routes, generate a production-ready Dockerfile and a docker-compose.yml file.

SOURCE CODE CONTEXT:
{routes_content}

REQUIREMENTS:
1. Dockerfile: Use a lightweight Node-alpine base, handle TypeScript build, and expose port 3000.
2. docker-compose.yml: Include the app service and a placeholder for a Redis or Postgres container for future persistence.
3. Output ONLY the raw configuration code. No explanations.
"""

    print("🧠 Querying Qwen 397B for DevOps Configs...")
    result = await query_ollama(prompt, agent_id='simon')

    cleaned = clean_llm_output(result, 'yaml')
    
    deploy_dir = Path('/Users/faisalshomemacmini/.openclaw/workspace/simon/deploy')
    deploy_dir.mkdir(parents=True, exist_ok=True)

    out_path = deploy_dir / 'build_user_notificat_deployment.yml'
    out_path.write_text(cleaned)
    print(f"✅ DevOps Deployment configs successfully built in {out_path}")

asyncio.run(main())
