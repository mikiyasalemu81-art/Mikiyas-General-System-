import { Exam, ExamColorTag, Task } from '../types';

/**
 * Color styling definition for app palette tags
 * Matches the light blue / white primary and light red / slate secondary themes
 */
export interface ColorTagConfig {
  id: ExamColorTag;
  label: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  cardBg: string;
  dotBg: string;
  progressBar: string;
  pillSelected: string;
}

export const EXAM_COLOR_MAP: Record<ExamColorTag, ColorTagConfig> = {
  sky: {
    id: 'sky',
    label: 'Light Blue',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/80',
    badgeText: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-300 dark:border-sky-800',
    cardBg: 'bg-sky-50/70 dark:bg-sky-950/20',
    dotBg: 'bg-sky-500',
    progressBar: 'bg-sky-500',
    pillSelected: 'bg-sky-500 text-white ring-2 ring-sky-300',
  },
  rose: {
    id: 'rose',
    label: 'Light Red',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/80',
    badgeText: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-800',
    cardBg: 'bg-rose-50/70 dark:bg-rose-950/20',
    dotBg: 'bg-rose-500',
    progressBar: 'bg-rose-500',
    pillSelected: 'bg-rose-500 text-white ring-2 ring-rose-300',
  },
  amber: {
    id: 'amber',
    label: 'Amber',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
    badgeText: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    cardBg: 'bg-amber-50/70 dark:bg-amber-950/20',
    dotBg: 'bg-amber-500',
    progressBar: 'bg-amber-500',
    pillSelected: 'bg-amber-500 text-white ring-2 ring-amber-300',
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
    dotBg: 'bg-emerald-500',
    progressBar: 'bg-emerald-500',
    pillSelected: 'bg-emerald-500 text-white ring-2 ring-emerald-300',
  },
  purple: {
    id: 'purple',
    label: 'Purple',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/80',
    badgeText: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    cardBg: 'bg-purple-50/70 dark:bg-purple-950/20',
    dotBg: 'bg-purple-500',
    progressBar: 'bg-purple-500',
    pillSelected: 'bg-purple-500 text-white ring-2 ring-purple-300',
  },
  indigo: {
    id: 'indigo',
    label: 'Indigo',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/80',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-800',
    cardBg: 'bg-indigo-50/70 dark:bg-indigo-950/20',
    dotBg: 'bg-indigo-500',
    progressBar: 'bg-indigo-500',
    pillSelected: 'bg-indigo-500 text-white ring-2 ring-indigo-300',
  },
};

/**
 * Calculates calendar day difference between today and exam date
 */
