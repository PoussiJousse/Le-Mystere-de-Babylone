/* Le Mystère de Babylone · v2.1 · 2026-10-17
   Service worker hors ligne : met en cache UNIQUEMENT les fichiers du jeu (même site). Aucune autre connexion.
   v2.0 : la page du jeu est demandée d'abord au site (mise à jour immédiate), le cache sert seulement hors connexion. */
const CACHE = 'mdb-v2.1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return; // on ne touche à rien d'autre
  const keep = r => { if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; };
  if (e.request.mode === 'navigate') { // la page du jeu : réseau d'abord, cache si hors connexion
    e.respondWith(fetch(e.request).then(keep).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(keep)));
});
