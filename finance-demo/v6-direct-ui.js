(()=>{
  if(window.__PAVENRO_FINANCE_DIRECT_UI__)return;
  window.__PAVENRO_FINANCE_DIRECT_UI__=true;
  const css=document.createElement('style');
  css.id='pv-finance-direct-ui';
  css.textContent=`
    .sidebar{position:relative!important;overflow:visible!important;transition:transform .22s ease,opacity .18s ease!important}
    .sidebar .brand{display:flex!important;align-items:center!important;gap:10px!important;padding:5px 8px 13px!important;min-height:44px!important}
    .sidebar .brand img{width:112px!important;height:auto!important;object-fit:contain!important;filter:brightness(0) invert(1)!important;opacity:.98!important}
    .sidebar .brand small{font-size:9px!important;line-height:1!important;letter-spacing:.16em!important;font-weight:800!important;color:var(--sideText,#fff)!important;opacity:.92!important;white-space:nowrap!important}
    body.theme-midnight .sidebar .brand img,body.theme-classic .sidebar .brand img{filter:brightness(0) invert(1)!important}
    #profileCard,.profile-card{display:none!important}
    .side-bottom{margin-top:auto!important;padding-bottom:8px!important}
    #pvSidebarCollapse{position:absolute;right:-14px;top:76px;width:29px;height:36px;border-radius:9px;border:1px solid rgba(255,255,255,.28);background:var(--sidebar,#153d29);color:#fff;display:grid;place-items:center;cursor:pointer;z-index:100;font-size:19px;box-shadow:0 5px 16px rgba(0,0,0,.18)}
    #pvSidebarExpand{position:fixed;left:12px;top:78px;width:38px;height:38px;border-radius:10px;border:1px solid var(--line,#dce5dc);background:var(--panel,#fff);color:var(--ink,#17301f);display:none;place-items:center;cursor:pointer;z-index:150;font-size:19px;box-shadow:0 6px 18px rgba(0,0,0,.12)}
    body.pv-sidebar-collapsed .app{grid-template-columns:0 minmax(0,1fr)!important}
    body.pv-sidebar-collapsed .sidebar{transform:translateX(-105%)!important;opacity:0!important;pointer-events:none!important}
    body.pv-sidebar-collapsed #pvSidebarExpand{display:grid!important}
    body.pv-sidebar-collapsed .topbar{padding-left:62px!important}
    .quick-grid{gap:8px!important}
    .quick{border-radius:12px!important;border:1px solid color-mix(in srgb,var(--brand,#245f3b) 18%,var(--line,#dce5dc))!important;background:linear-gradient(145deg,var(--panel,#fff),var(--panel2,#f0f4ee))!important;min-height:42px!important;box-shadow:0 3px 10px rgba(24,70,40,.05)!important}
    .quick:hover{transform:translateY(-1px);border-color:var(--brand2,#35784f)!important}
    .mini-row,.transfer-row,.detail-grid>div,table td{word-spacing:.08em!important}
    .mini-row b,.mini-row small,.transfer-row b,.transfer-row small{display:block!important;margin-right:5px!important}
    @media(max-width:760px){#pvSidebarCollapse{display:none!important}#pvSidebarExpand{display:none!important}}
  `;
  document.head.appendChild(css);
  function apply(){
    const sidebar=document.querySelector('.sidebar');
    if(!sidebar)return false;
    const brand=sidebar.querySelector('.brand');
    if(brand){
      const img=brand.querySelector('img');
      let small=brand.querySelector('small');
      if(img){img.alt='PAVENRO';}
      if(!small){small=document.createElement('small');brand.appendChild(small)}
      small.textContent='FINANCE';
    }
    document.querySelectorAll('#profileCard,.profile-card').forEach(x=>x.remove());
    let collapse=document.getElementById('pvSidebarCollapse');
    if(!collapse){collapse=document.createElement('button');collapse.id='pvSidebarCollapse';collapse.type='button';collapse.textContent='‹';collapse.title='Hide sidebar';collapse.setAttribute('aria-label','Hide finance sidebar');sidebar.appendChild(collapse)}
    let expand=document.getElementById('pvSidebarExpand');
    if(!expand){expand=document.createElement('button');expand.id='pvSidebarExpand';expand.type='button';expand.textContent='☰';expand.title='Open sidebar';expand.setAttribute('aria-label','Open finance sidebar');document.body.appendChild(expand)}
    const getCollapsed=()=>localStorage.getItem('pavenro.finance.sidebar.collapsed')==='1';
    const setCollapsed=v=>{localStorage.setItem('pavenro.finance.sidebar.collapsed',v?'1':'0');document.body.classList.toggle('pv-sidebar-collapsed',v)};
    setCollapsed(getCollapsed());
    collapse.onclick=()=>setCollapsed(true);
    expand.onclick=()=>setCollapsed(false);
    return true;
  }
  let n=0;const t=setInterval(()=>{n++;if(apply()||n>120)clearInterval(t)},50);
  const obs=new MutationObserver(()=>apply());
  setTimeout(()=>{const root=document.querySelector('.app');if(root)obs.observe(root,{childList:true,subtree:true})},500);
})();
