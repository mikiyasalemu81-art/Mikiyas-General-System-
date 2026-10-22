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

async function main() {
  const key = getApiKey();
  if (!key) {
    console.error('No GROQ_API_KEY found in process.env or .env');
    process.exit(1);
  }

  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${key}` }
  });
  const data = await res.json();
  console.log('STATUS:', res.status);
  console.log('MODELS:', data.data ? data.data.map(m => m.id) : data);
}

main().catch(console.error);
