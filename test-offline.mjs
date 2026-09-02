import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM, VirtualConsole} from 'jsdom';

const html=fs.readFileSync(new URL('./tulshii-focus-offline.html',import.meta.url),'utf8');
assert.ok(html.length>450_000,'Offline edition must bundle the production application, not a simplified shell');
assert.equal((html.match(/<script\b[^>]+src=/gi)||[]).length,0,'Offline HTML must not load external scripts');
assert.equal((html.match(/<link\b[^>]+href="https?:/gi)||[]).length,0,'Offline HTML must not load external styles or fonts');
assert.doesNotMatch(html,/supabaseUrl:'https:/,'Offline bundle must not include the production Supabase endpoint');
assert.doesNotMatch(html,/serviceWorker\.register/,'A downloaded file must not attempt service-worker registration');
assert.doesNotMatch(html,/id="(?:authScreen|loginForm|loginName|loginPin|googleLoginBtn|createLearnerAccountBtn)"/,'Offline bundle must not contain login or account creation UI');
assert.match(html,/body\.offline-mode canvas \{display:block;width:100%!important;max-width:100%\}/,'Offline canvases must stay centered inside narrow cards');
assert.doesNotMatch(html,/Google Drive sync is planned|driveFileId\?'Google Drive'/,'Offline workflows must not advertise unavailable Drive synchronization');

const browserErrors=[],networkCalls=[];
const virtualConsole=new VirtualConsole();
virtualConsole.on('jsdomError',error=>{
  if(!/navigation|not implemented: HTMLCanvasElement/i.test(error.message)){browserErrors.push(error.message);console.error(error.detail?.stack||error.stack||error.message)}
});

const context=()=>({
  setTransform(){},clearRect(){},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},arc(){},closePath(){},fillRect(){},fillText(){},
  set fillStyle(value){this._fillStyle=value},get fillStyle(){return this._fillStyle},set strokeStyle(value){this._strokeStyle=value},get strokeStyle(){return this._strokeStyle},
  set lineWidth(value){this._lineWidth=value},set globalAlpha(value){this._globalAlpha=value},set font(value){this._font=value},set textAlign(value){this._textAlign=value},set textBaseline(value){this._textBaseline=value}
});

const dom=new JSDOM(html,{
  url:'https://offline.tulshii.invalid/tulshii-focus-offline.html',
  runScripts:'dangerously',
  pretendToBeVisual:true,
  virtualConsole,
  beforeParse(window){
    window.structuredClone=globalThis.structuredClone;
    window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
    window.confirm=()=>true;window.alert=()=>{};
    window.fetch=(...args)=>{networkCalls.push(args);return Promise.reject(Error('Network disabled in offline test'))};
    window.XMLHttpRequest=class{open(){networkCalls.push(['xhr'])}send(){throw Error('Network disabled')}};
    window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
    window.speechSynthesis={cancel(){},speak(){},getVoices:()=>[]};
    window.AudioContext=class{constructor(){this.currentTime=0;this.destination={}}createOscillator(){return{frequency:{value:0},connect(){},start(){},stop(){}}}createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}};
    window.BroadcastChannel=class{postMessage(){}close(){}};
    window.URL.createObjectURL=()=>"blob:offline-test";window.URL.revokeObjectURL=()=>{};
    window.HTMLCanvasElement.prototype.getContext=function(){return context()};
    window.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({width:520,height:260,top:0,left:0,right:520,bottom:260});
    window.HTMLElement.prototype.scrollIntoView=function(){};
    window.HTMLDialogElement.prototype.showModal=function(){this.open=true;this.setAttribute('open','')};
    window.HTMLDialogElement.prototype.close=function(){this.open=false;this.removeAttribute('open');this.dispatchEvent(new window.Event('close'))};
  }
});

const {window}=dom,{document}=window;
const wait=(ms=30)=>new Promise(resolve=>setTimeout(resolve,ms));
await new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
await wait(80);

assert.equal(document.title,'TULSHII Focus');
assert.equal(document.body.classList.contains('offline-mode'),true);
assert.equal(window.PAVENRO_OFFLINE,true);
assert.equal(document.querySelector('#authScreen'),null,'Offline edition must not have an authentication screen');
assert.equal(document.querySelector('#loginForm'),null,'Offline edition must not ask for a name, email, password or PIN');
assert.equal(document.querySelector('#floatingMessages'),null,'Messaging launcher must not exist offline');
assert.ok(document.querySelector('img[data-tulshii-wordmark]')===null,'Embedded TULSHII wordmark must hydrate without a file dependency');
assert.equal(document.querySelector('#app').classList.contains('hidden'),false,'Offline workspace must open immediately without authentication');
assert.equal(window.eval('state.profile.name'),'My Workspace','First launch must create a device-only workspace identity');
window.finishNestlyraWalkthrough?.();
document.querySelector('#modalClose')?.click();
await wait(80);
assert.ok(document.querySelector('#v42OverallDonut'),'Offline Dashboard must use the production circular chart');
assert.ok(document.querySelector('#v42ModuleBars'),'Offline Dashboard must use the production module bar chart');
assert.ok(document.querySelector('#v42FocusLine'),'Offline Dashboard must use the production focus line chart');
assert.equal([...document.querySelectorAll('#nav button')].some(button=>/Groups|Messages/i.test(button.textContent)),false,'Cloud-only navigation must be removed');
assert.ok(document.querySelector('#focusMoreSections'),'The sidebar must retain the More sections entry');
assert.ok(document.querySelector('.topbar-streak #sideStreak'),'Study streak must remain in the top navigation');
assert.equal(document.querySelector('#sideTimer').classList.contains('hidden'),true,'The separate Study Timer tile must stay hidden');
document.querySelector('#analogClock').click();await wait(40);
assert.equal(window.eval('viewName'),'timer','The remaining sidebar clock must open Study Timer');
assert.ok(document.querySelector('.v37-timer'),'Study Timer must retain the full custom-duration interface');
document.querySelector('#customTimerMinutes').value='33';window.setCustomTimer();await wait(40);
assert.match(document.querySelector('#timerDisplay').textContent,/33:00/,'Custom timer duration must apply');

for(const module of ['certifications','exams','mocks','revision','assignments','resources','practice','projects','habits','goals','interviews','jobs','settings','help']){
  if(!window.trackerModuleEnabled(module))window.toggleTrackerModule(module);
}
await wait(60);
const architectures={certifications:'.cert-path',exams:'.exam-command',mocks:'.mock-lab',revision:'.revision-board',assignments:'.assignment-kanban',resources:'.resource-shelves',practice:'.practice-studio',projects:'.project-roadmaps',habits:'.habit-grid',goals:'.goal-horizon',interviews:'.interview-pipeline'};
for(const [view,selector] of Object.entries(architectures)){
  window.setView(view);await wait(40);
  assert.ok(document.querySelector(selector),`${view} must retain its unique production architecture offline`);
  assert.doesNotMatch(document.querySelector('#view').textContent,/Nestlyra|PAVENRO/i,`${view} must display only the TULSHII brand`);
}

for(const kind of Object.keys(architectures)){
  window.trackerItemModal(kind);await wait(15);
  assert.equal(document.querySelector('#modal').open,true,`${kind} add form must open`);
  assert.ok(document.querySelector('#modalBody .form-grid'),`${kind} add form must contain its production fields`);
  window.closeModal();
}

for(const [openModal,heading] of [[()=>window.subjectModal(),'Add subject'],[()=>window.taskModal(),'New study task'],[()=>window.eventModal(),'Add calendar event'],[()=>window.jobModal(),'Add application']]){
  openModal();await wait(15);
  assert.equal(document.querySelector('#modal').open,true,`${heading} modal must open`);
  assert.match(document.querySelector('#modalBody h2').textContent,new RegExp(heading,'i'));
  assert.ok(document.querySelector('#modalBody .form-grid'));
  assert.doesNotMatch(document.querySelector('#modalBody').textContent,/Google Drive sync|Nestlyra|PAVENRO/i,'Offline forms must not expose legacy branding or cloud-sync promises');
  window.closeModal();
}

window.setView('subjects');await wait();
assert.equal(document.querySelectorAll('.subject-card').length>=1,true,'Sample subject must be present');
const sample=document.querySelector('.subject-card').getAttribute('onclick').match(/'([^']+)'/)[1];
window.openSubject(sample);await wait();
assert.equal(document.querySelectorAll('.module').length,5);
assert.equal(document.querySelectorAll('.subtopic-row').length,25);
assert.ok(!document.body.textContent.includes('1. 1. Getting Started'));
assert.equal(document.querySelector('.module-head h3')?.textContent,'1. Getting Started');

window.setView('calendar');await wait();
assert.ok(document.querySelector('.nest-calendar.month'),'Production month calendar must work offline');
window.setCalendarMode('week');await wait();assert.ok(document.querySelector('.nest-calendar.week'));
window.setCalendarMode('day');await wait();assert.ok(document.querySelector('.nest-calendar.day'));

window.setView('tasks');await wait();assert.ok(document.querySelector('#view .card'),'Tasks must render offline');
window.setView('notes');await wait();assert.ok(document.querySelector('.note-layout'),'Notes editor must render offline');
window.setView('jobs');await wait();assert.ok(document.querySelector('.job-table'),'Job Tracker must render offline');

window.setView('settings');await wait();
assert.match(document.querySelector('#view').textContent,/Offline data & privacy/);
assert.match(document.querySelector('#view').textContent,/No account required/);
assert.match(document.querySelector('#view').textContent,/Reset all local data/);
assert.doesNotMatch(document.querySelector('#view').textContent,/Sign out|Account email/i,'Offline Settings must not expose account controls');
assert.equal(document.querySelector('#view input[type="password"]'),null,'Offline Settings must not contain a password or PIN field');
assert.equal([...document.querySelectorAll('#view button')].some(button=>/Toggle Groups/i.test(button.getAttribute('aria-label')||'')),false,'Settings must not offer a cloud Groups module');
assert.equal([...document.querySelectorAll('#view button')].some(button=>/Drive PDF/i.test(button.textContent)),false,'Drive upload must be removed offline');
assert.ok(document.querySelector('.settings-shell'),'Offline Settings must retain the professional category navigation');
const appearanceNav=document.querySelector('[data-setting-nav="appearance"]');
assert.ok(appearanceNav,'Offline Settings must expose the full Appearance section');
appearanceNav.click();await wait(60);
const appearanceCard=document.querySelector('[data-setting-category="appearance"]');
assert.equal(appearanceCard.querySelectorAll('.appearance-theme-grid .theme-chip').length,11,'Offline Appearance must match the online curated palette set');
assert.match(appearanceCard.textContent,/Interface composition/);
assert.match(appearanceCard.textContent,/Saved on this device/);
assert.doesNotMatch(appearanceCard.textContent,/Login artwork|Login image framing|Account saved/i,'Account-only appearance controls must not leak into the offline edition');
const themeTitles=[...appearanceCard.querySelectorAll('.appearance-theme-grid .theme-chip')].map(button=>button.title);
for(const title of themeTitles){
  document.querySelector(`[data-setting-category="appearance"] [title="${title}"]`).click();await wait(35);
  assert.equal(document.querySelector(`[data-setting-category="appearance"] [title="${title}"]`).classList.contains('active'),true,`${title} must apply and remain selected`);
}
document.querySelector('[data-setting-category="appearance"] [title="Use Finance Forest"]').click();await wait(60);
assert.equal(document.body.classList.contains('theme-nestlyra'),true,'Curated offline themes must apply immediately');
let density=document.querySelector('[data-setting-category="appearance"] select[onchange*="density"]');
density.value='compact';density.dispatchEvent(new window.Event('change',{bubbles:true}));await wait(60);
assert.equal(document.body.dataset.focusDensity,'compact','Offline layout density must apply immediately');
assert.match(window.localStorage.getItem('studyTracker.v30'),/"density":"compact"/,'Advanced appearance choices must persist locally');

window.setView('help');await wait();
assert.match(document.querySelector('#view').textContent,/100% DEVICE-ONLY/);
assert.match(document.querySelector('#view').textContent,/same architecture/i);
assert.match(document.querySelector('#view').textContent,/No account, activation or internet connection is required/i);
assert.doesNotMatch(document.querySelector('#view').textContent,/Create local account|Sign in locally|local PIN/i,'Offline manual must not instruct customers to authenticate');

window.setView('mocks');await wait();
window.trackerItemModal('mocks');
document.querySelector('#v37Field_name').value='Offline mock 1';
document.querySelector('#v37Field_score').value='74';
document.querySelector('#v37Field_total').value='100';
window.trackerSaveItemV37('mocks');await wait(80);
assert.match(document.querySelector('.mock-lab').textContent,/Offline mock 1/,'Module data must save locally');
assert.match(window.localStorage.getItem('studyTracker.v30'),/Offline mock 1/,'Saved module data must persist in localStorage');

window.resetOfflineDataModal();document.querySelector('#resetConfirm').value='RESET';await window.resetOfflineData();await wait();
assert.doesNotMatch(window.localStorage.getItem('studyTracker.v30'),/Offline mock 1/,'Reset must remove previously saved workspace content');
assert.equal(window.eval('state.profile.name'),'My Workspace','Reset must seed a fresh device-only workspace');
assert.equal(document.querySelector('#app').classList.contains('hidden'),false,'Reset must keep the account-free workspace open');
assert.equal(window.eval('viewName'),'dashboard','Reset must return to the Dashboard');
assert.deepEqual(networkCalls,[],'Offline boot and local workflows must not make network requests');
assert.deepEqual(browserErrors,[],browserErrors.join('\n'));
console.log('TULSHII Focus offline regression passed: direct access, production architecture, charts, modules, calendar, persistence, local reset and zero network calls.');
dom.window.close();
