import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Clock, Calendar, CheckSquare, Repeat } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, addBanner } = useApp();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'daily' | 'weekly'>('daily');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(title.trim(), type, reminderTime, dueDate);
    addBanner({
      type: 'info',
      title: 'Task Added',
      message: `"${title.trim()}" set for ${reminderTime}`,
    });

    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
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
              Set title, cycle, and notification alert time
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

          {/* Reminder Time and Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Reminder Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

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
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
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
