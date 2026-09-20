// 通貨コンバーター: 画面ファイルを端末にキャッシュし、オフラインでも起動できるようにする
const C = "fx3-v2";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./index.html"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return; // 為替APIはキャッシュしない
  e.respondWith(
    caches.open(C).then(async c => {
      const hit = await c.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    })
  );
});
