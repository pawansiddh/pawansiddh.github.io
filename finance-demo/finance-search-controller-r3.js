(()=>{
  if(window.__PV_FIN_SEARCH_R3)return;
  window.__PV_FIN_SEARCH_R3=1;

  const q=(s,r=document)=>r.querySelector(s);
  const A=(s,r=document)=>[...r.querySelectorAll(s)];
  const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();

  const style=document.createElement('style');
  style.id='pv-fin-search-r3-style';
  style.textContent=`
    /* Search is never allowed to render directly inside the Finance topbar. */
    .topbar input[placeholder*="search" i],
    .topbar input[type="search"]{display:none!important;visibility:hidden!important;pointer-events:none!important}
    .topbar form:has(> input[placeholder*="search" i]),
    .topbar div:has(> input[placeholder*="search" i]),
    .topbar label:has(> input[placeholder*="search" i]),
    .topbar form:has(> input[type="search"]),
    .topbar div:has(> input[type="search"]),
    .topbar label:has(> input[type="search"]){display:none!important;visibility:hidden!important;pointer-events:none!important}
    #pvSearch{display:none!important;opacity:0!important;pointer-events:none!important}
    #pvSearch.open{display:block!important;opacity:1!important;pointer-events:auto!important}
    #pvSearch.open input[placeholder*="search" i],
    #pvSearch.open input[type="search"]{display:block!important;visibility:visible!important;pointer-events:auto!important}
    #pvSearch.open form:has(> input[placeholder*="search" i]),
    #pvSearch.open div:has(> input[placeholder*="search" i]),
    #pvSearch.open label:has(> input[placeholder*="search" i]),
    #pvSearch.open form:has(> input[type="search"]),
    #pvSearch.open div:has(> input[type="search"]),
    #pvSearch.open label:has(> input[type="search"]){display:flex!important;visibility:visible!important;pointer-events:auto!important}

    /* Final icon swap: currency lives in sidebar brand position, panel toggle lives in top title position. */
    .pv-brand-actions #pvCollapse{display:none!important}
    #pvExpand{display:none!important}
    .pv-currency-home{width:30px;height:30px;display:grid;place-items:center;border:0;border-radius:8px;background:transparent;color:#fff;font-weight:800;font-size:13px;line-height:1;white-space:nowrap}
    body.pv-rail .pv-currency-home{display:grid!important}
    #pvTop>.pv-cur{display:none!important}
    #pvTopPanelToggle{width:34px;height:34px;min-width:34px;padding:0;border:0;border-radius:9px;background:var(--panel2,#eef3ed);color:var(--brand2,#2f7549);display:grid;place-items:center;cursor:pointer;box-shadow:none}
    #pvTopPanelToggle:hover{filter:brightness(.98)}
    #pvTopPanelToggle .pv-picon{width:16px;height:14px}

    /* Top-right actions: Expense + Transaction match month-selector dimensions. */
    .topbar .pv-top-action{width:var(--pv-top-control-w,116px)!important;min-width:var(--pv-top-control-w,116px)!important;max-width:var(--pv-top-control-w,116px)!important;height:38px!important;min-height:38px!important;padding:0 10px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:10.5px!important}
    .topbar .pv-new-expense{background:var(--panel,#fff)!important;color:var(--brand2,#245d3b)!important;border:1px solid #9fb3a455!important}
    .topbar .pv-new-expense:hover{background:var(--panel2,#eef3ed)!important}

    /* Accounts: distribution uses the card vertically - larger donut on top, values below. */
    .pv-account-distribution .card-body{overflow:hidden!important}
    .pv-account-distribution .distribution{height:100%!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;grid-template-columns:none!important}
    .pv-account-distribution .donut{width:154px!important;height:154px!important;min-width:154px!important;min-height:154px!important;margin:2px auto 0!important;flex:0 0 154px!important}
    .pv-account-distribution .donut:after,.pv-account-distribution .donut-center{inset:25px!important}
    .pv-account-distribution .legend,.pv-account-distribution .donut-legend{width:100%!important;max-width:100%!important;min-width:0!important;display:grid!important;grid-template-columns:1fr!important;gap:4px!important;overflow:hidden!important;padding:0 2px!important}
    .pv-account-distribution .legend-row,.pv-account-distribution .donut-legend>div{width:100%!important;min-width:0!important;grid-template-columns:9px minmax(0,1fr) auto!important;gap:6px!important}

    /* ONLY this Accounts three-card row gets a width rebalance. */
    .pv-accounts-three{grid-template-columns:minmax(190px,.72fr) minmax(325px,1.22fr) minmax(390px,1.48fr)!important;gap:8px!important;min-width:0!important}
    .pv-account-snapshot,.pv-selected-account{min-width:0!important}
    .pv-account-snapshot .card-body,.pv-account-snapshot .table-wrap{overflow-x:hidden!important}
    .pv-account-snapshot table{width:100%!important;min-width:0!important;table-layout:fixed!important}
    .pv-account-snapshot th,.pv-account-snapshot td{overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;min-width:0!important}
    .pv-account-snapshot th:first-child,.pv-account-snapshot td:first-child{width:39%!important}
    .pv-account-snapshot th:not(:first-child),.pv-account-snapshot td:not(:first-child){width:20.33%!important}

    /* Excel-style row clipping globally: container widths stay unchanged. */
    .table-wrap table,.card table{table-layout:fixed!important;max-width:100%!important}
    .table-wrap th,.table-wrap td,.card table th,.card table td{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .list-row>*:not(.badge),.mini-row>*:not(.badge),.transfer-row>*:not(.badge),.list-item>*:not(.badge){min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .list-row>*:not(.badge),.transfer-row>*:not(.badge){white-space:nowrap!important}
    .pv-cell-clip{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;min-width:0!important}

    @media(max-width:1180px){
      .pv-accounts-three{grid-template-columns:minmax(175px,.68fr) minmax(300px,1.2fr) minmax(350px,1.4fr)!important}
      .pv-account-distribution .donut{width:142px!important;height:142px!important;min-width:142px!important;min-height:142px!important;flex-basis:142px!important}
    }
  `;
  document.head.appendChild(style);

  function popup(){
    let p=q('#pvSearch');
    if(!p){p=document.createElement('div');p.id='pvSearch';document.body.appendChild(p)}
    return p;
  }

  function isSearchInput(i){
    return i && (i.type==='search' || /search/i.test(i.placeholder||''));
  }

  function findSourceInput(){
    return A('input').find(i=>isSearchInput(i) && !i.closest('#pvSearch')) || null;
  }

  function wrapperFor(i){
    if(!i)return null;
    const known=i.closest('[role="search"],form,.searchbox,.global-search,.search');
    if(known && !known.classList.contains('topbar')) return known;
    if(i.parentElement && i.parentElement!==document.body && !i.parentElement.classList.contains('topbar')) return i.parentElement;
    return i;
  }

  function moveRealSearch(){
    const p=popup();
    const input=findSourceInput();
    if(input){
      const w=wrapperFor(input);
      if(w && w.parentElement!==p)p.appendChild(w);
    }
    return p;
  }

  function setOpen(open){
    const p=moveRealSearch();
    p.classList.toggle('open',!!open);
    p.setAttribute('aria-hidden',open?'false':'true');
    if(open){
      requestAnimationFrame(()=>{
        const i=A('input',p).find(isSearchInput);
        if(i){i.style.removeProperty('display');i.style.removeProperty('visibility');i.focus()}
      });
    }
  }

  function bindSidebarSearch(){
    const b=q('#pvSideSearch');
    if(!b)return;
    if(b.dataset.pvSearchR3==='1')return;
    b.dataset.pvSearchR3='1';
    b.onclick=(e)=>{
      e.preventDefault();
      e.stopPropagation();
      const p=popup();
      setOpen(!p.classList.contains('open'));
      return false;
    };
  }

  function toggleRail(){
    const next=!document.body.classList.contains('pv-rail');
    document.body.classList.toggle('pv-rail',next);
    try{localStorage.setItem('pavenro.finance.sidebar.rail',next?'1':'0')}catch(_){ }
  }

  function swapTopIcons(){
    const top=q('#pvTop'),brand=q('.sidebar .brand'),actions=brand&&q('.pv-brand-actions',brand);
    if(!top||!brand||!actions)return;
    const nativeCur=q('.pv-cur',top);
    let home=q('.pv-currency-home',actions);
    if(!home){
      home=document.createElement('span');
      home.className='pv-currency-home';
      home.title='Display currency';
      actions.appendChild(home);
    }
    home.textContent=(nativeCur&&txt(nativeCur))||home.textContent||'₹';
    let panel=q('#pvTopPanelToggle',top);
    if(!panel){
      panel=document.createElement('button');
      panel.id='pvTopPanelToggle';
      panel.type='button';
      panel.title='Expand or collapse navigation';
      panel.setAttribute('aria-label','Expand or collapse navigation');
      panel.innerHTML='<span class="pv-picon"></span>';
      const title=q('.pv-title',top);
      top.insertBefore(panel,title||top.firstChild);
    }
    if(panel.dataset.pvBound!=='1'){
      panel.dataset.pvBound='1';
      panel.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleRail()});
    }
  }

  function findNewTransaction(){
    const buttons=A('.topbar button');
    return buttons.find(b=>b.classList.contains('pv-new-transaction')) ||
      buttons.find(b=>/new\s+transaction/i.test(txt(b))) ||
      buttons.find(b=>/^\s*\+/.test(txt(b)) && !/expense/i.test(txt(b)) && !b.closest('#pvTop')) || null;
  }

  function setExpenseMode(){
    const roots=A('[role="dialog"],.modal,.dialog,.drawer,.sheet').filter(x=>{
      const s=getComputedStyle(x);return s.display!=='none'&&s.visibility!=='hidden';
    });
    const root=roots.at(-1)||document;
    const expenseBtn=A('button,[role="tab"]',root).find(b=>/^(expense|add expense)$/i.test(txt(b)));
    if(expenseBtn){expenseBtn.click();return true}
    const sel=A('select',root).find(s=>A('option',s).some(o=>/expense/i.test((o.value||'')+' '+txt(o))));
    if(sel){
      const op=A('option',sel).find(o=>/expense/i.test((o.value||'')+' '+txt(o)));
      if(op){sel.value=op.value;sel.dispatchEvent(new Event('change',{bubbles:true}));return true}
    }
    return false;
  }

  function openNewExpense(){
    const direct=A('button,[data-action]',document).find(b=>/^(add expense)$/i.test(txt(b)) && !b.classList.contains('pv-new-expense'));
    if(direct){direct.click();return}
    const txn=findNewTransaction();
    if(!txn)return;
    txn.click();
    [30,90,180,320].forEach(ms=>setTimeout(setExpenseMode,ms));
  }

  function topActions(){
    const topbar=q('.topbar');
    if(!topbar)return;
    const txn=findNewTransaction();
    if(!txn)return;
    txn.classList.add('pv-top-action','pv-new-transaction');
    let expense=q('.pv-new-expense',topbar);
    if(!expense){
      expense=document.createElement('button');
      expense.type='button';
      expense.className='pv-top-action pv-new-expense';
      expense.textContent='+ New expense';
      txn.parentElement.insertBefore(expense,txn);
    }
    if(expense.dataset.pvBound!=='1'){
      expense.dataset.pvBound='1';
      expense.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openNewExpense()});
    }
    const month=A('select',topbar).find(s=>A('option',s).some(o=>/(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(txt(o))));
    if(month){
      const w=Math.max(104,Math.min(132,Math.round(month.getBoundingClientRect().width||116)));
      document.documentElement.style.setProperty('--pv-top-control-w',w+'px');
    }
  }

  function cardByHeading(re){
    return A('.card').find(c=>re.test(txt(q('.card-head h3,h3',c))))||null;
  }

  function closestCommon(nodes){
    const valid=nodes.filter(Boolean);if(valid.length<2)return null;
    let p=valid[0].parentElement;
    while(p&&p!==document.body){if(valid.every(n=>p.contains(n)))return p;p=p.parentElement}
    return null;
  }

  function markAccounts(){
    let dist=cardByHeading(/^Account Distribution$/i) || A('.card').find(c=>q('.distribution .donut,.donut-wrap .donut',c));
    let snap=cardByHeading(/^Account Snapshot$/i) || A('.card').find(c=>{
      const hs=A('th',c).map(txt).join(' ');return /Account/i.test(hs)&&/Money In/i.test(hs)&&/Money Out/i.test(hs);
    });
    let detail=A('.card,.detail').find(c=>/Recurring Activity/i.test(txt(c)) && /Currency/i.test(txt(c)) && /Money in/i.test(txt(c)));
    if(dist)dist.classList.add('pv-account-distribution');
    if(snap)snap.classList.add('pv-account-snapshot');
    if(detail)detail.classList.add('pv-selected-account');
    const common=closestCommon([dist,snap,detail]);
    if(common && common!==document.body && common!==q('.page')) common.classList.add('pv-accounts-three');
  }

  function clipRows(){
    A('.table-wrap th,.table-wrap td,.card table th,.card table td').forEach(c=>{
      c.classList.add('pv-cell-clip');
      if(!c.title && txt(c))c.title=txt(c);
    });
    A('.list-row>*:not(.badge),.mini-row>*:not(.badge),.transfer-row>*:not(.badge),.list-item>*:not(.badge)').forEach(c=>{
      if(c.children.length===0){c.classList.add('pv-cell-clip');if(!c.title&&txt(c))c.title=txt(c)}
    });
  }

  function normalize(){
    moveRealSearch();
    bindSidebarSearch();
    swapTopIcons();
    topActions();
    markAccounts();
    clipRows();
  }

  function start(){
    normalize();
    setOpen(false);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)},true);
    document.addEventListener('click',e=>{
      if(!e.target.closest('#pvSearch')&&!e.target.closest('#pvSideSearch'))setOpen(false);
    },true);
    let pending=false;
    const mo=new MutationObserver(()=>{
      if(pending)return;pending=true;
      requestAnimationFrame(()=>{pending=false;normalize()});
    });
    mo.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('resize',()=>requestAnimationFrame(normalize),{passive:true});
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
