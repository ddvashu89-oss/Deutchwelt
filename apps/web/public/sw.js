const SHELL_CACHE = 'deutschwelt-shell-v1';
const PRIVATE_CACHE = 'deutschwelt-private-materials-v1';
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(['/','/manifest.webmanifest','/pwa-icon.svg'])));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('deutschwelt-shell-') && key !== SHELL_CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith((async () => {
    const saved = await caches.open(PRIVATE_CACHE);
    const offlineMaterial = await saved.match(request);
    if (offlineMaterial) return offlineMaterial;
    try {
      const response = await fetch(request);
      if (request.mode === 'navigate' && response.ok) {
        const cache = await caches.open(SHELL_CACHE); await cache.put('/', response.clone());
      }
      return response;
    } catch {
      if (request.mode === 'navigate') return (await caches.match('/')) || Response.error();
      return (await caches.match(request)) || Response.error();
    }
  })());
});
