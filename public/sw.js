/**
 * Sportify Kashmir — Service Worker
 * ==================================
 * Provides offline support and intelligent caching for the PWA.
 *
 * Caching strategies:
 *   - Static assets  → Cache-First  (fast loads, updated on new SW version)
 *   - API calls      → Network-First (fresh data when online, cached fallback)
 *   - Navigation     → Network-First with offline fallback page
 */

// Bump this whenever the navigation/cache strategy changes so existing users
// do not keep an old shell that requires a manual refresh.
const CACHE_VERSION = 'sportify-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/hero-sports.png',
];

// ─── Install Event ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
});

// ─── Activate Event ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ─── Fetch Event ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE should always go to network)
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Never cache API responses. They can be user-specific, rapidly changing,
  // or security-sensitive (cart, orders, account and admin data).
  if (url.pathname.startsWith('/user/') ||
      url.pathname.startsWith('/product/') ||
      url.pathname.startsWith('/category/') ||
      url.pathname.startsWith('/brand/') ||
      url.pathname.startsWith('/cart/') ||
      url.pathname.startsWith('/orders/') ||
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/admin/') ||
      url.pathname.startsWith('/contact/') ||
      url.pathname.startsWith('/addresses/') ||
      url.pathname.startsWith('/refund/') ||
      url.pathname.startsWith('/posts/')) {
    event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ success: false, message: 'You are offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // Strategy 2: Static assets (JS, CSS, images, fonts) → Cache-First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Strategy 3: Navigation requests → Network-First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  // Default: Network-First for everything else
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// ─── Caching Strategies ──────────────────────────────────────────

/**
 * Cache-First: Try cache, fallback to network (and update cache).
 * Best for static assets that change infrequently.
 */
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (_error) {
    // Return a basic offline response for static assets
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network-First: Try network, fallback to cache.
 * Best for API calls and dynamic content.
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (_error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return a JSON error for API requests
    return new Response(
      JSON.stringify({ success: false, message: 'You are offline' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Navigation handler: Network-first with offline.html fallback.
 */
async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (_error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Show offline page
    return caches.match('/offline.html');
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Check if a path is a static asset worth caching aggressively.
 */
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.woff', '.woff2', '.ttf', '.otf', '.eot',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
    '.json', '.map'
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// ─── Background Sync (future enhancement) ────────────────────────
// self.addEventListener('sync', (event) => { ... });

// ─── Push Notifications (future enhancement) ─────────────────────
// self.addEventListener('push', (event) => { ... });
