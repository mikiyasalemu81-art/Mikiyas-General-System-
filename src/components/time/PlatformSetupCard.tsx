import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  NativeBlockerService, 
  NativePermissionStatus, 
  InstalledAppInfo 
} from '../../services/nativeBlocker';
import { 
  generateWindowsBlockerBat, 
  generateWindowsUnblockerBat, 
  downloadFile 
} from '../../services/systemBlocker';
import { 
  Smartphone, 
  Apple, 
  Monitor, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  Plus, 
  ShieldCheck, 
  Download,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const PlatformSetupCard: React.FC = () => {
  const { apps, addBanner, addCustomApp } = useApp();
  
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'chrome' | 'windows'>('android');
  const [permissions, setPermissions] = useState<NativePermissionStatus>({
    hasUsageStats: false,
    hasAccessibility: false,
    allGranted: false,
  });
  const [isCheckingPerms, setIsCheckingPerms] = useState(false);
  const [isNativeAvailable, setIsNativeAvailable] = useState(false);
  const [installedApps, setInstalledApps] = useState<InstalledAppInfo[]>([]);
  const [showInstalledModal, setShowInstalledModal] = useState(false);
  const [customPackageInput, setCustomPackageInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Check initial platform & permissions
  useEffect(() => {
    const isNative = NativeBlockerService.isNativeAvailable();
    setIsNativeAvailable(isNative);

    if (NativeBlockerService.isAndroid()) {
      setActivePlatform('android');
    } else if (NativeBlockerService.isIOS()) {
      setActivePlatform('ios');
    } else {
      setActivePlatform('chrome');
    }

    refreshPermissions();
  }, []);

  const refreshPermissions = async () => {
    setIsCheckingPerms(true);
    try {
      const status = await NativeBlockerService.checkPermissions();
      setPermissions(status);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsCheckingPerms(false);
    }
  };

  const handleOpenUsageAccess = async () => {
    const opened = await NativeBlockerService.requestUsageAccess();
    if (!opened) {
      addBanner({
        type: 'info',
        title: 'Android Settings',
        message: 'Open Android Settings > Apps > Special App Access > Usage Access, and enable System for Mikiyas.',
      });
    }
  };

  const handleOpenAccessibility = async () => {
    const opened = await NativeBlockerService.requestAccessibility();
    if (!opened) {
      addBanner({
        type: 'info',
        title: 'Android Settings',
        message: 'Open Android Settings > Accessibility > Downloaded Apps > System for Mikiyas Blocker, and toggle ON.',
      });
    }
  };

  const handleLoadInstalledApps = async () => {
    if (!isNativeAvailable) {
      setShowInstalledModal(true);
      return;
    }
    const appsList = await NativeBlockerService.getInstalledApps();
    setInstalledApps(appsList);
    setShowInstalledModal(true);
  };

  const handleAddCustom = (name: string, pkg: string) => {
    addCustomApp(name, pkg, 30);
    setShowInstalledModal(false);
    setCustomNameInput('');
    setCustomPackageInput('');
  };

  const handleDownloadWindowsBlocker = () => {
    const batContent = generateWindowsBlockerBat(apps);
    downloadFile('block-distractions.bat', batContent);
    addBanner({
      type: 'info',
      title: 'Windows Blocker Downloaded',
      message: 'Right-click "block-distractions.bat" and choose "Run as administrator" to apply real system-wide blocking!',
    });
  };

  const handleDownloadWindowsUnblocker = () => {
    const batContent = generateWindowsUnblockerBat();
    downloadFile('unblock-distractions.bat', batContent);
    addBanner({
      type: 'info',
      title: 'Windows Unblocker Downloaded',
      message: 'Run "unblock-distractions.bat" as administrator to restore standard network access.',
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Real App Blocking Platform Setup & Honesty Center
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Transparent multi-platform blocking: Android native plugin, Desktop Chrome MV3 extension, Windows hosts, & iOS requirements.
            </p>
          </div>
        </div>

        <button 
          type="button"
          aria-label="Toggle platform setup"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
          {/* Platform Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setActivePlatform('android')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePlatform === 'android'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android (Recommended)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('chrome')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePlatform === 'chrome'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop Chrome MV3</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('windows')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePlatform === 'windows'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Windows (.bat)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('ios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePlatform === 'ios'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iPhone / iOS</span>
            </button>
          </div>

          {/* TAB 1: ANDROID */}
          {activePlatform === 'android' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50">
                <div className="text-xs text-sky-900 dark:text-sky-200 leading-relaxed">
                  <strong className="font-bold">Android Native Engine:</strong> Uses Android's <code className="px-1 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 font-mono text-[11px]">UsageStatsManager</code> for foreground time tracking and <code className="px-1 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 font-mono text-[11px]">AccessibilityService</code> to immediately send you back to Home when an app is over its limit.
                </div>
                <button
                  type="button"
                  onClick={refreshPermissions}
                  disabled={isCheckingPerms}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 hover:bg-sky-200 transition-colors shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPerms ? 'animate-spin' : ''}`} />
                  <span>Refresh Status</span>
                </button>
              </div>

              {/* Permission Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Step 1: Usage Access */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        1. Usage Access Permission
                      </span>
                      {permissions.hasUsageStats ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Required
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Allows System for Mikiyas to read real daily foreground minutes for TikTok, Instagram, YouTube, and Chess.com.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenUsageAccess}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <span>Open Usage Settings</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Step 2: Accessibility Service */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        2. Accessibility Blocker Service
                      </span>
                      {permissions.hasAccessibility ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Required
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Detects foreground app switches. If an app exceeds daily limits or is locked, it redirects to the home screen and logs the attempt.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAccessibility}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <span>Open Accessibility Settings</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Supported Package List & Add Custom App */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Default packages:</span>
                  <span className="font-mono text-[11px] text-slate-500">TikTok, Instagram, YouTube, Chess.com</span>
                </div>
                <button
                  type="button"
                  onClick={handleLoadInstalledApps}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another App to Shield</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CHROME EXTENSION */}
          {activePlatform === 'chrome' && (
            <div className="space-y-3.5 animate-fade-in text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Manifest V3 DeclarativeNetRequest Companion
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    extension/ folder
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  The extension intercepts navigations to <strong>tiktok.com</strong>, <strong>instagram.com</strong>, <strong>chess.com</strong>, and <strong>youtube.com/shorts</strong> at the network layer and redirects them to a peaceful focus barrier page with attempt tracking.
                </p>
              </div>

              <div className="space-y-2 border-l-2 border-sky-500 pl-3.5 py-1 text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white">Quick 1-Minute Install:</div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>In Google Chrome or Brave, navigate to <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">chrome://extensions/</code></li>
                  <li>Toggle <strong>Developer mode</strong> ON in the top-right corner.</li>
                  <li>Click <strong>Load unpacked</strong> button on the top-left.</li>
                  <li>Select the <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">extension</code> folder inside this project directory.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: WINDOWS OS BLOCKER */}
          {activePlatform === 'windows' && (
            <div className="space-y-3.5 animate-fade-in text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  Windows System-Wide Hosts Blocker
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Blocks all domains for your active apps across Chrome, Edge, Firefox, Brave, and desktop programs by routing DNS requests to loopback.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadWindowsBlocker}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download block-distractions.bat</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadWindowsUnblocker}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                >
                  <span>Download unblock-distractions.bat</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: IPHONE / IOS TRANSPARENCY */}
          {activePlatform === 'ios' && (
            <div className="space-y-3 animate-fade-in text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Apple iOS Sandboxing & Feasibility Truth</span>
                </div>
                <p className="text-amber-900 dark:text-amber-300 leading-relaxed text-[11px]">
                  Web apps and PWAs on iOS / Safari cannot block native iOS apps. Apple strictly sandboxes all mobile browsers from inspecting other apps or closing them.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white">Requirements for Real iPhone App Blocking:</div>
                <p>
                  To achieve real app blocking on iOS, Apple mandates a <strong>Native Swift / SwiftUI application</strong> utilizing Apple's <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">FamilyControls</code> and <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">DeviceActivity</code> frameworks.
                </p>
                <p>
                  These frameworks require a paid <strong>Apple Developer Account (\$99/yr)</strong> and Apple's special approval for the <em>Family Controls Entitlement</em>.
                </p>
                <p className="text-slate-500 italic">
                  Note: If you confirm you have an iPhone with an active Apple Developer membership, we can generate the Xcode SwiftUI project files for this entitlement.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Installed App to Shield */}
      {showInstalledModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scale-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Add App to Distraction Shield
              </h4>
              <button
                type="button"
                onClick={() => setShowInstalledModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕ Close
              </button>
            </div>

            {/* Manual Package Input */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enter Custom Package or App Name:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="App Name (e.g. Snapchat)"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Package (e.g. com.snapchat.android)"
                  value={customPackageInput}
                  onChange={(e) => setCustomPackageInput(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddCustom(customNameInput, customPackageInput)}
                disabled={!customPackageInput.trim()}
                className="w-full py-1.5 rounded-lg text-xs font-bold bg-sky-600 text-white disabled:opacity-50 hover:bg-sky-700 transition-colors"
              >
                Add App to Shield
              </button>
            </div>

            {/* Installed Apps List (if populated from device) */}
            {installedApps.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Detected Apps on Device:
                </span>
                {installedApps.map((item) => (
                  <div
                    key={item.packageName}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{item.packageName}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddCustom(item.name, item.packageName)}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 hover:bg-sky-100"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
