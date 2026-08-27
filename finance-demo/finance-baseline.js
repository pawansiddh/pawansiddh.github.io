(()=>{
  if(window.__PAVENRO_FINANCE_BASELINE__) return;
  window.__PAVENRO_FINANCE_BASELINE__='2026.08.27-r1';

  const CURRENCY={INR:'₹',USD:'$',EUR:'€',GBP:'£',AED:'د.إ',CNY:'¥',JPY:'¥',RUB:'₽',CAD:'C$',AUD:'A$',SGD:'S$',CHF:'CHF'};
  const ICONS={Dashboard:'⌂',Accounts:'▣',Transactions:'⇄',Bills:'▤',Budget:'◔',Income:'↗','Funds & Goals':'◎',Documents:'□',Calendar:'▦',Subscriptions:'◉',Debt:'◇','Net Worth':'↗',Investments:'◆',Reports:'▤',Notes:'✎','Tax Records':'▧',Paydays:'◷',Groups:'◎',Settings:'⚙','Help & Support':'?'};
  const state={scheduled:false};

  const css=document.createElement('style');
  css.id='pavenro-finance-baseline-style';
  css.textContent=`
    :root{--pv-side-wide:226px;--pv-side-rail:58px;--pv-brand-h:60px}
    html,body,.app,.main{height:100vh!important;max-height:100vh!important;overflow:hidden!important}
    .app{transition:grid-template-columns .16s ease!important}
    body:not(.pv-sidebar-rail) .app{grid-template-columns:var(--pv-side-wide) minmax(0,1fr)!important}
    body.pv-sidebar-rail .app{grid-template-columns:var(--pv-side-rail) minmax(0,1fr)!important}

    .sidebar{position:relative!important;overflow:visible!important;background:var(--sidebar,#123f2b)!important;border-right:0!important}
    .sidebar .brand{position:fixed!important;left:0!important;top:0!important;z-index:180!important;width:var(--pv-side-wide)!important;height:var(--pv-brand-h)!important;min-height:var(--pv-brand-h)!important;padding:0 10px!important;margin:0!important;display:flex!important;align-items:center!important;gap:6px!important;background:var(--sidebar,#123f2b)!important;border:0!important;box-shadow:none!important;transition:width .16s ease!important}
    .sidebar .brand img{width:95px!important;max-width:95px!important;height:auto!important;object-fit:contain!important;filter:brightness(0) invert(1)!important;opacity:1!important;flex:0 0 auto!important}
    .sidebar .brand small{font-size:8.5px!important;line-height:1!important;letter-spacing:.13em!important;font-weight:900!important;color:#fff!important;white-space:nowrap!important;opacity:.95!important}
    .pv-brand-separator{font-size:14px;color:rgba(255,255,255,.42);line-height:1}.pv-mini-mark{display:none;width:34px;height:34px;border-radius:9px;place-items:center;background:rgba(255,255,255,.07);color:#fff;font:800 17px/1 Inter,system-ui}
    .pv-brand-actions{margin-left:auto;display:flex;align-items:center}.pv-panel-toggle{width:30px;height:30px;border:0!important;background:transparent!important;color:#fff!important;border-radius:8px;display:grid;place-items:center;cursor:pointer;opacity:.82;padding:0}.pv-panel-toggle:hover{background:rgba(255,255,255,.055)!important;opacity:1}
    .pv-panel-icon{width:16px;height:14px;border:1.55px solid currentColor;border-radius:4px;display:block;position:relative}.pv-panel-icon:before{content:'';position:absolute;top:0;bottom:0;left:5px;width:1.4px;background:currentColor;opacity:.8}
    #pvSidebarBody{position:fixed!important;left:0!important;top:var(--pv-brand-h)!important;bottom:0!important;z-index:150!important;width:var(--pv-side-wide)!important;padding:6px 10px 10px!important;display:flex!important;flex-direction:column!important;background:var(--sidebar,#123f2b)!important;color:var(--sideText,#fff)!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:none!important;transition:width .16s ease,padding .16s ease!important}
    #pvSidebarBody::-webkit-scrollbar{width:0!important;height:0!important}
    #pvSidebarBody .section-label{opacity:.36!important;font-size:8px!important;letter-spacing:.14em!important;margin:8px 9px 5px!important}
    #pvSidebarBody .nav-row{grid-template-columns:minmax(0,1fr) 22px!important;gap:1px!important;align-items:center!important}
    #pvSidebarBody .nav-btn,#pvSidebarBody .utility-btn,#pvSidebarBody #moreSections{min-height:36px!important;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;border-radius:9px!important;color:var(--sideText,#fff)!important;padding:0 9px!important;margin:0!important;transition:background .14s ease,opacity .14s ease!important}
    #pvSidebarBody .nav-btn:hover,#pvSidebarBody .utility-btn:hover,#pvSidebarBody #moreSections:hover{background:rgba(255,255,255,.045)!important}
    #pvSidebarBody .nav-btn.active{background:rgba(255,255,255,.065)!important;box-shadow:inset 2px 0 0 rgba(255,255,255,.28)!important}
    #pvSidebarBody .help-btn,#pvSidebarBody button.help-btn{width:22px!important;height:26px!important;min-width:22px!important;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important;color:var(--sideText,#fff)!important;padding:0!important;font-size:11px!important;line-height:1!important;opacity:.23!important;appearance:none!important;-webkit-appearance:none!important}
    #pvSidebarBody .help-btn:before,#pvSidebarBody .help-btn:after{display:none!important;content:none!important}
    #pvSidebarBody .nav-row:hover .help-btn,#pvSidebarBody .nav-btn.active+.help-btn{opacity:.52!important}#pvSidebarBody .help-btn:hover{opacity:.82!important;background:transparent!important}
    #profileCard,.profile-card,.sidebar .profile{display:none!important}
    .pv-side-search{width:100%;height:38px;border:0!important;background:transparent!important;color:var(--sideText,#fff)!important;border-radius:9px;display:flex;align-items:center;gap:11px;padding:0 10px;cursor:pointer;font-size:12px;font-weight:600;opacity:.86;margin-bottom:4px}.pv-side-search:hover{background:rgba(255,255,255,.05)!important;opacity:1}.pv-side-search .pv-search-ico{width:18px;text-align:center;font-size:16px;flex:0 0 18px}
    #pvRailExpandBtn{display:none;width:42px;height:38px;border:0!important;background:transparent!important;color:var(--sideText,#fff)!important;border-radius:9px;place-items:center;cursor:pointer;margin:0 0 4px 0;opacity:.86;padding:0}#pvRailExpandBtn:hover{background:rgba(255,255,255,.05)!important;opacity:1}
    body.pv-sidebar-rail .sidebar .brand{width:var(--pv-side-rail)!important;padding:0 12px!important;justify-content:center!important}body.pv-sidebar-rail .sidebar .brand img,body.pv-sidebar-rail .sidebar .brand small,body.pv-sidebar-rail .pv-brand-separator,body.pv-sidebar-rail .pv-brand-actions{display:none!important}body.pv-sidebar-rail .pv-mini-mark{display:grid!important}
    body.pv-sidebar-rail #pvSidebarBody{width:var(--pv-side-rail)!important;padding:6px 8px 10px!important;align-items:center!important}body.pv-sidebar-rail #pvRailExpandBtn{display:grid!important}body.pv-sidebar-rail .pv-side-search{width:42px!important;justify-content:center!important;padding:0!important}body.pv-sidebar-rail .pv-side-search span:last-child{display:none!important}body.pv-sidebar-rail #pvSidebarBody .section-label,body.pv-sidebar-rail #pvSidebarBody .help-btn{display:none!important}body.pv-sidebar-rail #pvSidebarBody .nav-row{display:block!important;width:42px!important}
    body.pv-sidebar-rail #pvSidebarBody .nav-btn,body.pv-sidebar-rail #pvSidebarBody .utility-btn,body.pv-sidebar-rail #pvSidebarBody #moreSections{width:42px!important;min-width:42px!important;height:38px!important;min-height:38px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}body.pv-sidebar-rail .pv-nav-label{display:none!important}body.pv-sidebar-rail .pv-nav-icon{display:inline-grid!important;place-items:center!important;width:20px!important;height:20px!important;margin:0!important;font-size:14px!important;flex:0 0 20px!important}body.pv-sidebar-rail #pvSidebarBody .divider{width:28px!important;margin:8px auto!important;opacity:.22!important}

    #pvSearchPopover{position:fixed;z-index:260;left:calc(var(--pv-side-wide) + 14px);top:10px;width:min(430px,calc(100vw - var(--pv-side-wide) - 30px));display:none;background:var(--panel,#fff);border:1px solid var(--line,#dce5dc);border-radius:12px;box-shadow:0 14px 34px rgba(0,0,0,.15);padding:0!important}
    #pvSearchPopover.open{display:block!important}body.pv-sidebar-rail #pvSearchPopover{left:calc(var(--pv-side-rail) + 12px);width:min(430px,calc(100vw - var(--pv-side-rail) - 28px))}
    #pvSearchPopover .searchbox,#pvSearchPopover .search-box,#pvSearchPopover .global-search,#pvSearchPopover .search{display:flex!important;width:100%!important;max-width:none!important;margin:0!important;box-shadow:none!important;border:0!important;background:transparent!important}
    #pvSearchPopover input{display:block!important;width:100%!important;max-width:none!important;min-width:0!important}

    #pvTopSection{display:flex;align-items:center;gap:9px;min-width:0;margin-right:auto}#pvTopSection .pv-currency-mark{width:34px;height:34px;border-radius:9px;background:var(--panel2,#eef3ed);color:var(--brand2,#2f7549);display:grid;place-items:center;font-weight:800;font-size:15px;flex:0 0 34px}#pvTopSection .pv-top-title{font-family:Georgia,serif;font-size:17px;font-weight:700;line-height:1.08;color:var(--ink,#17301f);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:250px}
    .page-head{display:none!important}.page-head .eyebrow,.page .eyebrow,.workspace .eyebrow{display:none!important}.workspace{padding-top:7px!important;padding-bottom:8px!important;overflow:hidden!important}.page{gap:7px!important;overflow:hidden!important}

    .card{box-shadow:none!important;border-color:var(--line,#dce5dc)!important}.card:hover{box-shadow:0 0 0 1px rgba(30,78,49,.035)!important}
    .stats,.stat-grid,.kpi-row{overflow:visible!important;align-items:stretch!important}.stat,.kpi,.stat-card{overflow:hidden!important;padding-bottom:9px!important;min-height:78px!important}.stat-top{line-height:1.12!important;min-height:24px!important}.stat-foot,.stat small,.stat .tiny,.stat .sub,.stat .subtitle,.stat [class*="sub"],.stat [class*="meta"],.kpi small,.kpi .tiny{line-height:1.32!important;min-height:1.32em!important;padding-bottom:3px!important;overflow:visible!important;white-space:normal!important}.stat-value,.stat .value,.stat .big,.kpi .value{line-height:1.1!important;margin-bottom:2px!important}
    table td,table th{line-height:1.25!important}td .pill,td .status,td small{margin-left:4px!important}td>:first-child{margin-left:0!important}

    .dashboard-grid{gap:8px!important;overflow:hidden!important}.dash-top,.dash-mid,.dash-bottom{min-height:0!important;overflow:hidden!important}.dash-bottom{min-height:122px!important}.dash-bottom>.card{min-height:0!important;overflow:hidden!important}.dash-bottom .card-body{min-height:0!important;overflow:hidden!important;padding:6px 8px!important}.dash-bottom .quick-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important;height:100%!important;min-height:0!important;gap:6px!important}.dash-bottom .quick{min-height:0!important;height:100%!important;padding:4px 6px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2px!important;overflow:hidden!important}
    .card-body.scroll,.table-wrap,.detail,.transfer-list,.list-scroll{overflow:auto!important;overscroll-behavior:contain!important}

    .donut{width:132px!important;height:132px!important;min-width:132px!important;min-height:132px!important;position:relative!important}.donut:after{inset:24px!important}.donut-center{position:absolute!important;inset:24px!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;padding:4px!important;line-height:1!important;overflow:hidden!important;z-index:2!important;pointer-events:none!important}.donut-center .pv-donut-inner{width:100%!important;max-width:82px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2px!important;min-width:0!important}.donut-center .pv-donut-value{display:block!important;width:100%!important;font-family:Georgia,serif!important;font-size:10px!important;font-weight:800!important;line-height:1.05!important;white-space:nowrap!important;text-align:center!important;overflow:hidden!important}.donut-center .pv-donut-label{display:block!important;width:100%!important;font-size:7.8px!important;font-weight:700!important;line-height:1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.distribution{grid-template-columns:148px minmax(0,1fr)!important;gap:9px!important}.legend{gap:5px!important;min-width:0!important;overflow:hidden!important}.legend-row{grid-template-columns:9px minmax(0,1fr) auto!important;gap:5px!important;font-size:9px!important;min-width:0!important}.legend-row span{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;min-width:0!important}.legend-row b{font-size:9px!important;white-space:nowrap!important}

    html[lang="hi"] body,html[lang="de"] body,html[lang="fr"] body,html[lang="pt"] body,html[lang="ru"] body{font-size:12.5px!important}html[lang="hi"] .nav-btn,html[lang="de"] .nav-btn,html[lang="fr"] .nav-btn,html[lang="pt"] .nav-btn,html[lang="ru"] .nav-btn{font-size:11px!important}html[lang="zh"] #pvTopSection .pv-top-title,html[lang="ja"] #pvTopSection .pv-top-title{font-family:Inter,system-ui,sans-serif!important}

    @media(max-height:720px){.dash-bottom{min-height:108px!important}.workspace{padding-top:5px!important;padding-bottom:5px!important}.stat,.kpi,.stat-card{min-height:74px!important;padding-bottom:7px!important}.donut{width:116px!important;height:116px!important;min-width:116px!important;min-height:116px!important}.donut:after,.donut-center{inset:21px!important}.distribution{grid-template-columns:130px minmax(0,1fr)!important}}
  `;
  document.head.appendChild(css);

  const currencySelect=()=>[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>['INR','USD','EUR','GBP','AED','CNY','JPY','RUB','CAD','AUD','SGD','CHF'].includes((o.value||o.textContent||'').trim().toUpperCase())));
  const getCurrency=()=>{const sel=currencySelect();const raw=(sel?.value||window.state?.settings?.currency||window.S?.s?.currency||'INR').toString().toUpperCase();return CURRENCY[raw]?raw:'INR'};
  const pageTitle=()=>{const h=document.querySelector('.page-head h1,.page h1,.workspace h1');return h?.textContent.trim()||window.state?.view||window.view||'Finance Dashboard'};

  function removeArabic(){
    document.querySelectorAll('select').forEach(sel=>{
      let removedSelected=false;
      [...sel.options].forEach(opt=>{const v=(opt.value||'').trim().toLowerCase(),t=(opt.textContent||'').trim().toLowerCase();if(v==='ar'||v==='ar-sa'||t==='arabic'||t.includes('العربية')){removedSelected=removedSelected||opt.selected;opt.remove()}});
      if(removedSelected&&sel.options.length){const en=[...sel.options].find(o=>['en','en-us','english'].includes((o.value||'').trim().toLowerCase())||(o.textContent||'').trim().toLowerCase()==='english');sel.value=en?en.value:sel.options[0].value;sel.dispatchEvent(new Event('change',{bubbles:true}))}
    });
    if(document.documentElement.lang==='ar'||document.documentElement.dir==='rtl'){document.documentElement.lang='en';document.documentElement.dir='ltr';document.body?.removeAttribute('dir')}
    try{['pavenro.finance.language','pavenro.language','finance.language'].forEach(k=>{if((localStorage.getItem(k)||'').toLowerCase().startsWith('ar'))localStorage.setItem(k,'en')})}catch(_){ }
  }

  function normalizeNavButton(btn){
    if(!btn) return;
    const oldIcon=btn.querySelector('.nav-icon')?.textContent.trim();
    const clone=btn.cloneNode(true);clone.querySelectorAll('.pv-nav-icon,.nav-icon,svg').forEach(x=>x.remove());
    const visible=(btn.querySelector('.pv-nav-label')?.textContent||clone.textContent||'').replace(/^\s*[⌂▣⇄▤◔↗◎□▦◉◇◆✎◷⚙?•]+\s*/,'').trim();
    const key=btn.dataset.v||btn.dataset.view||visible;const icon=ICONS[key]||oldIcon||'•';
    btn.innerHTML='<span class="pv-nav-icon" aria-hidden="true"></span><span class="pv-nav-label"></span>';btn.querySelector('.pv-nav-icon').textContent=icon;btn.querySelector('.pv-nav-label').textContent=visible||key;btn.title=visible||key;
  }

  function setRail(v){document.body.classList.toggle('pv-sidebar-rail',!!v);try{localStorage.setItem('pavenro.finance.sidebar.rail',v?'1':'0')}catch(_){}}

  function ensureSidebar(){
    const sidebar=document.querySelector('.sidebar'),brand=sidebar?.querySelector('.brand');if(!sidebar||!brand)return false;
    ['pvSideMenuBtn','pvSideMenu','pvSidebarCollapse','pvSidebarExpand','pvSideCollapse','pvSideExpand','pvRailExpand','pvSideToggle','pvRailExpandBtn','pvSideSearch'].forEach(id=>document.getElementById(id)?.remove());
    brand.querySelectorAll('.pv-brand-actions,.pv-brand-separator,.pv-mini-mark').forEach(x=>x.remove());
    [...brand.querySelectorAll('button')].forEach(b=>{if((b.textContent||'').trim()==='⋮'||b.title?.toLowerCase().includes('menu'))b.remove()});
    let small=brand.querySelector('small');if(!small){small=document.createElement('small');brand.appendChild(small)}small.textContent='FINANCE';
    const sep=document.createElement('span');sep.className='pv-brand-separator';sep.textContent='|';brand.insertBefore(sep,small);
    const mini=document.createElement('span');mini.className='pv-mini-mark';mini.textContent='P';brand.insertBefore(mini,brand.firstChild);
    const actions=document.createElement('div');actions.className='pv-brand-actions';actions.innerHTML='<button id="pvSideToggle" class="pv-panel-toggle" type="button" title="Collapse navigation" aria-label="Collapse navigation"><span class="pv-panel-icon" aria-hidden="true"></span></button>';brand.appendChild(actions);
    let body=document.getElementById('pvSidebarBody');
    if(!body){body=document.createElement('div');body.id='pvSidebarBody';[...sidebar.children].filter(el=>el!==brand).forEach(el=>body.appendChild(el));sidebar.appendChild(body)}
    [...body.querySelectorAll('.section-label')].forEach(el=>{if(/PAVENRO\s+FINANCE/i.test(el.textContent))el.remove()});
    body.querySelectorAll('.nav-btn,.utility-btn').forEach(normalizeNavButton);
    const expand=document.createElement('button');expand.id='pvRailExpandBtn';expand.type='button';expand.title='Expand navigation';expand.setAttribute('aria-label','Expand navigation');expand.innerHTML='<span class="pv-panel-icon" aria-hidden="true"></span>';body.insertBefore(expand,body.firstChild);
    const search=document.createElement('button');search.id='pvSideSearch';search.className='pv-side-search';search.type='button';search.innerHTML='<span class="pv-search-ico">⌕</span><span>Search</span>';body.insertBefore(search,expand.nextSibling);
    setRail(localStorage.getItem('pavenro.finance.sidebar.rail')==='1');
    document.getElementById('pvSideToggle').onclick=()=>setRail(true);expand.onclick=()=>setRail(false);search.onclick=()=>openSearch();
    return true;
  }

  function ensureSearch(){
    let pop=document.getElementById('pvSearchPopover');if(!pop){pop=document.createElement('div');pop.id='pvSearchPopover';document.body.appendChild(pop)}
    const candidate=[...document.querySelectorAll('.topbar .searchbox,.topbar .search-box,.topbar .global-search,.topbar .search')].find(el=>el.querySelector('input'))||[...document.querySelectorAll('.topbar input')].find(i=>/search|खोज|搜索|chercher|buscar|suchen|поиск/i.test(i.placeholder||''))?.closest('div');
    if(candidate&&candidate!==pop&&!pop.contains(candidate)) pop.appendChild(candidate);
    document.querySelectorAll('.topbar input').forEach(i=>{if(/search|खोज|搜索|chercher|buscar|suchen|поиск/i.test(i.placeholder||'')&&!pop.contains(i)){const wrap=i.closest('.searchbox,.search-box,.global-search,.search')||i;pop.appendChild(wrap)}});
    return pop;
  }
  function openSearch(){const pop=ensureSearch();pop.classList.add('open');requestAnimationFrame(()=>pop.querySelector('input')?.focus())}
  function closeSearch(){document.getElementById('pvSearchPopover')?.classList.remove('open')}

  function ensureTopSection(){
    const top=document.querySelector('.topbar');if(!top)return;
    let holder=document.getElementById('pvTopSection');if(!holder){holder=document.createElement('div');holder.id='pvTopSection';holder.innerHTML='<div class="pv-currency-mark"></div><div class="pv-top-title"></div>';top.insertBefore(holder,top.firstChild)}
    holder.querySelector('.pv-currency-mark').textContent=CURRENCY[getCurrency()];holder.querySelector('.pv-top-title').textContent=pageTitle();
  }

  function removeRepeatedBrandText(){
    document.querySelectorAll('.eyebrow').forEach(el=>{if(/PAVENRO|FINANCE/i.test(el.textContent))el.style.display='none'});
    document.querySelectorAll('.page-head,.workspace,.page').forEach(root=>{[...root.querySelectorAll('small,span,div')].forEach(el=>{if(el.children.length)return;const t=el.textContent.trim();if(/^PAVENRO\s*(FOCUS\s*[·|•-]\s*)?FINANCE$/i.test(t))el.style.display='none'})});
  }

  function normalizeDonuts(){
    document.querySelectorAll('.donut-center').forEach(c=>{
      if(c.querySelector('.pv-donut-inner'))return;
      const text=c.textContent.trim();if(!text)return;
      const parts=text.split(/\s+(?=[A-Za-zÀ-ž\u0900-\u097F\u4E00-\u9FFF])/);const value=parts.shift()||text,label=parts.join(' ');
      c.innerHTML='<span class="pv-donut-inner"><span class="pv-donut-value"></span><span class="pv-donut-label"></span></span>';c.querySelector('.pv-donut-value').textContent=value;c.querySelector('.pv-donut-label').textContent=label||'Total';
    });
  }

  function dedupeContainerEdits(){
    document.querySelectorAll('.detail,.detail-card,.sidepanel,.card').forEach(box=>{
      if(box.querySelector('table'))return;
      const edits=[...box.querySelectorAll('button')].filter(b=>/^edit(?:\s+(?:limit|goal|account|subscription|debt|asset|investment))?$/i.test((b.textContent||'').trim()));
      edits.slice(1).forEach(b=>b.remove());
    });
  }

  function apply(){
    removeArabic();ensureSidebar();ensureSearch();ensureTopSection();removeRepeatedBrandText();normalizeDonuts();dedupeContainerEdits();
    document.body.dataset.financeBaseline=window.__PAVENRO_FINANCE_BASELINE__;
  }
  function schedule(){if(state.scheduled)return;state.scheduled=true;requestAnimationFrame(()=>{state.scheduled=false;apply()})}

  document.addEventListener('change',e=>{if(e.target===currencySelect()||e.target.matches?.('select'))schedule()},true);
  document.addEventListener('click',e=>{const pop=document.getElementById('pvSearchPopover');if(pop?.classList.contains('open')&&!e.target.closest('#pvSearchPopover')&&!e.target.closest('#pvSideSearch'))closeSearch()},true);

  const observer=new MutationObserver(muts=>{if(muts.some(m=>m.addedNodes.length||m.removedNodes.length))schedule()});
  observer.observe(document.documentElement,{subtree:true,childList:true});

  let tries=0;const boot=setInterval(()=>{
    tries++;
    if(typeof window.render==='function'&&!window.render.__financeBaselineWrapped){const base=window.render;const wrapped=function(...args){const out=base.apply(this,args);schedule();return out};wrapped.__financeBaselineWrapped=true;window.render=wrapped;clearInterval(boot);schedule()}
    else if(tries>160){clearInterval(boot);schedule()}
  },50);
  schedule();
})();
