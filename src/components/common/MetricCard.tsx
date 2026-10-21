import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral' | 'danger' | 'success';
  trendLabel?: string;
  colorTheme?: 'blue' | 'red' | 'green' | 'amber' | 'slate';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  trendLabel,
  colorTheme = 'blue',
  onClick,
}) => {
  const getThemeStyles = () => {
    switch (colorTheme) {
      case 'red':
        return {
          bg: 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40',
          text: 'text-rose-600 dark:text-rose-400',
          iconBg: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300',
        };
      case 'green':
        return {
          bg: 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40',
          text: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
          text: 'text-amber-600 dark:text-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300',
        };
      case 'slate':
        return {
          bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
        };
      case 'blue':
      default:
        return {
          bg: 'bg-sky-50/80 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/40',
          text: 'text-sky-600 dark:text-sky-400',
          iconBg: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300',
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-2xl border transition-all duration-200 ${styles.bg} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && <div className={`p-2 rounded-xl text-base ${styles.iconBg}`}>{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
          {value}
        </span>
        {trendLabel && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              trend === 'danger'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                : trend === 'success'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {trendLabel}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
          {subtext}
        </p>
      )}
    </div>
  );
};
