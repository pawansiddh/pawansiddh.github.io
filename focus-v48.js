/* PAVENRO Focus v48 — category-aware shell and interaction update. */
(()=>{
  if(window.__PAVENRO_FOCUS_V48__)return;
  window.__PAVENRO_FOCUS_V48__=true;

  const SIDEBAR_KEY='pavenro.focus.sidebar.collapsed.v1';
  const CATEGORY={
    blank:{label:'Blank',theme:'category-blank',color:'#40576b',tag:'Studio Slate',description:'A composed neutral workspace you can shape yourself.',modules:['subjects','calendar']},
    school:{label:'School',theme:'category-school',color:'#235b8e',tag:'Scholar Cobalt',description:'Clear blue structure for subjects and day-to-day learning.',modules:['subjects','assignments','tasks','calendar','notes','habits','groups','timer']},
    business:{label:'Business',theme:'category-business',color:'#87563a',tag:'Warm Earth',description:'Editorial warmth for projects, resources and team goals.',modules:['projects','tasks','calendar','notes','goals','resources','groups']},
    personal:{label:'Personal',theme:'category-personal',color:'#315f46',tag:'Focus Morning',description:'Warm cream, forest ink and calm sage progress.',modules:['tasks','calendar','notes','habits','goals','projects','groups']}
  };
  const THEME_NAMES=['category-blank','category-school','category-business','category-personal','focus-paper'];
  const h=value=>typeof escapeHtml==='function'?escapeHtml(value):String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const q=(selector,root=document)=>root.querySelector(selector);
  const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const moduleOn=id=>typeof trackerModuleEnabled!=='function'||trackerModuleEnabled(id);

  function categoryCards(compact=false){
    const current=state.settings?.focusCategory||'blank';
    return `<div class="focus-category-grid">${Object.entries(CATEGORY).map(([key,item])=>`<button type="button" class="focus-category-card ${current===key?'active':''}" style="--category-color:${item.color}" onclick="applyFocusCategory('${key}')"><i></i><strong>${item.label}</strong><small>${compact?item.description:`${item.description} ${item.modules.filter(id=>id!=='timer').length+1} starter sections.`}</small><em>${item.tag}</em></button>`).join('')}</div>`;
  }

  window.openFocusCategorySetup=()=>{
    if(!state.settings?.categorySetupPending)return;
    window.nestlyraOnboardingActive=true;
    familyCancelBriefing?.();
    modal(`<div class="focus-category-setup"><span class="eyebrow">FIRST WORKSPACE</span><h2>What will you focus on?</h2><p>This only chooses your starting sections and theme. You can change every part later.</p>${categoryCards(true)}<div class="modal-actions"><button type="button" class="btn ghost" onclick="applyFocusCategory('blank')">Start blank</button></div></div>`);
  };

  window.applyFocusCategory=key=>{
    const item=CATEGORY[key];if(!item)return;
    state.settings=state.settings||{};
    state.settings.focusCategory=key;
    state.settings.categorySetupPending=false;
    if(!state.settings.themeManuallyChosen){state.settings.theme=item.theme;rememberAppearance?.(state.settings)}
    state.moduleConfig={version:Math.max(2,Number(state.moduleConfig?.version||0)),preset:'custom',enabled:[...new Set([...item.modules,'settings','help'])]};
    save();
    if(q('#modal')?.open)closeModal();
    render();
    toast(`${item.label} workspace applied`);
    if(!state.settings.walkthroughCompleted)setTimeout(()=>startNestlyraWalkthrough?.(),260);
    else window.nestlyraOnboardingActive=false;
  };

  window.useFocusCategoryTheme=()=>{
    const item=CATEGORY[state.settings?.focusCategory||'blank'];
    state.settings.themeManuallyChosen=false;
    state.settings.theme=item.theme;
    rememberAppearance?.(state.settings);save();render();toast(`${item.label} theme restored`);
  };

  const originalApplyTheme=window.applyTheme;
  window.applyTheme=(useProfile=false)=>{
    document.body.classList.remove(...THEME_NAMES.map(name=>`theme-${name}`));
    originalApplyTheme?.(useProfile);
    const settings=state.settings||{};
    document.body.dataset.focusDensity=settings.density||'comfortable';
    document.body.dataset.focusRadius=settings.radiusStyle||'soft';
    document.body.dataset.focusMotion=settings.motion||'full';
  };
  try{applyTheme=window.applyTheme}catch{}

  window.setTheme=theme=>{
    state.settings.themeManuallyChosen=true;
    updateAppearance('theme',theme);
  };

  function appearanceMarkup(){
    const s=state.settings||{};
    const selectedTheme={cyber:'dark'}[s.theme]||s.theme;
    const themes=[
      ['category-personal','Focus Morning','Warm cream · sage progress','#f6f4ec','#ffffff','#315f46','#8ba26b','#17251c','#eef2e6','Recommended'],
      ['nestlyra','Finance Forest','Forest shell · teal analysis','#f2f5f1','#ffffff','#0f5a3d','#3d6e6e','#102a1d','#0d4b33','Finance reference'],
      ['category-school','Scholar Cobalt','Clear blue · steady attention','#f2f5f9','#ffffff','#235b8e','#7197b8','#14263a','#e9eff6',''],
      ['category-business','Warm Earth','Cream · walnut · muted clay','#f7f3eb','#fffdfa','#87563a','#b58b66','#32271f','#f0e7db',''],
      ['category-blank','Studio Slate','Neutral canvas · precise ink','#f3f5f6','#ffffff','#40576b','#8091a0','#182530','#e9eef1',''],
      ['light','Cloud Teal','Cool white · quiet teal','#f3f6f7','#ffffff','#326173','#7f9aa6','#152a33','#e8f0f2',''],
      ['focus-paper','Linen Study','Linen · olive · editorial ink','#f6f0e5','#fffdf8','#6d6244','#9a8759','#2e2a22','#ece3d3',''],
      ['ocean','Deep Teal','Dark teal · mint signal','#081916','#10241f','#61ad8d','#9ebb6a','#f1f7f3','#06130f',''],
      ['matrix','Evergreen Night','Deep forest · botanical signal','#0b1711','#12251a','#74a57d','#b0bc6e','#f0f7f2','#08120d',''],
      ['dark','Night Focus','Ink navy · sage signal','#0c1321','#131d2d','#7a8fb4','#a6ba68','#f3f6fa','#09101b',''],
      ['auto','Automatic','Morning by day · night after dark','#f1f2ec','#ffffff','#526f5f','#849b70','#17251c','#111c22','System']
    ];
    const category=CATEGORY[s.focusCategory||'blank'];
    return `<div class="appearance-studio">
      <header class="appearance-hero"><div><span class="appearance-kicker">TULSHII VISUAL SYSTEM</span><h3>Appearance</h3><p>Choose a complete color system—not a decorative tint. Each palette keeps surfaces calm, contrast decisive and semantic colors reserved for meaning.</p></div><div class="appearance-quality-rule" aria-label="Professional color balance"><strong>80 / 15 / 5</strong><span>neutral canvas · supporting surface · confident accent</span></div></header>
      <section class="appearance-group"><div class="appearance-section-head"><div><h4>Curated color systems</h4><p>Ten professionally balanced palettes plus automatic day and night mode.</p></div><span>Account saved</span></div><div class="appearance-theme-grid">${themes.map(([name,label,description,bg,panel,accent,secondary,text,sidebar,badge])=>`<button type="button" aria-pressed="${selectedTheme===name}" title="Use ${label}" class="theme-chip ${selectedTheme===name?'active':''}" style="--theme-bg:${bg};--theme-panel:${panel};--theme-accent:${accent};--theme-secondary:${secondary};--theme-text:${text};--theme-sidebar:${sidebar}" onclick="setTheme('${name}')"><span class="theme-preview" aria-hidden="true"><i class="theme-preview-sidebar"></i><i class="theme-preview-top"></i><i class="theme-preview-card theme-preview-card-a"></i><i class="theme-preview-card theme-preview-card-b"></i><i class="theme-preview-chart"></i></span><span class="theme-card-copy"><strong>${label}</strong><small>${description}</small></span><span class="theme-swatches" aria-hidden="true"><i style="background:${text}"></i><i style="background:${accent}"></i><i style="background:${secondary}"></i><i style="background:${bg}"></i></span>${badge?`<em>${badge}</em>`:''}</button>`).join('')}</div></section>
      <div class="category-theme-note"><span><small>${h(category.label)} workspace default</small><strong>${h(category.tag)}</strong><i>Manual choices stay unchanged when sections are enabled or disabled.</i></span><button type="button" class="btn ghost" onclick="useFocusCategoryTheme()">Restore default</button></div>
      <section class="appearance-group"><div class="appearance-section-head"><div><h4>Interface composition</h4><p>Fine-tune readability and information density without changing the palette.</p></div></div><div class="appearance-advanced-grid">
        <label>Text style<select onchange="updateAppearance('fontStyle',this.value)"><option value="modern" ${s.fontStyle==='modern'?'selected':''}>Modern — Inter + Poppins</option><option value="system" ${s.fontStyle==='system'?'selected':''}>System — Segoe UI</option><option value="editorial" ${s.fontStyle==='editorial'?'selected':''}>Editorial — Georgia</option></select></label>
        <label>Text size<select onchange="updateAppearance('textScale',this.value)"><option value="compact" ${s.textScale==='compact'?'selected':''}>Compact</option><option value="normal" ${!s.textScale||s.textScale==='normal'?'selected':''}>Comfortable</option><option value="large" ${s.textScale==='large'?'selected':''}>Large</option></select></label>
        <label>Layout density<select onchange="updateAppearance('density',this.value)"><option value="compact" ${s.density==='compact'?'selected':''}>Compact</option><option value="comfortable" ${!s.density||s.density==='comfortable'?'selected':''}>Comfortable</option><option value="spacious" ${s.density==='spacious'?'selected':''}>Spacious</option></select></label>
        <label>Corner style<select onchange="updateAppearance('radiusStyle',this.value)"><option value="square" ${s.radiusStyle==='square'?'selected':''}>Structured</option><option value="soft" ${!s.radiusStyle||s.radiusStyle==='soft'?'selected':''}>Soft</option><option value="rounded" ${s.radiusStyle==='rounded'?'selected':''}>Rounded</option></select></label>
        <label>Interface motion<select onchange="updateAppearance('motion',this.value)"><option value="full" ${!s.motion||s.motion==='full'?'selected':''}>Full motion</option><option value="reduced" ${s.motion==='reduced'?'selected':''}>Reduced motion</option></select></label>
        <label>Login image framing<select onchange="updateAppearance('loginImagePosition',this.value)"><option value="left" ${s.loginImagePosition==='left'?'selected':''}>Focus left</option><option value="center" ${!s.loginImagePosition||s.loginImagePosition==='center'?'selected':''}>Focus center</option><option value="right" ${s.loginImagePosition==='right'?'selected':''}>Focus right</option></select></label>
      </div></section>
      <section class="appearance-group login-image-settings"><div class="appearance-section-head"><div><h4>Login artwork</h4><p>Keep the branded default or upload a personal background. The image is resized and optimized before saving.</p></div><span>${s.loginImage?'Custom artwork':'Brand default'}</span></div><div class="appearance-login-row"><label>Text overlay<select onchange="updateAppearance('loginImageShade',this.value)"><option value="soft" ${s.loginImageShade==='soft'?'selected':''}>Soft contrast</option><option value="balanced" ${!s.loginImageShade||s.loginImageShade==='balanced'?'selected':''}>Balanced contrast</option><option value="strong" ${s.loginImageShade==='strong'?'selected':''}>Strong contrast</option></select></label><div class="appearance-image-actions"><label class="btn primary appearance-upload">Upload image<input type="file" accept="image/jpeg,image/png,image/webp" onchange="uploadLoginImage(event)"></label><button type="button" class="btn ghost" onclick="resetLoginImage()">Restore brand artwork</button></div></div></section>
    </div>`;
  }
  window.appearanceSettingsMarkup=appearanceMarkup;

  function injectCategorySettings(){
    const card=q('.tracker-module-settings');if(!card||q('.focus-category-settings',card))return;
    const block=document.createElement('div');block.className='focus-category-settings';
    block.innerHTML=`<header><div><h4>Workspace category</h4><p>Category sets first-login modules and theme; every switch below remains editable.</p></div><span class="eyebrow">4 STARTS</span></header>${categoryCards()}`;
    const description=card.querySelector('.task-meta');
    description?.insertAdjacentElement('afterend',block);
  }

  window.openFocusModuleSettings=()=>{
    sessionStorage.setItem('studyTracker.settings.category','modules');
    setView('settings');
    setTimeout(()=>{const card=q('.tracker-module-settings');card?.scrollIntoView({behavior:state.settings?.motion==='reduced'?'auto':'smooth',block:'start'})},120);
  };

  function navLabel(entry){return entry.querySelector('.nav-label')?.textContent.trim()||entry.textContent.trim()}
  function syncNavigation(){
    const navigation=q('#nav');if(!navigation)return;
    q('#focusSearchEntry',navigation)?.remove();q('#focusMoreSections',navigation)?.remove();
    const search=document.createElement('button');search.id='focusSearchEntry';search.type='button';search.className='focus-search-entry';search.title='Search this workspace';search.setAttribute('aria-label','Search this workspace');search.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><span>Search</span>';search.onclick=event=>{event.stopPropagation();toggleSearch()};
    navigation.prepend(search);
    const entries=all('.nav-entry',navigation);
    entries.forEach(entry=>{entry.classList.remove('focus-nav-overflow');entry.style.removeProperty('display');entry.title=navLabel(entry)});
    entries.filter(entry=>['settings','help'].includes(entry.dataset.navEntry)).forEach(entry=>entry.style.setProperty('display','none','important'));
    const more=document.createElement('button');more.id='focusMoreSections';more.type='button';more.className='focus-more-sections';more.title='Navigation & modules';more.innerHTML='<span>＋</span><span>More sections</span>';more.onclick=openFocusModuleSettings;navigation.appendChild(more);
  }

  function setSearch(open){
    const pop=q('#focusSearchPopover');if(!pop)return;
    pop.classList.toggle('open',Boolean(open));pop.setAttribute('aria-hidden',open?'false':'true');
    if(open)setTimeout(()=>q('#globalSearch')?.focus(),40);
  }
  function toggleSearch(){setSearch(!q('#focusSearchPopover')?.classList.contains('open'))}

  function syncTopbar(){
    const host=q('#view'),pageHead=host?.querySelector(':scope > .page-head'),title=q('#topbarTitle'),subtitle=q('#topbarSubtitle'),actions=q('#topbarPageActions');
    actions?.replaceChildren();
    if(pageHead){
      const copy=pageHead.firstElementChild;
      if(title)title.textContent=copy?.querySelector('h1')?.textContent?.trim()||'Focus';
      if(subtitle)subtitle.textContent=copy?.querySelector('p')?.textContent?.trim()||'Your Focus workspace';
      [...pageHead.children].slice(1).forEach(node=>actions?.appendChild(node));
      pageHead.remove();
    }else{
      const active=q('#nav .nav-entry.active .nav-label');
      if(title)title.textContent=active?.textContent?.trim()||String(viewName||'Focus').replace(/(^|-)([a-z])/g,(_,dash,letter)=>(dash?' ':'')+letter.toUpperCase());
      if(subtitle)subtitle.textContent=viewName==='groups'?'Group controls remain available even when hidden from navigation.':'Your Focus workspace';
    }
    document.body.classList.toggle('focus-has-page-action',Boolean(actions?.children.length));
    const quick=q('#quickAdd');if(quick)quick.style.display=actions?.children.length?'none':'';
  }

  function removeDuplicateBranding(){
    all('#app .product-credit,#app .parent-product-credit').forEach(node=>node.remove());
    all('.observer-brand img,.observer-brand small').forEach(node=>node.remove());
  }

  function notificationItems(){
    const items=[];
    if(moduleOn('tasks'))(state.tasks||[]).filter(item=>item.status!=='completed'&&item.due&&item.due<=today()).forEach(item=>items.push({key:`task:${item.id}:${item.due}`,icon:'◷',title:item.title,meta:item.due<today()?`Overdue since ${item.due}`:'Due today',view:'tasks',rank:item.due<today()?0:2}));
    if(moduleOn('subjects'))allTopics().filter(item=>item.status!=='completed'&&item.due&&item.due<=today()).forEach(item=>items.push({key:`topic:${item.id}:${item.due}`,icon:'◫',title:item.name,meta:`${item.subject} · ${item.due<today()?'overdue':'due today'}`,view:'subject',subjectId:item.subjectId,rank:item.due<today()?1:3}));
    if(moduleOn('jobs'))(state.jobApplications||[]).filter(item=>typeof jobDue==='function'&&jobDue(item)).forEach(item=>items.push({key:`job:${item.id}:${item.followUpDate}`,icon:'▤',title:`Follow up with ${item.company}`,meta:item.jobTitle||'Job application',view:'jobs',rank:2}));
    if(moduleOn('revision'))(state.revisionItems||[]).filter(item=>item.nextReview&&item.nextReview<=today()).forEach(item=>items.push({key:`revision:${item.id}:${item.nextReview}`,icon:'↻',title:item.topic||'Revision item',meta:`Review ${item.nextReview<today()?'overdue':'due today'}`,view:'revision',rank:2}));
    if(moduleOn('assignments'))(state.assignments||[]).filter(item=>item.status!=='Graded'&&item.dueDate&&item.dueDate<=today()).forEach(item=>items.push({key:`assignment:${item.id}:${item.dueDate}`,icon:'▣',title:item.title,meta:`Assignment ${item.dueDate<today()?'overdue':'due today'}`,view:'assignments',rank:2}));
    if(moduleOn('calendar'))(state.events||[]).filter(item=>item.date===today()).forEach(item=>items.push({key:`event:${item.id}:${item.date}`,icon:'▦',title:item.title,meta:item.time?`Today at ${item.time}`:'Today · all day',view:'calendar',rank:4}));
    return items.sort((a,b)=>a.rank-b.rank||a.title.localeCompare(b.title)).slice(0,14);
  }

  function notificationSignature(items=notificationItems()){return items.map(item=>item.key).join('|')}
  function paintNotifications(){
    const items=notificationItems(),list=q('#notificationList'),summary=q('#notificationSummary'),dot=q('#notifDot');if(!list)return;
    if(summary)summary.textContent=items.length?`${items.length} item${items.length===1?'':'s'} need attention`:'Nothing needs attention';
    list.innerHTML=items.length?items.map((item,index)=>`<button type="button" class="notification-item" data-notice-index="${index}"><i>${item.icon}</i><span><b>${h(item.title)}</b><small>${h(item.meta)}</small></span><em>›</em></button>`).join(''):'<div class="notification-empty"><div><span>✓</span><strong>You are all caught up</strong><p>No overdue work or follow-ups right now.</p></div></div>';
    const unseen=Boolean(items.length&&state.settings?.notifications!==false&&state.settings?.notificationSeenSignature!==notificationSignature(items));
    dot?.classList.toggle('hidden',!unseen);
    all('[data-notice-index]',list).forEach(button=>button.onclick=()=>{const item=items[Number(button.dataset.noticeIndex)];if(item?.subjectId)selectedSubject=item.subjectId;closeNotifications();if(item)setView(item.view)});
  }
  function setNotifications(open){const panel=q('#notificationPanel'),button=q('#notifBtn');if(!panel)return;panel.classList.toggle('open',Boolean(open));panel.setAttribute('aria-hidden',open?'false':'true');button?.setAttribute('aria-expanded',open?'true':'false');if(open){paintNotifications();state.settings.notificationSeenSignature=notificationSignature();save();q('#notifDot')?.classList.add('hidden')}}
  function closeNotifications(){setNotifications(false)}

  function optionalDetails(title,body,open=false){return `<details class="optional-settings" ${open?'open':''}><summary>${title}</summary><div class="${body.includes('form-grid')?'':'optional-body'}">${body}</div></details>`}
  function hierarchyModuleMarkup(module={}){return `<section class="hierarchy-module" data-hierarchy-module data-module-id="${h(module.id||'')}"><div class="hierarchy-module-head"><input data-hierarchy-module-name value="${h(module.name||'')}" placeholder="Module name"><button type="button" title="Remove module" onclick="this.closest('[data-hierarchy-module]').remove()">×</button></div><textarea data-hierarchy-topics placeholder="One topic per line">${h((module.topics||[]).map(topic=>topic.name).join('\n'))}</textarea></section>`}
  window.addSubjectHierarchyModule=()=>{const host=q('#subjectHierarchyBuilder');if(host)host.insertAdjacentHTML('beforeend',hierarchyModuleMarkup())};

  window.subjectModal=id=>{
    const subject=state.subjects.find(item=>item.id===id),modules=subject?.modules||[];
    modal(`<h2>${subject?'Edit':'Add'} subject</h2><div class="form-grid"><label class="full">Subject name<input id="fName" value="${h(subject?.name||'')}" placeholder="e.g. Mathematics"></label><label>Short icon<input id="fIcon" maxlength="3" value="${h(subject?.icon||'')}" placeholder="MA"></label><label>Subject type<select id="fSubjectType">${['Course','Academic','Certification','Project','Personal','Other'].map(value=>`<option ${subject?.subjectType===value?'selected':''}>${value}</option>`).join('')}</select></label></div>
      ${optionalDetails('Modules & topics (optional)',`<div id="subjectHierarchyBuilder" class="hierarchy-builder">${(modules.length?modules:[{}]).map(hierarchyModuleMarkup).join('')}</div><div class="structure-actions"><small>Add topics one per line. You can also build the hierarchy later.</small><button type="button" class="btn ghost" onclick="addSubjectHierarchyModule()">+ Module</button></div>`,Boolean(modules.length))}
      ${optionalDetails('Additional settings',`<div class="form-grid"><label class="full">Description<input id="fDesc" value="${h(subject?.description||'')}" placeholder="What this subject covers"></label><label>Color<input id="fColor" type="color" value="${subject?.color||'#315f46'}"></label><label>Difficulty<select id="fSubjectDifficulty">${['Not set','Beginner','Intermediate','Advanced'].map(value=>`<option ${subject?.difficulty===value?'selected':''}>${value}</option>`).join('')}</select></label><label>Target date<input id="fSubjectTarget" type="date" value="${h(subject?.targetDate||'')}"></label><label>Weekly study goal<input id="fSubjectWeekly" type="number" min="0" max="80" step="0.5" value="${h(subject?.weeklyHours||'')}" placeholder="Hours"></label></div>`,Boolean(subject?.description||subject?.targetDate||subject?.weeklyHours))}
      <div class="modal-actions">${subject?`<button type="button" class="btn danger" onclick="deleteSubject('${subject.id}')">Delete</button>`:''}<button class="btn ghost">Cancel</button><button type="button" class="btn primary" onclick="saveSubjectV48('${id||''}')">Save subject</button></div>`);
  };

  window.saveSubjectV48=id=>{
    const existing=state.subjects.find(item=>item.id===id),name=q('#fName')?.value.trim();if(!name)return toast('Subject name is required');
    const moduleRows=all('[data-hierarchy-module]');
    const modules=moduleRows.map(row=>{const moduleId=row.dataset.moduleId,old=(existing?.modules||[]).find(item=>item.id===moduleId),moduleName=q('[data-hierarchy-module-name]',row)?.value.trim(),topicNames=(q('[data-hierarchy-topics]',row)?.value||'').split(/\n+/).map(value=>value.trim()).filter(Boolean);if(!moduleName&&!topicNames.length)return null;return{id:old?.id||uid(),name:moduleName||`Module ${(existing?.modules||[]).length+1}`,description:old?.description||'',targetDate:old?.targetDate||'',estimatedHours:old?.estimatedHours||'',topics:topicNames.map((topicName,index)=>{const topic=old?.topics?.[index];return{id:topic?.id||uid(),name:topicName,status:topic?.status||'not-started',due:topic?.due||'',priority:topic?.priority||'Normal',estimatedMinutes:topic?.estimatedMinutes||'',notes:topic?.notes||''}})}}).filter(Boolean);
    const data={name,icon:(q('#fIcon')?.value.trim()||name.slice(0,2)).toUpperCase(),subjectType:q('#fSubjectType')?.value||'Course',description:q('#fDesc')?.value.trim()||'',color:q('#fColor')?.value||'#315f46',difficulty:q('#fSubjectDifficulty')?.value||'Not set',targetDate:q('#fSubjectTarget')?.value||'',weeklyHours:Number(q('#fSubjectWeekly')?.value||0),modules};
    if(existing)Object.assign(existing,data);else state.subjects.push({id:uid(),...data});
    save();closeModal();render();toast(existing?'Subject updated':'Subject created');
  };

  window.moduleModal=(sid,mid='')=>{
    const subject=state.subjects.find(item=>item.id===sid),module=subject?.modules.find(item=>item.id===mid);
    modal(`<h2>${module?'Edit':'Add'} module</h2><label>Module name<input id="fModule" value="${h(module?.name||'')}" placeholder="e.g. Core concepts"></label>${optionalDetails('Topics & additional settings',`<div class="form-grid"><label class="full">Topics<textarea id="fModuleTopics" rows="5" placeholder="One topic per line">${h((module?.topics||[]).map(topic=>topic.name).join('\n'))}</textarea></label><label class="full">Description<input id="fModuleDescription" value="${h(module?.description||'')}"></label><label>Target date<input id="fModuleTarget" type="date" value="${h(module?.targetDate||'')}"></label><label>Estimated hours<input id="fModuleHours" type="number" min="0" step="0.5" value="${h(module?.estimatedHours||'')}"></label></div>`,Boolean(module?.topics?.length||module?.description||module?.targetDate))}<div class="modal-actions">${module?`<button type="button" class="btn danger" onclick="deleteModuleV48('${sid}','${mid}')">Delete</button>`:''}<button class="btn ghost">Cancel</button><button type="button" class="btn primary" onclick="saveModuleV48('${sid}','${mid}')">Save module</button></div>`);
  };
  window.saveModuleV48=(sid,mid='')=>{const subject=state.subjects.find(item=>item.id===sid),existing=subject?.modules.find(item=>item.id===mid),name=q('#fModule')?.value.trim();if(!subject||!name)return toast('Module name is required');const names=(q('#fModuleTopics')?.value||'').split(/\n+/).map(value=>value.trim()).filter(Boolean),data={name,description:q('#fModuleDescription')?.value.trim()||'',targetDate:q('#fModuleTarget')?.value||'',estimatedHours:Number(q('#fModuleHours')?.value||0),topics:names.map((topicName,index)=>{const topic=existing?.topics?.[index];return{id:topic?.id||uid(),name:topicName,status:topic?.status||'not-started',due:topic?.due||'',priority:topic?.priority||'Normal',estimatedMinutes:topic?.estimatedMinutes||'',notes:topic?.notes||''}})};if(existing)Object.assign(existing,data);else subject.modules.push({id:uid(),...data});save();closeModal();render();toast(existing?'Module updated':'Module added')};
  window.deleteModuleV48=(sid,mid)=>{if(!confirm('Delete this module and all its topics?'))return;const subject=state.subjects.find(item=>item.id===sid);subject.modules=subject.modules.filter(item=>item.id!==mid);save();closeModal();render();toast('Module deleted')};

  window.topicModal=(sid,mid,tid='')=>{
    const module=state.subjects.find(item=>item.id===sid)?.modules.find(item=>item.id===mid),topic=module?.topics.find(item=>item.id===tid);
    modal(`<h2>${topic?'Edit':'Add'} topic</h2><label>Topic name<input id="fTopic" value="${h(topic?.name||'')}" placeholder="Topic title"></label>${optionalDetails('Additional settings',`<div class="form-grid"><label>Due date<input id="fDue" type="date" value="${h(topic?.due||'')}"></label><label>Status<select id="fStatus"><option value="not-started" ${!topic||topic.status==='not-started'?'selected':''}>Not started</option><option value="in-progress" ${topic?.status==='in-progress'?'selected':''}>In progress</option><option value="completed" ${topic?.status==='completed'?'selected':''}>Completed</option></select></label><label>Priority<select id="fTopicPriority">${['Low','Normal','High'].map(value=>`<option ${topic?.priority===value?'selected':''}>${value}</option>`).join('')}</select></label><label>Estimated minutes<input id="fTopicMinutes" type="number" min="0" step="5" value="${h(topic?.estimatedMinutes||'')}"></label><label class="full">Notes<textarea id="fTopicNotes" rows="4">${h(topic?.notes||'')}</textarea></label></div>`,Boolean(topic?.due||topic?.notes||topic?.estimatedMinutes))}<div class="modal-actions"><button class="btn ghost">Cancel</button><button type="button" class="btn primary" onclick="saveTopicV48('${sid}','${mid}','${tid}')">Save topic</button></div>`);
  };
  window.saveTopicV48=(sid,mid,tid='')=>{const module=state.subjects.find(item=>item.id===sid)?.modules.find(item=>item.id===mid),existing=module?.topics.find(item=>item.id===tid),name=q('#fTopic')?.value.trim();if(!module||!name)return toast('Topic name is required');const data={name,due:q('#fDue')?.value||'',status:q('#fStatus')?.value||'not-started',priority:q('#fTopicPriority')?.value||'Normal',estimatedMinutes:Number(q('#fTopicMinutes')?.value||0),notes:q('#fTopicNotes')?.value.trim()||''};if(existing)Object.assign(existing,data);else module.topics.push({id:uid(),...data});save();closeModal();render();toast(existing?'Topic updated':'Topic added')};

  function enhanceSubjectHierarchy(){
    if(viewName!=='subject')return;const subject=state.subjects.find(item=>item.id===selectedSubject)||state.subjects[0];if(!subject)return;
    all('.module',q('#view')).forEach((card,index)=>{const module=subject.modules[index],head=card.querySelector('.module-head'),add=head?.querySelector('[onclick*="topicModal"]');if(!module||!head||head.querySelector('.module-edit'))return;const edit=document.createElement('button');edit.type='button';edit.className='btn ghost module-edit';edit.textContent='Edit module';edit.onclick=()=>moduleModal(subject.id,module.id);head.insertBefore(edit,add||null);all('.subtopic-row',card).forEach((row,topicIndex)=>{const topic=module.topics[topicIndex],remove=row.lastElementChild;if(!topic||row.querySelector('.topic-edit'))return;const button=document.createElement('button');button.type='button';button.className='kebab topic-edit';button.title='Edit topic';button.textContent='✎';button.onclick=()=>topicModal(subject.id,module.id,topic.id);row.insertBefore(button,remove)})})
  }

  function syncShell(){
    syncNavigation();syncTopbar();injectCategorySettings();enhanceSubjectHierarchy();removeDuplicateBranding();paintNotifications();
  }

  const baseRender=window.render;
  window.render=()=>{setSearch(false);closeNotifications();baseRender();syncShell()};
  try{render=window.render}catch{}

  function bindChrome(){
    const collapsed=localStorage.getItem(SIDEBAR_KEY)==='1';document.body.classList.toggle('focus-sidebar-collapsed',collapsed);
    const collapse=q('#sidebarCollapse');if(collapse)collapse.onclick=()=>{const next=!document.body.classList.contains('focus-sidebar-collapsed');document.body.classList.toggle('focus-sidebar-collapsed',next);localStorage.setItem(SIDEBAR_KEY,next?'1':'0');collapse.setAttribute('aria-label',next?'Expand navigation':'Collapse navigation');collapse.title=next?'Expand navigation':'Collapse navigation'};
    const notification=q('#notifBtn');if(notification)notification.onclick=event=>{event.stopPropagation();setNotifications(!q('#notificationPanel')?.classList.contains('open'));setSearch(false)};
    const notificationClose=q('#notificationClose');if(notificationClose)notificationClose.onclick=closeNotifications;
    const mobileSearch=q('#mobileSearchBtn');if(mobileSearch)mobileSearch.onclick=event=>{event.stopPropagation();toggleSearch();closeNotifications()};
    document.addEventListener('click',event=>{if(!event.target.closest('#notificationPanel,#notifBtn'))closeNotifications();if(!event.target.closest('#focusSearchPopover,#focusSearchEntry,#mobileSearchBtn'))setSearch(false)},true);
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeNotifications();setSearch(false)}});
    applyTheme();syncShell();
    if(state.settings?.categorySetupPending&&q('#app:not(.hidden)'))setTimeout(openFocusCategorySetup,90);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bindChrome,0),{once:true});else setTimeout(bindChrome,0);
  const focusUpdateApi={version:'48',categories:CATEGORY,refresh:syncShell};
  if(['localhost','127.0.0.1'].includes(location.hostname))focusUpdateApi.getState=()=>state;
  window.TULSHII_FOCUS_UPDATE=focusUpdateApi;
  window.PAVENRO_FOCUS_UPDATE=focusUpdateApi;
})();
