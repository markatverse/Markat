// MarkatVerse Service Worker for Web Push Notifications
self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'MarkatVerse Notification';
    const options = {
      body: payload.body || 'You have a new update from MarkatVerse.',
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/favicon.ico',
      vibrate: [100, 50, 100],
      data: payload.data || { url: '/' },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('MarkatVerse', {
        body: text,
        icon: '/logo.png',
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
