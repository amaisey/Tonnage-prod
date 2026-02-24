const CACHE_NAME = 'workout-tracker-v6';
const APP_VERSION = '1.1.0';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache core files and activate immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches and take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, then cache (same-origin GET only)
self.addEventListener('fetch', event => {
  // Cross-origin requests (Supabase API, external CDNs, etc.):
  // Explicitly pass through to the network via respondWith(fetch()).
  // A bare "return" without respondWith() causes Brave browser to stall
  // subsequent cross-origin requests after the first batch completes.
  if (!event.request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Only cache same-origin GET requests — never interfere with POST/PUT/DELETE
  if (event.request.method !== 'GET') return;

  // Navigation requests (HTML pages) — network first with /index.html SPA fallback
  // Prevents blank screens when cached HTML references stale hashed JS bundles
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html').then(cached => {
            return cached || new Response(
              '<!DOCTYPE html><html><body style="background:#111827;color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><div style="text-align:center"><h2>Tonnage</h2><p>You appear to be offline.</p><p>Please check your connection and refresh.</p></div></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // Non-navigation assets — network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Listen for messages from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: APP_VERSION, cache: CACHE_NAME });
  }
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
