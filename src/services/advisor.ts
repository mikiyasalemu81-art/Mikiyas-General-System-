import { Transaction, ChatMessage } from '../types';
import { storageService, DEFAULT_GROQ_API_KEY } from './storage';

export interface FinancialStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transportExpenses: number;
  clientExpenses: number;
  transportPercentage: number;
  savingsRate: number;
  recentTransactionsCount: number;
}

export interface AdvisorResponse {
  content: string;
  reasoning?: string;
}

export function computeFinancialStats(transactions: Transaction[]): FinancialStats {
  let totalIncome = 0;
  let totalExpenses = 0;
  let transportExpenses = 0;
  let clientExpenses = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      if (tx.category === 'Transport') {
        transportExpenses += tx.amount;
      } else if (tx.category === 'Clients') {
        clientExpenses += tx.amount;
      }
    }
  }

  const netBalance = totalIncome - totalExpenses;
  const transportPercentage = totalExpenses > 0 ? Math.round((transportExpenses / totalExpenses) * 100) : 0;
  const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    transportExpenses,
    clientExpenses,
    transportPercentage,
    savingsRate,
    recentTransactionsCount: transactions.length,
  };
}

/**
 * Mode (a): Daily Tip Card in ETB
 */
export function getDailyFinancialTip(transactions: Transaction[]): { title: string; advice: string; impact: string; severity: 'info' | 'warning' | 'success' } {
  const stats = computeFinancialStats(transactions);

  if (transactions.length === 0) {
    return {
      title: 'Fresh Ledger Ready (0 ETB)',
      advice: 'Your ledger starts at 0 ETB. When clients pay you, tap Record Entry (+ Income). When you take a taxi or buy gear, tap (- Expense).',
      impact: 'If you record every transaction in ETB as it happens, you build complete financial clarity.',
      severity: 'info',
    };
  }

  if (stats.totalExpenses > stats.totalIncome && stats.totalIncome > 0) {
    return {
      title: 'Expense Alert',
      advice: `Your recorded expenses exceed your income by ETB ${(stats.totalExpenses - stats.totalIncome).toLocaleString()}.`,
      impact: `If you cut non-urgent transit and defer client dinners this week, you save ETB ${Math.round(stats.totalExpenses * 0.25).toLocaleString()} to restore balance.`,
      severity: 'warning',
    };
  }

  if (stats.transportPercentage >= 40) {
    const potentialSaving = Math.round(stats.transportExpenses * 0.35);
    return {
      title: 'Transport Optimization',
      advice: `Transport represents ${stats.transportPercentage}% of your total outflow (ETB ${stats.transportExpenses.toLocaleString()}).`,
      impact: `If you batch client meetings on specific days in Addis Ababa, you save ETB ${potentialSaving.toLocaleString()} in taxi and fuel costs.`,
      severity: 'warning',
    };
  }

  if (stats.savingsRate > 50) {
    return {
      title: 'Strong Surplus',
      advice: `Great job! You retained ${stats.savingsRate}% of your client revenue this period.`,
      impact: `If you set aside ETB ${Math.round(stats.netBalance * 0.3).toLocaleString()} into an emergency buffer, you protect Imako Solution against seasonal dips.`,
      severity: 'success',
    };
  }

  const transportSaving = Math.round(stats.transportExpenses * 0.2);
  return {
    title: 'Daily Micro-Saving Tip',
    advice: `Consistent tracking in ETB gives you clarity and control over your freelance cash flow.`,
    impact: `If you cut solo ride-hails by 2 trips a week, you save ETB ${transportSaving > 0 ? transportSaving : 350} for project equipment.`,
    severity: 'info',
  };
}

/**
 * Groq AI Financial Advisor with Real Thinking Brain
 * Uses Groq's high-intelligence reasoning model (openai/gpt-oss-120b)
 * Returns both the internal analytical thinking process and the final actionable answer in ETB.
 */
export async function queryGroqAdvisor(
  userMessage: string,
  history: ChatMessage[],
  transactions: Transaction[],
  apiKeyOverride?: string
): Promise<AdvisorResponse> {
  const apiKey = (apiKeyOverride || storageService.getGroqApiKey() || DEFAULT_GROQ_API_KEY).trim();
  const stats = computeFinancialStats(transactions);

  // Compile recent transactions summary in ETB
  const recentTxList = transactions.slice(0, 15).map(t => 
    `- [${t.date}] ${t.type.toUpperCase()}: ETB ${t.amount.toLocaleString()} | Category: ${t.category} | Note: "${t.note}"`
  ).join('\n') || 'Ledger is currently empty (0 ETB balance).';

  const systemPrompt = `You are the dedicated Senior Financial Advisor & Business Strategist for Mikiyas.
Mikiyas is a talented freelance developer and founder of Imako Solution living and working in Ethiopia.
Mikiyas has ADHD, so he expects deep, intelligent, analytical reasoning, high visual structure (markdown tables, bullet points, bold numbers), and no fluff.
ALL currency MUST ALWAYS be in Ethiopian Birr (ETB). Never use $ or USD unless explicitly asked to do a conversion.

MIKIYAS'S LIVE FINANCIAL DASHBOARD (IN ETB):
- Total Income: ETB ${stats.totalIncome.toLocaleString()}
- Total Expenses: ETB ${stats.totalExpenses.toLocaleString()}
- Net Balance: ETB ${stats.netBalance.toLocaleString()}
- Transport Spending: ETB ${stats.transportExpenses.toLocaleString()} (${stats.transportPercentage}% of outflow)
- Client Spending: ETB ${stats.clientExpenses.toLocaleString()}
- Total Recorded Entries: ${stats.recentTransactionsCount}
RECORDED LEDGER:
${recentTxList}

DIRECTIVES:
1. THINK THROUGH THE USER'S QUESTION DEEPLY. If he asks "what is my mistake to gain this amount of money?", analyze what might be holding back his earnings in Ethiopia (e.g. under-pricing client projects, not asking for 30-50% upfront deposits on Imako deliverables, transport cost leaks in Addis Ababa, or lack of monthly retainers).
2. Give a rich, thorough, multi-section response formatted in clean markdown:
   - **Direct Assessment**: What the numbers tell us right now.
   - **Mistakes / Inefficiencies Identified**: Where money or focus is being lost.
   - **Actionable ETB Strategy**: Concrete calculations and pricing models (e.g., charging 30,000–80,000+ ETB per web app, milestone breakdown).
   - **Takeaway Rule**: Format a bold callout: "💡 Pro Tip: If you cut X, you save Y ETB..." or "💡 Growth Rule: If you charge X ETB upfront, you gain..."`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map(h => ({
      role: h.role,
      content: h.content,
    })),
    { role: 'user', content: userMessage }
  ];

  const candidateModels = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b'
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        lastError = errorJson;
        console.warn(`Groq model ${model} error:`, errorJson);
        continue;
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const content = choice?.message?.content;
      const reasoning = choice?.message?.reasoning;

      if (content && content.trim().length > 0) {
        return {
          content: content.trim(),
          reasoning: reasoning && reasoning.trim().length > 0 ? reasoning.trim() : undefined,
        };
      }
    } catch (err) {
      lastError = err;
      console.warn(`Fetch error for ${model}:`, err);
    }
  }

  // If all models failed or network error occurred, explain the real issue clearly
  return {
    content: `I could not connect to the Groq AI service. Please check your internet connection or verify your Groq API key in the settings above.\n\nError details: ${JSON.stringify(lastError || 'Network request failed')}`,
    reasoning: `Attempted models: ${candidateModels.join(', ')}. Encountered error: ${String(lastError)}`,
  };
}
