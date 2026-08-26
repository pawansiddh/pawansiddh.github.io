import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM, VirtualConsole} from 'jsdom';

const source=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const trackerCss=fs.readFileSync(new URL('./tracker-update.css',import.meta.url),'utf8');
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
window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
window.speechSynthesis={cancel(){},speak(){},getVoices:()=>[]};
window.AudioContext=class{constructor(){this.currentTime=0;this.destination={}}createOscillator(){return{frequency:{value:0},connect(){},start(){},stop(){}}}createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}};
window.BroadcastChannel=class{postMessage(){}close(){}};
Object.defineProperty(window.navigator,'serviceWorker',{value:{register:async()=>({})}});
window.URL.createObjectURL=()=>"blob:test";
window.URL.revokeObjectURL=()=>{};
window.HTMLDialogElement.prototype.showModal=function(){this.open=true;this.setAttribute('open','')};
window.HTMLDialogElement.prototype.close=function(){this.open=false;this.removeAttribute('open')};
window.HTMLElement.prototype.scrollIntoView=function(){};

const application=['config.js','jobs.js','family.js','messaging.js','groups.js','app.js','tracker-modules.js','nestlyra-v37.js','nestlyra-v39.js','nestlyra-v42.js']
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

assert.equal(document.title,'Nestlyra Focus');
assert.equal(document.querySelectorAll('[data-auth-mode]').length,0,'Login should use one neutral account flow');
assert.match(document.querySelector('.auth-account-note').textContent,/One secure Nestlyra account/);
assert.equal(document.querySelectorAll('.live-doll').length,7,'Login must render seven original live SVG dolls instead of swapped images');
assert.equal(document.querySelectorAll('.login-dolls').length,0,'Static login doll image states must be removed');
assert.ok(document.querySelector('img[src="nestlyra-wordmark-gold.svg"]'),'Login must use the integrated emblem-and-name wordmark, not the old brand rectangle');
document.querySelector('#loginName').value='nestlyra-trial';
document.querySelector('#loginPin').value='1234';
document.querySelector('#createLearnerAccountBtn').click();
await wait(90);
assert.equal(document.querySelector('#app').classList.contains('hidden'),false,`Learner workspace should open: ${document.querySelector('#toast').textContent||'no message'}`);
assert.equal(document.body.classList.contains('theme-nestlyra'),true,'New users should receive the Nestlyra theme');
document.querySelector('#modalClose').click();
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

assert.equal(document.querySelector('.sidebar>.brand img')?.alt,'Nestlyra');
assert.match(document.querySelector('.sidebar>.brand').textContent,/Focus/);
assert.equal([...document.querySelectorAll('#nav button')].some(node=>node.textContent.includes('Groups')),true,'Groups should be available to every account');
assert.equal([...document.querySelectorAll('#nav button')].some(node=>node.textContent.includes('Job Tracker')),false,'School preset should hide Job Tracker');
assert.equal([...document.querySelectorAll('#nav button')].some(node=>node.textContent.includes('Habits')),true,'School preset should show Habits');
assert.ok(document.querySelector('[data-nav-entry="assignments"]'),'School preset should include functional Assignments');
assert.ok(document.querySelector('[data-nav-entry="resources"]'),'School preset should include the Resource Library');
assert.ok(document.querySelector('[data-nav-entry="settings"]'),'Settings should be enabled by default');
assert.ok(document.querySelector('[data-nav-entry="help"]'),'Manual & FAQ should be enabled by default');
assert.equal(document.querySelectorAll('#nav .nav-entry').length,document.querySelectorAll('#nav .nav-help').length,'Every navigation section should have contextual help');
assert.match(trackerCss,/body:is\(\.theme-nestlyra,\.theme-light\) \.task-row/,'Light themes must normalize task rows');
assert.match(trackerCss,/body:is\(\.theme-nestlyra,\.theme-light\) \.note-item/,'Light themes must normalize note cards');
assert.match(trackerCss,/body:is\(\.theme-nestlyra,\.theme-light\) \.side-timer/,'Light themes must normalize the sidebar timer');

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
}

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
document.querySelector('#fEventTitle').value='Nestlyra test event';
document.querySelector('#fEventTime').value='10:30';
window.saveEvent('');await wait();
assert.match(document.querySelector('.timeline-event')?.textContent||'',/Nestlyra test event/);

window.setTheme('dark');assert.equal(document.body.classList.contains('theme-nestlyra'),false);
window.setTheme('nestlyra');assert.equal(document.body.classList.contains('theme-nestlyra'),true);
window.setView('timer');await wait();
assert.ok(document.querySelector('#customTimerMinutes'),'Study Timer should accept a custom duration');
clickText('#nav button','Groups');await wait();
assert.match(document.querySelector('#groupsRoot').textContent,/Cloud account required/,'Local accounts should keep personal tracking but require cloud identity for Groups');
window.setView('help');await wait();
assert.match(document.querySelector('#view').textContent,/Groups, roles and invitations/,'Manual should explain the account-neutral Groups model');
assert.deepEqual(browserErrors,[],browserErrors.join('\n'));
console.log('Nestlyra regression passed: unified accounts, Groups, brand, consistent themes, configurable navigation, contextual manuals, functional modules and Calendar.');
dom.window.close();
