/**
 * Background Service Worker - System for Mikiyas MV3 Chrome Extension
 * Enforces site blocking using Chrome declarativeNetRequest
 */

const DEFAULT_APPS = [
  {
    id: 'tiktok',
    name: 'TikTok',
    domains: ['tiktok.com'],
    ruleId: 101,
    urlFilter: '*://*.tiktok.com/*',
    isBlocked: true,
    blockMode: 'always',
    dailyLimitMinutes: 30,
    currentUsageMinutes: 0,
    attempts: 3
  },
  {
    id: 'instagram',
    name: 'Instagram',
    domains: ['instagram.com', 'threads.net'],
    ruleId: 102,
    urlFilter: '*://*.instagram.com/*',
    isBlocked: true,
    blockMode: 'always',
    dailyLimitMinutes: 30,
    currentUsageMinutes: 0,
    attempts: 5
  },
  {
    id: 'chess_com',
    name: 'Chess.com',
    domains: ['chess.com'],
    ruleId: 103,
    urlFilter: '*://*.chess.com/*',
    isBlocked: true,
    blockMode: 'limit',
    dailyLimitMinutes: 60,
    currentUsageMinutes: 20,
    attempts: 0
  },
  {
    id: 'youtube_shorts',
    name: 'YouTube Shorts',
    domains: ['youtube.com'],
    ruleId: 104,
    regexFilter: '^https?:\\/\\/(www\\.)?youtube\\.com\\/shorts.*',
    isBlocked: true,
    blockMode: 'limit',
    dailyLimitMinutes: 30,
    currentUsageMinutes: 15,
    attempts: 0
  },
  {
    id: 'facebook',
    name: 'Facebook',
    domains: ['facebook.com'],
    ruleId: 105,
    urlFilter: '*://*.facebook.com/*',
    isBlocked: false,
    blockMode: 'always',
    dailyLimitMinutes: 30,
    currentUsageMinutes: 0,
    attempts: 0
  }
];

// Initialize on install or startup
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['blocked_apps']);
  if (!data.blocked_apps) {
    await chrome.storage.local.set({ blocked_apps: DEFAULT_APPS });
  }
  await updateBlockingRules();
});

chrome.runtime.onStartup.addListener(async () => {
  await updateBlockingRules();
});

/**
 * Re-evaluate rules and apply declarativeNetRequest dynamic redirects
 */
async function updateBlockingRules() {
  const { blocked_apps } = await chrome.storage.local.get(['blocked_apps']);
  const apps = blocked_apps || DEFAULT_APPS;

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map(r => r.id);

  const addRules = [];

  for (const app of apps) {
    const shouldBlock = app.isBlocked && (
      app.blockMode === 'always' ||
      (app.dailyLimitMinutes > 0 && app.currentUsageMinutes >= app.dailyLimitMinutes)
    );

    if (shouldBlock && app.ruleId) {
      const blockedUrl = chrome.runtime.getURL(`blocked.html?app=${encodeURIComponent(app.name)}&id=${encodeURIComponent(app.id)}`);

      const rule = {
        id: app.ruleId,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: blockedUrl }
        },
        condition: {
          resourceTypes: ['main_frame', 'sub_frame']
        }
      };

      if (app.regexFilter) {
        rule.condition.regexFilter = app.regexFilter;
      } else if (app.urlFilter) {
        rule.condition.urlFilter = app.urlFilter;
      }

      addRules.push(rule);
    }
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules
  });

  console.log(`[Mikiyas Blocker] Updated DNR dynamic rules. Active blocked rules: ${addRules.length}`);
}

/**
 * Handle tab navigations to record blocked attempts when hitting blocked.html
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.includes('blocked.html')) {
    try {
      const url = new URL(changeInfo.url);
      const appId = url.searchParams.get('id');
      if (appId) {
        const { blocked_apps } = await chrome.storage.local.get(['blocked_apps']);
        if (blocked_apps) {
          const updated = blocked_apps.map(a => {
            if (a.id === appId) {
              return { ...a, attempts: (a.attempts || 0) + 1 };
            }
            return a;
          });
          await chrome.storage.local.set({ blocked_apps: updated });
        }
      }
    } catch (e) {
      console.warn('Error recording attempt:', e);
    }
  }
});

/**
 * Listen for sync messages from the web app or popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleIncomingMessage(message).then(sendResponse);
  return true; // Keep message channel open for async response
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  handleIncomingMessage(message).then(sendResponse);
  return true;
});

async function handleIncomingMessage(message) {
  if (!message || !message.action) return { success: false, error: 'Unknown action' };

  switch (message.action) {
    case 'SYNC_APPS': {
      if (Array.isArray(message.apps)) {
        const { blocked_apps } = await chrome.storage.local.get(['blocked_apps']);
        const current = blocked_apps || DEFAULT_APPS;

        const merged = message.apps.map(incoming => {
          const match = current.find(c => c.id === incoming.id) || {};
          return {
            ...match,
            ...incoming,
            ruleId: match.ruleId || incoming.ruleId || (100 + Math.floor(Math.random() * 800)),
            attempts: match.attempts || incoming.attempts || 0,
          };
        });

        await chrome.storage.local.set({ blocked_apps: merged });
        await updateBlockingRules();
        return { success: true, count: merged.length };
      }
      return { success: false, error: 'Invalid apps array' };
    }

    case 'GET_STATUS': {
      const { blocked_apps } = await chrome.storage.local.get(['blocked_apps']);
      return {
        success: true,
        apps: blocked_apps || DEFAULT_APPS,
        extensionVersion: '1.0.0'
      };
    }

    case 'TOGGLE_APP': {
      const { appId, isBlocked } = message;
      const { blocked_apps } = await chrome.storage.local.get(['blocked_apps']);
      if (blocked_apps) {
        const updated = blocked_apps.map(a => a.id === appId ? { ...a, isBlocked } : a);
        await chrome.storage.local.set({ blocked_apps: updated });
        await updateBlockingRules();
        return { success: true };
      }
      return { success: false };
    }

    default:
      return { success: false, error: 'Unrecognized action' };
  }
}
