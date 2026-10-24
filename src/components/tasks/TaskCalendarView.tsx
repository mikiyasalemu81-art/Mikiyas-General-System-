import React, { useState } from 'react';
import { Task, Exam } from '../../types';
import { TaskItem } from './TaskItem';
import { isTaskOverdue } from '../../utils/taskUtils';
import { EXAM_COLOR_MAP, getCountdownInfo, calculateExamProgress } from '../../utils/examUtils';
import { ExamDetailsModal } from './ExamDetailsModal';
import { AddExamModal } from './AddExamModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  GraduationCap, 
  Clock, 
  MapPin, 
  ChevronRight as ChevronRightIcon 
} from 'lucide-react';

interface TaskCalendarViewProps {
  tasks: Task[];
  exams?: Exam[];
  onSelectExam?: (exam: Exam) => void;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  exams = [],
  onSelectExam,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeExamModal, setActiveExamModal] = useState<Exam | null>(null);
  const [examToEdit, setExamToEdit] = useState<Exam | null>(null);

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
      if (t.type === 'daily') return true;
      return t.dueDate === dateStr;
    });
  };

  // Get exams on a specific date string
  const getExamsForDate = (dateStr: string) => {
    return exams.filter((e) => e.date === dateStr);
  };

  const selectedDayTasks = getTasksForDate(selectedDateStr);
  const selectedDayExams = getExamsForDate(selectedDateStr);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleExamClick = (exam: Exam, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSelectExam) {
      onSelectExam(exam);
    } else {
      setActiveExamModal(exam);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm">
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
            <div key={`empty-${i}`} className="h-12 sm:h-14 rounded-xl opacity-20" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayDateStr = formatDateStr(year, month, dayNum);
            const isSelected = selectedDateStr === dayDateStr;
            const isToday = todayStr === dayDateStr;
            const dayTasks = getTasksForDate(dayDateStr);
            const dayExams = getExamsForDate(dayDateStr);

            const hasOverdue = dayTasks.some((t) => isTaskOverdue(t));
            const hasCompleted = dayTasks.some((t) => t.completed);
            const hasPending = dayTasks.some((t) => !t.completed && !isTaskOverdue(t));
            const hasExam = dayExams.length > 0;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDateStr(dayDateStr)}
                className={`relative h-12 sm:h-14 p-1 rounded-xl flex flex-col items-center justify-between border transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 font-black shadow-sm'
                    : isToday
                    ? 'border-sky-300 dark:border-sky-800 bg-slate-50 dark:bg-slate-800/40 font-bold'
                    : hasExam
                    ? 'border-sky-200 dark:border-sky-900 bg-sky-50/30 dark:bg-sky-950/20 text-slate-900 dark:text-white font-bold'
                    : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                {/* Day Number */}
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

                {/* Exam Indicator Pill / Tag on Calendar Grid */}
                {hasExam && (
                  <div className="w-full px-0.5 my-auto">
                    {dayExams.slice(0, 1).map((ex) => {
                      const conf = EXAM_COLOR_MAP[ex.color] || EXAM_COLOR_MAP.sky;
                      return (
                        <div
                          key={ex.id}
                          onClick={(e) => handleExamClick(ex, e)}
                          className={`w-full py-0.5 px-1 rounded text-[9px] font-black uppercase flex items-center justify-center gap-1 shadow-sm ${conf.badgeBg} ${conf.badgeText} truncate`}
                          title={`Exam: ${ex.subject}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${conf.dotBg} shrink-0`} />
                          <span className="hidden sm:inline truncate">{ex.subject.split(' ')[0]}</span>
                          <span className="sm:hidden">🎓</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Task Indicators Dots */}
                <div className="flex items-center gap-0.5 pb-0.5">
                  {hasOverdue && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Missed / Overdue task" />
                  )}
                  {hasPending && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" title="Pending task" />
                  )}
                  {hasCompleted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Completed task" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Breakdown */}
      <div className="space-y-3">
        {/* EXAMS ON SELECTED DAY (Feature 2: Tapping one opens its details) */}
        {selectedDayExams.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
              <GraduationCap className="w-3.5 h-3.5 text-sky-500" />
              <span>Exams Scheduled for this Date ({selectedDayExams.length})</span>
            </h4>

            {selectedDayExams.map((exam) => {
              const countdown = getCountdownInfo(exam.date);
              const progress = calculateExamProgress(exam.id, tasks);
              const colorConfig = EXAM_COLOR_MAP[exam.color] || EXAM_COLOR_MAP.sky;

              return (
                <div
                  key={exam.id}
                  onClick={() => handleExamClick(exam)}
                  className="cursor-pointer p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-700 shadow-sm transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${colorConfig.dotBg}`} />

                  <div className="flex items-center justify-between gap-3 pl-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${colorConfig.badgeBg} ${colorConfig.badgeText}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${colorConfig.dotBg}`} />
                          <span>{colorConfig.label}</span>
                        </span>

                        <span className="font-mono text-[10px] font-bold text-slate-500">
                          {countdown.label}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {exam.subject}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {exam.time && (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{exam.time}</span>
                          </span>
                        )}
                        {exam.location && (
                          <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{exam.location}</span>
                          </span>
                        )}
                        <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
                          Prep: {progress.percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 shrink-0">
                      <span>View Details</span>
                      <ChevronRightIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TASKS FOR SELECTED DATE */}
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

      {/* Exam Details Modal (Triggered by tapping exam on calendar) */}
      <ExamDetailsModal
        isOpen={!!activeExamModal}
        exam={activeExamModal}
        onClose={() => setActiveExamModal(null)}
        onEditExam={(ex) => {
          setActiveExamModal(null);
          setExamToEdit(ex);
        }}
      />

      {/* Edit Exam Modal */}
      <AddExamModal
        isOpen={!!examToEdit}
        examToEdit={examToEdit}
        onClose={() => setExamToEdit(null)}
      />
    </div>
  );
};
