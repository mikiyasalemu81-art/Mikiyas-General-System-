import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function groqChatServerPlugin(): Plugin {
  return {
    name: 'groq-chat-api-server',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');

      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed', code: 405 }));
          return;
        }

        let rawBody = '';
        req.on('data', chunk => {
          rawBody += chunk;
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(rawBody || '{}');
            const apiKey = process.env.GROQ_API_KEY || env.GROQ_API_KEY || '';
            const model = process.env.GROQ_MODEL || env.GROQ_MODEL || 'openai/gpt-oss-120b';

            console.log('[Dev Server /api/chat] Incoming request messages:', body.messages?.length || 0);

            if (!apiKey || apiKey.trim() === '') {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                error: 'GROQ_API_KEY is missing in server environment. Please set GROQ_API_KEY in your .env file.',
                code: 401
              }));
              return;
            }

            // General-purpose Chad system prompt
            let systemPrompt = "You are Chad, Mikiyas's personal assistant inside his productivity app. Answer any question clearly and helpfully. You can also help with his tasks, screen-time limits, finances, and client project intake. Be friendly and concise.";

            if (body.contextData) {
              const ctx = body.contextData;
              const details: string[] = [];
              if (ctx.userName) details.push(`User Name: ${ctx.userName}`);
              if (ctx.netBalance !== undefined) details.push(`Current Finance Net Balance: ETB ${ctx.netBalance.toLocaleString()}`);
              if (ctx.pendingTasks && ctx.pendingTasks.length > 0) details.push(`Pending Tasks: ${ctx.pendingTasks.slice(0, 5).join(', ')}`);
              if (ctx.blockedAppsCount !== undefined) details.push(`Active Blocked Apps: ${ctx.blockedAppsCount}`);
              if (details.length > 0) {
                systemPrompt += `\n\n[USER SYSTEM CONTEXT (Reference only if relevant)]: \n${details.join('\n')}`;
              }
            }

            const groqMessages = [
              { role: 'system', content: systemPrompt },
              ...(body.messages || []).map((m: any) => ({
                role: m.role,
                content: m.content
              }))
            ];

            const modelsToTry = [
              model,
              'openai/gpt-oss-120b',
              'qwen/qwen3.8-27b',
              'openai/gpt-oss-20b',
              'llama-3.3-70b-versatile',
              'llama-3.1-8b-instant'
            ].filter((v, i, a) => v && a.indexOf(v) === i);

            let lastStatus = 500;
            let lastErrorMessage = 'Failed to connect to Groq';

            for (const candidateModel of modelsToTry) {
              try {
                console.log(`[Dev Server /api/chat] Calling Groq model: ${candidateModel}`);
                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${apiKey.trim()}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: candidateModel,
                    messages: groqMessages,
                    temperature: 0.7,
                    max_tokens: 1200
                  })
                });

                lastStatus = groqRes.status;

                if (groqRes.status === 401) {
                  res.statusCode = 401;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: 'Invalid Groq API Key (401 Unauthorized). Please check your GROQ_API_KEY.',
                    code: 401
                  }));
                  return;
                }

                if (groqRes.status === 429) {
                  res.statusCode = 429;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: 'Groq Rate Limit Exceeded (429). Please wait a moment before sending another message.',
                    code: 429
                  }));
                  return;
                }

                if (!groqRes.ok) {
                  const errorJson = await groqRes.json().catch(() => ({}));
                  const msg = errorJson.error?.message || groqRes.statusText || 'Unknown error';
                  lastErrorMessage = msg;
                  if (groqRes.status === 404 || msg.includes('does not exist') || msg.includes('access')) {
                    continue;
                  }
                  res.statusCode = groqRes.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: `Groq Error (${groqRes.status}): ${msg}`, code: groqRes.status }));
                  return;
                }

                const data: any = await groqRes.json();
                const choice = data.choices?.[0];
                const reply = choice?.message?.content || '';
                const reasoning = choice?.message?.reasoning || undefined;

                console.log(`[Dev Server /api/chat] Groq response (${reply.length} chars):`, reply.slice(0, 100) + '...');

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  reply,
                  reasoning,
                  model: data.model || candidateModel
                }));
                return;
              } catch (err: any) {
                lastErrorMessage = err?.message || 'Connection error';
              }
            }

            res.statusCode = lastStatus >= 400 ? lastStatus : 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Groq Service Unavailable: ${lastErrorMessage}`, code: lastStatus }));
          } catch (parseErr: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Malformed JSON payload', code: 400 }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), groqChatServerPlugin()],
  server: {
    port: 3000,
    host: true
  }
});
