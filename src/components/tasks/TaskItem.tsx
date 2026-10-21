import React from 'react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { Check, Clock, Calendar, Trash2, Repeat, CheckCircle2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTaskCompletion, deleteTask } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;

  return (
    <div
      className={`group flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
        task.completed
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-70'
          : isOverdue
          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-800 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* Interactive Checkbox */}
        <button
          type="button"
          onClick={() => toggleTaskCompletion(task.id)}
          className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-sky-500 bg-white dark:bg-slate-800'
          }`}
          aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="min-w-0">
          <h4
            className={`text-sm font-semibold tracking-tight ${
              task.completed
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {task.title}
          </h4>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
            {/* Type badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                task.type === 'daily'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
              }`}
            >
              <Repeat className="w-2.5 h-2.5" />
              {task.type}
            </span>

            {/* Reminder Time */}
            {task.reminderTime && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" />
                {task.reminderTime}
              </span>
            )}

            {/* Due date / Overdue flag */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] ${
                  isOverdue
                    ? 'font-bold text-rose-600 dark:text-rose-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {task.dueDate === todayStr ? 'Today' : task.dueDate}
                {isOverdue && ' (Overdue)'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Action */}
      <button
        onClick={() => deleteTask(task.id)}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
        title="Delete task"
        aria-label="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
