(()=>{
if(window.__TULSHII_DECISION_ENGINE_R1__)return;window.__TULSHII_DECISION_ENGINE_R1__=1;
const KEY='tulshii.finance.decisions.r1';
const N=v=>Number(String(v??0).replace(/[^0-9.-]/g,''))||0;
const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return {decisions:Array.isArray(x.decisions)?x.decisions:[]}}catch(_){return{decisions:[]}}};
const DB=load(),persist=()=>localStorage.setItem(KEY,JSON.stringify(DB));
function core(){return window.__PV_FIN_STATE__||window.state||window.S||{}}
function rows(names){const s=core();for(const n of names)if(Array.isArray(s?.[n]))return s[n];return[]}
function val(x,names){for(const n of names)if(x&&x[n]!=null)return N(x[n]);return 0}
function snapshot(){
 const s=core(),accounts=rows(['accounts','a']),transactions=rows(['transactions','txns','t']),income=rows(['income','incomes']),goals=rows(['goals','funds']),debts=rows(['debts','debt']);
 const cash=accounts.reduce((z,x)=>z+val(x,['balance','currentBalance','amount','value']),0);
 const monthlyIncome=income.reduce((z,x)=>z+val(x,['monthly','amount','value']),0)||N(s.monthlyIncome||s.income);
 let monthlySpend=N(s.monthlyExpenses||s.expenses);
 if(!monthlySpend&&transactions.length){const now=new Date(),ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;monthlySpend=transactions.filter(x=>String(x.date||x.createdAt||'').startsWith(ym)&&!['income','credit','transfer'].includes(String(x.type||'').toLowerCase())).reduce((z,x)=>z+Math.abs(val(x,['amount','value'])),0)}
 const debt=debts.reduce((z,x)=>z+val(x,['remaining','balance','amount','currentBalance']),0);
 const goalMonthly=goals.reduce((z,x)=>z+val(x,['monthlyContribution','monthly','contribution']),0);
 const surplus=monthlyIncome-monthlySpend-goalMonthly;
 const runway=monthlySpend>0?cash/monthlySpend:null;
 return {cash,monthlyIncome,monthlySpend,goalMonthly,surplus,debt,runway};
}
function payment(principal,apr,months){principal=N(principal);apr=N(apr);months=Math.max(1,N(months));const r=apr/1200;if(!r)return principal/months;return principal*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1)}
function evaluate(input={}){const b=snapshot(),price=N(input.price),down=N(input.downPayment),loan=Math.max(0,N(input.loanAmount)||price-down),months=Math.max(1,N(input.termMonths)||60),apr=N(input.apr),emi=loan?payment(loan,apr,months):0,running=N(input.monthlyRunningCost),incomeDelta=N(input.monthlyIncomeDelta),expenseDelta=N(input.monthlyExpenseDelta),oneTime=N(input.oneTimeCost)||down,monthlyImpact=emi+running+expenseDelta-incomeDelta,newCash=b.cash-oneTime,newSpend=b.monthlySpend+emi+running+expenseDelta,newIncome=b.monthlyIncome+incomeDelta,newSurplus=newIncome-newSpend-b.goalMonthly,newDebt=b.debt+loan,newRunway=newSpend>0?newCash/newSpend:null,totalInterest=Math.max(0,emi*months-loan);
 const risk=(newSurplus<0||newRunway!=null&&newRunway<3)?'HIGH':(newRunway!=null&&newRunway<6||b.surplus>0&&newSurplus<b.surplus*.5)?'MEDIUM':'LOW';
 return {baseline:b,scenario:{cash:newCash,monthlyIncome:newIncome,monthlySpend:newSpend,surplus:newSurplus,debt:newDebt,runway:newRunway},loan:{principal:loan,emi,totalInterest,months,apr},impact:{cash:newCash-b.cash,surplus:newSurplus-b.surplus,debt:newDebt-b.debt,runway:newRunway==null||b.runway==null?null:newRunway-b.runway},risk};
}
function createDecision(data={}){const d={id:uid('decision'),title:data.title||'New decision',type:data.type||'custom',status:'comparing',createdAt:new Date().toISOString(),scenarios:[],selectedScenarioId:null,notes:data.notes||''};DB.decisions.unshift(d);persist();return d}
function addScenario(decisionId,data={}){const d=DB.decisions.find(x=>x.id===decisionId);if(!d)throw Error('Decision not found');const sc={id:uid('scenario'),name:data.name||`Scenario ${String.fromCharCode(65+d.scenarios.length)}`,input:{...data},result:evaluate(data),createdAt:new Date().toISOString()};d.scenarios.push(sc);persist();return sc}
function selectScenario(decisionId,scenarioId){const d=DB.decisions.find(x=>x.id===decisionId);if(!d)return null;if(!d.scenarios.some(x=>x.id===scenarioId))return null;d.selectedScenarioId=scenarioId;d.status='decided';d.decidedAt=new Date().toISOString();persist();return d}
function removeDecision(id){DB.decisions=DB.decisions.filter(x=>x.id!==id);persist()}
window.TulshiiDecisionEngine={version:'r1',snapshot,evaluate,payment,list:()=>DB.decisions,createDecision,addScenario,selectScenario,removeDecision,save:persist,storageKey:KEY};
document.documentElement.dataset.tulshiiDecisionEngine='r1';window.dispatchEvent(new CustomEvent('tulshii:decision-engine-ready'));
})();