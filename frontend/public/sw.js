// Service Worker para PWA RIALTOR
const CACHE_NAME = 'rialtor-v1.0.2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/favicon-96x96.png',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  // Activar inmediatamente sin esperar
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache opened');
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('[Service Worker] Error caching files:', error);
          // No fallar si algunos archivos no se pueden cachear
          return Promise.resolve();
        });
      })
  );
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Interceptar peticiones con estrategia Network First
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    // Intentar primero desde la red
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde el cache
        return caches.match(event.request);
      })
  );
});