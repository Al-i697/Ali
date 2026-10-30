/* يخزّن ملفات البرنامج على الآيباد ليشتغل بدون إنترنت. الإصدار: 2026.10.30-7843f57b */
const CACHE = 'cafe-2026.10.30-7843f57b';
const FILES = ["./", "index.html", "app.css?v=2026.10.30-7843f57b", "app.js?v=2026.10.30-7843f57b", "manifest.webmanifest", "fonts/cairo-arabic-400-normal.woff2", "fonts/cairo-arabic-600-normal.woff2", "fonts/cairo-arabic-700-normal.woff2", "fonts/cairo-arabic-800-normal.woff2", "fonts/cairo-arabic-900-normal.woff2", "fonts/cairo-latin-400-normal.woff2", "fonts/cairo-latin-600-normal.woff2", "fonts/cairo-latin-700-normal.woff2", "fonts/cairo-latin-800-normal.woff2", "fonts/cairo-latin-900-normal.woff2", "vendor/html2pdf.bundle.min.js", "vendor/qrcode.min.js", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cafe-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith(caches.match(r).then(m => m ||
    (r.mode === 'navigate' ? caches.match('index.html') : null) ||
    fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })));
});
