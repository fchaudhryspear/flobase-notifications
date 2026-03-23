import asyncio
import sys
import glob
from pathlib import Path

# Hook into your existing executor
sys.path.append('/Users/faisalshomemacmini/.openclaw/workspace/agents/shared')
from executor import query_ollama, clean_llm_output

async def main():
    print("🚀 Forcing Harvey (Documentation) to write the final API Manual...")

    # Context gathering
    routes_path = Path('/Users/faisalshomemacmini/.openclaw/workspace/simon/src/routes/notificationRoutes.ts')
    prd_files = glob.glob('/Users/faisalshomemacmini/.openclaw/workspace/phil/prd/build_user_notif*.md')
    
    routes_content = routes_path.read_text() if routes_path.exists() else "No source code found."
    prd_content = Path(prd_files[0]).read_text() if prd_files else "No PRD found."

    prompt = f"""You are Harvey, the Lead Technical Writer. Generate a clean, professional API Documentation file in Markdown for the Notification System.

SOURCE CODE:
{routes_content}

ORIGINAL PRD:
{prd_content}

REQUIREMENTS:
1. Include a 'Getting Started' section.
2. Detail every endpoint (Method, Path, Headers, Request Body, Response).
3. Specifically mention the 'x-user-id' security header requirement.
4. Use clear Markdown tables for schema definitions.
5. Output ONLY the raw Markdown content.
"""

    print("🧠 Querying Qwen 397B for API Documentation...")
    result = await query_ollama(prompt, agent_id='harvey')

    cleaned = clean_llm_output(result, 'markdown')
    
    docs_dir = Path('/Users/faisalshomemacmini/.openclaw/workspace/harvey/docs')
    docs_dir.mkdir(parents=True, exist_ok=True)

    out_path = docs_dir / 'notification_api_docs.md'
    out_path.write_text(cleaned)
    print(f"✅ Final API Documentation successfully built in {out_path}")

asyncio.run(main())
