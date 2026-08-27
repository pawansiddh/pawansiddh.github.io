(()=>{
  if(window.__PAVENRO_FINANCE_DIRECT_UI_V7__)return;
  window.__PAVENRO_FINANCE_DIRECT_UI_V7__=true;

  const css=document.createElement('style');
  css.id='pv-finance-direct-ui-v7';
  css.textContent=`
    :root{--pv-side-wide:226px;--pv-side-rail:56px;--pv-brand-h:62px}
    .app{transition:grid-template-columns .2s ease!important}
    body:not(.pv-sidebar-rail) .app{grid-template-columns:var(--pv-side-wide) minmax(0,1fr)!important}
    body.pv-sidebar-rail .app{grid-template-columns:var(--pv-side-rail) minmax(0,1fr)!important}

    .sidebar{position:relative!important;overflow:visible!important;background:var(--sidebar,#123f2b)!important}
    .sidebar .brand{
      position:fixed!important;left:0!important;top:0!important;z-index:170!important;
      width:var(--pv-side-wide)!important;height:var(--pv-brand-h)!important;min-height:var(--pv-brand-h)!important;
      padding:0 10px!important;margin:0!important;display:flex!important;align-items:center!important;gap:6px!important;
      background:var(--sidebar,#123f2b)!important;border:0!important;box-shadow:none!important;
      transition:width .2s ease!important;
    }
    .sidebar .brand img{width:94px!important;max-width:94px!important;height:auto!important;object-fit:contain!important;filter:brightness(0) invert(1)!important;opacity:1!important;flex:0 0 auto}
    .sidebar .brand small{font-size:8.5px!important;letter-spacing:.13em!important;font-weight:900!important;color:#fff!important;white-space:nowrap!important;opacity:.95!important}
    .pv-brand-separator{font-size:14px;color:rgba(255,255,255,.45);line-height:1}
    .pv-mini-mark{display:none;width:34px;height:34px;border-radius:10px;place-items:center;color:#fff;font:800 17px/1 Inter,system-ui;background:rgba(255,255,255,.06);letter-spacing:-.05em}
    .pv-brand-actions{margin-left:auto;display:flex;align-items:center;gap:2px}
    .pv-brand-btn{width:28px;height:30px;border:0!important;outline:0;background:transparent!important;color:#fff!important;border-radius:8px;display:grid;place-items:center;cursor:pointer;font-size:17px;padding:0;opacity:.82}
    .pv-brand-btn:hover{background:rgba(255,255,255,.07)!important;opacity:1}
    #pvRailExpand{display:none!important}

    #pvSidebarBody{
      position:fixed!important;left:0!important;top:var(--pv-brand-h)!important;bottom:0!important;z-index:145!important;
      width:var(--pv-side-wide)!important;padding:6px 10px 10px!important;display:flex!important;flex-direction:column!important;
      background:var(--sidebar,#123f2b)!important;color:var(--sideText,#fff)!important;overflow-y:auto!important;overflow-x:hidden!important;
      transition:width .2s ease,padding .2s ease!important;scrollbar-width:none;
    }
    #pvSidebarBody::-webkit-scrollbar{width:0;height:0}

    .pv-side-search,.pv-rail-expand{
      width:100%;height:38px;border:0!important;background:transparent!important;color:var(--sideText,#fff)!important;
      border-radius:10px;display:flex;align-items:center;gap:11px;padding:0 10px;cursor:pointer;font-size:12px;font-weight:600;opacity:.88;margin-bottom:4px;
    }
    .pv-side-search:hover,.pv-rail-expand:hover{background:rgba(255,255,255,.055)!important;opacity:1}
    .pv-side-search .pv-search-ico,.pv-rail-expand .pv-search-ico{width:18px;text-align:center;font-size:17px;flex:0 0 18px}
    .pv-rail-expand{display:none}

    /* Sidebar navigation: quiet by default, only a faint hover surface. */
    #pvSidebarBody .nav-row{grid-template-columns:minmax(0,1fr) 26px!important;gap:3px!important;align-items:center!important}
    #pvSidebarBody .nav-btn,#pvSidebarBody .utility-btn,#pvSidebarBody #moreSections{
      min-height:36px!important;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;
      border-radius:10px!important;color:var(--sideText,#fff)!important;padding:0 9px!important;margin:0!important;transition:background .15s ease,opacity .15s ease!important;
    }
    #pvSidebarBody .nav-btn:hover,#pvSidebarBody .utility-btn:hover,#pvSidebarBody #moreSections:hover{background:rgba(255,255,255,.055)!important}
    #pvSidebarBody .nav-btn.active{background:rgba(255,255,255,.075)!important;box-shadow:inset 2px 0 0 rgba(255,255,255,.34)!important}
    #pvSidebarBody .help-btn{
      width:26px!important;height:26px!important;border:0!important;background:transparent!important;color:var(--sideText,#fff)!important;
      opacity:.14!important;border-radius:8px!important;transition:opacity .15s ease,background .15s ease!important;
    }
    #pvSidebarBody .nav-row:hover .help-btn,#pvSidebarBody .nav-btn.active+.help-btn{opacity:.52!important}
    #pvSidebarBody .help-btn:hover{background:rgba(255,255,255,.06)!important;opacity:.82!important}
    #pvSidebarBody .section-label{opacity:.42!important;font-size:8px!important;letter-spacing:.14em!important;margin:8px 9px 5px!important}
    #profileCard,.profile-card{display:none!important}

    /* ChatGPT-style icon rail: icons stay; labels/help rings disappear. */
    body.pv-sidebar-rail .sidebar .brand{width:var(--pv-side-rail)!important;padding:0 10px!important;justify-content:center!important}
    body.pv-sidebar-rail .sidebar .brand img,body.pv-sidebar-rail .sidebar .brand small,body.pv-sidebar-rail .pv-brand-separator,body.pv-sidebar-rail #pvSideMenuBtn,body.pv-sidebar-rail #pvSideCollapse{display:none!important}
    body.pv-sidebar-rail .pv-mini-mark{display:grid!important}
    body.pv-sidebar-rail #pvSidebarBody{width:var(--pv-side-rail)!important;padding:6px 7px 10px!important;align-items:center!important}
    body.pv-sidebar-rail .pv-rail-expand{display:flex!important;width:42px!important;justify-content:center!important;padding:0!important}
    body.pv-sidebar-rail .pv-rail-expand span:last-child{display:none!important}
    body.pv-sidebar-rail .pv-side-search{width:42px!important;justify-content:center!important;padding:0!important}
    body.pv-sidebar-rail .pv-side-search span:last-child{display:none!important}
    body.pv-sidebar-rail #pvSidebarBody .section-label{display:none!important}
    body.pv-sidebar-rail #pvSidebarBody .nav-row{display:block!important;width:42px!important}
    body.pv-sidebar-rail #pvSidebarBody .help-btn{display:none!important}
    body.pv-sidebar-rail #pvSidebarBody .nav-btn,body.pv-sidebar-rail #pvSidebarBody .utility-btn,body.pv-sidebar-rail #pvSidebarBody #moreSections{
      width:42px!important;min-width:42px!important;height:38px!important;min-height:38px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;
    }
    body.pv-sidebar-rail #pvSidebarBody .nav-btn span:last-child,body.pv-sidebar-rail #pvSidebarBody .utility-btn span:last-child,body.pv-sidebar-rail #pvSidebarBody #moreSections span:last-child{display:none!important}
    body.pv-sidebar-rail #pvSidebarBody .nav-btn span:first-child,body.pv-sidebar-rail #pvSidebarBody .utility-btn span:first-child{margin:0!important;min-width:18px!important;text-align:center!important}
    body.pv-sidebar-rail #pvSidebarBody .divider{width:28px!important;margin:8px auto!important;opacity:.3!important}

    /* Search lives off the sidebar, preserving existing search behavior. */
    #pvSearchPopover{position:fixed;z-index:230;left:calc(var(--pv-side-wide) + 12px);top:12px;width:min(440px,calc(100vw - 360px));display:none;padding:0;border-radius:12px;box-shadow:0 16px 38px rgba(0,0,0,.16)}
    #pvSearchPopover.open{display:block}
    body.pv-sidebar-rail #pvSearchPopover{left:calc(var(--pv-side-rail) + 10px)}
    #pvSearchPopover .searchbox,#pvSearchPopover .search-box,#pvSearchPopover>div{width:100%!important;max-width:none!important;margin:0!important;box-shadow:none!important}
    #pvSearchPopover input{width:100%!important;min-width:0!important}

    /* Replace the old large page heading with a compact context title in the top bar. */
    .topbar{min-height:58px!important;height:58px!important;padding-left:14px!important;gap:10px!important}
    .topbar .pv-top-context{display:flex;align-items:center;gap:9px;min-width:210px;margin-right:auto}
    .pv-context-mark{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:color-mix(in srgb,var(--brand,#245f3b) 10%,var(--panel,#fff));color:var(--brand,#245f3b);font-weight:800;font-size:13px}
    .pv-context-copy{min-width:0}.pv-context-copy small{display:block;color:var(--muted,#718075);font-size:8px;letter-spacing:.12em;text-transform:uppercase;line-height:1;margin-bottom:3px}.pv-context-copy b{display:block;font-family:Georgia,serif;font-size:18px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px}
    .page-head{display:none!important}
    .workspace{padding-top:8px!important}
    .page{gap:7px!important;overflow:hidden!important}

    /* Make card outlines recede; reveal a very faint edge only on hover. */
    .card,.stat{border-color:transparent!important;box-shadow:0 1px 1px rgba(25,55,32,.025)!important;transition:box-shadow .15s ease,border-color .15s ease!important}
    .card:hover,.stat:hover{box-shadow:0 0 0 1px color-mix(in srgb,var(--line,#dce5dc) 48%,transparent),0 3px 12px rgba(25,55,32,.035)!important}

    /* The removed page heading creates room for the bottom Dashboard row. */
    .dashboard-grid{grid-template-rows:minmax(158px,1.25fr) minmax(116px,.9fr) minmax(124px,.96fr)!important;gap:8px!important;min-height:0!important;overflow:hidden!important}
    .dash-top,.dash-mid,.dash-bottom{min-height:0!important;overflow:hidden!important;gap:8px!important}
    .dash-bottom{min-height:124px!important}
    .dash-bottom>.card{min-height:0!important;overflow:hidden!important}
    .dash-bottom .card-body{height:calc(100% - 36px)!important;min-height:0!important;overflow:hidden!important;padding:6px 8px!important}
    .dash-bottom .quick-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important;height:100%!important;min-height:0!important;gap:6px!important}
    .dash-bottom .quick{height:100%!important;min-height:0!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;gap:2px!important;padding:3px 5px!important;overflow:hidden!important;border:0!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--line,#dce5dc) 42%,transparent)!important;background:color-mix(in srgb,var(--panel2,#f1f4ef) 72%,var(--panel,#fff))!important}
    .dash-bottom .quick:hover{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--brand,#245f3b) 24%,var(--line,#dce5dc))!important}
    .dash-bottom .quick b{font-size:9px!important;line-height:1.05!important;margin:0!important}

    .pv-side-menu{position:fixed;left:70px;top:48px;width:154px;padding:6px;z-index:240;display:none;background:var(--panel,#fff);color:var(--ink,#17301f);border:1px solid var(--line,#dce5dc);border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,.18)}
    .pv-side-menu.open{display:block}.pv-side-menu button{width:100%;border:0;background:transparent;color:inherit;text-align:left;padding:8px 9px;border-radius:8px;font-size:11px;cursor:pointer}.pv-side-menu button:hover{background:var(--panel2,#eef3ed)}

    @media(max-height:720px){
      .dashboard-grid{grid-template-rows:minmax(145px,1.2fr) minmax(105px,.86fr) minmax(112px,.9fr)!important}.dash-bottom{min-height:112px!important}.workspace{padding-top:6px!important}.topbar{height:54px!important;min-height:54px!important}.pv-context-copy b{font-size:17px!important}
    }
    @media(max-width:900px){.pv-context-copy small{display:none}.pv-context-copy b{max-width:150px}.topbar .pv-top-context{min-width:160px}.topbar{gap:6px!important}}
  `;
  document.head.appendChild(css);

  function ensureBrand(sidebar){
    const brand=sidebar.querySelector('.brand');if(!brand)return null;
    let small=brand.querySelector('small');if(!small){small=document.createElement('small');brand.appendChild(small)}small.textContent='FINANCE';
    if(!brand.querySelector('.pv-brand-separator')){const s=document.createElement('span');s.className='pv-brand-separator';s.textContent='|';brand.insertBefore(s,small)}
    if(!brand.querySelector('.pv-mini-mark')){const m=document.createElement('span');m.className='pv-mini-mark';m.textContent='P';brand.insertBefore(m,brand.firstChild)}
    let actions=brand.querySelector('.pv-brand-actions');
    if(!actions){
      actions=document.createElement('div');actions.className='pv-brand-actions';
      actions.innerHTML='<button id="pvSideMenuBtn" class="pv-brand-btn" type="button" aria-label="Sidebar options" title="Sidebar options">⋮</button><button id="pvSideCollapse" class="pv-brand-btn" type="button" aria-label="Collapse sidebar" title="Collapse sidebar">‹</button>';
      brand.appendChild(actions);
    }
    return brand;
  }

  function ensureSidebarBody(sidebar,brand){
    let body=document.getElementById('pvSidebarBody');
    if(!body){body=document.createElement('div');body.id='pvSidebarBody';[...sidebar.children].filter(x=>x!==brand).forEach(x=>body.appendChild(x));sidebar.appendChild(body)}
    document.querySelectorAll('#profileCard,.profile-card').forEach(x=>x.remove());
    if(!body.querySelector('#pvRailExpand')){const b=document.createElement('button');b.id='pvRailExpand';b.className='pv-rail-expand';b.innerHTML='<span class="pv-search-ico">☰</span><span>Expand</span>';body.insertBefore(b,body.firstChild)}
    if(!body.querySelector('#pvSidebarSearch')){const b=document.createElement('button');b.id='pvSidebarSearch';b.className='pv-side-search';b.innerHTML='<span class="pv-search-ico">⌕</span><span>Search</span>';body.insertBefore(b,body.children[1]||null)}
    return body;
  }

  function setRail(v){localStorage.setItem('pavenro.finance.sidebar.rail',v?'1':'0');document.body.classList.toggle('pv-sidebar-rail',v)}

  function ensureSearch(){
    let pop=document.getElementById('pvSearchPopover');if(!pop){pop=document.createElement('div');pop.id='pvSearchPopover';document.body.appendChild(pop)}
    const input=document.querySelector('.topbar input[type="search"],#globalSearch,.topbar input[placeholder*="Search"]');
    if(input){const box=input.closest('.searchbox,.search-box')||input.parentElement;if(box&&box.parentElement!==pop)pop.appendChild(box)}
    const toggle=document.getElementById('pvSidebarSearch');
    if(toggle)toggle.onclick=e=>{e.stopPropagation();pop.classList.toggle('open');if(pop.classList.contains('open'))setTimeout(()=>pop.querySelector('input')?.focus(),20)};
    if(!window.__PV_SEARCH_OUTSIDE__){window.__PV_SEARCH_OUTSIDE__=1;document.addEventListener('click',e=>{if(!e.target.closest('#pvSearchPopover')&&!e.target.closest('#pvSidebarSearch'))document.getElementById('pvSearchPopover')?.classList.remove('open')})}
  }

  function ensureTopContext(){
    const top=document.querySelector('.topbar');if(!top)return;
    let ctx=top.querySelector('.pv-top-context');if(!ctx){ctx=document.createElement('div');ctx.className='pv-top-context';ctx.innerHTML='<span class="pv-context-mark">₹</span><span class="pv-context-copy"><small>Pavenro Finance</small><b>Finance Dashboard</b></span>';top.insertBefore(ctx,top.firstChild)}
    const h=document.querySelector('.page-head h1');if(h&&h.textContent.trim())ctx.querySelector('b').textContent=h.textContent.trim();
  }

  function ensureMenu(){
    let menu=document.getElementById('pvSideMenu');if(!menu){menu=document.createElement('div');menu.id='pvSideMenu';menu.className='pv-side-menu';menu.innerHTML='<button data-pv-side="modules">Navigation & modules</button><button data-pv-side="settings">Settings</button>';document.body.appendChild(menu)}
    const btn=document.getElementById('pvSideMenuBtn');if(btn)btn.onclick=e=>{e.stopPropagation();menu.classList.toggle('open')};
    menu.querySelector('[data-pv-side="modules"]').onclick=()=>{menu.classList.remove('open');if(typeof openSettings==='function')openSettings('modules');else if(typeof state!=='undefined'){state.view='Settings';typeof render==='function'&&render()}};
    menu.querySelector('[data-pv-side="settings"]').onclick=()=>{menu.classList.remove('open');if(typeof openSettings==='function')openSettings('profile');else if(typeof state!=='undefined'){state.view='Settings';typeof render==='function'&&render()}};
    if(!window.__PV_MENU_OUTSIDE__){window.__PV_MENU_OUTSIDE__=1;document.addEventListener('click',e=>{if(!e.target.closest('#pvSideMenu')&&!e.target.closest('#pvSideMenuBtn'))document.getElementById('pvSideMenu')?.classList.remove('open')})}
  }

  function apply(){
    const sidebar=document.querySelector('.sidebar');if(!sidebar)return false;
    const brand=ensureBrand(sidebar);const body=ensureSidebarBody(sidebar,brand);
    setRail(localStorage.getItem('pavenro.finance.sidebar.rail')==='1');
    const collapse=document.getElementById('pvSideCollapse');if(collapse)collapse.onclick=()=>setRail(true);
    const expand=document.getElementById('pvRailExpand');if(expand)expand.onclick=()=>setRail(false);
    ensureSearch();ensureTopContext();ensureMenu();
    return true;
  }

  let busy=false;const safe=()=>{if(busy)return;busy=true;try{apply()}finally{busy=false}};
  let n=0;const t=setInterval(()=>{n++;safe();if(document.querySelector('.sidebar')||n>120)clearInterval(t)},50);
  setTimeout(()=>{const root=document.querySelector('.app');if(root)new MutationObserver(()=>requestAnimationFrame(safe)).observe(root,{childList:true,subtree:true})},600);
})();