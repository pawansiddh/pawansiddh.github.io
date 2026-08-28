from pathlib import Path
import base64, gzip, re, mimetypes, sys

ROOT = Path(__file__).resolve().parents[1]
OUTDIR = ROOT / 'offline-build'
OUTDIR.mkdir(exist_ok=True)
OUT = OUTDIR / 'PAVENRO_Finance_Lifetime_Offline_EXACT.html'


def unpack_parts(folder, count):
    packed = ''.join((ROOT / folder / f'{i}.txt').read_text(encoding='utf-8').strip() for i in range(count))
    return gzip.decompress(base64.b64decode(packed)).decode('utf-8')


def read(name):
    p = ROOT / name
    if not p.exists():
        raise FileNotFoundError(name)
    return p.read_text(encoding='utf-8')


def safe_script(code):
    return code.replace('</script>', '<\\/script>')


def script_tag(code, label):
    return f'\n<script data-pavenro-bundled="{label}">\n{safe_script(code)}\n//# sourceURL=pavenro-offline-{label}.js\n</script>\n'


def style_tag(css, label):
    return f'\n<style data-pavenro-bundled="{label}">\n{css.replace("</style>", "<\\/style>")}\n</style>\n'


def delayed_scripts(items, delay=140):
    payload = []
    for label, code in items:
        b64 = base64.b64encode(code.encode('utf-8')).decode('ascii')
        payload.append((label, b64))
    js = "(()=>{const P=" + repr(payload).replace("'", '"') + f";setTimeout(()=>{{for(const [n,b] of P){{const s=document.createElement('script');s.textContent=atob(b)+'\\n//# sourceURL=pavenro-offline-'+n+'.js';document.documentElement.appendChild(s);s.remove();}}document.documentElement.classList.remove('pv-offline-booting');}}, {delay});}})();"
    return script_tag(js, 'phase-loader')


# ---------------------------------------------------------------------------
# BASE: decode the exact HTML payload used by finance-demo2.
# ---------------------------------------------------------------------------
html = unpack_parts('data', 10)
html = re.sub(r'<script[^>]+src=["\'][^"\']*patch-loader\.js[^"\']*["\'][^>]*>\s*</script>', '', html, flags=re.I)
# file:// cannot register service workers; they are unrelated to Finance data persistence.
html = re.sub(r'navigator\.serviceWorker\.register\([^;]+;?', 'Promise.resolve()', html)

# Inline local image/media references already present in the packed page.
def inline_asset(m):
    attr, quote, value = m.group(1), m.group(2), m.group(3)
    if value.startswith(('data:', 'http:', 'https:', '#', 'blob:', 'javascript:', 'mailto:')):
        return m.group(0)
    clean = value.split('?', 1)[0].split('#', 1)[0]
    p = ROOT / clean
    if not p.exists() or not p.is_file():
        return m.group(0)
    mime = mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    return f'{attr}={quote}data:{mime};base64,{base64.b64encode(p.read_bytes()).decode("ascii")}{quote}'

html = re.sub(r'\b(src|poster)=(["\'])([^"\']+)\2', inline_asset, html, flags=re.I)

# Inline local stylesheets referenced by the base HTML itself.
def inline_link(m):
    tag = m.group(0)
    hm = re.search(r'href=["\']([^"\']+)["\']', tag, flags=re.I)
    if not hm:
        return tag
    href = hm.group(1)
    if href.startswith(('http:', 'https:', 'data:')):
        return tag
    p = ROOT / href.split('?', 1)[0]
    return style_tag(p.read_text(encoding='utf-8'), f'base-{p.stem}') if p.exists() and p.suffix.lower() == '.css' else tag

html = re.sub(r'<link\b[^>]*rel=["\'][^"\']*stylesheet[^"\']*["\'][^>]*>', inline_link, html, flags=re.I)

