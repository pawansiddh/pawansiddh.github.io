import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM, VirtualConsole} from 'jsdom';

const source=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const trackerCss=fs.readFileSync(new URL('./tracker-update.css',import.meta.url),'utf8');
const responsiveCss=fs.readFileSync(new URL('./nestlyra-v43.css',import.meta.url),'utf8');
assert.match(responsiveCss,/\.subject-export-actions \.mini-btn\{width:auto;height:34px/,'Export selection controls must remain readable instead of collapsing into square buttons');
assert.match(responsiveCss,/@media\(max-width:520px\).*\.subject-export-actions \.mini-btn\{flex:1\}/s,'Export controls must remain usable on mobile');
const browserErrors=[];
const virtualConsole=new VirtualConsole();
virtualConsole.on('jsdomError',error=>{if(!/navigation|canvas/i.test(error.message)){browserErrors.push(error.message);console.error(error.detail?.stack||error.stack||error.message)}});
const dom=new JSDOM(source,{url:'http://127.0.0.1:4173/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
const {window}=dom,{document}=window;

window.structuredClone=globalThis.structuredClone;
window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
window.confirm=()=>true;
window.alert=()=>{};
window.Chart=class{destroy(){}};
window.XLSX={utils:{book_new:()=>({}),book_append_sheet(){},json_to_sheet:()=>({})},writeFile(){}};
const spoken=[];
window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
window.speechSynthesis={cancel(){},speak(utterance){spoken.push(utterance)},getVoices:()=>[]};
window.AudioContext=class{constructor(){this.currentTime=0;this.destination={}}createOscillator(){return{frequency:{value:0},connect(){},start(){},stop(){}}}createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}};
window.BroadcastChannel=class{postMessage(){}close(){}};
Object.defineProperty(window.navigator,'serviceWorker',{value:{register:async()=>({})}});
window.URL.createObjectURL=()=>"blob:test";
window.URL.revokeObjectURL=()=>{};
window.HTMLDialogElement.prototype.showModal=function(){this.open=true;this.setAttribute('open','')};
window.HTMLDialogElement.prototype.close=function(){this.open=false;this.removeAttribute('open')};
window.HTMLElement.prototype.scrollIntoView=function(){};

const application=['config.js','jobs.js','family.js','messaging.js','groups.js','app.js','tracker-modules.js','nestlyra-v37.js','nestlyra-v39.js','nestlyra-v42.js','pavenro-brand.js','focus-v48.js','focus-professional-v49.js']
  .map(file=>`${fs.readFileSync(new URL(`./${file}`,import.meta.url),'utf8')}\n//# sourceURL=${file}`)
  .join('\n');
window.eval(application);
assert.doesNotMatch(application,/https:\/\/www\.googleapis\.com\/auth\/drive\.file/,'Google login must not request unverified Drive access');
assert.match(application,/Drive PDF · Coming soon/,'Resource PDF storage must remain disabled until OAuth verification');
document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));

const wait=(ms=20)=>new Promise(resolve=>setTimeout(resolve,ms));
const clickText=(selector,text)=>{
  const element=[...document.querySelectorAll(selector)].find(node=>node.textContent.includes(text));
  assert.ok(element,`Expected ${selector} containing ${text}`);element.click();return element;
};
await wait(40);

