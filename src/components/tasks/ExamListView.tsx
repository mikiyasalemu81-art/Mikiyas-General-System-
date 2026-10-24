import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam } from '../../types';
import { getCountdownInfo, calculateExamProgress, EXAM_COLOR_MAP } from '../../utils/examUtils';
import { AddExamModal } from './AddExamModal';
import { ExamDetailsModal } from './ExamDetailsModal';
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Archive, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Check,
  CheckCircle2,
  Trash2,
  Edit2
} from 'lucide-react';

interface ExamListViewProps {
  onOpenCalendar?: () => void;
}

export const ExamListView: React.FC<ExamListViewProps> = ({ onOpenCalendar }) => {
  const { exams, tasks, toggleTaskCompletion } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExamForDetails, setSelectedExamForDetails] = useState<Exam | null>(null);
  const [examToEdit, setExamToEdit] = useState<Exam | null>(null);
  const [isArchiveExpanded, setIsArchiveExpanded] = useState(false);
  const [expandedExamTasks, setExpandedExamTasks] = useState<Record<string, boolean>>({});

  const todayStr = new Date().toISOString().split('T')[0];

  // Separate upcoming vs past/archived exams
  const upcomingExams = exams
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const archivedExams = exams
    .filter((e) => e.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date));

  const toggleExamTasksExpanded = (examId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedExamTasks((prev) => ({
      ...prev,
      [examId]: !prev[examId],
    }));
  };

  // 1. EMPTY STATE (when zero exams exist in app)
  if (exams.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 shadow-sm animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-md shadow-sky-500/10">
          <GraduationCap className="w-8 h-8" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          No exams scheduled yet
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
          Schedule your upcoming exams here. System for Mikiyas will automatically create an ADHD-friendly 7-day preparation schedule with 3-hour reminder alarms.
        </p>

        <button
          onClick={() => {
            setExamToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add first exam</span>
        </button>

        <AddExamModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          examToEdit={null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Header with Action */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Upcoming Exams</span>
            <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              {upcomingExams.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calm countdowns, preparation progress, and automated alarms
          </p>
        </div>

        <button
          onClick={() => {
            setExamToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam</span>
        </button>
      </div>

      {/* UPCOMING EXAMS LIST */}
      {upcomingExams.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            All caught up! No upcoming exams right now.
          </p>
          <p className="text-slate-400 mt-1">
            Check the Archive below for past exam records, or tap "+ Add Exam" above to schedule a new one.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingExams.map((exam) => {
            const countdown = getCountdownInfo(exam.date);
            const progress = calculateExamProgress(exam.id, tasks);
            const colorConfig = EXAM_COLOR_MAP[exam.color] || EXAM_COLOR_MAP.sky;
            const isTasksExpanded = !!expandedExamTasks[exam.id];

            const examStudyTasks = tasks
              .filter((t) => t.examId === exam.id)
              .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

            return (
              <div
                key={exam.id}
                className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-800 shadow-sm transition-all relative overflow-hidden"
              >
                {/* Accent Color Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${colorConfig.dotBg}`} />

                {/* Main Card Grid */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Countdown & Info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Big Countdown Number (ADHD: Numbers before long text) */}
                    <div
                      onClick={() => setSelectedExamForDetails(exam)}
                      className={`cursor-pointer flex flex-col items-center justify-center min-w-[76px] sm:min-w-[84px] h-[76px] sm:h-[84px] px-2 rounded-2xl border text-center shrink-0 transition-transform hover:scale-105 ${
                        countdown.isToday
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                          : countdown.isTomorrow
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                          : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/50'
                      }`}
                    >
                      {countdown.isToday ? (
                        <>
                          <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 uppercase">
                            TODAY
                          </span>
                          <span className="text-[10px] font-extrabold uppercase text-rose-700/80 dark:text-rose-300">
                            Exam Day
                          </span>
                        </>
                      ) : countdown.isTomorrow ? (
                        <>
                          <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 uppercase">
                            TOMORROW
                          </span>
                          <span className="text-[10px] font-extrabold uppercase text-amber-700/80 dark:text-amber-300">
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

                    {/* Subject Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${colorConfig.badgeBg} ${colorConfig.badgeText}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${colorConfig.dotBg}`} />
                          <span>{colorConfig.label}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>{exam.date}</span>
                        </span>

                        {exam.time && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{exam.time}</span>
                          </span>
                        )}
                      </div>

                      <h4
                        onClick={() => setSelectedExamForDetails(exam)}
                        className="cursor-pointer text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                      >
                        {exam.subject}
                      </h4>

                      {exam.location && (
                        <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{exam.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Progress Bar & Toggle Schedule */}
                  <div className="w-full sm:w-60 md:w-64 shrink-0 flex flex-col justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Progress</span>
                      </span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        {progress.completed}/{progress.total} done ({progress.percentage}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorConfig.progressBar}`}
                        style={{ width: `${Math.max(progress.percentage, 4)}%` }}
                      />
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between mt-2.5 text-xs">
                      <button
                        onClick={(e) => toggleExamTasksExpanded(exam.id, e)}
                        className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 hover:underline text-[11px]"
                      >
                        <span>{isTasksExpanded ? 'Hide study tasks' : `Study plan (${examStudyTasks.length})`}</span>
                        {isTasksExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => setSelectedExamForDetails(exam)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-[11px] text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Quick Study Tasks Checklist */}
                {isTasksExpanded && (
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-slide-up">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      <span>PREPARATION TASKS (Spread before exam)</span>
                      <span>{progress.completed} of {progress.total} completed</span>
                    </div>

                    {examStudyTasks.length === 0 ? (
                      <p className="text-xs text-slate-400">No study tasks generated.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {examStudyTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-center justify-between gap-2.5 p-2 rounded-xl text-xs transition-all ${
                              task.completed
                                ? 'bg-slate-50/70 dark:bg-slate-800/40 opacity-70'
                                : 'bg-slate-50 dark:bg-slate-800/70 hover:bg-sky-50 dark:hover:bg-sky-950/40'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => toggleTaskCompletion(task.id)}
                                className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ${
                                  task.completed
                                    ? 'bg-emerald-500 text-white'
                                    : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                }`}
                              >
                                {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>

                              <span
                                className={`truncate font-medium ${
                                  task.completed
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>

                            <span className="shrink-0 font-mono text-[10px] text-slate-400">
                              {task.dueDate} {task.dueTime ? `• ${task.dueTime}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ARCHIVE SECTION (Requirement 7: Past exams move into an "Archive" section after their date, and stay readable there) */}
      {archivedExams.length > 0 && (
        <section className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsArchiveExpanded(!isArchiveExpanded)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Archive (Past Exams)
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {archivedExams.length}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>{isArchiveExpanded ? 'Hide past exams' : 'View past exams'}</span>
              {isArchiveExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isArchiveExpanded && (
            <div className="mt-3 space-y-3 animate-fade-in">
              {archivedExams.map((exam) => {
                const countdown = getCountdownInfo(exam.date);
                const progress = calculateExamProgress(exam.id, tasks);
                const colorConfig = EXAM_COLOR_MAP[exam.color] || EXAM_COLOR_MAP.sky;

                return (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExamForDetails(exam)}
                    className="cursor-pointer p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-80 hover:opacity-100 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Days ago pill */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono font-bold text-xs shrink-0 text-center">
                          {countdown.label}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`w-2 h-2 rounded-full ${colorConfig.dotBg}`}
                              title={colorConfig.label}
                            />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                              {exam.subject}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>Exam Date: {exam.date}</span>
                            {exam.location && <span>• {exam.location}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right stats */}
                      <div className="flex items-center gap-3 self-end sm:self-auto text-xs shrink-0">
                        <span className="font-mono text-slate-500 text-[11px]">
                          Prep Score: {progress.completed}/{progress.total} ({progress.percentage}%)
                        </span>
                        <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                          View Log →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Add / Edit Exam Modal */}
      <AddExamModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setExamToEdit(null);
        }}
        examToEdit={examToEdit}
      />

      {/* Exam Details Modal */}
      <ExamDetailsModal
        isOpen={!!selectedExamForDetails}
        exam={selectedExamForDetails}
        onClose={() => setSelectedExamForDetails(null)}
        onEditExam={(ex) => {
          setExamToEdit(ex);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
};
