const CACHE_NAME = 'javea-snorkel-v1';
const PRECACHE = [
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first, falling back to cache when offline.
// Caches the app page itself, species photos, and weather responses
// as they're successfully fetched, so repeat visits work with no signal.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await cache.match(req);
        if (cached) return cached;
        throw err;
      }
    })
  );
});
