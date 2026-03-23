import asyncio
import sys
import glob
from pathlib import Path

# Hook into your existing executor
sys.path.append('/Users/faisalshomemacmini/.openclaw/workspace/agents/shared')
from executor import query_ollama, clean_llm_output

async def main():
    print("🚀 Forcing Simon to build the Notification Endpoints...")
    
    # Grab Phil's PRD
    prd_files = glob.glob('/Users/faisalshomemacmini/.openclaw/workspace/phil/prd/build_user_notif*.md')
    if not prd_files:
        print("❌ Could not find the PRD!")
        return
    prd_content = Path(prd_files[0]).read_text()
    
    prompt = f"""You are Simon, the Lead Backend Engineer. Read the following PRD and generate the complete Express.js TypeScript router for the Notification System.

PRD CONTENT:
{prd_content}

REQUIREMENTS:
1. Use Express Router.
2. Include the 4 endpoints defined in the PRD (POST /notifications, GET /users/:id/notifications, PATCH /notifications/:id, PUT /users/:id/preferences).
3. Since we don't have a DB yet, use in-memory arrays to mock the `notifications` and `preferences`.
4. Output ONLY the complete, raw TypeScript code. No markdown blocks, no explanations.
"""
    
    print("🧠 Querying Qwen 397B for Notification Routes...")
    result = await query_ollama(prompt, agent_id='simon')
    
    cleaned = clean_llm_output(result, 'typescript')
    if cleaned.startswith('```'):
        cleaned = '\n'.join(cleaned.split('\n')[1:-1])
        
    routes_path = Path('/Users/faisalshomemacmini/.openclaw/workspace/simon/src/routes/notificationRoutes.ts')
    routes_path.write_text(cleaned)
    print(f"✅ Notification Routes successfully built in {routes_path}")

asyncio.run(main())
