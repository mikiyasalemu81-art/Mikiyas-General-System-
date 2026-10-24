import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { TaskListView } from './TaskListView';
import { TaskCalendarView } from './TaskCalendarView';
import { AddTaskModal } from './AddTaskModal';
import { notificationService } from '../../services/notifications';
import { isTaskOverdue } from '../../utils/taskUtils';
import { 
  CheckSquare, 
  Calendar, 
  List, 
  Plus, 
  Bell, 
  BellRing, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const TasksTab: React.FC = () => {
  const { tasks, resetDailyTasksManual, addBanner } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => 
    notificationService.getPermission()
  );

  const todayStr = new Date().toISOString().split('T')[0];

  // Overview metrics using precise timestamp comparison
  const todayTasks = tasks.filter(t => t.type === 'daily' || t.dueDate === todayStr);
  const completedToday = todayTasks.filter(t => t.completed).length;
  const overdueTasks = tasks.filter(t => isTaskOverdue(t));

  const totalWeekly = tasks.length;
  const totalCompleted = tasks.filter(t => t.completed).length;
  const weeklyProgressPercent = totalWeekly > 0 ? Math.round((totalCompleted / totalWeekly) * 100) : 0;

  const handleRequestNotifications = async () => {
    const perm = await notificationService.requestPermission();
    setPermissionStatus(perm);
    if (perm === 'granted') {
      notificationService.playChime('success');
      notificationService.sendTaskReminder('Notification system connected!', 'Test');
      addBanner({
        type: 'reminder',
        title: 'Notifications Enabled',
        message: 'Task reminder alarms are now active in this browser.',
      });
    }
  };

  const handleTestNotification = async () => {
    notificationService.playChime('alert');
    const success = await notificationService.sendTestNotification();
    if (success) {
      addBanner({
        type: 'reminder',
        title: 'Test Notification Dispatched',
        message: 'Notification was sent! Check your device notification center.',
      });
    } else {
      addBanner({
        type: 'info',
        title: 'Notification Alert',
        message: 'Browser notification blocked or permission needed.',
      });
    }
  };

  const handleTestChime = () => {
    notificationService.playChime('alert');
    addBanner({
      type: 'reminder',
      title: 'Sound Test',
      message: 'ADHD focus chime played successfully.',
    });
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* 1. TOP OVERVIEW METRICS */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Task Execution & Reminders
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear visual progress, deadlines, and automated alarms
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="Today's Tasks"
            value={todayTasks.length}
            subtext="Due or daily routine"
            colorTheme="blue"
            icon={<CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
          />

          <MetricCard
            label="Completed"
            value={`${completedToday}/${todayTasks.length}`}
            subtext="Finished today"
            colorTheme="green"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          />

          <MetricCard
            label="Not Done / Overdue"
            value={overdueTasks.length}
            subtext={overdueTasks.length > 0 ? `${overdueTasks.length} missed deadlines` : 'All on schedule'}
            colorTheme={overdueTasks.length > 0 ? 'red' : 'slate'}
            trend={overdueTasks.length > 0 ? 'danger' : 'neutral'}
            icon={<AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
          />

          <MetricCard
            label="Week Progress"
            value={`${weeklyProgressPercent}%`}
            subtext="Overall completion"
            colorTheme="amber"
            icon={<Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          />
        </div>
      </section>

      {/* 2. NOTIFICATIONS STATUS & TEST CONTROL */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            permissionStatus === 'granted' 
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400' 
              : 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
          }`}>
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Task Reminder & Sound System
              </h4>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                permissionStatus === 'granted'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {permissionStatus === 'granted' ? 'Active' : 'Permission Needed'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              3h advance alarms + automatic alert when a deadline is missed (Not Done).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
          {permissionStatus !== 'granted' ? (
            <button
              onClick={handleRequestNotifications}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-sm transition-all active:scale-95"
            >
              Enable Notifications
            </button>
          ) : (
            <button
              onClick={handleTestNotification}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800 transition-all active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Test Notification (Send Now)</span>
            </button>
          )}
          <button
            onClick={handleTestChime}
            className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
          >
            Test Sound
          </button>
        </div>
      </div>

      {/* 3. VIEW TOGGLE (LIST VS CALENDAR) & RESET CONTROL */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {/* List vs Calendar Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar View</span>
            </button>
          </div>

          {/* Scheduled Reset / Manual Reset Trigger */}
          <button
            onClick={() => {
              resetDailyTasksManual();
              addBanner({
                type: 'info',
                title: 'Daily Cycle Reset',
                message: 'All daily tasks have been uncompleted for today.',
              });
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Auto-resets at midnight. Tap to manually reset today's cycle."
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Daily Cycle</span>
          </button>
        </div>

        {/* View Component */}
        {viewMode === 'list' ? (
          <TaskListView tasks={tasks} />
        ) : (
          <TaskCalendarView tasks={tasks} />
        )}
      </section>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
