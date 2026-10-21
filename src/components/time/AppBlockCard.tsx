import React, { useState } from 'react';
import { BlockedApp, BlockMode } from '../../types';
import { useApp } from '../../context/AppContext';
import { AppLimitInputs } from './AppLimitInputs';
import { 
  Instagram, 
  Youtube, 
  Facebook, 
  Gamepad2, 
  Swords, 
  Music2, 
  ShieldAlert, 
  Play, 
  Lock,
  ExternalLink
} from 'lucide-react';

interface AppBlockCardProps {
  app: BlockedApp;
}

export const AppBlockCard: React.FC<AppBlockCardProps> = ({ app }) => {
  const { 
    updateAppLimit, 
    toggleAppTracking, 
    setAppBlockMode,
    recordAppUsage, 
    recordAppLaunchAttempt 
  } = useApp();

  const [isSimulating, setIsSimulating] = useState(false);

  const getAppIcon = (id: string) => {
    switch (id) {
      case 'instagram':
        return <Instagram className="w-5 h-5 text-rose-500" />;
      case 'tiktok':
        return <Music2 className="w-5 h-5 text-sky-500" />;
      case 'youtube_shorts':
        return <Youtube className="w-5 h-5 text-red-600" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'chess_com':
        return <Gamepad2 className="w-5 h-5 text-emerald-500" />;
      case 'other_games':
      default:
        return <Swords className="w-5 h-5 text-purple-500" />;
    }
  };

  const isPermanentBlocked = app.isBlocked && app.blockMode === 'always';
  const isOverLimit = app.isBlocked && app.blockMode === 'limit' && app.currentUsageMinutes >= app.dailyLimitMinutes;
  const isNearLimit = app.isBlocked && app.blockMode === 'limit' && !isOverLimit && app.currentUsageMinutes >= app.dailyLimitMinutes * 0.8;
  const isLocked = isPermanentBlocked || isOverLimit;

  const progressPercent = Math.min(100, Math.round((app.currentUsageMinutes / app.dailyLimitMinutes) * 100));

  const handleLaunch = () => {
    setIsSimulating(true);
    // Functional blocking check
    const wasBlocked = recordAppLaunchAttempt(app.id);
    if (!wasBlocked) {
      if (app.url) {
        window.open(app.url, '_blank', 'noopener,noreferrer');
      }
      recordAppUsage(app.id, 10);
    }
    setTimeout(() => setIsSimulating(false), 300);
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        isLocked
          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-sm'
          : isNearLimit
          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top Header: Icon, Name, Category, Switch */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
            {getAppIcon(app.id)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {app.name}
              </h3>
              {isPermanentBlocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-sm">
                  <Lock className="w-2.5 h-2.5" />
                  Permanently Blocked
                </span>
              )}
              {isOverLimit && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  <ShieldAlert className="w-3 h-3" />
                  Limit Reached
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {app.category} • {app.isBlocked ? (app.blockMode === 'always' ? '24/7 Locked' : 'Daily Limit Active') : 'Unrestricted'}
            </p>
          </div>
        </div>

        {/* Blocking Switch - Toggle Permanent Protection */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
            {app.isBlocked ? 'Blocked' : 'Allowed'}
          </span>
          <button
            type="button"
            onClick={() => toggleAppTracking(app.id)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              app.isBlocked ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            role="switch"
            aria-checked={app.isBlocked}
            aria-label={`Toggle permanent block for ${app.name}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                app.isBlocked ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* When Blocked is ON: Choose Permanent Mode or Limit Mode */}
      {app.isBlocked && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Mode Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Protection Mode:
            </span>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAppBlockMode(app.id, 'always')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  app.blockMode === 'always'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Permanent 24/7</span>
              </button>

              <button
                type="button"
                onClick={() => setAppBlockMode(app.id, 'limit')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  app.blockMode === 'limit'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>Daily Limit</span>
              </button>
            </div>
          </div>

          {/* If Permanent 24/7 Mode is active */}
          {app.blockMode === 'always' ? (
            <div className="p-3 rounded-xl bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="font-medium">
                  {app.name} is permanently locked 24/7.
                </span>
              </div>
              <span className="font-mono font-black text-rose-700 dark:text-rose-300">
                {app.blockedAttempts} stopped
              </span>
            </div>
          ) : (
            // If Daily Limit Mode is active
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-600 dark:text-slate-400">
                  Today's Usage:
                </span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span
                    className={`font-bold ${
                      isOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {app.currentUsageMinutes}m
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {app.dailyLimitMinutes}m limit
                  </span>
                </div>
              </div>

              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOverLimit ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <AppLimitInputs
                value={app.dailyLimitMinutes}
                onChange={(newLimit) => updateAppLimit(app.id, newLimit)}
              />
            </div>
          )}

          {/* Test / Launch and Attempts Counter */}
          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Blocked attempts:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {app.blockedAttempts}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLaunch}
              disabled={isSimulating}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl shadow-sm transition-all ${
                isLocked
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95'
                  : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 active:scale-95'
              }`}
              title={isLocked ? "Functional lock interceptor test" : "Open app in browser"}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
              <span>{isLocked ? 'Launch App (Blocked)' : 'Open Web App'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
