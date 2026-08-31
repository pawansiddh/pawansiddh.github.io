from pathlib import Path
import base64, gzip, re, mimetypes, sys, json

ROOT = Path(__file__).resolve().parents[1]
OUTDIR = ROOT / 'offline-build'
OUTDIR.mkdir(exist_ok=True)
OUT = OUTDIR / 'PAWANRO_Finance_Lifetime_Offline_EXACT.html'

def unpack_parts(folder, count):
    packed = ''.join((ROOT / folder / f'{i}.txt').read_text(encoding='utf-8').strip() for i in range(count))
    return gzip.decompress(base64.b64decode(packed)).decode('utf-8')

def read(name):
    p = ROOT / name
    if not p.exists(): raise FileNotFoundError(name)
    return p.read_text(encoding='utf-8')

def join_text_parts(folder, stem, count):
    return ''.join(read(f'{folder}/{stem}-{i}.txt').strip() for i in range(count))

def unwrap_runtime(code):
    if 'DecompressionStream' not in code: return code
    m = re.search(r"const\s+P=['\"]([A-Za-z0-9+/=]+)['\"]", code)
    if not m: return code
    try: return gzip.decompress(base64.b64decode(m.group(1))).decode('utf-8')
    except Exception: return code

def runtime_policy(label, code):
    slow = label in {'phase1-status-fix-r1','interaction-audit-r1','daily-briefing-r2','phase2-r1','ui-controls-r2'}
    block_observer = label in {'debt-lab-r1','theme-studio-r1'}
    fallback = label == 'interaction-audit-r1'
    if not (slow or block_observer or fallback): return code
    setup=[];restore=[]
    if block_observer:
        setup.append("const __pvMO=window.MutationObserver;if(__pvMO)window.MutationObserver=class extends __pvMO{observe(t,o){if((t===document.body||t===document.documentElement)&&o?.subtree)return;return super.observe(t,o)}};")
        restore.append("if(__pvMO)window.MutationObserver=__pvMO;")
    if slow:
        setup.append("const __pvSI=window.setInterval;window.setInterval=(fn,ms,...a)=>__pvSI(fn,Math.max(Number(ms)||0,5000),...a);")
        restore.append("window.setInterval=__pvSI;")
    if fallback:
        setup.append("const __pvAdd=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(type,listener,options){if(this===document&&type==='click'&&listener?.name==='intercept'){const wrapped=function(e){const b=e.target?.closest?.('button');if(b&&(b.matches('.pv-p1-action,.pv-c2-action,.pv-pl-action,.pv-r-action')||b.closest('.pv-p1-modal,.pv-c2-modal,.pv-pl-modal,.pv-r-modal,.pv-pl-panel,.pv-r-panel')))return;return listener.call(this,e)};return __pvAdd.call(this,type,wrapped,options)}return __pvAdd.call(this,type,listener,options)};")
        restore.append("EventTarget.prototype.addEventListener=__pvAdd;")
    return "(()=>{"+''.join(setup)+"try{\n"+code+"\n}finally{"+''.join(restore)+"}})();"

def safe_script(code): return code.replace('</script>', '<\\/script>')
def script_tag(code,label): return f'\n<script data-pawanro-bundled="{label}">\n{safe_script(code)}\n//# sourceURL=pawanro-offline-{label}.js\n</script>\n'
def style_tag(css,label): return f'\n<style data-pawanro-bundled="{label}">\n{css.replace("</style>", "<\\/style>")}\n</style>\n'
def delayed_scripts(items,delay=120):
    payload=[]
    for label,code in items:
        code=runtime_policy(label,code);payload.append([label,base64.b64encode(code.encode()).decode('ascii')])
    js="(()=>{const P="+json.dumps(payload,separators=(',',':'))+f";setTimeout(()=>{{for(const [n,b] of P){{const s=document.createElement('script');s.textContent=atob(b)+'\\n//# sourceURL=pawanro-offline-'+n+'.js';document.documentElement.appendChild(s);s.remove();}}document.documentElement.classList.remove('pv-offline-booting');}}, {delay});}})();"
    return script_tag(js,'phase-loader')

html=unpack_parts('data',10)
html=re.sub(r'<script[^>]+src=["\'][^"\']*patch-loader(?:-fast-r1)?\.js[^"\']*["\'][^>]*>\s*</script>','',html,flags=re.I)
html=re.sub(r'navigator\.serviceWorker\.register\([^;]+;?','Promise.resolve()',html)

