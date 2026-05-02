// RidaSwift Service Worker — v6
var CACHE_NAME = 'ridaswift-v6';
var OFFLINE_URL = 'offline.html';

var PRECACHE = [
  'index.html',
  'rs-admin.html',
  'swift_shopper.html',
  'offline.html',
  'manifest.json',
  'ridaswift-logo.png',
  'evans-photo.jpg'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).catch(function(err) {
      console.log('[SW] Precache partial error:', err);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  if (event.request.method !== 'GET') return;
  if (url.includes('api.anthropic.com')) return;
  if (url.includes('wa.me')) return;
  if (url.includes('web3forms.com')) return;
  if (url.includes('fonts.googleapis.com')) return;
  if (url.includes('fonts.gstatic.com')) return;
  if (url.includes('wttr.in')) return;

  if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, clone); });
          return response;
        })
        .catch(function() {
          return caches.match(event.request).then(function(cached){
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var networkFetch = fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, clone); });
        }
        return response;
      }).catch(function(){ return cached; });
      return cached || networkFetch;
    })
  );
});

self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e){}
  var title   = data.title || '🏍️ RidaSwift';
  var options = {
    body: data.body || 'You have a new notification from RidaSwift',
    icon: 'ridaswift-logo.png',
    badge: 'ridaswift-logo.png',
    vibrate: [200,100,200,100,200],
    data: { url: data.url || 'index.html' },
    actions: [
      { action:'open', title:'📍 Open App' },
      { action:'wa',   title:'💬 WhatsApp' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url : 'index.html';
  if (event.action === 'wa') url = 'https://wa.me/254716651788';
  event.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
      for (var i=0;i<list.length;i++){
        if (list[i].url.includes('ridaswift') && 'focus' in list[i]) return list[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(
      self.clients.matchAll().then(function(list){
        list.forEach(function(c){ c.postMessage({type:'FLUSH_OFFLINE_QUEUE'}); });
      })
    );
  }
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
