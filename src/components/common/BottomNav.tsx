import React from 'react';
import { useApp, TabType } from '../../context/AppContext';
import { Clock, CheckSquare, Wallet } from 'lucide-react';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, apps, tasks } = useApp();

  // Calculate small indicator badges for ADHD awareness
  const blockedAppsCount = apps.filter(a => a.isBlocked && a.currentUsageMinutes >= a.dailyLimitMinutes).length;
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  const tabs: TabItem[] = [
    {
      id: 'time',
      label: 'Time Management',
      icon: Clock,
      badge: blockedAppsCount > 0 ? blockedAppsCount : undefined,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: Wallet,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-x-2 inset-y-1 bg-sky-50 dark:bg-sky-950/60 rounded-xl -z-10 animate-fade-in" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`} />
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white ${
                      tab.id === 'time' ? 'bg-rose-500' : 'bg-sky-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-1 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
