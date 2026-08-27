(()=>{
  if(window.__PV_FIN_SEARCH_R3)return;
  window.__PV_FIN_SEARCH_R3=1;

  const q=(s,r=document)=>r.querySelector(s);
  const A=(s,r=document)=>[...r.querySelectorAll(s)];

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

  function normalize(){
    moveRealSearch();
    bindSidebarSearch();
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
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
