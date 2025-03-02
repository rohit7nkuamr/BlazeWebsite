// Service Worker for Blaze Restaurant Website
const CACHE_NAME = 'blaze-restaurant-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/pages/menu.html',
  '/pages/about.html',
  '/pages/contact.html',
  '/script.js',
  '/dissolve-animations.css',
  '/dissolve-animation.js',
  '/styles.css',
  '/assets/logo.png',
  // Add other important assets to cache
];

// Install event - cache assets and force immediate activation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Activate new service worker immediately
});

// Activate event - clean up old caches and take control of clients immediately
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve cached assets first, then update the cache with network response
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if available
        if (response) {
          return response;
        }
        
        // Clone the request as it's a one-time use stream
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(networkResponse => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // Clone the response before caching
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              // Only cache GET requests and same-origin resources
              if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
                cache.put(event.request, responseToCache);
              }
            });
            
          return networkResponse;
        });
      })
      .catch(() => {
        // Optionally, return a fallback page here if both cache and network fail
        // return caches.match('/offline.html');
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Function to sync data when back online
function syncData() {
  // Add your logic here for syncing data queued while offline.
  // For now, we simply resolve the promise.
  return Promise.resolve();
}

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.text() : 'No payload';
  const title = 'Blaze Restaurant';
  const options = {
    body: data,
    icon: '/assets/logo.png',
    badge: '/assets/badge.png'
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});
