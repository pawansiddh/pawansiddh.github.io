(async()=>{
  const T0=performance.now();
  const report={version:'finance-demo2-consolidated-r1c',startedAt:new Date().toISOString(),loaded:[],failed:[],skipped:['patch6 (known malformed and never part of effective Demo 2 runtime)'],unpacked:[],timings:{}};
  window.__PV_BOOT_REPORT__=report;
  const onBootError=e=>report.failed.push({name:'runtime',stage:'window-error',error:String(e?.error||e?.message||'Unknown runtime error')});
  const onBootRejection=e=>report.failed.push({name:'runtime',stage:'unhandled-rejection',error:String(e?.reason||'Unhandled rejection')});
  window.addEventListener('error',onBootError);window.addEventListener('unhandledrejection',onBootRejection);
  const mark=(name,t)=>{report.timings[name]=Math.round(performance.now()-t)};
  const fetchText=async(name,url,required=false)=>{
    const t=performance.now();
    try{
      const r=await fetch(url,{cache:'default'});
      if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);
      const text=await r.text();mark(`fetch:${name}`,t);return{text,name,url,required};
    }catch(error){mark(`fetch:${name}`,t);report.failed.push({name,url,stage:'fetch',error:String(error)});if(required)console.error(`PAVENRO required asset failed: ${name}`,error);else console.warn(`PAVENRO optional asset failed: ${name}`,error);return{text:'',name,url,required,error};}
  };
  const exec=(name,text)=>{
    if(!text)return false;
    const t=performance.now();
    try{const s=document.createElement('script');s.textContent=`${text}\n//# sourceURL=${name}.js`;document.documentElement.appendChild(s);s.remove();report.loaded.push(name);mark(`exec:${name}`,t);return true}catch(error){report.failed.push({name,stage:'execute',error:String(error)});console.error(`PAVENRO ${name} execution failed`,error);return false}
  };
  const style=(name,text)=>{
    if(!text)return false;
    try{const s=document.createElement('style');s.dataset.pvBundle=name;s.textContent=text;document.head.appendChild(s);report.loaded.push(name);return true}catch(error){report.failed.push({name,stage:'style',error:String(error)});return false}
  };
  const gunzipBase64=async(name,packed)=>{
    const t=performance.now();const bytes=Uint8Array.from(atob(packed),c=>c.charCodeAt(0));const ds=new DecompressionStream('gzip');const js=await new Response(new Blob([bytes]).stream().pipeThrough(ds)).text();mark(`decode:${name}`,t);return js;
  };
  const runPacked=async(name,parts)=>{
    if(parts.some(x=>!x))return false;
    try{return exec(name,await gunzipBase64(name,parts.join('').trim()))}catch(error){report.failed.push({name,stage:'decode',error:String(error)});console.error(`PAVENRO ${name} decode failed`,error);return false}
  };
  const unwrapRuntime=async(name,text)=>{
    if(!text||!text.includes("DecompressionStream('gzip')"))return text;
    const m=text.match(/const\s+P=['"]([A-Za-z0-9+/=]+)['"]/);
    if(!m)return text;
    try{const js=await gunzipBase64(name,m[1]);report.unpacked.push(name);return js}catch(error){report.failed.push({name,stage:'unwrap',error:String(error)});console.error(`PAVENRO ${name} wrapper unpack failed`,error);return text}
  };
  const prepareSource=(name,text)=>{
    if(name!=='ui-controls-r1'||!window.__PV_COEDIT_AUDIT_ACTIVE__)return text;
    // Co-edit Audit is the authoritative history owner. UI Controls retains only a fallback history if Co-edit failed.
    return text
      .replace("function recordAudit(action,section=currentSection(),extra={}){", "function recordAudit(action,section=currentSection(),extra={}){if(window.__PV_COEDIT_AUDIT_ACTIVE__)return;")
      .replace("if(b.id==='pvAuditBtn'){e.preventDefault();e.stopImmediatePropagation();openAudit();return}", "if(b.id==='pvAuditBtn'&&!window.__PV_COEDIT_AUDIT_ACTIVE__){e.preventDefault();e.stopImmediatePropagation();openAudit();return}");
  };
  const execAsset=async(name,text)=>{
    let js=await unwrapRuntime(name,text);js=prepareSource(name,js);return exec(name,js);
  };
  const reveal=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{
    document.documentElement.classList.remove('pv-demo2-booting');
    document.dispatchEvent(new CustomEvent('pavenro:ready'));
    report.totalMs=Math.round(performance.now()-T0);report.readyAt=new Date().toISOString();
    document.documentElement.dataset.pvBootMs=String(report.totalMs);
    const health=()=>{
      const h={
        stateBridge:document.documentElement.dataset.pvStateBridge==='ready'&&!!window.__PV_FIN_STATE__,
        phase1:document.documentElement.dataset.pvPhase1==='r3',
        phase2:document.documentElement.dataset.pvPhase2==='r1',
        dailyBriefing:!!window.PavenroDailyBriefing,
        offlineSync:!!window.PavenroOfflineSync,
        theme:!!window.__PAVENRO_THEME_STUDIO_R1__,
        brand:!!window.__PAVENRO_BRAND_SIDEBAR_R1__,
        uiControls:document.documentElement.dataset.pvUiControls==='r1',
        coeditHistory:!!window.__PV_COEDIT_AUDIT_ACTIVE__,
        changeHistoryButton:!!document.getElementById('pvAuditBtn'),
        sidebar:!!document.querySelector('#pvSide,.sidebar'),
        topbar:!!document.querySelector('.topbar')
      };
      report.health=h;report.healthy=Object.values(h).every(Boolean)&&!report.failed.some(x=>x.stage==='execute'||x.stage==='decode'||x.stage==='unwrap'||x.stage==='window-error'||x.stage==='unhandled-rejection');
      document.documentElement.dataset.pvRuntimeHealth=report.healthy?'ok':'check';
      if(!report.healthy)console.warn('PAVENRO runtime health check',report);
      window.dispatchEvent(new CustomEvent('pavenro:runtime-health',{detail:report}));
    };
    setTimeout(health,1200);
    window.dispatchEvent(new CustomEvent('pavenro:boot-complete',{detail:report}));
  },90)));

  const assetDefs=[
    ...Array.from({length:4},(_,i)=>[`patch4-${i}`,`patch/${i}.txt?v=finance-patch-v4-20260827`,true]),
    ['patch-v5','patch-v5.js?v=finance-v5-20260827a',true],
    ['baseline-js','finance-baseline-v3.js?v=finance-final-audit-r3-20260827',true],
    ['baseline-css','finance-baseline-v3.css?v=finance-final-audit-r3-20260827',true],
    ['search-r3c','finance-search-controller-r3.js?v=finance-search-hard-r3c-categories-icons-r1-20260828',true],
    ['sidebar-css','finance-sidebar-clean-r1.css?v=finance-sidebar-clean-r1-20260828',true],
    ['debt-r1','finance-debt-lab-r1.js?v=finance-debt-control-r1-20260828b',false],
    ['theme-r1','finance-theme-studio-r1.js?v=finance-theme-studio-r1-20260828',false],
    ['bell-r1','finance-bell-contrast-r1.js?v=finance-bell-contrast-r1-20260828',false],
    ['state-bridge','finance-state-bridge-r1.js?v=finance-state-bridge-r1-20260828',true],
    ['phase1-r3','finance-phase1-r3.js?v=finance-phase1-r3-20260828a',false],
    ['phase1-core2','finance-phase1-core2-r1.js?v=finance-phase1-core2-r1-20260828',false],
    ['phase1-planning','finance-phase1-planning-r1.js?v=finance-phase1-planning-r1-20260828',false],
    ['phase1-records','finance-phase1-records-r1.js?v=finance-phase1-records-r1-20260828',false],
    ['phase1-status','finance-phase1-status-fix-r1.js?v=finance-phase1-status-fix-r1-20260828',false],
    ['interaction-audit','finance-interaction-audit-r1.js?v=finance-interaction-audit-r1-20260828',false],
    ['daily-briefing-r2','finance-daily-briefing-r2.js?v=finance-daily-briefing-r2-20260828a',false],
    ['calendar-studio-r1','finance-calendar-studio-r1.js?v=finance-calendar-studio-r1-20260828a',false],
    ['coedit-audit-r1','finance-coedit-audit-r1.js?v=finance-coedit-audit-r1-20260829a',false],
    ['offline-sync-r1','finance-offline-sync-r1.js?v=finance-offline-sync-r1-20260829a',false],
    ['phase2-r1','finance-phase2-r1.js?v=finance-phase2-r1-20260829a',false],
    ['brand-sidebar-r1','finance-brand-sidebar-r1.js?v=finance-brand-sidebar-r1-20260829a',false],
    ['ui-controls-r1','finance-ui-controls-r1.js?v=finance-ui-controls-r1-20260829a',false]
  ];
  const fetched=await Promise.all(assetDefs.map(([n,u,r])=>fetchText(n,u,r)));
  const A=Object.fromEntries(fetched.map(x=>[x.name,x.text]));

  try{
    await runPacked('finance-patch-v4',[A['patch4-0'],A['patch4-1'],A['patch4-2'],A['patch4-3']]);
    await execAsset('finance-patch-v5',A['patch-v5']);
    // patch6 is intentionally NOT requested: it is malformed in the repository and the historical loader always fell through to the same baseline below.
    await execAsset('finance-baseline-v3',A['baseline-js']);
    style('finance-baseline-v3-css',A['baseline-css']);
    await execAsset('finance-search-r3c',A['search-r3c']);
    style('finance-sidebar-clean-r1-css',A['sidebar-css']);
    await execAsset('finance-debt-lab-r1',A['debt-r1']);
    await execAsset('finance-theme-studio-r1',A['theme-r1']);
    await execAsset('finance-bell-contrast-r1',A['bell-r1']);

    const finalOrder=['state-bridge','phase1-r3','phase1-core2','phase1-planning','phase1-records','phase1-status','interaction-audit','daily-briefing-r2','calendar-studio-r1','coedit-audit-r1','offline-sync-r1','phase2-r1','brand-sidebar-r1','ui-controls-r1'];
    for(const name of finalOrder){
      await execAsset(name,A[name]);
      if(name==='coedit-audit-r1'){
        // The rich Co-edit engine owns the shared history button when it initialized successfully.
        window.__PV_COEDIT_AUDIT_ACTIVE__=!!document.getElementById('pvAuditBtn');
        report.coeditOwner=window.__PV_COEDIT_AUDIT_ACTIVE__?'coedit-audit-r1':'ui-controls-fallback';
      }
    }
  }catch(error){report.failed.push({name:'bootstrap',stage:'bootstrap',error:String(error)});console.error('PAVENRO consolidated bootstrap failed',error)}finally{
    reveal();
  }
})();
