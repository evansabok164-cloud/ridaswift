const CACHE = 'ridaswift-v2';
const ASSETS = [
  '/ridaswift/index.html',
  '/ridaswift/manifest.json',
  '/ridaswift/ridaswift-logo.png',
  '/ridaswift/evans-photo.jpg',
  '/ridaswift/sw.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).catch(function() {
        return caches.match('/ridaswift/index.html');
      });
    })
  );
});