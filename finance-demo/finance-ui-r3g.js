(()=>{
  if(window.__PV_FIN_UI_R3G)return;
  window.__PV_FIN_UI_R3G=1;

  const q=(s,r=document)=>r.querySelector(s);
  const A=(s,r=document)=>[...r.querySelectorAll(s)];
  const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
  const imp=(el,p,v)=>{if(!el)return;if(el.style.getPropertyValue(p)!==v||el.style.getPropertyPriority(p)!=='important')el.style.setProperty(p,v,'important')};

  const style=document.createElement('style');
  style.id='pv-fin-ui-r3g-style';
  style.textContent=`
    body.pv-rail #pvSide #pvExpand,
    body:not(.pv-rail) #pvSide #pvExpand,
    #pvSide > #pvExpand{
      display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;
      width:0!important;min-width:0!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important
    }

    .pv-account-row-r3g{
      display:grid!important;width:100%!important;max-width:100%!important;min-width:0!important;min-height:0!important;
      gap:8px!important;grid-auto-flow:row!important;grid-auto-rows:minmax(0,1fr)!important;grid-column:1/-1!important;
      flex:1 1 100%!important;align-self:stretch!important;overflow:hidden!important;box-sizing:border-box!important
    }
    /* Keep Distribution + Recent Transfers unchanged. Snapshot grows only to the RIGHT,
       taking width from the selected-account detail card. Total track weight stays 5.05. */
    .pv-account-row-r3g[data-pv-cols="4"]{grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr) minmax(0,1.50fr) minmax(0,1.55fr)!important}
    .pv-account-row-r3g[data-pv-cols="3"]{grid-template-columns:minmax(0,.9fr) minmax(0,1.30fr) minmax(0,1.50fr)!important}
    .pv-account-row-r3g[data-pv-cols="2"]{grid-template-columns:minmax(0,1.20fr) minmax(0,1.45fr)!important}
    .pv-account-row-r3g>.pv-account-row-item-r3g{
      width:auto!important;max-width:100%!important;min-width:0!important;min-height:0!important;grid-column:auto!important;grid-row:auto!important;
      flex:none!important;overflow:hidden!important;box-sizing:border-box!important
    }
    .pv-account-row-r3g .card,.pv-account-row-r3g .detail{width:100%!important;max-width:100%!important;min-width:0!important;min-height:0!important;overflow:hidden!important;box-sizing:border-box!important}
    .pv-account-row-r3g .card-head h3{max-width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .pv-account-row-r3g .card-body,.pv-account-row-r3g .table-wrap,.pv-account-row-r3g .detail{min-width:0!important;max-width:100%!important;overflow-x:hidden!important}
    .pv-account-row-r3g table{width:100%!important;max-width:100%!important;min-width:0!important;table-layout:fixed!important}
    .pv-account-row-r3g th,.pv-account-row-r3g td{min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}

    /* Account Snapshot must never need a horizontal scrollbar. */
    .pv-account-snapshot,
    .pv-account-snapshot .card-body,
    .pv-account-snapshot .card-body.scroll,
    .pv-account-snapshot .table-wrap{
      width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important
    }
    .pv-account-snapshot .card-body,
    .pv-account-snapshot .card-body.scroll,
    .pv-account-snapshot .table-wrap{overflow-y:auto!important}
    .pv-account-snapshot table{width:100%!important;max-width:100%!important;min-width:0!important;table-layout:fixed!important}
    .pv-account-snapshot th,.pv-account-snapshot td{min-width:0!important;max-width:none!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
    .pv-account-snapshot .card-body::-webkit-scrollbar:horizontal,
    .pv-account-snapshot .table-wrap::-webkit-scrollbar:horizontal{height:0!important;display:none!important}

    /* Keep the real New Transaction control as the functional source, but hide it.
       The visible New Income button proxies that proven handler and then selects Income. */
    .topbar button.pv-income-source{display:none!important}
    .topbar button.pv-new-income-proxy{
      width:138px!important;min-width:138px!important;max-width:138px!important;height:38px!important;min-height:38px!important;padding:0 12px!important;
      display:inline-flex!important;align-items:center!important;justify-content:center!important;background:#1f6845!important;color:#fff!important;
      border:1px solid #1f6845!important;border-radius:9px!important;font-weight:700!important;white-space:nowrap!important;box-shadow:none!important
    }
    .topbar button.pv-new-income-proxy:hover{background:#19583a!important;border-color:#19583a!important}

    @media(max-width:1180px){
      /* Same principle on narrower screens: left two tracks remain unchanged; Snapshot borrows from detail. */
      .pv-account-row-r3g[data-pv-cols="4"]{grid-template-columns:minmax(0,.9fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,1.4fr)!important}
    }
  `;
  document.head.appendChild(style);

  function heading(card){return txt(q('.card-head h3,.card-head h2,h3,h2',card));}
  function cardByHeading(re){return A('.card').find(c=>re.test(heading(c)))||null;}
  function commonAncestor(nodes){
    const valid=nodes.filter(Boolean);if(valid.length<2)return null;
    let p=valid[0].parentElement;
    while(p&&p!==document.body){if(valid.every(n=>p.contains(n)))return p;p=p.parentElement}
    return null;
  }
  function directChild(root,node){let n=node;while(n&&n.parentElement&&n.parentElement!==root)n=n.parentElement;return n&&n.parentElement===root?n:null;}

  function setGridRoot(root,items){
    if(!root||items.length<2||items.length>4)return false;
    if(!root.classList.contains('pv-account-row-r3g'))root.classList.add('pv-account-row-r3g');
    if(root.dataset.pvCols!==String(items.length))root.dataset.pvCols=String(items.length);
    items.forEach(i=>{if(!i.classList.contains('pv-account-row-item-r3g'))i.classList.add('pv-account-row-item-r3g')});
    imp(root,'width','100%');imp(root,'max-width','100%');imp(root,'min-width','0');imp(root,'grid-column','1 / -1');imp(root,'flex-basis','100%');
    const parent=root.parentElement;
    if(parent){
      imp(parent,'min-width','0');
      const d=getComputedStyle(parent).display;
      if(d.includes('grid'))imp(root,'grid-column','1 / -1');
      if(d.includes('flex'))imp(root,'flex','1 1 100%');
    }
    return true;
  }

  function fixAccounts(){
    const dist=cardByHeading(/^Account Distribution$/i)||A('.card').find(c=>q('.distribution .donut,.donut-wrap .donut',c));
    const recent=cardByHeading(/^Recent Transfers$/i);
    const snap=cardByHeading(/^Account Snapshot$/i)||A('.card').find(c=>{const h=A('th',c).map(txt).join(' ');return /Account/i.test(h)&&/Money In/i.test(h)&&/Money Out/i.test(h)});
    const detail=A('.card,.detail').find(c=>/Recurring Activity/i.test(txt(c))&&/Currency/i.test(txt(c))&&/Money in/i.test(txt(c)));
    const cards=[dist,recent,snap,detail].filter(Boolean);
    if(cards.length<3)return;

    if(dist&&!dist.classList.contains('pv-account-distribution'))dist.classList.add('pv-account-distribution');
    if(snap&&!snap.classList.contains('pv-account-snapshot'))snap.classList.add('pv-account-snapshot');
    if(detail&&!detail.classList.contains('pv-selected-account'))detail.classList.add('pv-selected-account');
    A('.pv-accounts-three').forEach(x=>x.classList.remove('pv-accounts-three'));

    const page=cards[0].closest('.page,.workspace,.content');
    let root=commonAncestor(cards);
    if(root&&root!==document.body&&root!==page){
      const items=[...new Set(cards.map(c=>directChild(root,c)).filter(Boolean))];
      if(setGridRoot(root,items))return;
    }

    if(!page)return;
    let holder=q('#pvAccountRowR3g',page);
    if(!holder){
      const anchor=directChild(page,cards[0]);
      holder=document.createElement('div');holder.id='pvAccountRowR3g';
      page.insertBefore(holder,anchor||null);
    }
    cards.forEach(c=>{if(c.parentElement!==holder)holder.appendChild(c)});
    setGridRoot(holder,cards);
  }

  function visibleRoot(){
    const roots=A('[role="dialog"],.modal,.dialog,.drawer,.sheet').filter(x=>{const s=getComputedStyle(x);return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'});
    return roots.at(-1)||document;
  }

  function setIncomeMode(){
    const root=visibleRoot();
    const candidates=A('button,[role="tab"],[data-type],[data-kind],[data-mode]',root);
    const income=candidates.find(b=>/^(income|add income|new income)$/i.test(txt(b))||/income/i.test((b.dataset.type||'')+' '+(b.dataset.kind||'')+' '+(b.dataset.mode||'')));
    if(income){income.click();return true}

    const sel=A('select',root).find(s=>A('option',s).some(o=>/income/i.test((o.value||'')+' '+txt(o))));
    if(sel){
      const op=A('option',sel).find(o=>/income/i.test((o.value||'')+' '+txt(o)));
      if(op){sel.value=op.value;sel.dispatchEvent(new Event('change',{bubbles:true}));return true}
    }

    const radio=A('input[type="radio"]',root).find(r=>/income/i.test((r.value||'')+' '+(r.id||'')+' '+(r.name||'')));
    if(radio){radio.click();radio.dispatchEvent(new Event('change',{bubbles:true}));return true}

    const label=A('label',root).find(l=>/^income$/i.test(txt(l)));
    if(label){label.click();return true}
    return false;
  }

  function directIncomeTrigger(){
    const b=A('button,[data-action],[data-act]').find(x=>!x.closest('.topbar')&&/^(add income|new income)$/i.test(txt(x)));
    if(b){b.click();return true}
    return false;
  }

  function openIncomeForm(){
    const top=q('.topbar');if(!top)return;
    const source=q('.pv-income-source',top);
    if(source)source.click();
    [20,60,120,200,320,500].forEach((ms,i)=>setTimeout(()=>{
      const ok=setIncomeMode();
      if(!ok&&i===5){
        const r=visibleRoot();
        if(r===document)directIncomeTrigger();
      }
    },ms));
  }

  function fixTopIncome(){
    const top=q('.topbar');if(!top)return;
    let source=q('.pv-income-source',top);
    if(!source){
      const buttons=A('button',top);
      source=buttons.find(x=>x.classList.contains('pv-new-transaction'))||buttons.find(x=>/new\s+transaction/i.test(txt(x)));
      if(!source)return;
      source.classList.add('pv-income-source');
      source.dataset.pvIncomeSource='1';
      source.setAttribute('aria-hidden','true');
      source.tabIndex=-1;
    }

    let income=q('.pv-new-income-proxy',top);
    if(!income){
      income=document.createElement('button');
      income.type='button';
      income.className='pv-top-action pv-new-income-proxy';
      income.textContent='+ New income';
      income.setAttribute('aria-label','New income');
      income.title='New income';
      source.parentElement.insertBefore(income,source);
    }
    if(income.dataset.pvIncomeBound!=='1'){
      income.dataset.pvIncomeBound='1';
      income.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openIncomeForm()});
    }
  }

  function hideDuplicateRailControl(){
    const ex=q('#pvExpand');if(!ex)return;
    if(ex.getAttribute('aria-hidden')!=='true')ex.setAttribute('aria-hidden','true');
    if(ex.tabIndex!==-1)ex.tabIndex=-1;
  }

  function apply(){hideDuplicateRailControl();fixTopIncome();fixAccounts();}
  let pending=false;
  function queue(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply()})}
  function start(){
    apply();
    const mo=new MutationObserver(queue);
    mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    window.addEventListener('resize',queue,{passive:true});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
