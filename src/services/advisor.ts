import { Transaction, ChatMessage } from '../types';

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
 * Chad Personal Assistant & Financial Advisor API Client
 * Calls the secure server-side route `/api/chat`.
 * Never exposes the GROQ_API_KEY to the browser bundle.
 * Sends the full conversation history. No keyword matching or hardcoded fake replies.
 */
export async function queryChadAssistant(
  userMessage: string,
  history: ChatMessage[],
  contextData?: {
    tasksCount?: number;
    pendingTasks?: string[];
    netBalance?: number;
    blockedAppsCount?: number;
    userName?: string;
  }
): Promise<AdvisorResponse> {
  const cleanMessage = userMessage.trim();
  if (!cleanMessage) {
    throw new Error('Message cannot be empty.');
  }

  // Construct full message history array of { role, content }
  const formattedHistory = history.map(m => ({
    role: m.role,
    content: m.content
  }));

  const payload = {
    messages: [...formattedHistory, { role: 'user', content: cleanMessage }],
    contextData
  };

  let response: Response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (netErr: any) {
    throw new Error(`Network failure: Unable to reach /api/chat. (${netErr?.message || 'Check your connection'})`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401 Unauthorized: Invalid or missing GROQ_API_KEY on server. Please check your .env configuration.');
    }
    if (response.status === 429) {
      throw new Error('429 Rate Limit: Groq request limit reached. Please wait a few seconds and try again.');
    }
    if (response.status === 404) {
      throw new Error('404 Model Not Found: The configured Groq model is currently unavailable.');
    }
    throw new Error(data.error || `Server error (${response.status}): ${response.statusText}`);
  }

  if (!data.reply || typeof data.reply !== 'string') {
    throw new Error('Unexpected response format received from assistant API.');
  }

  return {
    content: data.reply.trim(),
    reasoning: data.reasoning ? data.reasoning.trim() : undefined
  };
}
