/* TULSHII Focus device-only edition. Cloud surfaces are intentionally absent. */
(() => {
  window.PAVENRO_OFFLINE = true;
  document.body.classList.add('offline-mode');

  const stripCloudModules = () => {
    if (typeof state === 'undefined') return;
    state.moduleConfig = state.moduleConfig || {};
    if (Array.isArray(state.moduleConfig.enabled)) state.moduleConfig.enabled = state.moduleConfig.enabled.filter(id => !['groups','messages'].includes(id));
  };

  const baseSave = window.save;
  if (typeof baseSave === 'function') window.save = save = function offlineSave(){stripCloudModules();return baseSave()};

  const basePreset = window.applyTrackerPreset;
  if (typeof basePreset === 'function') window.applyTrackerPreset = key => {basePreset(key);stripCloudModules();baseSave?.()};

  const baseToggle = window.toggleTrackerModule;
  if (typeof baseToggle === 'function') window.toggleTrackerModule = id => ['groups','messages'].includes(id) ? toast('Groups and messaging are available in the online edition') : baseToggle(id);

  const baseSetView = window.setView;
  if (typeof baseSetView === 'function') window.setView = (name, options) => baseSetView(['groups','messages'].includes(name) ? 'dashboard' : name, options);

  const offlineCard = () => `<section class="card offline-storage-card"><div class="card-title"><h3>Offline data & privacy</h3><span>Device only</span></div><p class="task-meta">This edition opens directly and never contacts TULSHII, Google, Supabase or another server. Your workspace stays in this browser's local storage.</p><div class="offline-data-grid"><div><strong>No account required</strong><small>Open the HTML file and start planning—there is no login, email, password or PIN.</small></div><div><strong>No background network</strong><small>Charts, modules, themes and the manual are bundled in this file.</small></div><div><strong>Your backup matters</strong><small>Export subjects regularly. Browser data can be lost if site storage is cleared.</small></div></div></section>`;
  const offlineProfileCard = () => `<section class="card"><div class="card-title"><h3>Workspace identity</h3><span>Local</span></div><div class="setting-row"><span>Display name</span><strong>${escapeHtml(state.profile?.name||'My Workspace')}</strong></div><p class="task-meta">This name personalizes the dashboard on this device. It is not an online account.</p><div class="modal-actions"><button class="btn primary" onclick="profileModal()">Edit display name</button></div></section>`;
  const offlineResetCard = () => `<section class="card"><div class="card-title"><h3>Local data control</h3><span>Device only</span></div><p class="task-meta">Reset this browser's TULSHII Focus workspace, settings, activity and locally attached files. This cannot be undone.</p><div class="modal-actions"><button class="btn danger" onclick="resetOfflineDataModal()">Reset all local data</button></div></section>`;
  const scrubAccountSettings = html => html
    .replace(/<section class="card"><div class="card-title"><h3>Profile & security<\/h3>[\s\S]*?<\/section>/,'')
    .replace(/<section class="card"><div class="card-title"><h3>Account control<\/h3>[\s\S]*?<\/section>/,'')
    .replace('User & app settings','Workspace & app settings')
    .replace('Your complete account and application control center','Your device-only workspace and application controls');
  const baseSettings = window.settings;
  if (typeof baseSettings === 'function') window.settings = settings = () => scrubAccountSettings(baseSettings()).replace(/<\/div>\s*$/, `${offlineProfileCard()}${offlineResetCard()}${offlineCard()}</div>`);

  const SETTINGS_CATEGORY_KEY='studyTracker.offline.settings.category.v1';
  window.enhanceSettingsNavigation = () => {
    const grid=document.querySelector('.settings-grid');
    if(!grid||grid.closest('.settings-shell'))return;
    const cards=[...grid.children];
    const appearanceCard=cards.find(card=>/^Appearance$/i.test(card.querySelector('h3')?.textContent.trim()||''));
    if(appearanceCard&&typeof appearanceSettingsMarkup==='function')appearanceCard.innerHTML=appearanceSettingsMarkup();
    const categoryFor=title=>{
      if(/Navigation & modules/i.test(title))return'modules';
      if(/Workspace identity/i.test(title))return'profile';
      if(/Workspace control/i.test(title))return'workspaces';
      if(/^Appearance$/i.test(title))return'appearance';
      if(/Sound & notifications/i.test(title))return'notifications';
      if(/Daily briefing/i.test(title))return'briefing';
      if(/Voice & accessibility/i.test(title))return'voice';
      if(/Activity privacy|Offline data & privacy/i.test(title))return'privacy';
      if(/import|export|Local data control/i.test(title))return'data';
      return'profile';
    };
    [...grid.children].forEach(card=>card.dataset.settingCategory=categoryFor(card.querySelector('h3')?.textContent.trim()||''));
    const definitions=[
      ['profile','Workspace identity','♙'],['modules','Navigation & modules','☷'],['appearance','Appearance','◐'],
      ['notifications','Notifications','♢'],['briefing','Daily briefing','☀'],['voice','Voice & accessibility','◖'],
      ['workspaces','Workspaces','▦'],['privacy','Offline privacy','◇'],['data','Import, export & reset','⇄']
    ];
    const categories=definitions.filter(([key])=>[...grid.children].some(card=>card.dataset.settingCategory===key));
    const shell=document.createElement('div');shell.className='settings-shell';
    const aside=document.createElement('aside');aside.className='settings-sidebar card';
    aside.innerHTML=`<label class="settings-search">⌕<input placeholder="Search settings" aria-label="Search settings"></label><nav>${categories.map(([key,label,icon])=>`<button type="button" data-setting-nav="${key}"><span>${icon}</span>${label}</button>`).join('')}</nav>`;
    grid.parentNode.insertBefore(shell,grid);shell.append(aside,grid);
    const showCategory=key=>{
      const selected=categories.some(([candidate])=>candidate===key)?key:categories[0]?.[0]||'profile';
      sessionStorage.setItem(SETTINGS_CATEGORY_KEY,selected);
      aside.querySelectorAll('[data-setting-nav]').forEach(button=>button.classList.toggle('active',button.dataset.settingNav===selected));
      [...grid.children].forEach(card=>card.classList.toggle('setting-hidden',card.dataset.settingCategory!==selected));
    };
    aside.querySelectorAll('[data-setting-nav]').forEach(button=>button.onclick=()=>{aside.querySelector('input').value='';showCategory(button.dataset.settingNav)});
    aside.querySelector('input').oninput=event=>{
      const query=event.target.value.trim().toLowerCase();
      if(!query)return showCategory(aside.querySelector('[data-setting-nav].active')?.dataset.settingNav||'profile');
      [...grid.children].forEach(card=>card.classList.toggle('setting-hidden',!card.textContent.toLowerCase().includes(query)));
    };
    showCategory(sessionStorage.getItem(SETTINGS_CATEGORY_KEY)||'profile');
  };

  const section = (id, number, title, summary, body, open=false) => manualSection(id, number, title, summary, body, open);
  window.helpView = helpView = () => head('Offline manual & FAQ','Complete guidance for every device-only TULSHII Focus component',`<button class="btn ghost" onclick="startNestlyraWalkthrough()">Start walkthrough</button>`)+
    `<section class="card manual-start"><div><span class="eyebrow">100% DEVICE-ONLY</span><h2>Your full Focus workspace, without a server.</h2><p>Open the HTML and begin immediately. No account, activation or internet connection is required.</p></div><div class="manual-steps"><button onclick="scrollManual('setup')"><b>1</b><span>Open workspace</span></button><button onclick="scrollManual('subjects')"><b>2</b><span>Choose modules</span></button><button onclick="scrollManual('planning')"><b>3</b><span>Plan work</span></button><button onclick="scrollManual('backup')"><b>4</b><span>Protect data</span></button></div></section>`+
    `<label class="manual-search">⌕ <input aria-label="Search the offline manual" placeholder="Search subjects, mocks, calendar, jobs, backup…" oninput="filterManual(this.value)"></label>`+
    `<div class="manual-layout"><aside class="card manual-nav"><strong>Manual contents</strong>${[['setup','Local setup'],['dashboard','Dashboard'],['subjects','Subjects'],['planning','Tasks & calendar'],['intelligence','Exams & practice'],['organize','Notes & planning'],['jobs','Job Tracker'],['timer','Timer & voice'],['settings','Settings & modules'],['backup','Import, export & backup'],['faq','Offline FAQ']].map(([id,label])=>`<button onclick="scrollManual('${id}')">${label}<span>→</span></button>`).join('')}</aside><div class="manual-content">`+
    `<div class="offline-manual-callout"><span>✓</span><div><strong>No internet is required after download.</strong><p>Groups, messaging, Google sign-in, Supabase sync, parent monitoring, live presence and Drive uploads are not included because they require a server or another account.</p></div></div>`+
    section('setup','01','Open your local workspace','The downloaded file opens directly with no login or activation.',`<ol><li>Open the HTML file in a modern browser such as Chrome, Edge, Firefox or Safari.</li><li>Your first workspace and sample course are ready immediately.</li><li>The sample course demonstrates five modules with five topics each. Edit or delete it when ready.</li><li>Refreshing the file returns to your last open section. Use a separate browser profile when the computer is shared.</li></ol>`,true)+
    section('dashboard','02','Adaptive Dashboard','See one-page progress based only on the modules you enabled.',`<ul><li>Dashboard cards summarize workspace progress, completed topics, work due today and seven-day focus.</li><li>Bar, circular and line charts recalculate from Subjects, Mock Tests, Practice, Jobs, Goals and the other enabled modules.</li><li>The recommended focus card identifies the enabled area with the weakest readiness.</li><li>Hide an unused module in Settings; it then disappears from navigation and Dashboard calculations without deleting its data.</li></ul>`)+
    section('subjects','03','Subjects, modules and topics','Build a course hierarchy and measure completion accurately.',`<ol><li>Create a subject, then open it to add modules and topics.</li><li>Assign topic dates and move each topic through Not started, In progress and Completed.</li><li>Subject progress is calculated from completed topics, while module progress keeps weak areas visible.</li><li>Subject import/export is selective: choose one or several subjects; unrelated workspace data is never included.</li></ol>`)+
    section('planning','04','Tasks and Calendar','Turn deadlines into a usable day, week and month plan.',`<ul><li>Tasks store priority, date, time and completion state.</li><li>Calendar combines enabled task, subject, exam, assignment, practice, project, custom event and job follow-up dates.</li><li>Use Day for a time line, Week for workload balance and Month for long-range planning.</li><li>Calendar filters temporarily hide categories and never delete the underlying records.</li></ul>`)+
    section('intelligence','05','Certification, exams, mocks and practice','Use a different tracking model for every preparation type.',`<ul><li><strong>Certification Planner:</strong> target, provider, exam date, current stage and readiness.</li><li><strong>Exam Planner:</strong> syllabus coverage, target score, deadlines and weak chapters.</li><li><strong>Mock Tests:</strong> circular latest score, line trend, attempt-to-attempt change, best score and section weaknesses.</li><li><strong>Revision & Mistakes:</strong> confidence, review dates and recurring-error queue.</li><li><strong>Assignments and Practice:</strong> deadline health, scores, duration and improvement evidence.</li></ul>`)+
    section('organize','06','Resources, notes, projects, habits and goals','Keep supporting material and longer outcomes structured.',`<ul><li>Resource Library stores books, courses and optional web links. Opening a web link naturally requires internet, but saving and organizing it does not.</li><li>Notes hold your own revision and reference text.</li><li>Projects track progress, blockers and milestones; Goals track outcome and target date.</li><li>Habits record repeated check-ins instead of one-time tasks.</li><li>Interview Prep stores company, round, date, status and preparation topics.</li></ul>`)+
    section('jobs','07','Job Application Tracker','Preserve application evidence after the original vacancy disappears.',`<ol><li>Save company, role, platform, status, follow-up, contact and original link.</li><li>Paste the full job description or attach a PDF, DOCX or TXT JD. Add resume and cover-letter files when useful.</li><li>Attachments remain in this browser through IndexedDB; they are never uploaded by the offline edition.</li><li>Search, filter and sort applications, then export the visible list to CSV.</li></ol>`)+
    section('timer','08','Focus Timer, briefing and voice','Record focused sessions and configure how your day starts.',`<ul><li>Choose 25, 45 or 60 minutes, or enter a custom duration from 1 to 360 minutes.</li><li>Completed sessions update activity and Dashboard focus charts.</li><li>The daily briefing can show overdue work, today's plan, upcoming topics and Job Tracker follow-ups.</li><li>Choose among the voices installed by your browser/device. Available male and female voices vary by operating system.</li></ul>`)+
    section('settings','09','Settings, appearance and modules','Shape each workspace without changing the application architecture.',`<ul><li>Choose a prepared School, Certification, Competitive Exam, Job Seeker or Daily Productivity module set, or build a custom set.</li><li>Switch theme, typography and text density. Upload a profile photo for the upper-right workspace button.</li><li>Create separate workspaces for different courses, careers or planning cycles.</li><li>Groups and messaging are absent from this device-only edition.</li></ul>`)+
    section('backup','10','Import, export and data safety','Local-first means you control the only copy.',`<ul><li>Subject export downloads only selected subjects, modules and topics as JSON.</li><li>Import validates that same JSON structure and adds it to the current workspace.</li><li>Job Tracker has a separate CSV export.</li><li>Files attached to applications live in browser storage and are not part of subject JSON.</li><li>Clearing browser data, using private browsing, moving the HTML to another browser profile, or resetting local data can remove your workspace. Keep regular exports of anything important.</li></ul>`)+
    section('faq','11','Offline FAQ','Answers to the most important device-only questions.',`<div class="faq-list"><details open><summary>Is this the same architecture as online Focus?</summary><p>Yes. It uses the production dashboard, subjects, module navigation, calendar, analytics, timer, settings and local data model. Server-dependent surfaces are removed.</p></details><details><summary>Why are Groups and messages missing?</summary><p>Those features connect multiple people and therefore require authenticated cloud storage and real-time communication.</p></details><details><summary>Can I move this file to another computer?</summary><p>The HTML can move, but browser localStorage and IndexedDB do not travel inside it. Export your subjects and CSV records separately.</p></details><details><summary>Do profile voices work without internet?</summary><p>Yes when the selected voice is installed locally. The exact voice names available are controlled by the browser and operating system.</p></details><details><summary>What does Reset all local data do?</summary><p>It removes this browser's workspace, settings, activity and local attachments, then immediately opens a fresh sample workspace. It does not affect any online account because this edition has none.</p></details></div>`)+
    `</div></div>`;

  window.profileModal = () => modal(`<h2>Workspace identity</h2><div class="form-grid"><label class="full">Display name<input id="fProfileName" maxlength="60" value="${escapeHtml(state.profile?.name||'My Workspace')}"></label></div><p class="task-meta">This name is stored only in this browser. It is not an account or sign-in credential.</p><div class="modal-actions"><button class="btn ghost">Cancel</button><button type="button" class="btn primary" onclick="saveProfile()">Save display name</button></div>`);
  window.saveProfile = () => {
    state.profile=state.profile||{};
    state.profile.name=field('fProfileName').value.trim()||'My Workspace';
    delete state.profile.email;delete state.profile.pin;
    save();avatar.textContent=state.profile.name[0].toUpperCase();closeModal();render();toast('Display name updated');
  };

  const clearAttachmentDatabase = () => new Promise(resolve => {
    if(!window.indexedDB)return resolve();
    try{const request=indexedDB.deleteDatabase('studyTrackerFiles');request.onsuccess=request.onerror=request.onblocked=()=>resolve()}catch{resolve()}
  });
  window.resetOfflineDataModal = () => modal(`<h2>Reset all local data?</h2><p>This permanently removes this browser's workspaces, settings, activity and locally attached files. The downloaded HTML file remains available.</p><label>Type <strong>RESET</strong> to confirm<input id="resetConfirm" autocomplete="off" placeholder="RESET"></label><div class="modal-actions"><button class="btn ghost">Cancel</button><button type="button" class="btn danger" onclick="resetOfflineData()">Reset all local data</button></div>`);
  window.resetOfflineData = async () => {
    if(field('resetConfirm').value!=='RESET')return toast('Type RESET to confirm');
    familyStopVoice?.();
    for(const key of Object.keys(localStorage))if(/^studyTracker\./.test(key))localStorage.removeItem(key);
    for(const key of Object.keys(sessionStorage))if(/^studyTracker\./.test(key))sessionStorage.removeItem(key);
    await clearAttachmentDatabase();
    state=structuredClone(seed);state.profile={name:'My Workspace'};state.settings.categorySetupPending=false;
    selectedSubject=state.subjects[0]?.id||'';selectedNote=state.notes[0]?.id;viewName='dashboard';
    if(typeof familyData!=='undefined')familyData=loadFamily();
    save();closeModal();showApp();toast('Local data reset. A fresh workspace is ready.');
  };
  window.deleteAccountModal = window.resetOfflineDataModal;
  window.deleteAccount = window.resetOfflineData;

  const makeBrandLocal = () => {
    if(typeof document==='undefined'||!document.body)return;
    document.querySelectorAll('[data-tulshii-wordmark]').forEach(image => {image.src=window.TULSHII_WORDMARK_DATA; image.removeAttribute('data-tulshii-wordmark')});
    document.querySelectorAll('img[src$="tulshii-wordmark.svg"]').forEach(image => image.src=window.TULSHII_WORDMARK_DATA);
    const topActions=document.querySelector('.top-actions');
    if(topActions&&!topActions.querySelector('.offline-badge')) topActions.insertAdjacentHTML('afterbegin','<span class="offline-badge">Offline edition</span>');
  };

  const observer = new MutationObserver(makeBrandLocal);
  observer.observe(document.body,{subtree:true,childList:true});
  addEventListener('pagehide',()=>observer.disconnect(),{once:true});
  stripCloudModules();
  document.addEventListener('DOMContentLoaded',()=>{stripCloudModules();makeBrandLocal();state.profile=state.profile||{name:'My Workspace'};delete state.profile.email;delete state.profile.pin;baseSave?.();render()});
  makeBrandLocal();
})();
