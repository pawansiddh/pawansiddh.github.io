(async()=>{
  const runPacked=async(dir,count,version,label)=>{
    const parts=await Promise.all(Array.from({length:count},(_,i)=>fetch(`${dir}/${i}.txt?v=${version}`).then(r=>{if(!r.ok)throw new Error(`${label} payload ${i}: ${r.status}`);return r.text()})));
    const packed=parts.join('').trim();
    const bytes=Uint8Array.from(atob(packed),c=>c.charCodeAt(0));
    const ds=new DecompressionStream('gzip');
    const js=await new Response(new Blob([bytes]).stream().pipeThrough(ds)).text();
    const script=document.createElement('script');
    script.textContent=js+`\n//# sourceURL=${label}.js`;
    document.documentElement.appendChild(script);
    script.remove();
  };
  const loadScript=src=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error(`Failed to load ${src}`));document.head.appendChild(s);
  });
  const loadStyle=href=>new Promise((resolve,reject)=>{
    const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.onload=resolve;l.onerror=()=>reject(new Error(`Failed to load ${href}`));document.head.appendChild(l);
  });
  const reveal=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{
    document.documentElement.classList.remove('pv-demo2-booting');
    document.dispatchEvent(new CustomEvent('pavenro:ready'));
  },80)));

  try{
    await runPacked('patch',4,'finance-patch-v4-20260827','finance-patch-v4');
    await loadScript('patch-v5.js?v=finance-v5-20260827a');
    await runPacked('patch6',4,'finance-v6-20260827','finance-patch-v6');
    await loadScript('finance-baseline-v3.js?v=finance-final-audit-r3-20260827');
    await loadStyle('finance-baseline-v3.css?v=finance-search-hidden-r3b-20260827');
    await loadScript('finance-search-controller-r3.js?v=finance-search-hard-r3c-categories-icons-r1-20260828');
    await loadStyle('finance-sidebar-clean-r1.css?v=finance-sidebar-clean-r1-20260828');
    await loadScript('finance-debt-lab-r1.js?v=finance-debt-control-r1-20260828b');
    await loadScript('finance-theme-studio-r1.js?v=finance-theme-studio-r1-20260828');
    await loadScript('finance-bell-contrast-r1.js?v=finance-bell-contrast-r1-20260828');
  }catch(e){
    console.error('PAVENRO Finance demo2 core bootstrap failed',e);
    try{await loadScript('finance-baseline-v3.js?v=finance-final-audit-r3-20260827-fallback')}catch(_){ }
    try{await loadStyle('finance-baseline-v3.css?v=finance-search-hidden-r3b-20260827-fallback')}catch(_){ }
    try{await loadScript('finance-search-controller-r3.js?v=finance-search-hard-r3c-categories-icons-r1-20260828-fallback')}catch(_){ }
    try{await loadStyle('finance-sidebar-clean-r1.css?v=finance-sidebar-clean-r1-20260828-fallback')}catch(_){ }
    try{await loadScript('finance-debt-lab-r1.js?v=finance-debt-control-r1-20260828b-fallback')}catch(_){ }
    try{await loadScript('finance-theme-studio-r1.js?v=finance-theme-studio-r1-20260828-fallback')}catch(_){ }
    try{await loadScript('finance-bell-contrast-r1.js?v=finance-bell-contrast-r1-20260828-fallback')}catch(_){ }
  }finally{
    document.addEventListener('pavenro:ready',()=>{
      setTimeout(async()=>{
        const phase1=[
          ['finance-state-bridge-r1.js?v=finance-state-bridge-r1-20260828','Finance live state bridge'],
          ['finance-phase1-r3.js?v=finance-phase1-r3-20260828a','Phase 1 base'],
          ['finance-phase1-core2-r1.js?v=finance-phase1-core2-r1-20260828','Phase 1 Income/Goals/Documents'],
          ['finance-phase1-planning-r1.js?v=finance-phase1-planning-r1-20260828','Phase 1 Calendar/Subscriptions/NetWorth/Investments'],
          ['finance-phase1-records-r1.js?v=finance-phase1-records-r1-20260828','Phase 1 Reports/Notes/Tax/Paydays'],
          ['finance-phase1-status-fix-r1.js?v=finance-phase1-status-fix-r1-20260828','Phase 1 status persistence fix'],
          ['finance-interaction-audit-r1.js?v=finance-interaction-audit-r1-20260828','Phase 1 interaction audit'],
          ['finance-daily-briefing-r2.js?v=finance-daily-briefing-r2-20260828a','Daily briefing and voice settings R2'],
          ['finance-calendar-studio-r1.js?v=finance-calendar-studio-r1-20260828a','Finance Calendar Studio R1'],
          ['finance-coedit-audit-r1.js?v=finance-coedit-audit-r1-20260829a','Finance Coedit Audit R1'],
          ['finance-offline-sync-r1.js?v=finance-offline-sync-r1-20260829a','Finance Offline-first Sync R1'],
          ['finance-phase2-r1.js?v=finance-phase2-r1-20260829a','Finance Phase 2 R1'],
          ['finance-brand-sidebar-r1.js?v=finance-brand-sidebar-r1-20260829a','PAVENRO sidebar brand R1'],
          ['finance-ui-controls-r1.js?v=finance-ui-controls-r1-20260829a','Finance UI controls R1']
        ];
        for(const [src,label] of phase1){try{await loadScript(src)}catch(err){console.error(`PAVENRO ${label} failed to load`,err)}}
      },140);
    },{once:true});
    reveal();
  }
})();
