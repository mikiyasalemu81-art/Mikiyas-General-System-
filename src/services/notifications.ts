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
  playChime(type: 'success' | 'alert' | 'blocked' = 'alert') {
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
      } else if (type === 'blocked') {
        // Calming warning buzz (not harsh)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
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

  // Display browser notification through Service Worker registration when possible
  async showBrowserNotification(title: string, options: NotificationOptions) {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    // Prefer service worker registration so it functions even when tab is backgrounded/closed
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            ...options
          });
          return;
        }
      } catch (err) {
        console.warn('ServiceWorker showNotification failed, using fallback:', err);
      }
    }

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
    } catch (e) {
      console.warn('Notification constructor error:', e);
    }
  }

  // Send a general task reminder notification
  sendTaskReminder(taskTitle: string, taskType: string = 'task') {
    this.playChime('alert');
    this.showBrowserNotification(`⏰ Task Reminder: System for Mikiyas`, {
      body: `Time for your ${taskType}: "${taskTitle}"`,
      tag: `task-${Date.now()}`,
    });
  }

  // Send an automatic 3-hour task reminder notification
  sendThreeHourReminder(taskTitle: string, dueTime: string) {
    this.playChime('alert');
    this.showBrowserNotification(`⏰ Task Due in 3 Hours: System for Mikiyas`, {
      body: `Your task "${taskTitle}" is due at ${dueTime}! Focus on finishing it now.`,
      tag: `reminder-${Date.now()}`,
    });
  }

  // Send immediate reminder if task is due in less than 3 hours
  sendImmediateReminder(taskTitle: string, minutesRemaining: number, dueTime: string) {
    this.playChime('alert');
    const timeText = minutesRemaining <= 0 ? 'Due right now!' : `Due in ${minutesRemaining} minutes (at ${dueTime})!`;
    this.showBrowserNotification(`⚠️ Task Due Soon (< 3 Hours): ${taskTitle}`, {
      body: `This task was set with a short deadline: ${timeText}`,
      tag: `urgent-${Date.now()}`,
    });
  }

  // Sync scheduled tasks with Service Worker for background dispatch
  syncTasksWithServiceWorker(tasks: Task[]) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const payload = tasks
      .filter(t => !t.completed)
      .map(t => {
        let autoReminderTimestamp = 0;
        if (t.dueDate && t.dueTime) {
          const deadline = new Date(`${t.dueDate}T${t.dueTime}:00`).getTime();
          autoReminderTimestamp = deadline - 3 * 60 * 60 * 1000;
        }
        return {
          id: t.id,
          title: t.title,
          type: t.type,
          dueTime: t.dueTime,
          dueDate: t.dueDate,
          autoReminderTimestamp,
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

  // Send an app blocked notification (browser notification if granted)
  sendAppBlockedAlert(appName: string, limitMinutes: number) {
    this.playChime('blocked');
    this.showBrowserNotification(`🛑 App Blocked: ${appName}`, {
      body: `You've reached your ${limitMinutes} min limit for ${appName} today. Step away and refresh!`,
      tag: `blocked-${appName}`,
    });
  }
}

export const notificationService = new NotificationService();
