// アプリ本体とONNX Runtimeを端末にキャッシュして、2回目以降をオフラインで動かす。
// モデル本体(.onnx)はページ側のCache API(up-model-v1)で管理するので、ここでは扱わない。
const V = 'up-v1';
const CDN = 'https://cdn.jsdelivr.net/';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(V).then((c) => c.addAll(['./', './index.html'])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith('up-v') && k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const sameOrigin = new URL(r.url).origin === location.origin;
  if (!sameOrigin && !r.url.startsWith(CDN)) return;

  // ページ本体: オンラインなら最新を取り、失敗したらキャッシュ
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r)
        .then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); return res; })
        .catch(() => caches.match(r, { ignoreSearch: true }).then((h) => h || caches.match('./index.html')))
    );
    return;
  }

  // それ以外: キャッシュ優先
  e.respondWith(
    caches.match(r, { ignoreVary: true }).then((hit) =>
      hit ||
      fetch(r).then((res) => {
        if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); }
        return res;
      })
    )
  );
});
