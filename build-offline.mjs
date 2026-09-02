import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const data = (file,type) => `data:${type};base64,${fs.readFileSync(path.join(root,file)).toString('base64')}`;
const escapeScript = source => source.replaceAll('</script','<\\/script');
const escapeStyle = source => source.replaceAll('</style','<\\/style');

const cssFiles=['styles.css','enhancements.css','tracker-update.css','nestlyra-v37.css','nestlyra-v39.css','nestlyra-v42.css','nestlyra-v43.css','pavenro-brand.css','focus-v48.css','focus-professional-v49.css','offline-mode.css'];
const scriptFiles=['jobs.js','family.js','app.js','tracker-modules.js','nestlyra-v37.js','nestlyra-v39.js','nestlyra-v42.js','pavenro-brand.js','focus-v48.js','focus-professional-v49.js','offline-mode.js'];
const wordmark=data('tulshii-wordmark.svg','image/svg+xml');
const icon=data('tulshii-mark.svg','image/svg+xml');

let html=read('index.html');
html=html
  .replace(/\s*<script>try\{const saved=JSON\.parse\(localStorage\.getItem\('studyTracker\.v30'\)[\s\S]*?<\/script>/,'')
  .replace(/\s*<link rel="preconnect"[^>]*>/g,'')
  .replace(/\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>/g,'')
  .replace(/\s*<link rel="stylesheet" href="[^"]+"\s*\/>/g,'')
  .replace(/\s*<link rel="manifest"[^>]*>/g,'')
  .replace(/<link rel="icon"[^>]*>/,`<link rel="icon" type="image/svg+xml" href="${icon}">`)
  .replace('</head>',`<style id="pavenro-offline-styles">${escapeStyle(cssFiles.map(file=>`/* ${file} */\n${read(file)}`).join('\n'))}\n:root{--pavenro-wordmark:url("${wordmark}")}\nbody{font-family:Inter,Segoe UI,system-ui,-apple-system,sans-serif}</style></head>`)
  .replaceAll('src="tulshii-wordmark.svg"','src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" data-tulshii-wordmark')
  .replaceAll('src="tulshii-mark.svg"',`src="${icon}"`)
  .replace(/\s*<section id="authScreen"[\s\S]*?<\/section>\s*(?=<div id="app")/,'\n  ')
  .replace('<div id="app" class="app hidden">','<div id="app" class="app">')
  .replace(/\s*<button data-view="groups"[^>]*>.*?<\/button>/,'')
  .replace(/\s*<button id="floatingMessages"[\s\S]*?<\/button>/,'')
  .replace(/\s*<div class="parent-product-credit">[\s\S]*?<\/div>/,'')
  .replace(/\s*<script src="https:\/\/cdn\.jsdelivr\.net[\s\S]*?<script src="focus-professional-v49\.js\?v=51"><\/script>/,buildScripts());

if(/<script src=/.test(html))throw new Error('Offline build still contains a script src');
if(/<link[^>]+href="https?:/i.test(html))throw new Error('Offline build still contains an external link resource');
if(/id="(?:authScreen|loginForm|loginName|loginPin|googleLoginBtn|createLearnerAccountBtn)"/.test(html))throw new Error('Offline build still contains authentication UI');
fs.writeFileSync(path.join(root,'tulshii-focus-offline.html'),html);
console.log(`Built tulshii-focus-offline.html (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MiB)`);

function buildScripts(){
  const chart=escapeScript(read('offline-chart.js'));
  const transformed=scriptFiles.map(file=>{
    let source=read(file);
    if(file==='app.js'){
      source=source
        .replace(/^function save\(\)\{.*$/m,"function save(){if(state?.workspaces?.length&&typeof storeWorkspace==='function')storeWorkspace();localStorage.setItem(KEY,JSON.stringify(state));applyTheme()}")
        .replace(/^async function syncCloud\(\).*\n?/m,'')
        .replace(/^async function loadCloud\(\).*\n?/m,'')
        .replace(/^function markCloudAccount\(.*\n?/m,'')
        .replace(/^function viewStorageKey\(\)\{.*$/m,"function viewStorageKey(){const identity=state.profile?.name||'offline-device';return `${LAST_VIEW_PREFIX}:${String(identity).toLowerCase()}`}")
        .replace(/^function clearClientAccount\(\).*\n?/m,'')
        .replace(/^async function invalidateCloudSession\(.*\n?/m,'')
        .replace(/^async function login\(e\).*\n?/m,'')
        .replace(/^async function createLearnerAccount\(\).*\n?/m,'')
        .replace(/^function showApp\(\)\{.*$/m,"function showApp(){restoreView();applyTheme(true);document.documentElement.classList.remove('session-pending');app.classList.remove('hidden');avatar.textContent=(state.profile?.name||'T')[0].toUpperCase();rememberView();updateViewHistory(viewName,{replace:true});render();if(state.settings?.categorySetupPending)setTimeout(()=>window.openFocusCategorySetup?.(),120);if(typeof familyOnAppShown==='function')familyOnAppShown();if(typeof familyScheduleBriefing==='function')familyScheduleBriefing();else setTimeout(welcomeBriefing,300)}")
        .replace(/^function helpView\(\).*$/m,"function helpView(){return head('Offline manual','Loading the device-only guide…')}")
        .replace(/^window\.loginFaqModal=.*\n?/m,'')
        .replace('messages:window.familyMessagingView,','')
        .replace("loginForm.addEventListener('submit',login);createLearnerAccountBtn.onclick=createLearnerAccount;document.querySelectorAll('[data-login-faq]').forEach(button=>button.onclick=loginFaqModal);googleLoginBtn.onclick=()=>{if(!sb)return toast('Cloud login is unavailable');sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin}})};",'')
        .replace(/async function boot\(\)\{[\s\S]*?\n\}\nboot\(\);if\('serviceWorker'in navigator\)\{[^\n]+\}/,"function boot(){applyTheme();cleanAppUrl();sessionStorage.removeItem('studyTracker.forceLogin');localStorage.removeItem(CLOUD_ACCOUNT_KEY);state.profile=state.profile||{name:'My Workspace'};delete state.profile.email;delete state.profile.pin;save();showApp();document.documentElement.classList.remove('session-pending')}\nboot();")
        .replace(/^googleLoginBtn\.onclick=.*\n?/m,'')
        .replace(/^window\.profileModal=.*\n?/m,'')
        .replace(/^window\.saveProfile=.*\n?/m,'')
        .replace(/^window\.signOut=.*\n?/m,'')
        .replace(/^window\.deleteAccountModal=.*\n?/m,'')
        .replace(/^window\.deleteAccount=.*\n?/m,'')
        .replace(/^async function validateCloudAccount\(\).*\n?/m,'')
        .replace(/^setInterval\(validateCloudAccount,30000\);\n?/m,'')
        .replace(/^addEventListener\('focus',validateCloudAccount\);\n?/m,'')
        .replace(/^document\.addEventListener\('visibilitychange'.*validateCloudAccount.*\n?/m,'');
      if(/\b(?:loginForm|googleLoginBtn|createLearnerAccountBtn)\b/.test(source))throw new Error('Offline app transform left an authentication control reference');
    }
    if(file==='family.js'){
      source=source
        .replace(/^async function getCloudFamilyUser\(\).*$/m,'async function getCloudFamilyUser(){return null}')
        .replace(/^async function registerCloudRole\(\).*\n?/m,'')
        .replace(/^window\.familyResolveAuthenticatedRole=.*\n?/m,'')
        .replace(/async function syncCloudActivity\(force=false\)\{[\s\S]*?\n\}/,'async function syncCloudActivity(){return null}')
        .replace("  const groupCard=typeof groupSettingsCard==='function'?groupSettingsCard():'';","  const groupCard='';")
        .replace('Groups receive only the aggregate values you choose to share.','All activity summaries remain on this device.')
        .replace(/^window\.familyOnAppShown=.*$/m,"window.familyOnAppShown=async()=>{document.body.classList.remove('parent-mode','parent-observer-mode');startActivityTracking()};")
        .replace(/^window\.joinFamilyCode=.*\n?/m,'')
        .replace(/^window\.generateFamilyCode=.*\n?/m,'')
        .replace(/^window\.renderParentPortal=.*\n?/m,'')
        .replace(/^window\.familyParentLogout=.*\n?/m,'')
        .replace(/^window\.familyOpenLearnerWorkspace=.*\n?/m,'')
        .replace(/^window\.familyReturnToPortal=.*\n?/m,'');
    }
    if(file==='jobs.js'){
      source=source
      .replace(/^const baseJobTracker=jobTracker;\njobTracker=.*\n?/m,'')
      .replace(
        'Nestlyra Focus stores new attachment files privately in this browser. Google Drive sync is planned; it is not enabled yet.',
        'TULSHII Focus stores new attachment files privately in this browser. The offline edition never uploads them.'
      );
    }
    if(file==='tracker-modules.js'){
      source=source
        .replace(/^\s*\{id:'groups'.*\n/m,'')
        .replaceAll(",'groups'",'')
        .replaceAll(",'messages'",'')
        .replace(",groups:'groups'",'')
        .replace("const UTILITY_DEFAULTS = ['groups','settings','help'];","const UTILITY_DEFAULTS = ['settings','help'];");
      source=source
        .replace(/\n  function validFamilyInvite\(\) \{[\s\S]*?\n  window\.familyOpenLearnerWorkspace=.*?;\n/,'\n')
        .replace(/\n    if\(sessionStorage\.getItem\('studyTracker\.openParentLogin'\)\)\{[\s\S]*?\n    \}\n/,'\n')
        .replace('Dashboard, Settings, the Manual and the floating Messages button remain available.','Dashboard, Settings and the Manual remain available.')
        .replace("<li><strong>Google Drive PDF storage is coming soon.</strong> The button remains disabled until Nestlyra completes Google OAuth verification.</li><li>Standard Google sign-in requests only basic account identity and does not request Drive access.</li>","<li>Resources and their notes are saved locally in this browser.</li>");
    }
    if(file==='focus-v48.js'){
      source=source
        .replace('<span>Account saved</span>','<span>Saved on this device</span>')
        .replace(/\s*<label>Login image framing<select[\s\S]*?<\/select><\/label>/,'')
        .replace(/\s*<section class="appearance-group login-image-settings">[\s\S]*?<\/section>/,'');
    }
    if(file==='nestlyra-v37.js'||file==='nestlyra-v42.js'){
      source=source
        .replaceAll('<button class="btn ghost" type="button" disabled title="Google Drive PDF storage is coming soon">☁ Drive PDF · Coming soon</button>','')
        .replaceAll('<button class="btn ghost" disabled title="Available after Google OAuth verification">☁ Drive PDF · Coming soon</button>','')
        .replaceAll("['Drive PDFs','Soon']","['Local resources',items.length]")
        .replaceAll('Curate useful links · Google Drive PDF storage is coming soon','Curate useful books, courses, links and tools locally')
        .replace("item.driveFileId?'Google Drive':''","item.driveFileId?'Attached document':''")
        .replace(/^  window\.openDrivePdfPicker=.*\n?/m,'');
      if(file==='nestlyra-v37.js'){
        source=source
          .replace(/^  window\.profileModal=.*\n?/m,'')
          .replace(/^  window\.saveProfileV37=.*\n?/m,'');
      }
    }
    return `/* ${file} */\n${escapeScript(source)}`;
  }).join('\n');
  return `<script>window.STUDY_TRACKER_CONFIG={supabaseUrl:'',supabaseAnonKey:''};window.TULSHII_WORDMARK_DATA=${JSON.stringify(wordmark)};</script>\n<script>${chart}</script>\n<script>${transformed}</script>`;
}
