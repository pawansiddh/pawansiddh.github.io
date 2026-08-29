(async()=>{
  const T0=performance.now();
  const report={version:'finance-demo2-consolidated-r2',startedAt:new Date().toISOString(),loaded:[],failed:[],skipped:['patch6 (known malformed and never part of effective Demo 2 runtime)'],unpacked:[],transforms:[],timings:{}};
  window.__PV_BOOT_REPORT__=report;
  const onBootError=e=>report.failed.push({name:'runtime',stage:'window-error',error:String(e?.error||e?.message||'Unknown runtime error')});
  const onBootRejection=e=>report.failed.push({name:'runtime',stage:'unhandled-rejection',error:String(e?.reason||'Unhandled rejection')});
  window.addEventListener('error',onBootError);window.addEventListener('unhandledrejection',onBootRejection);
  const mark=(name,t)=>{report.timings[name]=Math.round(performance.now()-t)};
  const fetchText=async(name,url,required=false)=>{
    const t=performance.now();
    try{const r=await fetch(url,{cache:'default'});if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);const text=await r.text();mark(`fetch:${name}`,t);return{text,name,url,required}}
    catch(error){mark(`fetch:${name}`,t);report.failed.push({name,url,stage:'fetch',error:String(error)});(required?console.error:console.warn)(`PAVENRO ${required?'required':'optional'} asset failed: ${name}`,error);return{text:'',name,url,required,error}}
  };
  const exec=(name,text)=>{if(!text)return false;const t=performance.now();try{const s=document.createElement('script');s.textContent=`${text}\n//# sourceURL=${name}.js`;document.documentElement.appendChild(s);s.remove();report.loaded.push(name);mark(`exec:${name}`,t);return true}catch(error){report.failed.push({name,stage:'execute',error:String(error)});console.error(`PAVENRO ${name} execution failed`,error);return false}};
  const style=(name,text)=>{if(!text)return false;try{const s=document.createElement('style');s.dataset.pvBundle=name;s.textContent=text;document.head.appendChild(s);report.loaded.push(name);return true}catch(error){report.failed.push({name,stage:'style',error:String(error)});return false}};
  const gunzipBase64=async(name,packed)=>{const t=performance.now(),bytes=Uint8Array.from(atob(packed),c=>c.charCodeAt(0)),ds=new DecompressionStream('gzip'),js=await new Response(new Blob([bytes]).stream().pipeThrough(ds)).text();mark(`decode:${name}`,t);return js};
  const runPacked=async(name,parts)=>{if(parts.some(x=>!x))return false;try{return exec(name,await gunzipBase64(name,parts.join('').trim()))}catch(error){report.failed.push({name,stage:'decode',error:String(error)});console.error(`PAVENRO ${name} decode failed`,error);return false}};
  const unwrapRuntime=async(name,text)=>{if(!text||!text.includes('DecompressionStream'))return text;const m=text.match(/const\s+P=['"]([A-Za-z0-9+/=]+)['"]/);if(!m)return text;try{const js=await gunzipBase64(name,m[1]);report.unpacked.push(name);return js}catch(error){report.failed.push({name,stage:'unwrap',error:String(error)});console.error(`PAVENRO ${name} wrapper unpack failed`,error);return text}};
  const replace=(name,js,from,to,label)=>{if(js.includes(from)){report.transforms.push(`${name}:${label}`);return js.replace(from,to)}return js};
  const prepareSource=(name,text)=>{
    let js=text;
    if(name==='phase1-core2'){
      js=replace(name,js,"setInterval(mount,900);setTimeout(mount,250);","document.addEventListener('click',e=>{if(e.target.closest('#pvSide .nav-btn,.sidebar .nav-btn,[data-nav]'))setTimeout(mount,90)},true);window.addEventListener('pavenro:local-write',()=>setTimeout(mount,90));setInterval(mount,5000);setTimeout(mount,160);",'event-refresh');
    }
    if(name==='phase1-planning'){
      js=replace(name,js,"function mount(force=false){const v=view();if(v==='calendar')action('cal','+ Add event',()=>form('calendar'));else if(v==='subscriptions')action('sub','+ Add subscription',()=>form('subscriptions'));else if(v==='net worth')action('asset','+ New asset',()=>form('assets'));else if(v==='investments')action('inv','+ New investment',()=>form('investments'));else return clear();draw(v)}","function mount(force=false){const v=view();if(v==='calendar'){clear();return}if(v==='subscriptions')action('sub','+ Add subscription',()=>form('subscriptions'));else if(v==='net worth')action('asset','+ New asset',()=>form('assets'));else if(v==='investments')action('inv','+ New investment',()=>form('investments'));else return clear();draw(v)}",'calendar-studio-owns-calendar');
      js=replace(name,js,"setInterval(mount,900);setTimeout(()=>mount(true),300);","document.addEventListener('click',e=>{if(e.target.closest('#pvSide .nav-btn,.sidebar .nav-btn,[data-nav]'))setTimeout(()=>mount(true),90)},true);window.addEventListener('pavenro:local-write',()=>setTimeout(()=>mount(true),90));setInterval(mount,5000);setTimeout(()=>mount(true),180);",'event-refresh');
    }
    if(name==='phase1-records'){
      js=replace(name,js,"setInterval(mount,900);setTimeout(()=>mount(true),320);","document.addEventListener('click',e=>{if(e.target.closest('#pvSide .nav-btn,.sidebar .nav-btn,[data-nav]'))setTimeout(()=>mount(true),90)},true);window.addEventListener('pavenro:local-write',()=>setTimeout(()=>mount(true),90));setInterval(mount,5000);setTimeout(()=>mount(true),190);",'event-refresh');
    }
    if(name==='phase1-status'){
      js=replace(name,js,"setInterval(mount,900);","window.addEventListener('pavenro:local-write',()=>setTimeout(mount,90));setInterval(mount,3000);",'status-safety-interval');
    }
    if(name==='interaction-audit'){
      js=replace(name,js,"function intercept(e){const b=e.target.closest('button');if(!b)return false;const txt=N(b.textContent),v=view(),title=detailTitle()||'Selected record';","function intercept(e){const b=e.target.closest('button');if(!b)return false;if(b.matches('.pv-p1-action,.pv-c2-action,.pv-pl-action,.pv-r-action')||b.closest('.pv-p1-modal,.pv-c2-modal,.pv-pl-modal,.pv-r-modal,.pv-pl-panel,.pv-r-panel'))return false;const txt=N(b.textContent),v=view(),title=detailTitle()||'Selected record';",'fallback-only');
      js=replace(name,js,"setTimeout(inject,300);setInterval(inject,1200);","setTimeout(inject,220);setInterval(inject,5000);",'slow-safety-interval');
    }
    if(name==='daily-briefing-r2'){
      js=replace(name,js,"setInterval(()=>{mountTopbar();mountSettings()},1200);","setInterval(()=>{mountTopbar();mountSettings()},5000);",'slow-safety-interval');
    }
    if(name==='phase2-r1'){
      js=replace(name,js,"setTimeout(mount,250);setInterval(mount,700);document.addEventListener('change',()=>setTimeout(mount,50),true);","document.addEventListener('click',e=>{if(e.target.closest('#pvSide .nav-btn,.sidebar .nav-btn,[data-nav]'))setTimeout(mount,90)},true);window.addEventListener('pavenro:local-write',()=>setTimeout(mount,90));setTimeout(mount,210);setInterval(mount,3000);document.addEventListener('change',()=>setTimeout(mount,50),true);",'event-refresh');
    }
    if(name==='brand-sidebar-r1'){
      js=replace(name,js,"setInterval(install,1400);","setInterval(install,5000);",'slow-safety-interval');
    }
    if(name==='ui-controls-r1'){
      if(window.__PV_COEDIT_AUDIT_ACTIVE__){
        js=replace(name,js,"function recordAudit(action,section=currentSection(),extra={}){","function recordAudit(action,section=currentSection(),extra={}){if(window.__PV_COEDIT_AUDIT_ACTIVE__)return;",'coedit-record-owner');
        js=replace(name,js,"if(b.id==='pvAuditBtn'){e.preventDefault();e.stopImmediatePropagation();openAudit();return}","if(b.id==='pvAuditBtn'&&!window.__PV_COEDIT_AUDIT_ACTIVE__){e.preventDefault();e.stopImmediatePropagation();openAudit();return}",'coedit-button-owner');
      }
      js=replace(name,js,"ensureAuditSeed();setTimeout(mount,450);setInterval(mount,900);","ensureAuditSeed();setTimeout(mount,300);setInterval(mount,3000);",'slow-safety-interval');
    }
    return js;
  };
  const execAsset=async(name,text)=>exec(name,prepareSource(name,await unwrapRuntime(name,text)));
  const reveal=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{
    document.documentElement.classList.remove('pv-demo2-booting');document.dispatchEvent(new CustomEvent('pavenro:ready'));
    report.totalMs=Math.round(performance.now()-T0);report.readyAt=new Date().toISOString();document.documentElement.dataset.pvBootMs=String(report.totalMs);
    setTimeout(()=>{const h={stateBridge:document.documentElement.dataset.pvStateBridge==='ready'&&!!window.__PV_FIN_STATE__,phase1:document.documentElement.dataset.pvPhase1==='r3',phase2:document.documentElement.dataset.pvPhase2==='r1',dailyBriefing:!!window.PavenroDailyBriefing,offlineSync:!!window.PavenroOfflineSync,theme:!!window.__PAVENRO_THEME_STUDIO_R1__,brand:!!window.__PAVENRO_BRAND_SIDEBAR_R1__,uiControls:document.documentElement.dataset.pvUiControls==='r1',coeditHistory:!!window.__PV_COEDIT_AUDIT_ACTIVE__,changeHistoryButton:!!document.getElementById('pvAuditBtn'),sidebar:!!document.querySelector('#pvSide,.sidebar'),topbar:!!document.querySelector('.topbar')};report.health=h;report.healthy=Object.values(h).every(Boolean)&&!report.failed.some(x=>['execute','decode','unwrap','window-error','unhandled-rejection'].includes(x.stage));document.documentElement.dataset.pvRuntimeHealth=report.healthy?'ok':'check';if(!report.healthy)console.warn('PAVENRO runtime health check',report);window.dispatchEvent(new CustomEvent('pavenro:runtime-health',{detail:report}))},1200);
    window.dispatchEvent(new CustomEvent('pavenro:boot-complete',{detail:report}));
  },90)));

  const assetDefs=[
    ...Array.from({length:4},(_,i)=>[`patch4-${i}`,`patch/${i}.txt?v=finance-patch-v4-20260827`,true]),['patch-v5','patch-v5.js?v=finance-v5-20260827a',true],['baseline-js','finance-baseline-v3.js?v=finance-final-audit-r3-20260827',true],['baseline-css','finance-baseline-v3.css?v=finance-final-audit-r3-20260827',true],['search-r3c','finance-search-controller-r3.js?v=finance-search-hard-r3c-categories-icons-r1-20260828',true],['sidebar-css','finance-sidebar-clean-r1.css?v=finance-sidebar-clean-r1-20260828',true],['debt-r1','finance-debt-lab-r1.js?v=finance-debt-control-r1-20260828b',false],['theme-r1','finance-theme-studio-r1.js?v=finance-theme-studio-r1-20260828',false],['bell-r1','finance-bell-contrast-r1.js?v=finance-bell-contrast-r1-20260828',false],['state-bridge','finance-state-bridge-r1.js?v=finance-state-bridge-r1-20260828',true],['phase1-r3','finance-phase1-r3.js?v=finance-phase1-r3-20260828a',false],['phase1-core2','finance-phase1-core2-r1.js?v=finance-phase1-core2-r1-20260828',false],['phase1-planning','finance-phase1-planning-r1.js?v=finance-phase1-planning-r1-20260828',false],['phase1-records','finance-phase1-records-r1.js?v=finance-phase1-records-r1-20260828',false],['phase1-status','finance-phase1-status-fix-r1.js?v=finance-phase1-status-fix-r1-20260828',false],['interaction-audit','finance-interaction-audit-r1.js?v=finance-interaction-audit-r1-20260828',false],['daily-briefing-r2','finance-daily-briefing-r2.js?v=finance-daily-briefing-r2-20260828a',false],['calendar-studio-r1','finance-calendar-studio-r1.js?v=finance-calendar-studio-r1-20260828a',false],['coedit-audit-r1','finance-coedit-audit-r1.js?v=finance-coedit-audit-r1-20260829a',false],['offline-sync-r1','finance-offline-sync-r1.js?v=finance-offline-sync-r1-20260829a',false],['phase2-r1','finance-phase2-r1.js?v=finance-phase2-r1-20260829a',false],['brand-sidebar-r1','finance-brand-sidebar-r1.js?v=finance-brand-sidebar-r1-20260829a',false],['ui-controls-r1','finance-ui-controls-r1.js?v=finance-ui-controls-r1-20260829a',false]
  ];
  const fetched=await Promise.all(assetDefs.map(([n,u,r])=>fetchText(n,u,r))),A=Object.fromEntries(fetched.map(x=>[x.name,x.text]));
  try{
    await runPacked('finance-patch-v4',[A['patch4-0'],A['patch4-1'],A['patch4-2'],A['patch4-3']]);await execAsset('finance-patch-v5',A['patch-v5']);await execAsset('finance-baseline-v3',A['baseline-js']);style('finance-baseline-v3-css',A['baseline-css']);await execAsset('finance-search-r3c',A['search-r3c']);style('finance-sidebar-clean-r1-css',A['sidebar-css']);await execAsset('finance-debt-lab-r1',A['debt-r1']);await execAsset('finance-theme-studio-r1',A['theme-r1']);await execAsset('finance-bell-contrast-r1',A['bell-r1']);
    const finalOrder=['state-bridge','phase1-r3','phase1-core2','phase1-planning','phase1-records','phase1-status','interaction-audit','daily-briefing-r2','calendar-studio-r1','coedit-audit-r1','offline-sync-r1','phase2-r1','brand-sidebar-r1','ui-controls-r1'];
    for(const name of finalOrder){await execAsset(name,A[name]);if(name==='coedit-audit-r1'){window.__PV_COEDIT_AUDIT_ACTIVE__=!!document.getElementById('pvAuditBtn');report.coeditOwner=window.__PV_COEDIT_AUDIT_ACTIVE__?'coedit-audit-r1':'ui-controls-fallback'}}
  }catch(error){report.failed.push({name:'bootstrap',stage:'bootstrap',error:String(error)});console.error('PAVENRO consolidated bootstrap failed',error)}finally{reveal()}
})();
