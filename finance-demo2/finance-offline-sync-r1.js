(()=>{
  if(window.__PAVENRO_OFFLINE_SYNC_R1__) return;
  window.__PAVENRO_OFFLINE_SYNC_R1__=true;
  const DB='pavenro-finance-offline-r1', STORE='outbox';
  const TRACK=/^(pv-fin-live|pavenro\.finance\.|pavenro-finance)/i;
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const ws=()=>String(window.__PV_WORKSPACE_ID__||window.state?.workspaceId||window.S?.workspaceId||localStorage.getItem('pavenro.finance.workspace.id')||'local-workspace');
  function db(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'key'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
  async function queue(key,value){if(!TRACK.test(key)||/audit\.lastread|theme|briefing|search|sidebar/i.test(key))return;try{const d=await db();const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put({key,workspaceId:ws(),value,updatedAt:new Date().toISOString(),status:'pending'});await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});window.dispatchEvent(new CustomEvent('pavenro:sync-status'));}catch(e){console.warn('PAVENRO offline queue',e)}}
  async function pending(){try{const d=await db();return await new Promise((res,rej)=>{const r=d.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>res((r.result||[]).filter(x=>x.workspaceId===ws()));r.onerror=()=>rej(r.error)})}catch(_){return[]}}
  async function remove(key){try{const d=await db();const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(key);return new Promise(res=>{tx.oncomplete=res;tx.onerror=res})}catch(_){}}
  let flushing=false;
  async function flush(){if(flushing||!navigator.onLine)return;const adapter=window.__PV_DRIVE_SYNC_ADAPTER__||window.__PV_FIN_SYNC_ADAPTER__;if(!adapter?.pushKV&&!adapter?.pushSnapshot)return;flushing=true;try{for(const x of await pending()){try{if(adapter.pushKV)await adapter.pushKV({workspaceId:x.workspaceId,key:x.key,value:x.value,updatedAt:x.updatedAt});else await adapter.pushSnapshot(x);await remove(x.key)}catch(e){console.warn('PAVENRO Drive-first sync item',x.key,e);break}}}finally{flushing=false;window.dispatchEvent(new CustomEvent('pavenro:sync-status'))}}
  const nativeSet=Storage.prototype.setItem;
  if(!Storage.prototype.__pvOfflineWrapped){Storage.prototype.setItem=function(k,v){const out=nativeSet.call(this,k,v);if(this===localStorage&&TRACK.test(String(k))){window.__PV_FIN_LAST_WRITE__=Date.now();window.dispatchEvent(new CustomEvent('pavenro:local-write',{detail:{key:String(k)}}));queue(String(k),String(v));}return out};Storage.prototype.__pvOfflineWrapped=true}
  function ensureStatus(){const top=q('.topbar');if(!top)return;let b=q('#pvOfflineSyncStatus');if(!b){b=document.createElement('button');b.id='pvOfflineSyncStatus';b.type='button';b.style.cssText='height:36px;min-width:36px;border:1px solid var(--border,#d8e2da);border-radius:10px;background:var(--panel2,#eef3ef);color:var(--text,#17301f);font:700 11px system-ui;display:inline-flex;align-items:center;justify-content:center;gap:5px;flex:0 0 auto;cursor:default';const bell=qa('button',top).find(x=>/notif|bell/i.test(`${x.title||''} ${x.getAttribute('aria-label')||''}`));bell?top.insertBefore(b,bell):top.appendChild(b)}updateStatus(b)}
  async function updateStatus(b=q('#pvOfflineSyncStatus')){if(!b)return;const n=(await pending()).length;if(!navigator.onLine){b.innerHTML='☁<span style="font-size:8px">OFF</span>';b.title=`Offline — ${n} local change${n===1?'':'s'} waiting. You can keep working.`;b.style.opacity='1'}else if(n){b.innerHTML=`☁<span style="font-size:8px">${n>99?'99+':n}</span>`;b.title=window.__PV_DRIVE_SYNC_ADAPTER__?'Online — syncing local changes to Google Drive':'Online — changes are safe locally; Drive sync activates when the workspace Drive adapter is connected.'}else{b.innerHTML='☁✓';b.title=window.__PV_DRIVE_SYNC_ADAPTER__?'Online — synced':'Online — local data ready'} }
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js?v=finance-demo2-r4-consolidated-20260829').catch(e=>console.warn('PAVENRO service worker',e));
  window.addEventListener('online',()=>{ensureStatus();flush()});window.addEventListener('offline',ensureStatus);window.addEventListener('pavenro:sync-status',ensureStatus);
  window.PavenroOfflineSync={pending,flush,status:()=>({online:navigator.onLine,workspaceId:ws()})};
  setTimeout(()=>{ensureStatus();flush()},350);setInterval(ensureStatus,5000);
})();
