// Browser Notification API and ADHD focus audio chime service
import { Task } from '../types';

class NotificationService {
  private audioCtx: AudioContext | null = null;

  // Initialize Web Audio context for gentle non-jarring chime
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play a pleasant, dual-tone chime (ADHD dopamine & focus cue)
  playChime(type: 'success' | 'alert' | 'missed' | 'blocked' = 'alert') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        // High, joyful ascending tones
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.24); // G5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'missed' || type === 'blocked') {
        // Urgent descending double alert (missed deadline / blocked cue)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        // Reminder chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.15); // C#5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      console.warn('Audio chime could not be played:', e);
    }
  }

  // Check if browser notifications are supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Request user permission for notifications
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  // Display browser notification through Service Worker registration with instant timeout fallback
  async showBrowserNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
    this.playChime('alert');

    if (!this.isSupported()) {
      console.warn('Notification API not supported in this browser.');
      return false;
    }

    // Auto request permission if default
    let currentPerm = Notification.permission;
    if (currentPerm === 'default') {
      try {
        currentPerm = await Notification.requestPermission();
      } catch (err) {
        console.warn('Permission request error:', err);
      }
    }

    if (currentPerm !== 'granted') {
      console.warn('Notification permission is not granted:', currentPerm);
      return false;
    }

    // Attempt 1: Service Worker registration (critical for Android Chrome & mobile PWA)
    if ('serviceWorker' in navigator) {
      try {
        let reg = await navigator.serviceWorker.getRegistration();
        if (!reg) {
          reg = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<undefined>((r) => setTimeout(() => r(undefined), 1000))
          ]);
        }

        if (reg && reg.showNotification) {
          const swOptions: any = {
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            vibrate: [200, 100, 200],
            ...options
          };
          await reg.showNotification(title, swOptions);
          return true;
        }
      } catch (swErr) {
        console.warn('SW showNotification error, falling back to window Notification:', swErr);
      }
    }

    // Attempt 2: Direct Window Notification constructor
    try {
      const notif = new Notification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        ...options
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch (notifErr) {
      console.warn('Direct Notification constructor failed:', notifErr);
    }

    return false;
  }

  // Send an immediate test notification to verify system sounds and popups
  async sendTestNotification(): Promise<boolean> {
    const success = await this.showBrowserNotification('🔔 System for Mikiyas: Notifications Active!', {
      body: 'Task deadline reminders and alerts are active and verified on this device.',
      tag: 'test-notification',
    } as NotificationOptions);
    return success;
  }

  // Alert when an app reaches its limit (backward compatibility for shield)
  async sendAppBlockedAlert(appName: string, limitMinutes: number): Promise<boolean> {
    this.playChime('blocked');
    return await this.showBrowserNotification(`🚫 Daily Limit Reached: ${appName}`, {
      body: `You have reached your ${limitMinutes} min daily limit for ${appName}. Time to refocus!`,
      tag: `blocked-${Date.now()}`
    });
  }

  // Send a general task reminder notification
  async sendTaskReminder(taskTitle: string, taskType: string = 'task'): Promise<boolean> {
    return await this.showBrowserNotification(`⏰ Task Reminder: System for Mikiyas`, {
      body: `Time for your ${taskType}: "${taskTitle}"`,
      tag: `task-${Date.now()}`,
    });
  }

  // Send an automatic 3-hour task reminder notification
  async sendThreeHourReminder(taskTitle: string, dueTime: string): Promise<boolean> {
    return await this.showBrowserNotification(`⏰ Task Due in 3 Hours: System for Mikiyas`, {
      body: `Your task "${taskTitle}" is due at ${dueTime}! Focus on finishing it now.`,
      tag: `reminder-${Date.now()}`,
    });
  }

  // Send immediate reminder if task is due in less than 3 hours
  async sendImmediateReminder(taskTitle: string, minutesRemaining: number, dueTime: string): Promise<boolean> {
    const timeText = minutesRemaining <= 0 ? 'Due right now!' : `Due in ${minutesRemaining} minutes (at ${dueTime})!`;
    return await this.showBrowserNotification(`⚠️ Task Due Soon (< 3 Hours): ${taskTitle}`, {
      body: `This task was set with a short deadline: ${timeText}`,
      tag: `urgent-${Date.now()}`,
    });
  }

  // Send alert when a task deadline has passed and task is marked as "Not Done"
  async sendDeadlineMissedNotification(taskTitle: string, dueTime: string): Promise<boolean> {
    this.playChime('missed');
    return await this.showBrowserNotification(`🚨 Task Missed (Not Done): ${taskTitle}`, {
      body: `Deadline was ${dueTime}. This task has passed its deadline and is marked as Not Done!`,
      tag: `missed-${Date.now()}`,
    });
  }

  // Sync scheduled tasks with Service Worker for background dispatch
  syncTasksWithServiceWorker(tasks: Task[]) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const payload = tasks
      .filter(t => !t.completed)
      .map(t => {
        let autoReminderTimestamp = 0;
        let deadlineTimestamp = 0;
        if (t.dueDate && t.dueTime) {
          deadlineTimestamp = new Date(`${t.dueDate}T${t.dueTime}:00`).getTime();
          autoReminderTimestamp = deadlineTimestamp - 3 * 60 * 60 * 1000;
        }
        return {
          id: t.id,
          title: t.title,
          type: t.type,
          dueTime: t.dueTime,
          dueDate: t.dueDate,
          autoReminderTimestamp,
          deadlineTimestamp,
          swNotified: false
        };
      });

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_TASK_REMINDERS',
        tasks: payload
      });
    }
  }
}

export const notificationService = new NotificationService();
