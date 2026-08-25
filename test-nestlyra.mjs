import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM, VirtualConsole} from 'jsdom';

const source=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const browserErrors=[];
const virtualConsole=new VirtualConsole();
virtualConsole.on('jsdomError',error=>{if(!/navigation|canvas/i.test(error.message))browserErrors.push(error.message)});
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

const application=['config.js','jobs.js','family.js','messaging.js','app.js','tracker-modules.js']
  .map(file=>`${fs.readFileSync(new URL(`./${file}`,import.meta.url),'utf8')}\n//# sourceURL=${file}`)
  .join('\n');
window.eval(application);
document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));

const wait=(ms=20)=>new Promise(resolve=>setTimeout(resolve,ms));
const clickText=(selector,text)=>{
  const element=[...document.querySelectorAll(selector)].find(node=>node.textContent.includes(text));
  assert.ok(element,`Expected ${selector} containing ${text}`);element.click();return element;
};
await wait(40);

assert.equal(document.title,'Nestlyra Focus');
document.querySelector('#loginName').value='nestlyra-trial';
document.querySelector('#loginPin').value='1234';
document.querySelector('#createLearnerAccountBtn').click();
await wait(90);
assert.equal(document.querySelector('#app').classList.contains('hidden'),false,`Learner workspace should open: ${document.querySelector('#toast').textContent||'no message'}`);
assert.equal(document.body.classList.contains('theme-nestlyra'),true,'New users should receive the Nestlyra theme');
document.querySelector('#modalClose').click();

assert.match(document.querySelector('.sidebar>.brand').textContent,/Nestlyra\s*Focus/);
assert.equal([...document.querySelectorAll('#nav button')].some(node=>node.textContent.includes('Job Tracker')),false,'School preset should hide Job Tracker');
assert.equal([...document.querySelectorAll('#nav button')].some(node=>node.textContent.includes('Habits')),true,'School preset should show Habits');

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
assert.deepEqual(browserErrors,[],browserErrors.join('\n'));
console.log('Nestlyra regression passed: brand, default theme, sample course, modules, calendar views and event editing.');
dom.window.close();
