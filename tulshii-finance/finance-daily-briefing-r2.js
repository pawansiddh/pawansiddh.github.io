(()=>{
  if(window.__PAVENRO_FINANCE_DAILY_BRIEFING_R2__) return;
  window.__PAVENRO_FINANCE_DAILY_BRIEFING_R2__=1;

  const KEY='pavenro.finance.dailyBriefing.r2';
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const norm=v=>String(v??'').replace(/\s+/g,' ').trim().toLowerCase();
  const num=v=>Number(String(v??0).replace(/[^0-9.-]/g,''))||0;
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[m]));
  const dayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const defaults={enabled:true,autoSpeak:false,voiceSlot:0,rate:1,lastShown:''};
  let prefs=loadPrefs();
  let voiceSlots=[];

  function loadPrefs(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(KEY)||'{}')||{})}catch(_){return {...defaults}}}
  function savePrefs(){try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch(_){}}

  const css=document.createElement('style');
  css.id='pv-daily-briefing-r2-style';
  css.textContent=`
    #pvDailyBriefingBtn{width:36px;height:36px;min-width:36px;padding:0;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:10px;background:var(--pvx-panel2,var(--panel2,#edf3ee));color:var(--pvx-text,var(--text,#17301f));display:grid;place-items:center;cursor:pointer;font-size:15px;line-height:1}
    #pvDailyBriefingBtn:hover{border-color:var(--pvx-brand,var(--brand,#21653f));transform:translateY(-1px)}
    .pvdb2-shade{position:fixed;inset:0;z-index:2147483200;display:grid;place-items:center;padding:18px;background:#07130d80;backdrop-filter:blur(4px)}
    .pvdb2-box{width:min(780px,96vw);max-height:92vh;overflow:auto;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:18px;background:var(--pvx-panel,var(--panel,#fff));color:var(--pvx-text,var(--text,#17301f));box-shadow:0 28px 80px #0005}
    .pvdb2-head{display:flex;align-items:flex-start;gap:12px;padding:17px 19px 13px;border-bottom:1px solid var(--pvx-border,var(--border,#d8e3da))}.pvdb2-icon{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--pvx-panel2,var(--panel2,#edf3ee));color:var(--pvx-brand,var(--brand,#21653f));font-size:19px}.pvdb2-title h2{margin:0;font:800 22px/1.05 var(--pvx-heading-font,Georgia,serif)}.pvdb2-title p{margin:4px 0 0;color:var(--pvx-muted,var(--muted,#68756c));font:500 10px/1.35 var(--pvx-body-font,Inter,system-ui)}.pvdb2-x{margin-left:auto;width:32px;height:32px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:9px;background:var(--pvx-panel2,var(--panel2,#edf3ee));color:inherit;cursor:pointer}
    .pvdb2-body{padding:14px 19px 18px}.pvdb2-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.pvdb2-kpi{border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:11px;background:var(--pvx-panel2,var(--panel2,#f0f4f1));padding:9px}.pvdb2-kpi span{display:block;color:var(--pvx-muted,var(--muted,#68756c));font:700 8px/1.2 var(--pvx-body-font,Inter,system-ui);text-transform:uppercase;letter-spacing:.04em}.pvdb2-kpi b{display:block;margin-top:5px;font:800 17px/1.05 var(--pvx-heading-font,Georgia,serif)}.pvdb2-kpi small{display:block;margin-top:4px;color:var(--pvx-muted,var(--muted,#68756c));font:500 8px var(--pvx-body-font,Inter,system-ui)}
    .pvdb2-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:10px;margin-top:10px}.pvdb2-panel{border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:12px;padding:11px;background:var(--pvx-panel,var(--panel,#fff))}.pvdb2-panel h3{margin:0 0 8px;font:800 14px var(--pvx-heading-font,Georgia,serif)}.pvdb2-list{display:grid;gap:7px}.pvdb2-row{display:flex;gap:9px;align-items:flex-start;padding:7px 8px;border-radius:9px;background:var(--pvx-panel2,var(--panel2,#f0f4f1));font:600 10px/1.35 var(--pvx-body-font,Inter,system-ui)}.pvdb2-dot{width:7px;height:7px;border-radius:50%;margin-top:3px;background:var(--pvx-brand,var(--brand,#21653f));flex:0 0 7px}.pvdb2-row small{display:block;margin-top:2px;color:var(--pvx-muted,var(--muted,#68756c));font-size:8px}
    .pvdb2-field{display:grid;gap:5px;margin-bottom:8px}.pvdb2-field label{color:var(--pvx-muted,var(--muted,#68756c));font:700 8px var(--pvx-body-font,Inter,system-ui)}.pvdb2-field select{width:100%;box-sizing:border-box;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:9px;background:var(--pvx-input,var(--panel2,#f0f4f1));color:inherit;padding:8px 9px;font:600 9px var(--pvx-body-font,Inter,system-ui)}
    .pvdb2-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:11px}.pvdb2-btn{height:34px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:9px;background:var(--pvx-panel2,var(--panel2,#f0f4f1));color:inherit;padding:0 11px;font:700 9px var(--pvx-body-font,Inter,system-ui);cursor:pointer}.pvdb2-btn.primary{background:var(--pvx-brand,var(--brand,#21653f));border-color:transparent;color:#fff}.pvdb2-note{margin-left:auto;color:var(--pvx-muted,var(--muted,#68756c));font:500 8px var(--pvx-body-font,Inter,system-ui)}
    .pvdb2-settings{margin-top:10px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:13px;background:var(--pvx-panel,var(--panel,#fff));color:var(--pvx-text,var(--text,#17301f));padding:12px}.pvdb2-settings h3{margin:0;font:800 15px var(--pvx-heading-font,Georgia,serif)}.pvdb2-settings>p{margin:4px 0 10px;color:var(--pvx-muted,var(--muted,#68756c));font:500 9px var(--pvx-body-font,Inter,system-ui)}.pvdb2-setgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pvdb2-set{border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:10px;background:var(--pvx-panel2,var(--panel2,#f0f4f1));padding:9px}.pvdb2-set b{display:block;font:700 10px var(--pvx-body-font,Inter,system-ui)}.pvdb2-set small{display:block;margin-top:2px;color:var(--pvx-muted,var(--muted,#68756c));font:500 8px var(--pvx-body-font,Inter,system-ui)}.pvdb2-set select{width:100%;margin-top:7px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:8px;background:var(--pvx-input,var(--panel,#fff));color:inherit;padding:7px;font-size:9px}.pvdb2-switch{display:flex;align-items:center;justify-content:space-between;gap:8px}.pvdb2-switch input{width:16px;height:16px}.pvdb2-setactions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
    @media(max-width:760px){.pvdb2-kpis{grid-template-columns:1fr 1fr}.pvdb2-grid,.pvdb2-setgrid{grid-template-columns:1fr}.pvdb2-note{width:100%;margin-left:0}}
  `;
  document.head.appendChild(css);

  function states(){
    const out=[];
    for(const s of [window.__PV_FIN_STATE__,window.state,window.S])if(s&&typeof s==='object'&&!out.includes(s))out.push(s);
    return out;
  }
  function getArray(keys){for(const s of states())for(const k of keys)if(Array.isArray(s[k]))return s[k];return []}
  function field(x,keys,idx){if(Array.isArray(x))return x[idx];for(const k of keys)if(x&&x[k]!=null)return x[k];return undefined}
  function dateOf(x,idx){let v=field(x,['date','dueDate','transactionDate','nextDate','targetDate','createdAt'],idx);if(!v&&Array.isArray(x))v=x.find(y=>typeof y==='string'&&/^\d{4}-\d{2}-\d{2}/.test(y));if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d}
  function sameMonth(d){const n=new Date();return !!d&&d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()}
  function diffDays(d){if(!d)return 9999;const a=new Date();a.setHours(0,0,0,0);const b=new Date(d);b.setHours(0,0,0,0);return Math.round((b-a)/86400000)}
  function currency(){const s=qa('select').find(x=>qa('option',x).some(o=>['INR','USD','EUR','GBP','AED','CAD','AUD','JPY','SGD','CHF'].includes(String(o.value||o.textContent).trim().toUpperCase())));const c=String(s?.value||'INR').trim().toUpperCase();return /^[A-Z]{3}$/.test(c)?c:'INR'}
  function money(v){try{return new Intl.NumberFormat(undefined,{style:'currency',currency:currency(),maximumFractionDigits:0}).format(num(v))}catch(_){return num(v).toLocaleString()}}

  function summary(){
    const tx=getArray(['transactions','t','activity']);let income=0,spending=0,todayTx=0;
    for(const x of tx){const d=dateOf(x,0),amt=num(field(x,['amount','value'],5)),type=norm(field(x,['type','kind'],1));if(d&&d.toDateString()===new Date().toDateString())todayTx++;if(!sameMonth(d))continue;if(type==='income'||amt>0)income+=Math.abs(amt);else spending+=Math.abs(amt)}
    const bills=getArray(['bills','b']);let due7=0,dueAmt=0,overdue=0,overdueAmt=0;const upcoming=[];
    for(const x of bills){const name=String(field(x,['name','title','merchant'],1)||'Bill'),amt=Math.abs(num(field(x,['amount','value'],2))),d=dateOf(x,3),st=norm(field(x,['status','state'],6));if(!d||/paid|complete|cancel/.test(st))continue;const dd=diffDays(d);if(dd<0){overdue++;overdueAmt+=amt}else if(dd<=7){due7++;dueAmt+=amt}if(dd>=-14&&dd<=14)upcoming.push({name,amt,dd,date:d})}
    const debts=getArray(['debts','debtAccounts','d']);let highApr=0;for(const x of debts)highApr=Math.max(highApr,num(field(x,['apr','interestRate'],4)));
    const goals=getArray(['goals','g']);let nearGoal=0;for(const x of goals){const saved=num(field(x,['saved','current','amountSaved'],3)),target=num(field(x,['target','targetAmount'],2));if(target>0&&saved/target>=.8&&saved<target)nearGoal++}
    const alerts=[];if(overdue)alerts.push(`${overdue} overdue bill${overdue===1?'':'s'} totaling ${money(overdueAmt)}`);if(due7)alerts.push(`${due7} bill${due7===1?'':'s'} due in the next 7 days totaling ${money(dueAmt)}`);if(highApr>=20)alerts.push(`high-interest debt detected at ${highApr.toFixed(1)}% APR`);if(nearGoal)alerts.push(`${nearGoal} savings goal${nearGoal===1?' is':'s are'} more than 80% complete`);if(!alerts.length)alerts.push('No urgent finance alerts detected today');
    upcoming.sort((a,b)=>a.date-b.date);
    const now=new Date(),h=now.getHours(),greeting=h<12?'Good morning':h<17?'Good afternoon':'Good evening',net=income-spending;
    const speech=`${greeting}. Here is your Pavenro Finance daily briefing. This month, income is ${money(income)}, spending is ${money(spending)}, and net cash flow is ${money(net)}. ${alerts.join('. ')}.`;
    return {income,spending,net,todayTx,due7,dueAmt,overdue,overdueAmt,upcoming:upcoming.slice(0,5),alerts,greeting,now,speech};
  }

  function refreshVoices(){
    if(!('speechSynthesis' in window)){voiceSlots=[];updateVoiceUI();return}
    const all=speechSynthesis.getVoices()||[];
    const lang=(document.documentElement.lang||navigator.language||'en').toLowerCase().split('-')[0];
    const preferred=all.filter(v=>String(v.lang||'').toLowerCase().startsWith(lang));
    const english=all.filter(v=>/^en/i.test(v.lang||''));
    const pool=[...preferred,...english,...all].filter((v,i,a)=>a.findIndex(x=>x.voiceURI===v.voiceURI)===i);
    voiceSlots=pool.slice(0,5);
    updateVoiceUI();
  }
  function voiceLabel(i){const v=voiceSlots[i];return v?`Voice ${i+1} · ${v.name}${v.lang?` (${v.lang})`:''}`:`Voice ${i+1} · System default`}
  function voiceOptions(){return Array.from({length:5},(_,i)=>`<option value="${i}" ${Number(prefs.voiceSlot)===i?'selected':''}>${esc(voiceLabel(i))}</option>`).join('')}
  function updateVoiceUI(){qa('select[data-pvdb2-voice]').forEach(s=>{const v=String(prefs.voiceSlot);s.innerHTML=voiceOptions();s.value=v})}
  function speak(text){if(!('speechSynthesis' in window))return alert('Voice playback is not supported by this browser.');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);const v=voiceSlots[Number(prefs.voiceSlot)||0];if(v)u.voice=v;u.rate=Math.max(.75,Math.min(1.3,Number(prefs.rate)||1));u.pitch=1;u.volume=1;speechSynthesis.speak(u)}
  function stopVoice(){try{speechSynthesis.cancel()}catch(_){}}

  function closeBriefing(mark=true){q('.pvdb2-shade')?.remove();stopVoice();if(mark){prefs.lastShown=dayKey();savePrefs()}}
  function showBriefing(manual=false){
    q('.pvdb2-shade')?.remove();const b=summary();const r=document.createElement('div');r.className='pvdb2-shade';
    r.innerHTML=`<div class="pvdb2-box"><div class="pvdb2-head"><div class="pvdb2-icon">☀</div><div class="pvdb2-title"><h2>${esc(b.greeting)} · Daily Briefing</h2><p>${esc(b.now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'}))} · PAVENRO Finance</p></div><button class="pvdb2-x" type="button" data-close>×</button></div><div class="pvdb2-body"><div class="pvdb2-kpis"><div class="pvdb2-kpi"><span>Income this month</span><b>${esc(money(b.income))}</b><small>${b.todayTx} transaction${b.todayTx===1?'':'s'} today</small></div><div class="pvdb2-kpi"><span>Spending this month</span><b>${esc(money(b.spending))}</b><small>Tracked expenses</small></div><div class="pvdb2-kpi"><span>Net cash flow</span><b>${esc(money(b.net))}</b><small>${b.net>=0?'Positive':'Negative'} this month</small></div><div class="pvdb2-kpi"><span>Bills next 7 days</span><b>${b.due7}</b><small>${esc(money(b.dueAmt))} due</small></div></div><div class="pvdb2-grid"><div class="pvdb2-panel"><h3>What needs attention</h3><div class="pvdb2-list">${b.alerts.map(x=>`<div class="pvdb2-row"><span class="pvdb2-dot"></span><div>${esc(x)}</div></div>`).join('')}</div>${b.upcoming.length?`<h3 style="margin-top:11px">Upcoming bills</h3><div class="pvdb2-list">${b.upcoming.map(x=>`<div class="pvdb2-row"><span class="pvdb2-dot"></span><div>${esc(x.name)}<small>${x.dd<0?`${Math.abs(x.dd)} day${Math.abs(x.dd)===1?'':'s'} overdue`:x.dd===0?'Due today':`Due in ${x.dd} day${x.dd===1?'':'s'}`} · ${esc(money(x.amt))}</small></div></div>`).join('')}</div>`:''}</div><div class="pvdb2-panel"><h3>Voice briefing</h3><div class="pvdb2-field"><label>Choose voice</label><select data-pvdb2-voice>${voiceOptions()}</select></div><div class="pvdb2-field"><label>Speaking speed</label><select data-pvdb2-rate><option value="0.85" ${Number(prefs.rate)===.85?'selected':''}>Calm · 0.85×</option><option value="1" ${Number(prefs.rate)===1?'selected':''}>Normal · 1.0×</option><option value="1.1" ${Number(prefs.rate)===1.1?'selected':''}>Quick · 1.1×</option><option value="1.2" ${Number(prefs.rate)===1.2?'selected':''}>Fast · 1.2×</option></select></div><button class="pvdb2-btn primary" type="button" data-speak>▶ Read briefing</button> <button class="pvdb2-btn" type="button" data-stop>■ Stop</button></div></div><div class="pvdb2-actions"><button class="pvdb2-btn primary" type="button" data-dashboard>Open Dashboard</button><button class="pvdb2-btn" type="button" data-close>Dismiss</button><span class="pvdb2-note">Automatically appears once per day when enabled.</span></div></div></div>`;
    document.body.appendChild(r);
    r.addEventListener('click',e=>{if(e.target===r)closeBriefing(true)});
    qa('[data-close]',r).forEach(x=>x.onclick=()=>closeBriefing(true));
    q('[data-speak]',r).onclick=()=>speak(b.speech);q('[data-stop]',r).onclick=stopVoice;
    q('[data-dashboard]',r).onclick=()=>{const d=qa('#pvSide .nav-btn,.sidebar .nav-btn,[data-nav]').find(x=>/dashboard/i.test(x.textContent||''));if(d)d.click();closeBriefing(true)};
    q('[data-pvdb2-voice]',r).onchange=e=>{prefs.voiceSlot=Number(e.target.value)||0;savePrefs()};q('[data-pvdb2-rate]',r).onchange=e=>{prefs.rate=Number(e.target.value)||1;savePrefs()};
    if(!manual&&prefs.autoSpeak)setTimeout(()=>{if(document.contains(r))speak(b.speech)},700);
  }

  function mountTopbar(){
    const bar=q('#pvTop,.topbar');if(!bar||q('#pvDailyBriefingBtn'))return;
    const b=document.createElement('button');b.id='pvDailyBriefingBtn';b.type='button';b.title='Daily Briefing';b.setAttribute('aria-label','Daily Briefing');b.textContent='☀';b.onclick=e=>{e.preventDefault();e.stopPropagation();showBriefing(true)};
    const bell=q('.pv-notification-fix',bar)||qa('button',bar).find(x=>/notification|bell/i.test(`${x.title||''} ${x.getAttribute('aria-label')||''}`));
    if(bell)bar.insertBefore(b,bell);else bar.appendChild(b);
  }

  function settingsPage(){
    const active=q('#pvSide .nav-btn.active,.sidebar .nav-btn.active,[data-nav].active');
    const title=q('#pvTop .pv-title,.topbar .pv-title,.page-head h1,.workspace h1');
    if(!/settings/i.test(`${active?.textContent||''} ${title?.textContent||''}`))return null;
    return title?.closest('.page')||q('.page')||q('.settings-pane,.settings-content,.settings-grid')||q('.workspace');
  }
  function mountSettings(){
    const page=settingsPage();
    if(!page){q('.pvdb2-settings')?.remove();return}
    if(q('.pvdb2-settings',page))return;
    const x=document.createElement('section');x.className='pvdb2-settings';
    x.innerHTML=`<h3>Daily Briefing & Voice</h3><p>Choose how PAVENRO summarizes your finances when you open Finance each day.</p><div class="pvdb2-setgrid"><div class="pvdb2-set"><div class="pvdb2-switch"><div><b>Daily briefing popup</b><small>Show once on the first Finance open each day</small></div><input type="checkbox" data-enabled ${prefs.enabled?'checked':''}></div></div><div class="pvdb2-set"><div class="pvdb2-switch"><div><b>Read automatically</b><small>Speak after the briefing popup opens</small></div><input type="checkbox" data-auto ${prefs.autoSpeak?'checked':''}></div></div><div class="pvdb2-set"><b>Voice</b><small>Uses voices installed in this browser or operating system</small><select data-pvdb2-voice>${voiceOptions()}</select></div><div class="pvdb2-set"><b>Speaking speed</b><small>Controls the voice playback speed</small><select data-pvdb2-rate><option value="0.85" ${Number(prefs.rate)===.85?'selected':''}>Calm · 0.85×</option><option value="1" ${Number(prefs.rate)===1?'selected':''}>Normal · 1.0×</option><option value="1.1" ${Number(prefs.rate)===1.1?'selected':''}>Quick · 1.1×</option><option value="1.2" ${Number(prefs.rate)===1.2?'selected':''}>Fast · 1.2×</option></select></div></div><div class="pvdb2-setactions"><button class="pvdb2-btn primary" type="button" data-now>Show Briefing Now</button><button class="pvdb2-btn" type="button" data-preview>Preview Voice</button><button class="pvdb2-btn" type="button" data-stop>Stop Voice</button><button class="pvdb2-btn" type="button" data-again>Show Again Today</button></div>`;
    page.appendChild(x);
    q('[data-enabled]',x).onchange=e=>{prefs.enabled=e.target.checked;savePrefs()};q('[data-auto]',x).onchange=e=>{prefs.autoSpeak=e.target.checked;savePrefs()};q('[data-pvdb2-voice]',x).onchange=e=>{prefs.voiceSlot=Number(e.target.value)||0;savePrefs()};q('[data-pvdb2-rate]',x).onchange=e=>{prefs.rate=Number(e.target.value)||1;savePrefs()};q('[data-now]',x).onclick=()=>showBriefing(true);q('[data-preview]',x).onclick=()=>speak(`This is ${voiceLabel(Number(prefs.voiceSlot)||0)} for your Pavenro Finance daily briefing.`);q('[data-stop]',x).onclick=stopVoice;q('[data-again]',x).onclick=()=>{prefs.lastShown='';savePrefs();showBriefing(true)};
  }

  function dailyCheck(){if(!prefs.enabled||prefs.lastShown===dayKey()||q('.pvdb2-shade'))return;showBriefing(false)}
  function boot(){
    refreshVoices();if('speechSynthesis' in window)speechSynthesis.onvoiceschanged=refreshVoices;
    mountTopbar();mountSettings();
    setTimeout(dailyCheck,1200);
    document.addEventListener('click',e=>{if(e.target.closest('#pvSide .nav-btn,.sidebar .nav-btn,[data-nav]'))setTimeout(()=>{mountTopbar();mountSettings()},220)},true);
    setInterval(()=>{mountTopbar();mountSettings()},1200);
  }

  window.PavenroDailyBriefing={show:()=>showBriefing(true),speak:()=>speak(summary().speech),stop:stopVoice,settings:()=>({...prefs}),voices:()=>Array.from({length:5},(_,i)=>({slot:i+1,name:voiceSlots[i]?.name||'System default',lang:voiceSlots[i]?.lang||''}))};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();