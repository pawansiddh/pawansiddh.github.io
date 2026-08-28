(()=>{
  if(window.__PAVENRO_FINANCE_PHASE1_R2__) return;
  window.__PAVENRO_FINANCE_PHASE1_R2__=true;
  document.documentElement.dataset.pvPhase1='r2';

  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const norm=v=>String(v??'').replace(/\s+/g,' ').trim().toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>Number(String(v??0).replace(/[^0-9.-]/g,''))||0;
  const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;

  const META_KEY='pavenro.finance.phase1.r2';
  const meta=(()=>{try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')}catch(_){return{}}})();
  meta.txStatus ||= {};
  meta.billReminder ||= {};
  meta.budgetCarry ||= {};
  const saveMeta=()=>{try{localStorage.setItem(META_KEY,JSON.stringify(meta))}catch(_){}};

  function core(){
    try{if(typeof state!=='undefined'&&state)return state}catch(_){}
    try{if(typeof S!=='undefined'&&S)return S}catch(_){}
    return window.state||window.S||null;
  }
  function renderCore(){
    try{if(typeof render==='function'){render();return true}}catch(_){}
    try{if(typeof window.render==='function'){window.render();return true}}catch(_){}
    return false;
  }
  function persistCore(){
    try{if(typeof saveState==='function'){saveState();return}}catch(_){}
    try{if(typeof persistState==='function'){persistState();return}}catch(_){}
    try{if(typeof save==='function'){save();return}}catch(_){}
    try{if(typeof window.saveState==='function'){window.saveState();return}}catch(_){}
    const s=core();if(!s)return;
    try{
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i)||'';
        if(!/(pavenro|finance)/i.test(k))continue;
        let v;try{v=JSON.parse(localStorage.getItem(k))}catch(_){continue}
        if(!v||typeof v!=='object'||Array.isArray(v))continue;
        const candidates=['accounts','transactions','bills','budgets','budgetCategories'];
        const score=candidates.filter(x=>Array.isArray(v[x])&&Array.isArray(s[x])).length;
        if(score>=2){localStorage.setItem(k,JSON.stringify(s));return}
      }
    }catch(_){}
  }
  function rerender(){persistCore();renderCore();setTimeout(mount,80)}

  function collection(type){
    const s=core();if(!s)return[];
    const keys={accounts:['accounts','a'],transactions:['transactions','t','activity'],bills:['bills','b'],budgets:['budgets','budgetCategories','budget','bud']}[type]||[];
    for(const k of keys)if(Array.isArray(s[k]))return s[k];
    return[];
  }
  function read(x,keys,idx){
    if(!x)return undefined;
    if(Array.isArray(x))return x[idx];
    for(const k of keys)if(Object.prototype.hasOwnProperty.call(x,k))return x[k];
    return undefined;
  }
  function write(x,keys,idx,val){
    if(Array.isArray(x)){x[idx]=val;return}
    for(const k of keys)if(Object.prototype.hasOwnProperty.call(x,k)){x[k]=val;return}
    x[keys[0]]=val;
  }
  const idOf=(x,i=0)=>String(read(x,['id','accountId','transactionId','billId','budgetId'],0)??`row-${i}`);
  const accountName=x=>String(read(x,['name','accountName','title'],1)??'');
  const accountType=x=>String(read(x,['type','accountType','kind'],2)??'Bank');
  const accountBalance=x=>num(read(x,['balance','currentBalance','amount'],3));
  const txName=x=>String(read(x,['merchant','description','name','title'],2)??read(x,['description','merchant','name'],1)??'Transaction');
  const billName=x=>String(read(x,['name','billName','title','merchant'],1)??'Bill');
  const billStatus=x=>String(read(x,['status','state'],6)??'Upcoming');
  const budgetName=x=>String(read(x,['category','name','title'],0)??'Category');

  const style=document.createElement('style');
  style.id='pv-phase1-r2-style';
  style.textContent=`
    .pv-p1-action{height:36px!important;border:1px solid var(--pvx-border,var(--border,#d6dfd7))!important;border-radius:10px!important;background:var(--pvx-panel2,var(--panel2,#eef3ef))!important;color:var(--pvx-text,var(--text,#17301f))!important;padding:0 12px!important;font:700 11px/1 Inter,system-ui!important;cursor:pointer!important;white-space:nowrap!important;flex:0 0 auto!important}
    .pv-p1-action:hover{filter:brightness(.98)}
    .pv-p1-modal{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:#07130d8c;padding:18px}
    .pv-p1-dialog{width:min(580px,96vw);max-height:92vh;overflow:auto;border:1px solid var(--pvx-border,var(--border,#d6dfd7));border-radius:16px;background:var(--pvx-panel,var(--panel,#fff));color:var(--pvx-text,var(--text,#17301f));box-shadow:0 24px 70px #0005}
    .pv-p1-head{display:flex;align-items:center;justify-content:space-between;padding:15px 18px 12px;border-bottom:1px solid var(--pvx-border,var(--border,#e1e7e2))}.pv-p1-head h3{margin:0;font:700 19px/1.2 Georgia,serif}.pv-p1-x{border:0;background:transparent;color:inherit;font-size:22px;cursor:pointer;opacity:.65}
    .pv-p1-form{padding:15px 18px 18px;display:grid;grid-template-columns:1fr 1fr;gap:12px}.pv-p1-field{display:flex;flex-direction:column;gap:5px;min-width:0}.pv-p1-field.full{grid-column:1/-1}.pv-p1-field label{font:700 10px/1.2 Inter,system-ui;color:var(--pvx-muted,var(--muted,#6d786f));text-transform:uppercase;letter-spacing:.045em}
    .pv-p1-field input,.pv-p1-field select,.pv-p1-field textarea{box-sizing:border-box;width:100%;border:1px solid var(--pvx-border,var(--border,#d7e1d8));border-radius:9px;background:var(--pvx-panel2,var(--panel2,#f4f7f4));color:var(--pvx-text,var(--text,#17301f));padding:9px 10px;font:500 12px/1.25 Inter,system-ui;outline:none}.pv-p1-field textarea{min-height:72px;resize:vertical}
    .pv-p1-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px;padding-top:3px}.pv-p1-btn{border:1px solid var(--pvx-border,var(--border,#d6dfd7));border-radius:9px;background:var(--pvx-panel2,var(--panel2,#eef3ef));color:var(--pvx-text,var(--text,#17301f));padding:9px 12px;font:700 11px Inter,system-ui;cursor:pointer}.pv-p1-btn.primary{background:var(--brand,#23643f);border-color:var(--brand,#23643f);color:#fff}
    select.pv-p1-status{height:28px!important;min-width:92px!important;border:1px solid var(--pvx-border,var(--border,#d6dfd7))!important;border-radius:8px!important;background:var(--pvx-panel2,var(--panel2,#f3f7f3))!important;color:var(--pvx-text,var(--text,#17301f))!important;padding:0 7px!important;font:700 10px Inter,system-ui!important}
    .pv-p1-receipt{margin-top:9px;padding:9px;border:1px dashed var(--pvx-border,var(--border,#cdd8cf));border-radius:10px;background:var(--pvx-panel2,var(--panel2,#f4f7f4));font:10px/1.35 Inter,system-ui}.pv-p1-receipt-top{display:flex;justify-content:space-between;gap:8px}.pv-p1-receipt-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--pvx-muted,var(--muted,#6d786f))}.pv-p1-receipt-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
    .pv-p1-carry,.pv-p1-bill-status{margin-top:9px;padding:8px 9px;border:1px solid var(--pvx-border,var(--border,#d6dfd7));border-radius:10px;background:var(--pvx-panel2,var(--panel2,#f4f7f4));display:flex;align-items:center;justify-content:space-between;gap:10px;font:600 10px Inter,system-ui}.pv-p1-switch{display:inline-flex;align-items:center;gap:6px}.pv-p1-switch input{accent-color:var(--brand,#23643f)}
    .pv-p1-reminder-note{margin-top:6px;font:600 9px/1.25 Inter,system-ui;color:var(--pvx-muted,var(--muted,#6d786f))}
    @media(max-width:760px){.pv-p1-form{grid-template-columns:1fr}.pv-p1-field.full,.pv-p1-actions{grid-column:1}.pv-p1-action{height:34px!important;padding:0 9px!important}}
  `;
  document.head.appendChild(style);

  function modal(title,fields,onSubmit,submit='Save'){
    q('.pv-p1-modal')?.remove();
    const root=document.createElement('div');root.className='pv-p1-modal';
    const opts=f=>(f.options||[]).map(o=>typeof o==='string'?{value:o,label:o}:o);
    root.innerHTML=`<div class="pv-p1-dialog"><div class="pv-p1-head"><h3>${esc(title)}</h3><button class="pv-p1-x" type="button">×</button></div><form class="pv-p1-form">${fields.map(f=>`<div class="pv-p1-field ${f.full?'full':''}"><label>${esc(f.label)}</label>${f.type==='select'?`<select name="${esc(f.name)}">${opts(f).map(o=>`<option value="${esc(o.value)}" ${String(o.value)===String(f.value??'')?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`:f.type==='textarea'?`<textarea name="${esc(f.name)}" placeholder="${esc(f.placeholder||'')}">${esc(f.value||'')}</textarea>`:`<input name="${esc(f.name)}" type="${esc(f.type||'text')}" value="${esc(f.value??'')}" ${f.step!=null?`step="${f.step}"`:''} ${f.required?'required':''} placeholder="${esc(f.placeholder||'')}">`}</div>`).join('')}<div class="pv-p1-actions"><button class="pv-p1-btn" type="button" data-close>Cancel</button><button class="pv-p1-btn primary" type="submit">${esc(submit)}</button></div></form></div>`;
    document.body.appendChild(root);
    const close=()=>root.remove();
    q('.pv-p1-x',root).onclick=close;q('[data-close]',root).onclick=close;
    root.addEventListener('click',e=>{if(e.target===root)close()});
    q('form',root).onsubmit=e=>{e.preventDefault();const vals=Object.fromEntries(new FormData(e.currentTarget).entries());const ok=onSubmit(vals);if(ok!==false)close()};
  }

  function activeView(){
    const active=q('#pvSide .nav-btn.active,.sidebar .nav-btn.active,.sidebar [data-nav].active');
    const title=q('#pvTop .pv-title,.topbar .pv-title,.page-head h1,.workspace h1')?.textContent||'';
    const txt=norm(`${active?.textContent||''} ${title}`);
    if(txt.includes('accounts'))return'accounts';
    if(txt.includes('transactions'))return'transactions';
    if(txt.includes('bills'))return'bills';
    if(txt.includes('budget'))return'budget';
    return'';
  }
  function ensureTopAction(kind,label){
    qa('.pv-p1-action').forEach(x=>{if(x.dataset.kind!==kind)x.remove()});
    let b=q(`.pv-p1-action[data-kind="${kind}"]`);if(b)return b;
    const top=q('.topbar');if(!top)return null;
    b=document.createElement('button');b.type='button';b.className='pv-p1-action';b.dataset.kind=kind;b.textContent=label;
    const anchor=qa('button',top).find(x=>/new transaction/i.test(x.textContent||''));
    if(anchor)top.insertBefore(b,anchor);else top.appendChild(b);
    return b;
  }
  function clearTopAction(){qa('.pv-p1-action').forEach(x=>x.remove())}

  function accountFromContext(node){
    const accounts=collection('accounts');if(!accounts.length)return null;
    const text=norm((node?.closest?.('.card,.detail,.sidepanel')||node?.parentElement||document.body).textContent||'');
    return accounts.find(a=>text.includes(norm(accountName(a))))||accounts[0];
  }
  function accountForm(item=null){
    const accounts=collection('accounts');
    modal(item?'Edit account':'Add account',[
      {name:'name',label:'Account name',full:true,required:true,value:item?accountName(item):'',placeholder:'e.g. HDFC Salary Account'},
      {name:'type',label:'Account type',type:'select',value:item?accountType(item):'Bank',options:['Bank','Savings','Current','Credit Card','Cash','Wallet','Investment','Loan','Other']},
      {name:'institution',label:'Institution / provider',value:item&&!Array.isArray(item)?String(read(item,['institution','bank','provider'],99)??''):'',placeholder:'HDFC, SBI, Cash...'},
      {name:'balance',label:'Current balance',type:'number',step:'0.01',required:true,value:item?accountBalance(item):0},
      {name:'currency',label:'Currency',type:'select',value:(core()?.settings?.currency||'INR'),options:['INR','USD','EUR','GBP','AED','CAD','AUD','SGD','JPY']}
    ],v=>{
      if(!v.name.trim())return false;
      if(item){
        write(item,['name','accountName','title'],1,v.name.trim());
        write(item,['type','accountType','kind'],2,v.type);
        write(item,['balance','currentBalance','amount'],3,num(v.balance));
        if(!Array.isArray(item)){write(item,['institution','bank','provider'],99,v.institution.trim());write(item,['currency'],99,v.currency)}
      }else{
        const id=uid('acct'),sample=accounts[0];
        if(Array.isArray(sample))accounts.push([id,v.name.trim(),v.type,num(v.balance)]);
        else accounts.push({id,name:v.name.trim(),type:v.type,balance:num(v.balance),institution:v.institution.trim(),currency:v.currency,status:'Active'});
      }
      rerender();
    },item?'Save changes':'Add account');
  }
  function mountAccounts(){const b=ensureTopAction('account-add','+ Add account');if(b)b.onclick=()=>accountForm()}

  function txByRow(row,i){const txs=collection('transactions'),rid=row?.dataset?.id||row?.getAttribute?.('data-id');if(rid){const hit=txs.find((x,j)=>idOf(x,j)===String(rid));if(hit)return hit}return txs[i]||null}
  function txStatus(item,i){return String(meta.txStatus[idOf(item,i)]??read(item,['status','clearance','clearedStatus'],6)??'Cleared')}
  function setTxStatus(item,i,val){meta.txStatus[idOf(item,i)]=val;if(item&&!Array.isArray(item))write(item,['status','clearance','clearedStatus'],6,val);saveMeta();persistCore()}
  function openReceiptDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open('pavenro-finance-local',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('receipts'))r.result.createObjectStore('receipts')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
  async function receiptGet(id){try{const db=await openReceiptDb();return await new Promise((resolve,reject)=>{const r=db.transaction('receipts').objectStore('receipts').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}catch(_){return null}}
  async function receiptPut(id,file){const db=await openReceiptDb();return new Promise((resolve,reject)=>{const r=db.transaction('receipts','readwrite').objectStore('receipts').put({name:file.name,type:file.type,size:file.size,blob:file,updated:Date.now()},id);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}
  async function receiptDel(id){const db=await openReceiptDb();return new Promise((resolve,reject)=>{const r=db.transaction('receipts','readwrite').objectStore('receipts').delete(id);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}
  function addReceipt(card,item,id){
    if(q('.pv-p1-receipt',card))return;
    const box=document.createElement('div');box.className='pv-p1-receipt';
    box.innerHTML='<div class="pv-p1-receipt-top"><b>Receipt</b><span class="pv-p1-receipt-name">No receipt uploaded</span></div><div class="pv-p1-receipt-actions"><button class="pv-p1-btn" type="button" data-up>Upload receipt</button><button class="pv-p1-btn" type="button" data-view hidden>View</button><button class="pv-p1-btn" type="button" data-del hidden>Remove</button><input data-file type="file" accept="image/*,.pdf" hidden></div>';
    (q('.card-body,.detail-body',card)||card).appendChild(box);
    const input=q('[data-file]',box),name=q('.pv-p1-receipt-name',box),view=q('[data-view]',box),del=q('[data-del]',box);
    const refresh=async()=>{const r=await receiptGet(id);name.textContent=r?`${r.name} · ${Math.round(r.size/1024)} KB`:'No receipt uploaded';view.hidden=!r;del.hidden=!r};
    q('[data-up]',box).onclick=()=>input.click();input.onchange=async()=>{const f=input.files?.[0];if(!f)return;if(f.size>12*1024*1024){alert('Please upload a receipt under 12 MB.');return}await receiptPut(id,f);refresh()};
    view.onclick=async()=>{const r=await receiptGet(id);if(!r)return;const u=URL.createObjectURL(r.blob);window.open(u,'_blank');setTimeout(()=>URL.revokeObjectURL(u),60000)};del.onclick=async()=>{await receiptDel(id);refresh()};refresh();
  }
  function mountTransactions(){
    clearTopAction();const txs=collection('transactions');if(!txs.length)return;const cards=qa('.card');
    const tableCard=cards.find(c=>/all transactions/i.test(q('h2,h3,.card-head,.card-title',c)?.textContent||'')&&q('table',c))||cards.find(c=>q('table',c)&&/transactions/i.test(c.textContent||''));
    if(tableCard){const table=q('table',tableCard),rows=qa('tbody tr',table).length?qa('tbody tr',table):qa('tr',table).slice(1),headRow=q('thead tr',table)||q('tr',table);let h=qa('th',headRow).find(x=>/^status$/i.test(x.textContent.trim()));if(!h){h=document.createElement('th');h.textContent='Status';headRow?.appendChild(h)}rows.forEach((row,i)=>{const item=txByRow(row,i);if(!item)return;let cell=qa('td',row).find(td=>/^(cleared|pending|uncleared|reconciled)$/i.test(td.textContent.trim()));if(!cell){cell=document.createElement('td');row.appendChild(cell)}if(q('select.pv-p1-status',cell))return;const sel=document.createElement('select');sel.className='pv-p1-status';['Cleared','Pending','Uncleared'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;o.selected=norm(v)===norm(txStatus(item,i));sel.appendChild(o)});sel.onchange=()=>setTxStatus(item,i,sel.value);cell.replaceChildren(sel)})}
    const detail=cards.find(c=>c!==tableCard&&!q('table',c)&&txs.some(x=>norm(c.textContent||'').includes(norm(txName(x)))));if(detail){const item=txs.find(x=>norm(detail.textContent||'').includes(norm(txName(x))))||txs[0];addReceipt(detail,item,idOf(item,txs.indexOf(item)))}
  }

  function billByRow(row,i){const bills=collection('bills'),rid=row?.dataset?.id||row?.getAttribute?.('data-id');if(rid){const hit=bills.find((x,j)=>idOf(x,j)===String(rid));if(hit)return hit}return bills[i]||null}
  function setBillStatus(item,val){if(!item)return;write(item,['status','state'],6,val);rerender()}
  function billForm(){
    const bills=collection('bills'),accounts=collection('accounts');
    modal('Add bill',[{name:'name',label:'Bill name',full:true,required:true,placeholder:'Rent, Internet, Insurance...'},{name:'amount',label:'Amount',type:'number',step:'0.01',required:true},{name:'due',label:'Due date',type:'date',required:true},{name:'category',label:'Category',type:'select',options:['Housing','Utilities','Phone','Insurance','Subscription','Education','Health','Tax','Other']},{name:'account',label:'Pay from account',type:'select',options:accounts.map((a,i)=>({value:idOf(a,i),label:accountName(a)||`Account ${i+1}`}))},{name:'frequency',label:'Frequency',type:'select',options:['Monthly','Weekly','Quarterly','Yearly','One time']},{name:'status',label:'Status',type:'select',options:['Upcoming','Scheduled','Paid']},{name:'reminder',label:'Reminder',type:'select',options:[{value:'none',label:'No reminder'},{value:'1',label:'1 day before'},{value:'3',label:'3 days before'},{value:'7',label:'1 week before'}]}],v=>{const id=uid('bill'),sample=bills[0];if(Array.isArray(sample))bills.push([id,v.name.trim(),num(v.amount),v.due,v.category,v.account,v.status,v.frequency]);else bills.push({id,name:v.name.trim(),amount:num(v.amount),dueDate:v.due,category:v.category,accountId:v.account,status:v.status,frequency:v.frequency});if(v.reminder!=='none')meta.billReminder[id]={kind:'days',days:num(v.reminder)};saveMeta();rerender()},'Add bill');
  }
  function reminderForm(item,i){const id=idOf(item,i),r=meta.billReminder[id]||{};modal(`Reminder · ${billName(item)}`,[{name:'mode',label:'Reminder',type:'select',value:r.kind==='days'?String(r.days):(r.kind||'none'),options:[{value:'none',label:'No reminder'},{value:'1',label:'1 day before'},{value:'3',label:'3 days before'},{value:'7',label:'1 week before'},{value:'custom',label:'Custom date'}]},{name:'custom',label:'Custom date',type:'date',value:r.date||''}],v=>{if(v.mode==='none')delete meta.billReminder[id];else if(v.mode==='custom')meta.billReminder[id]={kind:'custom',date:v.custom};else meta.billReminder[id]={kind:'days',days:num(v.mode)};saveMeta();mount()},'Save reminder')}
  function mountBills(){
    const top=ensureTopAction('bill-add','+ Add bill');if(top)top.onclick=billForm;const bills=collection('bills');if(!bills.length)return;const cards=qa('.card'),tableCard=cards.find(c=>/bills overview/i.test(q('h2,h3,.card-head,.card-title',c)?.textContent||'')&&q('table',c))||cards.find(c=>q('table',c)&&/bills/i.test(c.textContent||''));
    if(tableCard){const table=q('table',tableCard),rows=qa('tbody tr',table).length?qa('tbody tr',table):qa('tr',table).slice(1);rows.forEach((row,i)=>{const item=billByRow(row,i);if(!item)return;let cell=qa('td',row).find(td=>/^(paid|upcoming|scheduled|overdue)$/i.test(td.textContent.trim()));if(!cell){cell=document.createElement('td');row.appendChild(cell)}if(q('select.pv-p1-status',cell))return;const sel=document.createElement('select');sel.className='pv-p1-status';['Upcoming','Scheduled','Paid','Overdue'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;o.selected=norm(v)===norm(billStatus(item));sel.appendChild(o)});sel.onchange=()=>setBillStatus(item,sel.value);cell.replaceChildren(sel)})}
    qa('button').filter(b=>/^edit( bill)?$/i.test(b.textContent.trim())).forEach(b=>{const c=b.closest('.card,.detail,.sidepanel');if(c&&!q('table',c))b.remove()});
    const detail=cards.find(c=>c!==tableCard&&!q('table',c)&&bills.some(x=>norm(c.textContent||'').includes(norm(billName(x)))));if(detail){const item=bills.find(x=>norm(detail.textContent||'').includes(norm(billName(x))))||bills[0],i=bills.indexOf(item);if(!q('.pv-p1-bill-status',detail)){const box=document.createElement('div');box.className='pv-p1-bill-status';box.innerHTML='<span><b>Status</b><br><small style="opacity:.68">Change it anytime</small></span><select class="pv-p1-status"></select>';const sel=q('select',box);['Upcoming','Scheduled','Paid','Overdue'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;o.selected=norm(v)===norm(billStatus(item));sel.appendChild(o)});sel.onchange=()=>setBillStatus(item,sel.value);(q('.card-body,.detail-body',detail)||detail).appendChild(box)}const r=meta.billReminder[idOf(item,i)];if(r&&!q('.pv-p1-reminder-note',detail)){const n=document.createElement('div');n.className='pv-p1-reminder-note';n.textContent=r.kind==='custom'?`Reminder: ${r.date||'custom date'}`:`Reminder: ${r.days} day${r.days===1?'':'s'} before`;detail.appendChild(n)}}
  }

  function budgetForm(){const buds=collection('budgets');modal('Add budget category',[{name:'category',label:'Category name',full:true,required:true,placeholder:'e.g. Childcare, Travel, Gifts'},{name:'limit',label:'Monthly limit',type:'number',step:'0.01',required:true},{name:'carry',label:'Carry forward',type:'select',options:[{value:'no',label:'No — reset monthly'},{value:'yes',label:'Yes — carry unused amount'}]},{name:'note',label:'Note',type:'textarea',full:true,placeholder:'Optional purpose or rule'}],v=>{if(buds.some(x=>norm(budgetName(x))===norm(v.category))){alert('This budget category already exists.');return false}const sample=buds[0];if(Array.isArray(sample))buds.push([v.category.trim(),num(v.limit),0]);else buds.push({id:uid('bud'),category:v.category.trim(),name:v.category.trim(),limit:num(v.limit),budget:num(v.limit),spent:0,actual:0,note:v.note||'',carryForward:v.carry==='yes'});meta.budgetCarry[v.category.trim()]=v.carry==='yes';saveMeta();rerender()},'Add category')}
  function setCarry(item,on){meta.budgetCarry[budgetName(item)]=!!on;if(item&&!Array.isArray(item))write(item,['carryForward','rollover','carry'],99,!!on);saveMeta();persistCore()}
  function mountBudget(){const top=ensureTopAction('budget-add','+ Add budget');if(top)top.onclick=budgetForm;const buds=collection('budgets');if(!buds.length)return;const cards=qa('.card'),overview=cards.find(c=>/category budget overview|category budget/i.test(q('h2,h3,.card-head,.card-title',c)?.textContent||'')&&q('table',c)),detail=cards.find(c=>c!==overview&&!q('table',c)&&buds.some(x=>norm(c.textContent||'').includes(norm(budgetName(x)))));if(detail&&!q('.pv-p1-carry',detail)){const item=buds.find(x=>norm(detail.textContent||'').includes(norm(budgetName(x))))||buds[0],current=meta.budgetCarry[budgetName(item)]??(!Array.isArray(item)&&!!read(item,['carryForward','rollover','carry'],99));const row=document.createElement('div');row.className='pv-p1-carry';row.innerHTML=`<span><b>Carry forward</b><br><small style="opacity:.68">Move unused budget into next month</small></span><label class="pv-p1-switch"><input type="checkbox" ${current?'checked':''}><span>${current?'On':'Off'}</span></label>`;const inp=q('input',row),lab=q('.pv-p1-switch span',row);inp.onchange=()=>{setCarry(item,inp.checked);lab.textContent=inp.checked?'On':'Off'};(q('.card-body,.detail-body',detail)||detail).appendChild(row)}}

  let mounting=false,queued=false;
  function mount(){if(mounting)return;mounting=true;try{const v=activeView();if(v==='accounts')mountAccounts();else if(v==='transactions')mountTransactions();else if(v==='bills')mountBills();else if(v==='budget')mountBudget();else clearTopAction()}catch(err){console.error('PAVENRO Phase 1 mount error',err)}finally{mounting=false}}
  const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})};
  new MutationObserver(queue).observe(q('.workspace')||document.body,{childList:true,subtree:true});

  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;const v=activeView(),text=norm(b.textContent);
    if(v==='accounts'&&text.includes('edit account')){e.preventDefault();e.stopImmediatePropagation();accountForm(accountFromContext(b));return}
    if(v==='accounts'&&text.includes('add account')&&!b.classList.contains('pv-p1-action')){e.preventDefault();e.stopImmediatePropagation();accountForm();return}
    if(v==='bills'&&text.includes('add bill')&&!b.classList.contains('pv-p1-action')){e.preventDefault();e.stopImmediatePropagation();billForm();return}
    if(v==='bills'&&text.includes('reminder')){e.preventDefault();e.stopImmediatePropagation();const bills=collection('bills'),card=b.closest('.card,.detail,.sidepanel')||document.body,item=bills.find(x=>norm(card.textContent||'').includes(norm(billName(x))))||bills[0];if(item)reminderForm(item,bills.indexOf(item));return}
    if(v==='budget'&&(text==='category'||text==='+ category'||text.includes('add category'))){e.preventDefault();e.stopImmediatePropagation();budgetForm();return}
    if(v==='budget'&&text.includes('carry forward')){e.preventDefault();e.stopImmediatePropagation();const buds=collection('budgets'),card=b.closest('.card,.detail,.sidepanel')||document.body,item=buds.find(x=>norm(card.textContent||'').includes(norm(budgetName(x))))||buds[0];if(item){const now=meta.budgetCarry[budgetName(item)]??false;setCarry(item,!now);mount()}return}
  },true);

  setTimeout(mount,120);
  setTimeout(mount,500);
})();