import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM, VirtualConsole} from 'jsdom';

const html=fs.readFileSync(new URL('./pavenro-focus-offline.html',import.meta.url),'utf8');
assert.ok(html.length>900_000,'Offline edition must bundle the production application, not a simplified shell');
assert.equal((html.match(/<script\b[^>]+src=/gi)||[]).length,0,'Offline HTML must not load external scripts');
assert.equal((html.match(/<link\b[^>]+href="https?:/gi)||[]).length,0,'Offline HTML must not load external styles or fonts');
assert.doesNotMatch(html,/supabaseUrl:'https:/,'Offline bundle must not include the production Supabase endpoint');
assert.doesNotMatch(html,/serviceWorker\.register/,'A downloaded file must not attempt service-worker registration');

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
  url:'https://offline.pavenro.invalid/pavenro-focus-offline.html',
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

assert.equal(document.title,'PAVENRO Focus');
assert.equal(document.body.classList.contains('offline-mode'),true);
assert.equal(window.PAVENRO_OFFLINE,true);
assert.equal(window.getComputedStyle(document.querySelector('#googleLoginBtn')).display,'none','Google login must be absent from the offline experience');
assert.match(document.querySelector('.auth-account-note').textContent,/Private local storage/);
assert.equal(document.querySelector('#floatingMessages'),null,'Messaging launcher must not exist offline');
assert.ok(document.querySelector('img[data-pavenro-wordmark]')===null,'Embedded PAVENRO wordmark must hydrate without a file dependency');

document.querySelector('#loginName').value='offline-owner';
document.querySelector('#loginPin').value='2468';
document.querySelector('#createLearnerAccountBtn').click();
await wait(160);
assert.equal(document.querySelector('#app').classList.contains('hidden'),false,'A local account must open the production workspace');
window.finishNestlyraWalkthrough?.();
document.querySelector('#modalClose')?.click();
await wait(80);
assert.ok(document.querySelector('#v42OverallDonut'),'Offline Dashboard must use the production circular chart');
assert.ok(document.querySelector('#v42ModuleBars'),'Offline Dashboard must use the production module bar chart');
assert.ok(document.querySelector('#v42FocusLine'),'Offline Dashboard must use the production focus line chart');
assert.equal([...document.querySelectorAll('#nav button')].some(button=>/Groups|Messages/i.test(button.textContent)),false,'Cloud-only navigation must be removed');

for(const module of ['certifications','exams','mocks','revision','assignments','resources','practice','projects','habits','goals','interviews','jobs','settings','help']){
  if(!window.trackerModuleEnabled(module))window.toggleTrackerModule(module);
}
await wait(60);
const architectures={certifications:'.cert-path',exams:'.exam-command',mocks:'.mock-lab',revision:'.revision-board',assignments:'.assignment-kanban',resources:'.resource-shelves',practice:'.practice-studio',projects:'.project-roadmaps',habits:'.habit-grid',goals:'.goal-horizon',interviews:'.interview-pipeline'};
for(const [view,selector] of Object.entries(architectures)){
  window.setView(view);await wait(40);
  assert.ok(document.querySelector(selector),`${view} must retain its unique production architecture offline`);
}

window.setView('subjects');await wait();
assert.equal(document.querySelectorAll('.subject-card').length>=1,true,'Sample subject must be present');
const sample=document.querySelector('.subject-card').getAttribute('onclick').match(/'([^']+)'/)[1];
window.openSubject(sample);await wait();
assert.equal(document.querySelectorAll('.module').length,5);
assert.equal(document.querySelectorAll('.subtopic-row').length,25);

window.setView('calendar');await wait();
assert.ok(document.querySelector('.nest-calendar.month'),'Production month calendar must work offline');
window.setCalendarMode('week');await wait();assert.ok(document.querySelector('.nest-calendar.week'));
window.setCalendarMode('day');await wait();assert.ok(document.querySelector('.nest-calendar.day'));

window.setView('settings');await wait();
assert.match(document.querySelector('#view').textContent,/Offline data & privacy/);
assert.equal([...document.querySelectorAll('#view button')].some(button=>/Toggle Groups/i.test(button.getAttribute('aria-label')||'')),false,'Settings must not offer a cloud Groups module');
assert.equal([...document.querySelectorAll('#view button')].some(button=>/Drive PDF/i.test(button.textContent)),false,'Drive upload must be removed offline');

window.setView('help');await wait();
assert.match(document.querySelector('#view').textContent,/100% DEVICE-ONLY/);
assert.match(document.querySelector('#view').textContent,/same planning architecture/i);

window.setView('mocks');await wait();
window.trackerItemModal('mocks');
document.querySelector('#v37Field_name').value='Offline mock 1';
document.querySelector('#v37Field_score').value='74';
document.querySelector('#v37Field_total').value='100';
window.trackerSaveItemV37('mocks');await wait(80);
assert.match(document.querySelector('.mock-lab').textContent,/Offline mock 1/,'Module data must save locally');
assert.match(window.localStorage.getItem('studyTracker.v30'),/Offline mock 1/,'Saved module data must persist in localStorage');

window.deleteAccountModal();document.querySelector('#deleteConfirm').value='DELETE';await window.deleteAccount();await wait();
assert.equal(window.localStorage.getItem('studyTracker.v30'),null,'Permanent deletion must remove the local account and workspace');
assert.equal(document.querySelector('#app').classList.contains('hidden'),true,'Deletion must return to login instead of reopening cached data');
assert.deepEqual(networkCalls,[],'Offline boot and local workflows must not make network requests');
assert.deepEqual(browserErrors,[],browserErrors.join('\n'));
console.log('PAVENRO Focus offline regression passed: production architecture, local accounts, charts, modules, calendar, persistence and zero network calls.');
dom.window.close();
