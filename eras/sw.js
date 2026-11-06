/* The Eras Life: offline play. The game's own files are fetched fresh when you are online and kept
   for when you are not. version.json is never cached, so the update checker always sees the truth.
   The 3D library and fonts come from other sites and are kept after the first visit. */
const CACHE = 'eras-life-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'index.html', 'manifest.json']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.endsWith('version.json')) return;
  if (url.origin === location.origin) {
    // Online first, so updates arrive straight away; the saved copy is the fallback.
    e.respondWith(fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch:true }).then(r => r || caches.match('index.html'))));
    return;
  }
  if (/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
  }
});
