// Service Worker para PWA RIALTOR
const CACHE_NAME = 'rialtor-v1.0.1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/favicon-96x96.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/favicon.ico',
  '/images/log.png'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Error caching files:', error);
      })
  );
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar respuesta del cache si existe
        if (response) {
          return response;
        }
        // Si no está en cache, hacer la petición normal
        return fetch(event.request).catch((error) => {
          console.error('Fetch failed:', error);
          // Podrías retornar una página offline aquí
          throw error;
        });
      })
  );
});