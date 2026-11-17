// SurfSmarter – offline cache
const CACHE="surfsmarter-v1";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192-v1.png","./icon-512-v1.png","./icon-512-maskable-v1.png","./apple-touch-icon-v1.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const put=(r,res)=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res};
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  // app files and Open-Meteo forecasts: network first, last copy when offline
  if(u.origin===location.origin||/(^|\.)open-meteo\.com$/.test(u.hostname)){
    e.respondWith(fetch(r).then(res=>res.ok?put(r,res):res).catch(()=>caches.match(r,{ignoreSearch:u.origin===location.origin}).then(m=>m||(u.origin===location.origin?caches.match("./index.html"):Response.error()))));return}
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ // fonts: cache first
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>put(r,res))))}
});
