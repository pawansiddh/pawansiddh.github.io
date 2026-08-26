/* Nestlyra Focus local activity, briefing voice, and legacy Family compatibility.
   Parent/Learner is no longer an account role. Cloud collaboration is handled by groups.js. */
const FAMILY_KEY='studyTracker.family.v1';
let familyData=loadFamily(),activityTimer=null,lastActivityAt=Date.now(),lastActivityTick=Date.now(),trackedView='dashboard',cloudFamilyUser=null,cloudActivitySyncAt=0,briefingVoiceTimer=null,briefingPopupTimer=null;

function loadFamily(){
  const defaults={admin:null,invites:[],links:[],activity:{},settings:{voice:'calm-female',voiceRate:1,voicePitch:1,autoBriefing:true,briefingFrequency:'every-login',briefingDelay:.3,briefingGreeting:'',briefingToday:true,briefingUpcoming:true,briefingJobs:true,messageSound:true,messageNotifications:true,messagePreview:true}};
  try{const saved=JSON.parse(localStorage.getItem(FAMILY_KEY)||'{}');return {...defaults,...saved,settings:{...defaults.settings,...(saved.settings||{})}}}catch{return defaults}
}
function saveFamily(){
  try{familyData._revision=Date.now();localStorage.setItem(FAMILY_KEY,JSON.stringify(familyData))}catch(error){console.warn('Nestlyra local settings save failed:',error.message)}
}
addEventListener('storage',event=>{if(event.key===FAMILY_KEY&&event.newValue)familyData=loadFamily()});

function familyId(){
  if(!state?.profile)return'';
  if(!state.profile.familyUserId){state.profile.familyUserId=`user-${uid()}-${uid()}`;save()}
  return state.profile.familyUserId;
}
window.familyDeleteLocalLearnerData=()=>{const id=state?.profile?.familyUserId;if(!id)return;delete familyData.activity[id];saveFamily()};
function isParentSession(){return false}
function isCloudParentSession(){return false}
function setFamilyLoginIntent(){
  sessionStorage.removeItem('studyTracker.family.role');
  sessionStorage.removeItem('studyTracker.family.sessionType');
  sessionStorage.removeItem('studyTracker.family.loginIntent');
}
window.familyPrepareLearnerLogin=setFamilyLoginIntent;
async function getCloudFamilyUser(){if(!sb)return null;const {data}=await sb.auth.getUser();return data?.user||null}
async function registerCloudRole(){const user=await getCloudFamilyUser();if(!user)return null;cloudFamilyUser=user;if(typeof groupEnsureProfile==='function')return groupEnsureProfile(user);return {user_id:user.id,display_name:user.user_metadata?.full_name||user.email?.split('@')[0]||'User'}}
window.familyResolveAuthenticatedRole=async user=>{cloudFamilyUser=user;setFamilyLoginIntent();if(typeof groupEnsureProfile==='function')await groupEnsureProfile(user);return'user'};

