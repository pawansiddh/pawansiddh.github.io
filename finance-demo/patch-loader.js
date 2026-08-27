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
  try{
    await runPacked('patch',4,'finance-patch-v4-20260827','finance-patch-v4');
    await loadScript('patch-v5.js?v=finance-v5-20260827a');
    await runPacked('patch6',4,'finance-v6-20260827','finance-patch-v6');
    await loadScript('finance-baseline-v3.js?v=finance-final-audit-r3-20260827');
  }catch(e){
    console.error('PAVENRO Finance final audited bootstrap failed',e);
    try{await loadScript('finance-baseline-v3.js?v=finance-final-audit-r3-20260827-fallback')}catch(_){ }
  }
})();
