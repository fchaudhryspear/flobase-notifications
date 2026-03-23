import asyncio
import sys
from pathlib import Path

# Hook into your existing executor
sys.path.append('/Users/faisalshomemacmini/.openclaw/workspace/agents/shared')
from executor import query_ollama, clean_llm_output

async def main():
    print("🚀 Forcing Lana (QA) to build the Test Suite...")
    
    # Grab Simon's newly minted code
    routes_path = Path('/Users/faisalshomemacmini/.openclaw/workspace/simon/src/routes/notificationRoutes.ts')
    if not routes_path.exists():
        print("❌ Could not find Simon's source code!")
        return
    routes_content = routes_path.read_text()
    
    prompt = f"""You are Lana, the Lead QA Engineer. Read the following Express.js router and write a complete Jest + Supertest test suite.

SOURCE CODE:
{routes_content}

REQUIREMENTS:
1. Write tests for all 4 endpoints (POST /notifications, GET /users/:id/notifications, PATCH /notifications/:id, PUT /users/:id/preferences).
2. Test the "Happy Path" (e.g., valid inputs return 201/200).
3. Test the "Unhappy Path" (e.g., missing x-user-id header returns an error).
4. Output ONLY the complete, raw TypeScript test code. No markdown blocks, no explanations. 
"""
    
    print("🧠 Querying Qwen 397B for Jest Tests...")
    result = await query_ollama(prompt, agent_id='lana')
    
    cleaned = clean_llm_output(result, 'typescript')
    if cleaned.startswith('```'):
        cleaned = '\n'.join(cleaned.split('\n')[1:-1])
        
    test_dir = Path('/Users/faisalshomemacmini/.openclaw/workspace/lana/tests')
    test_dir.mkdir(parents=True, exist_ok=True)
    
    out_path = test_dir / 'notificationRoutes.test.ts'
    out_path.write_text(cleaned)
    print(f"✅ QA Test Suite successfully built in {out_path}")

asyncio.run(main())