function familyActivity(){
  const id=familyId();if(!id)return null;
  return familyData.activity[id]||(familyData.activity[id]={name:state.profile?.name||'User',days:{},sessions:[],lastSeen:new Date().toISOString()});
}
function activityDay(){
  const activity=familyActivity();if(!activity)return null;
  const key=today();return activity.days[key]||(activity.days[key]={activeMs:0,idleMs:0,viewChanges:0,views:{},logins:0});
}
function markActivity(){lastActivityAt=Date.now()}
async function syncCloudActivity(force=false){
  if(!sb||!cloudFamilyUser||(!force&&Date.now()-cloudActivitySyncAt<30000))return;
  const day=activityDay();if(!day)return;cloudActivitySyncAt=Date.now();
  try{
    await sb.from('family_activity').upsert({learner_id:cloudFamilyUser.id,activity_date:today(),active_ms:Math.round(day.activeMs||0),idle_ms:Math.round(day.idleMs||0),view_changes:day.viewChanges||0,views:day.views||{},logins:day.logins||0,last_seen:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'learner_id,activity_date'});
    if(typeof groupPublishProgress==='function')await groupPublishProgress(true);
  }catch(error){console.warn('Activity projection sync:',error.message)}
}
function activityTick(){
  if(!state?.profile)return;
  const now=Date.now(),delta=Math.min(15000,now-lastActivityTick);lastActivityTick=now;
  const day=activityDay();if(!day)return;
  const active=document.visibilityState==='visible'&&document.hasFocus()&&now-lastActivityAt<120000;
  if(active){day.activeMs+=delta;day.views[trackedView]=(day.views[trackedView]||0)+delta}else day.idleMs+=delta;
  const activity=familyActivity();activity.lastSeen=new Date().toISOString();saveFamily();syncCloudActivity();
}
function startActivityTracking(){
  if(activityTimer)return;
  const day=activityDay();if(day)day.logins++;
  const activity=familyActivity();if(activity){activity.sessions.push({startedAt:new Date().toISOString()});activity.sessions=activity.sessions.slice(-100);saveFamily()}
  ['mousemove','mousedown','keydown','touchstart','scroll'].forEach(event=>addEventListener(event,markActivity,{passive:true}));
  document.addEventListener('visibilitychange',activityTick);activityTimer=setInterval(activityTick,5000);
}
function trackFamilyView(name){activityTick();if(name!==trackedView){const day=activityDay();if(day)day.viewChanges++;trackedView=name;saveFamily()}}
function formatDuration(ms=0){const mins=Math.round(ms/60000);return mins<60?`${mins}m`:`${Math.floor(mins/60)}h ${mins%60}m`}

function voiceProfiles(){return [['calm-female','Calm Female'],['clear-female','Clear Female'],['calm-male','Calm Male'],['deep-male','Deep Male'],['system','System Default']]}
function chooseVoice(profile){const voices=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang)),female=voices.filter(v=>/female|zira|samantha|victoria|aria|jenny|google uk english female/i.test(v.name)),male=voices.filter(v=>/male|david|mark|daniel|george|guy|google uk english male/i.test(v.name));if(profile==='calm-female')return female[0]||voices[0];if(profile==='clear-female')return female[1]||female[0]||voices[1]||voices[0];if(profile==='calm-male')return male[0]||voices[0];if(profile==='deep-male')return male[1]||male[0]||voices[1]||voices[0];return voices[0]||speechSynthesis.getVoices()[0]}
window.familySpeak=text=>{if(!('speechSynthesis'in window))return toast('Voice is not supported on this browser');speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(String(text||''));utterance.voice=chooseVoice(familyData.settings.voice);utterance.rate=Number(familyData.settings.voiceRate)||1;utterance.pitch=Number(familyData.settings.voicePitch)||1;speechSynthesis.speak(utterance)};
window.familySpeakBriefing=()=>{const el=document.querySelector('.briefing');if(el)familySpeak((el.innerText||el.textContent||'').replace(/Job Tracker\s+Open calendar\s+Start my day/g,''))};
window.familyStopVoice=()=>{clearTimeout(briefingVoiceTimer);briefingVoiceTimer=null;speechSynthesis?.cancel()};
window.familyCancelBriefing=()=>{clearTimeout(briefingPopupTimer);briefingPopupTimer=null;familyStopVoice()};
window.setFamilyVoice=(key,value)=>{familyData.settings[key]=key==='autoBriefing'?Boolean(value):value;saveFamily();if(key==='voice')familySpeak(`Hello. You selected ${voiceProfiles().find(x=>x[0]===value)?.[1]||'this voice'}.`)};
window.setFamilySetting=(key,value)=>{familyData.settings[key]=value;saveFamily();if(key==='briefingFrequency'&&value==='off')familyCancelBriefing()};

