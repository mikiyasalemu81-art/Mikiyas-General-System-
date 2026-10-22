// Serverless function route for /api/chat (Vercel / Netlify / Node compatible)
import type { IncomingMessage, ServerResponse } from 'http';

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  contextData?: {
    tasksCount?: number;
    pendingTasks?: string[];
    netBalance?: number;
    blockedAppsCount?: number;
    userName?: string;
  };
}

export async function handleChatRequest(
  body: ChatRequest,
  apiKey: string,
  modelName: string = 'openai/gpt-oss-120b'
): Promise<{ status: number; data: any }> {
  if (!apiKey || apiKey.trim() === '') {
    return {
      status: 401,
      data: {
        error: 'GROQ_API_KEY is not configured on the server. Please set GROQ_API_KEY in your environment variables.',
        code: 401
      }
    };
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return {
      status: 400,
      data: { error: 'Request body must include a "messages" array.', code: 400 }
    };
  }

  // General-purpose Chad system prompt as specified in prompt requirement 4
  let systemPrompt = "You are Chad, Mikiyas's personal assistant inside his productivity system. You can chat about anything and you also help with his tasks, time limits, finances, and project intake. Be friendly, clear, and concise. Use the user's stored data as context only when it's relevant to the question.";

  // Append user's stored data context only when available
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

  // Construct full conversation history
  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...body.messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  ];

  // Primary model with fallback list
  const modelsToTry = [
    modelName,
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant'
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  let lastStatus = 500;
  let lastErrorMessage = 'Failed to connect to Groq API';

  for (const model of modelsToTry) {
    try {
      console.log(`[API /api/chat] Dispatching to Groq model: ${model} with ${groqMessages.length} messages`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 1200
        })
      });

      lastStatus = response.status;

      if (response.status === 401) {
        return {
          status: 401,
          data: {
            error: 'Invalid Groq API Key (401 Unauthorized). Please check your GROQ_API_KEY environment variable.',
            code: 401
          }
        };
      }

      if (response.status === 429) {
        return {
          status: 429,
          data: {
            error: 'Groq Rate Limit Exceeded (429). Please wait a moment before sending another message.',
            code: 429
          }
        };
      }

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const msg = errorJson.error?.message || response.statusText || 'Unknown error';
        lastErrorMessage = msg;

        // If model not found or no access, try next model
        if (response.status === 404 || msg.includes('does not exist') || msg.includes('access')) {
          console.warn(`[API /api/chat] Model ${model} not available: ${msg}. Trying fallback...`);
          continue;
        }

        return {
          status: response.status,
          data: { error: `Groq API Error (${response.status}): ${msg}`, code: response.status }
        };
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const reply = choice?.message?.content || '';
      const reasoning = choice?.message?.reasoning || undefined;

      console.log(`[API /api/chat] Successfully received reply from ${model} (${reply.length} chars)`);

      return {
        status: 200,
        data: {
          reply,
          reasoning,
          model: data.model || model,
          usage: data.usage
        }
      };
    } catch (err: any) {
      console.error(`[API /api/chat] Network failure for ${model}:`, err);
      lastErrorMessage = err?.message || 'Network connection failed';
    }
  }

  return {
    status: lastStatus >= 400 ? lastStatus : 502,
    data: {
      error: `Groq Service Unavailable: ${lastErrorMessage}`,
      code: lastStatus
    }
  };
}

// Vercel serverless function export
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed`, code: 405 });
  }

  const apiKey = process.env.GROQ_API_KEY || '';
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  const result = await handleChatRequest(req.body, apiKey, model);
  return res.status(result.status).json(result.data);
}