# Inline local scripts referenced by the base HTML itself.
def inline_script(m):
    tag, src = m.group(0), m.group(1)
    if src.startswith(('http:', 'https:', 'data:')):
        return tag
    clean = src.split('?', 1)[0]
    if clean.endswith('patch-loader.js'):
        return ''
    p = ROOT / clean
    return script_tag(p.read_text(encoding='utf-8'), f'base-{p.stem}') if p.exists() and p.suffix.lower() == '.js' else tag

html = re.sub(r'<script\b[^>]*src=["\']([^"\']+)["\'][^>]*>\s*</script>', inline_script, html, flags=re.I)

# ---------------------------------------------------------------------------
# CURRENT WEB RUNTIME PARITY
# finance-demo2's patch6 payload is malformed. The live patch-loader therefore:
# patch-v4 -> patch-v5 -> patch6 throws -> fallback baseline/search/sidebar/debt/theme/bell.
# We intentionally mirror that visible live state instead of inventing a repaired patch6.
# ---------------------------------------------------------------------------
try:
    unpack_parts('patch6', 4)
    print('NOTE: patch6 decoded; repository behavior changed since bundler was written.')
except Exception as e:
    print('Mirroring live fallback: skipping malformed patch6:', e)

runtime = [
    ('script', 'patch-v4', unpack_parts('patch', 4)),
    ('script', 'patch-v5', read('patch-v5.js')),
    ('script', 'baseline-v3', read('finance-baseline-v3.js')),
    ('style', 'baseline-v3-css', read('finance-baseline-v3.css')),
    ('script', 'search-r3', read('finance-search-controller-r3.js')),
    ('style', 'sidebar-clean-r1', read('finance-sidebar-clean-r1.css')),
    ('script', 'debt-lab-r1', read('finance-debt-lab-r1.js')),
    ('script', 'theme-studio-r1', read('finance-theme-studio-r1.js')),
    ('script', 'bell-contrast-r1', read('finance-bell-contrast-r1.js')),
]
phase_scripts = [
    ('state-bridge-r1', read('finance-state-bridge-r1.js')),
    ('phase1-r3', read('finance-phase1-r3.js')),
    ('phase1-core2-r1', read('finance-phase1-core2-r1.js')),
    ('phase1-planning-r1', read('finance-phase1-planning-r1.js')),
    ('phase1-records-r1', read('finance-phase1-records-r1.js')),
    ('phase1-status-fix-r1', read('finance-phase1-status-fix-r1.js')),
    ('interaction-audit-r1', read('finance-interaction-audit-r1.js')),
]