assert.equal(document.title,'TULSHII Focus');
assert.equal(document.querySelectorAll('[data-auth-mode]').length,0,'Login should use one neutral account flow');
assert.match(document.querySelector('.auth-account-note').textContent,/One secure TULSHII account/);
assert.equal(document.querySelectorAll('.live-doll').length,7,'Login must render seven original live SVG dolls instead of swapped images');
assert.equal(document.querySelectorAll('.login-dolls').length,0,'Static login doll image states must be removed');
assert.ok(document.querySelector('img[src$="tulshii-wordmark.svg"]'),'Login must use the TULSHII wordmark');
document.querySelector('#loginName').value='nestlyra-trial';
document.querySelector('#loginPin').value='1234';
document.querySelector('#createLearnerAccountBtn').click();
await wait(170);
assert.equal(document.querySelector('#app').classList.contains('hidden'),false,`Learner workspace should open: ${document.querySelector('#toast').textContent||'no message'}`);
assert.ok(document.querySelector('.focus-category-setup'),'New users should choose a workspace category before the walkthrough');
window.applyFocusCategory('school');
await wait(80);
assert.equal(document.body.classList.contains('theme-category-school'),true,'School users should receive the blue category theme');
assert.ok(document.querySelector('#v42OverallDonut'),'Dashboard should render a circular overall-readiness graph');
assert.ok(document.querySelector('#v42ModuleBars'),'Dashboard should render a role-aware module bar graph');
assert.ok(document.querySelector('#v42FocusLine'),'Dashboard should render a seven-day focus line graph');
await wait(520);
assert.ok(document.querySelector('#nestlyraWalkthrough'),'A first-time account should receive the guided walkthrough');
assert.equal(document.querySelectorAll('.walk-shade').length,4,'Walkthrough must use four click-safe shade panels instead of a blocking blur layer');
window.nextWalkthrough();await wait();
assert.match(document.querySelector('#nestlyraWalkthrough').textContent,/2 \/ 5/);
window.previousWalkthrough();await wait();
assert.match(document.querySelector('#nestlyraWalkthrough').textContent,/1 \/ 5/);
window.finishNestlyraWalkthrough();await wait(350);
assert.equal(document.querySelector('#nestlyraWalkthrough'),null,'Skip/finish must fully remove the walkthrough');
assert.equal(document.body.classList.contains('walkthrough-open'),false,'Walkthrough must not leave the page frozen');
assert.equal(document.querySelector('#modal').open,false,'The daily briefing must not reopen behind or immediately after onboarding');

Object.defineProperty(window,'innerWidth',{value:390,writable:true,configurable:true});
window.startNestlyraWalkthrough();await wait(280);
window.nextWalkthrough();await wait(280);
assert.equal(document.querySelector('#app').classList.contains('nav-open'),true,'Mobile walkthrough must open the navigation before highlighting it');
window.nextWalkthrough();await wait(280);
assert.equal(document.querySelector('#app').classList.contains('nav-open'),false,'Mobile walkthrough must close navigation before highlighting dashboard content');
window.finishNestlyraWalkthrough();await wait(40);
assert.equal(document.querySelector('#nestlyraWalkthrough'),null,'Mobile walkthrough finish must remove every overlay');
assert.equal(document.body.classList.contains('walkthrough-open'),false,'Mobile walkthrough must restore page interaction');
assert.equal(document.querySelector('#app').classList.contains('nav-open'),false,'Mobile walkthrough must never leave the drawer open');
window.innerWidth=1366;

