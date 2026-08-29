(()=>{
  if(window.__PAVENRO_COEDIT_AUDIT_R1__)return;
  window.__PAVENRO_COEDIT_AUDIT_R1__=true;
  window.__PV_COEDIT_AUDIT_ACTIVE__=true;
  document.documentElement.dataset.pvCoeditAudit='r1';

  const KEY='pavenro.finance.coedit.audit.r1';
  const LEGACY_KEY='pavenro.finance.audit.r2';
  const READ_KEY='pavenro.finance.audit.lastread.r1';
  const LIMIT=500;
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const norm=v=>String(v??'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[m]));
  let writing=false,pending=null,lastSig='',lastAt=0;

  function core(){return window.__PV_FIN_STATE__||window.state||window.S||null}
  function workspaceId(){return String(window.__PV_WORKSPACE_ID__||core()?.workspaceId||localStorage.getItem('pavenro.finance.workspace.id')||'local-workspace')}
  function actor(){
    const s=core(),visible=qa('input').find(i=>/display name/i.test(i.closest('label,.field,.form-row,.setting-row')?.textContent||'')&&i.value?.trim());
    if(visible)return visible.value.trim();
    const n=s?.settings?.displayName||s?.profile?.displayName||s?.profile?.name||s?.user?.name||s?.displayName;
    if(n)return String(n);
    try{const p=JSON.parse(localStorage.getItem('pavenro.finance.profile')||'{}');if(p?.name)return String(p.name)}catch(_){}
    return 'Local user';
  }
  function section(){return norm(q('#pvTop .pv-title,.topbar .pv-title,.workspace h1,.content h1')?.textContent||'Finance')||'Finance'}
  function loadRaw(key){try{const a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
  function normalizeRow(x){return{id:String(x.id||`chg-${Date.now()}-${Math.random().toString(36).slice(2,7)}`),at:String(x.at||x.createdAt||new Date().toISOString()),who:String(x.who||x.actor||'Local user'),section:String(x.section||'Finance'),action:String(x.action||x.message||'Updated finance data'),mode:String(x.mode||'Local'),workspace:String(x.workspace||x.workspaceId||workspaceId()),key:String(x.key||'')}}
  function history(){
    const current=loadRaw(KEY).map(normalizeRow);
    if(current.length)return current.sort((a,b)=>String(b.at).localeCompare(String(a.at))).slice(0,LIMIT);
    const legacy=loadRaw(LEGACY_KEY).map(normalizeRow);
    if(legacy.length){save(legacy);return legacy.slice(0,LIMIT)}
    return [];
  }
  function save(rows){writing=true;try{localStorage.setItem(KEY,JSON.stringify(rows.slice(0,LIMIT)))}finally{setTimeout(()=>writing=false,0)}}
  function record(action,sec=section(),extra={}){
    action=norm(action)||'Updated finance data';sec=norm(sec)||'Finance';
    const sig=`${sec}|${action}|${extra.key||''}`;const now=Date.now();if(sig===lastSig&&now-lastAt<600)return;
    lastSig=sig;lastAt=now;
    const rows=history();rows.unshift({id:`chg-${now}-${Math.random().toString(36).slice(2,7)}`,at:new Date(now).toISOString(),who:actor(),section:sec,action,mode:navigator.onLine?'Online':'Offline',workspace:workspaceId(),key:String(extra.key||'')});
    save(rows);updateBadge();window.dispatchEvent(new CustomEvent('pavenro:audit-write',{detail:rows[0]}));
  }
  function lastRead(){try{return Number(localStorage.getItem(READ_KEY)||0)||0}catch(_){return 0}}
  function unread(){const t=lastRead();return history().filter(x=>new Date(x.at).getTime()>t).length}
  function markRead(){try{localStorage.setItem(READ_KEY,String(Date.now()))}catch(_){}updateBadge()}

  const css=document.createElement('style');css.id='pv-coedit-audit-r1-style';css.textContent=`
    #pvAuditBtn{position:relative;width:36px;height:36px;min-width:36px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:10px;background:var(--pvx-panel2,var(--panel2,#eef3ef));color:var(--pvx-text,var(--text,#17301f));display:inline-grid;place-items:center;cursor:pointer;font:800 15px system-ui;flex:0 0 36px}
    #pvAuditBtn .pv-audit-count{position:absolute;right:-4px;top:-4px;min-width:15px;height:15px;padding:0 3px;border-radius:999px;display:grid;place-items:center;background:var(--pvx-brand,var(--brand,#21653f));color:#fff;border:2px solid var(--pvx-panel,var(--panel,#fff));font:800 7px system-ui;box-sizing:border-box}
    .pv-ca-shade{position:fixed;inset:0;z-index:2147483550;background:#07130d88;display:grid;place-items:center;padding:18px}.pv-ca-box{width:min(960px,96vw);max-height:90vh;overflow:hidden;display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:16px;background:var(--pvx-panel,var(--panel,#fff));color:var(--pvx-text,var(--text,#17301f));box-shadow:0 24px 70px #0005}.pv-ca-head{display:flex;align-items:flex-start;gap:10px;padding:15px 17px 11px;border-bottom:1px solid var(--pvx-border,var(--border,#d8e3da))}.pv-ca-head h2{margin:0;font:800 20px var(--pvx-heading-font,Georgia,serif)}.pv-ca-head p{margin:4px 0 0;color:var(--pvx-muted,var(--muted,#68756c));font:500 9px/1.45 system-ui}.pv-ca-close{margin-left:auto;width:31px;height:31px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:8px;background:var(--pvx-panel2,var(--panel2,#eef3ef));color:inherit;cursor:pointer}.pv-ca-tools{display:flex;gap:7px;align-items:center;padding:9px 15px;border-bottom:1px solid var(--pvx-border,var(--border,#e5ebe6));background:var(--pvx-panel2,var(--panel2,#f4f7f4))}.pv-ca-tools input,.pv-ca-tools select{height:31px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:8px;background:var(--pvx-panel,var(--panel,#fff));color:inherit;padding:0 9px;font:600 9px system-ui}.pv-ca-tools input{min-width:220px}.pv-ca-scroll{overflow:auto;padding:0 15px 10px}.pv-ca-table{width:100%;border-collapse:collapse;font:500 9px/1.4 system-ui}.pv-ca-table th,.pv-ca-table td{padding:8px 7px;border-bottom:1px solid var(--pvx-border,var(--border,#e5ebe6));text-align:left;vertical-align:top}.pv-ca-table th{position:sticky;top:0;z-index:1;background:var(--pvx-panel,var(--panel,#fff));color:var(--pvx-muted,var(--muted,#68756c));font-size:8px;text-transform:uppercase}.pv-ca-table td b{font-size:9px}.pv-ca-empty{padding:30px;text-align:center;color:var(--pvx-muted,var(--muted,#68756c));font:500 10px system-ui}.pv-ca-foot{display:flex;align-items:center;gap:8px;padding:10px 15px;border-top:1px solid var(--pvx-border,var(--border,#e5ebe6));color:var(--pvx-muted,var(--muted,#68756c));font:500 8px system-ui}.pv-ca-btn{height:30px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:8px;background:var(--pvx-panel2,var(--panel2,#eef3ef));color:inherit;padding:0 9px;cursor:pointer;font:700 8px system-ui}.pv-ca-foot .spacer{flex:1}@media(max-width:700px){.pv-ca-tools{flex-wrap:wrap}.pv-ca-tools input{min-width:0;flex:1}.pv-ca-table th:nth-child(5),.pv-ca-table td:nth-child(5){display:none}}
  `;document.head.appendChild(css);

  function ensureButton(){
    const top=q('.topbar');if(!top)return null;let b=q('#pvAuditBtn');if(!b){b=document.createElement('button');b.id='pvAuditBtn';b.type='button';b.className='pv-p2-audit-visible';b.innerHTML='↻';b.title='Change history — who changed what and when';b.setAttribute('aria-label','Open change history');const bell=qa('button',top).find(x=>/notif|bell/i.test(`${x.title||''} ${x.getAttribute('aria-label')||''}`));bell?top.insertBefore(b,bell):top.appendChild(b);b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open()})}updateBadge();return b
  }
  function updateBadge(){const b=q('#pvAuditBtn');if(!b)return;const n=unread();let x=q('.pv-audit-count',b);if(n){if(!x){x=document.createElement('span');x.className='pv-audit-count';b.appendChild(x)}x.textContent=n>99?'99+':String(n)}else x?.remove()}
  function csv(rows){const data=[['When','Who','Section','Change','Mode','Workspace'],...rows.map(x=>[x.at,x.who,x.section,x.action,x.mode,x.workspace])],text=data.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n'),blob=new Blob([text],{type:'text/csv'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`PAVENRO-Finance-Change-History-${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)}
  function open(){
    q('.pv-ca-shade')?.remove();markRead();const all=history(),shade=document.createElement('div');shade.className='pv-ca-shade';shade.innerHTML=`<div class="pv-ca-box"><div class="pv-ca-head"><div><h2>Change history</h2><p>Who changed what and when. History is stored locally first and follows the active PAVENRO workspace when sync is available.</p></div><button class="pv-ca-close" type="button">×</button></div><div class="pv-ca-tools"><input type="search" placeholder="Search changes…" data-ca-search><select data-ca-section><option value="">All sections</option>${[...new Set(all.map(x=>x.section).filter(Boolean))].sort().map(x=>`<option>${esc(x)}</option>`).join('')}</select><select data-ca-person><option value="">All people</option>${[...new Set(all.map(x=>x.who).filter(Boolean))].sort().map(x=>`<option>${esc(x)}</option>`).join('')}</select></div><div class="pv-ca-scroll" data-ca-list></div><div class="pv-ca-foot"><span data-ca-count></span><span class="spacer"></span><button class="pv-ca-btn" data-ca-export type="button">Export CSV</button><button class="pv-ca-btn" data-ca-clear type="button">Clear local history</button></div></div>`;document.body.appendChild(shade);
    const search=q('[data-ca-search]',shade),sec=q('[data-ca-section]',shade),person=q('[data-ca-person]',shade),host=q('[data-ca-list]',shade),count=q('[data-ca-count]',shade);
    const draw=()=>{const term=search.value.trim().toLowerCase(),rows=history().filter(x=>(!sec.value||x.section===sec.value)&&(!person.value||x.who===person.value)&&(!term||`${x.who} ${x.section} ${x.action} ${x.mode}`.toLowerCase().includes(term)));count.textContent=`${rows.length} change${rows.length===1?'':'s'} · latest ${LIMIT} kept locally`;host.innerHTML=rows.length?`<table class="pv-ca-table"><thead><tr><th>When</th><th>Who</th><th>Section</th><th>Change</th><th>Mode</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(new Date(x.at).toLocaleString())}</td><td><b>${esc(x.who)}</b></td><td>${esc(x.section)}</td><td>${esc(x.action)}</td><td>${esc(x.mode)}</td></tr>`).join('')}</tbody></table>`:'<div class="pv-ca-empty">No matching changes yet.</div>'};
    search.oninput=draw;sec.onchange=draw;person.onchange=draw;draw();
    const close=()=>shade.remove();q('.pv-ca-close',shade).onclick=close;shade.onclick=e=>{if(e.target===shade)close()};q('[data-ca-export]',shade).onclick=()=>csv(history());q('[data-ca-clear]',shade).onclick=()=>{if(confirm('Clear the local change history for this browser?')){save([]);markRead();draw()}};
  }

  function actionFromButton(b){const t=norm(b.textContent||b.title||'');if(!t)return'';if(/add|new|save|delete|remove|edit|update|paid|received|contribute|transfer|upload|create|generate|archive|restore|mark|cancel|pin|change link/i.test(t))return t;return''}
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.id==='pvAuditBtn'||b.closest('.pv-ca-shade'))return;const action=actionFromButton(b);if(action)pending={action,section:section(),at:Date.now()};if(b.closest('#pvSide,.sidebar,[data-nav]'))setTimeout(ensureButton,90)},true);
  document.addEventListener('submit',e=>{const modal=e.target.closest('[class*=modal],.modal,.pv-p1-modal,.pv-c2-modal,.pv-pl-modal,.pv-r-modal,.pv-ia-modal,.pv-p2-modal,.pv-cal-modal'),title=norm(q('h1,h2,h3',modal)?.textContent||'record');pending={action:`Saved ${title}`,section:section(),at:Date.now()}},true);
  document.addEventListener('change',e=>{const el=e.target;if(el.matches('select[data-pv-role],select[data-p2-income-status]'))pending={action:`Changed status to ${el.value}`,section:section(),at:Date.now()}},true);
  window.addEventListener('pavenro:local-write',e=>{if(writing||e.detail?.key===KEY||e.detail?.key===READ_KEY)return;const p=pending&&Date.now()-pending.at<3000?pending:null;record(p?.action||'Updated finance data',p?.section||section(),{key:e.detail?.key||''});pending=null});
  window.addEventListener('online',()=>record('Application is online','System'));
  window.addEventListener('offline',()=>record('Application is offline; edits continue locally','System'));
  window.addEventListener('pavenro:ready',ensureButton);
  setTimeout(ensureButton,120);setInterval(ensureButton,5000);
  window.PavenroCoeditAudit={open,record,history,workspaceId,actor};
})();
