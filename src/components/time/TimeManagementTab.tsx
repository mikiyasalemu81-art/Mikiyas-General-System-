import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { AppBlockCard } from './AppBlockCard';
import { PlatformSetupCard } from './PlatformSetupCard';
import { 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  Lock,
  Info 
} from 'lucide-react';

export const TimeManagementTab: React.FC = () => {
  const { apps, addBanner } = useApp();
  const [filterCategory, setFilterCategory] = useState<'all' | 'social' | 'gaming'>('all');

  // Compute overview metrics
  const totalScreenTimeMinutes = apps.reduce((sum, app) => sum + (app.currentUsageMinutes || 0), 0);
  const hours = Math.floor(totalScreenTimeMinutes / 60);
  const mins = totalScreenTimeMinutes % 60;
  const screenTimeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const permanentlyBlockedApps = apps.filter(a => a.isBlocked && a.blockMode === 'always');
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
      {/* Platform Real Blocking Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200 shadow-sm">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-0.5">
            Platform Notice: Real Phone App Blocking Requires the Android App
          </h4>
          <p>
            The web app alone cannot block other apps on a phone. Real app blocking requires the native Android wrapper (Capacitor + Kotlin plugin using Usage Access & Accessibility Service), which redirects to home when limits are reached and counts blocked attempts. In this web version, you can log manual usage, test limits, and receive small in-app notification banners.
          </p>
        </div>
      </div>

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

      {/* 2. REAL APP BLOCKING PLATFORM SETUP & CHECKLIST */}
      <section>
        <PlatformSetupCard />
      </section>

      {/* 3. TARGETED DISTRACTION APPS */}
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
