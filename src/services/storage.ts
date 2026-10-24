import { BlockedApp, Task, Transaction, ProjectIntake, UserProfile, Exam } from '../types';
import { SEED_PROFILE, SEED_APPS, SEED_TASKS, SEED_TRANSACTIONS, SEED_PROJECTS, SEED_EXAMS } from '../data/seedData';

// Storage Keys
const KEYS = {
  PROFILE: 'system_mikiyas_profile',
  APPS: 'system_mikiyas_apps_v2',
  TASKS: 'system_mikiyas_tasks',
  TRANSACTIONS: 'system_mikiyas_transactions_v2',
  PROJECTS: 'system_mikiyas_projects',
  EXAMS: 'system_mikiyas_exams',
  GROQ_API_KEY: 'system_mikiyas_groq_key_v2',
  LAST_DAILY_RESET: 'system_mikiyas_last_daily_reset',
  LAST_WEEKLY_RESET: 'system_mikiyas_last_weekly_reset',
};

export interface IStorageService {
  getProfile(): UserProfile;
  saveProfile(profile: UserProfile): void;

  getApps(): BlockedApp[];
  saveApps(apps: BlockedApp[]): void;

  getTasks(): Task[];
  saveTasks(tasks: Task[]): void;

  getExams(): Exam[];
  saveExams(exams: Exam[]): void;
  deleteExam(examId: string): void;

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
    }
    if (!localStorage.getItem(KEYS.TASKS)) {
      this.saveTasks(SEED_TASKS);
    }
    if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
      this.saveTransactions([]);
    }
    if (!localStorage.getItem(KEYS.PROJECTS)) {
      this.saveProjects(SEED_PROJECTS);
    }
    if (!localStorage.getItem(KEYS.EXAMS)) {
      this.saveExams(SEED_EXAMS);
      // Ensure seed tasks include the exam's study tasks if tasks were previously initialized
      const existingTasks = this.getTasks();
      const hasExamTasks = existingTasks.some(t => t.examId === 'exam-seed-1');
      if (!hasExamTasks) {
        const seedExamTasks = SEED_TASKS.filter(t => t.examId === 'exam-seed-1');
        this.saveTasks([...existingTasks, ...seedExamTasks]);
      }
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

  getExams(): Exam[] {
    try {
      const data = localStorage.getItem(KEYS.EXAMS);
      return data ? JSON.parse(data) : SEED_EXAMS;
    } catch {
      return SEED_EXAMS;
    }
  }

  saveExams(exams: Exam[]): void {
    try {
      localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
    } catch (e) {
      console.error('Error saving exams', e);
    }
  }

  deleteExam(examId: string): void {
    try {
      const exams = this.getExams().filter(e => e.id !== examId);
      this.saveExams(exams);
    } catch (e) {
      console.error('Error deleting exam', e);
    }
  }

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

  getGroqApiKey(): string {
    return localStorage.getItem(KEYS.GROQ_API_KEY) || '';
  }

  saveGroqApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(KEYS.GROQ_API_KEY, key.trim());
    } else {
      localStorage.removeItem(KEYS.GROQ_API_KEY);
    }
  }

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

    if (lastDailyReset !== todayStr) {
      resetOccurred = true;
      updatedTasks = updatedTasks.map(t => {
        if (t.type === 'daily' && t.completed) {
          return { ...t, completed: false, completedAt: undefined };
        }
        return t;
      });

      updatedApps = updatedApps.map(a => ({
        ...a,
        currentUsageMinutes: 0,
      }));

      localStorage.setItem(KEYS.LAST_DAILY_RESET, todayStr);
    }

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