export const getDaysUntilExam = (examDateStr: string): number => {
  if (!examDateStr) return 0;
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const [y, m, d] = examDateStr.split('-').map(Number);
  const examMidnight = new Date(y, (m || 1) - 1, d || 1).getTime();

  return Math.round((examMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
};

export interface CountdownInfo {
  days: number;
  label: string; // e.g. "Today", "Tomorrow", "5 days left", "3 days ago"
  badgeText: string;
  isToday: boolean;
  isTomorrow: boolean;
  isPast: boolean;
  isUrgent: boolean; // 2 days or less
}

export const getCountdownInfo = (examDateStr: string): CountdownInfo => {
  const days = getDaysUntilExam(examDateStr);
  const isToday = days === 0;
  const isTomorrow = days === 1;
  const isPast = days < 0;
  const isUrgent = days >= 0 && days <= 2;

  let label: string;
  let badgeText: string;

  if (isToday) {
    label = 'Today';
    badgeText = 'Today';
  } else if (isTomorrow) {
    label = 'Tomorrow';
    badgeText = 'Tomorrow';
  } else if (days > 1) {
    label = `${days} days left`;
    badgeText = `${days}d left`;
  } else {
    const absDays = Math.abs(days);
    label = absDays === 1 ? 'Yesterday' : `${absDays} days ago`;
    badgeText = `${absDays}d ago`;
  }

  return {
    days,
    label,
    badgeText,
    isToday,
    isTomorrow,
    isPast,
    isUrgent,
  };
};

/**
 * Calculate study task completion rate for an exam
 */
export const calculateExamProgress = (
  examId: string,
  tasks: Task[]
): { total: number; completed: number; percentage: number } => {
  const examTasks = tasks.filter((t) => t.examId === examId);
  const total = examTasks.length;
  if (total === 0) return { total: 0, completed: 0, percentage: 0 };

  const completed = examTasks.filter((t) => t.completed).length;
  const percentage = Math.round((completed / total) * 100);

  return { total, completed, percentage };
};

/**
 * Helper to calculate 3 hours before a given time string (HH:mm)
 */
export const calculateReminderTime = (dueTime: string): string => {
  const [h, m] = (dueTime || '18:00').split(':').map(Number);
  const totalMins = (h || 0) * 60 + (m || 0) - 180;
  const normalized = (totalMins + 24 * 60) % (24 * 60);
  const rh = Math.floor(normalized / 60);
  const rm = normalized % 60;
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Default high-yield ADHD study task templates
 * Structured to build confidence from overview to final review without overwhelm
 */
const DEFAULT_STUDY_TOPICS = [
  { dayOffset: 7, titleSuffix: 'Review syllabus, core formulas & key concept outlines' },
  { dayOffset: 6, titleSuffix: 'Deep dive textbook chapters & core lecture slides' },
  { dayOffset: 5, titleSuffix: 'Solve practice problem set 1 & sample questions' },
  { dayOffset: 4, titleSuffix: 'Solve practice problem set 2 & verify weak concepts' },
  { dayOffset: 3, titleSuffix: 'Active recall: Flashcards & conceptual quiz review' },
  { dayOffset: 2, titleSuffix: 'Timed mock exam run & error analysis' },
  { dayOffset: 1, titleSuffix: 'High-yield formula sheet & core summary review' },
  { dayOffset: 1, titleSuffix: 'Prep exam stationery/bag, review summary cheat-sheet & rest early', isExtra: true },
];

/**
 * Automatic preparation tasks generator:
 * Spreads study tasks across the days before the exam.
 * Default: one study task per day for the 7 days before the exam,
 * with one extra task the day before (total 8 tasks).
 */
export const generateExamStudyTasks = (
  exam: { id: string; subject: string; date: string; time?: string },
  defaultDueTime: string = '18:00'
): Task[] => {
  const tasks: Task[] = [];
  const [y, m, d] = exam.date.split('-').map(Number);
  const examDate = new Date(y, (m || 1) - 1, d || 1);
  examDate.setHours(0, 0, 0, 0);

  const daysUntil = getDaysUntilExam(exam.date);
  const targetDueTime = exam.time && exam.time < defaultDueTime ? exam.time : defaultDueTime;
  const reminderTime = calculateReminderTime(targetDueTime);

  // If exam is 7 or more days away, generate standard 7-day schedule + 1 extra task day before
  if (daysUntil >= 7) {
    DEFAULT_STUDY_TOPICS.forEach((topic, idx) => {
      const taskDate = new Date(examDate);
      taskDate.setDate(examDate.getDate() - topic.dayOffset);
      const dueDateStr = formatDateKey(taskDate);

      const deadlineMs = new Date(`${dueDateStr}T${targetDueTime}:00`).getTime();
      const autoReminderMs = deadlineMs - 3 * 60 * 60 * 1000;

      tasks.push({
        id: `study-${exam.id}-d${topic.dayOffset}-${idx}`,
        title: `${exam.subject}: ${topic.titleSuffix}`,
        type: 'weekly',
        dueDate: dueDateStr,
        dueTime: targetDueTime,
        reminderTime,
        autoReminderAt: new Date(autoReminderMs).toISOString(),
        notified: false,
        completed: false,
        createdAt: new Date().toISOString(),
        examId: exam.id,
        examSubject: exam.subject,
        isExamStudyTask: true,
      });
    });
    return tasks;
  }

  // If exam is 1 to 6 days away, adaptively spread across the available days before the exam
  if (daysUntil >= 2) {
    const availableDays = Math.max(1, daysUntil);

    // Pick top high-yield topics corresponding to available days
    const topicsToUse = [
      'Core notes & lecture review',
      'Solve key problem sets & formulas',
      'Flashcards & mock question review',
      'High-yield summary & formula memorization',
      'Final review & error analysis',
    ].slice(0, Math.min(availableDays, 5));

    topicsToUse.forEach((topicText, idx) => {
      const offset = availableDays - idx;
      if (offset >= 1) {
        const taskDate = new Date(examDate);
        taskDate.setDate(examDate.getDate() - offset);
        const dueDateStr = formatDateKey(taskDate);
        const deadlineMs = new Date(`${dueDateStr}T${targetDueTime}:00`).getTime();

        tasks.push({
          id: `study-${exam.id}-adapt-${idx}`,
          title: `${exam.subject}: ${topicText}`,
          type: 'weekly',
          dueDate: dueDateStr,
          dueTime: targetDueTime,
          reminderTime,
          autoReminderAt: new Date(deadlineMs - 3 * 60 * 60 * 1000).toISOString(),
          notified: false,
          completed: false,
          createdAt: new Date().toISOString(),
          examId: exam.id,
          examSubject: exam.subject,
          isExamStudyTask: true,
        });
      }
    });

    // Add extra task on the day before the exam
    const dayBefore = new Date(examDate);
    dayBefore.setDate(examDate.getDate() - 1);
    const dayBeforeStr = formatDateKey(dayBefore);
    const extraDeadlineMs = new Date(`${dayBeforeStr}T20:00:00`).getTime();

    tasks.push({
      id: `study-${exam.id}-extra-day-before`,
      title: `${exam.subject}: Prep exam stationery/bag, review summary cheat-sheet & rest early`,
      type: 'weekly',
      dueDate: dayBeforeStr,
      dueTime: '20:00',
      reminderTime: calculateReminderTime('20:00'),
      autoReminderAt: new Date(extraDeadlineMs - 3 * 60 * 60 * 1000).toISOString(),
      notified: false,
      completed: false,
      createdAt: new Date().toISOString(),
      examId: exam.id,
      examSubject: exam.subject,
      isExamStudyTask: true,
    });

    return tasks;
  }

  // If exam is tomorrow (1 day away)
  if (daysUntil === 1) {
    const today = new Date();
    const todayStr = formatDateKey(today);

    tasks.push({
      id: `study-${exam.id}-tomorrow-1`,
      title: `${exam.subject}: Core concepts & high-yield formula review`,
      type: 'daily',
      dueDate: todayStr,
      dueTime: '15:00',
      reminderTime: calculateReminderTime('15:00'),
      autoReminderAt: new Date(new Date(`${todayStr}T15:00:00`).getTime() - 3 * 60 * 60 * 1000).toISOString(),
      notified: false,
      completed: false,
      createdAt: new Date().toISOString(),
      examId: exam.id,
      examSubject: exam.subject,
      isExamStudyTask: true,
    });

    tasks.push({
      id: `study-${exam.id}-tomorrow-2`,
      title: `${exam.subject}: Prep exam materials & calm evening mental rest`,
      type: 'daily',
      dueDate: todayStr,
      dueTime: '20:00',
      reminderTime: calculateReminderTime('20:00'),
      autoReminderAt: new Date(new Date(`${todayStr}T20:00:00`).getTime() - 3 * 60 * 60 * 1000).toISOString(),
      notified: false,
      completed: false,
      createdAt: new Date().toISOString(),
      examId: exam.id,
      examSubject: exam.subject,
      isExamStudyTask: true,
    });

    return tasks;
  }

  // If exam is today (0 days left)
  const todayStr = formatDateKey(new Date());
  tasks.push({
    id: `study-${exam.id}-today-1`,
    title: `${exam.subject}: Quick 15-minute formula recall & calm breathing`,
    type: 'daily',
    dueDate: todayStr,
    dueTime: targetDueTime,
    reminderTime,
    notified: false,
    completed: false,
    createdAt: new Date().toISOString(),
    examId: exam.id,
    examSubject: exam.subject,
    isExamStudyTask: true,
  });

  return tasks;
};
