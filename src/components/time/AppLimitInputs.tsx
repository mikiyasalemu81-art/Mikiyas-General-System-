import React from 'react';

interface AppLimitInputsProps {
  value: number; // minutes
  onChange: (minutes: number) => void;
  disabled?: boolean;
}

export const AppLimitInputs: React.FC<AppLimitInputsProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const presets = [
    { label: '30m', minutes: 30 },
    { label: '1 hr', minutes: 60 },
    { label: '2 hr', minutes: 120 },
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleCustomNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChange(Math.max(1, Math.min(600, val)));
    }
  };

  return (
    <div className={`space-y-3 pt-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Label and Presets */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Daily Time Limit:
        </span>
        <div className="flex items-center gap-1.5">
          {presets.map((preset) => {
            const isSelected = value === preset.minutes;
            return (
              <button
                key={preset.minutes}
                type="button"
                onClick={() => onChange(preset.minutes)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-sky-500 border-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider & Custom Number in Sync */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="range"
            min="5"
            max="240"
            step="5"
            value={Math.min(240, Math.max(5, value))}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            aria-label="Daily limit slider"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>5m</span>
            <span>1h</span>
            <span>2h</span>
            <span>4h</span>
          </div>
        </div>

        {/* Custom Number Input */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <input
            type="number"
            min="1"
            max="600"
            value={value}
            onChange={handleCustomNumberChange}
            className="w-14 bg-transparent text-right font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none"
            aria-label="Custom minutes input"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">min</span>
        </div>
      </div>
    </div>
  );
};
