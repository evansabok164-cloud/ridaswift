// RidaSwift Service Worker — v5 (bump this number to force refresh)
var CACHE_NAME = 'ridaswift-v5';
var URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/rs-admin.html',
  '/ridaswift-logo.png',
  '/evans-photo.jpg',
  '/manifest.json'
];

// Install — cache all files
self.addEventListener('install', function(event) {
  self.skipWaiting(); // activate immediately, don't wait
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activate — delete ALL old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(name) {
          if (name !== CACHE_NAME) {
            return caches.delete(name); // wipe old versions
          }
        })
      );
    }).then(function() {
      return self.clients.claim(); // take control of all open tabs immediately
    })
  );
});

// Fetch — network first, fall back to cache
// This means it always tries to get the latest from GitHub first
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(networkResponse) {
        // Got fresh response — update the cache with it
        var responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(function() {
        // Network failed — serve from cache
        return caches.match(event.request);
      })
  );
});
