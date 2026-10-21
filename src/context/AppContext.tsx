import React, { createContext, useContext, useState, useEffect } from 'react';
import { BlockedApp, Task, Transaction, ProjectIntake, UserProfile, BlockMode } from '../types';
import { storageService } from '../services/storage';
import { notificationService } from '../services/notifications';

export type TabType = 'time' | 'tasks' | 'finance';

export interface BannerMessage {
  id: string;
  type: 'blocked' | 'reminder' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;

  apps: BlockedApp[];
  updateAppLimit: (appId: string, limitMinutes: number) => void;
  toggleAppTracking: (appId: string) => void;
  setAppBlockMode: (appId: string, mode: BlockMode) => void;
  recordAppUsage: (appId: string, additionalMinutes: number) => void;
  recordAppLaunchAttempt: (appId: string) => boolean;

  activeLockedApp: BlockedApp | null;
  setActiveLockedApp: (app: BlockedApp | null) => void;

  tasks: Task[];
  addTask: (title: string, type: 'daily' | 'weekly', reminderTime: string, dueDate?: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  resetDailyTasksManual: () => void;

  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  resetFinanceLedger: () => void;

  projects: ProjectIntake[];
  saveProjectIntake: (intake: ProjectIntake) => void;
  deleteProjectIntake: (id: string) => void;

  banners: BannerMessage[];
  dismissBanner: (id: string) => void;
  addBanner: (banner: Omit<BannerMessage, 'id' | 'timestamp'>) => void;

  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  isIntakeModalOpen: boolean;
  setIsIntakeModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('time');
  const [profile, setProfileState] = useState<UserProfile>(() => storageService.getProfile());
  const [apps, setAppsState] = useState<BlockedApp[]>(() => storageService.getApps());
  const [tasks, setTasksState] = useState<Task[]>(() => storageService.getTasks());
  const [transactions, setTransactionsState] = useState<Transaction[]>(() => storageService.getTransactions());
  const [projects, setProjectsState] = useState<ProjectIntake[]>(() => storageService.getProjects());
  const [banners, setBanners] = useState<BannerMessage[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [activeLockedApp, setActiveLockedApp] = useState<BlockedApp | null>(null);

  // Check scheduled resets on mount and interval
  useEffect(() => {
    const checkResets = () => {
      const result = storageService.checkAndPerformScheduledResets(tasks, apps);
      if (result.resetOccurred) {
        setTasksState(result.tasks);
        setAppsState(result.apps);
      }
    };

    checkResets();
    const interval = setInterval(checkResets, 60000);
    return () => clearInterval(interval);
  }, [tasks, apps]);

  // Check task reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = now.toISOString().split('T')[0];

      tasks.forEach(task => {
        if (!task.completed && task.reminderTime === currentTimeStr) {
          const key = `reminded_${task.id}_${todayStr}_${currentTimeStr}`;
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, 'true');
            notificationService.sendTaskReminder(task.title, task.type);
            addBanner({
              type: 'reminder',
              title: `Task Reminder (${task.reminderTime})`,
              message: task.title,
            });
          }
        }
      });
    };

    const reminderInterval = setInterval(checkReminders, 15000);
    return () => clearInterval(reminderInterval);
  }, [tasks]);

  const addBanner = (banner: Omit<BannerMessage, 'id' | 'timestamp'>) => {
    const id = `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newBanner: BannerMessage = {
      ...banner,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setBanners(prev => [newBanner, ...prev.slice(0, 2)]);
  };

  const dismissBanner = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    const newProf = { ...profile, ...updated };
    setProfileState(newProf);
    storageService.saveProfile(newProf);
  };

  // Apps Management - Permanent Setting Preserved
  const updateAppLimit = (appId: string, limitMinutes: number) => {
    const safeLimit = Math.max(1, limitMinutes);
    const updated = apps.map(app => (app.id === appId ? { ...app, dailyLimitMinutes: safeLimit } : app));
    setAppsState(updated);
    storageService.saveApps(updated);
  };

  const toggleAppTracking = (appId: string) => {
    const updated = apps.map(app => {
      if (app.id === appId) {
        return { ...app, isBlocked: !app.isBlocked };
      }
      return app;
    });
    setAppsState(updated);
    storageService.saveApps(updated);
  };

  const setAppBlockMode = (appId: string, mode: BlockMode) => {
    const updated = apps.map(app => {
      if (app.id === appId) {
        return { ...app, blockMode: mode };
      }
      return app;
    });
    setAppsState(updated);
    storageService.saveApps(updated);
  };

  const recordAppUsage = (appId: string, additionalMinutes: number) => {
    const updated = apps.map(app => {
      if (app.id === appId) {
        const newUsage = app.currentUsageMinutes + additionalMinutes;
        if (app.isBlocked && app.blockMode === 'limit' && newUsage >= app.dailyLimitMinutes && app.currentUsageMinutes < app.dailyLimitMinutes) {
          notificationService.sendAppBlockedAlert(app.name, app.dailyLimitMinutes);
          addBanner({
            type: 'blocked',
            title: `${app.name} Limit Reached`,
            message: `${app.name} is blocked for today (${newUsage}/${app.dailyLimitMinutes} min limit).`,
          });
        }
        return { ...app, currentUsageMinutes: newUsage };
      }
      return app;
    });
    setAppsState(updated);
    storageService.saveApps(updated);
  };

  /**
   * Called when user tries to open or launch an app.
   * If permanently blocked or limit exceeded:
   * Increments attempt counter, plays warning tone, shows small banner, and displays lock shield!
   */
  const recordAppLaunchAttempt = (appId: string): boolean => {
    const app = apps.find(a => a.id === appId);
    if (!app) return false;

    const isPermanentBlocked = app.isBlocked && app.blockMode === 'always';
    const isLimitExceeded = app.isBlocked && app.blockMode === 'limit' && app.currentUsageMinutes >= app.dailyLimitMinutes;

    if (isPermanentBlocked || isLimitExceeded) {
      const updatedApp = {
        ...app,
        blockedAttempts: app.blockedAttempts + 1,
        lastAttemptAt: new Date().toISOString(),
      };

      const updatedList = apps.map(a => (a.id === appId ? updatedApp : a));
      setAppsState(updatedList);
      storageService.saveApps(updatedList);

      notificationService.playChime('blocked');
      setActiveLockedApp(updatedApp);

      addBanner({
        type: 'blocked',
        title: `${app.name} is Blocked`,
        message: `${isPermanentBlocked ? 'Permanently blocked 24/7' : 'Daily limit reached'}. Attempt #${updatedApp.blockedAttempts} stopped.`,
      });
      return true;
    }

    return false;
  };

  // Tasks Management
  const addTask = (title: string, type: 'daily' | 'weekly', reminderTime: string, dueDate?: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      type,
      reminderTime,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setTasksState(updated);
    storageService.saveTasks(updated);
  };

  const toggleTaskCompletion = (taskId: string) => {
    const updated = tasks.map(task => {
      if (task.id === taskId) {
        const nextState = !task.completed;
        if (nextState) notificationService.playChime('success');
        return {
          ...task,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return task;
    });
    setTasksState(updated);
    storageService.saveTasks(updated);
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasksState(updated);
    storageService.saveTasks(updated);
  };

  const resetDailyTasksManual = () => {
    const updated = tasks.map(t => (t.type === 'daily' ? { ...t, completed: false, completedAt: undefined } : t));
    setTasksState(updated);
    storageService.saveTasks(updated);
  };

  // Transactions Management (in ETB)
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    const updated = [newTx, ...transactions];
    setTransactionsState(updated);
    storageService.saveTransactions(updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactionsState(updated);
    storageService.saveTransactions(updated);
  };

  const resetFinanceLedger = () => {
    storageService.resetTransactionsToZero();
    setTransactionsState([]);
  };

  // Project Intakes Management
  const saveProjectIntake = (intake: ProjectIntake) => {
    const existingIndex = projects.findIndex(p => p.id === intake.id);
    let updated: ProjectIntake[];
    if (existingIndex >= 0) {
      updated = [...projects];
      updated[existingIndex] = intake;
    } else {
      updated = [intake, ...projects];
    }
    setProjectsState(updated);
    storageService.saveProjects(updated);
  };

  const deleteProjectIntake = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjectsState(updated);
    storageService.saveProjects(updated);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        profile,
        updateProfile,
        apps,
        updateAppLimit,
        toggleAppTracking,
        setAppBlockMode,
        recordAppUsage,
        recordAppLaunchAttempt,
        activeLockedApp,
        setActiveLockedApp,
        tasks,
        addTask,
        toggleTaskCompletion,
        deleteTask,
        resetDailyTasksManual,
        transactions,
        addTransaction,
        deleteTransaction,
        resetFinanceLedger,
        projects,
        saveProjectIntake,
        deleteProjectIntake,
        banners,
        dismissBanner,
        addBanner,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isIntakeModalOpen,
        setIsIntakeModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