function familySettingsCards(){
  const voice=familyData.settings.voice,s=familyData.settings,day=activityDay();
  const groupCard=typeof groupSettingsCard==='function'?groupSettingsCard():'';
  return `<section class="card"><div class="card-title"><h3>Voice & accessibility</h3><span>5 profiles</span></div><label class="workspace-switcher">Briefing voice<select onchange="setFamilyVoice('voice',this.value)">${voiceProfiles().map(([value,name])=>`<option value="${value}" ${voice===value?'selected':''}>${name}</option>`).join('')}</select></label><div class="setting-row"><span>Read briefing automatically</span><button class="toggle ${s.autoBriefing?'on':''}" onclick="setFamilyVoice('autoBriefing',!${s.autoBriefing});render()"></button></div><label>Speaking speed<input type="range" min="0.7" max="1.3" step="0.1" value="${s.voiceRate}" onchange="setFamilyVoice('voiceRate',this.value)"></label><div class="modal-actions"><button class="btn ghost" onclick="familyStopVoice()">■ Stop</button><button class="btn primary" onclick="familySpeak('Hello ${escapeHtml(state.profile?.name||'user')}. Your Nestlyra Focus voice is ready.')">▶ Test voice</button></div></section><section class="card"><div class="card-title"><h3>Daily briefing popup</h3><span>Configurable</span></div><label class="workspace-switcher">Show popup<select onchange="setFamilySetting('briefingFrequency',this.value);render()"><option value="every-login" ${s.briefingFrequency==='every-login'?'selected':''}>Every login</option><option value="daily" ${s.briefingFrequency==='daily'?'selected':''}>Once per day</option><option value="off" ${s.briefingFrequency==='off'?'selected':''}>Off / manual only</option></select></label><label class="workspace-switcher">Open after<select onchange="setFamilySetting('briefingDelay',Number(this.value));render()">${[[.3,'Immediately'],[3,'3 seconds'],[5,'5 seconds'],[10,'10 seconds']].map(([value,name])=>`<option value="${value}" ${Number(s.briefingDelay)===value?'selected':''}>${name}</option>`).join('')}</select></label><label>Custom greeting<input maxlength="100" value="${escapeHtml(s.briefingGreeting||'')}" placeholder="Welcome back, {name}" onchange="setFamilySetting('briefingGreeting',this.value.trim())"></label><div class="setting-row"><span>Include today’s plan</span><button class="toggle ${s.briefingToday?'on':''}" onclick="setFamilySetting('briefingToday',!${s.briefingToday});render()"></button></div><div class="setting-row"><span>Include upcoming topics</span><button class="toggle ${s.briefingUpcoming?'on':''}" onclick="setFamilySetting('briefingUpcoming',!${s.briefingUpcoming});render()"></button></div><div class="setting-row"><span>Include Job Tracker updates</span><button class="toggle ${s.briefingJobs?'on':''}" onclick="setFamilySetting('briefingJobs',!${s.briefingJobs});render()"></button></div><div class="modal-actions"><button class="btn primary" onclick="familyPreviewBriefing()">Preview briefing</button></div></section>${groupCard}<section class="card"><div class="card-title"><h3>Activity privacy</h3><span>This app only</span></div><p class="task-meta">Tracks focused Nestlyra Focus time, idle time, section visits and screen changes. It never records keystrokes or activity outside this application. Groups receive only the aggregate values you choose to share.</p><div class="setting-row"><span>Today active</span><strong>${formatDuration(day?.activeMs)}</strong></div><div class="setting-row"><span>Today screen changes</span><strong>${day?.viewChanges||0}</strong></div></section>`;
}

