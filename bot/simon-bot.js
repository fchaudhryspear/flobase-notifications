/**
 * Simon Backend Engineer Telegram Bot
 * Connects Telegram → Simon's Context → LLM → Telegram Response
 * 
 * Simon's Role:
 * - Backend & Cloud Engineering
 * - AWS Lambda, API Gateway, RDS
 * - Snowflake queries, ingestion
 * - Flobase platform, Mission Control
 * - Fast shipping, working code
 */

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// === Configuration ===
const BOT_TOKEN = process.env.SIMON_BOT_TOKEN || '8658561912:AAHIzGTOpskbcIOZCekeZ1bhhj0-T3ZnqqI';
const LLM_MODEL = 'qwen3-coder-next';
const WORKSPACE = '/Users/faisalshomemacmini/.openclaw/workspace/simon/';

// === Model Routing (Ollama Cloud) ===
const MODEL_ROUTING = {
  L1: { model: 'ollama-cloud/glm-5', use: 'Simple Q&A, summaries' },
  L2: { model: 'ollama-cloud/kimi-k2.5', use: 'API integration' },
  L3: { model: 'ollama-cloud/qwen3-coder-next', use: 'Backend code, debugging' },
  L4: { model: 'ollama-cloud/claude-sonnet-4-6', use: 'Complex architecture' },
};

// === Initialize Bot ===
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log(`🛠️ Simon Bot Online (@Simon_mm_bot)`);
console.log(`📂 Workspace: ${WORKSPACE}`);
console.log(`🧠 Model: ${LLM_MODEL}`);

// === Message Handler ===
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  console.log(`[${new Date().toISOString()}] Simon received: "${text}"`);
  
  try {
    // Load Simon's context
    const soul = fs.readFileSync(path.join(WORKSPACE, 'SOUL.md'), 'utf8');
    const user = fs.readFileSync(path.join(WORKSPACE, 'USER.md'), 'utf8');
    const context = fs.readFileSync(path.join(WORKSPACE, 'CONTEXT.md'), 'utf8');
    
    // Build prompt
    const prompt = `You are Simon. ${soul}\n\nUser: ${user}\n\nContext: ${context}\n\nTask: ${text}`;
    
    // Call LLM
    const response = await axios.post('https://api.ollama.cloud/v1/chat/completions', {
      model: LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
    }, {
      headers: { 'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}` }
    });
    
    const reply = response.data.choices[0].message.content;
    
    // Send response
    await bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
    
  } catch (err) {
    console.error('Simon error:', err.message);
    await bot.sendMessage(chatId, `❌ Error: ${err.message}`);
  }
});

// === Error Handler ===
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});

console.log('✅ Simon bot polling started');
