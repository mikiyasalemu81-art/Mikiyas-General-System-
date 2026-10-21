import React, { useState, useEffect } from 'react';
import { BlockedApp } from '../../types';
import { ShieldAlert, Lock, X, AlertOctagon, HeartHandshake, ArrowLeft } from 'lucide-react';

interface AppLockShieldModalProps {
  app: BlockedApp | null;
  onClose: () => void;
}

export const AppLockShieldModal: React.FC<AppLockShieldModalProps> = ({ app, onClose }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!app) return;
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [app]);

  if (!app) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border-2 border-rose-500/80 shadow-2xl p-6 text-center relative animate-slide-up"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Pulsing Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Lock className="w-8 h-8 stroke-[2.5]" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          ADHD Focus Shield Active
        </span>

        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-3">
          {app.name} is Permanently Blocked
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
          You set this app to <strong className="text-rose-600 dark:text-rose-400">Blocked</strong> in your system. This barrier protects your focus, time, and client commitments for Imako Solution.
        </p>

        {/* Attempt Counter Display */}
        <div className="my-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-around text-xs">
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Blocked Today:
            </span>
            <span className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
              {app.blockedAttempts} attempts
            </span>
          </div>

          <div className="h-8 w-px bg-rose-200 dark:bg-rose-900/60" />

          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Mode:
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              {app.blockMode === 'always' ? 'Permanent 24/7' : `${app.dailyLimitMinutes}m Daily Limit`}
            </span>
          </div>
        </div>

        {/* Calming deep breath prompt */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 mb-5 font-medium">
          <HeartHandshake className="w-4 h-4 text-sky-500" />
          <span>Take a deep breath and return to what matters.</span>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={onClose}
          disabled={countdown > 0}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
            countdown > 0
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {countdown > 0
              ? `Reflect & Breathe (${countdown}s)...`
              : 'Return to Focus Dashboard'}
          </span>
        </button>
      </div>
    </div>
  );
};
