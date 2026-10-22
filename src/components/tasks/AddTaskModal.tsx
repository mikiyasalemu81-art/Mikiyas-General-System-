import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Clock, Calendar, CheckSquare, Repeat, BellRing, Sparkles } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getThreeHoursBeforeTime(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = (h || 0) * 60 + (m || 0) - 180;
  const normalized = (totalMins + 24 * 60) % (24 * 60);
  const rh = Math.floor(normalized / 60);
  const rm = normalized % 60;
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask } = useApp();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'daily' | 'weekly'>('daily');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState(() => {
    // Default to 4 hours from now rounded to next hour
    const d = new Date(Date.now() + 4 * 60 * 60 * 1000);
    return `${String(d.getHours()).padStart(2, '0')}:00`;
  });

  if (!isOpen) return null;

  // Calculate reminder time & urgency preview
  const autoReminderTime = getThreeHoursBeforeTime(dueTime);
  const deadlineDateObj = new Date(`${dueDate}T${dueTime}:00`);
  const deadlineMs = deadlineDateObj.getTime();
  const nowMs = Date.now();
  const minutesRemaining = Math.round((deadlineMs - nowMs) / 60000);
  const isDueInLessThanThreeHours = minutesRemaining <= 180;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(title.trim(), type, dueDate, dueTime);

    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Create New Task
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set deadline — automatic reminder notifies you 3 hours before
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Imako Solution: Review PR & client assets"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              required
              autoFocus
            />
          </div>

          {/* Type Toggle: Daily vs Weekly */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Recurrence Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('daily')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  type === 'daily'
                    ? 'bg-sky-500 border-sky-500 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Daily Task</span>
              </button>

              <button
                type="button"
                onClick={() => setType('weekly')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  type === 'weekly'
                    ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Weekly Task</span>
              </button>
            </div>
          </div>

          {/* Deadline Date and Deadline Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Target Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Deadline Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Automatic Reminder Info Card (No manual setting needed) */}
          <div className={`p-3 rounded-2xl border text-xs leading-relaxed transition-all ${
            isDueInLessThanThreeHours
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
              : 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/60 text-sky-900 dark:text-sky-200'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <BellRing className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isDueInLessThanThreeHours 
                  ? '⚡ Urgent: Due in < 3 Hours' 
                  : '⏰ Automatic 3-Hour Reminder'}
              </span>
            </div>
            {isDueInLessThanThreeHours ? (
              <p className="text-[11px]">
                This deadline is in <strong>{minutesRemaining <= 0 ? '0 minutes' : `${minutesRemaining} minutes`}</strong>. A browser alert will notify you <strong>immediately upon creation</strong>!
              </p>
            ) : (
              <p className="text-[11px]">
                You will receive a browser notification automatically at <strong>{autoReminderTime}</strong> (exactly 3 hours before the {dueTime} deadline).
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