def inline_asset(m):
    attr,quote,value=m.group(1),m.group(2),m.group(3)
    if value.startswith(('data:','http:','https:','#','blob:','javascript:','mailto:')): return m.group(0)
    clean=value.split('?',1)[0].split('#',1)[0];p=ROOT/clean
    if not p.exists() or not p.is_file(): return m.group(0)
    mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    return f'{attr}={quote}data:{mime};base64,{base64.b64encode(p.read_bytes()).decode("ascii")}{quote}'
html=re.sub(r'\b(src|poster)=(["\'])([^"\']+)\2',inline_asset,html,flags=re.I)

def inline_link(m):
    tag=m.group(0);hm=re.search(r'href=["\']([^"\']+)["\']',tag,flags=re.I)
    if not hm:return tag
    href=hm.group(1)
    if href.startswith(('http:','https:','data:')):return tag
    p=ROOT/href.split('?',1)[0]
    return style_tag(p.read_text(encoding='utf-8'),f'base-{p.stem}') if p.exists() and p.suffix.lower()=='.css' else tag
html=re.sub(r'<link\b[^>]*rel=["\'][^"\']*stylesheet[^"\']*["\'][^>]*>',inline_link,html,flags=re.I)

def inline_script(m):
    tag,src=m.group(0),m.group(1)
    if src.startswith(('http:','https:','data:')):return tag
    clean=src.split('?',1)[0]
    if clean.endswith(('patch-loader.js','patch-loader-fast-r1.js')):return ''
    p=ROOT/clean
    return script_tag(p.read_text(encoding='utf-8'),f'base-{p.stem}') if p.exists() and p.suffix.lower()=='.js' else tag
html=re.sub(r'<script\b[^>]*src=["\']([^"\']+)["\'][^>]*>\s*</script>',inline_script,html,flags=re.I)

try:
    unpack_parts('patch6',4);print('NOTE: patch6 decoded; repository behavior changed since consolidation.')
