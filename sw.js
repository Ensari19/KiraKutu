// KiraKutu service worker: uygulamayı çevrimdışı da açılır yapar.
const CACHE = 'kirakutu-v4';
const CORE = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Önce ağ, olmazsa önbellek: güncellemeler hemen görünür, internet yokken de çalışır.
  // Sayfa açılışlarında tarayıcı önbelleğini atla: yeni sürüm hemen gelsin.
  const req = e.request.mode === 'navigate' ? fetch(e.request.url, {cache: 'no-cache'}) : fetch(e.request);
  e.respondWith(req.then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});
