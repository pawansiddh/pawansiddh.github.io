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
    load('finance-ui-v9.js?v=finance-ui-v9-20260827b','__PAVENRO_UI_V9_BRIDGE__');

    const cleanSelect=sel=>{
      if(!(sel instanceof HTMLSelectElement)) return false;
      let selectedArabic=false,changed=false;
      [...sel.options].forEach(opt=>{
        const value=(opt.value||'').trim().toLowerCase();
        const text=(opt.textContent||'').trim().toLowerCase();
        if(value==='ar'||value==='ar-sa'||text==='arabic'||text.includes('العربية')){
          if(opt.selected) selectedArabic=true;
          opt.remove(); changed=true;
        }
      });
      if(selectedArabic){
        const english=[...sel.options].find(o=>['en','en-us','english'].includes((o.value||'').toLowerCase())||(o.textContent||'').trim().toLowerCase()==='english');
        if(english) sel.value=english.value; else if(sel.options.length) sel.selectedIndex=0;
        sel.dispatchEvent(new Event('change',{bubbles:true}));
      }
      return changed;
    };
    const resetArabicState=()=>{
      if(document.documentElement.lang==='ar'||document.documentElement.dir==='rtl'){
        document.documentElement.lang='en';document.documentElement.dir='ltr';document.body?.removeAttribute('dir');
      }
      try{['pavenro.finance.language','pavenro.language','finance.language'].forEach(k=>{if((localStorage.getItem(k)||'').toLowerCase().startsWith('ar'))localStorage.setItem(k,'en')})}catch(_){ }
    };
    const stripArabic=root=>{
      if(root instanceof HTMLSelectElement) cleanSelect(root);
      else if(root instanceof HTMLOptionElement) cleanSelect(root.parentElement);
      else if(root?.querySelectorAll) root.querySelectorAll('select').forEach(cleanSelect);
      resetArabicState();
    };
    stripArabic(document);
    const langObserver=new MutationObserver(mutations=>{
      const targets=[];
      for(const m of mutations){
        for(const n of m.addedNodes){
          if(n.nodeType!==1) continue;
          if(n.matches?.('select,option')||n.querySelector?.('select')) targets.push(n);
        }
      }
      if(targets.length) requestAnimationFrame(()=>targets.forEach(stripArabic));
    });
    langObserver.observe(document.documentElement,{subtree:true,childList:true});
  }
})();
