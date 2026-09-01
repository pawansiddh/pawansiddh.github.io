import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const data = (file,type) => `data:${type};base64,${fs.readFileSync(path.join(root,file)).toString('base64')}`;
const escapeScript = source => source.replaceAll('</script','<\\/script');
const escapeStyle = source => source.replaceAll('</style','<\\/style');

const cssFiles=['styles.css','enhancements.css','tracker-update.css','nestlyra-v37.css','nestlyra-v39.css','nestlyra-v42.css','nestlyra-v43.css','pavenro-brand.css','focus-v48.css','focus-professional-v49.css','tulshii-auth-v58.css','offline-mode.css'];
const scriptFiles=['jobs.js','family.js','app.js','tracker-modules.js','nestlyra-v37.js','nestlyra-v39.js','nestlyra-v42.js','pavenro-brand.js','focus-v48.js','focus-professional-v49.js','offline-mode.js'];
const wordmark=data('tulshii-wordmark.svg','image/svg+xml');
const loginWordmark=data('tulshii-login-lockup.svg','image/svg+xml');
const icon=data('tulshii-mark.svg','image/svg+xml');

let html=read('index.html');
html=html
  .replace(/\s*<link rel="preconnect"[^>]*>/g,'')
  .replace(/\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>/g,'')
  .replace(/\s*<link rel="stylesheet" href="[^"]+"\s*\/>/g,'')
  .replace(/\s*<link rel="manifest"[^>]*>/g,'')
  .replace(/<link rel="icon"[^>]*>/,`<link rel="icon" type="image/svg+xml" href="${icon}">`)
  .replace('</head>',`<style id="pavenro-offline-styles">${escapeStyle(cssFiles.map(file=>`/* ${file} */\n${read(file)}`).join('\n'))}\n:root{--pavenro-wordmark:url("${wordmark}")}\nbody{font-family:Inter,Segoe UI,system-ui,-apple-system,sans-serif}</style></head>`)
  .replaceAll('src="tulshii-login-lockup.svg"',`src="${loginWordmark}"`)
  .replaceAll('src="tulshii-wordmark.svg"','src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" data-tulshii-wordmark')
  .replaceAll('src="tulshii-mark.svg"',`src="${icon}"`)
  .replace(/\s*<button data-view="groups"[^>]*>.*?<\/button>/,'')
  .replace(/\s*<button id="floatingMessages"[\s\S]*?<\/button>/,'')
  .replace(/\s*<div class="parent-product-credit">[\s\S]*?<\/div>/,'')
  .replace('Cloud continuity online · local access offline','Private local storage · no account server')
  .replace('Email or local account name','Local account name')
  .replace('you@example.com','Your name')
  .replace('Password or local PIN','Local PIN')
  .replace('Enter your password','Enter your PIN')
  .replace('New to TULSHII? Create an account','Create local account')
  .replace('<strong>Private by design.</strong> Google sign-in requests basic identity only; Drive access is never requested.','<strong>100% device-only.</strong> No Google, Supabase or cloud permission is used.')
  .replace('Sign in to continue your private workspace, personal plans and shared progress.','A private workspace stored only in this browser.')
  .replace(/\s*<script src="https:\/\/cdn\.jsdelivr\.net[\s\S]*?<script src="focus-professional-v49\.js\?v=51"><\/script>/,buildScripts());

if(/<script src=/.test(html))throw new Error('Offline build still contains a script src');
if(/<link[^>]+href="https?:/i.test(html))throw new Error('Offline build still contains an external link resource');
fs.writeFileSync(path.join(root,'pavenro-focus-offline.html'),html);
console.log(`Built pavenro-focus-offline.html (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MiB)`);

function buildScripts(){
  const chart=escapeScript(read('offline-chart.js'));
  const transformed=scriptFiles.map(file=>{
    let source=read(file);
    if(file==='app.js'){
      source=source.replace(/boot\(\);if\('serviceWorker'in navigator\)\{[^\n]+\}/,'boot();');
    }
    if(file==='tracker-modules.js'){
      source=source
        .replace(/^\s*\{id:'groups'.*\n/m,'')
        .replaceAll(",'groups'",'')
        .replace("const UTILITY_DEFAULTS = ['groups','settings','help'];","const UTILITY_DEFAULTS = ['settings','help'];");
    }
    if(file==='nestlyra-v37.js'||file==='nestlyra-v42.js'){
      source=source
        .replaceAll('<button class="btn ghost" type="button" disabled title="Google Drive PDF storage is coming soon">☁ Drive PDF · Coming soon</button>','')
        .replaceAll('<button class="btn ghost" disabled title="Available after Google OAuth verification">☁ Drive PDF · Coming soon</button>','')
        .replaceAll("['Drive PDFs','Soon']","['Local resources',items.length]")
        .replaceAll('Curate useful links · Google Drive PDF storage is coming soon','Curate useful books, courses, links and tools locally');
    }
    return `/* ${file} */\n${escapeScript(source)}`;
  }).join('\n');
  return `<script>window.STUDY_TRACKER_CONFIG={supabaseUrl:'',supabaseAnonKey:''};window.TULSHII_WORDMARK_DATA=${JSON.stringify(wordmark)};</script>\n<script>${chart}</script>\n<script>${transformed}</script>`;
}
