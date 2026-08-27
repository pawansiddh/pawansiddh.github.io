(()=>{
  if(window.__PAVENRO_FINANCE_DIRECT_UI__)return;
  window.__PAVENRO_FINANCE_DIRECT_UI__=true;

  const css=document.createElement('style');
  css.id='pv-finance-direct-ui';
  css.textContent=`
    :root{--pv-side-width:226px;--pv-brand-height:72px}
    .sidebar{position:relative!important;overflow:visible!important}

    /* Fixed PAVENRO | FINANCE brand header. It never collapses. */
    .sidebar .brand{
      position:fixed!important;left:0!important;top:0!important;z-index:170!important;
      width:var(--pv-side-width)!important;height:var(--pv-brand-height)!important;min-height:var(--pv-brand-height)!important;
      display:flex!important;align-items:center!important;gap:6px!important;
      padding:0 9px!important;margin:0!important;
      background:var(--sidebar,#123f2b)!important;
      border-bottom:1px solid rgba(255,255,255,.12)!important;
      box-shadow:0 1px 0 rgba(0,0,0,.06)!important;
    }
    .sidebar .brand img{
      width:94px!important;max-width:94px!important;height:auto!important;object-fit:contain!important;
      filter:brightness(0) invert(1)!important;opacity:1!important;flex:0 0 auto!important;
    }
    .sidebar .brand small{
      font-size:8.5px!important;line-height:1!important;letter-spacing:.13em!important;font-weight:900!important;
      color:#fff!important;opacity:.96!important;white-space:nowrap!important;flex:0 0 auto!important;
    }
    .pv-brand-separator{color:rgba(255,255,255,.52);font-size:15px;line-height:1;flex:0 0 auto}
    body.theme-midnight .sidebar .brand img,body.theme-classic .sidebar .brand img,body.theme-sage .sidebar .brand img{filter:brightness(0) invert(1)!important;opacity:1!important}

    /* Only this lower navigation drawer moves. */
    #pvSidebarBody{
      position:fixed!important;left:0!important;top:var(--pv-brand-height)!important;bottom:0!important;z-index:145!important;
      width:var(--pv-side-width)!important;min-width:var(--pv-side-width)!important;
      display:flex!important;flex-direction:column!important;
      padding:8px 12px 12px!important;
      background:var(--sidebar,#123f2b)!important;color:var(--sideText,#fff)!important;
      overflow-y:auto!important;overflow-x:hidden!important;
      transition:transform .23s ease,opacity .18s ease!important;
      scrollbar-width:thin;
    }
    body.pv-sidebar-collapsed #pvSidebarBody{transform:translateX(-104%)!important;opacity:0!important;pointer-events:none!important}
    body.pv-sidebar-collapsed .app{grid-template-columns:0 minmax(0,1fr)!important}
    body:not(.pv-sidebar-collapsed) .app{grid-template-columns:var(--pv-side-width) minmax(0,1fr)!important}
    body.pv-sidebar-collapsed .topbar{padding-left:calc(var(--pv-side-width) + 14px)!important}

    /* Brand controls: menu + collapse/hamburger */
    .pv-brand-actions{margin-left:auto;display:flex;align-items:center;gap:3px;flex:0 0 auto}
    .pv-brand-btn{
      width:27px;height:30px;border:0;border-radius:8px;background:transparent;color:#fff;
      display:grid;place-items:center;cursor:pointer;font-size:18px;line-height:1;padding:0;
    }
    .pv-brand-btn:hover{background:rgba(255,255,255,.10)}
    #pvSideExpand{display:none;font-size:17px}
    body.pv-sidebar-collapsed #pvSideCollapse{display:none!important}
    body.pv-sidebar-collapsed #pvSideExpand{display:grid!important}
    .pv-side-menu{
      position:fixed;left:72px;top:57px;width:146px;padding:6px;z-index:190;display:none;
      background:var(--panel,#fff);color:var(--ink,#17301f);border:1px solid var(--line,#dce5dc);
      border-radius:10px;box-shadow:0 10px 28px rgba(0,0,0,.18)
    }
    .pv-side-menu.open{display:block}
    .pv-side-menu button{width:100%;border:0;background:transparent;color:inherit;text-align:left;padding:8px 9px;border-radius:8px;font-size:11px;cursor:pointer}
    .pv-side-menu button:hover{background:var(--panel2,#eef3ed)}

    #profileCard,.profile-card{display:none!important}
    .side-bottom{margin-top:auto!important;padding-bottom:8px!important}

    /* Quick Actions must remain completely visible inside the dashboard border. */
    .dash-bottom{min-height:124px!important;overflow:hidden!important}
    .dash-bottom>.card{min-height:0!important;overflow:hidden!important}
    .dash-bottom .card-body{min-height:0!important;overflow:hidden!important;padding:6px 8px!important}
    .dash-bottom .quick-grid{
      display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;
      grid-template-rows:repeat(2,minmax(0,1fr))!important;
      height:100%!important;min-height:0!important;gap:6px!important;align-content:stretch!important;
    }
    .dash-bottom .quick{
      min-height:0!important;height:100%!important;max-height:none!important;padding:4px 6px!important;
      display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2px!important;
      overflow:visible!important;border-radius:11px!important;
      border:1px solid color-mix(in srgb,var(--brand,#245f3b) 20%,var(--line,#dce5dc))!important;
      background:linear-gradient(145deg,var(--panel,#fff),var(--panel2,#f0f4ee))!important;
      box-shadow:0 2px 7px rgba(24,70,40,.05)!important;
      font-size:11px!important;line-height:1!important;
    }
    .dash-bottom .quick b{display:block!important;margin:0!important;font-size:9.5px!important;line-height:1.05!important}
    .dash-bottom .quick:hover{transform:translateY(-1px);border-color:var(--brand2,#35784f)!important}

    .mini-row,.transfer-row,.detail-grid>div,table td{word-spacing:.08em!important}
    .mini-row b,.mini-row small,.transfer-row b,.transfer-row small{margin-right:5px!important}

    @media(max-height:720px){
      .dash-bottom{min-height:112px!important}
      .dash-bottom .card-body{padding:4px 7px!important}
      .dash-bottom .quick-grid{gap:4px!important}
      .dash-bottom .quick{padding:2px 4px!important;font-size:10px!important}
      .dash-bottom .quick b{font-size:8.8px!important}
    }
    @media(max-width:760px){
      :root{--pv-side-width:210px}
      .sidebar .brand img{width:86px!important;max-width:86px!important}
      body.pv-sidebar-collapsed .topbar{padding-left:58px!important}
      body.pv-sidebar-collapsed .sidebar .brand{width:54px!important;padding:0 8px!important}
      body.pv-sidebar-collapsed .sidebar .brand img,body.pv-sidebar-collapsed .sidebar .brand small,body.pv-sidebar-collapsed .pv-brand-separator,body.pv-sidebar-collapsed #pvSideMenuBtn{display:none!important}
      body.pv-sidebar-collapsed .pv-brand-actions{margin:0 auto!important}
    }
  `;
  document.head.appendChild(css);

  function structureSidebar(sidebar){
    const brand=sidebar.querySelector('.brand');
    if(!brand)return false;

    const img=brand.querySelector('img');
    if(img)img.alt='PAVENRO';
    let small=brand.querySelector('small');
    if(!small){small=document.createElement('small');brand.appendChild(small)}
    small.textContent='FINANCE';

    if(!brand.querySelector('.pv-brand-separator')){
      const sep=document.createElement('span');sep.className='pv-brand-separator';sep.textContent='|';
      brand.insertBefore(sep,small);
    }

    /* Remove previous floating v6 controls if they exist. */
    document.getElementById('pvSidebarCollapse')?.remove();
    document.getElementById('pvSidebarExpand')?.remove();

    let body=document.getElementById('pvSidebarBody');
    if(!body){
      body=document.createElement('div');body.id='pvSidebarBody';
      [...sidebar.children].filter(el=>el!==brand && el.id!=='pvSidebarBody').forEach(el=>body.appendChild(el));
      sidebar.appendChild(body);
    }

    let actions=brand.querySelector('.pv-brand-actions');
    if(!actions){
      actions=document.createElement('div');actions.className='pv-brand-actions';
      actions.innerHTML=`<button id="pvSideMenuBtn" class="pv-brand-btn" type="button" title="Sidebar options" aria-label="Sidebar options">⋮</button><button id="pvSideCollapse" class="pv-brand-btn" type="button" title="Hide navigation" aria-label="Hide navigation">‹</button><button id="pvSideExpand" class="pv-brand-btn" type="button" title="Show navigation" aria-label="Show navigation">☰</button>`;
      brand.appendChild(actions);
    }

    let menu=document.getElementById('pvSideMenu');
    if(!menu){
      menu=document.createElement('div');menu.id='pvSideMenu';menu.className='pv-side-menu';
      menu.innerHTML=`<button type="button" data-pv-side="toggle">Collapse / expand navigation</button><button type="button" data-pv-side="modules">Navigation & modules</button>`;
      document.body.appendChild(menu);
    }

    const getCollapsed=()=>localStorage.getItem('pavenro.finance.sidebar.collapsed')==='1';
    const setCollapsed=v=>{
      localStorage.setItem('pavenro.finance.sidebar.collapsed',v?'1':'0');
      document.body.classList.toggle('pv-sidebar-collapsed',v);
      menu.classList.remove('open');
    };
    setCollapsed(getCollapsed());

    const collapse=document.getElementById('pvSideCollapse');
    const expand=document.getElementById('pvSideExpand');
    const menuBtn=document.getElementById('pvSideMenuBtn');
    collapse.onclick=()=>setCollapsed(true);
    expand.onclick=()=>setCollapsed(false);
    menuBtn.onclick=e=>{e.stopPropagation();menu.classList.toggle('open')};
    menu.querySelector('[data-pv-side="toggle"]').onclick=()=>setCollapsed(!document.body.classList.contains('pv-sidebar-collapsed'));
    menu.querySelector('[data-pv-side="modules"]').onclick=()=>{
      menu.classList.remove('open');
      if(typeof openSettings==='function')openSettings('modules');
      else if(typeof state!=='undefined'){state.view='Settings';if(typeof render==='function')render()}
    };
    if(!window.__PV_SIDE_OUTSIDE_CLICK__){
      window.__PV_SIDE_OUTSIDE_CLICK__=true;
      document.addEventListener('click',e=>{if(!e.target.closest('#pvSideMenu')&&!e.target.closest('#pvSideMenuBtn'))document.getElementById('pvSideMenu')?.classList.remove('open')});
    }

    document.querySelectorAll('#profileCard,.profile-card').forEach(x=>x.remove());
    return true;
  }

  function apply(){
    const sidebar=document.querySelector('.sidebar');
    if(!sidebar)return false;
    structureSidebar(sidebar);

    /* Guarantee the dashboard's bottom action card has a real 2x2 visible grid. */
    document.querySelectorAll('.quick-grid').forEach(grid=>{
      if(grid.closest('.dash-bottom'))grid.classList.add('pv-quick-fixed');
    });
    return true;
  }

  let n=0;const t=setInterval(()=>{n++;if(apply()||n>120)clearInterval(t)},50);
  const obs=new MutationObserver(()=>apply());
  setTimeout(()=>{const root=document.querySelector('.app');if(root)obs.observe(root,{childList:true,subtree:true})},500);
})();
