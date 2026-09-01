import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';

const source=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const css=[fs.readFileSync(new URL('./focus-v48.css',import.meta.url),'utf8'),fs.readFileSync(new URL('./focus-professional-v49.css',import.meta.url),'utf8')].join('\n');
assert.match(css,/body \.mini-btn\{[^}]*font-size:11px/,'Shared record controls must use compact professional typography');
assert.match(css,/#view \.cert-stage-line>span>i\{[^}]*width:28px;height:28px/,'Certification stages must use clear numbered milestones');
const errors=[];
const virtualConsole=new VirtualConsole();
virtualConsole.on('jsdomError',error=>{if(!/navigation|canvas|not implemented/i.test(error.message))errors.push(error.detail?.stack||error.stack||error.message)});
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

const application=['config.js','jobs.js','family.js','messaging.js','groups.js','app.js','tracker-modules.js','nestlyra-v37.js','nestlyra-v39.js','nestlyra-v42.js','pavenro-brand.js','focus-v48.js','focus-professional-v49.js']
  .map(file=>`${fs.readFileSync(new URL(`./${file}`,import.meta.url),'utf8')}\n//# sourceURL=${file}`)
  .join('\n');
window.eval(application);
document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));
const wait=(ms=25)=>new Promise(resolve=>setTimeout(resolve,ms));
await wait(50);

document.querySelector('#loginName').value='Pawan';
document.querySelector('#loginPin').value='1234';
document.querySelector('#createLearnerAccountBtn').click();
await wait(170);
assert.ok(document.querySelector('.focus-category-setup'),'A new account must choose a Focus category before the walkthrough');
assert.equal(document.querySelectorAll('.focus-category-setup .focus-category-card').length,4);
window.applyFocusCategory('school');
await wait(40);
if(document.querySelector('#nestlyraWalkthrough'))window.finishNestlyraWalkthrough();

assert.equal(document.querySelector('.focus-brand-copy .tulshii-wordmark')?.getAttribute('aria-label'),'TULSHII');
assert.equal(document.querySelector('.focus-brand-copy small')?.textContent.trim(),'FOCUS');
assert.ok(document.body.classList.contains('theme-category-school'),'School must start with the blue category theme');
const visibleMainEntries=()=>[...document.querySelectorAll('#nav .nav-entry')].filter(entry=>entry.style.display!=='none'&&!['settings','help'].includes(entry.dataset.navEntry));
assert.equal(visibleMainEntries().length,8,`School must start with exactly eight primary sections, found ${visibleMainEntries().length}`);
assert.notEqual(document.querySelector('[data-nav-entry="settings"]')?.style.display,'none','Enabled Settings must remain visible in navigation');
window.toggleTrackerModule('resources');await wait();
assert.equal(visibleMainEntries().length,9,'Every newly enabled primary section must remain visible after the default eight');
assert.ok(document.querySelector('[data-nav-entry="resources"]'),'The enabled Resource Library section must appear in navigation');
assert.ok(document.querySelector('#focusMoreSections'));
assert.equal(document.querySelector('#view>.page-head'),null,'Repeated page heading must move into the top bar');
assert.ok(document.querySelector('#topbarTitle').textContent.trim());

document.querySelector('#sidebarCollapse').click();
assert.ok(document.body.classList.contains('focus-sidebar-collapsed'));
document.querySelector('#sidebarCollapse').click();
document.querySelector('#focusSearchEntry').click();
assert.ok(document.querySelector('#focusSearchPopover').classList.contains('open'));
window.openFocusModuleSettings();await wait(90);
assert.equal(document.querySelectorAll('.focus-category-settings .focus-category-card').length,4);

window.applyFocusCategory('personal');await wait();
assert.ok(document.body.classList.contains('theme-category-personal'),'Personal must start with the green category theme');
window.setView('settings');await wait(90);
assert.equal(document.querySelectorAll('.appearance-theme-grid .theme-chip').length,11,'Appearance must offer expanded theme choices');
window.setTheme('focus-paper');await wait();
assert.ok(document.body.classList.contains('theme-focus-paper'));
window.applyFocusCategory('school');await wait();
assert.ok(document.body.classList.contains('theme-focus-paper'),'Manual theme choice must survive later category changes');

window.toggleTrackerModule('subjects');window.setView('settings');await wait(90);
document.querySelector('[data-setting-nav="data"]')?.click();await wait();
const dataSettings=document.querySelector('[data-setting-category="data"]');
assert.ok(dataSettings,'Import / export must always render a settings card');
assert.equal(dataSettings.classList.contains('module-disabled-setting'),false,'Import / export must remain available when Subjects is disabled');
window.toggleTrackerModule('subjects');await wait();

window.setView('subjects');await wait();
window.subjectModal();
document.querySelector('#fName').value='Network Security';
document.querySelector('[data-hierarchy-module-name]').value='Core Networking';
document.querySelector('[data-hierarchy-topics]').value='TCP/IP foundations\nNetwork scanning';
document.querySelector('#fDesc').value='Practical network security study plan';
window.saveSubjectV48('');await wait();
const created=window.PAVENRO_FOCUS_UPDATE.getState().subjects.find(item=>item.name==='Network Security');
assert.equal(created.modules.length,1);
assert.equal(created.modules[0].topics.length,2);
window.openSubject(created.id);await wait();
assert.ok(document.querySelector('.module-edit'));
assert.equal(document.querySelectorAll('.topic-edit').length,2);

window.PAVENRO_FOCUS_UPDATE.getState().tasks.push({id:'v48-overdue',title:'Review overdue lesson',subjectId:'',priority:'High',due:'2020-01-01',time:'09:00',status:'pending'});window.render();
await wait();
document.querySelector('#notifBtn').click();await wait();
assert.ok(document.querySelector('#notificationPanel').classList.contains('open'));
assert.match(document.querySelector('#notificationList').textContent,/Review overdue lesson/);

window.PAVENRO_FOCUS_UPDATE.getState().moduleConfig.enabled=window.PAVENRO_FOCUS_UPDATE.getState().moduleConfig.enabled.filter(id=>id!=='groups');window.setView('messages');
await wait();
const manage=[...document.querySelectorAll('button')].find(button=>/Manage groups/i.test(button.textContent));
assert.ok(manage,'Messages must keep a Manage groups action');
assert.match(manage.getAttribute('onclick')||'',/setView\('groups'\)/);
window.setView('groups');await wait();
assert.ok(document.querySelector('#groupsRoot'),'Manage groups must bypass the hidden Groups redirect and render the Groups page');

assert.match(css,/focus-sidebar-collapsed \.app/);
assert.match(css,/theme-category-business/);
assert.match(css,/notification-panel\.open/);
assert.match(css,/\.mock-ledger article\{grid-template-columns:82px minmax\(150px,1fr\) 54px minmax\(96px,auto\)/,'Ledger score and actions must use non-overlapping columns');
assert.equal(document.querySelector('#floatingMessages')?.parentElement?.classList.contains('top-actions'),true,'Messages must live in the top bar instead of overlapping content');
assert.deepEqual(errors,[],errors.join('\n'));
console.log('TULSHII Focus v49 passed: professional themes, expandable navigation, repaired settings, header shell, subject hierarchy, notifications and Messages placement.');
dom.window.close();
