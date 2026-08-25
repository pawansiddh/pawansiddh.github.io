const CACHE='nestlyra-focus-v33-groups';
const ASSETS=['./','./index.html','./styles.css','./enhancements.css','./tracker-update.css','./jobs.js','./family.js','./messaging.js','./groups.js','./app.js','./tracker-modules.js','./config.js','./manifest.webmanifest','./pawan-kumar-siddh.jpg','./podgiftcreations-logo.png','./nestlyra-logo.svg','./nestlyra-logo.png','./nestlyra-icon-192.png','./nestlyra-icon-512.png','./supabase-groups-migration.sql','./supabase-messaging-hotfix.sql','./supabase-tracker-v31-hotfix.sql','./nestlyra-focus-job-capture.zip'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request))));
