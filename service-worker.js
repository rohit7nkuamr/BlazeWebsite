// Service Worker for Blaze Website - Dynamic Caching (No Offline Fallback)
const CACHE_NAME = 'blaze-dynamic-cache-v1';

// INSTALL: No pre-caching of non-essential assets; only the critical files can be added here if desired.
self.addEventListener('install', event => {
  // Optionally, you can pre-cache essential files:
  const preCacheAssets = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js'
    // You may add more essential assets if you wish.
  ];
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching essential files');
      return cache.addAll(preCacheAssets);
    })
  );
  self.skipWaiting(); // Activate worker immediately
});

// ACTIVATE: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH: Use cache-first strategy with dynamic caching
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Serve from cache if available
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise, fetch from network and cache the response
        return fetch(event.request).then(networkResponse => {
          // Only cache valid GET responses from our origin
          if (
            networkResponse &&
            networkResponse.ok &&
            event.request.method === 'GET' &&
            event.request.url.startsWith(self.location.origin)
          ) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});
