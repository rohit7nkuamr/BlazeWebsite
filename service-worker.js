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

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              // Don't cache if it's an API call or external resource
              if (event.request.url.indexOf('http') === 0) {
                cache.put(event.request, responseToCache);
              }
            });
            
          return response;
        });
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Function to sync data when back online
function syncData() {
  // Implementation for syncing data when back online
  return Promise.resolve();
}

// Handle push notifications
self.addEventListener('push', event => {
  const title = 'Blaze Restaurant';
  const options = {
    body: event.data.text(),
    icon: '/assets/logo.png',
    badge: '/assets/badge.png'
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});
