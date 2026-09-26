/* ==========================================================================
   HireHub AI — Service Worker (PWA Offline & Caching Strategy)
   Production-grade SW with Stale-While-Revalidate + Cache-First patterns
   ========================================================================== */

const CACHE_NAME = 'hirehub-ai-v1';
const STATIC_CACHE = 'hirehub-static-v1';
const DYNAMIC_CACHE = 'hirehub-dynamic-v1';
const API_CACHE = 'hirehub-api-v1';

// Static assets to pre-cache on install (App Shell pattern)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install: Pre-cache essential app shell resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches from previous versions
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !currentCaches.includes(name))
            .map((name) => {
              console.log('[ServiceWorker] Deleting old cache:', name);
              return caches.delete(name);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Network-first for API calls, Stale-While-Revalidate for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE etc.)
  if (request.method !== 'GET') return;

  // Skip cross-origin requests except fonts
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // API requests: Network-first with fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Static assets (JS, CSS, images, fonts): Cache-first with network fallback
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Navigation requests (HTML pages): Stale-While-Revalidate
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then((cached) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const clone = networkResponse.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => cache.put('/index.html', clone));
              }
              return networkResponse;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
    );
    return;
  }

  // Default: Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ── Caching Strategies ──────────────────────────────────────────────────────

/**
 * Network-first: Try network, fall back to cache on failure.
 * Ideal for API calls where fresh data is preferred.
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    return new Response(JSON.stringify({ error: 'Offline', message: 'No network connection available.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Cache-first: Serve from cache, fall back to network.
 * Ideal for static assets that don't change frequently.
 */
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 408, statusText: 'Request Timeout' });
  }
}

/**
 * Stale-While-Revalidate: Serve cached version immediately,
 * then update cache from network in the background.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// ── Utility Helpers ─────────────────────────────────────────────────────────

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)$/i.test(pathname);
}

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
