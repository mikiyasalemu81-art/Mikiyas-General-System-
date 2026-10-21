// Types for System for Mikiyas

export interface UserProfile {
  name: string;
  email: string;
  theme: 'light' | 'dark';
}

export type BlockMode = 'always' | 'limit';

export interface BlockedApp {
  id: string;
  name: string;
  category: 'social' | 'gaming' | 'other';
  icon: string;
  url: string; // external site url
  domains: string[]; // domains to block in hosts/DNS
  isBlocked: boolean; // whether blocking is active
  blockMode: BlockMode; // 'always' = 24/7 permanent lock; 'limit' = blocked after daily limit
  dailyLimitMinutes: number; // in minutes (for limit mode)
  currentUsageMinutes: number; // in minutes today
  blockedAttempts: number; // total attempts stopped
  lastAttemptAt?: string;
}

export type TaskType = 'daily' | 'weekly';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  reminderTime: string; // HH:mm format (e.g. "09:00")
  dueDate?: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type FinanceCategory = 'Transport' | 'Clients';
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note: string;
  category: FinanceCategory; // strictly Transport or Clients
  type: TransactionType;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string; // AI internal thinking process
  timestamp: string;
}

export interface ProjectIntake {
  id: string;
  clientName: string;
  projectType: string;
  description: string;
  referenceLinks: string;
  budget: string;
  deadline: string;
  createdAt: string;
  answers: Record<string, string>;
  generatedPrompt?: string;
}

export interface IntakeQuestion {
  id: string;
  category: string;
  question: string;
  helpText?: string;
  suggestedAnswers?: string[];
}
