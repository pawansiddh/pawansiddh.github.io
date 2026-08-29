(()=>{
if(window.__PAWANRO_SIDEBAR_OWNER_R1__)return;
window.__PAWANRO_SIDEBAR_OWNER_R1__=true;
document.documentElement.dataset.pvSidebarShell='owner-r1';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],norm=v=>String(v??'').replace(/\s+/g,' ').trim();
const css=document.createElement('style');css.id='pv-sidebar-owner-r1-style';css.textContent=`
.sidebar{overflow-x:hidden!important}
.sidebar .brand{box-sizing:border-box!important;width:100%!important;max-width:100%!important;min-width:0!important;height:50px!important;min-height:50px!important;padding:0 10px!important;margin:0!important;inset:auto!important;left:auto!important;right:auto!important;transform:none!important;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:0!important;overflow:hidden!important;position:relative!important}
.sidebar .brand::before,.sidebar .brand::after{display:none!important;content:none!important;border:0!important;width:0!important;height:0!important}
.sidebar .brand>hr,.sidebar .brand>.divider,.sidebar .brand>.separator,.sidebar .brand>.pv-sep,.sidebar .brand>small,.sidebar .pv-brand-actions{display:none!important}
.sidebar .pv-brand-word{display:block!important;width:124px!important;height:auto!important;max-width:124px!important;max-height:18px!important;object-fit:contain!important;object-position:left center!important;margin:0!important;padding:0!important;border:0!important;opacity:1!important;visibility:visible!important;filter:none!important;flex:0 0 124px!important}
.sidebar .pv-brand-finance{display:inline-flex!important;align-items:center!important;margin:0 0 0 7px!important;padding:0!important;color:#fff!important;white-space:pre!important;line-height:1!important;flex:0 0 auto!important}
.sidebar .pv-brand-bar{font:500 13px/1 Inter,system-ui,sans-serif!important;opacity:.8!important;margin:0 5px 0 0!important}
.sidebar .pv-brand-product{font:800 8.5px/1 Inter,system-ui,sans-serif!important;letter-spacing:.08em!important;margin:0!important;padding:0!important}
.sidebar .pv-brand-mini{display:none!important;width:38px!important;height:38px!important;align-items:center!important;justify-content:center!important;margin:0!important;padding:0!important;flex:0 0 38px!important}
.sidebar .pv-brand-mini img{display:block!important;width:34px!important;height:34px!important;object-fit:contain!important;margin:0!important;padding:0!important;border:0!important}
.sidebar[data-pv-brand-collapsed="1"] .brand{box-sizing:border-box!important;width:100%!important;max-width:100%!important;height:50px!important;min-height:50px!important;padding:0!important;margin:0!important;justify-content:center!important;overflow:hidden!important}
.sidebar[data-pv-brand-collapsed="1"] .pv-brand-word,.sidebar[data-pv-brand-collapsed="1"] .pv-brand-finance{display:none!important}
.sidebar[data-pv-brand-collapsed="1"] .pv-brand-mini{display:flex!important}
.sidebar [data-pv-obsolete-brand]{display:none!important}
.sidebar .pv-util-label{display:inline!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
.sidebar[data-pv-brand-collapsed="1"] .pv-util-label{display:none!important}
.sidebar[data-pv-brand-collapsed="1"] button[data-v="Groups"],.sidebar[data-pv-brand-collapsed="1"] button[data-v="Settings"],.sidebar[data-pv-brand-collapsed="1"] button[data-v="Help & Support"]{justify-content:center!important;padding-left:0!important;padding-right:0!important}
`;document.head.appendChild(css);
let WORD='',ICON='',assetPromise=null,lastMode='';
async function loadAssets(){
 if(WORD&&ICON)return;
 if(window.__PAWANRO_BRAND_WORD_B64__&&window.__PAWANRO_BRAND_ICON_B64__){WORD='data:image/webp;base64,'+window.__PAWANRO_BRAND_WORD_B64__;ICON='data:image/webp;base64,'+window.__PAWANRO_BRAND_ICON_B64__;return}
 if(!assetPromise)assetPromise=Promise.all([
   Promise.all([0,1,2,3].map(i=>fetch(`brand-b64/word-${i}.txt?v=pawanro-brand-r1`).then(r=>{if(!r.ok)throw Error('wordmark asset '+i);return r.text()}))).then(x=>x.join('').trim()),
   Promise.all([0,1].map(i=>fetch(`brand-b64/icon-${i}.txt?v=pawanro-brand-r1`).then(r=>{if(!r.ok)throw Error('icon asset '+i);return r.text()}))).then(x=>x.join('').trim())
 ]).then(([w,i])=>{window.__PAWANRO_BRAND_WORD_B64__=w;window.__PAWANRO_BRAND_ICON_B64__=i;WORD='data:image/webp;base64,'+w;ICON='data:image/webp;base64,'+i});
 await assetPromise;
}
function side(){return q('.sidebar')||q('[data-sidebar]')}
function build(s){
 const b=q('.brand,.sidebar-brand,.brand-row',s);if(!b||!WORD||!ICON)return false;
 b.classList.add('brand');b.removeAttribute('style');b.replaceChildren();
 const w=document.createElement('img');w.id='pvPawanroWordmark';w.className='pv-brand-word';w.alt='PAWANRO';w.src=WORD;
 const p=document.createElement('span');p.className='pv-brand-finance';p.innerHTML='<span class="pv-brand-bar">|</span> <span class="pv-brand-product">FINANCE</span>';
 const m=document.createElement('span');m.className='pv-brand-mini';m.setAttribute('aria-hidden','true');const i=document.createElement('img');i.alt='';i.src=ICON;m.appendChild(i);
 b.append(w,p,m);b.title='PAWANRO | FINANCE';b.setAttribute('aria-label','PAWANRO | FINANCE');return true;
}
function clean(s){
 const sr=s.getBoundingClientRect();
 qa('*',s).forEach(el=>{if(el.closest('.brand')||el.closest('button,a,input,select'))return;const t=norm(el.textContent).toUpperCase(),r=el.getBoundingClientRect(),top=r.top-sr.top;if((t==='PAWANRO FINANCE'||t==='PAVENRO FINANCE'||t==='PAVENRO FOCUS · FINANCE'||t==='PAWANRO FOCUS · FINANCE')||((t==='$'||t==='|'||t==='FINANCE')&&top<90)||(top>=0&&top<65&&r.height>0&&r.height<=3&&r.width>=28)){el.dataset.pvObsoleteBrand='1';el.style.setProperty('display','none','important')}});
 qa('#pvSide [data-pv-brand-slot="1"],#pvSide .pv-brand-render,.pv-brand-render[data-pv-brand-slot]',s).forEach(el=>{el.dataset.pvObsoleteBrand='1';el.style.setProperty('display','none','important')});
}
function utility(s,name,icon){const b=qa('button',s).find(x=>norm(x.dataset.v||x.dataset.nav||x.title||x.getAttribute('aria-label')||x.textContent).toLowerCase().includes(name.toLowerCase()));if(!b)return;b.dataset.v=name;b.title=name;b.setAttribute('aria-label',name);let l=q('.pv-util-label',b);if(!l){b.textContent='';const i=document.createElement('span');i.className='pv-util-icon';i.textContent=icon;i.setAttribute('aria-hidden','true');l=document.createElement('span');l.className='pv-util-label';b.append(i,l)}l.textContent=name}
function refresh(force=false){
 const s=side();if(!s)return;const collapsed=document.body.classList.contains('pv-rail')||s.getBoundingClientRect().width<100;s.dataset.pvBrandCollapsed=collapsed?'1':'0';const mode=collapsed?'c':'e',w=q('#pvPawanroWordmark',s),p=q('.brand .pv-brand-finance',s),m=q('.brand .pv-brand-mini',s);
 if(WORD&&ICON&&(force||!w||!p||!m||mode!==lastMode)){build(s);lastMode=mode}
 clean(s);utility(s,'Groups','◎');utility(s,'Settings','⚙');utility(s,'Help & Support','?');
}
async function start(){try{await loadAssets();refresh(true)}catch(e){console.error('PAWANRO brand assets failed',e)}}
document.addEventListener('click',()=>setTimeout(()=>refresh(false),60),true);window.addEventListener('resize',()=>refresh(false));window.addEventListener('pavenro:ready',()=>refresh(true));window.addEventListener('pavenro:local-write',()=>setTimeout(()=>refresh(false),60));
start();const s=side();if(s&&'ResizeObserver'in window)new ResizeObserver(()=>refresh(false)).observe(s);window.PawanroSidebarShell={refresh:()=>refresh(true),reload:start};
})();