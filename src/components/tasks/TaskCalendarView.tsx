import React, { useState } from 'react';
import { Task } from '../../types';
import { TaskItem } from './TaskItem';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

interface TaskCalendarViewProps {
  tasks: Task[];
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar grid
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Helper to format date YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Get tasks that apply to a specific date string
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter((t) => {
      // Daily tasks apply to today or any active day
      if (t.type === 'daily') return true;
      // Weekly / specific due date tasks
      return t.dueDate === dateStr;
    });
  };

  const selectedDayTasks = getTasksForDate(selectedDateStr);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-sky-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Days Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4">
        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-[11px] font-bold text-slate-400 uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl opacity-20" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayDateStr = formatDateStr(year, month, dayNum);
            const isSelected = selectedDateStr === dayDateStr;
            const isToday = todayStr === dayDateStr;
            const dayTasks = getTasksForDate(dayDateStr);
            const hasCompleted = dayTasks.some((t) => t.completed);
            const hasPending = dayTasks.some((t) => !t.completed);

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDateStr(dayDateStr)}
                className={`h-11 sm:h-13 p-1 rounded-xl flex flex-col items-center justify-between border transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 font-black'
                    : isToday
                    ? 'border-sky-300 dark:border-sky-800 bg-slate-50 dark:bg-slate-800/40 font-bold'
                    : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span
                  className={`text-xs ${
                    isSelected
                      ? 'text-sky-600 dark:text-sky-400'
                      : isToday
                      ? 'text-sky-600 dark:text-sky-400'
                      : ''
                  }`}
                >
                  {dayNum}
                </span>

                {/* Task Indicators Dots */}
                <div className="flex items-center gap-0.5 pb-0.5">
                  {hasPending && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  )}
                  {hasCompleted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Task Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tasks for {selectedDateStr === todayStr ? 'Today' : selectedDateStr} ({selectedDayTasks.length})
          </h4>
        </div>

        {selectedDayTasks.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No specific tasks scheduled for this day.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
