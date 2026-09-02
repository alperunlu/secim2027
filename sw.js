// Seçim 2027 — Service Worker
const CACHE = 'secim2027-v3';
const URLS = [
  'index.html',
  'manifest.json',
  'assets/icons/icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('cdn.') || e.request.url.includes('googleapis')) {
    // Pass through CDN requests
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
