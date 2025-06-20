const CACHE_NAME = 'krankmeldung-cache-v1';
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'icon-192x192.png',
  'icon-512x512.png',
  'https://images.seeklogo.com/logo-png/54/2/motherson-logo-png_seeklogo-544537.png' // Logo-Bild cachen
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache-Treffer - Antwort zurückgeben
        if (response) {
          return response;
        }
        // Kein Cache-Treffer - vom Netzwerk abrufen
        return fetch(event.request).then(
          function(response) {
            // Überprüfen, ob eine gültige Antwort empfangen wurde
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // WICHTIG: Die Antwort klonen. Eine Antwort ist ein Stream
            // und kann nur einmal konsumiert werden. Wir müssen sie klonen, damit
            // sowohl der Browser als auch der Cache sie konsumieren können.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

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
