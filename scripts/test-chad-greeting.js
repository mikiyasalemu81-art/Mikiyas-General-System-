import fs from 'fs';
import path from 'path';

function getApiKey() {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  try {
    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GROQ_API_KEY=([^\r\n]+)/);
      if (match) return match[1].trim();
    }
  } catch (e) {}
  return '';
}

async function testGreeting() {
  const key = getApiKey();
  if (!key) {
    console.error('No GROQ_API_KEY found in process.env or .env');
    process.exit(1);
  }

  const systemPrompt = "You are Chad, Mikiyas's personal assistant inside his productivity system. You can chat about anything and you also help with his tasks, time limits, finances, and project intake. Be friendly, clear, and concise. Use the user's stored data as context only when it's relevant to the question.";

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'hi' }
      ]
    })
  });

  const data = await res.json();
  console.log('STATUS:', res.status);
  console.log('REPLY:', data.choices?.[0]?.message?.content);
  if (data.choices?.[0]?.message?.reasoning) {
    console.log('REASONING:', data.choices?.[0]?.message?.reasoning);
  }
}

testGreeting().catch(console.error);
