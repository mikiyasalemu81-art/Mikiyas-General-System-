import React, { createContext, useContext, useState, useEffect } from 'react';
import { BlockedApp, Task, Transaction, ProjectIntake, UserProfile, BlockMode } from '../types';
import { storageService } from '../services/storage';
import { notificationService } from '../services/notifications';
import { NativeBlockerService } from '../services/nativeBlocker';
import { isTaskOverdue } from '../utils/taskUtils';

export type TabType = 'tasks' | 'finance';

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
  addCustomApp: (name: string, packageName: string, limitMinutes?: number) => void;

  activeLockedApp: BlockedApp | null;
  setActiveLockedApp: (app: BlockedApp | null) => void;

  tasks: Task[];
  addTask: (title: string, type: 'daily' | 'weekly', dueDate?: string, dueTime?: string) => void;
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
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
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

  // Check automatic 3-hour task reminders and sync with Service Worker
  useEffect(() => {
    notificationService.syncTasksWithServiceWorker(tasks);

    const checkReminders = () => {
      const nowMs = Date.now();

      tasks.forEach(task => {
        if (!task.completed && task.dueDate && task.dueTime) {
          const deadlineMs = new Date(`${task.dueDate}T${task.dueTime}:00`).getTime();
          const autoReminderMs = deadlineMs - 3 * 60 * 60 * 1000;
          const key = `reminded_3h_${task.id}`;

          // Trigger reminder at 3 hours before deadline
          if (nowMs >= autoReminderMs && nowMs < deadlineMs) {
            if (!sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, 'true');
              notificationService.sendThreeHourReminder(task.title, task.dueTime);
              addBanner({
                type: 'reminder',
                title: `Task Due in 3 Hours (${task.dueTime})`,
                message: task.title,
              });
            }
          }

          // Trigger missed deadline alert when deadline has passed (Not Done status)
          const missedKey = `notified_missed_${task.id}`;
          if (isTaskOverdue(task) && !sessionStorage.getItem(missedKey)) {
            sessionStorage.setItem(missedKey, 'true');
            notificationService.sendDeadlineMissedNotification(task.title, task.dueTime);
            addBanner({
              type: 'reminder',
              title: `Task Deadline Missed (${task.dueTime})`,
              message: `"${task.title}" has passed its deadline and is marked as Not Done!`,
            });
          }
        }
      });
    };

    checkReminders();
    const reminderInterval = setInterval(checkReminders, 15000);
    return () => clearInterval(reminderInterval);
  }, [tasks]);

  // Sync blocked apps to Android native plugin & desktop Chrome extension storage
  useEffect(() => {
    NativeBlockerService.syncAppsToNative(apps).catch(() => {});
  }, [apps]);

  // Realtime Android blocking listener & initial usage sync
  useEffect(() => {
    if (NativeBlockerService.isNativeAvailable()) {
      let listenerHandle: any = null;

      NativeBlockerService.registerBlockListener((data) => {
        const matchingApp = apps.find(a => a.packageName === data.packageName);
        const appName = matchingApp ? matchingApp.name : data.packageName;

        notificationService.playChime('blocked');
        addBanner({
          type: 'blocked',
          title: `${appName} Blocked`,
          message: `${appName} was closed by System for Mikiyas. Urge stopped! Attempt #${data.attempts}`,
        });

        setAppsState(prev => prev.map(a => {
          if (a.packageName === data.packageName) {
            return {
              ...a,
              blockedAttempts: data.attempts,
              lastAttemptAt: new Date(data.timestamp).toISOString(),
            };
          }
          return a;
        }));
      }).then(handle => {
        listenerHandle = handle;
      });

      // Fetch real foreground usage stats from Android UsageStatsManager
      Promise.all([
        NativeBlockerService.getRealUsage(),
        NativeBlockerService.getBlockedAttempts(),
      ]).then(([usageMap, attemptsMap]) => {
        if (Object.keys(usageMap).length > 0 || Object.keys(attemptsMap).length > 0) {
          setAppsState(prev => prev.map(a => {
            const pkg = a.packageName;
            if (!pkg) return a;
            const realUsage = usageMap[pkg] !== undefined ? usageMap[pkg] : a.currentUsageMinutes;
            const realAttempts = attemptsMap[pkg] !== undefined ? attemptsMap[pkg] : a.blockedAttempts;
            return {
              ...a,
              currentUsageMinutes: realUsage,
              blockedAttempts: realAttempts,
            };
          }));
        }
      }).catch(console.warn);

      return () => {
        if (listenerHandle && listenerHandle.remove) {
          listenerHandle.remove();
        }
      };
    }
  }, []);

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
      // Show small notification banner (not full-screen alert)
      setActiveLockedApp(null);

      addBanner({
        type: 'blocked',
        title: `${app.name} is Blocked`,
        message: `${isPermanentBlocked ? 'Permanently blocked 24/7' : 'Daily limit reached'}. Attempt #${updatedApp.blockedAttempts} stopped.`,
      });
      return true;
    }

    return false;
  };

  const addCustomApp = (name: string, packageName: string, limitMinutes: number = 30) => {
    const cleanPkg = packageName.trim();
    if (!cleanPkg) return;

    const existing = apps.find(a => a.packageName === cleanPkg || a.id === cleanPkg);
    if (existing) {
      addBanner({
        type: 'info',
        title: 'App Already Monitored',
        message: `${name || cleanPkg} is already registered in your distraction shield.`,
      });
      return;
    }

    const newApp: BlockedApp = {
      id: `custom_${cleanPkg.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: name.trim() || cleanPkg,
      category: 'other',
      icon: 'Smartphone',
      url: '',
      domains: [],
      packageName: cleanPkg,
      isBlocked: true,
      blockMode: 'limit',
      dailyLimitMinutes: Math.max(5, limitMinutes),
      currentUsageMinutes: 0,
      blockedAttempts: 0,
    };

    const updated = [...apps, newApp];
    setAppsState(updated);
    storageService.saveApps(updated);

    addBanner({
      type: 'info',
      title: 'App Added to Shield',
      message: `${newApp.name} is now tracked with a ${newApp.dailyLimitMinutes}-min limit.`,
    });
  };

  // Tasks Management with Automatic 3-Hour Reminders
  const addTask = (title: string, type: 'daily' | 'weekly', dueDate?: string, dueTime?: string) => {
    const targetDate = dueDate || new Date().toISOString().split('T')[0];
    const targetTime = dueTime || '18:00';

    // Calculate 3 hours before deadline
    const [h, m] = targetTime.split(':').map(Number);
    const totalMins = (h || 0) * 60 + (m || 0) - 180;
    const normalized = (totalMins + 24 * 60) % (24 * 60);
    const rh = Math.floor(normalized / 60);
    const rm = normalized % 60;
    const autoReminderTime = `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;

    const deadlineMs = new Date(`${targetDate}T${targetTime}:00`).getTime();
    const autoReminderMs = deadlineMs - 3 * 60 * 60 * 1000;
    const nowMs = Date.now();
    const minutesRemaining = Math.round((deadlineMs - nowMs) / 60000);
    const isDueInLessThanThreeHours = minutesRemaining <= 180;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      type,
      dueDate: targetDate,
      dueTime: targetTime,
      reminderTime: autoReminderTime,
      autoReminderAt: new Date(autoReminderMs).toISOString(),
      notified: isDueInLessThanThreeHours,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTask, ...tasks];
    setTasksState(updated);
    storageService.saveTasks(updated);

    // Sync with Service Worker for background dispatch
    notificationService.syncTasksWithServiceWorker(updated);

    if (isDueInLessThanThreeHours) {
      notificationService.sendImmediateReminder(title, minutesRemaining, targetTime);
      addBanner({
        type: 'reminder',
        title: 'Task Due in < 3 Hours!',
        message: `"${title}" is due at ${targetTime} (${minutesRemaining <= 0 ? 'Due right now' : `${minutesRemaining}m remaining`})!`,
      });
    } else {
      addBanner({
        type: 'info',
        title: 'Task Added with Auto-Reminder',
        message: `"${title}" deadline is ${targetTime}. You'll be alerted at ${autoReminderTime} (3 hours before).`,
      });
    }
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
    notificationService.syncTasksWithServiceWorker(updated);
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasksState(updated);
    storageService.saveTasks(updated);
    notificationService.syncTasksWithServiceWorker(updated);
  };

  const resetDailyTasksManual = () => {
    const updated = tasks.map(t => (t.type === 'daily' ? { ...t, completed: false, completedAt: undefined } : t));
    setTasksState(updated);
    storageService.saveTasks(updated);
    notificationService.syncTasksWithServiceWorker(updated);
  };

  // Transactions Management (in ETB with Required Reason)
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const trimmedReason = (tx.reason || '').trim();
    if (!trimmedReason) {
      addBanner({
        type: 'info',
        title: 'Reason Required',
        message: 'A reason is required to record every transaction (e.g. bought a phone charger, bus fare to meeting).',
      });
      return;
    }

    const newTx: Transaction = {
      ...tx,
      reason: trimmedReason,
      note: tx.note?.trim() || trimmedReason,
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
        addCustomApp,
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
