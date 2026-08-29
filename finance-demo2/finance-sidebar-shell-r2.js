(()=>{
  if(window.__PAWANRO_SIDEBAR_SHELL_R2__) return;
  window.__PAWANRO_SIDEBAR_SHELL_R2__=true;
  document.documentElement.dataset.pvSidebarShell='r2';
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const norm=v=>String(v??'').replace(/\s+/g,' ').trim();
  const style=document.createElement('style');style.id='pv-sidebar-shell-r2-style';style.textContent=`
    .sidebar .brand{min-height:58px!important;height:58px!important;padding:7px 10px!important;margin:0!important;border:0!important;border-top:0!important;border-bottom:0!important;box-shadow:none!important;background:transparent!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:0!important;overflow:hidden!important;position:relative!important}
    .sidebar .brand::before,.sidebar .brand::after{display:none!important;content:none!important}
    .sidebar .brand>hr,.sidebar .brand>.divider,.sidebar .brand>.separator,.sidebar .brand>.pv-sep,.sidebar .brand>small,.sidebar .pv-brand-actions{display:none!important}
    .sidebar .brand #pvPawanroWordmark{width:124px!important;max-width:124px!important;height:32px!important;margin:0!important;object-fit:contain!important;object-position:left center!important;flex:0 0 124px!important}
    .sidebar .brand .pv-brand-finance{display:inline-flex!important;align-items:center!important;gap:6px!important;margin-left:7px!important;color:#fff!important;white-space:nowrap!important;line-height:1!important;flex:0 0 auto!important}
    .sidebar .brand .pv-brand-finance .pv-brand-bar{font:500 13px/1 Inter,system-ui,sans-serif!important;opacity:.78!important;transform:translateY(-.5px)}
    .sidebar .brand .pv-brand-finance .pv-brand-product{font:800 8.5px/1 Inter,system-ui,sans-serif!important;letter-spacing:.08em!important}
    .sidebar .brand .pv-pawanro-mini{display:none!important;width:38px!important;height:38px!important;align-items:center!important;justify-content:center!important;margin:0 auto!important;flex:0 0 38px!important}
    .sidebar .brand .pv-pawanro-mini img{width:34px!important;height:34px!important;object-fit:contain!important}
    body.pv-rail .sidebar .brand{padding:7px 0!important;justify-content:center!important}
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
    let product=q('.pv-brand-finance',b);
    if(!product){
      product=document.createElement('span');product.className='pv-brand-finance';product.setAttribute('aria-hidden','true');
      product.innerHTML='<span class="pv-brand-bar">|</span><span class="pv-brand-product">FINANCE</span>';
      if(word?.nextSibling)b.insertBefore(product,word.nextSibling);else if(word)b.appendChild(product);else b.prepend(product);
    }
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
      const t=norm(el.textContent).toUpperCase();
      if(!t)return;
      const leaf=!el.children.length||!qa('button,a,input,select',el).length;
      if(leaf&&(t==='PAWANRO FINANCE'||t==='PAVENRO FINANCE'||t==='PAVENRO FOCUS · FINANCE'||t==='PAWANRO FOCUS · FINANCE')){
        el.dataset.pvObsoleteBrand='1';el.style.setProperty('display','none','important');
      }
      if(leaf&&(t==='$'||t==='|'||t==='FINANCE')&&el.getBoundingClientRect().top-s.getBoundingClientRect().top<90){
        el.dataset.pvObsoleteBrand='1';el.style.setProperty('display','none','important');
      }
    });
    qa('hr',s).forEach(hr=>{if(hr.getBoundingClientRect().top-s.getBoundingClientRect().top<80){hr.dataset.pvObsoleteBrand='1';hr.style.setProperty('display','none','important')}});
  }
  function utility(s,name,icon){
    let b=qa('button',s).find(x=>norm(x.dataset.v||x.dataset.nav||x.title||x.getAttribute('aria-label')||x.textContent).toLowerCase().includes(name.toLowerCase()));
    if(!b)return;
    b.dataset.v=b.dataset.v||name;b.title=name;b.setAttribute('aria-label',name);
    let label=q('.pv-util-label',b);if(!label){
      b.textContent='';const i=document.createElement('span');i.className='pv-util-icon';i.textContent=icon;i.setAttribute('aria-hidden','true');label=document.createElement('span');label.className='pv-util-label';b.append(i,label);
    }
    label.textContent=name;
  }
  function cleanDuplicates(s){
    qa('#pvSide [data-pv-brand-slot="1"],#pvSide .pv-brand-render,.pv-brand-render[data-pv-brand-slot]',s).forEach(x=>{x.dataset.pvObsoleteBrand='1';x.style.setProperty('display','none','important')});
  }
  function refresh(){
    const s=side();if(!s)return;
    cleanBrand(s);cleanDuplicates(s);hideObsoleteLabels(s);hideTopDecorations(s);
    utility(s,'Groups','◎');utility(s,'Settings','⚙');utility(s,'Help & Support','?');
  }
  document.addEventListener('click',()=>setTimeout(refresh,70),true);
  window.addEventListener('resize',refresh);window.addEventListener('pavenro:ready',refresh);window.addEventListener('pavenro:local-write',()=>setTimeout(refresh,50));
  setTimeout(refresh,110);setInterval(refresh,5000);
  window.PawanroSidebarShell={refresh};
})();
