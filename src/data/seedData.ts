import { BlockedApp, Task, Transaction, ProjectIntake, UserProfile } from '../types';

export const SEED_PROFILE: UserProfile = {
  name: 'Mikiyas',
  email: 'mikiyas@imakosolution.com',
  theme: 'light',
};

// Apps with real URLs and domain lists for OS-level and in-app blocking
export const SEED_APPS: BlockedApp[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    icon: 'Camera',
    url: 'https://www.instagram.com',
    domains: ['instagram.com', 'www.instagram.com', 'api.instagram.com', 'threads.net', 'www.threads.net'],
    packageName: 'com.instagram.android',
    isBlocked: true,
    blockMode: 'always',
    dailyLimitMinutes: 30,
    currentUsageMinutes: 0,
    blockedAttempts: 5,
    lastAttemptAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'social',
    icon: 'Music2',
    url: 'https://www.tiktok.com',
    domains: ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com', 'v16.tiktokcdn.com'],
    packageName: 'com.zhiliaoapp.musically',
    isBlocked: true,
    blockMode: 'always',
    dailyLimitMinutes: 30,
    currentUsageMinutes: 0,
    blockedAttempts: 3,
    lastAttemptAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'youtube_shorts',
    name: 'YouTube Shorts',
    category: 'social',
    icon: 'PlaySquare',
    url: 'https://www.youtube.com/shorts',
    domains: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'],
    packageName: 'com.google.android.youtube',
    isBlocked: true,
    blockMode: 'limit',
    dailyLimitMinutes: 30,
    currentUsageMinutes: 15,
    blockedAttempts: 0,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'social',
    icon: 'Share2',
    url: 'https://www.facebook.com',
    domains: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.com'],
    packageName: 'com.facebook.katana',
    isBlocked: false,
    blockMode: 'always',
    dailyLimitMinutes: 30,
    currentUsageMinutes: 0,
    blockedAttempts: 0,
  },
  {
    id: 'chess_com',
    name: 'Chess.com',
    category: 'gaming',
    icon: 'Gamepad2',
    url: 'https://www.chess.com',
    domains: ['chess.com', 'www.chess.com'],
    packageName: 'com.chess',
    isBlocked: true,
    blockMode: 'limit',
    dailyLimitMinutes: 60,
    currentUsageMinutes: 20,
    blockedAttempts: 0,
  },
  {
    id: 'other_games',
    name: 'Mobile / Casual Games',
    category: 'gaming',
    icon: 'Swords',
    url: 'https://poki.com',
    domains: ['poki.com', 'www.poki.com', 'crazygames.com'],
    isBlocked: false,
    blockMode: 'always',
    dailyLimitMinutes: 60,
    currentUsageMinutes: 0,
    blockedAttempts: 0,
  },
];

export const getTodayString = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const SEED_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Morning ADHD routine: 15-min walk, hydration & medication check',
    type: 'daily',
    dueDate: getTodayString(0),
    dueTime: '11:30',
    reminderTime: '08:30',
    completed: true,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    title: 'Imako Solution: Client code review & push branch updates',
    type: 'daily',
    dueDate: getTodayString(0),
    dueTime: '14:00',
    reminderTime: '11:00',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    title: 'Log daily transport and client expenses in ETB',
    type: 'daily',
    dueDate: getTodayString(0),
    dueTime: '22:00',
    reminderTime: '19:00',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-4',
    title: 'Submit Imako weekly sprint deliverables to client',
    type: 'weekly',
    dueDate: getTodayString(2),
    dueTime: '19:00',
    reminderTime: '16:00',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export const SEED_TRANSACTIONS: Transaction[] = [];

export const SEED_PROJECTS: ProjectIntake[] = [
  {
    id: 'proj-1',
    clientName: 'EthioPay Financial Solutions',
    projectType: 'Fintech Web Application & Merchant Portal',
    description: 'Modern, high-security dashboard for EthioPay merchants to monitor settlements, manage QR payments, and reconcile daily transactions in ETB.',
    referenceLinks: 'https://stripe.com/dashboard',
    budget: '250,000 ETB',
    deadline: getTodayString(28),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    answers: {
      'scope-1': 'Web application with responsive mobile view. PWA installable for tablets.',
      'scope-2': 'Yes, MVP within 4 weeks followed by phase 2 analytics in 8 weeks.',
      'audience-1': 'Small and medium Ethiopian business owners and finance officers.',
      'branding-1': 'Corporate dark blue (#0c2340) with vibrant cyan (#00d2ff) accents.',
      'features-1': 'Real-time transaction stream, export CSV/PDF, multi-user role permissions.',
      'integrations-1': 'Local bank payment APIs and Telebirr webhook endpoints.',
      'payments-1': 'Merchant settlement payouts in ETB with two-factor authorization.',
      'languages-1': 'English and Amharic dual language toggle.',
      'hosting-1': 'Vercel frontend with containerized Node backend on AWS Lightsail.',
      'security-1': 'Strict RBAC, audit logging, and encrypted session tokens.',
    },
    generatedPrompt: `# Antigravity Specification Prompt: EthioPay Merchant Portal

## 1. System Overview & Objectives
Build a high-performance, single-page fintech merchant portal and dashboard for **EthioPay Financial Solutions**.
- **Client**: EthioPay Financial Solutions
- **Primary Deliverable**: Merchant settlement dashboard with QR payment tracking in ETB and dual-language (English/Amharic) support.
- **Budget / Scope**: 250,000 ETB milestone project delivered via Imako Solution.`
  }
];
