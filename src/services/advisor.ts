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
      advice: 'Your ledger is clean and ready. Add your income when you get paid, or record transport/client expenses when money goes out.',
      impact: 'If you record every small taxi ride and client payment in ETB, you maintain 100% financial awareness.',
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
 * Intelligent Rule-based Fallback (in ETB)
 */
export function getLocalFinancialAdvice(query: string, transactions: Transaction[]): string {
  const clean = query.toLowerCase().trim();
  const stats = computeFinancialStats(transactions);

  if (clean.includes('mistake') || clean.includes('gain') || clean.includes('why')) {
    if (stats.totalIncome === 0 && stats.totalExpenses === 0) {
      return `Your ledger currently starts at 0 ETB. To track mistakes or gains, begin by logging your client milestones and daily transport receipts. If you charge 20% upfront on client proposals, you gain immediate cash stability.`;
    }
    if (stats.totalExpenses > stats.totalIncome) {
      return `Your main cash leak is that expenses (ETB ${stats.totalExpenses.toLocaleString()}) exceed recorded revenue (ETB ${stats.totalIncome.toLocaleString()}). If you cut discretionary transport by 25%, you save ETB ${Math.round(stats.totalExpenses * 0.25).toLocaleString()} to eliminate the deficit.`;
    }
    return `Looking at your data: You have earned ETB ${stats.totalIncome.toLocaleString()} and spent ETB ${stats.totalExpenses.toLocaleString()} (Net: +ETB ${stats.netBalance.toLocaleString()}). Your main area to optimize is client retainer pricing. If you bundle recurring maintenance contracts, you gain predictable monthly ETB cashflow.`;
  }

  if (clean.includes('transport') || clean.includes('ride') || clean.includes('taxi') || clean.includes('fuel')) {
    const weeklyTransport = stats.transportExpenses;
    const cut20 = Math.round(weeklyTransport * 0.25);
    return `Transport represents ETB ${weeklyTransport.toLocaleString()} (${stats.transportPercentage}% of expenses). If you bundle meetings into dedicated commute days in Addis, you save ETB ${cut20.toLocaleString()} immediately.`;
  }

  const savingTarget = Math.round(stats.totalExpenses * 0.2);
  return `Based on your ETB ${stats.totalIncome.toLocaleString()} income vs ETB ${stats.totalExpenses.toLocaleString()} expenses (Net: ETB ${stats.netBalance.toLocaleString()}): If you cut 15% of discretionary transit and client outing costs, you save ETB ${savingTarget > 0 ? savingTarget : 500} every two weeks.`;
}

/**
 * Groq AI Financial Advisor with Real Llama / GPT-OSS Brain
 * Supports multi-turn conversation and deep contextual financial reasoning in ETB!
 */
export async function queryGroqAdvisor(
  userMessage: string,
  history: ChatMessage[],
  transactions: Transaction[],
  apiKeyOverride?: string
): Promise<string> {
  const apiKey = (apiKeyOverride || storageService.getGroqApiKey() || DEFAULT_GROQ_API_KEY).trim();
  const stats = computeFinancialStats(transactions);

  // Compile recent transactions summary in ETB
  const recentTxList = transactions.slice(0, 10).map(t => 
    `- [${t.date}] ${t.type.toUpperCase()}: ETB ${t.amount.toLocaleString()} | Category: ${t.category} | Note: "${t.note}"`
  ).join('\n') || 'No transactions recorded yet (Current balance is 0 ETB).';

  const systemPrompt = `You are the expert personal financial advisor and business strategist for Mikiyas, an ambitious freelance software developer living and working in Ethiopia (operating Imako Solution).
Mikiyas has ADHD, so he values clear, concise, visual, and highly actionable answers over fluff.
All currency must ALWAYS be in Ethiopian Birr (ETB).

CURRENT FINANCIAL DASHBOARD IN ETB:
- Total Income: ETB ${stats.totalIncome.toLocaleString()}
- Total Expenses: ETB ${stats.totalExpenses.toLocaleString()}
- Net Balance: ETB ${stats.netBalance.toLocaleString()}
- Transport Expenses: ETB ${stats.transportExpenses.toLocaleString()} (${stats.transportPercentage}% of total outflow)
- Client Expenses: ETB ${stats.clientExpenses.toLocaleString()}
- Total Transactions Tracked: ${stats.recentTransactionsCount}
RECENT TRANSACTIONS:
${recentTxList}

YOUR GOALS:
1. Provide a sharp, intelligent, and personalized answer to ANY question Mikiyas asks—whether it's about spending habits, pricing client projects, understanding mistakes, investments in Ethiopia, transport costs in Addis Ababa, or general business finance.
2. Structure your answer with clear bullet points and high-contrast numbers in ETB.
3. Always include an actionable takeaway phrased like:
   "💡 Action Step: If you cut X, you save Y ETB..." or "💡 Strategy: If you charge X ETB upfront, you gain..."
4. Never mention US dollars or USDT unless Mikiyas explicitly asks for currency conversion. Always prioritize ETB.`;

  // Build message chain
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map(h => ({
      role: h.role,
      content: h.content,
    })),
    { role: 'user', content: userMessage }
  ];

  // Try primary model (openai/gpt-oss-120b), then fallback to openai/gpt-oss-20b or qwen/qwen3.8-27b
  const candidateModels = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b'
  ];

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
          temperature: 0.6,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Groq model ${model} failed with:`, errorData);
        continue; // try next candidate model
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && content.trim().length > 0) {
        return content.trim();
      }
    } catch (err) {
      console.warn(`Error querying Groq model ${model}:`, err);
    }
  }

  // Graceful fallback to intelligent local ETB advice if network/API unavailable
  return getLocalFinancialAdvice(userMessage, transactions);
}
