import React from 'react';
import { Exam, Task } from '../../types';
import { getCountdownInfo, calculateExamProgress, EXAM_COLOR_MAP } from '../../utils/examUtils';
import { Calendar, Clock, MapPin, GraduationCap, ChevronRight, Plus, Sparkles } from 'lucide-react';

interface NextExamOverviewCardProps {
  exams: Exam[];
  tasks: Task[];
  onViewExams: () => void;
  onAddExam: () => void;
  onSelectExam?: (exam: Exam) => void;
}

export const NextExamOverviewCard: React.FC<NextExamOverviewCardProps> = ({
  exams,
  tasks,
  onViewExams,
  onAddExam,
  onSelectExam,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Find the closest upcoming exam (today or future)
  const upcomingExams = exams
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const nextExam = upcomingExams[0];

  // If no upcoming exams exist, show an encouraging, uncluttered prompt
  if (!nextExam) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/70 to-indigo-50/50 dark:from-slate-900 dark:to-slate-900/80 border border-sky-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Exam Calendar</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                All Clear
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              No upcoming exams scheduled. Add an exam to automatically generate an ADHD-friendly study plan.
            </p>
          </div>
        </div>

        <button
          onClick={onAddExam}
          className="flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Exam</span>
        </button>
      </div>
    );
  }

  const countdown = getCountdownInfo(nextExam.date);
  const progress = calculateExamProgress(nextExam.id, tasks);
  const colorConfig = EXAM_COLOR_MAP[nextExam.color] || EXAM_COLOR_MAP.sky;

  return (
    <div
      onClick={() => (onSelectExam ? onSelectExam(nextExam) : onViewExams())}
      className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-800/80 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
    >
      {/* Top Accent Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colorConfig.dotBg}`} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Countdown Metric Block + Exam Info */}
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {/* Big Number Countdown Block (ADHD: Numbers Before Long Text) */}
          <div
            className={`flex flex-col items-center justify-center min-w-[76px] sm:min-w-[84px] h-[76px] sm:h-[84px] px-2 rounded-2xl border text-center shrink-0 transition-transform group-hover:scale-105 ${
              countdown.isToday
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60'
                : countdown.isTomorrow
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60'
                : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/50'
            }`}
          >
            {countdown.isToday ? (
              <>
                <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">
                  TODAY
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700/80 dark:text-rose-300">
                  Exam Day
                </span>
              </>
            ) : countdown.isTomorrow ? (
              <>
                <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 uppercase tracking-tight">
                  TOMORROW
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700/80 dark:text-amber-300">
                  1 Day Left
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-sky-600 dark:text-sky-400 leading-none">
                  {countdown.days}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                  Days Left
                </span>
              </>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <GraduationCap className="w-3 h-3 text-sky-500" />
                <span>Next Upcoming Exam</span>
              </span>

              <span
                className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${colorConfig.badgeBg} ${colorConfig.badgeText}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${colorConfig.dotBg}`} />
                <span>{colorConfig.label}</span>
              </span>

              {upcomingExams.length > 1 && (
                <span className="text-[10px] font-bold text-slate-400">
                  +{upcomingExams.length - 1} more
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              {nextExam.subject}
            </h3>

            {/* Date, Time, Location Pills */}
            <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{nextExam.date}</span>
              </span>

              {nextExam.time && (
                <span className="inline-flex items-center gap-1 font-mono font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{nextExam.time}</span>
                </span>
              )}

              {nextExam.location && (
                <span className="inline-flex items-center gap-1 font-medium truncate max-w-[200px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{nextExam.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Progress Bar & Action */}
        <div className="w-full md:w-60 lg:w-72 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Study Prep Progress</span>
            </span>
            <span className="font-mono font-black text-slate-900 dark:text-white">
              {progress.percentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorConfig.progressBar}`}
              style={{ width: `${Math.max(progress.percentage, 4)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {progress.completed} of {progress.total} study tasks done
            </span>

            <span className="inline-flex items-center gap-0.5 font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
              <span>View Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
