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
  }catch(e){console.error('PAVENRO Finance patch failed',e);}
})();
