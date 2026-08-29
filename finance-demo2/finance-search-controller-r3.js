(()=>{
  if(window.__PV_FIN_SEARCH_R3)return;
  window.__PV_FIN_SEARCH_R3=1;

  const q=(s,r=document)=>r.querySelector(s);
  const A=(s,r=document)=>[...r.querySelectorAll(s)];
  const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();

  const EXPENSE_CATEGORIES=[
    'Food & Dining','Transport','Shopping','Utilities','Entertainment','Health','Housing',
    'Education','Insurance','Debt','Subscription','Travel','Family','Tax','Other / Add custom...'
  ];
  const INCOME_CATEGORIES=[
    'Salary','Freelance','Interest','Refund','Bonus','Consulting','Other / Add custom...'
  ];
  const CURRENCY_SYMBOLS={INR:'₹',USD:'$',EUR:'€',GBP:'£',AED:'د.إ',CNY:'¥',JPY:'¥',RUB:'₽',CAD:'C$',AUD:'A$',SGD:'S$',CHF:'CHF'};

  const style=document.createElement('style');
  style.id='pv-fin-search-r3-style';
  style.textContent=`
    .topbar input[placeholder*="search" i],.topbar input[type="search"]{display:none!important;visibility:hidden!important;pointer-events:none!important}
    .topbar form:has(> input[placeholder*="search" i]),.topbar div:has(> input[placeholder*="search" i]),.topbar label:has(> input[placeholder*="search" i]),.topbar form:has(> input[type="search"]),.topbar div:has(> input[type="search"]),.topbar label:has(> input[type="search"]){display:none!important;visibility:hidden!important;pointer-events:none!important}
    #pvSearch{display:none!important;opacity:0!important;pointer-events:none!important}#pvSearch.open{display:block!important;opacity:1!important;pointer-events:auto!important}
    #pvSearch.open input[placeholder*="search" i],#pvSearch.open input[type="search"]{display:block!important;visibility:visible!important;pointer-events:auto!important}
    #pvSearch.open form:has(> input[placeholder*="search" i]),#pvSearch.open div:has(> input[placeholder*="search" i]),#pvSearch.open label:has(> input[placeholder*="search" i]),#pvSearch.open form:has(> input[type="search"]),#pvSearch.open div:has(> input[type="search"]),#pvSearch.open label:has(> input[type="search"]){display:flex!important;visibility:visible!important;pointer-events:auto!important}
    #pvTop>.pv-cur{display:none!important}#pvCollapse,#pvExpand{display:none!important}
    #pvTopPanelToggle{width:34px!important;height:34px!important;min-width:34px!important;padding:0!important;border:0!important;border-radius:9px!important;background:var(--panel2,#eef3ed)!important;color:var(--brand2,#2f7549)!important;display:grid!important;place-items:center!important;cursor:pointer!important;box-shadow:none!important}#pvTopPanelToggle:hover{filter:brightness(.98)}#pvTopPanelToggle .pv-picon{width:16px!important;height:14px!important}
    .pv-currency-home-brand,.pv-currency-home-rail{border:0!important;box-shadow:none!important;font-weight:800!important;line-height:1!important;cursor:default!important}.pv-currency-home-brand{width:30px!important;height:30px!important;display:grid!important;place-items:center!important;border-radius:8px!important;background:transparent!important;color:#fff!important;font-size:13px!important}.pv-currency-home-rail{display:none!important;width:42px!important;height:36px!important;min-width:42px!important;border-radius:9px!important;background:transparent!important;color:inherit!important;font-size:13px!important;place-items:center!important;margin-bottom:4px!important}body.pv-rail .pv-currency-home-brand{display:none!important}body.pv-rail .pv-currency-home-rail{display:grid!important}
  `;
  document.head.appendChild(style);

  function popup(){let p=q('#pvSearch');if(!p){p=document.createElement('div');p.id='pvSearch';document.body.appendChild(p)}return p}
  function isSearchInput(i){return i&&(i.type==='search'||/search/i.test(i.placeholder||''))}
  function findSourceInput(){return A('input').find(i=>isSearchInput(i)&&!i.closest('#pvSearch'))||null}
  function wrapperFor(i){if(!i)return null;const known=i.closest('[role="search"],form,.searchbox,.global-search,.search');if(known&&!known.classList.contains('topbar'))return known;if(i.parentElement&&i.parentElement!==document.body&&!i.parentElement.classList.contains('topbar'))return i.parentElement;return i}
  function moveRealSearch(){const p=popup(),input=findSourceInput();if(input){const w=wrapperFor(input);if(w&&w.parentElement!==p)p.appendChild(w)}return p}
  function setOpen(open){const p=moveRealSearch();p.classList.toggle('open',!!open);p.setAttribute('aria-hidden',open?'false':'true');if(open)requestAnimationFrame(()=>{const i=A('input',p).find(isSearchInput);if(i){i.style.removeProperty('display');i.style.removeProperty('visibility');i.focus()}})}
  function bindSidebarSearch(){const b=q('#pvSideSearch');if(!b||b.dataset.pvSearchR3==='1')return;b.dataset.pvSearchR3='1';b.onclick=e=>{e.preventDefault();e.stopPropagation();const p=popup();setOpen(!p.classList.contains('open'));return false}}
  function currencySelect(){return A('select').find(s=>A('option',s).some(o=>['INR','USD','EUR','GBP'].includes(((o.value||o.textContent)||'').trim().toUpperCase())))||null}
  function currentCurrency(){const s=currencySelect();let v=(s?.value||'INR').toString().trim().toUpperCase();if(!CURRENCY_SYMBOLS[v]){const option=s?.selectedOptions?.[0],m=(option?.textContent||'').match(/\b(INR|USD|EUR|GBP|AED|CNY|JPY|RUB|CAD|AUD|SGD|CHF)\b/i);if(m)v=m[1].toUpperCase()}return CURRENCY_SYMBOLS[v]?v:'INR'}
  function updateCurrencyHomes(){const code=currentCurrency(),symbol=CURRENCY_SYMBOLS[code];A('.pv-currency-home-brand,.pv-currency-home-rail').forEach(e=>{e.textContent=symbol;e.title='Display currency: '+code;e.setAttribute('aria-label','Display currency '+code)})}
  function swapCurrencyAndPanel(){const top=q('#pvTop'),sidebar=q('.sidebar'),brand=sidebar&&q('.brand',sidebar),actions=brand&&q('.pv-brand-actions',brand),side=q('#pvSide',sidebar);if(!top||!brand||!side)return;let panel=q('#pvTopPanelToggle',top);if(!panel){panel=document.createElement('button');panel.id='pvTopPanelToggle';panel.type='button';panel.title='Expand or collapse navigation';panel.setAttribute('aria-label','Expand or collapse navigation');panel.innerHTML='<span class="pv-picon"></span>';const nativeCurrency=q('.pv-cur',top);top.insertBefore(panel,nativeCurrency||q('.pv-title',top)||top.firstChild)}if(panel.dataset.pvSwapBound!=='1'){panel.dataset.pvSwapBound='1';panel.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const rail=document.body.classList.contains('pv-rail'),native=rail?q('#pvExpand'):q('#pvCollapse');if(native)native.click();else{document.body.classList.toggle('pv-rail',!rail);try{localStorage.setItem('pavenro.finance.sidebar.rail',rail?'0':'1')}catch(_){}}})}if(actions){let home=q('.pv-currency-home-brand',actions);if(!home){home=document.createElement('span');home.className='pv-currency-home-brand';actions.appendChild(home)}}let railHome=q('.pv-currency-home-rail',side);if(!railHome){railHome=document.createElement('span');railHome.className='pv-currency-home-rail';const search=q('#pvSideSearch',side);side.insertBefore(railHome,search||side.firstChild)}updateCurrencyHomes()}
  function isTypeSelect(s){if(!s||s.tagName!=='SELECT')return false;const values=A('option',s).map(o=>((o.value||o.textContent)||'').trim().toLowerCase());return values.some(v=>v==='expense')&&values.some(v=>v==='income')}
  function transactionRoot(typeSel){let p=typeSel?.parentElement;while(p&&p!==document.body){const hasSubmit=A('button',p).some(b=>/add\s*transaction|save\s*transaction/i.test(txt(b)));if(hasSubmit&&A('select',p).length>=2)return p;p=p.parentElement}return typeSel?.closest('[role="dialog"],.modal,.dialog,.drawer,.sheet,.modal-card,.modal-content')||document}
  function categorySelect(root,typeSel){return A('select',root).find(s=>{if(s===typeSel)return false;const opts=A('option',s).map(o=>txt(o).toLowerCase());return opts.some(v=>v==='food & dining'||v==='transport'||v==='shopping'||v==='salary'||v==='freelance'||v.includes('add custom'))})||null}
  function replaceCategoryOptions(select,list){if(!select)return;const old=select.value,oldText=txt(select.selectedOptions?.[0]);select.innerHTML='';list.forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;select.appendChild(o)});const wanted=list.find(x=>x.toLowerCase()===String(old).toLowerCase()||x.toLowerCase()===oldText.toLowerCase());select.value=wanted||list[0];select.dispatchEvent(new Event('change',{bubbles:true}))}
  function syncTransactionCategories(typeSel){if(!isTypeSelect(typeSel))return;const root=transactionRoot(typeSel),category=categorySelect(root,typeSel);if(!category)return;const selected=((typeSel.value||txt(typeSel.selectedOptions?.[0]))+'').trim().toLowerCase(),kind=selected==='income'?'income':'expense';if(category.dataset.pvCategoryKind===kind)return;category.dataset.pvCategoryKind=kind;replaceCategoryOptions(category,kind==='income'?INCOME_CATEGORIES:EXPENSE_CATEGORIES)}
  function syncVisibleTransactionForms(){A('select').filter(isTypeSelect).forEach(syncTransactionCategories)}
  function normalize(){moveRealSearch();bindSidebarSearch();swapCurrencyAndPanel();syncVisibleTransactionForms()}
  let scheduled=0;function schedule(delay=60){clearTimeout(scheduled);scheduled=setTimeout(normalize,delay)}
  function start(){normalize();setOpen(false);document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)},true);document.addEventListener('click',e=>{if(!e.target.closest('#pvSearch')&&!e.target.closest('#pvSideSearch'))setOpen(false);if(e.target.closest('#pvSide,.sidebar,.topbar,button,[data-nav],[data-v]'))schedule(70)},true);document.addEventListener('change',e=>{if(isTypeSelect(e.target))syncTransactionCategories(e.target);if(e.target===currencySelect())setTimeout(updateCurrencyHomes,0);schedule(40)},true);window.addEventListener('pavenro:local-write',()=>schedule(60));setInterval(normalize,5000)}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
