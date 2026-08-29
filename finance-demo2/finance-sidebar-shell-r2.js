(()=>{
  if(window.__PAWANRO_SIDEBAR_SHELL_R2__) return;
  window.__PAWANRO_SIDEBAR_SHELL_R2__=true;
  document.documentElement.dataset.pvSidebarShell='r2';
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const norm=v=>String(v??'').replace(/\s+/g,' ').trim();
  const CLEAN_WORDMARK='data:image/png;base64,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';
  const style=document.createElement('style');style.id='pv-sidebar-shell-r2-style';style.textContent=`
    .sidebar .brand{box-sizing:border-box!important;width:100%!important;max-width:100%!important;min-width:0!important;min-height:58px!important;height:58px!important;padding:0 10px!important;margin:0!important;inset:auto!important;left:auto!important;right:auto!important;transform:none!important;border:0!important;border-top:0!important;border-bottom:0!important;box-shadow:none!important;background:transparent!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:0!important;overflow:hidden!important;position:relative!important}
    .sidebar .brand::before,.sidebar .brand::after{display:none!important;content:none!important}
    .sidebar .brand>hr,.sidebar .brand>.divider,.sidebar .brand>.separator,.sidebar .brand>.pv-sep,.sidebar .brand>small,.sidebar .pv-brand-actions{display:none!important}
    .sidebar .brand #pvPawanroWordmark{display:block!important;width:124px!important;max-width:124px!important;height:auto!important;max-height:22px!important;margin:0!important;padding:0!important;border:0!important;object-fit:contain!important;object-position:left center!important;flex:0 0 124px!important}
    .sidebar .brand .pv-brand-finance{display:inline-flex!important;align-items:center!important;margin-left:7px!important;color:#fff!important;white-space:pre!important;line-height:1!important;flex:0 0 auto!important}
    .sidebar .brand .pv-brand-finance .pv-brand-bar{font:500 13px/1 Inter,system-ui,sans-serif!important;opacity:.78!important;margin-right:5px!important}
    .sidebar .brand .pv-brand-finance .pv-brand-product{font:800 8.5px/1 Inter,system-ui,sans-serif!important;letter-spacing:.08em!important}
    .sidebar .brand .pv-pawanro-mini{display:none!important;width:38px!important;height:38px!important;align-items:center!important;justify-content:center!important;margin:0!important;padding:0!important;flex:0 0 38px!important}
    .sidebar .brand .pv-pawanro-mini img{display:block!important;width:34px!important;height:34px!important;margin:0!important;padding:0!important;object-fit:contain!important}
    body.pv-rail .sidebar .brand{box-sizing:border-box!important;width:100%!important;max-width:100%!important;padding:0!important;margin:0!important;justify-content:center!important;overflow:hidden!important}
    body.pv-rail .sidebar .brand #pvPawanroWordmark,body.pv-rail .sidebar .brand .pv-brand-finance{display:none!important}
    body.pv-rail .sidebar .brand .pv-pawanro-mini{display:flex!important}
    .sidebar [data-pv-obsolete-brand],.sidebar .pv-obsolete-brand{display:none!important}
    .sidebar .pv-util-label{display:inline!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    body.pv-rail .sidebar .pv-util-label{display:none!important}
    body.pv-rail .sidebar button[data-v="Groups"],body.pv-rail .sidebar button[data-v="Settings"],body.pv-rail .sidebar button[data-v="Help & Support"]{justify-content:center!important;padding-left:0!important;padding-right:0!important}
    .sidebar button[data-v="Help & Support"]{min-height:36px!important}
  `;document.head.appendChild(style);

  function side(){return q('.sidebar')||q('[data-sidebar]')}
  function allowedBrandChild(el){return el?.id==='pvPawanroWordmark'||el?.classList?.contains('pv-pawanro-mini')||el?.classList?.contains('pv-brand-finance')}
  function cleanBrand(s){
    const b=q('.brand,.sidebar-brand,.brand-row',s);if(!b)return;
    [...b.childNodes].forEach(n=>{
      if(n.nodeType===Node.TEXT_NODE){if(norm(n.nodeValue))n.remove();return}
      if(n.nodeType!==Node.ELEMENT_NODE)return;
      if(!allowedBrandChild(n))n.remove();
    });
    const word=q('#pvPawanroWordmark',b),mini=q('.pv-pawanro-mini',b);
    if(word){if(word.src!==CLEAN_WORDMARK)word.src=CLEAN_WORDMARK;word.alt='PAWANRO';word.removeAttribute('width');word.removeAttribute('height')}
    let product=q('.pv-brand-finance',b);
    if(!product){product=document.createElement('span');product.className='pv-brand-finance';product.setAttribute('aria-hidden','true');if(word?.nextSibling)b.insertBefore(product,word.nextSibling);else if(word)b.appendChild(product);else b.prepend(product)}
    product.innerHTML='<span class="pv-brand-bar">|</span><span class="pv-brand-product"> FINANCE</span>';
    if(mini&&mini!==b.lastElementChild)b.appendChild(mini);
    b.removeAttribute('style');
    b.setAttribute('aria-label','PAWANRO | FINANCE');b.title='PAWANRO | FINANCE';
  }
  function hideTopDecorations(s){
    const sr=s.getBoundingClientRect();
    qa('*',s).forEach(el=>{
      if(el.closest('.brand')||el.closest('button,a,input,select'))return;
      const r=el.getBoundingClientRect(),top=r.top-sr.top;
      if(top>=0&&top<72&&r.height>0&&r.height<=3&&r.width>=28){el.dataset.pvObsoleteBrand='1';el.style.setProperty('display','none','important')}
    });
  }
  function hideObsoleteLabels(s){
    qa('*',s).forEach(el=>{
      if(el.closest('.brand'))return;
      const t=norm(el.textContent).toUpperCase();if(!t)return;
      const leaf=!el.children.length||!qa('button,a,input,select',el).length;
      if(leaf&&(t==='PAWANRO FINANCE'||t==='PAVENRO FINANCE'||t==='PAVENRO FOCUS · FINANCE'||t==='PAWANRO FOCUS · FINANCE')){el.dataset.pvObsoleteBrand='1';el.style.setProperty('display','none','important')}
      if(leaf&&(t==='$'||t==='|'||t==='FINANCE')&&el.getBoundingClientRect().top-s.getBoundingClientRect().top<90){el.dataset.pvObsoleteBrand='1';el.style.setProperty('display','none','important')}
    });
    qa('hr',s).forEach(hr=>{if(hr.getBoundingClientRect().top-s.getBoundingClientRect().top<80){hr.dataset.pvObsoleteBrand='1';hr.style.setProperty('display','none','important')}});
  }
  function utility(s,name,icon){
    let b=qa('button',s).find(x=>norm(x.dataset.v||x.dataset.nav||x.title||x.getAttribute('aria-label')||x.textContent).toLowerCase().includes(name.toLowerCase()));if(!b)return;
    b.dataset.v=b.dataset.v||name;b.title=name;b.setAttribute('aria-label',name);
    let label=q('.pv-util-label',b);if(!label){b.textContent='';const i=document.createElement('span');i.className='pv-util-icon';i.textContent=icon;i.setAttribute('aria-hidden','true');label=document.createElement('span');label.className='pv-util-label';b.append(i,label)}label.textContent=name;
  }
  function cleanDuplicates(s){qa('#pvSide [data-pv-brand-slot="1"],#pvSide .pv-brand-render,.pv-brand-render[data-pv-brand-slot]',s).forEach(x=>{x.dataset.pvObsoleteBrand='1';x.style.setProperty('display','none','important')})}
  function refresh(){const s=side();if(!s)return;cleanBrand(s);cleanDuplicates(s);hideObsoleteLabels(s);hideTopDecorations(s);utility(s,'Groups','◎');utility(s,'Settings','⚙');utility(s,'Help & Support','?')}
  document.addEventListener('click',()=>setTimeout(refresh,50),true);
  window.addEventListener('resize',refresh);window.addEventListener('pavenro:ready',refresh);window.addEventListener('pavenro:local-write',()=>setTimeout(refresh,40));
  refresh();setTimeout(refresh,80);setInterval(refresh,5000);
  window.PawanroSidebarShell={refresh};
})();