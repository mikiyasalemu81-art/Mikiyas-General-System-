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
  packageName?: string; // Android package name (e.g. com.zhiliaoapp.musically)
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
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm format deadline (e.g. "17:00")
  reminderTime: string; // HH:mm format (automatically calculated 3 hours before deadline)
  autoReminderAt?: string; // ISO string for the 3-hour reminder trigger
  notified?: boolean; // whether 3-hour reminder has been sent
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
  reason: string; // REQUIRED free-text reason (e.g. "bought a phone charger", "paid client invoice")
  note?: string; // Optional extra details
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
