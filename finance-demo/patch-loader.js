(async()=>{
  try{
    const parts=await Promise.all([0,1,2,3].map(i=>fetch(`patch/${i}.txt?v=finance-patch-v4-20260827`).then(r=>{if(!r.ok)throw new Error(`patch ${i} ${r.status}`);return r.text()})));
    const packed=parts.join('').trim();
    const bytes=Uint8Array.from(atob(packed),c=>c.charCodeAt(0));
    const ds=new DecompressionStream('gzip');
    const js=await new Response(new Blob([bytes]).stream().pipeThrough(ds)).text();
    const script=document.createElement('script');
    script.textContent=js+'\n//# sourceURL=finance-patch-v4.js';
    document.documentElement.appendChild(script);
    script.remove();
  }catch(e){console.error('PAVENRO Finance base patch failed',e);}
  finally{
    const load=(src,key)=>{if(window[key])return;window[key]=true;const s=document.createElement('script');s.src=src;s.async=false;s.onerror=e=>console.error('PAVENRO Finance module failed',src,e);document.head.appendChild(s)};
    load('patch6-loader.js?v=finance-v6-clean-20260827','__PAVENRO_V6_CLEAN__');
    load('finance-ui-v9.js?v=finance-ui-v9-20260827','__PAVENRO_UI_V9_BRIDGE__');
  }
})();
