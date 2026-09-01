/* Nestlyra Focus v42 — stable onboarding, role-aware command centre and
   genuinely distinct work surfaces for every optional tracker module. */
(() => {
  'use strict';

  const MODULES={
    certifications:{array:'certifications',title:'Certification Pathway',subtitle:'Move credentials through evidence-based readiness checkpoints',icon:'◇'},
    exams:{array:'examPlans',title:'Exam Command Board',subtitle:'Control exam countdowns, syllabus coverage and target gaps',icon:'◎'},
    mocks:{array:'mockTests',title:'Mock Test Lab',subtitle:'Compare attempts, expose weak areas and choose the next intervention',icon:'◉'},
    revision:{array:'revisionItems',title:'Revision Queue',subtitle:'A spaced-review workflow ordered by urgency and confidence',icon:'↻'},
    assignments:{array:'assignments',title:'Assignment Flow',subtitle:'Move work from brief to submission and preserve feedback',icon:'▣'},
    resources:{array:'resources',title:'Resource Library',subtitle:'A focused shelf for the material you actually use',icon:'⌘'},
    practice:{array:'practiceItems',title:'Practice Studio',subtitle:'Compare accuracy, effort and practice conditions over time',icon:'⚗'},
    projects:{array:'projects',title:'Project Roadmaps',subtitle:'Protect delivery momentum, milestones and blocker visibility',icon:'◆'},
    habits:{array:'habits',title:'Habit Rhythm',subtitle:'A seven-day consistency board built for repeatable routines',icon:'✓'},
    goals:{array:'goals',title:'Goal Horizon',subtitle:'Forecast pace, deadline risk and the next measurable milestone',icon:'⌁'},
    interviews:{array:'interviewPrep',title:'Interview Pipeline',subtitle:'Prepare each round, capture evidence and improve readiness',icon:'◈'}
  };
  const charts={};
  const h=value=>escapeHtml(String(value??''));
  const clamp=value=>Math.max(0,Math.min(100,Math.round(Number(value)||0)));
  const dateDelta=value=>value?Math.ceil((new Date(`${value}T12:00:00`)-new Date())/86400000):null;
  const dateOffset=delta=>{const d=new Date();d.setDate(d.getDate()+delta);return d.toISOString().slice(0,10)};
  const average=values=>values.length?Math.round(values.reduce((sum,value)=>sum+value,0)/values.length):0;
  const score=item=>clamp(Number(item.score||0)/Math.max(1,Number(item.total||100))*100);
  const items=kind=>state[MODULES[kind].array]||[];
  const label=(kind,item)=>item.name||item.topic||item.title||item.company||MODULES[kind].title;
  const progress=(kind,item)=>{
    if(['mocks','practice'].includes(kind))return score(item);
    if(['exams','projects','goals'].includes(kind))return clamp(item.progress);
    if(kind==='certifications')return clamp(item.readiness||({Planning:10,Learning:45,Revision:75,Booked:90,Completed:100}[item.status]||0));
    if(kind==='revision')return ({Low:25,Medium:60,High:100}[item.confidence]||0);
    if(kind==='assignments')return ({'Not started':0,'In progress':45,Submitted:85,Graded:100}[item.status]||0);
    if(kind==='resources')return ({Saved:20,'In use':60,Completed:100}[item.status]||0);
    if(kind==='habits'){const week=new Set(Array.from({length:7},(_,index)=>dateOffset(-index)));return clamp((item.completedDates||[]).filter(day=>week.has(day)).length/Math.max(1,Number(item.target||1))*100)}
    if(kind==='interviews')return clamp(item.readiness||({Preparing:25,Scheduled:55,Completed:75,Passed:100,Closed:100}[item.status]||0));
    return 0;
  };
  const meta=(kind,item)=>({
    certifications:[item.provider,item.examDate,item.status],exams:[item.category,item.examDate,`${clamp(item.progress)}% syllabus`],mocks:[item.date,`${item.score||0}/${item.total||100}`,item.duration&&`${item.duration} min`],revision:[item.kind,item.confidence,item.nextReview],assignments:[item.subject,item.dueDate,item.priority],resources:[item.type,item.status,item.rating&&`${item.rating}/5`],practice:[item.category,item.date,`${item.score||0}/${item.total||100}`],projects:[item.area,item.targetDate,item.status],habits:[item.frequency,`${item.target||0}× weekly`],goals:[item.targetDate,item.priority,`${clamp(item.progress)}%`],interviews:[item.role,item.round,item.date,item.status]
  }[kind]||[]).filter(Boolean).join(' · ');
  const edit=(kind,item,text='Edit')=>`<button type="button" class="mini-btn record-edit" aria-label="Edit ${h(label(kind,item))}" title="Edit ${h(label(kind,item))}" onclick="trackerItemModal('${kind}','${item.id}')">${text}</button>`;
  const remove=(kind,item)=>`<button type="button" class="mini-btn danger-mini record-delete" aria-label="Delete ${h(label(kind,item))}" title="Delete ${h(label(kind,item))}" onclick="trackerDeleteItem('${kind}','${item.id}')">×</button>`;
  const empty=kind=>`<div class="v42-empty"><span>${MODULES[kind].icon}</span><h3>Add your first record</h3><p>This workspace will calculate useful comparisons as your history grows.</p><button class="btn primary" onclick="trackerItemModal('${kind}')">+ Add record</button></div>`;
  const shell=(kind,body,extra='')=>`<div class="v42-module v42-${kind}">${head(MODULES[kind].title,MODULES[kind].subtitle,`<div class="page-actions">${extra}<button class="btn primary" onclick="trackerItemModal('${kind}')">+ Add</button></div>`)}${body}</div>`;

  function certificationsView(){
    const rows=items('certifications');if(!rows.length)return shell('certifications',`<section class="cert-path card">${empty('certifications')}</section>`);
    const stages=['Planning','Learning','Revision','Booked','Completed'];
    return shell('certifications',`<section class="cert-path card"><div class="cert-stage-line">${stages.map(stage=>`<span><i></i>${stage}<b>${rows.filter(item=>item.status===stage).length}</b></span>`).join('')}</div><div class="cert-cards">${rows.map(item=>{const pct=progress('certifications',item),days=dateDelta(item.examDate);return `<article><div class="v42-ring" style="--p:${pct}"><strong>${pct}%</strong></div><div><small>${h(item.provider||'Credential')}</small><h3>${h(label('certifications',item))}</h3><p>${h(item.nextStep||'Add the next evidence milestone')}</p><span>${days===null?'No exam date':days<0?'Exam date passed':`${days} days to exam`} · ${h(item.status||'Planning')}</span></div><footer>${edit('certifications',item,'Open pathway')}${remove('certifications',item)}</footer></article>`}).join('')}</div></section>`);
  }

  function examsView(){
    const rows=items('exams');if(!rows.length)return shell('exams',`<div class="exam-command">${empty('exams')}</div>`);
    return shell('exams',`<div class="exam-command">${rows.map(item=>{const days=dateDelta(item.examDate),gap=Math.max(0,Number(item.targetScore||0)-clamp(item.progress));return `<article class="card"><header><span>${days===null?'—':days<0?'PAST':days}</span><small>${days===null?'DATE NOT SET':days<0?'EXAM DATE':'DAYS LEFT'}</small></header><main><h3>${h(item.name)}</h3><p>${h(item.category||'Exam')}</p><div class="syllabus-meter"><i style="width:${clamp(item.progress)}%"></i></div><div><b>${clamp(item.progress)}% syllabus</b><span>${gap}% target gap</span></div>${item.weakAreas?`<blockquote>Priority: ${h(item.weakAreas)}</blockquote>`:''}</main><footer>${edit('exams',item)}${remove('exams',item)}</footer></article>`}).join('')}</div>`);
  }

  function parseAreas(text=''){return text.split(/\n|,/).map(part=>{const match=part.trim().match(/^(.+?):\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);return match?{name:match[1].trim(),value:Math.round(Number(match[2])/Math.max(1,Number(match[3]))*100)}:null}).filter(Boolean)}
  function mocksView(){
    const rows=[...items('mocks')].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))),scores=rows.map(score),latest=scores.at(-1)||0,delta=scores.length>1?latest-scores.at(-2):0,areas={};rows.flatMap(item=>parseAreas(item.areaBreakdown||'')).forEach(area=>(areas[area.name]??=[]).push(area.value));const areaRows=Object.entries(areas).map(([name,values])=>({name,value:average(values)})).sort((a,b)=>a.value-b.value);
    setTimeout(()=>drawMockCharts(rows),0);
    const diagnosis=areaRows.length?areaRows.map(area=>`<div><span>${h(area.name)}</span><i><b style="width:${area.value}%"></b></i><strong>${area.value}%</strong></div>`).join(''):`<div class="mock-diagnosis-empty"><span>◎</span><strong>No section scores yet</strong><p>Add scores such as “Networking: 8/10” to identify the weakest area and choose the next revision.</p><button type="button" class="btn ghost" onclick="trackerItemModal('mocks','${rows.at(-1)?.id||''}')">${rows.length?'Add scores to latest attempt':'Create first attempt'}</button></div>`;
    return shell('mocks',`<div class="mock-lab"><section class="card mock-gauge"><div class="card-title"><h3>Current performance</h3><span>${rows.length} attempts</span></div><div class="mock-gauge-body"><canvas id="v42MockDonut"></canvas><div><strong>${latest}%</strong><small class="${delta<0?'negative-delta':delta>0?'positive-delta':''}">${scores.length>1?`${delta>=0?'+':''}${delta}% from previous`:'Add a second attempt to compare'}</small></div></div></section><section class="card mock-trajectory"><div class="card-title"><h3>Score trajectory</h3><span>Attempt by attempt</span></div><canvas id="v42MockLine"></canvas></section><section class="card mock-weakness"><div class="card-title"><h3>Section diagnosis</h3><span>Low score first</span></div>${diagnosis}</section><section class="card mock-ledger"><div class="card-title"><h3>Attempt ledger</h3><span>${rows.length}</span></div>${rows.length?rows.slice().reverse().map(item=>`<article><time>${h(item.date||'No date')}</time><span><strong>${h(item.name)}</strong><small>${h(meta('mocks',item))}</small></span><b>${score(item)}%</b><div class="record-actions">${edit('mocks',item)}${remove('mocks',item)}</div></article>`).join(''):empty('mocks')}</section></div>`);
  }

  function revisionView(){
    const rows=items('revision'),buckets=[['Due now',rows.filter(item=>item.nextReview&&item.nextReview<=today()&&item.confidence!=='High')],['Scheduled',rows.filter(item=>!item.nextReview||item.nextReview>today())],['Mastered',rows.filter(item=>item.confidence==='High')]];
    return shell('revision',`<div class="revision-board">${buckets.map(([title,list])=>`<section class="card"><header><h3>${title}</h3><span>${list.length}</span></header><div>${list.length?list.map(item=>`<article class="confidence-${String(item.confidence||'low').toLowerCase()}"><span>${item.confidence==='High'?'✓':item.kind==='Mistake'?'!':'↻'}</span><button onclick="trackerItemModal('revision','${item.id}')"><strong>${h(label('revision',item))}</strong><small>${h(meta('revision',item))}</small></button>${remove('revision',item)}</article>`).join(''):'<p>Nothing here.</p>'}</div></section>`).join('')}</div>`);
  }

  function assignmentsView(){
    const rows=items('assignments'),columns=['Not started','In progress','Submitted','Graded'];
    return shell('assignments',`<div class="assignment-kanban">${columns.map(status=>`<section><header><span>${status}</span><b>${rows.filter(item=>item.status===status).length}</b></header>${rows.filter(item=>item.status===status).map(item=>`<article class="card"><small>${h(item.subject||'General')} · ${h(item.priority||'Normal')}</small><h3>${h(item.title)}</h3><p>${item.dueDate?`Due ${h(item.dueDate)}`:'No deadline'}${item.grade?` · ${h(item.grade)}`:''}</p><footer>${edit('assignments',item)}${remove('assignments',item)}</footer></article>`).join('')||'<div class="kanban-empty">No work</div>'}</section>`).join('')}</div>`);
  }

  function resourcesView(){
    const rows=items('resources');return shell('resources',rows.length?`<div class="resource-shelves">${['In use','Saved','Completed'].map(status=>`<section><header><h3>${status} shelf</h3><span>${rows.filter(item=>item.status===status).length}</span></header><div>${rows.filter(item=>item.status===status).map(item=>`<article class="card"><span>${({Book:'▥',Course:'▶',Video:'▷',Article:'≡',Tool:'⌘',Website:'↗'})[item.type]||'◇'}</span><div><small>${h(item.type||'Resource')}</small><h3>${h(item.title)}</h3><p>${'★'.repeat(Math.max(0,Math.min(5,Number(item.rating||0))))}${'☆'.repeat(Math.max(0,5-Math.min(5,Number(item.rating||0))))}</p></div><footer>${item.url?`<a class="mini-btn" href="${h(item.url)}" target="_blank" rel="noopener">Open ↗</a>`:''}${edit('resources',item)}${remove('resources',item)}</footer></article>`).join('')||'<p class="shelf-empty">This shelf is empty.</p>'}</div></section>`).join('')}</div>`:`<div class="resource-shelves"><section>${empty('resources')}</section></div>`,'<button class="btn ghost" disabled title="Available after Google OAuth verification">☁ Drive PDF · Coming soon</button>');
  }

  function practiceView(){
    const rows=[...items('practice')].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));setTimeout(()=>drawPracticeChart(rows),0);
    return shell('practice',`<div class="practice-studio"><section class="card practice-chart"><div class="card-title"><h3>Accuracy versus effort</h3><span>${rows.reduce((sum,item)=>sum+Number(item.duration||0),0)} total minutes</span></div><canvas id="v42PracticeLine"></canvas></section><section class="practice-timeline">${rows.length?rows.slice().reverse().map(item=>`<article><time>${h(item.date||'No date')}</time><i></i><div class="card"><header><span>${h(item.category||'Practice')}</span><b>${score(item)}%</b></header><h3>${h(item.title)}</h3><div class="accuracy-bar"><i style="width:${score(item)}%"></i></div><footer><small>${Number(item.duration||0)} minutes</small>${edit('practice',item)}${remove('practice',item)}</footer></div></article>`).join(''):empty('practice')}</section></div>`);
  }

  function projectsView(){
    const rows=items('projects');return shell('projects',rows.length?`<div class="project-roadmaps">${rows.map(item=>`<article class="card status-${String(item.status||'planning').toLowerCase()}"><header><span>${h(item.area||'Project')}</span><b>${h(item.status||'Planning')}</b></header><h3>${h(item.title)}</h3><div class="roadmap-line"><i style="width:${clamp(item.progress)}%"></i><b style="left:${clamp(item.progress)}%"></b></div><div><strong>${clamp(item.progress)}%</strong><span>${item.targetDate?`Target ${h(item.targetDate)}`:'No target date'}</span></div><blockquote>${h(item.nextMilestone||'Define the next milestone')}</blockquote><footer>${edit('projects',item,'Update milestone')}${remove('projects',item)}</footer></article>`).join('')}</div>`:`<div class="project-roadmaps">${empty('projects')}</div>`);
  }

  function habitsView(){
    const rows=items('habits'),days=Array.from({length:7},(_,index)=>dateOffset(index-6));return shell('habits',rows.length?`<section class="habit-grid card"><header><span>Habit</span>${days.map(day=>`<time>${new Date(`${day}T12:00`).toLocaleDateString(undefined,{weekday:'short'})}<b>${day.slice(-2)}</b></time>`).join('')}<span>Rhythm</span></header>${rows.map(item=>`<article><button onclick="trackerItemModal('habits','${item.id}')"><strong>${h(item.name)}</strong><small>${h(item.frequency||'Daily')} · ${item.target||0}× target</small></button>${days.map(day=>`<i class="${(item.completedDates||[]).includes(day)?'done':''}" title="${day}">${(item.completedDates||[]).includes(day)?'✓':'·'}</i>`).join('')}<div class="v42-mini-ring" style="--p:${progress('habits',item)}"><b>${progress('habits',item)}%</b></div>${remove('habits',item)}</article>`).join('')}<footer><button class="btn primary" onclick="trackerToggleHabit('${rows[0].id}')">✓ Check in first habit today</button><small>Open a habit to change its weekly target.</small></footer></section>`:`<section class="habit-grid card">${empty('habits')}</section>`);
  }

  function goalsView(){
    const rows=items('goals');return shell('goals',rows.length?`<div class="goal-horizon">${rows.map(item=>{const days=dateDelta(item.targetDate),pct=clamp(item.progress);return `<article class="card"><div class="goal-orbit" style="--p:${pct}"><span>${MODULES.goals.icon}</span><strong>${pct}%</strong></div><main><small>${h(item.priority||'Normal')} priority</small><h3>${h(item.title)}</h3><p>${h(item.notes||'Add success criteria and the next milestone.')}</p><div class="goal-forecast ${days!==null&&days<0&&pct<100?'risk':''}">${days===null?'No target date':days<0&&pct<100?`${Math.abs(days)} days overdue`:pct>=100?'Outcome reached':`${days} days remaining`}</div></main><footer>${edit('goals',item,'Update outcome')}${remove('goals',item)}</footer></article>`}).join('')}</div>`:`<div class="goal-horizon">${empty('goals')}</div>`);
  }

  function interviewsView(){
    const rows=items('interviews'),stages=['Preparation','Recruiter','Technical','Managerial','Final'];return shell('interviews',`<div class="interview-pipeline">${stages.map(stage=>`<section><header><span>${stage}</span><b>${rows.filter(item=>item.round===stage).length}</b></header>${rows.filter(item=>item.round===stage).map(item=>`<article class="card"><div class="interview-score" style="--p:${progress('interviews',item)}">${progress('interviews',item)}%</div><h3>${h(item.company||'Company')}</h3><p>${h(item.role||'Role')}</p><small>${item.date?h(item.date):'No date'} · ${h(item.status||'Preparing')}</small><blockquote>${h(item.topics||'Add questions and evidence to rehearse.')}</blockquote><footer>${edit('interviews',item,'Prepare')}${remove('interviews',item)}</footer></article>`).join('')||'<div class="pipeline-empty">No rounds</div>'}</section>`).join('')}</div>`);
  }

  const views={certifications:certificationsView,exams:examsView,mocks:mocksView,revision:revisionView,assignments:assignmentsView,resources:resourcesView,practice:practiceView,projects:projectsView,habits:habitsView,goals:goalsView,interviews:interviewsView};

  function moduleSnapshot(id){
    if(id==='subjects'){const all=allTopics(),done=all.filter(item=>item.status==='completed').length;return {label:'Subjects',value:all.length?done/all.length*100:0,total:all.length}}
    if(id==='tasks'){const all=state.tasks||[],done=all.filter(item=>item.status==='completed').length;return {label:'Tasks',value:all.length?done/all.length*100:0,total:all.length}}
    if(id==='jobs'){const all=state.jobApplications||[],advanced=all.filter(item=>['Interview','Offer','Selected'].includes(item.status)).length;return {label:'Job pipeline',value:all.length?advanced/all.length*100:0,total:all.length}}
    if(id==='timer'){const minutes=(state.activity||[]).filter(item=>item.date>=dateOffset(-6)).reduce((sum,item)=>sum+Number(item.minutes||0),0);return {label:'Focus time',value:Math.min(100,minutes/300*100),total:minutes}}
    if(MODULES[id]){const all=items(id);return {label:MODULES[id].title.replace(/ (Pathway|Command Board|Lab|Queue|Flow|Library|Studio|Roadmaps|Rhythm|Horizon|Pipeline)$/,''),value:average(all.map(item=>progress(id,item))),total:all.length}}
    return {label:id,value:0,total:0};
  }
  function dashboardRole(){const preset=state.moduleConfig?.preset||'custom';return ({school:['STUDENT COURSE CONTROL','Course depth, topic completion, deadlines and focused study'],certification:['CERTIFICATION READINESS','Credential evidence, mock performance, revision and exam urgency'],competitive:['EXAM PERFORMANCE CONTROL','Syllabus coverage, mock trajectory, weak areas and practice load'],job:['CAREER PIPELINE CONTROL','Applications, interviews, projects and follow-up discipline'],daily:['DAILY EXECUTION CONTROL','Tasks, habits, goals and protected focus time'],custom:['PERSONAL COMMAND CENTRE','Every visible section contributes using its own readiness criteria']})[preset]||['PERSONAL COMMAND CENTRE','Your enabled sections determine this dashboard'];}
  function dashboardV42(){
    const enabled=(state.moduleConfig?.enabled||[]).filter(id=>!['settings','help','groups'].includes(id)),snapshots=enabled.map(moduleSnapshot),active=snapshots.filter(item=>item.total||item.value),overall=average(active.map(item=>clamp(item.value))),role=dashboardRole(),topics=allTopics(),due=(state.tasks||[]).filter(item=>item.status!=='completed'&&item.due===today()).length,week=(state.activity||[]).filter(item=>item.date>=dateOffset(-6)).reduce((sum,item)=>sum+Number(item.minutes||0),0),focus=active.slice().sort((a,b)=>a.value-b.value)[0];window.v42Dashboard={snapshots,overall};setTimeout(drawDashboard,0);
    return head(`Good ${new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}, ${h((state.profile?.name||'Learner').split(' ')[0])}`,role[1])+`<div class="v42-role"><span>${role[0]}</span><small>Only enabled modules are included</small></div><div class="v42-dashboard"><section class="card v42-overall"><div class="card-title"><h3>Overall readiness</h3><span>Role-aware</span></div><div><canvas id="v42OverallDonut"></canvas><strong>${overall}%</strong></div><p>${focus?`Recommended next focus: <b>${h(focus.label)}</b> (${clamp(focus.value)}%)`:'Add your first records to unlock a recommendation.'}</p></section><section class="card v42-bars"><div class="card-title"><h3>Section progress</h3><span>${enabled.length} enabled</span></div><canvas id="v42ModuleBars"></canvas></section><section class="card v42-line"><div class="card-title"><h3>Seven-day focus</h3><span>${week} minutes</span></div><canvas id="v42FocusLine"></canvas></section><section class="card v42-now"><div class="card-title"><h3>Today</h3><button onclick="setView('calendar')">Calendar →</button></div><div><span><b>${topics.filter(item=>item.status==='completed').length}</b><small>topics complete</small></span><span><b>${due}</b><small>tasks due</small></span><span><b>${Math.round(week/60*10)/10}h</b><small>seven-day focus</small></span></div></section></div>`;
  }

  function chartTheme(){const css=getComputedStyle(document.body);return {accent:css.getPropertyValue('--accent').trim()||'#4c5fd5',muted:css.getPropertyValue('--muted').trim()||'#66708b',line:css.getPropertyValue('--line').trim()||'#dfe4ef'}}
  function resetChart(key){charts[key]?.destroy?.();delete charts[key]}
  function drawDashboard(){
    if(!window.Chart)return;['overall','modules','focus'].forEach(resetChart);const data=window.v42Dashboard||{snapshots:[],overall:0},theme=chartTheme(),usable=data.snapshots.filter(item=>item.total||item.value).slice(0,12),days=Array.from({length:7},(_,index)=>dateOffset(index-6)),minutes=days.map(day=>(state.activity||[]).filter(item=>item.date===day).reduce((sum,item)=>sum+Number(item.minutes||0),0)),common={responsive:true,maintainAspectRatio:false};
    const donut=document.querySelector('#v42OverallDonut');if(donut)charts.overall=new Chart(donut,{type:'doughnut',data:{datasets:[{data:[data.overall,100-data.overall],backgroundColor:[theme.accent,theme.line],borderWidth:0}]},options:{...common,cutout:'78%',plugins:{legend:{display:false},tooltip:{enabled:false}}}});
    const bars=document.querySelector('#v42ModuleBars');if(bars)charts.modules=new Chart(bars,{type:'bar',data:{labels:usable.map(item=>item.label),datasets:[{data:usable.map(item=>clamp(item.value)),backgroundColor:usable.map((_,index)=>index%2?theme.accent:'#20b8a6'),borderRadius:6,maxBarThickness:15}]},options:{...common,indexAxis:'y',scales:{x:{beginAtZero:true,max:100,ticks:{color:theme.muted,font:{size:8}},grid:{color:theme.line}},y:{ticks:{color:theme.muted,font:{size:8}},grid:{display:false}}},plugins:{legend:{display:false}}}});
    const line=document.querySelector('#v42FocusLine');if(line)charts.focus=new Chart(line,{type:'line',data:{labels:days.map(day=>new Date(`${day}T12:00`).toLocaleDateString(undefined,{weekday:'short'})),datasets:[{data:minutes,borderColor:theme.accent,backgroundColor:`${theme.accent}22`,fill:true,tension:.38,pointRadius:2}]},options:{...common,scales:{y:{beginAtZero:true,ticks:{color:theme.muted,font:{size:8}},grid:{color:theme.line}},x:{ticks:{color:theme.muted,font:{size:8}},grid:{display:false}}},plugins:{legend:{display:false}}}});
  }
  function drawMockCharts(rows){
    if(!window.Chart)return;resetChart('mockDonut');resetChart('mockLine');const theme=chartTheme(),scores=rows.map(score),latest=scores.at(-1)||0,common={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}};const donut=document.querySelector('#v42MockDonut');if(donut)charts.mockDonut=new Chart(donut,{type:'doughnut',data:{datasets:[{data:[latest,100-latest],backgroundColor:[theme.accent,theme.line],borderWidth:0}]},options:{...common,cutout:'74%',plugins:{legend:{display:false},tooltip:{enabled:false}}}});const line=document.querySelector('#v42MockLine');if(line)charts.mockLine=new Chart(line,{type:'line',data:{labels:rows.map((item,index)=>item.date||`#${index+1}`),datasets:[{data:scores,borderColor:theme.accent,backgroundColor:`${theme.accent}14`,fill:true,tension:.32,pointRadius:3,pointBackgroundColor:theme.accent}]},options:{...common,scales:{y:{beginAtZero:true,max:100,ticks:{color:theme.muted},grid:{color:theme.line}},x:{ticks:{color:theme.muted},grid:{display:false}}}}});
  }
  function drawPracticeChart(rows){
    if(!window.Chart)return;resetChart('practice');const theme=chartTheme(),canvas=document.querySelector('#v42PracticeLine');if(canvas)charts.practice=new Chart(canvas,{type:'line',data:{labels:rows.map((item,index)=>item.date||`#${index+1}`),datasets:[{label:'Accuracy %',data:rows.map(score),borderColor:'#1e9a79',backgroundColor:'#1e9a7922',fill:true,tension:0,pointRadius:3},{label:'Minutes',data:rows.map(item=>Number(item.duration||0)),borderColor:theme.accent,pointRadius:2,borderDash:[4,4]}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,ticks:{color:theme.muted},grid:{color:theme.line}},x:{ticks:{color:theme.muted},grid:{display:false}}},plugins:{legend:{display:true,position:'bottom',labels:{color:theme.muted,boxWidth:8}}}}});
  }

  window.dashboard=dashboardV42;
  const previousRender=window.render;
  window.render=()=>{previousRender();const painter=views[viewName];if(painter&&document.querySelector('#app:not(.hidden)')){view.innerHTML=painter();view.classList.add('fit-view','v42-fit-view');view.dataset.currentView=viewName}else view.classList.remove('v42-fit-view')};
})();
