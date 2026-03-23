import asyncio
import sys
from pathlib import Path

# Hook into your existing executor
sys.path.append('/Users/faisalshomemacmini/.openclaw/workspace/agents/shared')
from executor import query_ollama, clean_llm_output

async def main():
    print("🚀 Forcing Simon to implement Authentication Logic...")
    
    # Read the current routes file
    routes_path = Path('/Users/faisalshomemacmini/.openclaw/workspace/simon/src/routes/flobaseRoutes.ts')
    current_code = routes_path.read_text()
    
    prompt = f"""You are Simon, the Lead Backend Engineer. Update the following Express.js router to include real logic for the /auth/login endpoint.

CURRENT CODE:
{current_code}

REQUIREMENTS:
1. Use 'bcryptjs' to verify passwords and 'jsonwebtoken' to sign tokens.
2. Create a mock 'users' array at the top of the file containing one user: 
   - email: 'faisal@flobase.ai'
   - password (hashed): '$2a$10$8K1p/a00H5u6U4y.p4G2G.e7uE1H3/1/1/1/1/1/1/1/1/1' (this is the hash for 'password123')
3. Update 'loginHandler' to:
   - Find the user by email.
   - Compare the provided password with the hash using bcrypt.compare().
   - If valid, generate a JWT token signed with a secret 'flobase-secret-2026'.
   - Return the token and expiration.
4. Output ONLY the complete, updated TypeScript code. No markdown blocks.
"""
    
    print("🧠 Querying Qwen 397B for secure implementation...")
    result = await query_ollama(prompt, agent_id='simon')
    
    cleaned = clean_llm_output(result, 'typescript')
    if cleaned.startswith('```'):
        cleaned = '\n'.join(cleaned.split('\n')[1:-1])
        
    routes_path.write_text(cleaned)
    print(f"✅ Auth Logic implemented in {routes_path}")

asyncio.run(main())
