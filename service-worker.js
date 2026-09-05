const CACHE_NAME = 'finflow-shell-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icon-192.svg',
  './icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const networkResponse = fetch(event.request).then(response => {
          if (response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseCopy));
          }
          return response;
        }).catch(() => cachedResponse);

        return cachedResponse || networkResponse;
      })
    );
    return;
  }

  const cacheableAsset = ['script', 'style', 'font', 'image'].includes(event.request.destination);
  if (requestUrl.protocol === 'https:' && cacheableAsset) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(response => {
          if (response.ok || response.type === 'opaque') {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseCopy));
          }
          return response;
        });
      })
    );
  }
});
