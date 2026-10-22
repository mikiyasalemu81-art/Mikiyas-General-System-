const CACHE_NAME = 'mikiyas-system-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg'
];

let scheduledTasks = [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// Periodic reminder check in service worker for closed/background operation
function checkScheduledReminders() {
  const now = Date.now();
  scheduledTasks.forEach((task) => {
    if (!task.completed && task.autoReminderTimestamp) {
      if (now >= task.autoReminderTimestamp && !task.swNotified) {
        task.swNotified = true;
        self.registration.showNotification(`⏰ Task Due Soon: ${task.title}`, {
          body: `Automatic 3-hour reminder: "${task.title}" is due at ${task.dueTime}!`,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: `task-reminder-${task.id}`,
          renotify: true,
          data: { taskId: task.id, url: '/' }
        });
      }
    }
  });
}

setInterval(checkScheduledReminders, 30000);

// Receive scheduled tasks from the web app
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SCHEDULE_TASK_REMINDERS') {
    scheduledTasks = event.data.tasks || [];
    checkScheduledReminders();
  } else if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});

// Focus or open window when user clicks notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
