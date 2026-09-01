/* Customizable Nestlyra Focus modules and read-only Parent Observer Portal. */
(() => {
  const MODULES = [
    {id:'subjects',label:'Subjects',icon:'◫',description:'Subjects, modules and topics'},
    {id:'certifications',label:'Certification Planner',icon:'◇',description:'Certification targets and exam dates'},
    {id:'exams',label:'Exam Planner',icon:'◎',description:'School and competitive exam plans'},
    {id:'mocks',label:'Mock Tests',icon:'◉',description:'Scores, attempts and improvement'},
    {id:'revision',label:'Revision & Mistakes',icon:'↻',description:'Revision queue and mistake log'},
    {id:'assignments',label:'Assignments',icon:'▣',description:'Homework, submissions and grades'},
    {id:'resources',label:'Resource Library',icon:'⌘',description:'Books, courses, links and study tools'},
    {id:'practice',label:'Practice Log',icon:'⚗',description:'Labs, problem sets and practice scores'},
    {id:'projects',label:'Project Planner',icon:'◆',description:'Projects, milestones and completion'},
    {id:'tasks',label:'Tasks',icon:'◷',description:'Daily and scheduled tasks'},
    {id:'calendar',label:'Calendar',icon:'▦',description:'Deadlines, events and today plan'},
    {id:'notes',label:'Notes',icon:'✎',description:'Study and preparation notes'},
    {id:'habits',label:'Habits',icon:'✓',description:'Daily learning habits'},
    {id:'goals',label:'Goals',icon:'⌁',description:'Milestones and progress'},
    {id:'interviews',label:'Interview Prep',icon:'◈',description:'Rounds, dates and preparation'},
    {id:'jobs',label:'Job Tracker',icon:'▤',description:'Applications, JDs and documents'},
    {id:'timer',label:'Study Timer',icon:'◌',description:'Focused study sessions'},
    {id:'groups',label:'Groups',icon:'◎',description:'Private collaboration and group roles',utility:true},
    {id:'settings',label:'Settings',icon:'⚙',description:'Profile, appearance and workspace controls',utility:true},
    {id:'help',label:'Manual & FAQ',icon:'?',description:'Searchable help for every component',utility:true}
  ];

  const PRESETS = {
    school:{label:'School / Child',description:'Learning, homework and healthy routines',modules:['subjects','assignments','resources','tasks','calendar','notes','habits','timer','groups','settings','help']},
    certification:{label:'Certification Preparation',description:'Course progress, exams, practice and revision',modules:['subjects','certifications','mocks','revision','resources','practice','projects','tasks','calendar','notes','timer','groups','settings','help']},
    competitive:{label:'Competitive Exam',description:'Syllabus, mocks, mistakes and timed practice',modules:['subjects','exams','mocks','revision','assignments','resources','practice','tasks','calendar','notes','timer','groups','settings','help']},
    job:{label:'Job Seeker',description:'Applications, interviews, projects and follow-ups',modules:['jobs','interviews','projects','resources','tasks','calendar','notes','goals','timer','groups','settings','help']},
    daily:{label:'Daily Productivity',description:'Tasks, routines, goals, projects and notes',modules:['tasks','calendar','notes','habits','goals','projects','timer','groups','settings','help']},
    custom:{label:'Custom',description:'Choose every visible section yourself',modules:['subjects','tasks','calendar','notes','jobs','timer','groups','settings','help']}
  };

  const DATA_KEYS = ['certifications','examPlans','mockTests','revisionItems','assignments','resources','practiceItems','projects','habits','goals','interviewPrep'];
  const UTILITY_DEFAULTS = ['groups','settings','help'];
  const EXISTING_DEFAULTS = ['subjects','tasks','calendar','notes','jobs','timer',...UTILITY_DEFAULTS];
  const MODULE_CONFIG_VERSION = 2;
  const FIT_VIEWS = new Set(['dashboard','calendar','timer','settings','groups','messages','certifications','exams','mocks','revision','assignments','resources','practice','projects','habits','goals','interviews']);
  const ENTITY_DEFS = {
    certifications:{title:'Certification Planner',subtitle:'Organize certification targets, providers and exam dates',array:'certifications',singular:'certification',fields:[['name','Certification','text','Security+'],['provider','Provider','text','CompTIA'],['examDate','Target exam date','date',''],['status','Status','select',['Planning','Learning','Revision','Booked','Completed']]],meta:item=>[item.provider,item.examDate,item.status].filter(Boolean).join(' · ')},
    exams:{title:'Exam Planner',subtitle:'Plan school, university and competitive examinations',array:'examPlans',singular:'exam plan',fields:[['name','Exam name','text','Final examination'],['category','Exam type','select',['School','University','Competitive','Entrance','Other']],['examDate','Exam date','date',''],['progress','Syllabus progress %','number','0']],meta:item=>[item.category,item.examDate,`${Number(item.progress||0)}% syllabus`].filter(Boolean).join(' · ')},
    mocks:{title:'Mock Tests',subtitle:'Record attempts, scores and what to improve next',array:'mockTests',singular:'mock test',fields:[['name','Test name','text','Mock test 1'],['date','Attempt date','date',''],['score','Score','number','0'],['total','Maximum score','number','100'],['notes','Improvement notes','textarea','']],meta:item=>[item.date,`${Number(item.score||0)} / ${Number(item.total||100)}`].filter(Boolean).join(' · ')},
    revision:{title:'Revision & Mistake Log',subtitle:'Turn weak areas and mistakes into a focused revision queue',array:'revisionItems',singular:'revision item',fields:[['topic','Topic or mistake','text','Network protocols'],['kind','Type','select',['Revision','Mistake','Weak area']],['nextReview','Next review','date',''],['confidence','Confidence','select',['Low','Medium','High']],['notes','What to remember','textarea','']],meta:item=>[item.kind,item.confidence&&`${item.confidence} confidence`,item.nextReview].filter(Boolean).join(' · ')},
    assignments:{title:'Assignments',subtitle:'Track homework, submissions, priorities and grades',array:'assignments',singular:'assignment',fields:[['title','Assignment','text','Complete chapter exercise'],['subject','Subject or area','text','Mathematics'],['dueDate','Due date','date',''],['priority','Priority','select',['Low','Medium','High']],['status','Status','select',['Not started','In progress','Submitted','Graded']],['grade','Grade or result','text','']],meta:item=>[item.subject,item.dueDate,item.status,item.grade].filter(Boolean).join(' · ')},
    resources:{title:'Resource Library',subtitle:'Keep useful books, courses, links and tools in one place',array:'resources',singular:'resource',fields:[['title','Resource title','text','Official study guide'],['type','Resource type','select',['Book','Course','Video','Article','Tool','Website','Other']],['url','Link','url','https://'],['status','Status','select',['Saved','In use','Completed']],['notes','Why it is useful','textarea','']],meta:item=>[item.type,item.status,item.url].filter(Boolean).join(' · ')},
    practice:{title:'Practice Log',subtitle:'Record labs, problem sets, past papers and improvement',array:'practiceItems',singular:'practice entry',fields:[['title','Practice activity','text','Timed practice set'],['category','Type','select',['Lab','Problem set','Past paper','Quiz','Exercise','Other']],['date','Practice date','date',''],['score','Score','number','0'],['total','Maximum score','number','100'],['notes','Mistakes and next action','textarea','']],meta:item=>[item.category,item.date,`${Number(item.score||0)} / ${Number(item.total||100)}`].filter(Boolean).join(' · ')},
    projects:{title:'Project Planner',subtitle:'Plan practical projects, milestones and completion',array:'projects',singular:'project',fields:[['title','Project name','text','Portfolio project'],['area','Area','text','Cybersecurity'],['targetDate','Target date','date',''],['progress','Progress %','number','0'],['status','Status','select',['Planning','Active','Blocked','Completed']],['notes','Milestones and next steps','textarea','']],meta:item=>[item.area,item.targetDate,`${Number(item.progress||0)}% complete`,item.status].filter(Boolean).join(' · ')},
    habits:{title:'Habits',subtitle:'Build consistent daily learning and preparation routines',array:'habits',singular:'habit',fields:[['name','Habit name','text','Study for 30 minutes'],['frequency','Frequency','select',['Daily','Weekdays','Weekly']],['target','Weekly target','number','5']],meta:item=>[item.frequency,`${(item.completedDates||[]).length} check-ins`].filter(Boolean).join(' · ')},
    goals:{title:'Goals',subtitle:'Define milestones and keep progress visible',array:'goals',singular:'goal',fields:[['title','Goal','text','Finish the complete syllabus'],['targetDate','Target date','date',''],['progress','Progress %','number','0'],['notes','Success criteria','textarea','']],meta:item=>[item.targetDate,`${Number(item.progress||0)}% complete`].filter(Boolean).join(' · ')},
    interviews:{title:'Interview Preparation',subtitle:'Prepare every interview round with clear next actions',array:'interviewPrep',singular:'interview plan',fields:[['company','Company','text','Example company'],['role','Role','text','Security Analyst'],['round','Round','select',['Preparation','Recruiter','Technical','Managerial','Final']],['date','Interview date','date',''],['status','Status','select',['Preparing','Scheduled','Completed','Passed','Closed']],['topics','Topics and questions','textarea','']],meta:item=>[item.role,item.round,item.date,item.status].filter(Boolean).join(' · ')}
  };
  const HELP_TARGETS = Object.freeze({dashboard:'dashboard',subjects:'subjects',certifications:'certifications',exams:'exams',mocks:'mocks',revision:'revision',assignments:'assignments',resources:'resources',practice:'practice',projects:'projects',tasks:'tasks',calendar:'calendar',notes:'notes',habits:'habits',goals:'goals',interviews:'interviews',jobs:'jobs',timer:'timer',groups:'groups',settings:'settings',help:'faq'});
  const MODULE_HELP_SECTIONS = [
    ['certifications','C1','Certification Planner','Track a certification from decision to completed exam.',`<ol><li>Add the certification name, provider, target exam date and current stage.</li><li>Move it through Planning, Learning, Revision, Booked and Completed.</li><li>The target date appears in Calendar when both modules are enabled.</li><li>Use Resources, Practice Log and Revision together for preparation evidence.</li></ol>`],
    ['exams','C2','Exam Planner','Organize school, university, entrance and competitive exams.',`<ol><li>Add the exam name, category, date and syllabus progress.</li><li>Update the percentage as preparation advances.</li><li>The exam appears in Calendar and contributes to the relevant preset.</li><li>Use Mock Tests and Revision & Mistakes to record performance, not only the final date.</li></ol>`],
    ['mocks','C3','Mock Test Intelligence','Compare attempts and convert performance into a specific next action.',`<ol><li>Save one record per attempt with date, score, maximum score, duration and section breakdown such as <strong>Networking: 8/10</strong>.</li><li>The trend graph compares every attempt, shows the latest change and identifies the best score.</li><li>Section averages label strong and weak areas and generate the next recommendation automatically.</li><li>Move recurring mistakes into Revision & Mistakes, then repeat the mock under comparable conditions.</li></ol>`],
    ['revision','C4','Revision & Mistakes','Convert weak areas into a review queue.',`<ol><li>Add the topic or mistake and classify it as Revision, Mistake or Weak area.</li><li>Choose the next review date and current confidence.</li><li>After reviewing, update confidence rather than deleting useful history.</li><li>Use the notes field for the rule, method or correction you must remember.</li></ol>`],
    ['assignments','C5','Assignments','Track homework, submissions, priorities and results.',`<ol><li>Add the assignment, subject, due date and priority.</li><li>Move it from Not started to In progress, Submitted and Graded.</li><li>Add the grade or result when returned.</li><li>Active assignment deadlines appear in Calendar while this module is enabled.</li></ol>`],
    ['resources','C6','Resource Library','Save and organize useful learning links.',`<ol><li>Add a title and choose Book, Course, Video, Article, Tool, Website or Other.</li><li>Paste a normal resource URL and use Saved, In use and Completed to control the reading queue.</li><li><strong>Google Drive PDF storage is coming soon.</strong> The button remains disabled until Nestlyra completes Google OAuth verification.</li><li>Standard Google sign-in requests only basic account identity and does not request Drive access.</li></ol>`],
    ['practice','C7','Practice Log','Keep evidence of labs, questions and past-paper work.',`<ol><li>Add the activity and classify it as Lab, Problem set, Past paper, Quiz or Exercise.</li><li>Record date, score and maximum score when applicable.</li><li>Write mistakes and the next action before closing the entry.</li><li>Practice dates appear in Calendar while both modules are enabled.</li></ol>`],
    ['projects','C8','Project Planner','Manage practical work and portfolio milestones.',`<ol><li>Add a project name, area, target date and success notes.</li><li>Update progress and move the status through Planning, Active, Blocked and Completed.</li><li>Use the notes field for milestones and the immediate next step.</li><li>Incomplete target dates appear in Calendar.</li></ol>`],
    ['tasks','C9','Tasks','Plan daily and future actions with clear priorities.',`<ol><li>Create a task with title, subject, priority, date and optional time.</li><li>Use the edit icon to change it later and the check control to complete it.</li><li>Overdue tasks remain visible until completed or deleted.</li><li>Task dates feed Calendar, Today plan, briefing and notifications when enabled.</li></ol>`],
    ['calendar','C10','Calendar','Review all enabled deadlines in Day, Week or Month.',`<ol><li>Use previous, next and Today to change the date range.</li><li>Switch between Day, Week and Month; select a month date to open its timeline.</li><li>Filters independently show tasks, study dates, exams, assignments, practice, projects, events and job follow-ups.</li><li>Select an item to open its own editor. Filters hide records temporarily and never delete them.</li></ol>`],
    ['notes','C11','Notes','Keep methodology, revision and reference text together.',`<ol><li>Create a note and select it from the list.</li><li>Edit the title and content directly; changes stay in the current workspace.</li><li>Use Resource Library for links and Notes for your own working knowledge.</li><li>Deleting a note is permanent, so keep important material in the correct workspace.</li></ol>`],
    ['habits','C12','Habits','Track repeatable routines without turning them into one-time tasks.',`<ol><li>Add the habit, frequency and weekly target.</li><li>Select Mark today after completing it; select again to undo an accidental check-in.</li><li>Use Habits for repetition and Tasks for specific deliverables.</li><li>The Dashboard shows enabled habit progress without exposing private details to groups.</li></ol>`],
    ['goals','C13','Goals','Keep larger outcomes visible above daily tasks.',`<ol><li>Add the goal, target date, progress percentage and success criteria.</li><li>Update progress as milestones are completed.</li><li>Use Projects for structured delivery work and Goals for the final outcome.</li><li>Limited co-edit groups can use separate shared goals; personal goals remain private.</li></ol>`],
    ['interviews','C14','Interview Preparation','Prepare company-specific rounds and follow-up work.',`<ol><li>Add company, role, round, interview date, status and preparation topics.</li><li>Keep one plan per active interview process or important round.</li><li>Use Job Tracker for the application record and Interview Prep for questions and preparation.</li><li>Private interview details are never included in aggregate group progress.</li></ol>`],
    ['timer','C15','Study Timer','Record focused sessions with a preset or custom duration.',`<ol><li>Open the timer and choose 25, 45 or 60 minutes, or enter any custom duration from 1 to 360 minutes.</li><li>Start, pause or reset the current session.</li><li>A completed session is added to activity and Dashboard focused-study time.</li><li>Hiding Study Timer removes its sidebar control but does not erase recorded activity.</li></ol>`]
  ];
  window.trackerManualSections=()=>MODULE_HELP_SECTIONS.map(section=>[...section]);
  window.trackerManualDirectory=()=>[{id:'dashboard',label:'Dashboard'},...MODULES.map(item=>({id:HELP_TARGETS[item.id]||item.id,label:item.label}))];
  window.openSectionHelp=(section,event)=>{event?.stopPropagation?.();setView('help');setTimeout(()=>scrollManual(HELP_TARGETS[section]||section),80)};

  let moduleStateReady = false;
  let parentObserverTab = 'overview';
  let parentObserverSelected = '';
  let parentObserverRows = [];
  let parentObserverTimer = null;
  let inviteCountdownTimer = null;
  let calendarMode = 'month';
  let calendarFilters = new Set(['tasks','study','exams','assignments','practice','projects','events','jobs']);

  const clone = value => structuredClone(value);
  const moduleIds = () => MODULES.map(item => item.id);

  function ensureTrackerState(persist=false) {
    DATA_KEYS.forEach(key => { if (!Array.isArray(state[key])) state[key] = []; });
    if (!state.moduleConfig || !Array.isArray(state.moduleConfig.enabled)) {
      const established = Boolean(state.profile || state.tasks?.length || state.jobApplications?.length || (state.subjects?.length && state.subjects[0]?.id !== 'sample-subject'));
      state.moduleConfig = {version:MODULE_CONFIG_VERSION,preset:established?'custom':'school',enabled:[...(established?EXISTING_DEFAULTS:PRESETS.school.modules)]};
      persist = true;
    }
    if(Number(state.moduleConfig.version||0)<MODULE_CONFIG_VERSION){
      state.moduleConfig.enabled=[...new Set([...state.moduleConfig.enabled,...UTILITY_DEFAULTS])];
      state.moduleConfig.version=MODULE_CONFIG_VERSION;
      persist=true;
    }
    state.moduleConfig.enabled = [...new Set(state.moduleConfig.enabled.filter(id => moduleIds().includes(id)))];
    if (!state.moduleConfig.enabled.length) state.moduleConfig.enabled = ['tasks','calendar'];
    if (!PRESETS[state.moduleConfig.preset]) state.moduleConfig.preset = 'custom';
    moduleStateReady = true;
    if (persist && state.profile) save();
  }

  window.trackerModuleEnabled = id => {
    ensureTrackerState();
    return state.moduleConfig.enabled.includes(id);
  };

  function currentWorkspacePayload() {
    return Object.fromEntries(DATA_KEYS.map(key => [key,clone(state[key]||[])]));
  }

  const baseWorkspaceData = workspaceData;
  workspaceData = () => ({...baseWorkspaceData(),moduleConfig:clone(state.moduleConfig),...currentWorkspacePayload()});

  const baseSwitchWorkspace = window.switchWorkspace;
  window.switchWorkspace = id => {
    const target=state.workspaces.find(item=>item.id===id),targetData=clone(target?.data||{});
    baseSwitchWorkspace(id);
    DATA_KEYS.forEach(key=>{state[key]=Array.isArray(targetData[key])?targetData[key]:[]});
    state.moduleConfig=targetData.moduleConfig?clone(targetData.moduleConfig):{version:MODULE_CONFIG_VERSION,preset:'custom',enabled:[...EXISTING_DEFAULTS]};
    moduleStateReady = false;
    ensureTrackerState(true);
    render();
  };

  const baseSaveWorkspace = window.saveWorkspace;
  window.saveWorkspace = id => {
    const inheritedConfig=clone(state.moduleConfig||{version:MODULE_CONFIG_VERSION,preset:'custom',enabled:[...EXISTING_DEFAULTS]});
    baseSaveWorkspace(id);
    if(!id){DATA_KEYS.forEach(key=>{state[key]=[]});state.moduleConfig=inheritedConfig;const active=state.workspaces.find(item=>item.id===state.activeWorkspace);if(active)active.data=workspaceData()}
    moduleStateReady = false;
    ensureTrackerState(true);
    render();
  };

  const baseDeleteWorkspace=window.deleteWorkspace;
  window.deleteWorkspace=id=>{
    baseDeleteWorkspace(id);
    const active=state.workspaces.find(item=>item.id===state.activeWorkspace),activeData=clone(active?.data||{});
    DATA_KEYS.forEach(key=>{state[key]=Array.isArray(activeData[key])?activeData[key]:[]});
    state.moduleConfig=activeData.moduleConfig?clone(activeData.moduleConfig):{version:MODULE_CONFIG_VERSION,preset:'custom',enabled:[...EXISTING_DEFAULTS]};
    ensureTrackerState(true);render();
  };

  function trackerNavMarkup() {
    ensureTrackerState();
    const enabled = MODULES.filter(item => state.moduleConfig.enabled.includes(item.id) && item.id !== 'timer');
    const main=enabled.filter(item=>!item.utility),utilities=enabled.filter(item=>item.utility);
    const entry=(id,label,icon)=>`<div class="nav-entry" data-nav-entry="${id}"><button class="nav-main" data-view="${id}"><span>${icon}</span><span class="nav-label">${label}</span></button><button class="nav-help" type="button" aria-label="Open ${label} manual" title="${label} help" onclick="openSectionHelp('${id}',event)">?</button></div>`;
    return `${entry('dashboard','Dashboard','⌂')}${main.map(item=>entry(item.id,item.label,item.icon)).join('')}${utilities.length?'<div class="nav-divider"></div>':''}${utilities.map(item=>entry(item.id,item.label,item.icon)).join('')}`;
  }

  function updateTrackerNavigation() {
    nav.innerHTML = trackerNavMarkup();
    nav.querySelectorAll('button[data-view]').forEach(button => button.classList.toggle('active',button.dataset.view===viewName));
    nav.querySelectorAll('.nav-entry').forEach(entry=>entry.classList.toggle('active',entry.dataset.navEntry===viewName));
    sideTimer?.classList.toggle('hidden',!trackerModuleEnabled('timer'));
    analogClock?.classList.toggle('hidden',!trackerModuleEnabled('calendar'));
    quickAdd?.classList.toggle('hidden',!trackerModuleEnabled('tasks'));
    const visible = state.moduleConfig.enabled.map(id=>MODULES.find(item=>item.id===id)?.label).filter(Boolean);
    globalSearch.placeholder = `Search ${visible.slice(0,3).join(', ').toLowerCase()}${visible.length>3?'…':''}`;
  }

  function trackerViewClass() {
    view.classList.remove('fit-view','scroll-view');
    view.classList.add(FIT_VIEWS.has(viewName)?'fit-view':'scroll-view');
    view.dataset.currentView=viewName;
  }

  function trackerStat(label,value,icon) {
    return `<div class="stat"><div class="stat-icon">${icon}</div><div><small>${escapeHtml(label)}</small><strong>${escapeHtml(String(value))}</strong></div></div>`;
  }

  function trackerDashboard() {
    ensureTrackerState();
    const enabled = new Set(state.moduleConfig.enabled);
    const pending = (state.tasks||[]).filter(item=>item.status!=='completed');
    const todayTasks = pending.filter(item=>item.due===today());
    const topicList = enabled.has('subjects')?allTopics():[];
    const stats=[];
    if(enabled.has('subjects'))stats.push(['Subjects',state.subjects.length,'◫'],['Topics complete',topicList.filter(x=>x.status==='completed').length,'✓']);
    if(enabled.has('tasks'))stats.push(['Due today',todayTasks.length,'◷']);
    if(enabled.has('jobs'))stats.push(['Active applications',(state.jobApplications||[]).filter(x=>!jobTerminal(x.status)).length,'▤']);
    if(enabled.has('habits'))stats.push(['Habits today',(state.habits||[]).filter(x=>(x.completedDates||[]).includes(today())).length,'◇']);
    stats.push(['Focused study',`${Math.round((state.activity||[]).reduce((sum,x)=>sum+Number(x.minutes||0),0)/60)}h`,'⌁']);
    const upcomingTopics=topicList.filter(x=>x.status!=='completed'&&x.due>=today()).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,4);
    const plans=[...todayTasks.map(x=>({title:x.title,meta:`Task · ${x.time||'Any time'}`})),...upcomingTopics.filter(x=>x.due===today()).map(x=>({title:x.name,meta:`${x.subject} · topic`}))].slice(0,5);
    const quickModules=MODULES.filter(item=>enabled.has(item.id)&&!['timer'].includes(item.id)).slice(0,6);
    const p=enabled.has('subjects')?overall():Math.round((state.goals||[]).reduce((sum,x)=>sum+Number(x.progress||0),0)/Math.max(1,(state.goals||[]).length));
    return head(`Good ${new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}, ${escapeHtml((state.profile?.name||'Learner').split(' ')[0])}`,'Your personalized Nestlyra Focus workspace at a glance')+
      `<div class="grid stats tracker-stats">${stats.slice(0,4).map(x=>trackerStat(...x)).join('')}</div><div class="tracker-dashboard-grid"><section class="card tracker-progress-card"><div class="card-title"><h3>${enabled.has('subjects')?'Learning progress':'Goal progress'}</h3><span>${state.moduleConfig.preset==='custom'?'Custom workspace':PRESETS[state.moduleConfig.preset].label}</span></div><div class="overview-flex"><div class="progress-ring" style="--p:${p}"><div><strong>${p}%</strong><small>complete</small></div></div><div class="dashboard-module-links">${quickModules.map(item=>`<button onclick="setView('${item.id}')"><span>${item.icon}</span><b>${item.label}</b><small>Open section →</small></button>`).join('')}</div></div></section><section class="card tracker-today-card"><div class="card-title"><h3>Today plan</h3>${enabled.has('calendar')?'<button class="kebab" onclick="setView(\'calendar\')">Calendar →</button>':''}</div>${plans.length?`<div class="briefing-list">${plans.map(item=>`<div><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.meta)}</small></div>`).join('')}</div>`:'<div class="empty compact-empty">Nothing urgent today. Choose a section to plan your next milestone.</div>'}</section></div>`;
  }

  function itemProgress(def,item) {
    if(def.array==='examPlans'||def.array==='goals')return Math.max(0,Math.min(100,Number(item.progress||0)));
    if(def.array==='projects')return Math.max(0,Math.min(100,Number(item.progress||0)));
    if(def.array==='mockTests'||def.array==='practiceItems')return Math.max(0,Math.min(100,Math.round(Number(item.score||0)/Math.max(1,Number(item.total||100))*100)));
    if(def.array==='certifications')return {Planning:10,Learning:45,Revision:75,Booked:90,Completed:100}[item.status]||0;
    if(def.array==='interviewPrep')return {Preparing:25,Scheduled:55,Completed:75,Passed:100,Closed:100}[item.status]||0;
    if(def.array==='revisionItems')return {Low:25,Medium:60,High:100}[item.confidence]||0;
    if(def.array==='assignments')return {'Not started':0,'In progress':45,Submitted:85,Graded:100}[item.status]||0;
    if(def.array==='resources')return {Saved:15,'In use':55,Completed:100}[item.status]||0;
    if(def.array==='habits')return (item.completedDates||[]).includes(today())?100:0;
    return 0;
  }

  function entityTitle(def,item){return item.name||item.topic||item.title||item.company||def.singular}

  function trackerEntityView(kind) {
    const def=ENTITY_DEFS[kind],items=state[def.array]||[],completed=items.filter(item=>itemProgress(def,item)>=100).length;
    return head(def.title,def.subtitle,`<button class="btn primary" onclick="trackerItemModal('${kind}')">+ Add ${escapeHtml(def.singular)}</button>`)+
      `<div class="grid stats entity-stats">${trackerStat('Total',items.length,'▣')}${trackerStat('Complete today',completed,'✓')}${trackerStat('Upcoming',items.filter(item=>(item.examDate||item.date||item.nextReview||item.targetDate||item.dueDate)>=today()).length,'◷')}${trackerStat('Workspace',state.workspaces.find(x=>x.id===state.activeWorkspace)?.name||'Current','◇')}</div><section class="card entity-workbench"><div class="card-title"><h3>${escapeHtml(def.title)}</h3><span>${items.length} record${items.length===1?'':'s'}</span></div><div class="entity-list">${items.length?items.map(item=>`<article class="entity-row"><button class="entity-main" onclick="trackerItemModal('${kind}','${item.id}')"><span class="entity-icon">${MODULES.find(x=>x.id===kind)?.icon||'◇'}</span><span><strong>${escapeHtml(entityTitle(def,item))}</strong><small>${escapeHtml(def.meta(item)||'No details yet')}</small><i><b style="width:${itemProgress(def,item)}%"></b></i></span></button>${kind==='habits'?`<button class="habit-check ${(item.completedDates||[]).includes(today())?'done':''}" onclick="trackerToggleHabit('${item.id}')">${(item.completedDates||[]).includes(today())?'✓ Done today':'Mark today'}</button>`:''}<button class="mini-btn" title="Delete" onclick="trackerDeleteItem('${kind}','${item.id}')">×</button></article>`).join(''):`<div class="empty"><h3>Add your first ${escapeHtml(def.singular)}</h3><p>This section is enabled for this workspace but has no records yet.</p><button class="btn primary" onclick="trackerItemModal('${kind}')">Create one</button></div>`}</div></section>`;
  }

  function fieldMarkup(field,item) {
    const [key,label,type,option]=field,value=item?.[key]??'';
    if(type==='select')return `<label>${label}<select id="trackerField_${key}">${option.map(choice=>`<option ${value===choice?'selected':''}>${choice}</option>`).join('')}</select></label>`;
    if(type==='textarea')return `<label class="full">${label}<textarea id="trackerField_${key}" rows="5" placeholder="${escapeHtml(option||'')}">${escapeHtml(value)}</textarea></label>`;
    return `<label>${label}<input id="trackerField_${key}" type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(option||'')}"></label>`;
  }

  window.trackerItemModal=(kind,id='')=>{
    const def=ENTITY_DEFS[kind],item=(state[def.array]||[]).find(x=>x.id===id);
    modal(`<h2>${item?'Edit':'Add'} ${escapeHtml(def.singular)}</h2><div class="form-grid">${def.fields.map(field=>fieldMarkup(field,item)).join('')}</div><div class="modal-actions"><button class="btn ghost">Cancel</button><button type="button" class="btn primary" onclick="trackerSaveItem('${kind}','${id}')">Save</button></div>`);
  };

  window.trackerSaveItem=(kind,id='')=>{
    const def=ENTITY_DEFS[kind],items=state[def.array],existing=items.find(x=>x.id===id),data={};
    def.fields.forEach(([key,,type])=>{const el=document.querySelector(`#trackerField_${key}`);data[key]=type==='number'?Number(el.value||0):el.value.trim()});
    if(!entityTitle(def,data)?.trim())return toast(`Enter a ${def.singular} name`);
    if(existing)Object.assign(existing,data);else items.unshift({id:uid(),createdAt:new Date().toISOString(),...data,...(kind==='habits'?{completedDates:[]}:{})});
    save();closeModal();render();toast(existing?'Updated':'Added');
  };

  window.trackerDeleteItem=(kind,id)=>{
    const def=ENTITY_DEFS[kind],item=state[def.array].find(x=>x.id===id);
    if(!confirm(`Delete ${entityTitle(def,item)}?`))return;
    state[def.array]=state[def.array].filter(x=>x.id!==id);save();render();toast('Deleted');
  };

  window.trackerToggleHabit=id=>{
    const habit=state.habits.find(x=>x.id===id);habit.completedDates=habit.completedDates||[];
    habit.completedDates=habit.completedDates.includes(today())?habit.completedDates.filter(x=>x!==today()):[...habit.completedDates,today()];
    save();render();
  };

  function trackerModuleSettingsCard() {
    ensureTrackerState();
    const toggles=items=>`<div class="module-toggle-list">${items.map(item=>`<div class="setting-row"><span><strong>${item.icon} ${item.label}</strong><small>${item.description}</small></span><button type="button" class="toggle ${trackerModuleEnabled(item.id)?'on':''}" aria-label="Toggle ${item.label}" onclick="toggleTrackerModule('${item.id}')"></button></div>`).join('')}</div>`;
    return `<section class="card tracker-module-settings"><div class="card-title"><h3>Navigation & modules</h3><span>Per workspace</span></div><p class="task-meta">Choose a ready-made Nestlyra Focus style or build your own. Hidden modules stop appearing in navigation, search, dashboard summaries, reminders and settings, while their saved data remains protected.</p><div class="preset-grid">${Object.entries(PRESETS).map(([key,preset])=>`<button type="button" class="preset-card ${state.moduleConfig.preset===key?'active':''}" onclick="applyTrackerPreset('${key}')"><strong>${preset.label}</strong><small>${preset.description}</small></button>`).join('')}</div><div class="module-setting-group"><h4>Tracker sections</h4>${toggles(MODULES.filter(item=>!item.utility))}</div><div class="module-setting-group"><h4>Access & support</h4>${toggles(MODULES.filter(item=>item.utility))}</div><p class="settings-note"><strong>Settings</strong> and <strong>Manual & FAQ</strong> are enabled by default. If hidden, open Settings from the profile avatar and open a section manual from its sidebar ? button. These choices apply only to <strong>${escapeHtml(state.workspaces.find(x=>x.id===state.activeWorkspace)?.name||'this workspace')}</strong>.</p></section>`;
  }

  window.applyTrackerPreset=key=>{
    const preset=PRESETS[key];if(!preset)return;
    state.moduleConfig={version:MODULE_CONFIG_VERSION,preset:key,enabled:[...preset.modules]};save();sessionStorage.setItem('studyTracker.settings.category','modules');viewName='settings';render();toast(`${preset.label} workspace applied`);
  };

  window.toggleTrackerModule=id=>{
    ensureTrackerState();
    const enabled=new Set(state.moduleConfig.enabled);enabled.has(id)?enabled.delete(id):enabled.add(id);
    state.moduleConfig={version:MODULE_CONFIG_VERSION,preset:'custom',enabled:[...enabled]};save();
    if(viewName===id&&!['settings','help'].includes(id))viewName='dashboard';
    sessionStorage.setItem('studyTracker.settings.category','modules');render();
  };

  function filterDisabledSettings() {
    const grid=document.querySelector('.settings-grid');if(!grid)return;
    [...grid.children].forEach(card=>{
      const title=card.querySelector('h3')?.textContent||'';
      if(/Subjects import/i.test(title))card.classList.remove('module-disabled-setting');
      card.querySelectorAll('.setting-row').forEach(row=>{
        if(/Job Tracker updates/i.test(row.textContent))row.classList.toggle('module-disabled-setting',!trackerModuleEnabled('jobs'));
      });
    });
  }

  function configureModuleBriefing() {
    const briefing=document.querySelector('.briefing');if(!briefing)return;
    const enabled=new Set(state.moduleConfig.enabled),stats=[...briefing.querySelectorAll('.briefing-stats>div')],sections=[...briefing.querySelectorAll('.briefing>section')];
    const removeStat=label=>stats.find(item=>item.querySelector('span')?.textContent===label)?.remove();
    if(!enabled.has('jobs')){removeStat('Job follow-ups');briefing.querySelector('.job-brief')?.remove();briefing.querySelector('[onclick*="jobs"]')?.remove()}
    if(!enabled.has('subjects')){removeStat('Upcoming');sections.find(item=>item.querySelector('h3')?.textContent==='Coming up')?.remove();briefing.querySelectorAll('.briefing-list>div').forEach(item=>{if(/Topic ·/i.test(item.querySelector('small')?.textContent||''))item.remove()})}
    if(!enabled.has('tasks')){removeStat('Overdue');briefing.querySelectorAll('.briefing-list>div').forEach(item=>{if(/Task ·/i.test(item.querySelector('small')?.textContent||''))item.remove()})}
    const todaySection=sections.find(item=>item.querySelector('h3')?.textContent==="Today's plan");
    if(todaySection){const count=todaySection.querySelectorAll('.briefing-list>div').length,todayStat=[...briefing.querySelectorAll('.briefing-stats>div')].find(item=>item.querySelector('span')?.textContent==='Today');if(todayStat)todayStat.querySelector('strong').textContent=count;const badge=todaySection.querySelector('.card-title span');if(badge)badge.textContent=`${count} item${count===1?'':'s'}`;if(!count)todaySection.querySelector('.briefing-list')?.replaceWith(Object.assign(document.createElement('div'),{className:'briefing-empty',textContent:'Nothing planned for today.'}))}
  }

  const baseWelcomeBriefing=welcomeBriefing;
  welcomeBriefing=()=>{baseWelcomeBriefing();configureModuleBriefing()};

  const baseDashboard=dashboard;
  dashboard=trackerDashboard;
  const isoDate = date => {
    const copy=new Date(date);copy.setHours(12,0,0,0);return copy.toISOString().slice(0,10);
  };

  function calendarItems() {
    const items=[];
    if(trackerModuleEnabled('tasks'))(state.tasks||[]).forEach(item=>item.due&&items.push({id:item.id,date:item.due,time:item.time||'',title:item.title,kind:'tasks',label:'Task'}));
    if(trackerModuleEnabled('subjects'))allTopics().forEach(item=>item.due&&items.push({id:item.id,date:item.due,time:'',title:item.name,meta:item.subject,kind:'study',label:'Study'}));
    if(trackerModuleEnabled('calendar'))(state.events||[]).forEach(item=>item.date&&items.push({id:item.id,date:item.date,time:item.time||'',title:item.title,kind:'events',label:'Event',color:item.color}));
    if(trackerModuleEnabled('jobs'))(state.jobApplications||[]).forEach(item=>item.followUpDate&&!jobTerminal(item.status)&&items.push({id:item.id,date:item.followUpDate,time:item.followUpTime||'',title:`Follow up · ${item.company}`,meta:item.jobTitle,kind:'jobs',label:'Job'}));
    if(trackerModuleEnabled('exams'))(state.examPlans||[]).forEach(item=>item.examDate&&items.push({id:item.id,date:item.examDate,time:item.time||'',title:item.name,meta:item.category,kind:'exams',label:'Exam'}));
    if(trackerModuleEnabled('certifications'))(state.certifications||[]).forEach(item=>item.examDate&&items.push({id:item.id,date:item.examDate,time:item.time||'',title:item.name,meta:item.provider,kind:'exams',label:'Exam'}));
    if(trackerModuleEnabled('mocks'))(state.mockTests||[]).forEach(item=>item.date&&items.push({id:item.id,date:item.date,time:item.time||'',title:item.name,meta:'Mock test',kind:'exams',label:'Exam'}));
    if(trackerModuleEnabled('assignments'))(state.assignments||[]).forEach(item=>item.dueDate&&item.status!=='Graded'&&items.push({id:item.id,date:item.dueDate,time:'',title:item.title,meta:item.subject,kind:'assignments',label:'Assignment'}));
    if(trackerModuleEnabled('practice'))(state.practiceItems||[]).forEach(item=>item.date&&items.push({id:item.id,date:item.date,time:'',title:item.title,meta:item.category,kind:'practice',label:'Practice'}));
    if(trackerModuleEnabled('projects'))(state.projects||[]).forEach(item=>item.targetDate&&item.status!=='Completed'&&items.push({id:item.id,date:item.targetDate,time:'',title:item.title,meta:item.area,kind:'projects',label:'Project'}));
    return items.filter(item=>calendarFilters.has(item.kind));
  }

  function calendarFilterMarkup() {
    const filters=[['tasks','Tasks'],['study','Study'],['exams','Exams'],['assignments','Assignments'],['practice','Practice'],['projects','Projects'],['events','Events'],['jobs','Job follow-ups']]
      .filter(([kind])=>kind!=='tasks'||trackerModuleEnabled('tasks'))
      .filter(([kind])=>kind!=='study'||trackerModuleEnabled('subjects'))
      .filter(([kind])=>kind!=='exams'||trackerModuleEnabled('exams')||trackerModuleEnabled('certifications')||trackerModuleEnabled('mocks'))
      .filter(([kind])=>kind!=='assignments'||trackerModuleEnabled('assignments'))
      .filter(([kind])=>kind!=='practice'||trackerModuleEnabled('practice'))
      .filter(([kind])=>kind!=='projects'||trackerModuleEnabled('projects'))
      .filter(([kind])=>kind!=='jobs'||trackerModuleEnabled('jobs'));
    return `<div class="calendar-filters" aria-label="Calendar filters">${filters.map(([kind,label])=>`<button type="button" class="calendar-filter ${kind} ${calendarFilters.has(kind)?'active':''}" aria-pressed="${calendarFilters.has(kind)}" onclick="toggleCalendarFilter('${kind}')"><i></i>${label}</button>`).join('')}</div>`;
  }

  function calendarRangeTitle() {
    if(calendarMode==='month')return calDate.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    if(calendarMode==='day')return calDate.toLocaleDateString(undefined,{day:'numeric',month:'short',weekday:'long',year:'numeric'});
    const start=new Date(calDate),weekday=(start.getDay()+6)%7;start.setDate(start.getDate()-weekday);
    const end=new Date(start);end.setDate(end.getDate()+6);
    if(start.getMonth()===end.getMonth())return `${start.getDate()} – ${end.getDate()} ${end.toLocaleDateString(undefined,{month:'short',year:'numeric'})}`;
    return `${start.toLocaleDateString(undefined,{day:'numeric',month:'short'})} – ${end.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}`;
  }

  function calendarToolbar() {
    return `<div class="nest-calendar-toolbar"><div class="calendar-date-nav"><button class="calendar-arrow" type="button" aria-label="Previous ${calendarMode}" onclick="moveCalendar(-1)">‹</button><strong>${escapeHtml(calendarRangeTitle())}</strong><button class="calendar-arrow" type="button" aria-label="Next ${calendarMode}" onclick="moveCalendar(1)">›</button></div><div class="calendar-view-actions"><div class="calendar-view-tabs" role="group" aria-label="Calendar view">${['day','week','month'].map(mode=>`<button type="button" class="${calendarMode===mode?'active':''}" onclick="setCalendarMode('${mode}')">${mode[0].toUpperCase()+mode.slice(1)}</button>`).join('')}</div><button class="calendar-today" type="button" onclick="calendarToday()">Today</button></div></div>${calendarFilterMarkup()}`;
  }

  function calendarMonthView(items) {
    const y=calDate.getFullYear(),m=calDate.getMonth(),first=new Date(y,m,1,12),offset=(first.getDay()+6)%7,gridStart=new Date(y,m,1-offset,12);
    let cells='';
    for(let index=0;index<42;index++){
      const date=new Date(gridStart);date.setDate(gridStart.getDate()+index);const iso=isoDate(date),dayItems=items.filter(item=>item.date===iso),muted=date.getMonth()!==m;
      cells+=`<button type="button" class="nest-month-day ${muted?'muted':''} ${iso===today()?'today':''}" onclick="calendarSelectDay('${iso}')"><span class="nest-day-number">${date.getDate()}</span><span class="nest-month-items">${dayItems.slice(0,3).map(item=>`<span class="nest-calendar-item ${item.kind}" title="${escapeHtml(item.title)}"><i></i>${escapeHtml(item.time?`${item.time} ${item.title}`:item.title)}</span>`).join('')}${dayItems.length>3?`<small>+${dayItems.length-3} more</small>`:''}</span></button>`;
    }
    return `<div class="nest-month-grid"><div class="nest-month-weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=>`<span>${day}</span>`).join('')}</div><div class="nest-month-days">${cells}</div></div>`;
  }

  function calendarAllDay(items,dateRange) {
    const rows=items.filter(item=>dateRange.includes(item.date)&&!item.time);
    if(!rows.length)return '';
    return `<div class="calendar-all-day"><strong>All day</strong><div>${rows.slice(0,8).map(item=>`<button type="button" class="nest-calendar-item ${item.kind}" onclick="calendarOpenItem('${item.kind}','${item.id}','${item.date}')"><i></i><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.date)}</small></button>`).join('')}${rows.length>8?`<span class="calendar-more">+${rows.length-8} more</span>`:''}</div></div>`;
  }

  function hourLabels() {
    return Array.from({length:24},(_,hour)=>`<span style="grid-row:${hour+1}">${new Date(2000,0,1,hour).toLocaleTimeString(undefined,{hour:'numeric'})}</span>`).join('');
  }

  function timedEvent(item) {
    const [hour,minute]=item.time.split(':').map(Number),top=(hour*56)+(minute||0)/60*56;
    return `<button type="button" class="timeline-event ${item.kind}" style="--event-top:${top}px;${item.color?`--event-color:${item.color};`:''}" onclick="calendarOpenItem('${item.kind}','${item.id}','${item.date}')"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.time)}${item.meta?` · ${escapeHtml(item.meta)}`:''}</small></button>`;
  }

  function calendarDayView(items) {
    const iso=isoDate(calDate),dayItems=items.filter(item=>item.date===iso),timed=dayItems.filter(item=>item.time);
    return `${calendarAllDay(items,[iso])}<div class="calendar-timeline-scroll"><div class="calendar-day-timeline"><div class="calendar-time-axis">${hourLabels()}</div><div class="calendar-day-lane"><div class="calendar-current-line" aria-hidden="true"></div>${timed.map(timedEvent).join('')}</div></div></div>`;
  }

  function calendarWeekView(items) {
    const start=new Date(calDate),weekday=(start.getDay()+6)%7;start.setDate(start.getDate()-weekday);
    const days=Array.from({length:7},(_,index)=>{const date=new Date(start);date.setDate(start.getDate()+index);return date});
    const dates=days.map(isoDate);
    return `${calendarAllDay(items,dates)}<div class="calendar-week-head"><span></span>${days.map(date=>`<button type="button" class="${isoDate(date)===today()?'today':''}" onclick="calendarSelectDay('${isoDate(date)}')"><small>${date.toLocaleDateString(undefined,{weekday:'short'})}</small><strong>${date.getDate()}</strong></button>`).join('')}</div><div class="calendar-timeline-scroll"><div class="calendar-week-timeline"><div class="calendar-time-axis">${hourLabels()}</div>${days.map(date=>{const iso=isoDate(date);return `<div class="calendar-week-lane ${iso===today()?'today':''}">${items.filter(item=>item.date===iso&&item.time).map(timedEvent).join('')}</div>`}).join('')}</div></div>`;
  }

  calendar=()=>{
    const items=calendarItems();
    return head('Calendar','Plan tasks, study, exams, events and follow-ups in one place',`<button class="btn primary" onclick="eventModal('', '${isoDate(calDate)}')">+ Add event</button>`)+`<section class="card nest-calendar ${calendarMode}">${calendarToolbar()}<div class="nest-calendar-body">${calendarMode==='month'?calendarMonthView(items):calendarMode==='week'?calendarWeekView(items):calendarDayView(items)}</div></section>`;
  };

  window.setCalendarMode=mode=>{if(!['day','week','month'].includes(mode))return;calendarMode=mode;render();setTimeout(scrollCalendarToWorkingHours,0)};
  window.calendarToday=()=>{calDate=new Date();render();setTimeout(scrollCalendarToWorkingHours,0)};
  window.moveCalendar=direction=>{if(calendarMode==='month')calDate.setMonth(calDate.getMonth()+direction);else calDate.setDate(calDate.getDate()+direction*(calendarMode==='week'?7:1));render()};
  window.toggleCalendarFilter=kind=>{calendarFilters.has(kind)?calendarFilters.delete(kind):calendarFilters.add(kind);render()};
  window.calendarSelectDay=date=>{calDate=new Date(`${date}T12:00:00`);calendarMode='day';render();setTimeout(scrollCalendarToWorkingHours,0)};
  window.calendarOpenItem=(kind,id,date)=>{if(kind==='tasks')return taskModal(id);if(kind==='events')return eventModal(id,date);if(kind==='jobs')return jobDetails(id);if(['assignments','practice','projects'].includes(kind))return trackerItemModal(kind,id);if(kind==='study'){const topic=allTopics().find(item=>item.id===id);if(topic){selectedSubject=topic.subjectId;viewName='subject';return render()}}if(kind==='exams'){viewName=trackerModuleEnabled('exams')?'exams':trackerModuleEnabled('certifications')?'certifications':'mocks';return render()}calendarDay(date)};
  function scrollCalendarToWorkingHours(){const scroller=document.querySelector('.calendar-timeline-scroll');if(!scroller)return;const now=isoDate(calDate)===today()?Math.max(0,new Date().getHours()-2):7;scroller.scrollTop=now*56}
  const baseCalendarDay=window.calendarDay;
  window.calendarDay=date=>{
    if(trackerModuleEnabled('jobs'))return baseCalendarDay(date);
    const applications=state.jobApplications;state.jobApplications=[];
    try{return baseCalendarDay(date)}finally{state.jobApplications=applications}
  };
  const baseRender=render;
  render=()=>{
    ensureTrackerState();
    const optionalView=MODULES.some(item=>item.id===viewName);
    if(optionalView&&!trackerModuleEnabled(viewName)&&!['settings','help','groups'].includes(viewName))viewName='dashboard';
    const custom=ENTITY_DEFS[viewName];
    updateTrackerNavigation();
    if(viewName==='groups'&&typeof groupsView==='function'){sideStreak.textContent=`${streak()} days`;view.innerHTML=groupsView()}else if(custom){sideStreak.textContent=`${streak()} days`;view.innerHTML=trackerEntityView(viewName)}else baseRender();
    updateTrackerNavigation();trackerViewClass();
    if(viewName==='settings')setTimeout(filterDisabledSettings,80);
  };

  const baseFamilyCards=familySettingsCards;
  familySettingsCards=()=>baseFamilyCards();

  function validFamilyInvite() {
    const now=Date.now();
    familyData.invites=(familyData.invites||[]).filter(invite=>!invite.used&&invite.expiresAt>now).sort((a,b)=>b.expiresAt-a.expiresAt).slice(0,1);
    saveFamily();
    return familyData.invites[0]||null;
  }

  const previousGenerateFamilyCode=window.generateFamilyCode;
  window.generateFamilyCode=async()=>{
    familyData.invites=[];saveFamily();
    await previousGenerateFamilyCode();
    familyData.invites=(familyData.invites||[]).filter(invite=>!invite.used&&invite.expiresAt>Date.now()).slice(-1);
    saveFamily();
    if(isCloudParentSession()){
      const {data}=await sb.from('family_invites').select('id,expires_at,used_at').is('used_at',null).gt('expires_at',new Date().toISOString());
      if((data||[]).length>1)toast('New code shown. Run the single-code database update once to revoke older server codes.');
    }
    renderParentPortal();
  };

  function observerPresence(row) {
    const activity=[...(row.days||[])].sort((a,b)=>String(b.last_seen||b.updated_at||'').localeCompare(String(a.last_seen||a.updated_at||'')))[0];
    const last=activity?.last_seen||activity?.updated_at||row.localLastSeen||'';
    const age=last?Date.now()-new Date(last).getTime():Infinity;
    return {online:age<75000,last,label:age<75000?'Online now':last?`Last seen ${new Date(last).toLocaleString()}`:'Not active yet'};
  }

  function observerCurrent(){return parentObserverRows.find(row=>row.userId===parentObserverSelected)||parentObserverRows[0]}

  window.parentSelectLearner=id=>{parentObserverSelected=id;parentObserverTab='overview';paintParentObserver()};
  window.parentObserverOpen=tab=>{parentObserverTab=tab;paintParentObserver()};

  function inviteMarkup() {
    const invite=validFamilyInvite();
    return `<div class="observer-invite"><div>${invite?`<span>Current linking code</span><strong>${escapeHtml(invite.code)}</strong><small data-invite-expires="${invite.expiresAt}">Valid for a few minutes</small>`:'<span>Connect another learner</span><strong>No active code</strong><small>Generating a new code revokes the previous code.</small>'}</div><button class="btn primary" onclick="generateFamilyCode()">${invite?'Replace code':'Generate linking code'}</button></div>`;
  }

  function startInviteCountdown(){
    clearInterval(inviteCountdownTimer);
    const paint=()=>{const el=document.querySelector('[data-invite-expires]');if(!el)return;const left=Math.max(0,Number(el.dataset.inviteExpires)-Date.now()),m=Math.floor(left/60000),s=Math.floor(left%60000/1000);el.textContent=left?`Expires in ${m}:${String(s).padStart(2,'0')}`:'Expired';if(!left){familyData.invites=[];saveFamily();clearInterval(inviteCountdownTimer);paintParentObserver()}};
    paint();inviteCountdownTimer=setInterval(paint,1000);
  }

  function observerStats(row){
    const entries=(row?.days||[]).map(d=>[d.activity_date,{activeMs:Number(d.active_ms||0),idleMs:Number(d.idle_ms||0),viewChanges:Number(d.view_changes||0),views:d.views||{}}]);
    const current=entries.find(([date])=>date===today())?.[1]||{},week=entries.slice(0,7).reduce((sum,[,day])=>sum+day.activeMs,0),presence=observerPresence(row||{});
    return {entries,current,week,presence};
  }

  function observerOverview(row) {
    const {entries,current,week,presence}=observerStats(row),data=row.data||{},subjects=data.subjects||[],tasks=data.tasks||[],topics=subjects.flatMap(s=>s.modules||[]).flatMap(m=>m.topics||[]),due=tasks.filter(t=>t.status!=='completed'&&t.due<=today()).length;
    return `<div class="grid stats observer-stats">${trackerStat('Active today',formatDuration(current.activeMs),'◷')}${trackerStat('Seven-day focus',formatDuration(week),'⌁')}${trackerStat('Topics complete',topics.filter(t=>t.status==='completed').length,'✓')}${trackerStat('Due / overdue',due,'!')}</div><div class="observer-overview-grid"><section class="card"><div class="card-title"><h3>Current status</h3><span class="presence ${presence.online?'online':''}">${presence.online?'●':'○'} ${escapeHtml(presence.label)}</span></div><div class="observer-summary"><div><small>Subjects</small><strong>${subjects.length}</strong></div><div><small>Tasks</small><strong>${tasks.length}</strong></div><div><small>Screen changes today</small><strong>${current.viewChanges||0}</strong></div></div><p class="settings-note">Online status appears when the learner has internet and Nestlyra Focus synchronized activity within the last 75 seconds.</p></section><section class="card"><div class="card-title"><h3>Recent activity</h3><button class="kebab" onclick="parentObserverOpen('activity')">Details →</button></div><div class="activity-table compact">${entries.slice(0,4).map(([date,day])=>`<div><span>${date}</span><b>${formatDuration(day.activeMs)}</b><small>${day.viewChanges} changes</small></div>`).join('')||'<div class="empty compact-empty">No activity yet.</div>'}</div></section></div>`;
  }

  function observerLearning(row) {
    const data=row.data||{},subjects=data.subjects||[];
    return `<section class="card observer-detail-card"><div class="card-title"><h3>Subjects, modules & topics</h3><span>Read-only observer view</span></div><div class="observer-subjects">${subjects.length?subjects.map(subject=>{const topics=(subject.modules||[]).flatMap(module=>module.topics||[]),complete=topics.filter(topic=>topic.status==='completed').length;return `<details ${subjects.length===1?'open':''}><summary><span><b>${escapeHtml(subject.name)}</b><small>${subject.modules?.length||0} modules · ${complete}/${topics.length} topics complete</small></span><strong>${topics.length?Math.round(complete/topics.length*100):0}%</strong></summary>${(subject.modules||[]).map(module=>`<div class="observer-module"><h4>${escapeHtml(module.name)}</h4>${(module.topics||[]).map(topic=>`<div><span class="topic-state ${topic.status}">${topic.status==='completed'?'✓':topic.status==='in-progress'?'◐':'○'}</span><span>${escapeHtml(topic.name)}</span><small>${topic.due||'No due date'}</small></div>`).join('')||'<p>No topics</p>'}</div>`).join('')}</details>`}).join(''):'<div class="empty">No subjects in this learner workspace.</div>'}</div></section>`;
  }

  function observerPlan(row) {
    const data=row.data||{},tasks=[...(data.tasks||[])].sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')),events=[...(data.events||[])].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
    return `<div class="observer-plan-grid"><section class="card"><div class="card-title"><h3>Tasks</h3><span>${tasks.filter(x=>x.status!=='completed').length} open</span></div><div class="observer-list">${tasks.slice(0,30).map(item=>`<div><span class="topic-state ${item.status}">${item.status==='completed'?'✓':'○'}</span><span><b>${escapeHtml(item.title)}</b><small>${item.due||'No date'} ${item.time||''}</small></span></div>`).join('')||'<div class="empty compact-empty">No tasks.</div>'}</div></section><section class="card"><div class="card-title"><h3>Calendar events</h3><span>${events.length} total</span></div><div class="observer-list">${events.slice(0,30).map(item=>`<div><span class="topic-state">▦</span><span><b>${escapeHtml(item.title)}</b><small>${item.date||'No date'} ${item.time||''}</small></span></div>`).join('')||'<div class="empty compact-empty">No events.</div>'}</div></section></div>`;
  }

  function observerActivity(row) {
    const {entries,current}=observerStats(row);
    return `<div class="observer-plan-grid"><section class="card"><div class="card-title"><h3>Activity history</h3><span>Latest 30 days</span></div><div class="activity-table">${entries.slice(0,30).map(([date,day])=>`<div><span>${date}</span><b>${formatDuration(day.activeMs)}</b><small>${formatDuration(day.idleMs)} idle · ${day.viewChanges} changes</small></div>`).join('')||'<div class="empty compact-empty">No activity yet.</div>'}</div></section><section class="card"><div class="card-title"><h3>Section usage today</h3><span>Focused time only</span></div><div class="usage-bars">${Object.entries(current.views||{}).sort((a,b)=>b[1]-a[1]).map(([name,ms])=>`<div><span>${escapeHtml(name)}</span><div class="bar"><i style="width:${Math.min(100,Math.max(4,ms/(current.activeMs||1)*100))}%"></i></div><b>${formatDuration(ms)}</b></div>`).join('')||'<div class="empty compact-empty">No focused use today.</div>'}</div></section></div>`;
  }

  function observerJobs(row) {
    const jobs=row.data?.jobApplications||[];
    return `<section class="card observer-detail-card"><div class="card-title"><h3>Job applications</h3><span>Read-only</span></div><div class="observer-list">${jobs.map(job=>`<div><span class="job-company-badge">${escapeHtml((job.company||'??').slice(0,2).toUpperCase())}</span><span><b>${escapeHtml(job.jobTitle||'Untitled role')} · ${escapeHtml(job.company||'')}</b><small>${job.status||'Saved'} · ${job.appliedDate||'No date'}${job.followUpDate?` · follow up ${job.followUpDate}`:''}</small></span></div>`).join('')||'<div class="empty compact-empty">No applications.</div>'}</div></section>`;
  }

  function paintParentObserver() {
    document.body.classList.add('parent-mode','parent-observer-mode');
    const row=observerCurrent();if(row)parentObserverSelected=row.userId;
    const data=row?.data||{},enabled=new Set(data.moduleConfig?.enabled||EXISTING_DEFAULTS),tabs=[['overview','Overview'],['learning','Learning'],['plan','Plan'],['activity','Activity']];if(enabled.has('jobs'))tabs.push(['jobs','Jobs']);
    const content=!row?'<div class="empty parent-empty"><h2>No learner linked yet</h2><p>Generate one code and ask a learner to enter it in Settings → Family access.</p></div>':parentObserverTab==='learning'?observerLearning(row):parentObserverTab==='plan'?observerPlan(row):parentObserverTab==='activity'?observerActivity(row):parentObserverTab==='jobs'?observerJobs(row):observerOverview(row);
    view.innerHTML=`<div class="parent-observer-shell"><header class="parent-observer-head"><div><div class="observer-brand"><img src="nestlyra-logo.png" alt=""><span><small>NESTLYRA FOCUS</small><h1>Parent Observer</h1></span></div><p>Read-only visibility across linked learner activity and plans.</p></div><div class="parent-observer-actions"><button class="btn ghost" onclick="loginFaqModal()">Help & FAQ</button>${isCloudParentSession()?'<button class="btn primary" onclick="familyOpenMessaging()">✉ Messages</button>':''}<button class="btn ghost" onclick="familyParentLogout()">Sign out</button></div></header><div class="parent-observer-control"><label>Learner<select onchange="parentSelectLearner(this.value)">${parentObserverRows.map(item=>`<option value="${item.userId}" ${item.userId===parentObserverSelected?'selected':''}>${escapeHtml(item.userName)}</option>`).join('')}</select></label>${inviteMarkup()}</div>${row?`<nav class="observer-tabs">${tabs.map(([id,label])=>`<button class="${parentObserverTab===id?'active':''}" onclick="parentObserverOpen('${id}')">${label}</button>`).join('')}</nav>`:''}<main class="parent-observer-content ${parentObserverTab==='overview'?'fit-parent-view':'scroll-parent-view'}">${content}</main><footer class="parent-observer-footer"><div class="product-credit"><img src="nestlyra-brand-gold.png" alt="Nestlyra"><span><small>Designed & developed by</small><strong>Nestlyra</strong><em>© 2026</em></span></div><div>${row?`<button class="btn danger" onclick="clearLearnerActivity('${row.userId}')">Clear activity history</button> <button class="btn ghost" onclick="unlinkFamilyUser('${row.userId}')">Unlink learner</button>`:''}<button class="btn danger" onclick="familyDeleteParentAccountModal()">Delete Parent account</button></div></footer></div>`;
    startInviteCountdown();
  }

  window.renderParentPortal=async()=>{
    clearTimeout(parentObserverTimer);
    view.innerHTML='<div class="empty">Loading secure Parent Observer…</div>';
    try{
      if(isCloudParentSession()){
        if(!cloudFamilyUser)cloudFamilyUser=await getCloudFamilyUser();if(!cloudFamilyUser)return familyParentLogout();
        const {data:links,error}=await sb.from('family_links').select('learner_id,linked_at').eq('parent_id',cloudFamilyUser.id);if(error)throw error;
        const {data:activeInvites}=await sb.from('family_invites').select('id,expires_at,used_at').is('used_at',null).gt('expires_at',new Date().toISOString());
        if(!(activeInvites||[]).length&&familyData.invites?.length){familyData.invites=[];saveFamily()}
        const ids=(links||[]).map(item=>item.learner_id);let profiles=[],days=[],tracker=[];
        if(ids.length){
          ({data:profiles}=await sb.from('family_profiles').select('user_id,display_name').in('user_id',ids));
          ({data:days}=await sb.from('family_activity').select('*').in('learner_id',ids).order('activity_date',{ascending:false}));
          ({data:tracker}=await sb.from('user_tracker_data').select('user_id,data').in('user_id',ids));
        }
        cloudParentLinks=(links||[]).map(link=>({userId:link.learner_id,userName:profiles?.find(x=>x.user_id===link.learner_id)?.display_name||'Learner',linkedAt:link.linked_at}));
        parentObserverRows=cloudParentLinks.map(link=>({...link,days:(days||[]).filter(day=>day.learner_id===link.userId),data:(tracker||[]).find(item=>item.user_id===link.userId)?.data||{}}));
      }else{
        parentObserverRows=(familyData.links||[]).filter(link=>!familyData.admin||link.parentId===familyData.admin.id).map(link=>{const activity=familyData.activity?.[link.userId]||{};return {...link,days:Object.entries(activity.days||{}).sort((a,b)=>b[0].localeCompare(a[0])).map(([date,day])=>({activity_date:date,active_ms:day.activeMs,idle_ms:day.idleMs,view_changes:day.viewChanges,views:day.views,last_seen:activity.lastSeen})),localLastSeen:activity.lastSeen,data:link.userId===state.profile?.familyUserId?clone(state):{}}});
      }
      if(!parentObserverRows.some(row=>row.userId===parentObserverSelected))parentObserverSelected=parentObserverRows[0]?.userId||'';
      paintParentObserver();
      parentObserverTimer=setTimeout(()=>{if(isParentSession())renderParentPortal()},30000);
    }catch(error){view.innerHTML=`<div class="empty"><h2>Parent Observer could not load</h2><p>${escapeHtml(error.message||'Unknown error')}</p><button class="btn primary" onclick="renderParentPortal()">Try again</button></div>`}
  };

  window.familyOpenLearnerWorkspace=()=>toast('Parent Observer is read-only. Use the Learning, Plan and Activity tabs above.');

  const baseHelpView=helpView;
  helpView=()=>{
    let html=baseHelpView();
    if(html.includes('id="manual-modules"'))return html;
    const section=manualSection('modules','15','Navigation, presets and optional modules','Make each workspace fit a child, learner, exam candidate or job seeker.',`<ul><li>Open <strong>Settings → Navigation & modules</strong>.</li><li>Choose School / Child, Certification Preparation, Competitive Exam, Job Seeker, Daily Planner or Custom.</li><li>Use individual switches to show or hide Subjects, Certification Planner, Exam Planner, Mock Tests, Revision & Mistakes, Tasks, Calendar, Notes, Habits, Goals, Interview Preparation, Job Tracker and Study Timer.</li><li>Dashboard, Settings, the Manual and the floating Messages button remain available.</li><li>Turning a section off never deletes its data. The section also stops contributing to navigation, Dashboard cards, search, briefing and module-specific settings until re-enabled.</li><li>Module choices are stored per workspace, so a certification workspace and a job-search workspace can use different layouts.</li></ul>`);
    html=html.replace('</aside><div class="manual-content">','<button onclick="scrollManual(\'modules\')">Navigation & modules<span>→</span></button></aside><div class="manual-content">');
    return html.replace(/<\/div><\/div>$/,`${section}</div></div>`);
  };

  document.addEventListener('DOMContentLoaded',()=>{
    ensureTrackerState();
    if(typeof MANUAL_ALIASES!=='undefined')Object.assign(MANUAL_ALIASES,{
      certifications:'certification certificate provider exam date booked learning revision',
      exams:'exam planner school university competitive entrance syllabus progress',
      mocks:'mock test attempt score result improvement practice',
      revision:'revision mistake weak area confidence review remember',
      assignments:'assignment homework submission grade due priority subject',
      resources:'resource library book course video article tool website link',
      practice:'practice lab problem set past paper quiz exercise score',
      projects:'project planner portfolio milestone blocked target progress',
      tasks:'task todo priority overdue today future complete edit',
      calendar:'calendar calander day week month date event filter schedule',
      notes:'notes notebook methodology reference editor',
      habits:'habit routine daily weekly check in streak',
      goals:'goal milestone success criteria target progress',
      interviews:'interview company role round recruiter technical preparation',
      timer:'study timer focus pomodoro session minutes activity',
      settings:'settings profile appearance theme voice modules workspace notification',
      modules:'navigation preset school child certification competitive job seeker daily productivity custom hide show'
    });
    const baseSettings=settings;
    settings=()=>baseSettings().replace(/<\/div>$/,trackerModuleSettingsCard()+'</div>');
    if(sessionStorage.getItem('studyTracker.openParentLogin')){
      sessionStorage.removeItem('studyTracker.openParentLogin');
      setTimeout(()=>document.querySelector('[data-auth-mode="parent"]')?.click(),60);
    }
    const oldSearch=document.querySelector('#globalSearch');
    if(oldSearch){
      const fresh=oldSearch.cloneNode(true);oldSearch.replaceWith(fresh);
      fresh.addEventListener('input',event=>{
        const q=event.target.value.trim().toLowerCase();if(q.length<2)return;
        if(trackerModuleEnabled('subjects')){const subject=state.subjects.find(item=>`${item.name} ${item.description}`.toLowerCase().includes(q));if(subject){selectedSubject=subject.id;viewName='subject';return render()}}
        if(trackerModuleEnabled('tasks')&&state.tasks.some(item=>item.title.toLowerCase().includes(q))){viewName='tasks';return render()}
        if(trackerModuleEnabled('notes')&&state.notes.some(item=>`${item.title} ${item.content}`.toLowerCase().includes(q))){viewName='notes';return render()}
        if(trackerModuleEnabled('jobs')){const job=(state.jobApplications||[]).find(item=>`${item.company} ${item.jobTitle} ${item.jobDescription||''}`.toLowerCase().includes(q));if(job){jobQuery=q;viewName='jobs';return render()}}
        const entity=Object.entries(ENTITY_DEFS).find(([kind,def])=>trackerModuleEnabled(kind)&&(state[def.array]||[]).some(item=>Object.values(item).some(value=>String(value).toLowerCase().includes(q))));
        if(entity){viewName=entity[0];render()}
      });
    }
    notifBtn.onclick=()=>{
      const notices=[];
      if(trackerModuleEnabled('tasks'))notices.push(`${state.tasks.filter(item=>item.due<today()&&item.status!=='completed').length} overdue task(s)`);
      if(trackerModuleEnabled('jobs'))notices.push(`${(state.jobApplications||[]).filter(jobDue).length} job follow-up(s)`);
      if(trackerModuleEnabled('revision'))notices.push(`${(state.revisionItems||[]).filter(item=>item.nextReview&&item.nextReview<=today()).length} revision item(s)`);
      toast(notices.some(item=>!item.startsWith('0 '))?notices.join(' · '):'You are all caught up');
    };
    if(state.profile&&!isParentSession())render();
  });
})();
