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
  try{
    await runPacked('patch',4,'finance-patch-v4-20260827','finance-patch-v4');
    await loadScript('patch-v5.js?v=finance-v5-20260827a');
    await runPacked('patch6',4,'finance-v6-20260827','finance-patch-v6');
    await loadScript('finance-baseline-v3.js?v=finance-final-audit-r3-20260827');
    await loadStyle('finance-baseline-v3.css?v=finance-actions-help-r3e-20260828');
    await loadScript('finance-search-controller-r3.js?v=finance-accounts-topbar-r3d-20260828');
    await loadStyle('finance-account-r3f.css?v=finance-account-r3f-20260828');
    await loadScript('finance-ui-r3g.js?v=finance-ui-r3h-20260828');
    await loadStyle('finance-account-snapshot-r3i.css?v=finance-account-snapshot-r3i-20260828');
  }catch(e){
    console.error('PAVENRO Finance final audited bootstrap failed',e);
    try{await loadScript('finance-baseline-v3.js?v=finance-final-audit-r3-20260827-fallback')}catch(_){ }
    try{await loadStyle('finance-baseline-v3.css?v=finance-actions-help-r3e-20260828-fallback')}catch(_){ }
    try{await loadScript('finance-search-controller-r3.js?v=finance-accounts-topbar-r3d-20260828-fallback')}catch(_){ }
    try{await loadStyle('finance-account-r3f.css?v=finance-account-r3f-20260828-fallback')}catch(_){ }
    try{await loadScript('finance-ui-r3g.js?v=finance-ui-r3h-20260828-fallback')}catch(_){ }
    try{await loadStyle('finance-account-snapshot-r3i.css?v=finance-account-snapshot-r3i-20260828-fallback')}catch(_){ }
  }
})();
