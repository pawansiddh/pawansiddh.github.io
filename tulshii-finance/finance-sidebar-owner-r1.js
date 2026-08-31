(()=>{
if(window.__PAWANRO_SIDEBAR_OWNER_R2__)return;
window.__PAWANRO_SIDEBAR_OWNER_R2__=true;
document.documentElement.dataset.pvSidebarShell='owner-r2';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],norm=v=>String(v??'').replace(/\s+/g,' ').trim();
const css=document.createElement('style');css.id='pv-sidebar-owner-r2-style';css.textContent=`
:root{--pv-bh:var(--pv-sidebar-head-h,var(--pv-th,64px))!important}
#pvOfflineSyncStatus{display:none!important;visibility:hidden!important}
.sidebar{overflow-x:hidden!important;padding-top:0!important}
.sidebar .brand{box-sizing:border-box!important;width:var(--pv-w,226px)!important;max-width:var(--pv-w,226px)!important;height:var(--pv-sidebar-head-h,var(--pv-th,64px))!important;min-height:var(--pv-sidebar-head-h,var(--pv-th,64px))!important;padding:0 10px!important;margin:0!important;left:0!important;right:auto!important;top:0!important;transform:none!important;border:0!important;outline:0!important;box-shadow:none!important;background:var(--sidebar,#123f2b)!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:0!important;overflow:hidden!important;position:fixed!important;z-index:190!important}
.sidebar .brand::before,.sidebar .brand::after{display:none!important;content:none!important}
.sidebar .brand>hr,.sidebar .brand>.divider,.sidebar .brand>.separator,.sidebar .brand>.pv-sep,.sidebar .brand>small,.sidebar .pv-brand-actions{display:none!important}
.sidebar .brand img.pv-brand-word{display:block!important;width:124px!important;height:auto!important;max-width:124px!important;max-height:18px!important;object-fit:contain!important;object-position:left center!important;margin:0!important;padding:0!important;border:0!important;opacity:1!important;visibility:visible!important;filter:none!important;flex:0 0 124px!important}
.sidebar .pv-brand-finance{display:inline-flex!important;align-items:center!important;margin-left:7px!important;padding:0!important;color:#fff!important;white-space:nowrap!important;line-height:1!important}
.sidebar .pv-brand-bar{font:500 13px/1 Inter,system-ui,sans-serif!important;opacity:.8!important;margin-right:5px!important}
.sidebar .pv-brand-product{font:800 8.5px/1 Inter,system-ui,sans-serif!important;letter-spacing:.08em!important}
.sidebar .pv-brand-mini{display:none!important;width:42px!important;height:42px!important;flex:0 0 42px!important;background-repeat:no-repeat!important;background-position:center!important;background-size:36px 36px!important;margin:0!important;padding:0!important;border:0!important}
body.pv-rail .sidebar{width:var(--pv-r,58px)!important;max-width:var(--pv-r,58px)!important;overflow:hidden!important}
body.pv-rail .sidebar .brand,.sidebar[data-pv-brand-collapsed="1"] .brand{width:var(--pv-r,58px)!important;max-width:var(--pv-r,58px)!important;height:var(--pv-sidebar-head-h,var(--pv-th,64px))!important;min-height:var(--pv-sidebar-head-h,var(--pv-th,64px))!important;padding:0!important;left:0!important;top:0!important;justify-content:center!important;overflow:hidden!important}
body.pv-rail .sidebar .brand img.pv-brand-word,.sidebar[data-pv-brand-collapsed="1"] .brand img.pv-brand-word,body.pv-rail .sidebar .pv-brand-finance,.sidebar[data-pv-brand-collapsed="1"] .pv-brand-finance{display:none!important}
body.pv-rail .sidebar .brand .pv-brand-mini,.sidebar[data-pv-brand-collapsed="1"] .brand .pv-brand-mini{display:block!important;visibility:visible!important;opacity:1!important}
#pvSide{top:var(--pv-sidebar-head-h,var(--pv-th,64px))!important}
.sidebar [data-pv-obsolete-brand]{display:none!important}
.sidebar .pv-util-label{display:inline!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
.sidebar[data-pv-brand-collapsed="1"] .pv-util-label{display:none!important}
`;document.head.appendChild(css);
let WORD='',ICON='',assetPromise=null,lastMode='';
async function loadAssets(){
 if(WORD&&ICON)return;
 if(window.__PAWANRO_BRAND_WORD_B64__&&window.__PAWANRO_BRAND_ICON_B64__){WORD='data:image/webp;base64,'+window.__PAWANRO_BRAND_WORD_B64__;ICON='data:image/webp;base64,'+window.__PAWANRO_BRAND_ICON_B64__;return}
 if(!assetPromise)assetPromise=Promise.all([
  Promise.all([0,1,2,3].map(i=>fetch(`brand-b64/word-${i}.txt?v=pawanro-brand-r2`).then(r=>{if(!r.ok)throw Error('wordmark asset '+i);return r.text()}))).then(x=>x.join('').trim()),
  Promise.all([0,1].map(i=>fetch(`brand-b64/icon-${i}.txt?v=pawanro-brand-r2`).then(r=>{if(!r.ok)throw Error('icon asset '+i);return r.text()}))).then(x=>x.join('').trim())
 ]).then(([w,i])=>{window.__PAWANRO_BRAND_WORD_B64__=w;window.__PAWANRO_BRAND_ICON_B64__=i;WORD='data:image/webp;base64,'+w;ICON='data:image/webp;base64,'+i});
 await assetPromise;
}
function side(){return q('.sidebar')||q('[data-sidebar]')}
function syncHeaderHeight(){const top=q('.topbar');const h=Math.round(top?.getBoundingClientRect().height||64);document.documentElement.style.setProperty('--pv-sidebar-head-h',h+'px');document.documentElement.style.setProperty('--pv-bh',h+'px');return h}
function build(s){const b=q('.brand,.sidebar-brand,.brand-row',s);if(!b||!WORD||!ICON)return false;b.classList.add('brand');b.removeAttribute('style');b.replaceChildren();const w=document.createElement('img');w.id='pvPawanroWordmark';w.className='pv-brand-word';w.alt='PAWANRO';w.src=WORD;const p=document.createElement('span');p.className='pv-brand-finance';p.innerHTML='<span class="pv-brand-bar">|</span><span class="pv-brand-product">FINANCE</span>';const m=document.createElement('span');m.className='pv-brand-mini';m.setAttribute('aria-label','PAWANRO');m.style.backgroundImage=`url("${ICON}")`;b.append(w,p,m);b.title='PAWANRO | FINANCE';b.setAttribute('aria-label','PAWANRO | FINANCE');return true}
function clean(s){const sr=s.getBoundingClientRect();qa('*',s).forEach(el=>{if(el.closest('.brand')||el.closest('button,a,input,select'))return;const t=norm(el.textContent).toUpperCase(),r=el.getBoundingClientRect(),top=r.top-sr.top;if((t==='PAWANRO FINANCE'||t==='PAVENRO FINANCE')||((t==='$'||t==='|'||t==='FINANCE')&&top<100)||(top>=0&&top<70&&r.height>0&&r.height<=3&&r.width>=28)){el.dataset.pvObsoleteBrand='1';el.style.setProperty('display','none','important')}});qa('#pvSide [data-pv-brand-slot="1"],#pvSide .pv-brand-render,.pv-brand-render[data-pv-brand-slot]',s).forEach(el=>{el.dataset.pvObsoleteBrand='1';el.style.setProperty('display','none','important')});q('#pvOfflineSyncStatus')?.remove()}
function refresh(force=false){syncHeaderHeight();const s=side();if(!s)return;const collapsed=document.body.classList.contains('pv-rail')||s.getBoundingClientRect().width<100;s.dataset.pvBrandCollapsed=collapsed?'1':'0';const mode=collapsed?'c':'e';if(WORD&&ICON&&(force||!q('#pvPawanroWordmark',s)||!q('.pv-brand-mini',s)||mode!==lastMode)){build(s);lastMode=mode}clean(s)}
async function start(){try{await loadAssets();refresh(true)}catch(e){console.error('PAWANRO sidebar R2 assets failed',e)}}
document.addEventListener('click',()=>setTimeout(()=>refresh(false),40),true);window.addEventListener('resize',()=>refresh(false));window.addEventListener('pavenro:ready',()=>refresh(true));window.addEventListener('pavenro:local-write',()=>setTimeout(()=>refresh(false),40));start();const s=side();if(s&&'ResizeObserver'in window)new ResizeObserver(()=>refresh(false)).observe(s);const t=q('.topbar');if(t&&'ResizeObserver'in window)new ResizeObserver(()=>refresh(false)).observe(t);window.PawanroSidebarShell={refresh:()=>refresh(true),reload:start,version:'r2'};
})();