(()=>{
  if(window.__PV_FIN_FINAL_R3J)return;
  window.__PV_FIN_FINAL_R3J=1;

  const q=(s,r=document)=>r.querySelector(s);
  const A=(s,r=document)=>[...r.querySelectorAll(s)];
  const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
  const imp=(e,p,v)=>{if(e)e.style.setProperty(p,v,'important')};
  const visible=e=>{if(!e)return false;const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&e.getClientRects().length>0};

  const EXPENSE_CATS=['Food & Dining','Transport','Shopping','Utilities','Entertainment','Health','Housing','Education','Insurance','Debt','Subscription','Travel','Family','Tax','Other','Other / Add custom...'];
  const INCOME_CATS=['Salary','Freelance','Interest','Refund','Bonus','Consulting','Other','Other / Add custom...'];

  const style=document.createElement('style');
  style.id='pv-fin-final-r3j-style';
  style.textContent=`
    .topbar .pv-new-expense,
    .topbar .pv-new-income-proxy,
    .topbar .pv-new-income,
    .topbar .pv-income-source{display:none!important}
    .topbar .pv-final-money-action{
      width:138px!important;min-width:138px!important;max-width:138px!important;height:38px!important;min-height:38px!important;
      padding:0 12px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;
      background:#1f6845!important;color:#fff!important;border:1px solid #1f6845!important;border-radius:9px!important;
      font-weight:700!important;white-space:nowrap!important;box-shadow:none!important;cursor:pointer!important
    }
    .topbar .pv-final-money-action:hover{background:#19583a!important;border-color:#19583a!important}

    .pv-final-account-row{display:grid!important;width:100%!important;max-width:100%!important;min-width:0!important;gap:8px!important;overflow:hidden!important}
    .pv-final-account-row.pv-final-four{grid-template-columns:minmax(190px,.85fr) minmax(200px,.9fr) 390px minmax(260px,1fr)!important}
    .pv-final-account-row.pv-final-three{grid-template-columns:minmax(200px,.9fr) 390px minmax(280px,1fr)!important}
    .pv-final-account-row>.pv-final-account-item{min-width:0!important;max-width:100%!important;width:auto!important;overflow:hidden!important}
    .pv-final-account-snapshot{width:390px!important;min-width:390px!important;max-width:390px!important;overflow:hidden!important}
    .pv-final-account-snapshot .card-body,
    .pv-final-account-snapshot .card-body.scroll,
    .pv-final-account-snapshot .table-wrap{width:100%!important;min-width:0!important;max-width:100%!important;overflow-x:hidden!important;overflow-y:auto!important}
    .pv-final-account-snapshot table{width:100%!important;min-width:0!important;max-width:100%!important;table-layout:fixed!important}
    .pv-final-account-snapshot th,.pv-final-account-snapshot td{min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .pv-final-account-snapshot .card-body::-webkit-scrollbar:horizontal,
    .pv-final-account-snapshot .table-wrap::-webkit-scrollbar:horizontal{height:0!important;display:none!important}

    .pv-final-hidden-type{display:none!important}
    @media(max-width:1180px){
      .pv-final-account-row.pv-final-four{grid-template-columns:minmax(175px,.8fr) minmax(185px,.85fr) 390px minmax(250px,1fr)!important}
    }
  `;
  document.head.appendChild(style);

  function directChild(root,node){let n=node;while(n&&n.parentElement&&n.parentElement!==root)n=n.parentElement;return n&&n.parentElement===root?n:null}
  function heading(card){return txt(q('.card-head h3,.card-head h2,h3,h2',card))}
  function cardByHeading(re){return A('.card').find(c=>re.test(heading(c)))||null}
  function commonAncestor(nodes){
    const v=nodes.filter(Boolean);if(v.length<2)return null;
    let p=v[0].parentElement;
    while(p&&p!==document.body){if(v.every(n=>p.contains(n)))return p;p=p.parentElement}
    return null;
  }

  function fixAccounts(){
    const dist=cardByHeading(/^Account Distribution$/i)||A('.card').find(c=>q('.distribution .donut,.donut-wrap .donut',c));
    const recent=cardByHeading(/^Recent Transfers$/i);
    const snap=cardByHeading(/^Account Snapshot$/i)||A('.card').find(c=>{const h=A('th',c).map(txt).join(' ');return /Account/i.test(h)&&/Money In/i.test(h)&&/Money Out/i.test(h)});
    const detail=A('.card,.detail').find(c=>/Recurring Activity/i.test(txt(c))&&/Currency/i.test(txt(c))&&/Money in/i.test(txt(c)));
    const cards=[dist,recent,snap,detail].filter(Boolean);
    if(!snap||cards.length<3)return;

    const page=snap.closest('.page,.workspace,.content');
    let root=commonAncestor(cards);
    let items=[];
    if(root&&root!==document.body&&root!==page){items=[...new Set(cards.map(c=>directChild(root,c)).filter(Boolean))]}
    if(!root||root===document.body||root===page||items.length<3||items.length>4){
      if(!page)return;
      root=q('#pvFinalAccountRow',page);
      if(!root){
        root=document.createElement('div');root.id='pvFinalAccountRow';
        const anchor=directChild(page,cards[0]);page.insertBefore(root,anchor||null);
      }
      cards.forEach(c=>{if(c.parentElement!==root)root.appendChild(c)});
      items=cards;
    }

    root.classList.add('pv-final-account-row');
    root.classList.toggle('pv-final-four',items.length===4);
    root.classList.toggle('pv-final-three',items.length===3);
    imp(root,'display','grid');imp(root,'width','100%');imp(root,'max-width','100%');imp(root,'min-width','0');imp(root,'gap','8px');
    if(items.length===4)imp(root,'grid-template-columns','minmax(190px,.85fr) minmax(200px,.9fr) 390px minmax(260px,1fr)');
    if(items.length===3)imp(root,'grid-template-columns','minmax(200px,.9fr) 390px minmax(280px,1fr)');

    items.forEach(i=>{i.classList.add('pv-final-account-item');imp(i,'min-width','0');imp(i,'max-width','100%');imp(i,'overflow','hidden')});
    snap.classList.add('pv-final-account-snapshot');
    imp(snap,'width','390px');imp(snap,'min-width','390px');imp(snap,'max-width','390px');imp(snap,'overflow','hidden');

    A('.card-body,.table-wrap',snap).forEach(x=>{imp(x,'width','100%');imp(x,'min-width','0');imp(x,'max-width','100%');imp(x,'overflow-x','hidden')});
    const table=q('table',snap);
    if(table){
      imp(table,'width','100%');imp(table,'min-width','0');imp(table,'max-width','100%');imp(table,'table-layout','fixed');
      const heads=A('th',table);const n=heads.length||4;
      A('th,td',table).forEach((c,i)=>{
        const col=i%n;
        imp(c,'min-width','0');imp(c,'white-space','nowrap');imp(c,'overflow','hidden');imp(c,'text-overflow','ellipsis');
        if(n===4)imp(c,'width',col===0?'43%':'19%');
        else if(n===3)imp(c,'width',col===0?'50%':'25%');
      });
    }
  }

  function transactionSource(){
    const top=q('.topbar');if(!top)return null;
    return q('.pv-income-source',top)||q('.pv-new-transaction',top)||A('button',top).find(b=>/new\s+transaction/i.test(txt(b)))||null;
  }

  function ensureTopButtons(){
    const top=q('.topbar');if(!top)return;
    const source=transactionSource();if(!source)return;
    source.classList.add('pv-income-source');source.setAttribute('aria-hidden','true');source.tabIndex=-1;
    A('.pv-new-expense,.pv-new-income-proxy,.pv-new-income',top).forEach(b=>{b.style.setProperty('display','none','important');b.setAttribute('aria-hidden','true');b.tabIndex=-1});

    let exp=q('.pv-final-expense',top);
    if(!exp){exp=document.createElement('button');exp.type='button';exp.className='pv-final-money-action pv-final-expense';exp.textContent='+ New expense';source.parentElement.insertBefore(exp,source)}
    let inc=q('.pv-final-income',top);
    if(!inc){inc=document.createElement('button');inc.type='button';inc.className='pv-final-money-action pv-final-income';inc.textContent='+ New income';source.parentElement.insertBefore(inc,source)}

    if(exp.dataset.bound!=='1'){exp.dataset.bound='1';exp.addEventListener('click',e=>{e.preventDefault();openMoneyForm('expense')})}
    if(inc.dataset.bound!=='1'){inc.dataset.bound='1';inc.addEventListener('click',e=>{e.preventDefault();openMoneyForm('income')})}
  }

  function findTypeSelect(){
    return A('select').find(s=>visible(s)&&A('option',s).some(o=>/^expense$/i.test(txt(o)))&&A('option',s).some(o=>/^income$/i.test(txt(o))))||null;
  }
  function modalRootFrom(control){return control?.closest('[role="dialog"],.modal,.dialog,.drawer,.sheet,.modal-card,.modal-content')||control?.closest('form')?.parentElement||document}
  function findCategorySelect(root,typeSel){
    const all=A('select',root).filter(s=>visible(s)&&s!==typeSel);
    return all.find(s=>A('option',s).some(o=>/Food & Dining|Salary|Freelance|Shopping|Utilities/i.test(txt(o))))||null;
  }
  function fieldWrap(control){
    return control?.closest('.field,.form-field,.form-group,.input-group,.control,.field-wrap')||control?.parentElement||null;
  }
  function setSelectByText(sel,value){
    if(!sel)return false;
    const op=A('option',sel).find(o=>new RegExp('^'+value+'$','i').test(txt(o))||new RegExp('^'+value+'$','i').test(o.value||''));
    if(!op)return false;
    sel.value=op.value;sel.dispatchEvent(new Event('change',{bubbles:true}));return true;
  }
  function filterCategories(sel,kind){
    if(!sel)return;
    const allow=kind==='expense'?EXPENSE_CATS:INCOME_CATS;
    A('option',sel).forEach(o=>{const t=txt(o);o.hidden=!allow.some(x=>x.toLowerCase()===t.toLowerCase())});
    const current=txt(sel.options[sel.selectedIndex]);
    if(!allow.some(x=>x.toLowerCase()===current.toLowerCase())){
      const first=A('option',sel).find(o=>!o.hidden&&!o.disabled);if(first){sel.value=first.value;sel.dispatchEvent(new Event('change',{bubbles:true}))}
    }
  }

  function configureMoneyForm(kind){
    const typeSel=findTypeSelect();if(!typeSel)return false;
    const root=modalRootFrom(typeSel);
    setSelectByText(typeSel,kind==='expense'?'Expense':'Income');
    const wrap=fieldWrap(typeSel);if(wrap)wrap.classList.add('pv-final-hidden-type');
    imp(typeSel,'display','none');

    const title=A('h1,h2,h3',root).find(visible);
    if(title)title.textContent=kind==='expense'?'Add Expense':'Add Income';
    const submit=A('button',root).find(b=>visible(b)&&/add transaction|save transaction|add expense|add income/i.test(txt(b)));
    if(submit)submit.textContent=kind==='expense'?'Add Expense':'Add Income';

    setTimeout(()=>{
      const cat=findCategorySelect(root,typeSel);filterCategories(cat,kind);
      const typeAgain=findTypeSelect();if(typeAgain){setSelectByText(typeAgain,kind==='expense'?'Expense':'Income');const w=fieldWrap(typeAgain);if(w)w.classList.add('pv-final-hidden-type');imp(typeAgain,'display','none')}
    },30);
    return true;
  }

  function openMoneyForm(kind){
    const source=transactionSource();if(!source)return;
    source.click();
    [20,60,120,220,360].forEach(ms=>setTimeout(()=>configureMoneyForm(kind),ms));
  }

  function apply(){ensureTopButtons();fixAccounts()}
  let queued=false;
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  function start(){apply();const mo=new MutationObserver(queue);mo.observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',queue,{passive:true})}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
