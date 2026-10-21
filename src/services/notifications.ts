// Browser Notification API and ADHD focus audio chime service

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

  // Send a task reminder notification
  sendTaskReminder(taskTitle: string, taskType: string) {
    this.playChime('alert');

    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(`⏰ Task Reminder: System for Mikiyas`, {
          body: `Time for your ${taskType} task: "${taskTitle}"`,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: `task-${Date.now()}`,
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        console.warn('Notification constructor error:', e);
      }
    }
  }

  // Send an app blocked notification (browser notification if granted)
  sendAppBlockedAlert(appName: string, limitMinutes: number) {
    this.playChime('blocked');

    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(`🛑 App Blocked: ${appName}`, {
          body: `You've reached your ${limitMinutes} min limit for ${appName} today. Step away and refresh!`,
          icon: '/favicon.svg',
          tag: `blocked-${appName}`,
        });
      } catch (e) {
        console.warn('Blocked notification error:', e);
      }
    }
  }
}

export const notificationService = new NotificationService();
