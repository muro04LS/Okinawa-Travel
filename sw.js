/* sw.js : 一度開いたページ・3D表示の部品・写真を端末に保存し、圏外でも表示できるようにする */
  var V = "okinawa-v2"; var THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js";
/* オープニングの部品と写真。圏外でも流せるように最初に保存する */
  var OP = ["op.js", "op.css"];[[5, 26, 11], [6, 53, 25], [8, 218, 106], [10, 875, 431], [12, 3503, 1730], [13, 7008, 3463], [14, 14017, 6928]].forEach(function (b) {
    for (var j = 0; j < 5; j++) for (var i = 0; i < 3; i++) OP.push("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/" + b[0] + "/" + (b[1] + i) + "/" + (b[2] + j) + ".jpg");
  });
/* 3Dマップの全体表示に使う写真（ズーム10）のURL一覧 */
  function overview() {
  var n = 1024, out = [];
    function tx(lon) {
      return Math.floor((lon + 180) / 360 * n);
    }

  function ty(lat) {
    var r = lat * Math.PI / 180; return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n);
  } for (var x = tx(127.62); x <= tx(128.36); x++) for (var y = ty(26.90); y <= ty(26.06); y++) out.push("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/10/" + x + "/" + y + ".jpg");
    return out;
} self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.add("./").then(function () {
    return Promise.all(OP.concat([THREE_URL], overview()).map(function (u) {
      return c.add(u).catch(function () { }); })); }); }).then(function () {
    return self.skipWaiting(); })); }); self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
}); self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url); if (r.method !== "GET") return;
    /* サイト本体：通信できれば最新を使い、できなければ保存した版を出す */
    if (r.mode === "navigate" || u.origin === location.origin) {
      var key = r.mode === "navigate" ? "./" : r; e.respondWith(fetch(r).then(function (res) { if (res.ok) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(key, cp); }); } return res; }).catch(function () { return caches.match(key, { ignoreSearch: true }); })); return; }

/* 3D表示・オープニングの部品と写真、書体：保存があればそれを使い、なければ読んで保存する */
    if (u.hostname === "cyberjapandata.gsi.go.jp" || u.hostname === "cdn.jsdelivr.net" || u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") { e.respondWith(caches.match(r, { ignoreVary: true }).then(function (hit) { return hit || fetch(r).then(function (res) { if (res.ok) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); } return res; }); })); }
});
