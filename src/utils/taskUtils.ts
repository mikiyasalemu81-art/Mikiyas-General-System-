import { Task } from '../types';

/**
 * Check if a task's deadline (date + time) has passed and it is not completed
 */
export function isTaskOverdue(task: Task): boolean {
  if (task.completed) return false;
  if (!task.dueDate) return false;

  const timeStr = task.dueTime || '23:59';
  const deadline = new Date(`${task.dueDate}T${timeStr}:00`);

  if (isNaN(deadline.getTime())) {
    const todayStr = new Date().toISOString().split('T')[0];
    return task.dueDate < todayStr;
  }

  return Date.now() > deadline.getTime();
}

/**
 * Calculate formatted relative time remaining or elapsed for a deadline
 */
export function getDeadlineTimeInfo(task: Task): { isOverdue: boolean; text: string; minutesDiff: number } {
  if (!task.dueDate) return { isOverdue: false, text: '', minutesDiff: 0 };

  const timeStr = task.dueTime || '23:59';
  const deadline = new Date(`${task.dueDate}T${timeStr}:00`);
  if (isNaN(deadline.getTime())) {
    return { isOverdue: false, text: task.dueDate, minutesDiff: 0 };
  }

  const diffMs = deadline.getTime() - Date.now();
  const minutesDiff = Math.round(diffMs / (60 * 1000));

  if (minutesDiff < 0) {
    const absMin = Math.abs(minutesDiff);
    if (absMin < 60) return { isOverdue: true, text: `${absMin}m ago`, minutesDiff };
    const hours = Math.floor(absMin / 60);
    if (hours < 24) return { isOverdue: true, text: `${hours}h ago`, minutesDiff };
    const days = Math.floor(hours / 24);
    return { isOverdue: true, text: `${days}d ago`, minutesDiff };
  } else {
    if (minutesDiff < 60) return { isOverdue: false, text: `${minutesDiff}m remaining`, minutesDiff };
    const hours = Math.floor(minutesDiff / 60);
    if (hours < 24) return { isOverdue: false, text: `${hours}h remaining`, minutesDiff };
    const days = Math.floor(hours / 24);
    return { isOverdue: false, text: `${days}d remaining`, minutesDiff };
  }
}

/**
 * Automatically calculate 3 hours before a given HH:mm time
 */
export function calculateThreeHoursBefore(dueTime: string): string {
  if (!dueTime) return '09:00';
  const [h, m] = dueTime.split(':').map(Number);
  const totalMins = (h || 0) * 60 + (m || 0) - 180;
  const normalized = (totalMins + 24 * 60) % (24 * 60);
  const rh = Math.floor(normalized / 60);
  const rm = normalized % 60;
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
}
