import { BlockedApp, Task, Transaction, ProjectIntake, UserProfile } from '../types';
import { SEED_PROFILE, SEED_APPS, SEED_TASKS, SEED_TRANSACTIONS, SEED_PROJECTS } from '../data/seedData';

// Storage Keys
const KEYS = {
  PROFILE: 'system_mikiyas_profile',
  APPS: 'system_mikiyas_apps',
  TASKS: 'system_mikiyas_tasks',
  TRANSACTIONS: 'system_mikiyas_transactions_v2', // v2 resets to 0 ETB clean slate
  PROJECTS: 'system_mikiyas_projects',
  GROQ_API_KEY: 'system_mikiyas_groq_key',
  LAST_DAILY_RESET: 'system_mikiyas_last_daily_reset',
  LAST_WEEKLY_RESET: 'system_mikiyas_last_weekly_reset',
};

export const DEFAULT_GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || '';

export interface IStorageService {
  getProfile(): UserProfile;
  saveProfile(profile: UserProfile): void;

  getApps(): BlockedApp[];
  saveApps(apps: BlockedApp[]): void;

  getTasks(): Task[];
  saveTasks(tasks: Task[]): void;

  getTransactions(): Transaction[];
  saveTransactions(transactions: Transaction[]): void;
  resetTransactionsToZero(): void;

  getProjects(): ProjectIntake[];
  saveProjects(projects: ProjectIntake[]): void;

  getGroqApiKey(): string;
  saveGroqApiKey(key: string): void;

  checkAndPerformScheduledResets(tasks: Task[], apps: BlockedApp[]): { tasks: Task[]; apps: BlockedApp[]; resetOccurred: boolean };
}

class LocalStorageService implements IStorageService {
  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    if (!localStorage.getItem(KEYS.PROFILE)) {
      this.saveProfile(SEED_PROFILE);
    }
    if (!localStorage.getItem(KEYS.APPS)) {
      this.saveApps(SEED_APPS);
    } else {
      // Ensure apps have blockMode property if migrating
      try {
        const stored = JSON.parse(localStorage.getItem(KEYS.APPS) || '[]');
        let updated = false;
        const normalized = stored.map((app: any) => {
          if (!app.blockMode) {
            updated = true;
            return { ...app, blockMode: app.isBlocked ? 'always' : 'limit' };
          }
          return app;
        });
        if (updated) this.saveApps(normalized);
      } catch (e) {
        // ignore
      }
    }
    if (!localStorage.getItem(KEYS.TASKS)) {
      this.saveTasks(SEED_TASKS);
    }
    // Set money to zero initially as requested
    if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
      this.saveTransactions([]);
    }
    if (!localStorage.getItem(KEYS.PROJECTS)) {
      this.saveProjects(SEED_PROJECTS);
    }
    if (!localStorage.getItem(KEYS.GROQ_API_KEY)) {
      this.saveGroqApiKey(DEFAULT_GROQ_API_KEY);
    }
  }

  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : SEED_PROFILE;
    } catch {
      return SEED_PROFILE;
    }
  }

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile', e);
    }
  }

  getApps(): BlockedApp[] {
    try {
      const data = localStorage.getItem(KEYS.APPS);
      return data ? JSON.parse(data) : SEED_APPS;
    } catch {
      return SEED_APPS;
    }
  }

  saveApps(apps: BlockedApp[]): void {
    try {
      localStorage.setItem(KEYS.APPS, JSON.stringify(apps));
    } catch (e) {
      console.error('Error saving apps', e);
    }
  }

  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(KEYS.TASKS);
      return data ? JSON.parse(data) : SEED_TASKS;
    } catch {
      return SEED_TASKS;
    }
  }

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks', e);
    }
  }

  // Transactions (Starting at 0 ETB)
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions', e);
    }
  }

  resetTransactionsToZero(): void {
    try {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
    } catch (e) {
      console.error('Error resetting transactions', e);
    }
  }

  getProjects(): ProjectIntake[] {
    try {
      const data = localStorage.getItem(KEYS.PROJECTS);
      return data ? JSON.parse(data) : SEED_PROJECTS;
    } catch {
      return SEED_PROJECTS;
    }
  }

  saveProjects(projects: ProjectIntake[]): void {
    try {
      localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects', e);
    }
  }

  // Groq API Key
  getGroqApiKey(): string {
    return localStorage.getItem(KEYS.GROQ_API_KEY) || DEFAULT_GROQ_API_KEY;
  }

  saveGroqApiKey(key: string): void {
    localStorage.setItem(KEYS.GROQ_API_KEY, key.trim() || DEFAULT_GROQ_API_KEY);
  }

  /**
   * Automatic resets for daily/weekly cycle.
   * IMPORTANT: App blocking status (isBlocked: true, blockMode: 'always') is PERMANENT
   * and is NEVER unblocked by scheduled resets!
   */
  checkAndPerformScheduledResets(tasks: Task[], apps: BlockedApp[]): { tasks: Task[]; apps: BlockedApp[]; resetOccurred: boolean } {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastDailyReset = localStorage.getItem(KEYS.LAST_DAILY_RESET);

    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    const mondayStr = monday.toISOString().split('T')[0];
    const lastWeeklyReset = localStorage.getItem(KEYS.LAST_WEEKLY_RESET);

    let resetOccurred = false;
    let updatedTasks = [...tasks];
    let updatedApps = [...apps];

    // Daily reset
    if (lastDailyReset !== todayStr) {
      resetOccurred = true;
      updatedTasks = updatedTasks.map(t => {
        if (t.type === 'daily' && t.completed) {
          return { ...t, completed: false, completedAt: undefined };
        }
        return t;
      });

      // Reset today's usage minutes counters, but KEEP ALL BLOCKING SETTINGS PERMANENT
      updatedApps = updatedApps.map(a => ({
        ...a,
        currentUsageMinutes: 0,
        // isBlocked remains PERMANENT (never reset!)
        // blockMode remains PERMANENT
      }));

      localStorage.setItem(KEYS.LAST_DAILY_RESET, todayStr);
    }

    // Weekly reset
    if (lastWeeklyReset !== mondayStr) {
      resetOccurred = true;
      updatedTasks = updatedTasks.map(t => {
        if (t.type === 'weekly' && t.completed) {
          return { ...t, completed: false, completedAt: undefined };
        }
        return t;
      });

      localStorage.setItem(KEYS.LAST_WEEKLY_RESET, mondayStr);
    }

    if (resetOccurred) {
      this.saveTasks(updatedTasks);
      this.saveApps(updatedApps);
    }

    return { tasks: updatedTasks, apps: updatedApps, resetOccurred };
  }
}

export const storageService: IStorageService = new LocalStorageService();
