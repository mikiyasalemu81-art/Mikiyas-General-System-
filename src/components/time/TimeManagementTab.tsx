import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { AppBlockCard } from './AppBlockCard';
import { 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Lock,
  Smartphone,
  Flame
} from 'lucide-react';

export const TimeManagementTab: React.FC = () => {
  const { apps } = useApp();
  const [filterCategory, setFilterCategory] = useState<'all' | 'social' | 'gaming'>('all');

  // Compute overview metrics
  const totalScreenTimeMinutes = apps.reduce((sum, app) => sum + (app.currentUsageMinutes || 0), 0);
  const hours = Math.floor(totalScreenTimeMinutes / 60);
  const mins = totalScreenTimeMinutes % 60;
  const screenTimeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const permanentlyBlockedApps = apps.filter(a => a.isBlocked && a.blockMode === 'always');
  const limitReachedApps = apps.filter(a => a.isBlocked && a.blockMode === 'limit' && a.currentUsageMinutes >= a.dailyLimitMinutes);
  const totalBlockedApps = apps.filter(a => a.isBlocked && (a.blockMode === 'always' || a.currentUsageMinutes >= a.dailyLimitMinutes));

  const appsNearOrOverLimit = apps.filter(
    (a) => a.isBlocked && (a.blockMode === 'always' || a.currentUsageMinutes >= a.dailyLimitMinutes * 0.8)
  );

  const totalBlockedAttempts = apps.reduce((sum, app) => sum + (app.blockedAttempts || 0), 0);

  const filteredApps = apps.filter((app) => {
    if (filterCategory === 'all') return true;
    return app.category === filterCategory;
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* 1. TOP OVERVIEW METRICS */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Daily Focus & Distraction Shield
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permanent locks, daily limits, and attempt tracking
            </p>
          </div>
          {totalBlockedApps.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse">
              <Lock className="w-3.5 h-3.5" />
              {totalBlockedApps.length} Blocked
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Total Screen Time"
            value={screenTimeFormatted}
            subtext={`${apps.length} apps monitored`}
            icon={<Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
            colorTheme="blue"
          />

          <MetricCard
            label="Blocked & Near Limit"
            value={appsNearOrOverLimit.length}
            subtext={
              permanentlyBlockedApps.length > 0
                ? `${permanentlyBlockedApps.length} permanent 24/7 locks active`
                : 'All apps within healthy range'
            }
            icon={<AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            colorTheme={appsNearOrOverLimit.length > 0 ? 'amber' : 'slate'}
            trend={appsNearOrOverLimit.length > 0 ? 'danger' : 'neutral'}
            trendLabel={totalBlockedApps.length > 0 ? `${totalBlockedApps.length} locked` : undefined}
          />

          <MetricCard
            label="Blocked Attempts"
            value={totalBlockedAttempts}
            subtext="Distraction urges successfully stopped"
            icon={<ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
            colorTheme={totalBlockedAttempts > 0 ? 'red' : 'slate'}
            trend={totalBlockedAttempts > 0 ? 'danger' : 'neutral'}
          />
        </div>
      </section>

      {/* 2. PWA LIMITATION TRANSPARENCY NOTICE */}
      <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/40 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
        <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-900 dark:text-white">Permanent Functional Barrier: </span>
          When you toggle an app to Blocked, it stays permanently locked 24/7. Any attempt to launch or browse it triggers the Focus Lock Shield, refuses entry, and records the attempt count.
        </div>
      </div>

      {/* 3. APP BLOCKING & LIMIT CONTROLS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Targeted Distraction Apps
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Toggle to permanently block or apply synchronized daily limits
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Apps
            </button>
            <button
              onClick={() => setFilterCategory('social')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === 'social'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Social Media
            </button>
            <button
              onClick={() => setFilterCategory('gaming')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === 'gaming'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Gaming
            </button>
          </div>
        </div>

        {/* List of App Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredApps.map((app) => (
            <AppBlockCard key={app.id} app={app} />
          ))}
        </div>
      </section>
    </div>
  );
};
