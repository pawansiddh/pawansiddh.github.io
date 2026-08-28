(()=>{
  if(window.__PAVENRO_BELL_CONTRAST_R1__) return;
  window.__PAVENRO_BELL_CONTRAST_R1__=true;

  const style=document.createElement('style');
  style.id='pavenro-bell-contrast-r1-style';
  style.textContent=`
    html[data-pv-theme] .pv-notification-fix{
      position:relative!important;
      display:grid!important;
      place-items:center!important;
      width:40px!important;
      min-width:40px!important;
      height:40px!important;
      padding:0!important;
      border:1px solid var(--pvx-border,#d8e3da)!important;
      border-radius:10px!important;
      background:var(--pvx-panel2,#edf3ee)!important;
      color:var(--pvx-text,#17301f)!important;
      opacity:1!important;
      box-shadow:none!important;
    }
    html[data-pv-theme] .pv-notification-fix:hover{
      border-color:var(--pvx-brand,#21653f)!important;
      background:var(--pvx-input,var(--pvx-panel2,#edf3ee))!important;
    }
    html[data-pv-theme] .pv-notification-fix svg{
      width:18px!important;
      height:18px!important;
      display:block!important;
      color:inherit!important;
      opacity:1!important;
      visibility:visible!important;
      stroke:currentColor!important;
      fill:none!important;
    }
    html[data-pv-theme] .pv-notification-fix svg path,
    html[data-pv-theme] .pv-notification-fix svg line,
    html[data-pv-theme] .pv-notification-fix svg polyline,
    html[data-pv-theme] .pv-notification-fix svg circle{
      stroke:currentColor!important;
      opacity:1!important;
    }
    html[data-pv-theme] .pv-notification-fix i,
    html[data-pv-theme] .pv-notification-fix .icon,
    html[data-pv-theme] .pv-notification-fix [class*="bell"]{
      color:inherit!important;
      opacity:1!important;
      visibility:visible!important;
    }
    html[data-pv-theme="midnight"] .pv-notification-fix,
    html[data-pv-theme="graphite"] .pv-notification-fix{
      color:#f5fbf8!important;
      background:var(--pvx-panel2)!important;
      border-color:color-mix(in srgb,var(--pvx-text) 30%,var(--pvx-border))!important;
    }
    html[data-pv-theme] .pv-notification-fix::after{
      border-color:var(--pvx-panel,var(--pvx-bg))!important;
    }
    html[data-pv-theme] .pv-notification-fix [class*="dot"],
    html[data-pv-theme] .pv-notification-fix [class*="badge"],
    html[data-pv-theme] .pv-notification-fix [class*="count"]{
      opacity:1!important;
    }
  `;
  document.head.appendChild(style);

  function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
  function descriptor(el){return [el?.id,el?.className,el?.getAttribute?.('aria-label'),el?.getAttribute?.('title'),el?.getAttribute?.('data-action'),el?.getAttribute?.('data-testid')].filter(Boolean).join(' ').toLowerCase()}
  function likelyBell(btn){
    const d=descriptor(btn),html=(btn?.innerHTML||'').toLowerCase();
    return /notif|notification|bell|alert/.test(d)||/bell|notification/.test(html)||text(btn)==='🔔';
  }
  function mark(){
    const bar=document.querySelector('.topbar');
    if(!bar)return;
    const buttons=[...bar.querySelectorAll('button')];
    let bell=buttons.find(likelyBell);
    if(!bell){
      const tx=buttons.find(b=>/new transaction|transaction/.test(text(b)));
      if(tx){
        const i=buttons.indexOf(tx);
        bell=buttons.slice(i+1).find(b=>{
          const t=text(b),r=b.getBoundingClientRect();
          return !t||t.length<=2 ? r.width<=55&&r.height<=55 : false;
        });
      }
    }
    if(!bell)return;
    bell.classList.add('pv-notification-fix');
    if(!bell.getAttribute('aria-label'))bell.setAttribute('aria-label','Notifications');
    if(!bell.getAttribute('title'))bell.setAttribute('title','Notifications');
  }

  let queued=false;
  const schedule=()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;mark()});
  };
  mark();
  const mo=new MutationObserver(schedule);
  mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-pv-theme','style']});
  document.addEventListener('click',schedule,true);
  window.addEventListener('resize',schedule);
})();
