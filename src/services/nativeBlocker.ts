import { registerPlugin, Capacitor } from '@capacitor/core';
import { BlockedApp } from '../types';

export interface NativePermissionStatus {
  hasUsageStats: boolean;
  hasAccessibility: boolean;
  allGranted: boolean;
}

export interface InstalledAppInfo {
  packageName: string;
  name: string;
}

export interface AppBlockerPluginInterface {
  checkPermissions(): Promise<NativePermissionStatus>;
  requestUsageAccess(): Promise<{ opened: boolean }>;
  requestAccessibility(): Promise<{ opened: boolean }>;
  getAppUsage(): Promise<{ usage: Record<string, number> }>;
  setBlockedApps(options: { apps: any[] }): Promise<{ success: boolean }>;
  getBlockedAttempts(): Promise<{ attempts: Record<string, number> }>;
  getInstalledApps(): Promise<{ installedApps: InstalledAppInfo[] }>;
  addListener(
    eventName: 'appBlocked',
    listenerFunc: (data: { packageName: string; attempts: number; timestamp: number }) => void
  ): Promise<any>;
}

// Register the custom Capacitor Android plugin
export const NativeAppBlocker = registerPlugin<AppBlockerPluginInterface>('AppBlocker');

export class NativeBlockerService {
  /**
   * Determine platform environment
   */
  static getPlatform(): 'android' | 'ios' | 'web' {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') return 'android';
    if (platform === 'ios') return 'ios';
    return 'web';
  }

  static isAndroid(): boolean {
    return this.getPlatform() === 'android';
  }

  static isIOS(): boolean {
    return this.getPlatform() === 'ios';
  }

  static isWeb(): boolean {
    return this.getPlatform() === 'web';
  }

  static isNativeAvailable(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('AppBlocker');
  }

  /**
   * Check Android Usage Access and Accessibility permissions
   */
  static async checkPermissions(): Promise<NativePermissionStatus> {
    if (!this.isNativeAvailable()) {
      return {
        hasUsageStats: false,
        hasAccessibility: false,
        allGranted: false,
      };
    }

    try {
      return await NativeAppBlocker.checkPermissions();
    } catch (e) {
      console.warn('NativeAppBlocker.checkPermissions error:', e);
      return {
        hasUsageStats: false,
        hasAccessibility: false,
        allGranted: false,
      };
    }
  }

  /**
   * Open Android Usage Access Settings
   */
  static async requestUsageAccess(): Promise<boolean> {
    if (!this.isNativeAvailable()) return false;
    try {
      const res = await NativeAppBlocker.requestUsageAccess();
      return !!res.opened;
    } catch (e) {
      console.warn('requestUsageAccess error:', e);
      return false;
    }
  }

  /**
   * Open Android Accessibility Settings
   */
  static async requestAccessibility(): Promise<boolean> {
    if (!this.isNativeAvailable()) return false;
    try {
      const res = await NativeAppBlocker.requestAccessibility();
      return !!res.opened;
    } catch (e) {
      console.warn('requestAccessibility error:', e);
      return false;
    }
  }

  /**
   * Sync active app limits & block statuses to the native Android background service
   */
  static async syncAppsToNative(apps: BlockedApp[]): Promise<boolean> {
    if (!this.isNativeAvailable()) return false;

    try {
      const payload = apps
        .filter(app => app.packageName && app.packageName.trim().length > 0)
        .map(app => ({
          packageName: app.packageName,
          name: app.name,
          isBlocked: app.isBlocked,
          blockMode: app.blockMode,
          dailyLimitMinutes: app.dailyLimitMinutes,
          currentUsageMinutes: app.currentUsageMinutes,
        }));

      const res = await NativeAppBlocker.setBlockedApps({ apps: payload });
      return !!res.success;
    } catch (e) {
      console.warn('syncAppsToNative error:', e);
      return false;
    }
  }

  /**
   * Query Android UsageStatsManager to get real foreground minutes today
   */
  static async getRealUsage(): Promise<Record<string, number>> {
    if (!this.isNativeAvailable()) return {};
    try {
      const res = await NativeAppBlocker.getAppUsage();
      return res.usage || {};
    } catch (e) {
      console.warn('getRealUsage error:', e);
      return {};
    }
  }

  /**
   * Query Android SharedPreferences for blocked attempt counts
   */
  static async getBlockedAttempts(): Promise<Record<string, number>> {
    if (!this.isNativeAvailable()) return {};
    try {
      const res = await NativeAppBlocker.getBlockedAttempts();
      return res.attempts || {};
    } catch (e) {
      console.warn('getBlockedAttempts error:', e);
      return {};
    }
  }

  /**
   * Query device for all installed launchable apps so the user can block any app
   */
  static async getInstalledApps(): Promise<InstalledAppInfo[]> {
    if (!this.isNativeAvailable()) return [];
    try {
      const res = await NativeAppBlocker.getInstalledApps();
      return res.installedApps || [];
    } catch (e) {
      console.warn('getInstalledApps error:', e);
      return [];
    }
  }

  /**
   * Register listener for realtime blocking events from AccessibilityService
   */
  static async registerBlockListener(
    callback: (data: { packageName: string; attempts: number; timestamp: number }) => void
  ) {
    if (!this.isNativeAvailable()) return null;
    try {
      return await NativeAppBlocker.addListener('appBlocked', callback);
    } catch (e) {
      console.warn('registerBlockListener error:', e);
      return null;
    }
  }
}
