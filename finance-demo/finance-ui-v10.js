(()=>{
  if(window.__PAVENRO_FINANCE_UI_V10__) return;
  window.__PAVENRO_FINANCE_UI_V10__=true;

  const CURRENCY={INR:'₹',USD:'$',EUR:'€',GBP:'£',AED:'د.إ',CNY:'¥',JPY:'¥',RUB:'₽',CAD:'C$',AUD:'A$',SGD:'S$',CHF:'CHF'};
  const ICONS={Dashboard:'⌂',Accounts:'▣',Transactions:'⇄',Bills:'▤',Budget:'◔',Income:'↗','Funds & Goals':'◎',Documents:'□',Calendar:'▦',Subscriptions:'◉',Debt:'◇','Net Worth':'↗',Investments:'◆',Reports:'▤',Notes:'✎','Tax Records':'▧',Paydays:'◷',Groups:'◎',Settings:'⚙','Help & Support':'?'};

  const css=document.createElement('style');
  css.id='pv-finance-ui-v10-style';
  css.textContent=`
    :root{--pv-side-wide:226px;--pv-side-rail:58px;--pv-brand-h:60px}
    .app{transition:grid-template-columns .16s ease!important}
    body:not(.pv-sidebar-rail) .app{grid-template-columns:var(--pv-side-wide) minmax(0,1fr)!important}
    body.pv-sidebar-rail .app{grid-template-columns:var(--pv-side-rail) minmax(0,1fr)!important}

    .sidebar{position:relative!important;overflow:visible!important;background:var(--sidebar,#123f2b)!important}
    .sidebar .brand{position:fixed!important;left:0!important;top:0!important;z-index:180!important;width:var(--pv-side-wide)!important;height:var(--pv-brand-h)!important;min-height:var(--pv-brand-h)!important;padding:0 10px!important;margin:0!important;display:flex!important;align-items:center!important;gap:6px!important;background:var(--sidebar,#123f2b)!important;border:0!important;box-shadow:none!important;transition:width .16s ease!important}
    .sidebar .brand img{width:95px!important;max-width:95px!important;height:auto!important;object-fit:contain!important;filter:brightness(0) invert(1)!important;opacity:1!important;flex:0 0 auto!important}
    .sidebar .brand small{font-size:8.5px!important;line-height:1!important;letter-spacing:.13em!important;font-weight:900!important;color:#fff!important;white-space:nowrap!important;opacity:.95!important}
    .pv-brand-separator{font-size:14px;color:rgba(255,255,255,.42);line-height:1}.pv-mini-mark{display:none;width:34px;height:34px;border-radius:9px;place-items:center;background:rgba(255,255,255,.07);color:#fff;font:800 17px/1 Inter,system-ui}
    .pv-brand-actions{margin-left:auto;display:flex;align-items:center}.pv-panel-toggle{width:30px;height:30px;border:0!important;background:transparent!important;color:#fff!important;border-radius:8px;display:grid;place-items:center;cursor:pointer;opacity:.82;padding:0}.pv-panel-toggle:hover{background:rgba(255,255,255,.06)!important;opacity:1}
    .pv-panel-icon{width:16px;height:14px;border:1.55px solid currentColor;border-radius:4px;display:block;position:relative}.pv-panel-icon:before{content:'';position:absolute;top:0;bottom:0;left:5px;width:1.4px;background:currentColor;opacity:.8}

    #pvSidebarBody{position:fixed!important;left:0!important;top:var(--pv-brand-h)!important;bottom:0!important;z-index:150!important;width:var(--pv-side-wide)!important;padding:6px 10px 10px!important;display:flex!important;flex-direction:column!important;background:var(--sidebar,#123f2b)!important;color:var(--sideText,#fff)!important;overflow-y:auto!important;overflow-x:hidden!important;transition:width .16s ease,padding .16s ease!important;scrollbar-width:none!important}
    #pvSidebarBody::-webkit-scrollbar{width:0!important;height:0!important}
    .pv-side-search{width:100%;height:38px;border:0!important;background:transparent!important;color:var(--sideText,#fff)!important;border-radius:9px;display:flex;align-items:center;gap:11px;padding:0 10px;cursor:pointer;font-size:12px;font-weight:600;opacity:.86;margin-bottom:4px}.pv-side-search:hover{background:rgba(255,255,255,.05)!important;opacity:1}.pv-side-search .pv-search-ico{width:18px;text-align:center;font-size:16px;flex:0 0 18px}

    #pvSidebarBody .nav-row{grid-template-columns:minmax(0,1fr) 22px!important;gap:1px!important;align-items:center!important}
    #pvSidebarBody .nav-btn,#pvSidebarBody .utility-btn,#pvSidebarBody #moreSections{min-height:36px!important;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;border-radius:9px!important;color:var(--sideText,#fff)!important;padding:0 9px!important;margin:0!important;transition:background .14s ease,opacity .14s ease!important}
    #pvSidebarBody .nav-btn:hover,#pvSidebarBody .utility-btn:hover,#pvSidebarBody #moreSections:hover{background:rgba(255,255,255,.045)!important}
    #pvSidebarBody .nav-btn.active{background:rgba(255,255,255,.07)!important;box-shadow:inset 2px 0 0 rgba(255,255,255,.30)!important}
    #pvSidebarBody .help-btn,#pvSidebarBody button.help-btn{width:22px!important;height:26px!important;min-width:22px!important;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important;color:var(--sideText,#fff)!important;padding:0!important;font-size:11px!important;line-height:1!important;opacity:.24!important;appearance:none!important;-webkit-appearance:none!important}
    #pvSidebarBody .help-btn:before,#pvSidebarBody .help-btn:after{display:none!important;content:none!important}
    #pvSidebarBody .nav-row:hover .help-btn,#pvSidebarBody .nav-btn.active+.help-btn{opacity:.52!important}#pvSidebarBody .help-btn:hover{opacity:.82!important;background:transparent!important}
    #pvSidebarBody .section-label{opacity:.38!important;font-size:8px!important;letter-spacing:.14em!important;margin:8px 9px 5px!important}#profileCard,.profile-card{display:none!important}

    #pvRailExpandBtn{display:none;width:42px;height:38px;border:0!important;background:transparent!important;color:var(--sideText,#fff)!important;border-radius:9px;place-items:center;cursor:pointer;margin:0 0 4px 0;opacity:.86;padding:0}#pvRailExpandBtn:hover{background:rgba(255,255,255,.05)!important;opacity:1}
    body.pv-sidebar-rail .sidebar .brand{width:var(--pv-side-rail)!important;padding:0 12px!important;justify-content:center!important}body.pv-sidebar-rail .sidebar .brand img,body.pv-sidebar-rail .sidebar .brand small,body.pv-sidebar-rail .pv-brand-separator,body.pv-sidebar-rail .pv-brand-actions{display:none!important}body.pv-sidebar-rail .pv-mini-mark{display:grid!important}
    body.pv-sidebar-rail #pvSidebarBody{width:var(--pv-side-rail)!important;padding:6px 8px 10px!important;align-items:center!important}body.pv-sidebar-rail #pvRailExpandBtn{display:grid!important}body.pv-sidebar-rail .pv-side-search{width:42px!important;justify-content:center!important;padding:0!important}body.pv-sidebar-rail .pv-side-search span:last-child{display:none!important}body.pv-sidebar-rail #pvSidebarBody .section-label,body.pv-sidebar-rail #pvSidebarBody .help-btn{display:none!important}body.pv-sidebar-rail #pvSidebarBody .nav-row{display:block!important;width:42px!important}
    body.pv-sidebar-rail #pvSidebarBody .nav-btn,body.pv-sidebar-rail #pvSidebarBody .utility-btn,body.pv-sidebar-rail #pvSidebarBody #moreSections{width:42px!important;min-width:42px!important;height:38px!important;min-height:38px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}body.pv-sidebar-rail .pv-nav-label{display:none!important}body.pv-sidebar-rail .pv-nav-icon{display:inline-grid!important;place-items:center!important;width:20px!important;height:20px!important;margin:0!important;font-size:14px!important;flex:0 0 20px!important}body.pv-sidebar-rail #pvSidebarBody .divider{width:28px!important;margin:8px auto!important;opacity:.22!important}

    #pvSearchPopover{position:fixed;z-index:260;left:calc(var(--pv-side-wide) + 14px);top:10px;width:min(430px,calc(100vw - var(--pv-side-wide) - 30px));display:none;background:var(--panel,#fff);border:1px solid var(--line,#dce5dc);border-radius:12px;box-shadow:0 14px 34px rgba(0,0,0,.15);padding:0!important}
    #pvSearchPopover.open{display:block!important}body.pv-sidebar-rail #pvSearchPopover{left:calc(var(--pv-side-rail) + 12px);width:min(430px,calc(100vw - var(--pv-side-rail) - 28px))}
    #pvSearchPopover .searchbox,#pvSearchPopover .search-box,#pvSearchPopover .global-search,#pvSearchPopover .search{display:flex!important;width:100%!important;max-width:none!important;margin:0!important;box-shadow:none!important;border:0!important;background:transparent!important}
    #pvSearchPopover input{display:block!important;width:100%!important;max-width:none!important;min-width:0!important}

    #pvTopSection{display:flex;align-items:center;gap:9px;min-width:0;margin-right:auto}#pvTopSection .pv-currency-mark{width:34px;height:34px;border-radius:9px;background:var(--panel2,#eef3ed);color:var(--brand2,#2f7549);display:grid;place-items:center;font-weight:800;font-size:15px;flex:0 0 34px}#pvTopSection .pv-top-title{font-family:Georgia,serif;font-size:17px;font-weight:700;line-height:1.08;color:var(--ink,#17301f);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:250px}
    .page-head{display:none!important}.page-head .eyebrow,.page .eyebrow,.workspace .eyebrow{display:none!important}.workspace{padding-top:7px!important;padding-bottom:8px!important}.page{gap:7px!important}

    .stats,.stat-grid,.kpi-row{overflow:visible!important;align-items:stretch!important}.stat,.kpi,.stat-card{overflow:hidden!important;padding-bottom:9px!important;min-height:78px!important}.stat small,.stat .tiny,.stat .sub,.stat .subtitle,.stat [class*="sub"],.stat [class*="meta"],.kpi small,.kpi .tiny{line-height:1.28!important;min-height:1.28em!important;padding-bottom:2px!important;overflow:visible!important;white-space:normal!important}.stat .value,.stat .big,.kpi .value{line-height:1.08!important;margin-bottom:2px!important}
    .dashboard-grid{gap:8px!important}.dash-bottom{min-height:122px!important;overflow:hidden!important}.dash-bottom>.card{min-height:0!important;overflow:hidden!important}.dash-bottom .card-body{min-height:0!important;overflow:hidden!important;padding:6px 8px!important}.dash-bottom .quick-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important;height:100%!important;min-height:0!important;gap:6px!important}.dash-bottom .quick{min-height:0!important;height:100%!important;padding:3px 6px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2px!important;overflow:hidden!important}
    @media(max-height:720px){.dash-bottom{min-height:108px!important}.workspace{padding-top:5px!important;padding-bottom:5px!important}.stat,.kpi,.stat-card{min-height:74px!important;padding-bottom:7px!important}}
  `;
  document.head.appendChild(css);

  const currencySelect=()=>[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>['INR','USD','EUR','GBP'].includes((o.value||o.textContent||'').trim().toUpperCase())));
  const getCurrency=()=>{const sel=currencySelect();const raw=(sel?.value||window.state?.settings?.currency||window.S?.s?.currency||'INR').toString().toUpperCase();return CURRENCY[raw]?raw:'INR'};
  const pageTitle=()=>{const h=document.querySelector('.page-head h1,.page h1,.workspace h1');return h?.textContent.trim()||window.state?.view||window.view||'Finance Dashboard'};

  function cleanArabic(){
    document.querySelectorAll('select').forEach(sel=>{[...sel.options].forEach(opt=>{const v=(opt.value||'').trim().toLowerCase(),t=(opt.textContent||'').trim().toLowerCase();if(v==='ar'||v==='ar-sa'||t==='arabic'||t.includes('العربية'))opt.remove()})});
    if(document.documentElement.lang==='ar'||document.documentElement.dir==='rtl'){document.documentElement.lang='en';document.documentElement.dir='ltr';document.body?.removeAttribute('dir')}
    try{['pavenro.finance.language','pavenro.language','finance.language'].forEach(k=>{if((localStorage.getItem(k)||'').toLowerCase().startsWith('ar'))localStorage.setItem(k,'en')})}catch(_){ }
  }

  function normalizeNavButton(btn){
    if(!btn) return;
    const clone=btn.cloneNode(true);clone.querySelectorAll('.pv-nav-icon,.nav-icon,svg').forEach(x=>x.remove());
    const visible=(btn.querySelector('.pv-nav-label')?.textContent||clone.textContent||'').replace(/^\s*[⌂▣⇄▤◔↗◎□▦◉◇◆✎◷⚙?•]+\s*/,'').trim();
    const key=btn.dataset.v||btn.dataset.view||visible;const icon=ICONS[key]||btn.querySelector('.nav-icon')?.textContent.trim()||'•';
    btn.innerHTML='<span class="pv-nav-icon" aria-hidden="true"></span><span class="pv-nav-label"></span>';btn.querySelector('.pv-nav-icon').textContent=icon;btn.querySelector('.pv-nav-label').textContent=visible||key;btn.title=visible||key;
  }

  function setRail(v){document.body.classList.toggle('pv-sidebar-rail',!!v);try{localStorage.setItem('pavenro.finance.sidebar.rail',v?'1':'0')}catch(_){}}

  function ensureSidebar(){
    const sidebar=document.querySelector('.sidebar'),brand=sidebar?.querySelector('.brand');if(!sidebar||!brand)return false;
    ['pvSideMenuBtn','pvSideMenu','pvSidebarCollapse','pvSidebarExpand','pvSideCollapse','pvSideExpand','pvRailExpand','pvSideToggle','pvRailExpandBtn','pvSideSearch'].forEach(id=>document.getElementById(id)?.remove());brand.querySelectorAll('.pv-brand-actions,.pv-brand-separator,.pv-mini-mark').forEach(x=>x.remove());
    let small=brand.querySelector('small');if(!small){small=document.createElement('small');brand.appendChild(small)}small.textContent='FINANCE';const sep=document.createElement('span');sep.className='pv-brand-separator';sep.textContent='|';brand.insertBefore(sep,small);const mini=document.createElement('span');mini.className='pv-mini-mark';mini.textContent='P';brand.insertBefore(mini,brand.firstChild);
    const actions=document.createElement('div');actions.className='pv-brand-actions';actions.innerHTML='<button id="pvSideToggle" class="pv-panel-toggle" type="button" title="Collapse navigation" aria-label="Collapse navigation"><span class="pv-panel-icon" aria-hidden="true"></span></button>';brand.appendChild(actions);
    let body=document.getElementById('pvSidebarBody');if(!body){body=document.createElement('div');body.id='pvSidebarBody';[...sidebar.children].filter(el=>el!==brand).forEach(el=>body.appendChild(el));sidebar.appendChild(body)}
    [...body.querySelectorAll('.section-label')].forEach(el=>{if(/PAVENRO\s+FINANCE/i.test(el.textContent))el.remove()});body.querySelectorAll('.nav-btn,.utility-btn').forEach(normalizeNavButton);
    const expand=document.createElement('button');expand.id='pvRailExpandBtn';expand.type='button';expand.title='Expand navigation';expand.setAttribute('aria-label','Expand navigation');expand.innerHTML='<span class="pv-panel-icon" aria-hidden="true"></span>';body.insertBefore(expand,body.firstChild);
    const search=document.createElement('button');search.id='pvSideSearch';search.className='pv-side-search';search.type='button';search.innerHTML='<span class="pv-search-ico">⌕</span><span>Search</span>';body.insertBefore(search,expand.nextSibling);
    document.getElementById('pvSideToggle').onclick=()=>setRail(true);expand.onclick=()=>setRail(false);search.onclick=e=>{e.stopPropagation();toggleSearch()};
    setRail(localStorage.getItem('pavenro.finance.sidebar.rail')==='1');
    return true;
  }

  function ensureSearch(){
    let pop=document.getElementById('pvSearchPopover');if(!pop){pop=document.createElement('div');pop.id='pvSearchPopover';document.body.appendChild(pop)}
    const input=[...document.querySelectorAll('input')].find(i=>/search|खोज|搜索|buscar|rechercher|suchen|pesquisar|поиск|検索/i.test(i.placeholder||''));
    if(!input||pop.contains(input))return pop;
    const wrap=input.closest('.searchbox,.search-box,.global-search,.search')||input.parentElement;
    if(wrap&&wrap!==pop){pop.replaceChildren(wrap)}
    return pop;
  }
  function toggleSearch(){const pop=ensureSearch();if(!pop)return;pop.classList.toggle('open');if(pop.classList.contains('open'))setTimeout(()=>pop.querySelector('input')?.focus(),0)}

  function ensureTop(){
    const top=document.querySelector('.topbar');if(!top)return;
    const title=pageTitle();
    let holder=document.getElementById('pvTopSection');if(!holder){holder=document.createElement('div');holder.id='pvTopSection';holder.innerHTML='<div class="pv-currency-mark"></div><div class="pv-top-title"></div>';top.insertBefore(holder,top.firstChild)}
    holder.querySelector('.pv-currency-mark').textContent=CURRENCY[getCurrency()];holder.querySelector('.pv-top-title').textContent=title;
    ensureSearch();
  }

  function apply(){cleanArabic();ensureSidebar();ensureTop();document.querySelectorAll('#pvSidebarBody .help-btn').forEach(b=>{b.style.setProperty('border','0','important');b.style.setProperty('border-radius','0','important');b.style.setProperty('box-shadow','none','important');b.style.setProperty('background','transparent','important')})}

  document.addEventListener('click',e=>{if(!e.target.closest('#pvSearchPopover')&&!e.target.closest('#pvSideSearch'))document.getElementById('pvSearchPopover')?.classList.remove('open')},true);
  document.addEventListener('change',e=>{if(e.target===currencySelect())requestAnimationFrame(ensureTop)},true);

  let tries=0;const wait=setInterval(()=>{tries++;if(typeof window.render==='function'){
    if(!window.render.__pvV10Wrapped){const base=window.render;const wrapped=function(...args){const out=base.apply(this,args);requestAnimationFrame(apply);return out};wrapped.__pvV10Wrapped=true;window.render=wrapped}
    clearInterval(wait);requestAnimationFrame(apply)
  }else if(tries>160){clearInterval(wait);apply()}},40);
  setTimeout(apply,120);
})();