assert.equal(document.querySelector('.sidebar>.brand .focus-brand-copy .tulshii-wordmark')?.getAttribute('aria-label'),'TULSHII');
assert.equal(document.querySelector('.sidebar>.brand .focus-brand-copy small')?.textContent.trim(),'FOCUS');
assert.equal([...document.querySelectorAll('#nav button')].some(node=>node.textContent.includes('Groups')),true,'Groups should be available to every account');
assert.equal([...document.querySelectorAll('#nav button')].some(node=>node.textContent.includes('Job Tracker')),false,'School preset should hide Job Tracker');
assert.equal([...document.querySelectorAll('#nav button')].some(node=>node.textContent.includes('Habits')),true,'School preset should show Habits');
assert.ok(document.querySelector('[data-nav-entry="assignments"]'),'School preset should include functional Assignments');
assert.ok(document.querySelector('#focusMoreSections'),'Optional sections should lead to Navigation & modules');
assert.equal(document.querySelector('[data-nav-entry="settings"]')?.style.display,'none','Settings should move to the upper-right profile control');
assert.equal(document.querySelector('[data-nav-entry="help"]')?.style.display,'none','The full manual should remain available through contextual help and More sections');
assert.equal([...document.querySelectorAll('#nav .nav-entry')].filter(entry=>entry.style.display!=='none').length,8,'The School workspace should start with exactly eight visible sections');
window.toggleTrackerModule('mocks');await wait();
assert.equal([...document.querySelectorAll('#nav .nav-entry')].filter(entry=>entry.style.display!=='none').length,9,'A ninth enabled section must remain visible in the scrolling sidebar');
assert.match(trackerCss,/body:is\(\.theme-nestlyra,\.theme-light\) \.task-row/,'Light themes must normalize task rows');
assert.match(trackerCss,/body:is\(\.theme-nestlyra,\.theme-light\) \.note-item/,'Light themes must normalize note cards');
assert.match(trackerCss,/body:is\(\.theme-nestlyra,\.theme-light\) \.side-timer/,'Light themes must normalize the sidebar timer');
assert.match(responsiveCss,/\.cert-cards footer\{grid-column:2/,'Certification actions must have a dedicated non-overlapping row');
assert.match(responsiveCss,/\.subtopic-row>select\{grid-column:2\/4;grid-row:2/,'Mobile topic controls must have explicit rows');
assert.match(responsiveCss,/\.job-head-actions\{display:grid;width:100%/,'Mobile Job Tracker actions must stay inside the viewport');

document.querySelector('#menuBtn').click();
assert.equal(document.querySelector('#app').classList.contains('nav-open'),true,'Mobile navigation should expose an outside-tap scrim');
document.querySelector('#sidebarScrim').click();
assert.equal(document.querySelector('#app').classList.contains('nav-open'),false,'Tapping outside the mobile navigation should close it');
window.setView('calendar');await wait();
assert.equal(Object.keys(window.localStorage).some(key=>key.startsWith('studyTracker.lastView.v1')&&window.localStorage.getItem(key)==='calendar'),true,'The last opened section must survive a login round trip');

clickText('#nav button','Assignments');await wait();
assert.ok(document.querySelector('.assignment-kanban'),'Assignments should use its own kanban architecture');
window.trackerItemModal('assignments');
document.querySelector('#v37Field_title').value='Science project write-up';
document.querySelector('#v37Field_subject').value='Science';
document.querySelector('#v37Field_dueDate').value=new Date().toISOString().slice(0,10);
document.querySelector('#v37Field_status').value='In progress';
window.trackerSaveItemV37('assignments');await wait();
assert.match(document.querySelector('.assignment-kanban')?.textContent||'',/Science project write-up/,'New customizable modules must store real records');

assert.match(document.querySelector('[data-nav-entry="assignments"] .nav-help').getAttribute('onclick'),/openSectionHelp\('assignments'/);
window.openSectionHelp('assignments');await wait(120);
assert.ok(document.querySelector('#manual-assignments[open]'),'A section ? button should open its exact manual entry');

window.setView('settings');await wait();
window.subjectModal();document.querySelector('#fName').value='Networking fundamentals';document.querySelector('#fIcon').value='NF';window.saveSubject('');await wait();
window.setView('settings');await wait();
window.exportJSON();await wait();
const exportOptions=[...document.querySelectorAll('[data-export-subject]')];
assert.equal(exportOptions.length,2,'Subject export must show a checkbox for each subject');
const selectedPayload=window.buildSubjectExport([exportOptions[1].value]);
assert.equal(JSON.parse(selectedPayload.data).subjects.length,1,'Subject export must include only the selected subject');
assert.match(selectedPayload.filename,/networking-fundamentals/,'Single-subject export should use a recognizable filename');
document.querySelector('#modalClose').click();
window.toggleTrackerModule('settings');window.toggleTrackerModule('help');await wait();
assert.equal(document.querySelector('[data-nav-entry="settings"]'),null,'Users may hide Settings from navigation');
assert.equal(document.querySelector('[data-nav-entry="help"]'),null,'Users may hide Manual & FAQ from navigation');
document.querySelector('#avatar').click();await wait();
assert.match(document.querySelector('#view').textContent,/Navigation & modules/,'Avatar must keep Settings accessible when hidden');
window.openSectionHelp('tasks');await wait(120);
assert.ok(document.querySelector('#manual-tasks[open]'),'Context help must keep Manual accessible when hidden');
window.toggleTrackerModule('settings');window.toggleTrackerModule('help');await wait();

for(const name of ['certifications','exams','mocks','revision','assignments','resources','practice','projects','habits','goals','interviews'])if(!window.trackerModuleEnabled(name))window.toggleTrackerModule(name);
for(const [name,selector] of Object.entries({certifications:'.cert-path',exams:'.exam-command',mocks:'.mock-lab',revision:'.revision-board',assignments:'.assignment-kanban',resources:'.resource-shelves',practice:'.practice-studio',projects:'.project-roadmaps',habits:'.habit-grid',goals:'.goal-horizon',interviews:'.interview-pipeline'})){
  window.setView(name);await wait();
  assert.ok(document.querySelector(selector),`${name} must render its own architecture (${selector})`);
  window.trackerItemModal(name);
  const identity=document.querySelector('[id^="v37Field_"]');
  assert.ok(identity,`${name} should open an editable data form`);
  identity.value=`Responsive ${name} record`;
  window.trackerSaveItemV37(name);await wait();
  assert.match(document.querySelector(selector).textContent,new RegExp(`Responsive ${name}`,'i'),`${name} should save and render a real record`);
}

window.speechSynthesis.getVoices=()=>[
  {name:'Mobile English Female',lang:'en-US',voiceURI:'female'},
  {name:'Mobile English Daniel',lang:'en-GB',voiceURI:'male'}
];
window.setFamilyVoice('voice','deep-male');await wait(30);
assert.equal(spoken.at(-1)?.voice?.voiceURI,'male','A mobile male selection must use an available male voice');
assert.ok(spoken.at(-1)?.pitch<1,'Deep Male must remain audibly distinct when mobile voices use generic labels');

clickText('#nav button','Subjects');await wait();
const sampleId=document.querySelector('.subject-card').getAttribute('onclick').match(/'([^']+)'/)[1];
window.openSubject(sampleId);await wait();
assert.equal(document.querySelectorAll('.module').length,5,'Sample subject should have five modules');
assert.equal(document.querySelectorAll('.subtopic-row').length,25,'Sample subject should have five topics per module');

clickText('#nav button','Calendar');await wait();
assert.ok(document.querySelector('.nest-calendar.month'),'Calendar should open in Month view');
assert.equal(document.querySelectorAll('.nest-month-day').length,42,'Month view should contain a complete six-week grid');
assert.ok(document.querySelector('.calendar-filter.tasks'));
assert.ok(document.querySelector('.calendar-filter.study'));
window.setCalendarMode('week');await wait();
assert.ok(document.querySelector('.nest-calendar.week'),'Week view should render');
assert.equal(document.querySelectorAll('.calendar-week-head button').length,7);
window.setCalendarMode('day');await wait();
assert.ok(document.querySelector('.nest-calendar.day'),'Day view should render');
assert.equal(document.querySelectorAll('.calendar-time-axis span').length,24);

window.eventModal('',new Date().toISOString().slice(0,10));
document.querySelector('#fEventTitle').value='Focus test event';
document.querySelector('#fEventTime').value='10:30';
window.saveEvent('');await wait();
assert.match(document.querySelector('.timeline-event')?.textContent||'',/Focus test event/);

window.setTheme('dark');assert.equal(document.body.classList.contains('theme-nestlyra'),false);
window.setTheme('nestlyra');assert.equal(document.body.classList.contains('theme-nestlyra'),true);
window.setView('timer');await wait();
assert.ok(document.querySelector('#customTimerMinutes'),'Study Timer should accept a custom duration');
clickText('#nav button','Groups');await wait();
assert.match(document.querySelector('#groupsRoot').textContent,/Cloud account required/,'Local accounts should keep personal tracking but require cloud identity for Groups');
window.setView('help');await wait();
assert.match(document.querySelector('#view').textContent,/Groups, roles and invitations/,'Manual should explain the account-neutral Groups model');
assert.deepEqual(browserErrors,[],browserErrors.join('\n'));
console.log('TULSHII Focus regression passed: unified accounts, Groups, brand, professional themes, expandable navigation, contextual manuals, functional modules and Calendar.');
dom.window.close();
