/**
 * Sportify Kashmir — Service Worker
 * ==================================
 * Provides offline support and intelligent caching for the PWA.
 */

const CACHE_VERSION = 'sportify-v4';
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
  '/placeholder.svg',
];

// ─── Install Event ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => undefined);
    })
  );
  self.skipWaiting();
});

// ─── Activate Event ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch Event ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip non-http(s)
  if (!url.protocol.startsWith('http')) return;

  // Bypass Next.js hot module reload & dev requests to prevent dev cache issues
  if (
    url.pathname.includes('/_next/webpack-hmr') ||
    url.pathname.includes('hot-update') ||
    url.pathname.includes('/_next/data/') ||
    url.searchParams.has('__rsc')
  ) {
    return;
  }

  // Strategy 1: Page navigation requests → Network-First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  // Strategy 2: Backend API calls and external image CDNs → Bypass cache, direct network
  const isExternalOrApi =
    url.origin !== self.location.origin ||
    url.port === '4000' ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('onrender.com') ||
    url.pathname.startsWith('/product') ||
    url.pathname.startsWith('/cart') ||
    url.pathname.startsWith('/user') ||
    url.pathname.startsWith('/orders') ||
    url.pathname.startsWith('/category') ||
    url.pathname.startsWith('/brand');

  if (isExternalOrApi) {
    return; // Let browser handle network request natively
  }

  // Strategy 3: Local static assets (JS, CSS, fonts) → Cache-First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Default: Network-First for local dynamic assets
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// ─── Caching Strategies ──────────────────────────────────────────

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
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

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
    return new Response(
      JSON.stringify({ success: false, message: 'You are offline' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (_error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.match('/offline.html');
  }
}

function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js',
    '.css',
    '.woff',
    '.woff2',
    '.ttf',
    '.otf',
    '.eot',
    '.ico',
    '.json',
    '.map',
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}
