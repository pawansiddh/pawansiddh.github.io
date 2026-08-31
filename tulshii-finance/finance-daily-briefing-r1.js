(()=>{
  if(window.__PAVENRO_FINANCE_DAILY_BRIEFING_R1__) return;
  window.__PAVENRO_FINANCE_DAILY_BRIEFING_R1__=1;

  const KEY='pavenro.finance.dailyBriefing.r1';
  const q=(s,r=document)=>r.querySelector(s), A=(s,r=document)=>[...r.querySelectorAll(s)];
  const N=v=>String(v??'').replace(/\s+/g,' ').trim().toLowerCase();
  const X=v=>Number(String(v??0).replace(/[^0-9.-]/g,''))||0;
  const E=v=>String(v??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[m]));
  const todayKey=()=>new Date().toISOString().slice(0,10);
  const defaults={enabled:true,autoSpeak:true,voiceSlot:0,rate:1,lastShown:'',showUpcoming:true};
  let prefs=load(), voices=[], slots=[];

  function load(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(KEY)||'{}')||{})}catch(_){return {...defaults}}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch(_){}}
  function state(){
    if(window.__PV_FIN_STATE__&&typeof window.__PV_FIN_STATE__==='object')return window.__PV_FIN_STATE__;
    if(window.state&&typeof window.state==='object')return window.state;
    if(window.S&&typeof window.S==='object')return window.S;
    return null;
  }
  function arr(keys){const s=state();if(!s)return[];for(const k of keys)if(Array.isArray(s[k]))return s[k];return[]}
  function field(x,keys,idx){if(Array.isArray(x))return x[idx];for(const k of keys)if(x&&x[k]!=null)return x[k];return undefined}
  function dateOf(x,idx){
    let v=field(x,['date','dueDate','transactionDate','nextDate','targetDate','createdAt'],idx);
    if(!v&&Array.isArray(x))v=x.find(y=>typeof y==='string'&&/^\d{4}-\d{2}-\d{2}/.test(y));
    if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d;
  }
  function currency(){
    const s=A('select').find(x=>A('option',x).some(o=>['INR','USD','EUR','GBP','AED','CAD','AUD','JPY','SGD','CHF'].includes(String(o.value||o.textContent).trim().toUpperCase())));
    const c=String(s?.value||'INR').toUpperCase();return /^[A-Z]{3}$/.test(c)?c:'INR';
  }
  function money(v){try{return new Intl.NumberFormat(undefined,{style:'currency',currency:currency(),maximumFractionDigits:0}).format(X(v))}catch(_){return X(v).toLocaleString()}}
  function sameMonth(d,n=new Date()){return d&&d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()}
  function dayDiff(d){if(!d)return 9999;const a=new Date();a.setHours(0,0,0,0);const b=new Date(d);b.setHours(0,0,0,0);return Math.round((b-a)/86400000)}

  function transactionsSummary(){
    const tx=arr(['transactions','t','activity']);let income=0,spending=0,today=0;
    for(const x of tx){
      const d=dateOf(x,0),amt=X(field(x,['amount','value'],5));
      if(d&&d.toDateString()===new Date().toDateString())today++;
      if(!sameMonth(d))continue;
      const typ=N(field(x,['type','kind'],1));
      if(typ==='income'||amt>0)income+=Math.abs(amt);else spending+=Math.abs(amt);
    }
    return {income,spending,net:income-spending,today};
  }
  function billsSummary(){
    const bills=arr(['bills','b']);let due7=0,dueAmt=0,overdue=0,overdueAmt=0;const upcoming=[];
    for(const x of bills){
      const name=String(field(x,['name','title','merchant'],1)||'Bill'),amt=Math.abs(X(field(x,['amount','value'],2))),d=dateOf(x,3),st=N(field(x,['status','state'],6));
      if(!d||/paid|complete|cancel/.test(st))continue;const dd=dayDiff(d);
      if(dd<0){overdue++;overdueAmt+=amt}else if(dd<=7){due7++;dueAmt+=amt}
      if(dd>=-30&&dd<=14)upcoming.push({name,amt,date:d,dd,status:st});
    }
    upcoming.sort((a,b)=>a.date-b.date);return{due7,dueAmt,overdue,overdueAmt,upcoming};
  }
  function goalsSummary(){
    const goals=arr(['goals','g']);let active=0,near=0;
    for(const x of goals){const st=N(field(x,['status','state'],6));if(/complete|closed|cancel/.test(st))continue;active++;const saved=X(field(x,['saved','current','amountSaved'],3)),target=X(field(x,['target','targetAmount'],2));if(target>0&&saved/target>=.8)near++}
    return {active,near};
  }
  function debtSummary(){
    const ds=arr(['debts','debtAccounts','d']);let total=0,highApr=0,count=0;
    for(const x of ds){const rem=Math.abs(X(field(x,['remaining','balance','currentBalance'],3)));if(!rem)continue;count++;total+=rem;highApr=Math.max(highApr,X(field(x,['apr','interestRate'],4)))}
    return {count,total,highApr};
  }
  function calendarSummary(){
    let ev=arr(['calendar','events','calendarEvents']);
    try{const p=JSON.parse(localStorage.getItem('pavenro.finance.phase1.planning.r1')||'{}');if(Array.isArray(p.calendar))ev=ev.concat(p.calendar)}catch(_){}
    const today=[],next=[];
    for(const x of ev){const d=dateOf(x,2)||dateOf(x,1),title=String(field(x,['title','name','label'],1)||'Finance event');if(!d)continue;const dd=dayDiff(d);if(dd===0)today.push({title,date:d});else if(dd>0&&dd<=7)next.push({title,date:d,dd})}
    return {today,next:next.sort((a,b)=>a.date-b.date)};
  }
  function build(){
    const tx=transactionsSummary(), bills=billsSummary(), goals=goalsSummary(), debt=debtSummary(), cal=calendarSummary();
    const now=new Date(),hour=now.getHours(),greeting=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
    const alerts=[];
    if(bills.overdue)alerts.push(`${bills.overdue} overdue bill${bills.overdue===1?'':'s'} totaling ${money(bills.overdueAmt)}`);
    if(bills.due7)alerts.push(`${bills.due7} bill${bills.due7===1?'':'s'} due in the next 7 days totaling ${money(bills.dueAmt)}`);
    if(cal.today.length)alerts.push(`${cal.today.length} finance event${cal.today.length===1?'':'s'} scheduled today`);
    if(debt.highApr>=20)alerts.push(`high-interest debt detected at ${debt.highApr.toFixed(1)}% APR`);
    if(goals.near)alerts.push(`${goals.near} savings goal${goals.near===1?' is':'s are'} at least 80% complete`);
    if(!alerts.length)alerts.push('no urgent finance alerts detected for today');
    const speech=`${greeting}. Here is your Pavenro Finance daily briefing. This month, income is ${money(tx.income)}, spending is ${money(tx.spending)}, and net cash flow is ${money(tx.net)}. ${alerts.join('. ')}.`;
    return {tx,bills,goals,debt,cal,greeting,alerts,speech,date:now};
  }

  const css=document.createElement('style');css.id='pv-daily-briefing-r1-style';css.textContent=`
    .pvdb-shade{position:fixed;inset:0;z-index:2147483200;display:grid;place-items:center;padding:18px;background:#07130d80;backdrop-filter:blur(4px)}
    .pvdb-box{width:min(760px,96vw);max-height:92vh;overflow:auto;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:18px;background:var(--pvx-panel,var(--panel,#fff));color:var(--pvx-text,var(--text,#17301f));box-shadow:0 28px 80px #0005}
    .pvdb-head{display:flex;align-items:flex-start;gap:12px;padding:18px 20px 14px;border-bottom:1px solid var(--pvx-border,var(--border,#d8e3da))}.pvdb-mark{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--pvx-panel2,var(--panel2,#edf3ee));color:var(--pvx-brand,var(--brand,#21653f));font-size:18px}.pvdb-title h2{margin:0;font:800 22px/1.05 var(--pvx-heading-font,Georgia,serif)}.pvdb-title p{margin:4px 0 0;font:500 10px/1.3 var(--pvx-body-font,Inter,system-ui);color:var(--pvx-muted,var(--muted,#68756c))}.pvdb-x{margin-left:auto;width:32px;height:32px;border:1px solid var(--pvx-border,var(--border));border-radius:9px;background:var(--pvx-panel2,var(--panel2));color:inherit;cursor:pointer}
    .pvdb-body{padding:14px 20px 18px}.pvdb-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.pvdb-kpi{border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:11px;background:var(--pvx-panel2,var(--panel2,#f0f4f1));padding:9px}.pvdb-kpi span{display:block;font:700 8px/1.2 var(--pvx-body-font,Inter,system-ui);text-transform:uppercase;letter-spacing:.04em;color:var(--pvx-muted,var(--muted,#68756c))}.pvdb-kpi b{display:block;margin-top:5px;font:800 18px/1 var(--pvx-heading-font,Georgia,serif)}.pvdb-kpi small{display:block;margin-top:4px;font:500 8px var(--pvx-body-font,Inter,system-ui);color:var(--pvx-muted,var(--muted,#68756c))}
    .pvdb-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:10px;margin-top:10px}.pvdb-panel{border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:12px;padding:11px;background:var(--pvx-panel,var(--panel,#fff))}.pvdb-panel h3{margin:0 0 8px;font:800 14px var(--pvx-heading-font,Georgia,serif)}.pvdb-list{display:grid;gap:7px}.pvdb-row{display:flex;gap:9px;align-items:flex-start;padding:7px 8px;border-radius:9px;background:var(--pvx-panel2,var(--panel2,#f0f4f1));font:600 10px/1.3 var(--pvx-body-font,Inter,system-ui)}.pvdb-dot{width:7px;height:7px;border-radius:50%;margin-top:3px;background:var(--pvx-brand,var(--brand,#21653f));flex:0 0 7px}.pvdb-row small{display:block;margin-top:2px;color:var(--pvx-muted,var(--muted,#68756c));font-size:8px}
    .pvdb-voice{display:grid;gap:7px}.pvdb-voice label{font:700 8px var(--pvx-body-font,Inter,system-ui);color:var(--pvx-muted,var(--muted,#68756c))}.pvdb-voice select,.pvdb-voice input{width:100%;box-sizing:border-box;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:9px;background:var(--pvx-input,var(--panel2,#f0f4f1));color:inherit;padding:8px 9px;font:600 9px var(--pvx-body-font,Inter,system-ui)}
    .pvdb-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:12px}.pvdb-btn{height:34px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:9px;background:var(--pvx-panel2,var(--panel2,#f0f4f1));color:inherit;padding:0 11px;font:700 9px var(--pvx-body-font,Inter,system-ui);cursor:pointer}.pvdb-btn.primary{background:var(--pvx-brand,var(--brand,#21653f));border-color:transparent;color:#fff}.pvdb-note{margin-left:auto;font:500 8px var(--pvx-body-font,Inter,system-ui);color:var(--pvx-muted,var(--muted,#68756c))}
    .pvdb-settings{margin-top:10px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:13px;background:var(--pvx-panel,var(--panel,#fff));color:var(--pvx-text,var(--text,#17301f));padding:12px}.pvdb-settings h3{margin:0;font:800 15px var(--pvx-heading-font,Georgia,serif)}.pvdb-settings>p{margin:4px 0 10px;font:500 9px var(--pvx-body-font,Inter,system-ui);color:var(--pvx-muted,var(--muted,#68756c))}.pvdb-setgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pvdb-set{border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:10px;background:var(--pvx-panel2,var(--panel2,#f0f4f1));padding:9px}.pvdb-set b{display:block;font:700 10px var(--pvx-body-font,Inter,system-ui)}.pvdb-set small{display:block;margin-top:2px;font:500 8px var(--pvx-body-font,Inter,system-ui);color:var(--pvx-muted,var(--muted,#68756c))}.pvdb-set select{width:100%;margin-top:7px;border:1px solid var(--pvx-border,var(--border));border-radius:8px;background:var(--pvx-input,var(--panel,#fff));color:inherit;padding:7px;font-size:9px}.pvdb-switch{display:flex;align-items:center;justify-content:space-between;gap:8px}.pvdb-switch input{width:16px;height:16px}.pvdb-setactions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
    @media(max-width:760px){.pvdb-kpis{grid-template-columns:1fr 1fr}.pvdb-grid,.pvdb-setgrid{grid-template-columns:1fr}.pvdb-note{width:100%;margin-left:0}}
  `;document.head.appendChild(css);

  function refreshVoices(){
    if(!('speechSynthesis'in window))return;
    voices=speechSynthesis.getVoices()||[];
    const lang=(document.documentElement.lang||navigator.language||'en').toLowerCase();
    const pref=voices.filter(v=>v.lang?.toLowerCase().startsWith(lang.split('-')[0]));
    const english=voices.filter(v=>/^en/i.test(v.lang||''));
    const pool=[...pref,...english,...voices].filter((v,i,a)=>a.findIndex(x=>x.voiceURI===v.voiceURI)===i);
    slots=[];for(let i=0;i<5;i++)if(pool.length)slots.push(pool[i%pool.length]);
    updateVoiceSelects();
  }
  function voiceLabel(i){const v=slots[i];return `Voice ${i+1}${v?` · ${v.name}${v.lang?` (${v.lang})`:''}`:''}`}
  function voiceOptions(){return Array.from({length:5},(_,i)=>`<option value="${i}" ${Number(prefs.voiceSlot)===i?'selected':''}>${E(voiceLabel(i))}</option>`).join('')}
  function updateVoiceSelects(){A('select[data-pvdb-voice]').forEach(s=>{const old=String(prefs.voiceSlot);s.innerHTML=voiceOptions();s.value=old})}
  function speak(text){
    if(!('speechSynthesis'in window))return false;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);const v=slots[Number(prefs.voiceSlot)||0];if(v)u.voice=v;u.rate=Math.max(.7,Math.min(1.35,Number(prefs.rate)||1));u.pitch=1;u.volume=1;speechSynthesis.speak(u);return true;
  }
  function stop(){try{speechSynthesis.cancel()}catch(_){}}
  function close(mark=true){q('.pvdb-shade')?.remove();stop();if(mark){prefs.lastShown=todayKey();save()}}

  function show(manual=false){
    q('.pvdb-shade')?.remove();const b=build(),r=document.createElement('div');r.className='pvdb-shade';
    const upcoming=[...b.bills.upcoming.slice(0,3).map(x=>({title:x.name,sub:x.dd<0?`${Math.abs(x.dd)} day${Math.abs(x.dd)===1?'':'s'} overdue · ${money(x.amt)}`:x.dd===0?`Due today · ${money(x.amt)}`:`Due in ${x.dd} day${x.dd===1?'':'s'} · ${money(x.amt)}`})),...b.cal.today.slice(0,2).map(x=>({title:x.title,sub:'Calendar · Today'})),...b.cal.next.slice(0,2).map(x=>({title:x.title,sub:`Calendar · In ${x.dd} day${x.dd===1?'':'s'}`}))].slice(0,5);
    r.innerHTML=`<div class="pvdb-box"><div class="pvdb-head"><div class="pvdb-mark">☀</div><div class="pvdb-title"><h2>${E(b.greeting)} · Daily Briefing</h2><p>${E(b.date.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'}))} · PAVENRO Finance</p></div><button class="pvdb-x" data-pvdb-close>×</button></div><div class="pvdb-body"><div class="pvdb-kpis"><div class="pvdb-kpi"><span>Income this month</span><b>${E(money(b.tx.income))}</b><small>${b.tx.today} transaction${b.tx.today===1?'':'s'} today</small></div><div class="pvdb-kpi"><span>Spending this month</span><b>${E(money(b.tx.spending))}</b><small>Tracked expenses</small></div><div class="pvdb-kpi"><span>Net cash flow</span><b>${E(money(b.tx.net))}</b><small>${b.tx.net>=0?'Positive':'Negative'} this month</small></div><div class="pvdb-kpi"><span>Bills next 7 days</span><b>${b.bills.due7}</b><small>${E(money(b.bills.dueAmt))} due</small></div></div><div class="pvdb-grid"><div class="pvdb-panel"><h3>What needs attention</h3><div class="pvdb-list">${b.alerts.map(x=>`<div class="pvdb-row"><span class="pvdb-dot"></span><div>${E(x)}</div></div>`).join('')}</div>${upcoming.length?`<h3 style="margin-top:11px">Upcoming</h3><div class="pvdb-list">${upcoming.map(x=>`<div class="pvdb-row"><span class="pvdb-dot"></span><div>${E(x.title)}<small>${E(x.sub)}</small></div></div>`).join('')}</div>`:''}</div><div class="pvdb-panel"><h3>Voice briefing</h3><div class="pvdb-voice"><label>Choose one of 5 voices</label><select data-pvdb-voice>${voiceOptions()}</select><label>Speaking speed</label><select data-pvdb-rate><option value="0.85" ${Number(prefs.rate)===.85?'selected':''}>Calm · 0.85×</option><option value="1" ${Number(prefs.rate)===1?'selected':''}>Normal · 1.0×</option><option value="1.1" ${Number(prefs.rate)===1.1?'selected':''}>Quick · 1.1×</option><option value="1.2" ${Number(prefs.rate)===1.2?'selected':''}>Fast · 1.2×</option></select><button class="pvdb-btn primary" type="button" data-pvdb-speak>▶ Read briefing</button><button class="pvdb-btn" type="button" data-pvdb-stop>■ Stop voice</button></div></div></div><div class="pvdb-actions"><button class="pvdb-btn primary" data-pvdb-dashboard>Open Dashboard</button><button class="pvdb-btn" data-pvdb-close>Dismiss</button><span class="pvdb-note">Appears once on the first PAVENRO Finance open each day.</span></div></div></div>`;
    document.body.appendChild(r);r.onclick=e=>{if(e.target===r)close(true)};A('[data-pvdb-close]',r).forEach(x=>x.onclick=()=>close(true));q('[data-pvdb-speak]',r).onclick=()=>speak(b.speech);q('[data-pvdb-stop]',r).onclick=stop;q('[data-pvdb-dashboard]',r).onclick=()=>{const nav=A('#pvSide .nav-btn,.sidebar .nav-btn,[data-nav]').find(x=>/dashboard/i.test(x.textContent||''));if(nav)nav.click();close(true)};q('[data-pvdb-voice]',r).onchange=e=>{prefs.voiceSlot=Number(e.target.value)||0;save()};q('[data-pvdb-rate]',r).onchange=e=>{prefs.rate=Number(e.target.value)||1;save()};
    if(!manual&&prefs.autoSpeak)setTimeout(()=>{if(document.contains(r))speak(b.speech)},650);
  }

  function isSettings(){const a=q('#pvSide .nav-btn.active,.sidebar .nav-btn.active,[data-nav].active'),t=q('#pvTop .pv-title,.topbar .pv-title,.workspace h1,.page-head h1');return /settings/i.test(`${a?.textContent||''} ${t?.textContent||''}`)}
  function mountSettings(){
    if(!isSettings()){q('.pvdb-settings')?.remove();return}if(q('.pvdb-settings'))return;
    const root=q('.settings-pane,.settings-content,.settings-grid,.page,.workspace');if(!root)return;
    const x=document.createElement('section');x.className='pvdb-settings';x.innerHTML=`<h3>Daily Briefing & Voice</h3><p>Get a finance summary on the first app open each day. Voice playback uses voices installed in this browser or operating system.</p><div class="pvdb-setgrid"><div class="pvdb-set"><div class="pvdb-switch"><div><b>Daily briefing popup</b><small>Show once per day when Finance opens</small></div><input type="checkbox" data-pvdb-enabled ${prefs.enabled?'checked':''}></div></div><div class="pvdb-set"><div class="pvdb-switch"><div><b>Read automatically</b><small>Speak the briefing when the popup opens</small></div><input type="checkbox" data-pvdb-auto ${prefs.autoSpeak?'checked':''}></div></div><div class="pvdb-set"><b>Voice</b><small>Five local voice choices are prepared from your device</small><select data-pvdb-voice>${voiceOptions()}</select></div><div class="pvdb-set"><b>Speaking speed</b><small>Controls Daily Briefing voice speed</small><select data-pvdb-rate><option value="0.85" ${Number(prefs.rate)===.85?'selected':''}>Calm · 0.85×</option><option value="1" ${Number(prefs.rate)===1?'selected':''}>Normal · 1.0×</option><option value="1.1" ${Number(prefs.rate)===1.1?'selected':''}>Quick · 1.1×</option><option value="1.2" ${Number(prefs.rate)===1.2?'selected':''}>Fast · 1.2×</option></select></div></div><div class="pvdb-setactions"><button class="pvdb-btn primary" data-pvdb-now>Show Briefing Now</button><button class="pvdb-btn" data-pvdb-preview>Preview Voice</button><button class="pvdb-btn" data-pvdb-stop>Stop Voice</button><button class="pvdb-btn" data-pvdb-resetday>Show Again Today</button></div><p style="margin:8px 0 0">PAVENRO can only show/speak a briefing while the website is open; browsers do not allow this page to speak while it is closed.</p>`;
    root.appendChild(x);q('[data-pvdb-enabled]',x).onchange=e=>{prefs.enabled=e.target.checked;save()};q('[data-pvdb-auto]',x).onchange=e=>{prefs.autoSpeak=e.target.checked;save()};q('[data-pvdb-voice]',x).onchange=e=>{prefs.voiceSlot=Number(e.target.value)||0;save()};q('[data-pvdb-rate]',x).onchange=e=>{prefs.rate=Number(e.target.value)||1;save()};q('[data-pvdb-now]',x).onclick=()=>show(true);q('[data-pvdb-preview]',x).onclick=()=>speak(`This is ${voiceLabel(Number(prefs.voiceSlot)||0)} for your Pavenro Finance daily briefing.`);q('[data-pvdb-stop]',x).onclick=stop;q('[data-pvdb-resetday]',x).onclick=()=>{prefs.lastShown='';save();show(true)};
  }

  function dailyCheck(){if(!prefs.enabled||prefs.lastShown===todayKey()||q('.pvdb-shade'))return;show(false)}
  function boot(){refreshVoices();if('speechSynthesis'in window)speechSynthesis.onvoiceschanged=refreshVoices;setTimeout(mountSettings,280);setTimeout(dailyCheck,850);document.addEventListener('click',e=>{if(e.target.closest('#pvSide .nav-btn,.sidebar .nav-btn,[data-nav]'))setTimeout(mountSettings,220)},true);setInterval(mountSettings,1400)}
  window.PavenroDailyBriefing={show:()=>show(true),speak:()=>speak(build().speech),stop,settings:()=>({...prefs}),voices:()=>slots.map((v,i)=>({slot:i+1,name:v?.name||'System default',lang:v?.lang||''}))};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();