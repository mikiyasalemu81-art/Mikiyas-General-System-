import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, Bell, X, ShieldAlert } from 'lucide-react';

export const SmallBannerList: React.FC = () => {
  const { banners, dismissBanner } = useApp();

  if (banners.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 px-4 sm:px-6 max-w-lg mx-auto flex flex-col gap-2 pointer-events-none">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-200 animate-slide-up ${
            banner.type === 'blocked'
              ? 'bg-rose-50/95 border-rose-300 text-rose-900 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-100 adhd-glow-red'
              : banner.type === 'reminder'
              ? 'bg-sky-50/95 border-sky-300 text-sky-900 dark:bg-sky-950/90 dark:border-sky-800 dark:text-sky-100 adhd-glow'
              : 'bg-slate-50/95 border-slate-300 text-slate-900 dark:bg-slate-900/90 dark:border-slate-700 dark:text-slate-100'
          }`}
          role="alert"
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 shrink-0">
              {banner.type === 'blocked' ? (
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 animate-pulse" />
              ) : banner.type === 'reminder' ? (
                <Bell className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {banner.title}
                </h4>
                <span className="text-[10px] opacity-75 font-mono">{banner.timestamp}</span>
              </div>
              <p className="text-xs mt-0.5 leading-snug font-medium">
                {banner.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => dismissBanner(banner.id)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title="Dismiss notification"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
