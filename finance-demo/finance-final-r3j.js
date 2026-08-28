(()=>{
  if(window.__PV_FIN_FINAL_R3K)return;
  window.__PV_FIN_FINAL_R3K=1;

  const q=(s,r=document)=>r.querySelector(s);
  const A=(s,r=document)=>[...r.querySelectorAll(s)];
  const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
  const imp=(e,p,v)=>{if(e)e.style.setProperty(p,v,'important')};
  const visible=e=>{if(!e)return false;const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&e.getClientRects().length>0};

  const EXPENSE_CATS=[
    'Food & Dining','Groceries','Restaurants & Takeaway','Transport','Fuel','Shopping','Utilities',
    'Housing / Rent','Home & Maintenance','Health & Medical','Insurance','Education','Entertainment',
    'Travel','Personal Care','Family & Kids','Gifts & Donations','Subscriptions','Debt / Loan Payment',
    'Taxes','Fees & Charges','Pets','Business Expense','EMI','Cash Withdrawal','Miscellaneous','Other'
  ];
  const INCOME_CATS=[
    'Salary / Wages','Freelance','Business Income','Consulting','Bonus','Commission','Interest','Dividends',
    'Rental Income','Investment Returns','Capital Gains','Refund / Reimbursement','Pension / Retirement',
    'Government Benefits','Gift Received','Grant / Scholarship','Royalties','Side Hustle','Cashback / Rewards',
    'Sale of Asset','Insurance Payout','Other'
  ];
  const FREQUENCIES=['One time','Weekly','Biweekly','Monthly','Quarterly','Half-yearly','Yearly','Irregular'];

  const style=document.createElement('style');
  style.id='pv-fin-final-r3k-style';
  style.textContent=`
    .topbar .pv-new-expense,.topbar .pv-new-income-proxy,.topbar .pv-new-income,.topbar .pv-income-source{display:none!important}
    .topbar .pv-final-money-action{width:138px!important;min-width:138px!important;max-width:138px!important;height:38px!important;min-height:38px!important;padding:0 12px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;background:#1f6845!important;color:#fff!important;border:1px solid #1f6845!important;border-radius:9px!important;font-weight:700!important;white-space:nowrap!important;box-shadow:none!important;cursor:pointer!important}
    .topbar .pv-final-money-action:hover{background:#19583a!important;border-color:#19583a!important}

    /* Accounts: three supporting panels only. The selected account is a contextual drawer. */
    .pv-final-account-row{position:relative!important;display:grid!important;width:100%!important;max-width:100%!important;min-width:0!important;gap:8px!important;overflow:visible!important;grid-template-columns:minmax(210px,.95fr) minmax(220px,1fr) 390px!important}
    .pv-final-account-row>.pv-final-account-item{min-width:0!important;max-width:100%!important;width:auto!important;overflow:hidden!important}
    .pv-final-account-snapshot{width:390px!important;min-width:390px!important;max-width:390px!important;overflow:hidden!important}
    .pv-final-account-snapshot .card-body,.pv-final-account-snapshot .card-body.scroll,.pv-final-account-snapshot .table-wrap{width:100%!important;min-width:0!important;max-width:100%!important;overflow-x:hidden!important;overflow-y:auto!important}
    .pv-final-account-snapshot table{width:100%!important;min-width:0!important;max-width:100%!important;table-layout:fixed!important}
    .pv-final-account-snapshot th,.pv-final-account-snapshot td{min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .pv-final-account-snapshot .card-body::-webkit-scrollbar:horizontal,.pv-final-account-snapshot .table-wrap::-webkit-scrollbar:horizontal{height:0!important;display:none!important}

    .pv-selected-account-drawer{position:absolute!important;z-index:80!important;right:0!important;top:0!important;width:min(430px,42%)!important;min-width:360px!important;max-width:430px!important;height:100%!important;max-height:100%!important;background:var(--panel,#fff)!important;border:1px solid #aebdaf55!important;border-radius:12px!important;box-shadow:-14px 10px 36px #0002!important;overflow:auto!important;transform:translateX(0)!important;opacity:1!important;pointer-events:auto!important;transition:transform .16s ease,opacity .16s ease!important}
    .pv-selected-account-drawer.pv-drawer-closed{transform:translateX(calc(100% + 18px))!important;opacity:0!important;pointer-events:none!important}
    .pv-account-drawer-close{position:absolute!important;right:10px!important;top:8px!important;z-index:4!important;width:28px!important;height:28px!important;border:0!important;border-radius:8px!important;background:var(--panel2,#eef3ed)!important;color:var(--muted,#6d786f)!important;display:grid!important;place-items:center!important;cursor:pointer!important;font-size:18px!important;line-height:1!important}

    .pv-final-hidden-type{display:none!important}
    .pv-money-extra-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}
    .pv-money-extra-field{display:flex;flex-direction:column;gap:5px;min-width:0;font:inherit;color:inherit}
    .pv-money-extra-field>span{font-size:10px;font-weight:700;color:var(--muted,#647067)}
    .pv-money-extra-field input,.pv-money-extra-field select{width:100%;height:40px;box-sizing:border-box;border:1px solid #b9c7bb66;border-radius:9px;background:var(--panel2,#f4f6f2);color:inherit;padding:0 12px;font:inherit;outline:none}
    .pv-money-extra-field input:focus,.pv-money-extra-field select:focus{border-color:#43805f99}
    .pv-other-field{display:none!important;margin-top:10px}
    .pv-other-field.pv-show-other{display:flex!important}
    .pv-money-error{display:none;margin-top:4px;color:#c34d45;font-size:10px;font-weight:600}
    .pv-money-error.on{display:block}

    @media(max-width:1180px){
      .pv-final-account-row{grid-template-columns:minmax(185px,.9fr) minmax(195px,.95fr) 390px!important}
      .pv-selected-account-drawer{width:410px!important;min-width:350px!important}
    }
  `;
  document.head.appendChild(style);

  function directChild(root,node){let n=node;while(n&&n.parentElement&&n.parentElement!==root)n=n.parentElement;return n&&n.parentElement===root?n:null}
  function heading(card){return txt(q('.card-head h3,.card-head h2,h3,h2',card))}
  function cardByHeading(re){return A('.card').find(c=>re.test(heading(c)))||null}
  function commonAncestor(nodes){const v=nodes.filter(Boolean);if(v.length<2)return null;let p=v[0].parentElement;while(p&&p!==document.body){if(v.every(n=>p.contains(n)))return p;p=p.parentElement}return null}

  function openAccountDrawer(){const d=q('.pv-selected-account-drawer');if(d)d.classList.remove('pv-drawer-closed')}
  function closeAccountDrawer(){const d=q('.pv-selected-account-drawer');if(d)d.classList.add('pv-drawer-closed')}

  function fixAccounts(){
    const dist=cardByHeading(/^Account Distribution$/i)||A('.card').find(c=>q('.distribution .donut,.donut-wrap .donut',c));
    const recent=cardByHeading(/^Recent Transfers$/i);
    const snap=cardByHeading(/^Account Snapshot$/i)||A('.card').find(c=>{const h=A('th',c).map(txt).join(' ');return /Account/i.test(h)&&/Money In/i.test(h)&&/Money Out/i.test(h)});
    const detail=A('.card,.detail').find(c=>/Recurring Activity/i.test(txt(c))&&/Currency/i.test(txt(c))&&/Money in/i.test(txt(c)));
    if(!dist||!recent||!snap)return;

    const page=snap.closest('.page,.workspace,.content');if(!page)return;
    imp(page,'position','relative');

    let root=commonAncestor([dist,recent,snap,detail].filter(Boolean));
    let analytics=[dist,recent,snap];
    let items=[];
    if(root&&root!==document.body&&root!==page){items=[...new Set(analytics.map(c=>directChild(root,c)).filter(Boolean))]}
    if(!root||root===document.body||root===page||items.length!==3){
      root=q('#pvFinalAccountAnalytics',page);
      if(!root){root=document.createElement('div');root.id='pvFinalAccountAnalytics';const anchor=directChild(page,dist);page.insertBefore(root,anchor||null)}
      analytics.forEach(c=>{if(c.parentElement!==root)root.appendChild(c)});
      items=analytics;
    }

    root.classList.add('pv-final-account-row');
    imp(root,'display','grid');imp(root,'width','100%');imp(root,'max-width','100%');imp(root,'min-width','0');imp(root,'gap','8px');imp(root,'grid-template-columns','minmax(210px,.95fr) minmax(220px,1fr) 390px');
    items.forEach(i=>{i.classList.add('pv-final-account-item');imp(i,'min-width','0');imp(i,'max-width','100%');imp(i,'overflow','hidden')});

    snap.classList.add('pv-final-account-snapshot');
    imp(snap,'width','390px');imp(snap,'min-width','390px');imp(snap,'max-width','390px');
    A('.card-body,.table-wrap',snap).forEach(x=>{imp(x,'width','100%');imp(x,'min-width','0');imp(x,'max-width','100%');imp(x,'overflow-x','hidden')});
    const table=q('table',snap);
    if(table){imp(table,'width','100%');imp(table,'min-width','0');imp(table,'max-width','100%');imp(table,'table-layout','fixed');const heads=A('th',table);const n=heads.length||4;A('th,td',table).forEach((c,i)=>{const col=i%n;imp(c,'min-width','0');imp(c,'white-space','nowrap');imp(c,'overflow','hidden');imp(c,'text-overflow','ellipsis');if(n===4)imp(c,'width',col===0?'43%':'19%');else if(n===3)imp(c,'width',col===0?'50%':'25%')})}

    if(detail){
      detail.classList.add('pv-selected-account-drawer');
      detail.classList.remove('pv-final-account-item','pv-account-row-item-r3g');
      imp(detail,'grid-column','auto');imp(detail,'grid-row','auto');
      if(detail.parentElement!==root)root.appendChild(detail);
      let close=q('.pv-account-drawer-close',detail);
      if(!close){close=document.createElement('button');close.type='button';close.className='pv-account-drawer-close';close.setAttribute('aria-label','Close account details');close.textContent='×';detail.prepend(close);close.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeAccountDrawer()})}
    }

    /* Any account selection/view action reopens the contextual detail drawer. */
    A('.account-card,[data-account-id],.pv-account-snapshot tr[data-id],.pv-account-snapshot tbody tr',page).forEach(el=>{
      if(el.dataset.pvDrawerBound==='1')return;el.dataset.pvDrawerBound='1';el.addEventListener('click',()=>setTimeout(openAccountDrawer,20));
    });
  }

  function transactionSource(){const top=q('.topbar');if(!top)return null;return q('.pv-income-source',top)||q('.pv-new-transaction',top)||A('button',top).find(b=>/new\s+transaction/i.test(txt(b)))||null}

  function ensureTopButtons(){
    const top=q('.topbar');if(!top)return;const source=transactionSource();if(!source)return;
    source.classList.add('pv-income-source');source.setAttribute('aria-hidden','true');source.tabIndex=-1;
    A('.pv-new-expense,.pv-new-income-proxy,.pv-new-income',top).forEach(b=>{b.style.setProperty('display','none','important');b.setAttribute('aria-hidden','true');b.tabIndex=-1});
    let exp=q('.pv-final-expense',top);if(!exp){exp=document.createElement('button');exp.type='button';exp.className='pv-final-money-action pv-final-expense';exp.textContent='+ New expense';source.parentElement.insertBefore(exp,source)}
    let inc=q('.pv-final-income',top);if(!inc){inc=document.createElement('button');inc.type='button';inc.className='pv-final-money-action pv-final-income';inc.textContent='+ New income';source.parentElement.insertBefore(inc,source)}
    if(exp.dataset.bound!=='1'){exp.dataset.bound='1';exp.addEventListener('click',e=>{e.preventDefault();openMoneyForm('expense')})}
    if(inc.dataset.bound!=='1'){inc.dataset.bound='1';inc.addEventListener('click',e=>{e.preventDefault();openMoneyForm('income')})}
  }

  function findTypeSelect(){return A('select').find(s=>visible(s)&&A('option',s).some(o=>/^expense$/i.test(txt(o)))&&A('option',s).some(o=>/^income$/i.test(txt(o))))||null}
  function modalRootFrom(control){return control?.closest('[role="dialog"],.modal,.dialog,.drawer,.sheet,.modal-card,.modal-content')||control?.closest('form')?.parentElement||document}
  function fieldWrap(control){return control?.closest('label,.field,.form-field,.form-group,.input-group,.control,.field-wrap')||control?.parentElement||null}
  function labelFor(control){const w=fieldWrap(control);return w?txt(w).replace(txt(control),'').trim():''}
  function findByLabel(root,re,selector='input,select,textarea'){return A(selector,root).find(c=>re.test(labelFor(c)))||null}
  function findCategorySelect(root,typeSel){const all=A('select',root).filter(s=>visible(s)&&s!==typeSel);return all.find(s=>/category/i.test(labelFor(s)))||all.find(s=>A('option',s).some(o=>/Food & Dining|Salary|Freelance|Shopping|Utilities/i.test(txt(o))))||null}
  function setSelectByText(sel,value){if(!sel)return false;const op=A('option',sel).find(o=>txt(o).toLowerCase()===value.toLowerCase()||(o.value||'').toLowerCase()===value.toLowerCase());if(!op)return false;sel.value=op.value;sel.dispatchEvent(new Event('change',{bubbles:true}));return true}
  function setFieldLabel(control,label){const w=fieldWrap(control);if(!w)return;const direct=A('span,label,.label,.field-label',w).find(x=>x!==control&&!x.contains(control)&&txt(x));if(direct){direct.textContent=label;return}const nodes=[...w.childNodes];const t=nodes.find(n=>n.nodeType===3&&n.textContent.trim());if(t)t.textContent=label+' ';}

  function replaceCategories(sel,kind){
    if(!sel)return;const list=kind==='income'?INCOME_CATS:EXPENSE_CATS;const previous=sel.value;
    sel.innerHTML='';list.forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;sel.appendChild(o)});
    sel.value=list.includes(previous)?previous:list[0];sel.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function makeExtraField(label,type,options){
    const w=document.createElement('label');w.className='pv-money-extra-field';const s=document.createElement('span');s.textContent=label;w.appendChild(s);
    let c;if(type==='select'){c=document.createElement('select');(options||[]).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;c.appendChild(o)})}else{c=document.createElement('input');c.type=type||'text'}
    w.appendChild(c);return {wrap:w,control:c};
  }

  function configureOther(root,cat){
    let ow=q('.pv-other-field',root),input;
    if(!ow){const f=makeExtraField('Other category','text');ow=f.wrap;input=f.control;ow.classList.add('pv-other-field');input.placeholder='Enter custom category';const grid=q('.pv-money-extra-grid',root);(grid||fieldWrap(cat)?.parentElement||root).appendChild(ow)}else input=q('input',ow);
    const err=q('.pv-money-error',ow)||(()=>{const e=document.createElement('div');e.className='pv-money-error';e.textContent='Enter the custom category name.';ow.appendChild(e);return e})();
    const sync=()=>{const isOther=(cat.value||'').toLowerCase()==='other';ow.classList.toggle('pv-show-other',isOther);if(!isOther){input.value='';err.classList.remove('on')}};
    if(cat.dataset.pvOtherBound!=='1'){cat.dataset.pvOtherBound='1';cat.addEventListener('change',sync)}sync();return {wrap:ow,input,err};
  }

  function prepareMoneySubmit(root,kind,cat,other,dateInput,freqInput,desc,notes){
    const submit=A('button',root).find(b=>visible(b)&&/add transaction|save transaction|add expense|add income/i.test(txt(b)));if(!submit||submit.dataset.pvPrepBound==='1')return;
    submit.dataset.pvPrepBound='1';submit.addEventListener('click',e=>{
      if((cat.value||'').toLowerCase()==='other'){
        const custom=(other.input.value||'').trim();if(!custom){e.preventDefault();e.stopImmediatePropagation();other.err.classList.add('on');other.input.focus();return}
        let o=A('option',cat).find(x=>txt(x).toLowerCase()===custom.toLowerCase());if(!o){o=document.createElement('option');o.value=custom;o.textContent=custom;cat.appendChild(o)}cat.value=o.value;cat.dispatchEvent(new Event('change',{bubbles:true}));
      }
      /* Preserve added metadata even when the native transaction model has no dedicated fields yet. */
      if(notes){const lines=[];if(dateInput?.value)lines.push((kind==='income'?'Date received: ':'Expense date: ')+dateInput.value);if(kind==='income'&&freqInput?.value)lines.push('Frequency: '+freqInput.value);if(lines.length){const old=notes.value.trim();const add=lines.filter(x=>!old.includes(x)).join('\n');notes.value=(old?old+'\n':'')+add;notes.dispatchEvent(new Event('input',{bubbles:true}))}}
      if(desc)desc.dispatchEvent(new Event('input',{bubbles:true}));
    },true);
  }

  function configureMoneyForm(kind){
    const typeSel=findTypeSelect();if(!typeSel)return false;const root=modalRootFrom(typeSel);
    setSelectByText(typeSel,kind==='expense'?'Expense':'Income');const tw=fieldWrap(typeSel);if(tw)tw.classList.add('pv-final-hidden-type');imp(typeSel,'display','none');

    const title=A('h1,h2,h3',root).find(visible);if(title)title.textContent=kind==='expense'?'Add Expense':'Add Income';
    const submit=A('button',root).find(b=>visible(b)&&/add transaction|save transaction|add expense|add income/i.test(txt(b)));if(submit)submit.textContent=kind==='expense'?'Add Expense':'Add Income';

    const desc=findByLabel(root,/description/i,'input[type="text"],input:not([type])')||A('input[type="text"]',root).find(visible);
    if(desc){setFieldLabel(desc,kind==='income'?'Source / From':'Merchant / Payee');desc.placeholder=kind==='income'?'Employer, client, platform, tenant, etc.':'Merchant, shop, service provider, person, etc.'}

    const cat=findCategorySelect(root,typeSel);if(!cat)return true;
    if(cat.dataset.pvKind!==kind){cat.dataset.pvKind=kind;replaceCategories(cat,kind)}

    let extras=q('.pv-money-extra-grid',root);if(!extras){extras=document.createElement('div');extras.className='pv-money-extra-grid';const anchor=fieldWrap(cat);(anchor?.parentElement||root).insertBefore(extras,anchor?.nextSibling||null)}
    extras.innerHTML='';

    let date=findByLabel(root,/date/i,'input[type="date"]');
    let dateInput=date;
    if(!date){const f=makeExtraField(kind==='income'?'Date received':'Expense date','date');f.control.name='date';dateInput=f.control;extras.appendChild(f.wrap)}else setFieldLabel(date,kind==='income'?'Date received':'Expense date');

    let freqInput=null;
    if(kind==='income'){const f=makeExtraField('Frequency','select',FREQUENCIES);f.control.name='frequency';freqInput=f.control;extras.appendChild(f.wrap)}

    const other=configureOther(root,cat);
    const notes=A('textarea',root).find(visible)||findByLabel(root,/notes/i,'textarea');
    prepareMoneySubmit(root,kind,cat,other,dateInput,freqInput,desc,notes);

    root.dataset.pvMoneyKind=kind;
    return true;
  }

  function openMoneyForm(kind){const source=transactionSource();if(!source)return;source.click();[20,60,120,220,360,520].forEach(ms=>setTimeout(()=>configureMoneyForm(kind),ms))}

  function apply(){ensureTopButtons();fixAccounts()}
  let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  function start(){apply();const mo=new MutationObserver(queue);mo.observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',queue,{passive:true})}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
