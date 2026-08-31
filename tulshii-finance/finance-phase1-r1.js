(()=>{
  if(window.__PAVENRO_FINANCE_PHASE1_R1__) return;
  window.__PAVENRO_FINANCE_PHASE1_R1__=true;

  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const norm=s=>(s||'').replace(/\s+/g,' ').trim().toLowerCase();
  const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>Number(String(v??0).replace(/[^0-9.-]/g,''))||0;

  const style=document.createElement('style');
  style.id='pv-fin-phase1-style';
  style.textContent=`
    .pv-p1-page-action{height:38px!important;border:1px solid var(--pvx-border,#d7e1d8)!important;border-radius:10px!important;background:var(--pvx-panel2,var(--panel2,#edf3ee))!important;color:var(--pvx-text,var(--text,#17301f))!important;padding:0 13px!important;font:700 11px/1 Inter,system-ui!important;cursor:pointer!important;white-space:nowrap!important}
    .pv-p1-page-action:hover{filter:brightness(.98)}
    .pv-p1-modal{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:#07130d8c;padding:18px}
    .pv-p1-dialog{width:min(560px,96vw);max-height:92vh;overflow:auto;border:1px solid var(--pvx-border,#d6dfd7);border-radius:16px;background:var(--pvx-panel,var(--panel,#fff));color:var(--pvx-text,var(--text,#17301f));box-shadow:0 24px 70px #0005}
    .pv-p1-dialog-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px 12px;border-bottom:1px solid var(--pvx-border,#e1e7e2)}
    .pv-p1-dialog-head h3{margin:0;font:700 19px/1.2 Georgia,serif;color:inherit}.pv-p1-x{border:0;background:transparent;color:inherit;font-size:22px;cursor:pointer;opacity:.65}
    .pv-p1-form{padding:15px 18px 18px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .pv-p1-field{display:flex;flex-direction:column;gap:5px;min-width:0}.pv-p1-field.full{grid-column:1/-1}.pv-p1-field label{font:700 10px/1.2 Inter,system-ui;color:var(--pvx-muted,var(--muted,#6d786f));text-transform:uppercase;letter-spacing:.05em}
    .pv-p1-field input,.pv-p1-field select,.pv-p1-field textarea{width:100%;box-sizing:border-box;border:1px solid var(--pvx-border,#d7e1d8);border-radius:9px;background:var(--pvx-panel2,var(--panel2,#f4f7f4));color:var(--pvx-text,var(--text,#17301f));padding:9px 10px;font:500 12px/1.25 Inter,system-ui;outline:none}
    .pv-p1-field textarea{min-height:72px;resize:vertical}.pv-p1-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px;padding-top:3px}.pv-p1-btn{border:1px solid var(--pvx-border,#d6dfd7);border-radius:9px;background:var(--pvx-panel2,var(--panel2,#eef3ef));color:var(--pvx-text,var(--text,#17301f));padding:9px 13px;font:700 11px Inter,system-ui;cursor:pointer}.pv-p1-btn.primary{background:var(--brand,#23643f);border-color:var(--brand,#23643f);color:#fff}
    .pv-p1-status{height:28px;min-width:92px;border:1px solid var(--pvx-border,#d6dfd7);border-radius:8px;background:var(--pvx-panel2,var(--panel2,#f3f7f3));color:var(--pvx-text,var(--text,#17301f));padding:0 7px;font:700 10px Inter,system-ui}
    .pv-p1-receipt{margin-top:9px;padding:9px;border:1px dashed var(--pvx-border,#cdd8cf);border-radius:10px;background:var(--pvx-panel2,var(--panel2,#f4f7f4));font:10px/1.35 Inter,system-ui}.pv-p1-receipt-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.pv-p1-receipt-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--pvx-muted,var(--muted,#6d786f))}.pv-p1-receipt-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
    .pv-p1-carry{margin-top:9px;padding:8px 9px;border:1px solid var(--pvx-border,#d6dfd7);border-radius:10px;background:var(--pvx-panel2,var(--panel2,#f4f7f4));display:flex;align-items:center;justify-content:space-between;gap:10px;font:600 10px Inter,system-ui}.pv-p1-switch{display:inline-flex;align-items:center;gap:6px}.pv-p1-switch input{accent-color:var(--brand,#23643f)}
    .pv-p1-reminder-note{margin-top:6px;font:600 9px/1.25 Inter,system-ui;color:var(--pvx-muted,var(--muted,#6d786f))}
    @media(max-width:700px){.pv-p1-form{grid-template-columns:1fr}.pv-p1-field.full,.pv-p1-actions{grid-column:1}.pv-p1-page-action{height:34px!important;padding:0 9px!important}}
  `;
  document.head.appendChild(style);

  const META_KEY='pavenro.finance.phase1.meta';
  const meta=(()=>{try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')}catch(e){return{}}})();
  meta.txStatus ||= {}; meta.billReminder ||= {}; meta.budgetCarry ||= {};
  const saveMeta=()=>localStorage.setItem(META_KEY,JSON.stringify(meta));

  function st(){try{return typeof state!=='undefined'?state:null}catch(e){return null}}
  function coll(type){
    const s=st(); if(!s)return[];
    const keys={accounts:['accounts','a'],transactions:['transactions','t','activity'],bills:['bills','b'],budgets:['budgets','budgetCategories','budget','bud']}[type]||[];
    for(const k of keys) if(Array.isArray(s[k])) return s[k];
    return [];
  }
  function read(item,keys,idx){if(!item)return undefined;if(Array.isArray(item))return item[idx];for(const k of keys)if(Object.prototype.hasOwnProperty.call(item,k))return item[k];return undefined}
  function write(item,keys,idx,val){if(Array.isArray(item)){item[idx]=val;return}for(const k of keys)if(Object.prototype.hasOwnProperty.call(item,k)){item[k]=val;return}item[keys[0]]=val}
  const idOf=(x,i=0)=>String(read(x,['id','accountId','transactionId','billId','budgetId'],0)??`row-${i}`);
  const accountName=x=>String(read(x,['name','accountName','title'],1)??'');
  const accountType=x=>String(read(x,['type','accountType','kind'],2)??'Bank');
  const accountBalance=x=>num(read(x,['balance','currentBalance','amount'],3));
  const txName=x=>String(read(x,['merchant','description','name','title'],2)??read(x,['description','merchant','name'],1)??'Transaction');
  const txStatus=(x,i)=>String(meta.txStatus[idOf(x,i)]??read(x,['status','clearance','clearedStatus'],6)??'Cleared');
  const billName=x=>String(read(x,['name','billName','title','merchant'],1)??'Bill');
  const billAmount=x=>num(read(x,['amount','value','monthlyAmount'],2));
  const billDue=x=>String(read(x,['dueDate','date','nextDue'],3)??'');
  const billStatus=x=>String(read(x,['status','state'],6)??'Upcoming');
  const budgetName=x=>String(read(x,['category','name','title'],0)??'Category');
  const budgetLimit=x=>num(read(x,['limit','budget','amount','planned'],1));
  const budgetSpent=x=>num(read(x,['spent','actual','used'],2));

  function persist(){
    try{if(typeof saveState==='function'){saveState();return}}catch(e){}
    try{if(typeof persistState==='function'){persistState();return}}catch(e){}
    try{if(typeof save==='function'){save();return}}catch(e){}
    const s=st(); if(!s)return;
    try{
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i); if(!/fin|pavenro/i.test(k||''))continue;
        let v; try{v=JSON.parse(localStorage.getItem(k))}catch(e){continue}
        if(!v||typeof v!=='object'||Array.isArray(v))continue;
        const score=['accounts','transactions','bills','budgets','budgetCategories'].filter(x=>Array.isArray(v[x])&&Array.isArray(s[x])).length;
        if(score>=2){localStorage.setItem(k,JSON.stringify(s));break}
      }
    }catch(e){}
  }
  function rerender(){persist();try{if(typeof render==='function')render()}catch(e){}setTimeout(augment,20)}

  function modal(title,fields,onSubmit,submit='Save'){
    q('.pv-p1-modal')?.remove();
    const root=document.createElement('div');root.className='pv-p1-modal';
    const opts=f=>Array.isArray(f.options)?f.options.map(o=>typeof o==='string'?{value:o,label:o}:o):[];
    root.innerHTML=`<div class="pv-p1-dialog"><div class="pv-p1-dialog-head"><h3>${esc(title)}</h3><button class="pv-p1-x" type="button">×</button></div><form class="pv-p1-form">${fields.map(f=>`<div class="pv-p1-field ${f.full?'full':''}"><label>${esc(f.label)}</label>${f.type==='select'?`<select name="${esc(f.name)}">${opts(f).map(o=>`<option value="${esc(o.value)}" ${String(o.value)===String(f.value??'')?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`:f.type==='textarea'?`<textarea name="${esc(f.name)}" placeholder="${esc(f.placeholder||'')}">${esc(f.value||'')}</textarea>`:`<input name="${esc(f.name)}" type="${esc(f.type||'text')}" value="${esc(f.value??'')}" ${f.min!=null?`min="${f.min}"`:''} ${f.step!=null?`step="${f.step}"`:''} ${f.required?'required':''} placeholder="${esc(f.placeholder||'')}">`}</div>`).join('')}<div class="pv-p1-actions"><button class="pv-p1-btn" type="button" data-close>Cancel</button><button class="pv-p1-btn primary" type="submit">${esc(submit)}</button></div></form></div>`;
    document.body.appendChild(root);
    const close=()=>root.remove(); q('.pv-p1-x',root).onclick=close;q('[data-close]',root).onclick=close;root.addEventListener('click',e=>{if(e.target===root)close()});
    q('form',root).onsubmit=e=>{e.preventDefault();const fd=new FormData(e.currentTarget),v=Object.fromEntries(fd.entries());const r=onSubmit(v);if(r!==false)close()};
    return root;
  }

  function makeAccount(editItem=null){
    const accounts=coll('accounts');
    const inst=editItem&&!Array.isArray(editItem)?String(read(editItem,['institution','bank','provider'],99)??''):'';
    modal(editItem?'Edit account':'Add account',[
      {name:'name',label:'Account name',value:editItem?accountName(editItem):'',required:true,full:true,placeholder:'e.g. HDFC Salary Account'},
      {name:'type',label:'Account type',type:'select',value:editItem?accountType(editItem):'Bank',options:['Bank','Savings','Current','Credit Card','Cash','Wallet','Investment','Loan','Other']},
      {name:'institution',label:'Institution / provider',value:inst,placeholder:'HDFC, SBI, Cash...'},
      {name:'balance',label:'Current balance',type:'number',step:'0.01',value:editItem?accountBalance(editItem):0,required:true},
      {name:'currency',label:'Currency',type:'select',value:(st()?.settings?.currency||'INR'),options:['INR','USD','EUR','GBP','AED','CAD','AUD','SGD','JPY']}
    ],v=>{
      if(!v.name.trim())return false;
      if(editItem){
        write(editItem,['name','accountName','title'],1,v.name.trim());write(editItem,['type','accountType','kind'],2,v.type);write(editItem,['balance','currentBalance','amount'],3,num(v.balance));
        if(!Array.isArray(editItem)){write(editItem,['institution','bank','provider'],99,v.institution.trim());write(editItem,['currency'],99,v.currency)}
      }else{
        const sample=accounts[0];
        if(Array.isArray(sample)) accounts.push([uid('acct'),v.name.trim(),v.type,num(v.balance)]);
        else accounts.push({id:uid('acct'),name:v.name.trim(),type:v.type,balance:num(v.balance),institution:v.institution.trim(),currency:v.currency,status:'Active'});
      }
      rerender();
    },editItem?'Save changes':'Add account');
  }

  function findAccountFromCard(card){
    const title=norm(q('h1,h2,h3,h4,.card-title,.detail-title',card)?.textContent||card?.textContent?.split('\n')[0]);
    const a=coll('accounts');return a.find(x=>title.includes(norm(accountName(x)))||norm(accountName(x)).includes(title))||a[0];
  }

  function accountPage(){
    addPageAction('Accounts','+ Add account',()=>makeAccount());
    qa('button').filter(b=>/edit account/i.test(b.textContent||'')).forEach(b=>{if(b.dataset.pvP1)return;b.dataset.pvP1='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();makeAccount(findAccountFromCard(b.closest('.card,.detail,.sidepanel')||document))},true)});
  }

  function setTxStatus(item,i,val){meta.txStatus[idOf(item,i)]=val;if(!Array.isArray(item))write(item,['status','clearance','clearedStatus'],6,val);saveMeta();persist()}
  function transactionPage(){
    const txs=coll('transactions');
    const cards=qa('.card');
    const tableCard=cards.find(c=>/all transactions|transactions/i.test(q('h2,h3,.card-head,.card-title',c)?.textContent||'')&&q('table',c));
    if(tableCard){
      const table=q('table',tableCard),rows=qa('tbody tr',table).length?qa('tbody tr',table):qa('tr',table).slice(1);
      let head=qa('th',table).find(th=>/^status$/i.test(th.textContent.trim()));
      if(!head){const hr=q('thead tr',table)||q('tr',table);if(hr){head=document.createElement('th');head.textContent='Status';hr.appendChild(head)}}
      rows.forEach((tr,i)=>{
        const item=txs[i];if(!item)return;
        let cell=qa('td',tr).find(td=>/^(cleared|pending|uncleared|reconciled)$/i.test(td.textContent.trim()));
        if(!cell){cell=document.createElement('td');tr.appendChild(cell)}
        if(q('.pv-p1-status',cell))return;
        const cur=txStatus(item,i),sel=document.createElement('select');sel.className='pv-p1-status';['Cleared','Pending','Uncleared'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;o.selected=norm(v)===norm(cur);sel.appendChild(o)});sel.onchange=()=>{setTxStatus(item,i,sel.value);setTimeout(augment,10)};cell.replaceChildren(sel);
      });
    }
    const detail=cards.find(c=>c!==tableCard&&!q('table',c)&&txs.some(x=>norm(c.textContent||'').includes(norm(txName(x)))));
    if(detail&&!q('.pv-p1-receipt',detail)){
      const item=txs.find(x=>norm(detail.textContent||'').includes(norm(txName(x))))||txs[0];if(item)addReceipt(detail,item,idOf(item,txs.indexOf(item)));
    }
  }

  function openReceiptDb(){return new Promise((res,rej)=>{const r=indexedDB.open('pavenro-finance-local',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('receipts'))r.result.createObjectStore('receipts')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
  async function receiptGet(id){try{const db=await openReceiptDb();return await new Promise((res,rej)=>{const r=db.transaction('receipts').objectStore('receipts').get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}catch(e){return null}}
  async function receiptPut(id,file){const db=await openReceiptDb();return new Promise((res,rej)=>{const r=db.transaction('receipts','readwrite').objectStore('receipts').put({name:file.name,type:file.type,size:file.size,updated:Date.now(),blob:file},id);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
  async function receiptDel(id){const db=await openReceiptDb();return new Promise((res,rej)=>{const r=db.transaction('receipts','readwrite').objectStore('receipts').delete(id);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
  function addReceipt(card,item,id){
    const box=document.createElement('div');box.className='pv-p1-receipt';box.innerHTML='<div class="pv-p1-receipt-top"><b>Receipt</b><span class="pv-p1-receipt-name">No receipt uploaded</span></div><div class="pv-p1-receipt-actions"><button class="pv-p1-btn" type="button" data-up>Upload receipt</button><button class="pv-p1-btn" type="button" data-view style="display:none">View</button><button class="pv-p1-btn" type="button" data-del style="display:none">Remove</button><input data-file type="file" accept="image/*,.pdf" hidden></div>';
    const host=q('.card-body,.detail-body,.content',card)||card;host.appendChild(box);const input=q('[data-file]',box),name=q('.pv-p1-receipt-name',box),view=q('[data-view]',box),del=q('[data-del]',box);
    const refresh=async()=>{const r=await receiptGet(id);name.textContent=r?`${r.name} · ${(r.size/1024).toFixed(r.size>1024?0:1)} KB`:'No receipt uploaded';view.style.display=r?'':'none';del.style.display=r?'':'none'};
    q('[data-up]',box).onclick=()=>input.click();input.onchange=async()=>{const f=input.files?.[0];if(!f)return;if(f.size>12*1024*1024){alert('Please upload a receipt under 12 MB.');return}await receiptPut(id,f);refresh()};view.onclick=async()=>{const r=await receiptGet(id);if(!r)return;const u=URL.createObjectURL(r.blob);window.open(u,'_blank');setTimeout(()=>URL.revokeObjectURL(u),60000)};del.onclick=async()=>{await receiptDel(id);refresh()};refresh();
  }

  function makeBill(){
    const bills=coll('bills'),accounts=coll('accounts');
    modal('Add bill',[
      {name:'name',label:'Bill name',required:true,full:true,placeholder:'Rent, Internet, Insurance...'},
      {name:'amount',label:'Amount',type:'number',step:'0.01',required:true},
      {name:'due',label:'Due date',type:'date',required:true},
      {name:'category',label:'Category',type:'select',options:['Housing','Utilities','Phone','Insurance','Subscription','Education','Health','Tax','Other']},
      {name:'account',label:'Pay from account',type:'select',options:accounts.map((a,i)=>({value:idOf(a,i),label:accountName(a)||`Account ${i+1}`}))},
      {name:'frequency',label:'Frequency',type:'select',options:['Monthly','Weekly','Quarterly','Yearly','One time']},
      {name:'status',label:'Status',type:'select',options:['Upcoming','Scheduled','Paid']},
      {name:'reminder',label:'Reminder',type:'select',options:[{value:'none',label:'No reminder'},{value:'1',label:'1 day before'},{value:'3',label:'3 days before'},{value:'7',label:'1 week before'}]}
    ],v=>{
      const id=uid('bill'),sample=bills[0];
      if(Array.isArray(sample))bills.push([id,v.name.trim(),num(v.amount),v.due,v.category,v.account,v.status,v.frequency]);
      else bills.push({id,name:v.name.trim(),amount:num(v.amount),dueDate:v.due,category:v.category,accountId:v.account,status:v.status,frequency:v.frequency});
      if(v.reminder!=='none')meta.billReminder[id]={kind:'days',days:num(v.reminder)};saveMeta();rerender();
    },'Add bill');
  }
  function setBillStatus(item,val){write(item,['status','state'],6,val);rerender()}
  function makeReminder(item,i){const id=idOf(item,i),r=meta.billReminder[id]||{};modal(`Reminder · ${billName(item)}`,[{name:'mode',label:'Reminder',type:'select',value:r.kind==='days'?String(r.days):r.kind||'none',options:[{value:'none',label:'No reminder'},{value:'1',label:'1 day before'},{value:'3',label:'3 days before'},{value:'7',label:'1 week before'},{value:'custom',label:'Custom date'}]},{name:'custom',label:'Custom date',type:'date',value:r.date||''}],v=>{if(v.mode==='none')delete meta.billReminder[id];else if(v.mode==='custom')meta.billReminder[id]={kind:'custom',date:v.custom};else meta.billReminder[id]={kind:'days',days:num(v.mode)};saveMeta();setTimeout(augment,20)},'Save reminder')}
  function billsPage(){
    addPageAction('Bills','+ Add bill',makeBill);const bills=coll('bills'),cards=qa('.card'),tableCard=cards.find(c=>/bills overview/i.test(q('h2,h3,.card-head,.card-title',c)?.textContent||'')&&q('table',c));
    if(tableCard){const table=q('table',tableCard),rows=qa('tbody tr',table).length?qa('tbody tr',table):qa('tr',table).slice(1);rows.forEach((tr,i)=>{const b=bills[i];if(!b)return;let cell=qa('td',tr).find(td=>/^(paid|upcoming|scheduled|overdue)$/i.test(td.textContent.trim()));if(!cell){cell=document.createElement('td');tr.appendChild(cell)}if(q('.pv-p1-status',cell))return;const sel=document.createElement('select');sel.className='pv-p1-status';const cur=billStatus(b);['Upcoming','Scheduled','Paid','Overdue'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;o.selected=norm(v)===norm(cur);sel.appendChild(o)});sel.onchange=()=>setBillStatus(b,sel.value);cell.replaceChildren(sel)})}
    qa('button').filter(b=>/^edit( bill)?$/i.test(b.textContent.trim())).forEach(b=>{if(b.closest('.card,.detail,.sidepanel')&&!q('table',b.closest('.card,.detail,.sidepanel')))b.remove()});
    qa('button').filter(b=>/set reminder|reminder/i.test(b.textContent||'')).forEach(btn=>{if(btn.dataset.pvP1)return;btn.dataset.pvP1='1';btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const card=btn.closest('.card,.detail,.sidepanel')||document;const item=bills.find(x=>norm(card.textContent||'').includes(norm(billName(x))))||bills[0];if(item)makeReminder(item,bills.indexOf(item))},true)});
    qa('button').filter(b=>/mark paid|^paid$/i.test(b.textContent.trim())).forEach(btn=>{if(btn.dataset.pvP1Paid)return;btn.dataset.pvP1Paid='1';btn.disabled=false;btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const card=btn.closest('.card,.detail,.sidepanel')||document;const item=bills.find(x=>norm(card.textContent||'').includes(norm(billName(x))))||bills[0];if(item)setBillStatus(item,'Paid')},true)});
    cards.filter(c=>!q('table',c)&&bills.some(x=>norm(c.textContent||'').includes(norm(billName(x))))).forEach(c=>{if(q('.pv-p1-reminder-note',c))return;const item=bills.find(x=>norm(c.textContent||'').includes(norm(billName(x))));if(!item)return;const r=meta.billReminder[idOf(item,bills.indexOf(item))];if(!r)return;const n=document.createElement('div');n.className='pv-p1-reminder-note';n.textContent=r.kind==='custom'?`Reminder: ${r.date||'custom date'}`:`Reminder: ${r.days} day${r.days===1?'':'s'} before`;const host=q('.card-body,.detail-body',c)||c;host.appendChild(n)})
  }

  function makeBudget(){
    const buds=coll('budgets');
    modal('Add budget category',[
      {name:'category',label:'Category name',required:true,full:true,placeholder:'e.g. Childcare, Travel, Gifts'},
      {name:'limit',label:'Monthly limit',type:'number',step:'0.01',required:true},
      {name:'carry',label:'Carry forward',type:'select',options:[{value:'no',label:'No — reset monthly'},{value:'yes',label:'Yes — carry unused amount'}]},
      {name:'note',label:'Note',full:true,placeholder:'Optional purpose or rule'}
    ],v=>{
      if(buds.some(x=>norm(budgetName(x))===norm(v.category))){alert('This budget category already exists.');return false}
      const id=uid('bud'),sample=buds[0];
      if(Array.isArray(sample))buds.push([v.category.trim(),num(v.limit),0]);
      else buds.push({id,category:v.category.trim(),name:v.category.trim(),limit:num(v.limit),budget:num(v.limit),spent:0,actual:0,note:v.note||'',carryForward:v.carry==='yes'});
      meta.budgetCarry[v.category.trim()]=v.carry==='yes';saveMeta();rerender();
    },'Add category');
  }
  function budgetCarry(item,val){meta.budgetCarry[budgetName(item)]=!!val;if(!Array.isArray(item))write(item,['carryForward','rollover','carry'],99,!!val);saveMeta();persist();setTimeout(augment,20)}
  function budgetPage(){
    addPageAction('Budget','+ Add budget',makeBudget);const buds=coll('budgets');
    qa('button').filter(b=>/^\+?\s*category$/i.test(b.textContent.trim())||/add category/i.test(b.textContent)).forEach(btn=>{if(btn.dataset.pvP1)return;btn.dataset.pvP1='1';btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();makeBudget()},true)});
    const cards=qa('.card'),detail=cards.find(c=>!q('table',c)&&buds.some(x=>norm(c.textContent||'').includes(norm(budgetName(x)))));
    if(detail){const item=buds.find(x=>norm(detail.textContent||'').includes(norm(budgetName(x))))||buds[0];if(item&&!q('.pv-p1-carry',detail)){const row=document.createElement('div');row.className='pv-p1-carry';const current=meta.budgetCarry[budgetName(item)]??(!Array.isArray(item)&&!!read(item,['carryForward','rollover','carry'],99));row.innerHTML=`<span><b>Carry forward</b><br><small style="opacity:.68">Move unused budget into next month</small></span><label class="pv-p1-switch"><input type="checkbox" ${current?'checked':''}><span>${current?'On':'Off'}</span></label>`;const inp=q('input',row),lab=q('.pv-p1-switch span',row);inp.onchange=()=>{budgetCarry(item,inp.checked);lab.textContent=inp.checked?'On':'Off'};(q('.card-body,.detail-body',detail)||detail).appendChild(row)}}
    qa('button').filter(b=>/carry forward/i.test(b.textContent||'')).forEach(btn=>{if(btn.dataset.pvP1Carry)return;btn.dataset.pvP1Carry='1';btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const card=btn.closest('.card,.detail,.sidepanel')||document;const item=buds.find(x=>norm(card.textContent||'').includes(norm(budgetName(x))))||buds[0];if(item){const now=meta.budgetCarry[budgetName(item)]??false;budgetCarry(item,!now)}},true)})
  }

  function currentView(){const a=q('#pvSide .nav-btn.active,.sidebar .nav-btn.active,.sidebar .active[data-nav]');const t=q('#pvTop .pv-title,.topbar .pv-title,.page-head h1,h1')?.textContent||'';return norm((a?.textContent||'')+' '+t)}
  function addPageAction(view,label,fn){
    let old=q('.pv-p1-page-action');const active=currentView().includes(norm(view));if(!active){old?.remove();return}if(old&&old.dataset.view===view)return;old?.remove();const b=document.createElement('button');b.type='button';b.className='pv-p1-page-action';b.dataset.view=view;b.textContent=label;b.onclick=fn;const top=q('.topbar');if(top){const anchor=qa('button',top).find(x=>/new transaction/i.test(x.textContent||''));if(anchor)top.insertBefore(b,anchor);else top.appendChild(b)}
  }

  let busy=false,queued=false;
  function augment(){if(busy)return;busy=true;try{const v=currentView();if(v.includes('accounts'))accountPage();else if(v.includes('transactions')){q('.pv-p1-page-action')?.remove();transactionPage()}else if(v.includes('bills'))billsPage();else if(v.includes('budget'))budgetPage();else q('.pv-p1-page-action')?.remove()}finally{busy=false}}
  const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;augment()})};
  const ws=q('.workspace')||document.body;new MutationObserver(queue).observe(ws,{childList:true,subtree:true});
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const v=currentView();if(v.includes('accounts')&&/add account/i.test(b.textContent||'')&&!b.classList.contains('pv-p1-page-action')){e.preventDefault();e.stopImmediatePropagation();makeAccount()}if(v.includes('bills')&&/add bill/i.test(b.textContent||'')&&!b.classList.contains('pv-p1-page-action')){e.preventDefault();e.stopImmediatePropagation();makeBill()}},true);
  setTimeout(augment,30);
})();