# Offline-only safety. No normal Finance screen is redesigned.
offline_safety = r'''
(()=>{
  window.__PAVENRO_LIFETIME_OFFLINE__=true;
  document.documentElement.dataset.pavenroEdition='lifetime-offline';
  document.documentElement.dataset.network=navigator.onLine?'online':'offline';
  addEventListener('online',()=>document.documentElement.dataset.network='online');
  addEventListener('offline',()=>document.documentElement.dataset.network='offline');
  window.PavenroOfflineBackup={
    export(){
      const d={edition:'PAVENRO Finance Lifetime Offline',version:1,created:new Date().toISOString(),localStorage:{}};
      for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&/pavenro|finance|pv-fin/i.test(k))d.localStorage[k]=localStorage.getItem(k)}
      const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='PAVENRO-Finance-Backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)
    },
    async import(file){const d=JSON.parse(await file.text());if(!d?.localStorage)throw Error('This is not a PAVENRO Finance backup.');Object.entries(d.localStorage).forEach(([k,v])=>localStorage.setItem(k,String(v)));location.reload()}
  };
  function mountBackup(){
    const title=(document.querySelector('#pvTop .pv-title,.topbar .pv-title,.workspace h1')?.textContent||'').toLowerCase();if(!title.includes('settings')||document.querySelector('#pvOfflineBackupBox'))return;
    const cards=[...document.querySelectorAll('.card,.settings-card,.settings-pane')],host=cards.find(c=>/data\s*&\s*backup|backup/i.test(c.textContent||''))||cards[cards.length-1];if(!host)return;
    const x=document.createElement('div');x.id='pvOfflineBackupBox';x.style.cssText='margin-top:10px;padding:10px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:10px;background:var(--pvx-panel2,var(--panel2,#eef3ee));font:11px Inter,system-ui';x.innerHTML='<b>Lifetime Offline Backup</b><div style="margin-top:4px;opacity:.7">Export a backup before changing browser or computer.</div><div style="display:flex;gap:7px;margin-top:8px;flex-wrap:wrap"><button type="button" data-pv-export>Export Backup</button><button type="button" data-pv-import>Restore Backup</button><input hidden type="file" accept="application/json,.json" data-pv-file></div>';host.appendChild(x);const f=x.querySelector('[data-pv-file]');x.querySelector('[data-pv-export]').onclick=()=>PavenroOfflineBackup.export();x.querySelector('[data-pv-import]').onclick=()=>f.click();f.onchange=()=>f.files?.[0]&&PavenroOfflineBackup.import(f.files[0]).catch(e=>alert(e.message))
  }
  document.addEventListener('click',()=>setTimeout(mountBackup,180),true);setInterval(mountBackup,1200);setTimeout(mountBackup,500)
})();
'''
phase_scripts.append(('offline-safety', offline_safety))

# CSS-only boot mask: never participates in app layout measurements.
boot = '''<style id="pvOfflineBootMask">html.pv-offline-booting body{opacity:0!important;pointer-events:none!important}html.pv-offline-booting::before{content:"Loading PAVENRO Finance...\\A Lifetime Offline Edition";white-space:pre;position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;text-align:center;background:#f5f6f1;color:#17301f;font:600 15px/1.8 Inter,system-ui}html.pv-offline-booting::after{content:"";position:fixed;left:50%;top:calc(50% - 48px);z-index:2147483647;width:36px;height:36px;margin:-18px 0 0 -18px;border:4px solid #dce8df;border-top-color:#28623f;border-radius:50%;animation:pvOfflineSpin .8s linear infinite}@keyframes pvOfflineSpin{to{transform:rotate(360deg)}}</style><script>document.documentElement.classList.add('pv-offline-booting')</script>'''
meta = '<meta name="pavenro-edition" content="Finance Lifetime Offline"><meta name="robots" content="noindex,nofollow">'
if '<head>' in html.lower():
    p = html.lower().find('<head>') + len('<head>')
    html = html[:p] + meta + boot + html[p:]

# Exact runtime ordering matters for card sizes, text positions, themes and feature overrides.
bundle = ''
for kind, label, code in runtime:
    bundle += script_tag(code, label) if kind == 'script' else style_tag(code, label)
bundle += script_tag("document.dispatchEvent(new CustomEvent('pavenro:ready'));", 'ready-event')
bundle += delayed_scripts(phase_scripts, 140)

if '</body>' in html.lower():
    p = html.lower().rfind('</body>')
    html = html[:p] + bundle + html[p:]
else:
    html += bundle

# QA: no network loader is needed at runtime.
for forbidden in ['src="patch-loader.js', "src='patch-loader.js", 'data/0.txt']:
    if forbidden in html:
        raise RuntimeError('Residual online dependency: '+forbidden)
external_resources = re.findall(r'<(?:script|link|img)\b[^>]*(?:src|href)=["\']https?://[^"\']+', html, flags=re.I)
if external_resources:
    print('WARNING: external resource tags remain:', len(external_resources), file=sys.stderr)

OUT.write_text(html, encoding='utf-8')
print(f'Built {OUT} ({OUT.stat().st_size:,} bytes)')
print('Runtime layers:', [x[1] for x in runtime])
print('Delayed feature layers:', [x[0] for x in phase_scripts])
