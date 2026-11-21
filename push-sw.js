// Xử lý thông báo đẩy trong service worker (được nạp vào sw.js qua workbox.importScripts trong vite.config.ts).
self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : '' }; }
  const title = d.title || 'CafeStaff';
  event.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: d.url || '/' },
  }));
});

// Chạm vào thông báo: mở app (hoặc đưa app đang mở lên trước) đúng màn hình liên quan.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (new URL(w.url).origin === self.location.origin) {
        w.postMessage({ type: 'push-open', url });
        return w.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
