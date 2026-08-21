const CACHE='study-tracker-v22';
const ASSETS=['./','./index.html','./styles.css','./enhancements.css','./jobs.js','./family.js','./app.js','./config.js','./manifest.webmanifest','./pawan-kumar-siddh.jpg','./study-tracker-job-capture.zip'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request))));
