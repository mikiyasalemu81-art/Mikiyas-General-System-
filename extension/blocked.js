// Handle params and user interaction on blocked.html
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const appName = urlParams.get('app') || 'Distraction';
  const appId = urlParams.get('id');

  const appNameEl = document.getElementById('app-name');
  if (appNameEl) {
    appNameEl.textContent = appName;
  }

  // Load latest attempt count from storage
  if (chrome.storage && chrome.storage.local) {
    const { blocked_apps } = await chrome.storage.local.get(['blocked_apps']);
    if (blocked_apps && appId) {
      const match = blocked_apps.find(a => a.id === appId);
      if (match) {
        const attemptEl = document.getElementById('attempt-count');
        if (attemptEl) {
          attemptEl.textContent = match.attempts || 1;
        }
        const reasonEl = document.getElementById('block-reason');
        if (reasonEl) {
          reasonEl.textContent = match.blockMode === 'always' ? 'Permanent Lock' : 'Daily Limit';
        }
      }
    }
  }

  const openAppBtn = document.getElementById('open-app-btn');
  if (openAppBtn) {
    openAppBtn.addEventListener('click', () => {
      // Find or open the System for Mikiyas tab
      chrome.tabs.create({ url: 'http://localhost:5173/' });
    });
  }
});
