import React, { useState } from 'react';
import { Exam, Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { getCountdownInfo, calculateExamProgress, EXAM_COLOR_MAP } from '../../utils/examUtils';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  Edit2, 
  Trash2, 
  Plus, 
  Sparkles, 
  BellRing,
  AlertCircle,
  FileText
} from 'lucide-react';
import { EditTaskModal } from './EditTaskModal';

interface ExamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  onEditExam: (exam: Exam) => void;
}

export const ExamDetailsModal: React.FC<ExamDetailsModalProps> = ({
  isOpen,
  onClose,
  exam,
  onEditExam,
}) => {
  const { tasks, toggleTaskCompletion, deleteTask, deleteExam, addTask } = useApp();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingCustomStudyTask, setIsAddingCustomStudyTask] = useState(false);
  const [newStudyTitle, setNewStudyTitle] = useState('');
  const [newStudyDate, setNewStudyDate] = useState('');
  const [newStudyTime, setNewStudyTime] = useState('18:00');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !exam) return null;

  const countdown = getCountdownInfo(exam.date);
  const progress = calculateExamProgress(exam.id, tasks);
  const colorConfig = EXAM_COLOR_MAP[exam.color] || EXAM_COLOR_MAP.sky;

  // Filter study tasks linked to this exam, sorted chronologically
  const examTasks = tasks
    .filter((t) => t.examId === exam.id)
    .sort((a, b) => {
      const dateA = `${a.dueDate || ''}T${a.dueTime || '00:00'}`;
      const dateB = `${b.dueDate || ''}T${b.dueTime || '00:00'}`;
      return dateA.localeCompare(dateB);
    });

  const handleCreateCustomStudyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudyTitle.trim()) return;

    const taskDate = newStudyDate || exam.date;
    addTask(
      `${exam.subject}: ${newStudyTitle.trim()}`,
      'weekly',
      taskDate,
      newStudyTime || '18:00'
    );

    // Link newly added task to exam
    // Note: addTask prepends task to tasks list
    setIsAddingCustomStudyTask(false);
    setNewStudyTitle('');
    setNewStudyDate('');
  };

  const handleDeleteExam = () => {
    deleteExam(exam.id, true);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Header Strip */}
          <div className={`h-2.5 w-full ${colorConfig.dotBg}`} />

          {/* Top Info Bar */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5 min-w-0">
              {/* Big Countdown Number (ADHD: Numbers before text) */}
              <div
                className={`flex flex-col items-center justify-center min-w-[72px] h-[72px] px-2 rounded-2xl border text-center shrink-0 ${
                  countdown.isToday
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                    : countdown.isTomorrow
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                    : countdown.isPast
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/50'
                }`}
              >
                {countdown.isToday ? (
                  <>
                    <span className="text-lg font-black text-rose-600 dark:text-rose-400 uppercase">
                      TODAY
                    </span>
                    <span className="text-[9px] font-extrabold uppercase text-rose-700 dark:text-rose-300">
                      Exam Day
                    </span>
                  </>
                ) : countdown.isTomorrow ? (
                  <>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 uppercase">
                      TOMORROW
                    </span>
                    <span className="text-[9px] font-extrabold uppercase text-amber-700 dark:text-amber-300">
                      1d left
                    </span>
                  </>
                ) : countdown.isPast ? (
                  <>
                    <span className="text-2xl font-black font-mono text-slate-500">
                      {Math.abs(countdown.days)}
                    </span>
                    <span className="text-[9px] font-bold uppercase text-slate-400">
                      Days ago
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-black font-mono text-sky-600 dark:text-sky-400 leading-none">
                      {countdown.days}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mt-1">
                      Days Left
                    </span>
                  </>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${colorConfig.badgeBg} ${colorConfig.badgeText}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${colorConfig.dotBg}`} />
                    <span>{colorConfig.label}</span>
                  </span>

                  {countdown.isPast && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Archived / Past Exam
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                  {exam.subject}
                </h3>

                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.date}</span>
                  </span>

                  {exam.time && (
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.time}</span>
                    </span>
                  )}

                  {exam.location && (
                    <span className="inline-flex items-center gap-1 truncate max-w-[220px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{exam.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: Progress Bar & Study Schedule */}
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Progress Section */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Preparation Progress</span>
                </span>
                <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                  {progress.completed}/{progress.total} done ({progress.percentage}%)
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorConfig.progressBar}`}
                  style={{ width: `${Math.max(progress.percentage, 4)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                {progress.percentage === 100
                  ? '🎉 All preparation tasks completed! You are fully prepared.'
                  : `${progress.total - progress.completed} study tasks remaining before exam day.`}
              </p>
            </div>

            {/* Notes if present */}
            {exam.notes && (
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold">Instructions & Notes: </span>
                  <span>{exam.notes}</span>
                </div>
              </div>
            )}

            {/* Study Tasks List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Generated Study Schedule ({examTasks.length})
                </h4>

                <button
                  onClick={() => setIsAddingCustomStudyTask(!isAddingCustomStudyTask)}
                  className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Study Session</span>
                </button>
              </div>

              {/* Add Custom Study Task Input Box */}
              {isAddingCustomStudyTask && (
                <form
                  onSubmit={handleCreateCustomStudyTask}
                  className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2.5 text-xs animate-slide-up"
                >
                  <div className="font-bold text-sky-900 dark:text-sky-200">
                    Add Extra Study Session
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Practice Chapter 4 Mock Problems"
                    value={newStudyTitle}
                    onChange={(e) => setNewStudyTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={newStudyDate}
                      onChange={(e) => setNewStudyDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="time"
                      value={newStudyTime}
                      onChange={(e) => setNewStudyTime(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomStudyTask(false)}
                      className="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold"
                    >
                      Add Task
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              {examTasks.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400">
                  No study tasks scheduled yet. Tap "+ Add Study Session" above.
                </div>
              ) : (
                <div className="space-y-2">
                  {examTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`group flex items-start justify-between gap-3 p-3 rounded-2xl border transition-all ${
                        t.completed
                          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-800'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleTaskCompletion(t.id)}
                          className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                            t.completed
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-sky-500 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <h5
                            className={`text-xs font-semibold ${
                              t.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {t.title}
                          </h5>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {t.dueDate && (
                              <span className="inline-flex items-center gap-1 font-mono">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{t.dueDate}</span>
                              </span>
                            )}

                            {t.dueTime && (
                              <span className="inline-flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{t.dueTime}</span>
                              </span>
                            )}

                            {t.reminderTime && !t.completed && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded font-mono border border-sky-100 dark:border-sky-900/40">
                                <BellRing className="w-2.5 h-2.5 text-sky-500" />
                                <span>3h reminder ({t.reminderTime})</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons (Edit & Delete) */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 shrink-0">
                        <button
                          onClick={() => setEditingTask(t)}
                          className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit study task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete study task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Controls: Edit Exam & Delete Exam */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                  Delete this exam & all study tasks?
                </span>
                <button
                  onClick={handleDeleteExam}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px]"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 rounded-lg text-slate-500 text-[11px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-xl font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Exam</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEditExam(exam);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Exam</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all shadow-sm active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
      />
    </>
  );
};
