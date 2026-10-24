import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, ExamColorTag } from '../../types';
import { EXAM_COLOR_MAP, generateExamStudyTasks } from '../../utils/examUtils';
import { X, Calendar, Clock, MapPin, Tag, GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  examToEdit?: Exam | null;
}

export const AddExamModal: React.FC<AddExamModalProps> = ({
  isOpen,
  onClose,
  examToEdit,
}) => {
  const { addExam, updateExam } = useApp();

  // Helper for default date (e.g., 7 days from now)
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [subject, setSubject] = useState(examToEdit ? examToEdit.subject : '');
  const [date, setDate] = useState(examToEdit ? examToEdit.date : getDefaultDate());
  const [time, setTime] = useState(examToEdit?.time || '09:00');
  const [location, setLocation] = useState(examToEdit?.location || '');
  const [color, setColor] = useState<ExamColorTag>(examToEdit?.color || 'sky');
  const [notes, setNotes] = useState(examToEdit?.notes || '');
  const [showSchedulePreview, setShowSchedulePreview] = useState(false);

  // Synchronize if examToEdit changes
  React.useEffect(() => {
    if (examToEdit) {
      setSubject(examToEdit.subject);
      setDate(examToEdit.date);
      setTime(examToEdit.time || '09:00');
      setLocation(examToEdit.location || '');
      setColor(examToEdit.color);
      setNotes(examToEdit.notes || '');
    } else {
      setSubject('');
      setDate(getDefaultDate());
      setTime('09:00');
      setLocation('');
      setColor('sky');
      setNotes('');
    }
    setShowSchedulePreview(false);
  }, [examToEdit, isOpen]);

  if (!isOpen) return null;

  // Generate preview of study schedule for the user
  const previewTasks = subject.trim() && date
    ? generateExamStudyTasks({
        id: 'preview',
        subject: subject.trim(),
        date,
        time: time || undefined,
      })
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !date) return;

    if (examToEdit) {
      updateExam(examToEdit.id, {
        subject: subject.trim(),
        date,
        time: time || undefined,
        location: location.trim() || undefined,
        color,
        notes: notes.trim() || undefined,
      });
    } else {
      addExam({
        subject: subject.trim(),
        date,
        time: time || undefined,
        location: location.trim() || undefined,
        color,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const colorOptions: ExamColorTag[] = ['sky', 'rose', 'amber', 'emerald', 'purple', 'indigo'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {examToEdit ? 'Edit Exam' : 'Schedule New Exam'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {examToEdit
                  ? 'Update exam date, time, and details'
                  : 'Automatic preparation study schedule will be generated'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Subject Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Subject / Course Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Operating Systems & Networking"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              autoFocus
            />
          </div>

          {/* Date and Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>Exam Date *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>Exam Time (Optional)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              <span>Location (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Hall 4B, Science Center / Online Zoom"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Color Tag Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-sky-500" />
              <span>Color Tag (Palette)</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {colorOptions.map((c) => {
                const conf = EXAM_COLOR_MAP[c];
                const isSelected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? `${conf.border} ${conf.cardBg} ring-2 ring-sky-500 font-black shadow-sm`
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${conf.dotBg}`} />
                    <span className="text-[11px] truncate">{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Exam Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Bring scientific calculator, open book summary allowed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          {/* Automatic Preparation Tasks Schedule Info / Preview */}
          {!examToEdit && (
            <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    Automatic ADHD Study Schedule
                  </span>
                </div>
                {previewTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSchedulePreview(!showSchedulePreview)}
                    className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    {showSchedulePreview ? 'Hide Preview' : `Preview (${previewTasks.length} tasks)`}
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Generates 1 study task per day for 7 days before the exam, plus an extra task the day before.
                Each study task automatically receives a 3-hour advance reminder alarm. You can edit or delete any task.
              </p>

              {/* Collapsible Preview List */}
              {showSchedulePreview && previewTasks.length > 0 && (
                <div className="mt-3 space-y-1.5 pt-2 border-t border-sky-200/60 dark:border-sky-900/40 max-h-48 overflow-y-auto">
                  {previewTasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {t.title}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-slate-500">
                        {t.dueDate}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all"
            >
              {examToEdit ? 'Save Changes' : 'Schedule Exam & Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
