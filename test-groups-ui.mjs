import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';

const source=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const errors=[];const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',error=>errors.push(error.detail?.stack||error.message));
const dom=new JSDOM(source,{url:'https://nestlyra.pages.dev/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
const {window}=dom,{document}=window,user={id:'11111111-1111-4111-8111-111111111111',email:'owner@example.com',user_metadata:{full_name:'Group Owner'}};

const responseFor=table=>{
  if(table==='group_progress_snapshots')return {data:[{group_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',user_id:user.id,module_type:'overall',display_name:'Group Owner',progress_percent:40,completed_count:10,total_count:25,study_minutes:90,mock_average:0,active_minutes:12,screen_changes:4,last_seen:new Date().toISOString(),last_updated:new Date().toISOString()}],error:null};
  if(table==='group_shared_records')return {data:[{id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',group_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',record_type:'task',title:'Shared practice check-in',details:'Aggregate-safe shared task',version:1,updated_at:new Date().toISOString(),deleted_at:null}],error:null};
  if(table==='user_tracker_data')return {data:null,error:null};
  if(table==='group_messages')return {data:[],error:null};
  return {data:[],error:null};
};
const query=table=>{
  const result=responseFor(table),builder={select(){return builder},eq(){return builder},in(){return builder},is(){return builder},gt(){return builder},limit(){return builder},order(){return builder},maybeSingle(){return Promise.resolve(result)},upsert(){return Promise.resolve({data:null,error:null})},insert(){return Promise.resolve({data:null,error:null})},update(){return builder},delete(){return builder},then(resolve,reject){return Promise.resolve(result).then(resolve,reject)}};return builder;
};
const rpc=async(name)=>{
  if(name==='group_ensure_profile')return {data:{user_id:user.id,display_name:'Group Owner'},error:null};
  if(name==='group_list')return {data:[{group_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',group_name:'OSCP Accountability',group_kind:'accountability',group_mode:'limited',viewer_role:'owner',share_progress:true,share_activity:true,member_count:2,last_message_at:null,unread_count:1}],error:null};
  if(name==='group_members_list')return {data:[{user_id:user.id,display_name:'Group Owner',role:'owner',share_progress:true,share_activity:true,joined_at:new Date().toISOString()},{user_id:'22222222-2222-4222-8222-222222222222',display_name:'Observer',role:'observer',share_progress:true,share_activity:true,joined_at:new Date().toISOString()}],error:null};
  return {data:true,error:null};
};
const channel={on(){return channel},subscribe(){return channel}};
const fakeSb={auth:{getSession:async()=>({data:{session:{user}}}),getUser:async()=>({data:{user},error:null}),signOut:async()=>({error:null}),signInWithPassword:async()=>({data:{user},error:null}),signUp:async()=>({data:{user,session:{}},error:null}),signInWithOAuth:async()=>({error:null}),updateUser:async()=>({error:null})},rpc,from:query,channel:()=>channel,removeChannel(){}};

window.structuredClone=globalThis.structuredClone;window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});window.confirm=()=>true;window.Chart=class{destroy(){}};window.XLSX={utils:{book_new:()=>({}),book_append_sheet(){},json_to_sheet:()=>({})},writeFile(){}};window.SpeechSynthesisUtterance=class{};window.speechSynthesis={cancel(){},speak(){},getVoices:()=>[]};window.AudioContext=class{constructor(){this.currentTime=0;this.destination={}}createOscillator(){return{frequency:{value:0},connect(){},start(){},stop(){}}}createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}};window.supabase={createClient:()=>fakeSb};Object.defineProperty(window.navigator,'serviceWorker',{value:{register:async()=>({})}});window.HTMLDialogElement.prototype.showModal=function(){this.open=true};window.HTMLDialogElement.prototype.close=function(){this.open=false};

const application=['config.js','jobs.js','family.js','messaging.js','groups.js','app.js','tracker-modules.js'].map(file=>`${fs.readFileSync(new URL(`./${file}`,import.meta.url),'utf8')}\n//# sourceURL=${file}`).join('\n');
window.eval(application);document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));
await new Promise(resolve=>setTimeout(resolve,180));
assert.equal(document.querySelector('#app').classList.contains('hidden'),false,'Cloud account should open through unified login boot');
window.setView('groups');await new Promise(resolve=>setTimeout(resolve,120));
assert.match(document.querySelector('#groupsRoot').textContent,/OSCP Accountability/);
assert.match(document.querySelector('#groupsRoot').textContent,/Group Owner/);
assert.match(document.querySelector('#groupsRoot').textContent,/Observer/);
assert.match(document.querySelector('#groupsRoot').textContent,/Shared practice check-in/);
assert.match(document.querySelector('#groupsRoot').textContent,/Aggregates only/);
assert.doesNotMatch(document.querySelector('#groupsRoot').textContent,/Sample Learning Course|How to use this sample/,'Groups must not render private syllabus or notes');
assert.deepEqual(errors,[],errors.join('\n'));
console.log('Groups UI regression passed: unified cloud login, group roles, aggregate projection and limited shared records.');
dom.window.close();