function familyBriefingStorageKey(){return `studyTracker.briefing.${cloudFamilyUser?.id||state?.profile?.familyUserId||'local'}`}
function familyShouldShowBriefing(){const frequency=familyData.settings.briefingFrequency||'every-login';if(frequency==='off')return false;if(frequency==='daily'&&localStorage.getItem(familyBriefingStorageKey())===today())return false;return true}
function familyConfigureBriefing(){const briefing=document.querySelector('.briefing');if(!briefing)return;const s=familyData.settings,name=(state.profile?.name||'User').split(' ')[0],custom=(s.briefingGreeting||'').trim();if(custom)briefing.querySelector('h2').textContent=custom.replaceAll('{name}',name);const stats=briefing.querySelectorAll('.briefing-stats>div'),sections=[...briefing.querySelectorAll('section')];if(!s.briefingToday){stats[1]?.remove();sections.find(x=>x.querySelector('h3')?.textContent==="Today's plan")?.remove()}if(!s.briefingUpcoming){stats[2]?.remove();sections.find(x=>x.querySelector('h3')?.textContent==='Coming up')?.remove()}if(!s.briefingJobs){stats[3]?.remove();briefing.querySelector('.job-brief')?.remove();briefing.querySelector('[onclick*="jobs"]')?.remove()}if((s.briefingFrequency||'every-login')==='daily')localStorage.setItem(familyBriefingStorageKey(),today());const actions=briefing.querySelector('.modal-actions');if(actions&&!actions.querySelector('.briefing-snooze'))actions.insertAdjacentHTML('afterbegin','<button type="button" class="btn ghost briefing-snooze" onclick="familyBriefingSnoozeToday()">Do not show again today</button>')}
function familyOnBriefing(){familyStopVoice();briefingVoiceTimer=setTimeout(()=>{briefingVoiceTimer=null;const dialog=document.querySelector('#modal'),actions=document.querySelector('.briefing .modal-actions');if(!dialog?.open||!actions)return;const button=document.createElement('button');button.type='button';button.className='btn ghost';button.textContent='🔊 Read aloud';button.onclick=familySpeakBriefing;actions.prepend(button);if(familyData.settings.autoBriefing&&dialog.open)familySpeakBriefing()},80)}
window.familyScheduleBriefing=()=>{
  familyCancelBriefing();
  if(window.nestlyraOnboardingActive||!familyShouldShowBriefing())return;
  briefingPopupTimer=setTimeout(()=>{
    briefingPopupTimer=null;
    if(window.nestlyraOnboardingActive||!familyShouldShowBriefing())return;
    const dialog=document.querySelector('#modal');if(dialog?.open)return;
    welcomeBriefing();familyConfigureBriefing();familyOnBriefing();
  },Math.max(300,Number(familyData.settings.briefingDelay||.3)*1000));
};
window.familyPreviewBriefing=()=>{if(document.querySelector('#modal')?.open)closeModal();welcomeBriefing();familyConfigureBriefing();familyOnBriefing()};
window.familyBriefingSnoozeToday=()=>{localStorage.setItem(familyBriefingStorageKey(),today());familyStopVoice();closeModal();toast('Daily briefing paused for today')};
window.familyOnAppShown=async()=>{document.body.classList.remove('parent-mode','parent-observer-mode');try{cloudFamilyUser=await getCloudFamilyUser();if(cloudFamilyUser&&typeof groupEnsureProfile==='function')await groupEnsureProfile(cloudFamilyUser)}catch(error){console.warn('Group profile setup:',error.message)}startActivityTracking();syncCloudActivity(true);if(typeof groupRefreshBadge==='function')groupRefreshBadge()};

window.joinFamilyCode=()=>typeof groupJoinModal==='function'?groupJoinModal():toast('Open Groups to join a connection');
window.generateFamilyCode=()=>typeof groupInviteModal==='function'?groupInviteModal():toast('Open Groups to create an invitation');
window.renderParentPortal=()=>{viewName='groups';render()};
window.familyParentLogout=()=>signOut();
window.familyOpenLearnerWorkspace=()=>toast('Group observers receive read-only aggregate progress, not private workspace data.');
window.familyReturnToPortal=()=>{viewName='groups';render()};

document.addEventListener('DOMContentLoaded',()=>{
  const baseSettings=settings;
  settings=()=>baseSettings().replace(/<\/div>$/,familySettingsCards()+'</div>');
  const baseSetView=window.setView;
  window.setView=name=>{trackFamilyView(name);return baseSetView(name)};
  document.querySelector('#modal')?.addEventListener('close',familyStopVoice);
  speechSynthesis?.getVoices();
});
