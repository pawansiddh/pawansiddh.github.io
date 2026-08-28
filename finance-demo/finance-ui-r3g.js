(()=>{
  if(window.__PV_FIN_UI_R3G)return;
  window.__PV_FIN_UI_R3G=1;

  const q=(s,r=document)=>r.querySelector(s);
  const A=(s,r=document)=>[...r.querySelectorAll(s)];
  const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();

  const style=document.createElement('style');
  style.id='pv-fin-ui-r3g-style';
  style.textContent=`
    /* Rail mode has ONE panel control only: the topbar control. */
    body.pv-rail #pvSide #pvExpand,
    body:not(.pv-rail) #pvSide #pvExpand,
    #pvSide > #pvExpand{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
      width:0!important;
      min-width:0!important;
      height:0!important;
      min-height:0!important;
      margin:0!important;
      padding:0!important;
      overflow:hidden!important;
    }

    /* Accounts lower workspace: use the full available width and never crush cards. */
    .pv-account-row-r3g{
      display:grid!important;
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      min-height:0!important;
      gap:8px!important;
      grid-auto-flow:row!important;
      grid-auto-rows:minmax(0,1fr)!important;
      grid-column:1 / -1!important;
      flex:1 1 100%!important;
      align-self:stretch!important;
      overflow:hidden!important;
      box-sizing:border-box!important;
    }
    .pv-account-row-r3g[data-pv-cols="4"]{
      grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr) minmax(0,1.25fr) minmax(0,1.8fr)!important;
    }
    .pv-account-row-r3g[data-pv-cols="3"]{
      grid-template-columns:minmax(0,.9fr) minmax(0,1.15fr) minmax(0,1.75fr)!important;
    }
    .pv-account-row-r3g[data-pv-cols="2"]{
      grid-template-columns:minmax(0,1fr) minmax(0,1.65fr)!important;
    }
    .pv-account-row-r3g > .pv-account-row-item-r3g{
      width:auto!important;
      max-width:100%!important;
      min-width:0!important;
      min-height:0!important;
      grid-column:auto!important;
      grid-row:auto!important;
      flex:none!important;
      overflow:hidden!important;
      box-sizing:border-box!important;
    }
    .pv-account-row-r3g .card,
    .pv-account-row-r3g .detail{
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      min-height:0!important;
      overflow:hidden!important;
      box-sizing:border-box!important;
    }
    .pv-account-row-r3g .card-head h3{
      max-width:100%!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
    }
    .pv-account-row-r3g .card-body,
    .pv-account-row-r3g .table-wrap,
    .pv-account-row-r3g .detail{
      min-width:0!important;
      max-width:100%!important;
      overflow-x:hidden!important;
    }
    .pv-account-row-r3g table{
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      table-layout:fixed!important;
    }
    .pv-account-row-r3g th,
    .pv-account-row-r3g td{
      min-width:0!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
    }

    /* New income uses the exact same topbar action styling as New expense. */
    .topbar button.pv-new-income{
      width:138px!important;
      min-width:138px!important;
      max-width:138px!important;
      height:38px!important;
      min-height:38px!important;
      padding:0 12px!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      background:#1f6845!important;
      color:#fff!important;
      border:1px solid #1f6845!important;
      border-radius:9px!important;
      font-weight:700!important;
      white-space:nowrap!important;
      box-shadow:none!important;
    }
    .topbar button.pv-new-income:hover{
      background:#19583a!important;
      border-color:#19583a!important;
    }

    @media(max-width:1180px){
      .pv-account-row-r3g[data-pv-cols="4"]{
        grid-template-columns:minmax(0,.9fr) minmax(0,1fr) minmax(0,1.15fr) minmax(0,1.65fr)!important;
      }
    }
  `;
  document.head.appendChild(style);

  function heading(card){return txt(q('.card-head h3,.card-head h2,h3,h2',card));}
  function cardByHeading(re){return A('.card').find(c=>re.test(heading(c)))||null;}

  function commonAncestor(nodes){
    const valid=nodes.filter(Boolean);if(valid.length<2)return null;
    let p=valid[0].parentElement;
    while(p&&p!==document.body){
      if(valid.every(n=>p.contains(n)))return p;
      p=p.parentElement;
    }
    return null;
  }

  function directChild(root,node){
    let n=node;
    while(n&&n.parentElement&&n.parentElement!==root)n=n.parentElement;
    return n&&n.parentElement===root?n:null;
  }

  function fixAccounts(){
    const dist=cardByHeading(/^Account Distribution$/i) || A('.card').find(c=>q('.distribution .donut,.donut-wrap .donut',c));
    const recent=cardByHeading(/^Recent Transfers$/i);
    const snap=cardByHeading(/^Account Snapshot$/i) || A('.card').find(c=>{
      const h=A('th',c).map(txt).join(' ');
      return /Account/i.test(h)&&/Money In/i.test(h)&&/Money Out/i.test(h);
    });
    const detail=A('.card,.detail').find(c=>/Recurring Activity/i.test(txt(c))&&/Currency/i.test(txt(c))&&/Money in/i.test(txt(c)));
    const cards=[dist,recent,snap,detail].filter(Boolean);
    if(cards.length<3)return;

    /* Remove the previous three-column marker that caused the crushed layout. */
    A('.pv-accounts-three').forEach(x=>x.classList.remove('pv-accounts-three'));

    const root=commonAncestor(cards);
    const page=cards[0].closest('.page,.workspace,.content');
    if(!root||root===document.body||root===page)return;

    const items=[...new Set(cards.map(c=>directChild(root,c)).filter(Boolean))];
    if(items.length<2||items.length>4)return;

    root.classList.add('pv-account-row-r3g');
    root.dataset.pvCols=String(items.length);
    root.style.setProperty('width','100%','important');
    root.style.setProperty('max-width','100%','important');
    root.style.setProperty('min-width','0','important');
    root.style.setProperty('grid-column','1 / -1','important');
    root.style.setProperty('flex-basis','100%','important');

    items.forEach(i=>i.classList.add('pv-account-row-item-r3g'));

    const parent=root.parentElement;
    if(parent){
      parent.style.setProperty('min-width','0','important');
      const d=getComputedStyle(parent).display;
      if(d.includes('grid'))root.style.setProperty('grid-column','1 / -1','important');
      if(d.includes('flex'))root.style.setProperty('flex','1 1 100%','important');
    }
  }

  function visibleRoot(){
    const roots=A('[role="dialog"],.modal,.dialog,.drawer,.sheet').filter(x=>{
      const s=getComputedStyle(x);return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0';
    });
    return roots.at(-1)||document;
  }

  function setIncomeMode(){
    const root=visibleRoot();
    const candidates=A('button,[role="tab"],[data-type],[data-kind],[data-mode]',root);
    const income=candidates.find(b=>/^(income|add income|new income)$/i.test(txt(b)) || /income/i.test((b.dataset.type||'')+' '+(b.dataset.kind||'')+' '+(b.dataset.mode||'')));
    if(income){income.click();return true;}

    const sel=A('select',root).find(s=>A('option',s).some(o=>/income/i.test((o.value||'')+' '+txt(o))));
    if(sel){
      const op=A('option',sel).find(o=>/income/i.test((o.value||'')+' '+txt(o)));
      if(op){sel.value=op.value;sel.dispatchEvent(new Event('change',{bubbles:true}));return true;}
    }

    const radio=A('input[type="radio"]',root).find(r=>/income/i.test((r.value||'')+' '+(r.id||'')));
    if(radio){radio.click();radio.dispatchEvent(new Event('change',{bubbles:true}));return true;}

    const label=A('label',root).find(l=>/^income$/i.test(txt(l)));
    if(label){label.click();return true;}
    return false;
  }

  function fixTopIncome(){
    const top=q('.topbar');if(!top)return;
    const buttons=A('button',top);
    const b=buttons.find(x=>x.classList.contains('pv-new-transaction')) || buttons.find(x=>/new\s+(transaction|income)/i.test(txt(x)));
    if(!b)return;

    b.classList.add('pv-top-action','pv-new-income');
    b.textContent='+ New income';
    b.setAttribute('aria-label','New income');
    b.title='New income';

    if(b.dataset.pvIncomeR3g!=='1'){
      b.dataset.pvIncomeR3g='1';
      b.addEventListener('click',()=>{
        [20,70,140,240,380].forEach(ms=>setTimeout(setIncomeMode,ms));
      });
    }
  }

  function hideDuplicateRailControl(){
    const ex=q('#pvExpand');
    if(ex){
      ex.setAttribute('aria-hidden','true');
      ex.tabIndex=-1;
    }
  }

  function apply(){
    hideDuplicateRailControl();
    fixTopIncome();
    fixAccounts();
  }

  let pending=false;
  function queue(){
    if(pending)return;pending=true;
    requestAnimationFrame(()=>{pending=false;apply();});
  }

  function start(){
    apply();
    const mo=new MutationObserver(queue);
    mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    window.addEventListener('resize',queue,{passive:true});
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
