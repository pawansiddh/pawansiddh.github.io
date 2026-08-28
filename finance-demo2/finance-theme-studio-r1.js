(()=>{
  if(window.__PAVENRO_THEME_STUDIO_R1__) return;
  window.__PAVENRO_THEME_STUDIO_R1__=true;

  const KEY='pavenro.finance.themeStudio.r1';
  const THEMES={
    sage:{name:'Sage Light',kind:'light',bg:'#f5f6f1',panel:'#ffffff',panel2:'#edf3ee',text:'#17301f',muted:'#66766c',border:'#d8e3da',brand:'#21653f',brand2:'#2f7b4d',sidebar:'#10452f',sideText:'#ffffff',input:'#ffffff',danger:'#c44f45',success:'#2e7c48'},
    white:{name:'Pure White',kind:'light',bg:'#f8f9f7',panel:'#ffffff',panel2:'#f1f3f1',text:'#18221c',muted:'#69736d',border:'#dfe4e0',brand:'#285f44',brand2:'#347956',sidebar:'#173a2c',sideText:'#ffffff',input:'#ffffff',danger:'#c84d45',success:'#287d4a'},
    ocean:{name:'Ocean Mist',kind:'light',bg:'#edf6f7',panel:'#ffffff',panel2:'#e3f0f2',text:'#123238',muted:'#5f777b',border:'#cce0e2',brand:'#147987',brand2:'#238d98',sidebar:'#0c4d57',sideText:'#ffffff',input:'#fbffff',danger:'#c95148',success:'#237b58'},
    sand:{name:'Warm Sand',kind:'light',bg:'#fbf6ed',panel:'#fffaf3',panel2:'#f4eadb',text:'#3a2c1f',muted:'#7b6959',border:'#e6d8c4',brand:'#8f5c37',brand2:'#a46d43',sidebar:'#51331f',sideText:'#fffaf3',input:'#fffdf8',danger:'#ba4d44',success:'#527947'},
    midnight:{name:'Midnight Navy',kind:'dark',bg:'#071522',panel:'#102335',panel2:'#162c40',text:'#eef6f2',muted:'#a5b8b2',border:'#2c4558',brand:'#7f6cf2',brand2:'#9b8cff',sidebar:'#071b2a',sideText:'#f7fbf9',input:'#13293c',danger:'#ff8278',success:'#62d38c'},
    graphite:{name:'Graphite',kind:'dark',bg:'#121516',panel:'#1c2122',panel2:'#252b2c',text:'#f1f4f2',muted:'#adb6b1',border:'#374041',brand:'#59b583',brand2:'#72c899',sidebar:'#0d1112',sideText:'#f8faf9',input:'#222829',danger:'#ff8178',success:'#61cf8b'}
  };
  const FONTS={
    classic:{name:'Pavenro Classic',body:'Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif',head:'Georgia,"Times New Roman",serif',sample:'Aa Finance planning'},
    modern:{name:'Modern Sans',body:'"Segoe UI",Inter,ui-sans-serif,system-ui,sans-serif',head:'"Segoe UI",Inter,ui-sans-serif,system-ui,sans-serif',sample:'Aa Clean & modern'},
    rounded:{name:'Soft Rounded',body:'"Trebuchet MS","Segoe UI",system-ui,sans-serif',head:'"Trebuchet MS","Segoe UI",system-ui,sans-serif',sample:'Aa Friendly workspace'},
    editorial:{name:'Editorial Serif',body:'Georgia,"Times New Roman",serif',head:'Georgia,"Times New Roman",serif',sample:'Aa Calm & editorial'}
  };
  const DENSITY={comfortable:{name:'Comfortable',scale:1,space:1},compact:{name:'Compact',scale:.94,space:.86},roomy:{name:'Roomy',scale:1.04,space:1.12}};
  let prefs=load();
  let applying=false;

  const css=document.createElement('style');
  css.id='pavenro-theme-studio-r1-style';
  css.textContent=`
    html[data-pv-theme]{background:var(--pvx-bg)!important}
    html[data-pv-theme] body,html[data-pv-theme] .app,html[data-pv-theme] .main,html[data-pv-theme] .workspace,html[data-pv-theme] .content,html[data-pv-theme] .page{background:var(--pvx-bg)!important;color:var(--pvx-text)!important}
    html[data-pv-theme] body,html[data-pv-theme] button,html[data-pv-theme] input,html[data-pv-theme] select,html[data-pv-theme] textarea,html[data-pv-theme] table{font-family:var(--pvx-body-font)!important}
    html[data-pv-theme] h1,html[data-pv-theme] h2,html[data-pv-theme] h3,html[data-pv-theme] h4,html[data-pv-theme] .pv-title,html[data-pv-theme] .stat-value,html[data-pv-theme] .kv,html[data-pv-theme] .pv-big,html[data-pv-theme] .pv-dkpi b,html[data-pv-theme] .pv-result b,html[data-pv-theme] .pv-output-hero{font-family:var(--pvx-heading-font)!important}
    html[data-pv-theme] .topbar{background:var(--pvx-panel)!important;color:var(--pvx-text)!important;border-color:var(--pvx-border)!important}
    html[data-pv-theme] .card,html[data-pv-theme] .stat,html[data-pv-theme] .stat-card,html[data-pv-theme] .account-card,html[data-pv-theme] .goal-card,html[data-pv-theme] .doc-cat,html[data-pv-theme] .category-tile,html[data-pv-theme] .modal,html[data-pv-theme] .modal-card{background:var(--pvx-panel)!important;color:var(--pvx-text)!important;border-color:var(--pvx-border)!important}
    html[data-pv-theme] .muted,html[data-pv-theme] .micro,html[data-pv-theme] .tiny,html[data-pv-theme] small,html[data-pv-theme] .stat-foot,html[data-pv-theme] .delta{color:var(--pvx-muted)!important}
    html[data-pv-theme] input,html[data-pv-theme] select,html[data-pv-theme] textarea{background:var(--pvx-input)!important;color:var(--pvx-text)!important;border-color:var(--pvx-border)!important}
    html[data-pv-theme] input::placeholder,html[data-pv-theme] textarea::placeholder{color:var(--pvx-muted)!important}
    html[data-pv-theme] table,html[data-pv-theme] th,html[data-pv-theme] td{color:var(--pvx-text)!important;border-color:var(--pvx-border)!important}
    html[data-pv-theme] th{color:var(--pvx-muted)!important}
    html[data-pv-theme] .sidebar,html[data-pv-theme] #pvSide,html[data-pv-theme] .sidebar .brand{background:var(--pvx-sidebar)!important;color:var(--pvx-sideText)!important}
    html[data-pv-theme] #pvSide .nav-btn,html[data-pv-theme] #pvSide .utility-btn,html[data-pv-theme] #pvSide .more-btn,html[data-pv-theme] .sidebar .help-btn{color:var(--pvx-sideText)!important}
    html[data-pv-theme] .quick,html[data-pv-theme] .quick-actions button,html[data-pv-theme] .pv-cur{background:var(--pvx-panel2)!important;color:var(--pvx-text)!important}
    html[data-pv-theme] .progress,html[data-pv-theme] .pv-progress{background:var(--pvx-border)!important}
    html[data-pv-theme] .progress i,html[data-pv-theme] .pv-progress i{background:var(--pvx-brand)!important}
    html[data-pv-theme] .btn.pri,html[data-pv-theme] .primary,html[data-pv-theme] .pv-dbtn.primary{background:var(--pvx-brand)!important;color:#fff!important;border-color:transparent!important}

    html[data-pv-theme] .pv-debt{color:var(--pvx-text)!important}
    html[data-pv-theme] .pv-debt-head,html[data-pv-theme] .pv-debt-title,html[data-pv-theme] .pv-debt-title h2,html[data-pv-theme] .pv-debt-title p{color:var(--pvx-text)!important}
    html[data-pv-theme] .pv-debt-title p,html[data-pv-theme] .pv-debt small,html[data-pv-theme] .pv-debt label,html[data-pv-theme] .pv-strategy-sub,html[data-pv-theme] .pv-disclaimer,html[data-pv-theme] .pv-chart-head,html[data-pv-theme] .pv-result span,html[data-pv-theme] .pv-dkpi span{color:var(--pvx-muted)!important}
    html[data-pv-theme] .pv-debt-body,html[data-pv-theme] .pv-debt-kpis .pv-dkpi,html[data-pv-theme] .pv-dcard,html[data-pv-theme] .pv-formbox,html[data-pv-theme] .pv-outputbox,html[data-pv-theme] .pv-chart,html[data-pv-theme] .pv-strategy-card{background:var(--pvx-panel)!important;color:var(--pvx-text)!important;border-color:var(--pvx-border)!important}
    html[data-pv-theme] .pv-dtabs,html[data-pv-theme] .pv-mini,html[data-pv-theme] .pv-result,html[data-pv-theme] .pv-note,html[data-pv-theme] .pv-insight{background:var(--pvx-panel2)!important;color:var(--pvx-text)!important;border-color:var(--pvx-border)!important}
    html[data-pv-theme] .pv-dtab,html[data-pv-theme] .pv-calc-btn{color:var(--pvx-muted)!important}
    html[data-pv-theme] .pv-dtab.active,html[data-pv-theme] .pv-calc-btn.active,html[data-pv-theme] .pv-debt-row,html[data-pv-theme] .pv-order-row,html[data-pv-theme] .pv-output-row{background:var(--pvx-input)!important;color:var(--pvx-text)!important;border-color:var(--pvx-border)!important}
    html[data-pv-theme] .pv-dbtn{background:var(--pvx-input)!important;color:var(--pvx-text)!important;border-color:var(--pvx-border)!important}
    html[data-pv-theme] .pv-chart-grid{stroke:var(--pvx-border)!important}.pv-chart-plan{stroke:var(--pvx-brand)!important}

    html[data-pv-density=compact] .workspace,html[data-pv-density=compact] .content{padding-top:5px!important;padding-bottom:5px!important}
    html[data-pv-density=compact] .card,html[data-pv-density=compact] .pv-dcard,html[data-pv-density=compact] .pv-formbox,html[data-pv-density=compact] .pv-outputbox{padding-top:calc(8px * var(--pvx-space))!important;padding-bottom:calc(8px * var(--pvx-space))!important}

    #pvThemeStudioBtn{width:34px;height:34px;border:1px solid var(--pvx-border,#d8e3da);border-radius:9px;background:var(--pvx-panel2,#edf3ee);color:var(--pvx-text,#17301f);display:grid;place-items:center;cursor:pointer;font-size:15px;flex:0 0 34px}
    #pvThemeStudioBtn:hover{transform:translateY(-1px)}
    .pvts-shade{position:fixed;inset:0;z-index:10050;background:#06120c66;display:grid;place-items:center;padding:18px;backdrop-filter:blur(3px)}
    .pvts-panel{width:min(760px,calc(100vw - 28px));max-height:calc(100vh - 30px);overflow:auto;border-radius:16px;background:var(--pvx-panel,#fff);color:var(--pvx-text,#17301f);border:1px solid var(--pvx-border,#d8e3da);box-shadow:0 24px 70px #0005;padding:15px}
    .pvts-head{display:flex;gap:10px;align-items:flex-start}.pvts-head h2{margin:0;font:800 20px/1.1 var(--pvx-heading-font,Georgia)}.pvts-head p{margin:4px 0 0;color:var(--pvx-muted);font-size:10px}.pvts-close{margin-left:auto;width:32px;height:32px;border:1px solid var(--pvx-border);background:var(--pvx-panel2);color:var(--pvx-text);border-radius:9px;cursor:pointer}
    .pvts-section{margin-top:15px}.pvts-label{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}.pvts-label b{font-size:11px}.pvts-label span{font-size:8px;color:var(--pvx-muted)}
    .pvts-themes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.pvts-theme{border:1px solid var(--pvx-border);background:var(--pvx-panel2);color:var(--pvx-text);border-radius:11px;padding:8px;text-align:left;cursor:pointer}.pvts-theme.active{outline:2px solid var(--pvx-brand);outline-offset:1px}.pvts-swatch{height:46px;border-radius:8px;overflow:hidden;display:grid;grid-template-columns:26% 1fr;border:1px solid #ffffff22}.pvts-swatch i{display:block}.pvts-swatch span{display:grid;grid-template-rows:1fr 1fr}.pvts-theme strong{display:block;margin-top:6px;font-size:9.5px}.pvts-theme small{font-size:7.5px;color:var(--pvx-muted)}
    .pvts-fonts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.pvts-font{min-height:58px;border:1px solid var(--pvx-border);background:var(--pvx-panel2);color:var(--pvx-text);border-radius:10px;padding:8px;text-align:left;cursor:pointer}.pvts-font.active{outline:2px solid var(--pvx-brand);outline-offset:1px}.pvts-font b{display:block;font-size:10px}.pvts-font em{display:block;margin-top:5px;font-size:16px;font-style:normal}.pvts-density{display:flex;gap:6px;flex-wrap:wrap}.pvts-density button{height:31px;border:1px solid var(--pvx-border);background:var(--pvx-panel2);color:var(--pvx-text);border-radius:9px;padding:0 11px;font-size:9px;font-weight:700;cursor:pointer}.pvts-density button.active{background:var(--pvx-brand);color:#fff;border-color:transparent}
    .pvts-foot{display:flex;align-items:center;gap:8px;margin-top:15px;padding-top:10px;border-top:1px solid var(--pvx-border)}.pvts-foot small{color:var(--pvx-muted);font-size:8px}.pvts-reset{margin-left:auto;height:31px;border:1px solid var(--pvx-border);background:transparent;color:var(--pvx-text);border-radius:9px;padding:0 10px;font-size:9px;cursor:pointer}
    @media(max-width:680px){.pvts-themes{grid-template-columns:repeat(2,minmax(0,1fr))}.pvts-fonts{grid-template-columns:1fr}}
  `;
  document.head.appendChild(css);

  function load(){try{return Object.assign({theme:'sage',font:'classic',density:'comfortable'},JSON.parse(localStorage.getItem(KEY)||'{}')||{})}catch(e){return{theme:'sage',font:'classic',density:'comfortable'}}}
  function save(){localStorage.setItem(KEY,JSON.stringify(prefs))}
  function setVar(el,k,v){el.style.setProperty(k,v,'important')}
  function apply(){
    if(applying)return;applying=true;
    const t=THEMES[prefs.theme]||THEMES.sage,f=FONTS[prefs.font]||FONTS.classic,d=DENSITY[prefs.density]||DENSITY.comfortable;
    const root=document.documentElement,body=document.body;
    root.dataset.pvTheme=prefs.theme;root.dataset.pvDensity=prefs.density;root.dataset.pvFont=prefs.font;
    const vars={
      '--pvx-bg':t.bg,'--pvx-panel':t.panel,'--pvx-panel2':t.panel2,'--pvx-text':t.text,'--pvx-muted':t.muted,'--pvx-border':t.border,'--pvx-brand':t.brand,'--pvx-brand2':t.brand2,'--pvx-sidebar':t.sidebar,'--pvx-sideText':t.sideText,'--pvx-input':t.input,'--pvx-danger':t.danger,'--pvx-success':t.success,'--pvx-body-font':f.body,'--pvx-heading-font':f.head,'--pvx-scale':String(d.scale),'--pvx-space':String(d.space),
      '--bg':t.bg,'--background':t.bg,'--panel':t.panel,'--panel2':t.panel2,'--surface':t.panel,'--surface2':t.panel2,'--text':t.text,'--muted':t.muted,'--border':t.border,'--brand':t.brand,'--brand2':t.brand2,'--accent':t.brand,'--sidebar':t.sidebar,'--sideText':t.sideText,'--danger':t.danger,'--success':t.success
    };
    [root,body].filter(Boolean).forEach(el=>Object.entries(vars).forEach(([k,v])=>setVar(el,k,v)));
    if(body){body.classList.toggle('light',t.kind==='light');body.classList.toggle('pv-custom-dark',t.kind==='dark')}
    try{const s=JSON.parse(localStorage.getItem('pv-fin-live')||'null');if(s&&s.s){s.s.theme=t.kind==='light'?'light':'dark';localStorage.setItem('pv-fin-live',JSON.stringify(s))}}catch(e){}
    setTimeout(()=>{applying=false},0);
  }

  function ensureButton(){
    if(document.getElementById('pvThemeStudioBtn'))return;
    const top=document.querySelector('.topbar');if(!top)return;
    const b=document.createElement('button');b.id='pvThemeStudioBtn';b.type='button';b.title='Theme Studio';b.setAttribute('aria-label','Open Theme Studio');b.textContent='◐';b.onclick=openStudio;
    const tx=[...top.querySelectorAll('button')].find(x=>/new transaction/i.test(x.textContent||''));
    if(tx)top.insertBefore(b,tx);else top.appendChild(b);
  }

  function openStudio(){
    document.querySelector('.pvts-shade')?.remove();
    const shade=document.createElement('div');shade.className='pvts-shade';
    shade.innerHTML=`<div class="pvts-panel" role="dialog" aria-modal="true"><div class="pvts-head"><div><h2>Theme Studio</h2><p>Customize Finance without changing your data. Preferences stay on this device.</p></div><button class="pvts-close" data-close>×</button></div>
      <section class="pvts-section"><div class="pvts-label"><b>Interface theme</b><span>6 palettes</span></div><div class="pvts-themes">${Object.entries(THEMES).map(([id,t])=>`<button class="pvts-theme ${prefs.theme===id?'active':''}" data-theme="${id}"><div class="pvts-swatch"><i style="background:${t.sidebar}"></i><span><i style="background:${t.bg}"></i><i style="background:${t.panel}"></i></span></div><strong>${t.name}</strong><small>${t.kind==='dark'?'Dark':'Light'} workspace</small></button>`).join('')}</div></section>
      <section class="pvts-section"><div class="pvts-label"><b>Text style</b><span>System fonts · no downloads</span></div><div class="pvts-fonts">${Object.entries(FONTS).map(([id,f])=>`<button class="pvts-font ${prefs.font===id?'active':''}" data-font="${id}"><b>${f.name}</b><em style="font-family:${f.head}">${f.sample}</em></button>`).join('')}</div></section>
      <section class="pvts-section"><div class="pvts-label"><b>Interface density</b><span>Useful for laptops vs large displays</span></div><div class="pvts-density">${Object.entries(DENSITY).map(([id,d])=>`<button class="${prefs.density===id?'active':''}" data-density="${id}">${d.name}</button>`).join('')}</div></section>
      <div class="pvts-foot"><small>Theme changes apply immediately across Dashboard, Debt, calculators, tables and dialogs.</small><button class="pvts-reset" data-reset>Reset defaults</button></div></div>`;
    document.body.appendChild(shade);
    const rerender=()=>{apply();save();shade.remove();openStudio()};
    shade.querySelector('[data-close]').onclick=()=>shade.remove();shade.addEventListener('click',e=>{if(e.target===shade)shade.remove()});
    shade.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{prefs.theme=b.dataset.theme;rerender()});
    shade.querySelectorAll('[data-font]').forEach(b=>b.onclick=()=>{prefs.font=b.dataset.font;rerender()});
    shade.querySelectorAll('[data-density]').forEach(b=>b.onclick=()=>{prefs.density=b.dataset.density;rerender()});
    shade.querySelector('[data-reset]').onclick=()=>{prefs={theme:'sage',font:'classic',density:'comfortable'};rerender()};
  }

  function maybeSettingsHint(){
    const active=[...document.querySelectorAll('.nav-btn.active,.nav.active,[data-nav].active,[data-v].active')].find(x=>/settings/i.test((x.dataset.nav||x.dataset.v||x.textContent||'')));
    if(!active)return;
    const host=document.querySelector('.workspace')||document.querySelector('.content');if(!host||host.querySelector('.pvts-settings-card'))return;
    const card=document.createElement('div');card.className='pvts-settings-card';
    card.style.cssText='position:absolute;right:18px;bottom:16px;z-index:40;background:var(--pvx-panel);color:var(--pvx-text);border:1px solid var(--pvx-border);border-radius:11px;padding:8px 10px;box-shadow:0 8px 24px #0001;font-size:9px;display:flex;align-items:center;gap:8px';
    card.innerHTML='<b>Theme Studio</b><span style="color:var(--pvx-muted)">Theme · text · density</span><button type="button" style="height:28px;border:0;border-radius:8px;background:var(--pvx-brand);color:#fff;padding:0 9px;cursor:pointer;font-weight:700">Customize</button>';
    card.querySelector('button').onclick=openStudio;host.style.position='relative';host.appendChild(card);
  }

  apply();
  const obs=new MutationObserver(()=>{ensureButton();maybeSettingsHint();if(!applying)apply()});
  obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  setTimeout(()=>{ensureButton();maybeSettingsHint();apply()},120);
})();