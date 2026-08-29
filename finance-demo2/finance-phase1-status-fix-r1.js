(()=>{
  if(window.__PV_PHASE1_STATUS_FIX_R1__) return;
  window.__PV_PHASE1_STATUS_FIX_R1__=1;

  const q=(s,r=document)=>r.querySelector(s);
  const A=(s,r=document)=>[...r.querySelectorAll(s)];
  const norm=v=>String(v??'').replace(/\s+/g,' ').trim().toLowerCase();
  const KEY='pavenro.finance.phase1.statusfix.r1';
  const cache=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{"bills":{},"tx":{}}')}catch(_){return{bills:{},tx:{}}}})();
  cache.bills ||= {}; cache.tx ||= {};
  const saveCache=()=>{try{localStorage.setItem(KEY,JSON.stringify(cache))}catch(_){}};

  const billName=x=>Array.isArray(x)?String(x[1]??''):String(x?.name??x?.billName??x?.title??x?.merchant??'');
  const txName=x=>Array.isArray(x)?String(x[2]??''):String(x?.merchant??x?.description??x?.name??x?.title??'');
  const setStatus=(x,val,idx=6)=>{
    if(!x)return;
    if(Array.isArray(x)){x[idx]=val;return;}
    if('status' in x)x.status=val;
    else if('state' in x)x.state=val;
    else if(idx===6)x.status=val;
  };

  function stateCandidates(){
    const out=[];
    try{if(typeof state!=='undefined'&&state&&typeof state==='object')out.push(state)}catch(_){}
    try{if(typeof S!=='undefined'&&S&&typeof S==='object'&&!out.includes(S))out.push(S)}catch(_){}
    if(window.state&&typeof window.state==='object'&&!out.includes(window.state))out.push(window.state);
    if(window.S&&typeof window.S==='object'&&!out.includes(window.S))out.push(window.S);
    return out;
  }
  function arraysFrom(s,type){
    const keys=type==='bill'?['bills','b']:['transactions','t','activity'];
    const out=[];for(const k of keys)if(Array.isArray(s?.[k]))out.push(s[k]);return out;
  }
  function updateState(type,name,val){
    const nm=norm(name);if(!nm)return;
    for(const s of stateCandidates())for(const arr of arraysFrom(s,type)){
      const item=arr.find(x=>norm(type==='bill'?billName(x):txName(x))===nm);
      if(item)setStatus(item,val,6);
    }
  }
  function updateStored(type,name,val){
    const nm=norm(name);if(!nm)return;
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i)||'';
      if(k===KEY||!/(pavenro|finance|pv-fin)/i.test(k))continue;
      const raw=localStorage.getItem(k);if(!raw||raw[0]!=='{'&&raw[0]!=='[')continue;
      let obj;try{obj=JSON.parse(raw)}catch(_){continue}
      let changed=false;
      const roots=Array.isArray(obj)?[]:[obj];
      for(const root of roots){
        const keys=type==='bill'?['bills','b']:['transactions','t','activity'];
        for(const key of keys){
          const arr=root?.[key];if(!Array.isArray(arr))continue;
          const item=arr.find(x=>norm(type==='bill'?billName(x):txName(x))===nm);
          if(item){setStatus(item,val,6);changed=true;}
        }
      }
      if(changed){try{localStorage.setItem(k,JSON.stringify(obj))}catch(_){}}
    }
    try{if(typeof save==='function')save()}catch(_){}
    try{if(typeof saveState==='function')saveState()}catch(_){}
    try{if(typeof persistState==='function')persistState()}catch(_){}
  }
  function rowName(sel,type){
    const row=sel.closest('tr');
    if(row){const cells=[...row.cells].filter(c=>!c.contains(sel));const strong=cells.find(c=>q('b,strong',c));return (strong||cells[0])?.textContent?.trim()||'';}
    if(type==='bill'){
      const card=sel.closest('.card,.detail,.sidepanel');return q('h2,h3,.card-title,.detail-title',card)?.textContent?.trim()||'';
    }
    return '';
  }
  function persistChoice(type,name,val){
    const nm=norm(name);if(!nm)return;
    (type==='bill'?cache.bills:cache.tx)[nm]=val;saveCache();
    updateState(type,name,val);updateStored(type,name,val);
  }
  function bind(sel,type){
    if(sel.dataset.pvStatusFix==='1')return;
    sel.dataset.pvStatusFix='1';
    ['pointerdown','mousedown','mouseup','click'].forEach(ev=>sel.addEventListener(ev,e=>e.stopPropagation()));
    sel.addEventListener('keydown',e=>e.stopPropagation());
    sel.addEventListener('change',e=>{
      e.stopPropagation();
      const name=rowName(sel,type),val=sel.value;
      persistChoice(type,name,val);
      setTimeout(()=>{if(document.contains(sel))sel.value=val},0);
    });
  }
  function applyCached(sel,type){
    const name=rowName(sel,type),saved=(type==='bill'?cache.bills:cache.tx)[norm(name)];
    if(saved&&A('option',sel).some(o=>o.value===saved)){
      if(sel.value!==saved)sel.value=saved;
      updateState(type,name,saved);
    }
  }
  function mount(){
    A('select[data-pv-role="bill-status"],select[data-pv-role="bill-detail-status"]').forEach(sel=>{bind(sel,'bill');applyCached(sel,'bill')});
    A('select[data-pv-role="tx-status"]').forEach(sel=>{bind(sel,'tx');applyCached(sel,'tx')});
  }
  document.addEventListener('click',e=>{
    const nav=e.target.closest('#pvSide .nav-btn,.sidebar .nav-btn,[data-nav]');
    if(nav)setTimeout(mount,180);
  });
  window.addEventListener('pavenro:local-write',()=>setTimeout(mount,90));
  setTimeout(mount,220);
  setInterval(mount,3000);
})();
