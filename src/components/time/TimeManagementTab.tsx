import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { AppBlockCard } from './AppBlockCard';
import { 
  generateWindowsBlockerBat, 
  generateWindowsUnblockerBat, 
  downloadFile 
} from '../../services/systemBlocker';
import { 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Lock, 
  Download, 
  ShieldCheck, 
  Terminal, 
  CheckCircle2 
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

  const handleDownloadWindowsBlocker = () => {
    const batContent = generateWindowsBlockerBat(apps);
    downloadFile('block-distractions.bat', batContent);
    addBanner({
      type: 'info',
      title: 'Windows Blocker Downloaded',
      message: 'Right-click "block-distractions.bat" and choose "Run as administrator" to apply real system-wide blocking!',
    });
  };

  const handleDownloadWindowsUnblocker = () => {
    const batContent = generateWindowsUnblockerBat();
    downloadFile('unblock-distractions.bat', batContent);
    addBanner({
      type: 'info',
      title: 'Windows Unblocker Downloaded',
      message: 'Run "unblock-distractions.bat" as administrator whenever you wish to restore original hosts.',
    });
  };

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

      {/* 2. REAL OS-LEVEL SYSTEM BLOCKER (WINDOWS) */}
      <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Real Windows System-Level Blocker
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500 text-white">
                  Real OS Blocking
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Blocks Instagram, TikTok, Chess.com, and Facebook across <strong className="text-white">every browser (Chrome, Edge, Firefox, Brave)</strong> and desktop app via Windows hosts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadWindowsBlocker}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Real Blocker (.bat)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadWindowsUnblocker}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              <span>Download Unblocker (.bat)</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>
            <strong>How it works:</strong> Download the file, right-click and choose <strong>"Run as administrator"</strong>. Windows will reject connection to all blocked apps instantly!
          </span>
        </div>
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
