/* sw.js — 沖縄旅行計画サイトの圏外対応
   ・ページ本体：通信できればネットから、できなければ保存したものを使う
   ・航空写真タイル（地理院）：一度取ったものは保存して、次から保存分を使う
   ・three.js（jsDelivr）：バージョン固定なので、保存分を優先する
   index.html と同じフォルダに置く（index.html から ./sw.js で登録）。HTTPSで開いたときだけ動く。 */
var VER="okinawa-v1",SHELL="okinawa-shell-"+VER,TILES="okinawa-tiles-"+VER,LIBS="okinawa-libs-"+VER;
var KEEP=[SHELL,TILES,LIBS];

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(SHELL).then(function(c){return c.add("./").catch(function(){})}).then(function(){return self.skipWaiting()}));
});

self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return KEEP.indexOf(k)<0&&k.indexOf("okinawa-")===0}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});

function cacheFirst(req,name){
  return caches.open(name).then(function(c){
    return c.match(req).then(function(hit){
      if(hit)return hit;
      return fetch(req).then(function(res){
        if(res&&(res.ok||res.type==="opaque"))c.put(req,res.clone());
        return res;
      });
    });
  });
}

function networkFirst(req,name){
  return caches.open(name).then(function(c){
    return fetch(req).then(function(res){
      if(res&&res.ok)c.put(req,res.clone());
      return res;
    }).catch(function(){
      return c.match(req).then(function(hit){return hit||c.match("./")}).then(function(hit){return hit||Response.error()});
    });
  });
}

function staleWhileRevalidate(req,name){
  return caches.open(name).then(function(c){
    return c.match(req).then(function(hit){
      var net=fetch(req).then(function(res){if(res&&res.ok)c.put(req,res.clone());return res}).catch(function(){return hit||Response.error()});
      return hit||net;
    });
  });
}

self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET")return;
  var url=new URL(req.url);
  if(url.hostname==="cyberjapandata.gsi.go.jp"){e.respondWith(cacheFirst(req,TILES));return}
  if(url.hostname==="cdn.jsdelivr.net"){e.respondWith(cacheFirst(req,LIBS));return}
  if(url.origin===self.location.origin){
    if(req.mode==="navigate"||(req.headers.get("accept")||"").indexOf("text/html")>=0){e.respondWith(networkFirst(req,SHELL));return}
    if(url.pathname.slice(-6)==="/sw.js")return;
    e.respondWith(staleWhileRevalidate(req,SHELL));
  }
});
