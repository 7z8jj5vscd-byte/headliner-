/* Dream Academy: offline support. Network first for the game files, falling back to the cache. */
const CACHE = 'dreamacademy-v12';
const FILES = ['./', 'index.html', 'data.js?v=2', 'engine.js?v=6', 'story.js?v=2', 'depth.js?v=2', 'career.js?v=1', 'replay.js?v=1', 'stage3d.js?v=6', 'minigames.js?v=4', 'ui.js?v=8', 'studio.js?v=1', 'manifest.json', 'icon.png', 'apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch:false }).then(m => m || caches.match(e.request, { ignoreSearch:true }))));
});
