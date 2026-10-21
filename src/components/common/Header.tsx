import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles, User, Briefcase, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, setIsProfileModalOpen, setIsIntakeModalOpen } = useApp();
  const { theme, toggleTheme } = useTheme();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo / App Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                System for {profile.name || 'Mikiyas'}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                ADHD Focus
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {todayFormatted} • Personal PWA
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Imako Intake Tool Button */}
          <button
            onClick={() => setIsIntakeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500/10 to-sky-500/10 hover:from-rose-500/20 hover:to-sky-500/20 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 shadow-sm transition-all active:scale-95"
            title="Open Imako Solution Project Intake & Prompt Generator"
          >
            <Zap className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden md:inline">Imako</span>
            <span>Intake</span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600" />
            )}
          </button>

          {/* Profile Button */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 transition-all active:scale-95"
            title="Edit Profile"
            aria-label="User Profile"
          >
            <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <span className="hidden sm:inline max-w-[80px] truncate">
              {profile.name || 'Profile'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
