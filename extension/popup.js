document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('apps-container');
  const openDashboardBtn = document.getElementById('open-dashboard-btn');

  if (openDashboardBtn) {
    openDashboardBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:5173/' });
    });
  }

  // Load apps from storage
  const { blocked_apps } = await chrome.storage.local.get(['blocked_apps']);
  const apps = blocked_apps || [];

  if (!container) return;

  if (apps.length === 0) {
    container.innerHTML = '<div style="font-size:12px;color:#94a3b8;text-align:center;padding:12px;">No apps configured. Open dashboard to setup.</div>';
    return;
  }

  container.innerHTML = '';
  apps.forEach(app => {
    const item = document.createElement('div');
    item.className = 'app-item';

    const info = document.createElement('div');
    info.className = 'app-info';

    const name = document.createElement('span');
    name.className = 'app-name';
    name.textContent = app.name;

    const meta = document.createElement('span');
    meta.className = 'app-meta';
    const modeText = app.blockMode === 'always' ? 'Permanent' : `Limit ${app.dailyLimitMinutes}m`;
    const attemptsText = app.attempts ? ` • ${app.attempts} attempts stopped` : '';
    meta.textContent = `${modeText}${attemptsText}`;

    info.appendChild(name);
    info.appendChild(meta);

    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'toggle';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!app.isBlocked;

    checkbox.addEventListener('change', async () => {
      await chrome.runtime.sendMessage({
        action: 'TOGGLE_APP',
        appId: app.id,
        isBlocked: checkbox.checked
      });
    });

    const slider = document.createElement('span');
    slider.className = 'slider';

    toggleLabel.appendChild(checkbox);
    toggleLabel.appendChild(slider);

    item.appendChild(info);
    item.appendChild(toggleLabel);
    container.appendChild(item);
  });
});
