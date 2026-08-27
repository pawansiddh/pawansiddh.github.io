(()=>{
  if(window.__PAVENRO_FINANCE_RAIL_V8__) return;
  window.__PAVENRO_FINANCE_RAIL_V8__=true;

  const ICONS={
    'Dashboard':'⌂','Accounts':'▣','Transactions':'⇄','Bills':'▤','Budget':'◔','Income':'↗',
    'Funds & Goals':'◎','Documents':'□','Calendar':'▦','Subscriptions':'◉','Debt':'◇',
    'Net Worth':'↗','Investments':'◆','Reports':'▤','Notes':'✎','Tax Records':'▧','Paydays':'◷',
    'Groups':'◎','Settings':'⚙','Help & Support':'?','More sections':'+','+ More sections':'+'
  };

  const style=document.createElement('style');
  style.id='pv-finance-rail-v8-style';
  style.textContent=`
    :root{--pv-rail-w:56px}
    body.pv-sidebar-rail .app{grid-template-columns:var(--pv-rail-w) minmax(0,1fr)!important}
    body.pv-sidebar-rail .sidebar{width:var(--pv-rail-w)!important;min-width:var(--pv-rail-w)!important;overflow:visible!important}
    body.pv-sidebar-rail .sidebar .brand{
      width:var(--pv-rail-w)!important;min-width:var(--pv-rail-w)!important;height:58px!important;min-height:58px!important;
      padding:0!important;display:grid!important;place-items:center!important;overflow:hidden!important
    }
    body.pv-sidebar-rail .sidebar .brand img,
    body.pv-sidebar-rail .sidebar .brand small,
    body.pv-sidebar-rail .sidebar .brand .pv-brand-separator,
    body.pv-sidebar-rail .sidebar .brand .pv-brand-actions{display:none!important}
    body.pv-sidebar-rail .sidebar .brand .pv-mini-mark{display:grid!important;width:34px!important;height:34px!important;margin:0!important}

    body.pv-sidebar-rail #pvSidebarBody{
      top:58px!important;left:0!important;width:var(--pv-rail-w)!important;min-width:var(--pv-rail-w)!important;
      padding:5px 7px 10px!important;align-items:center!important;overflow-y:auto!important;overflow-x:hidden!important
    }
    body.pv-sidebar-rail #pvSidebarBody .section-label,
    body.pv-sidebar-rail #pvSidebarBody .section-title,
    body.pv-sidebar-rail #pvSidebarBody .side-label{display:none!important}

    #pvRailRestoreV8{display:none}
    body.pv-sidebar-rail #pvRailRestoreV8,
    body.pv-sidebar-rail .pv-side-search{
      display:grid!important;place-items:center!important;width:42px!important;height:38px!important;min-width:42px!important;
      padding:0!important;margin:0 0 4px!important;border:0!important;border-radius:10px!important;
      background:transparent!important;color:var(--sideText,#fff)!important;cursor:pointer!important;font-size:18px!important
    }
    body.pv-sidebar-rail #pvRailRestoreV8:hover,
    body.pv-sidebar-rail .pv-side-search:hover{background:rgba(255,255,255,.06)!important}
    body.pv-sidebar-rail .pv-side-search>*:not(.pv-search-ico){display:none!important}
    body.pv-sidebar-rail .pv-side-search .pv-search-ico{display:block!important;margin:0!important;width:auto!important;font-size:16px!important}

    body.pv-sidebar-rail #pvSidebarBody .nav-row{
      display:block!important;width:42px!important;min-width:42px!important;height:38px!important;margin:0 0 2px!important
    }
    body.pv-sidebar-rail #pvSidebarBody .nav-row>.help-btn,
    body.pv-sidebar-rail #pvSidebarBody .nav-row>.q,
    body.pv-sidebar-rail #pvSidebarBody .nav-row>button:last-child:not(.nav-btn),
    body.pv-sidebar-rail #pvSidebarBody .help-btn,
    body.pv-sidebar-rail #pvSidebarBody button[data-q]{display:none!important}

    body.pv-sidebar-rail #pvSidebarBody .nav-btn,
    body.pv-sidebar-rail #pvSidebarBody .utility-btn,
    body.pv-sidebar-rail #pvSidebarBody #moreSections{
      position:relative!important;display:grid!important;place-items:center!important;
      width:42px!important;min-width:42px!important;height:38px!important;min-height:38px!important;
      padding:0!important;margin:0!important;border:0!important;border-radius:10px!important;
      background:transparent!important;box-shadow:none!important;color:transparent!important;
      font-size:0!important;line-height:0!important;overflow:hidden!important
    }
    body.pv-sidebar-rail #pvSidebarBody .nav-btn::before,
    body.pv-sidebar-rail #pvSidebarBody .utility-btn::before,
    body.pv-sidebar-rail #pvSidebarBody #moreSections::before{
      content:attr(data-pv-rail-icon)!important;color:var(--sideText,#fff)!important;font-size:15px!important;
      line-height:1!important;display:block!important;opacity:.88!important
    }
    body.pv-sidebar-rail #pvSidebarBody .nav-btn:hover,
    body.pv-sidebar-rail #pvSidebarBody .utility-btn:hover,
    body.pv-sidebar-rail #pvSidebarBody #moreSections:hover{background:rgba(255,255,255,.06)!important}
    body.pv-sidebar-rail #pvSidebarBody .nav-btn.active{
      background:rgba(255,255,255,.085)!important;box-shadow:none!important
    }
    body.pv-sidebar-rail #pvSidebarBody .nav-btn.active::before{opacity:1!important}
    body.pv-sidebar-rail #pvSidebarBody .divider{width:28px!important;min-width:28px!important;margin:7px auto!important;opacity:.22!important}

    body.pv-sidebar-rail .main{min-width:0!important;margin-left:0!important}
    body.pv-sidebar-rail .workspace{padding-left:14px!important}
    body.pv-sidebar-rail .topbar{padding-left:14px!important}

    /* Expanded sidebar: remove heavy outlines and keep help controls visually secondary. */
    body:not(.pv-sidebar-rail) #pvSidebarBody .nav-btn,
    body:not(.pv-sidebar-rail) #pvSidebarBody .utility-btn,
    body:not(.pv-sidebar-rail) #pvSidebarBody #moreSections{border:0!important;box-shadow:none!important}
    body:not(.pv-sidebar-rail) #pvSidebarBody .help-btn,
    body:not(.pv-sidebar-rail) #pvSidebarBody button[data-q]{border:0!important;background:transparent!important;opacity:.2!important}
    body:not(.pv-sidebar-rail) #pvSidebarBody .nav-row:hover .help-btn,
    body:not(.pv-sidebar-rail) #pvSidebarBody .nav-row:hover button[data-q]{opacity:.58!important}
  `;
  document.head.appendChild(style);

  function labelOf(btn){
    const raw=(btn.dataset.pvLabel || btn.getAttribute('aria-label') || btn.textContent || '').replace(/\s+/g,' ').trim();
    let clean=raw.replace(/^[⌂▣⇄▤◔↗◎□▦◉◇◆✎▧◷⚙?+]+\s*/, '').trim();
    if(clean==='More sections' || clean==='+ More sections') return 'More sections';
    const match=Object.keys(ICONS).find(k=>clean===k || clean.endsWith(k));
    return match || clean;
  }

  function prepareButtons(root){
    root.querySelectorAll('.nav-btn,.utility-btn,#moreSections').forEach(btn=>{
      const label=labelOf(btn);
      if(label) btn.dataset.pvLabel=label;
      btn.dataset.pvRailIcon=ICONS[label] || '•';
      if(!btn.title && label) btn.title=label;
    });
  }

  function ensureRestore(body){
    let b=document.getElementById('pvRailRestoreV8');
    if(!b){
      b=document.createElement('button');
      b.id='pvRailRestoreV8';
      b.type='button';
      b.textContent='☰';
      b.title='Expand navigation';
      b.setAttribute('aria-label','Expand finance navigation');
      body.prepend(b);
    }
    b.onclick=()=>{
      document.body.classList.remove('pv-sidebar-rail');
      localStorage.setItem('pavenro.finance.sidebar.rail','0');
      localStorage.setItem('pavenro.finance.sidebar.collapsed','0');
      requestAnimationFrame(apply);
    };
  }

  function wireCollapse(){
    const collapse=document.getElementById('pvSideCollapse');
    if(collapse && !collapse.dataset.pvV8){
      collapse.dataset.pvV8='1';
      collapse.onclick=()=>{
        document.body.classList.add('pv-sidebar-rail');
        localStorage.setItem('pavenro.finance.sidebar.rail','1');
        localStorage.setItem('pavenro.finance.sidebar.collapsed','0');
        requestAnimationFrame(apply);
      };
    }
    document.querySelectorAll('[data-pv-side="toggle"]').forEach(btn=>{
      if(btn.dataset.pvV8)return;
      btn.dataset.pvV8='1';
      btn.onclick=()=>{
        const rail=!document.body.classList.contains('pv-sidebar-rail');
        document.body.classList.toggle('pv-sidebar-rail',rail);
        localStorage.setItem('pavenro.finance.sidebar.rail',rail?'1':'0');
        localStorage.setItem('pavenro.finance.sidebar.collapsed','0');
        requestAnimationFrame(apply);
      };
    });
  }

  function normalizeState(){
    if(localStorage.getItem('pavenro.finance.sidebar.collapsed')==='1'){
      localStorage.setItem('pavenro.finance.sidebar.collapsed','0');
      localStorage.setItem('pavenro.finance.sidebar.rail','1');
    }
    document.body.classList.remove('pv-sidebar-collapsed');
    document.body.classList.toggle('pv-sidebar-rail',localStorage.getItem('pavenro.finance.sidebar.rail')==='1');
  }

  function apply(){
    const body=document.getElementById('pvSidebarBody');
    const sidebar=document.querySelector('.sidebar');
    if(!body || !sidebar) return false;
    normalizeState();
    prepareButtons(body);
    ensureRestore(body);
    wireCollapse();
    body.querySelectorAll('.help-btn,button[data-q],.q').forEach(q=>{
      if(document.body.classList.contains('pv-sidebar-rail')) q.style.setProperty('display','none','important');
      else q.style.removeProperty('display');
    });
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{tries++;if(apply()||tries>160)clearInterval(timer)},50);
  const observer=new MutationObserver(()=>requestAnimationFrame(apply));
  setTimeout(()=>{
    const root=document.querySelector('.app')||document.body;
    observer.observe(root,{childList:true,subtree:true});
    apply();
  },350);
})();
