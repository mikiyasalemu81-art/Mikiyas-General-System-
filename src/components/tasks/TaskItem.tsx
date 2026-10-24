import React from 'react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { isTaskOverdue, getDeadlineTimeInfo } from '../../utils/taskUtils';
import { Check, Clock, Calendar, Trash2, Repeat, BellRing, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTaskCompletion, deleteTask } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = isTaskOverdue(task);
  const timeInfo = getDeadlineTimeInfo(task);

  return (
    <div
      className={`group flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
        task.completed
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
          : isOverdue
          ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-400 dark:border-rose-800 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-800 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Interactive Checkbox */}
        <button
          type="button"
          onClick={() => toggleTaskCompletion(task.id)}
          className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center transition-all shrink-0 ${
            task.completed
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : isOverdue
              ? 'border-2 border-rose-400 dark:border-rose-600 bg-white dark:bg-slate-800 hover:border-rose-500'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-sky-500 bg-white dark:bg-slate-800'
          }`}
          aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
          title={task.completed ? 'Completed' : isOverdue ? 'Overdue - click to mark done' : 'Mark complete'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-sm font-semibold tracking-tight ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : isOverdue
                  ? 'text-rose-900 dark:text-rose-100 font-bold'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {task.title}
            </h4>

            {/* Overdue / Not Done Badge */}
            {isOverdue && !task.completed && (
              <span className="inline-flex items-center gap-1 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-sm animate-pulse">
                <AlertCircle className="w-3 h-3" />
                <span>Not Done • Missed ({timeInfo.text})</span>
              </span>
            )}

            {/* Completed Badge */}
            {task.completed && (
              <span className="inline-flex items-center gap-1 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Done</span>
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            {/* Recurrence Type badge */}
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

            {/* Deadline Time */}
            {(task.dueTime || task.reminderTime) && (
              <span
                className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  isOverdue
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Clock className={`w-3 h-3 ${isOverdue ? 'text-rose-600' : 'text-sky-500'}`} />
                <span>Due: {task.dueTime || task.reminderTime}</span>
              </span>
            )}

            {/* Target Date */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  isOverdue
                    ? 'text-rose-700 dark:text-rose-300 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {task.dueDate === todayStr ? 'Today' : task.dueDate}
              </span>
            )}

            {/* Auto 3-Hour Reminder Badge */}
            {task.reminderTime && !task.completed && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-900/40">
                <BellRing className="w-2.5 h-2.5 text-sky-500" />
                <span>3h Alert: {task.reminderTime}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Action */}
      <button
        onClick={() => deleteTask(task.id)}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
        title="Delete task"
        aria-label="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