except Exception as e: print('Final Demo 2 intentionally skips malformed patch6:',e)
runtime=[('script','patch-v4',unpack_parts('patch',4)),('script','patch-v5',read('patch-v5.js')),('script','baseline-v3',read('finance-baseline-v3.js')),('style','baseline-v3-css',read('finance-baseline-v3.css')),('script','search-r3',read('finance-search-controller-r3.js')),('style','sidebar-clean-r1',read('finance-sidebar-clean-r1.css')),('script','debt-lab-r1',read('finance-debt-lab-r1.js')),('script','theme-studio-r1',read('finance-theme-studio-r1.js')),('script','bell-contrast-r1',read('finance-bell-contrast-r1.js'))]
brand_word=join_text_parts('brand-b64','word',4)
brand_icon=join_text_parts('brand-b64','icon',2)
brand_assets_js=("window.__PAWANRO_BRAND_WORD_B64__="+json.dumps(brand_word)+";window.__PAWANRO_BRAND_ICON_B64__="+json.dumps(brand_icon)+";")
phase_scripts=[('state-bridge-r1',read('finance-state-bridge-r1.js')),('phase1-r3',read('finance-phase1-r3.js')),('phase1-core2-r1',read('finance-phase1-core2-r1.js')),('phase1-planning-r1',read('finance-phase1-planning-r1.js')),('phase1-records-r1',read('finance-phase1-records-r1.js')),('phase1-status-fix-r1',read('finance-phase1-status-fix-r1.js')),('interaction-audit-r1',read('finance-interaction-audit-r1.js')),('daily-briefing-r2',read('finance-daily-briefing-r2.js')),('calendar-studio-r1',unwrap_runtime(read('finance-calendar-studio-r1.js'))),('coedit-audit-r1',unwrap_runtime(read('finance-coedit-audit-r1.js'))),('coedit-owner-marker',"window.__PV_COEDIT_AUDIT_ACTIVE__=!!window.PavenroCoeditAudit;"),('phase2-r1',read('finance-phase2-r1.js')),('ui-controls-r2',read('finance-ui-controls-r2.js')),('brand-assets-r1',brand_assets_js),('sidebar-owner-r1',read('finance-sidebar-owner-r1.js'))]
offline_safety=r'''(()=>{window.__PAVENRO_LIFETIME_OFFLINE__=true;document.documentElement.dataset.pavenroEdition='lifetime-offline';document.documentElement.dataset.network=navigator.onLine?'online':'offline';addEventListener('online',()=>document.documentElement.dataset.network='online');addEventListener('offline',()=>document.documentElement.dataset.network='offline');window.PavenroOfflineBackup={export(){const d={edition:'PAWANRO Finance Lifetime Offline',version:6,created:new Date().toISOString(),localStorage:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&/pavenro|pawanro|finance|pv-fin/i.test(k))d.localStorage[k]=localStorage.getItem(k)}const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='PAWANRO-Finance-Backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)},async import(file){const d=JSON.parse(await file.text());if(!d?.localStorage)throw Error('This is not a PAWANRO Finance backup.');Object.entries(d.localStorage).forEach(([k,v])=>localStorage.setItem(k,String(v)));location.reload()}};function mountBackup(){const title=(document.querySelector('#pvTop .pv-title,.topbar .pv-title,.workspace h1')?.textContent||'').toLowerCase();if(!title.includes('settings')||document.querySelector('#pvOfflineBackupBox'))return;const cards=[...document.querySelectorAll('.card,.settings-card,.settings-pane')],host=cards.find(c=>/data\s*&\s*backup|backup/i.test(c.textContent||''))||cards[cards.length-1];if(!host)return;const x=document.createElement('div');x.id='pvOfflineBackupBox';x.style.cssText='margin-top:10px;padding:10px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:10px;background:var(--pvx-panel2,var(--panel2,#eef3ee));font:11px Inter,system-ui';x.innerHTML='<b>Lifetime Offline Backup</b><div style="margin-top:4px;opacity:.7">Export a backup before changing browser or computer.</div><div style="display:flex;gap:7px;margin-top:8px;flex-wrap:wrap"><button type="button" data-pv-export>Export Backup</button><button type="button" data-pv-import>Restore Backup</button><input hidden type="file" accept="application/json,.json" data-pv-file></div>';host.appendChild(x);const f=x.querySelector('[data-pv-file]');x.querySelector('[data-pv-export]').onclick=()=>PavenroOfflineBackup.export();x.querySelector('[data-pv-import]').onclick=()=>f.click();f.onchange=()=>f.files?.[0]&&PavenroOfflineBackup.import(f.files[0]).catch(e=>alert(e.message))}document.addEventListener('click',()=>setTimeout(mountBackup,180),true);setInterval(mountBackup,5000);setTimeout(mountBackup,500)})();'''
phase_scripts.append(('offline-safety',offline_safety))
boot='''<style id="pvOfflineBootMask">html.pv-offline-booting body{opacity:0!important;pointer-events:none!important}html.pv-offline-booting::before{content:"Loading PAWANRO Finance...\\A Lifetime Offline Edition";white-space:pre;position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;text-align:center;background:#f5f6f1;color:#17301f;font:600 15px/1.8 Inter,system-ui}html.pv-offline-booting::after{content:"";position:fixed;left:50%;top:calc(50% - 48px);z-index:2147483647;width:36px;height:36px;margin:-18px 0 0 -18px;border:4px solid #dce8df;border-top-color:#28623f;border-radius:50%;animation:pvOfflineSpin .8s linear infinite}@keyframes pvOfflineSpin{to{transform:rotate(360deg)}}</style><script>document.documentElement.classList.add('pv-offline-booting')</script>'''
meta='<meta name="pavenro-edition" content="PAWANRO Finance Lifetime Offline"><meta name="robots" content="noindex,nofollow">'
if '<head>' in html.lower():
    p=html.lower().find('<head>')+len('<head>');html=html[:p]+meta+boot+html[p:]
bundle=''
for kind,label,code in runtime:bundle+=script_tag(runtime_policy(label,code),label) if kind=='script' else style_tag(code,label)
bundle+=script_tag("document.dispatchEvent(new CustomEvent('pavenro:ready'));",'ready-event')+delayed_scripts(phase_scripts,120)
if '</body>' in html.lower():p=html.lower().rfind('</body>');html=html[:p]+bundle+html[p:]
else:html+=bundle
for forbidden in ['src="patch-loader.js',"src='patch-loader.js",'src="patch-loader-fast-r1.js',"src='patch-loader-fast-r1.js",'data/0.txt','finance-phase1-r1.js','finance-phase1-r2.js','finance-daily-briefing-r1.js','"ui-controls-r1"','"brand-sidebar-r1"','"sidebar-shell-r2"']:
    if forbidden in html:raise RuntimeError('Residual superseded/online dependency: '+forbidden)
external_resources=re.findall(r'<(?:script|link|img)\b[^>]*(?:src|href)=["\']https?://[^"\']+',html,flags=re.I)
if external_resources:print('WARNING: external resource tags remain:',len(external_resources),file=sys.stderr)
OUT.write_text(html,encoding='utf-8');print(f'Built {OUT} ({OUT.stat().st_size:,} bytes)');print('Runtime layers:',[x[1] for x in runtime]);print('Final feature layers:',[x[0] for x in phase_scripts])