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


def script_tag(code, label):
    # Preserve separate classic script scopes exactly like external <script> files.
    code = code.replace('</script>', '<\\/script>')
    return f'\n<script data-pavenro-bundled="{label}">\n{code}\n//# sourceURL=pavenro-offline-{label}.js\n</script>\n'


def style_tag(css, label):
    css = css.replace('</style>', '<\\/style>')
    return f'\n<style data-pavenro-bundled="{label}">\n{css}\n</style>\n'


# 1) The actual web application's original HTML payload.
html = unpack_parts('data', 10)

# Remove the online patch loader if it somehow exists in the packed HTML.
html = re.sub(r'<script[^>]+src=["\'][^"\']*patch-loader\.js[^"\']*["\'][^>]*>\s*</script>', '', html, flags=re.I)

# File:// does not support service workers. They are not required for local persistence.
html = re.sub(r'navigator\.serviceWorker\.register\([^;]+;?', 'Promise.resolve()', html)

# 2) Inline any local image/font/media references already present in the base HTML.
def inline_asset(m):
    attr, quote, value = m.group(1), m.group(2), m.group(3)
    if value.startswith(('data:', 'http:', 'https:', '#', 'blob:', 'javascript:', 'mailto:')):
        return m.group(0)
    clean = value.split('?', 1)[0].split('#', 1)[0]
    p = ROOT / clean
    if not p.exists() or not p.is_file():
        return m.group(0)
    mime = mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    encoded = base64.b64encode(p.read_bytes()).decode('ascii')
    return f'{attr}={quote}data:{mime};base64,{encoded}{quote}'

html = re.sub(r'\b(src|poster)=(["\'])([^"\']+)\2', inline_asset, html, flags=re.I)

# Inline local stylesheet <link> tags from the packed page.
def inline_link(m):
    tag = m.group(0)
    hm = re.search(r'href=["\']([^"\']+)["\']', tag, flags=re.I)
    if not hm:
        return tag
    href = hm.group(1)
    if href.startswith(('http:', 'https:', 'data:')):
        return tag
    p = ROOT / href.split('?', 1)[0]
    if p.exists() and p.suffix.lower() == '.css':
        return style_tag(p.read_text(encoding='utf-8'), f'base-{p.stem}')
    return tag

html = re.sub(r'<link\b[^>]*rel=["\'][^"\']*stylesheet[^"\']*["\'][^>]*>', inline_link, html, flags=re.I)

# Inline local external scripts from the packed page itself, except the online loader.
def inline_script(m):
    tag, src = m.group(0), m.group(1)
    if src.startswith(('http:', 'https:', 'data:')):
        return tag
    clean = src.split('?', 1)[0]
    if clean.endswith('patch-loader.js'):
        return ''
    p = ROOT / clean
    if p.exists() and p.suffix.lower() == '.js':
        return script_tag(p.read_text(encoding='utf-8'), f'base-{p.stem}')
    return tag

html = re.sub(r'<script\b[^>]*src=["\']([^"\']+)["\'][^>]*>\s*</script>', inline_script, html, flags=re.I)

# 3) Exact current Demo2 runtime order from patch-loader.js.
core_scripts = [
    ('patch-v4', unpack_parts('patch', 4)),
    ('patch-v5', read('patch-v5.js')),
    ('patch-v6', unpack_parts('patch6', 4)),
    ('baseline-v3', read('finance-baseline-v3.js')),
    ('search-r3', read('finance-search-controller-r3.js')),
    ('debt-lab-r1', read('finance-debt-lab-r1.js')),
    ('theme-studio-r1', read('finance-theme-studio-r1.js')),
    ('bell-contrast-r1', read('finance-bell-contrast-r1.js')),
]
core_styles = [
    ('baseline-v3-css', read('finance-baseline-v3.css')),
    ('sidebar-clean-r1', read('finance-sidebar-clean-r1.css')),
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

# A tiny offline-only safety layer. It does not alter the normal visual layout.
offline_safety = r'''
(()=>{
  window.__PAVENRO_LIFETIME_OFFLINE__=true;
  document.documentElement.dataset.pavenroEdition='lifetime-offline';
  // Prevent old code from implying that a backend is available.
  window.addEventListener('online',()=>document.documentElement.dataset.network=navigator.onLine?'online':'offline');
  window.addEventListener('offline',()=>document.documentElement.dataset.network='offline');
  document.documentElement.dataset.network=navigator.onLine?'online':'offline';

  // Full local backup: captures every Pavenro/Finance localStorage namespace.
  window.PavenroOfflineBackup={
    export(){
      const data={edition:'PAVENRO Finance Lifetime Offline',version:1,created:new Date().toISOString(),localStorage:{}};
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i); if(!k)continue;
        if(/pavenro|finance|pv-fin/i.test(k)) data.localStorage[k]=localStorage.getItem(k);
      }
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=u;a.download='PAVENRO-Finance-Backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);
    },
    async import(file){
      const data=JSON.parse(await file.text());
      if(!data||!data.localStorage)throw new Error('This is not a PAVENRO Finance backup.');
      Object.entries(data.localStorage).forEach(([k,v])=>localStorage.setItem(k,String(v)));
      location.reload();
    }
  };

  // Add Backup / Restore only inside Settings/Data & Backup if that view is rendered.
  function mountBackup(){
    const active=(document.querySelector('#pvTop .pv-title,.topbar .pv-title,.workspace h1')?.textContent||'').toLowerCase();
    if(!active.includes('settings'))return;
    if(document.querySelector('#pvOfflineBackupBox'))return;
    const cards=[...document.querySelectorAll('.card,.settings-card,.settings-pane')];
    const host=cards.find(c=>/data\s*&\s*backup|backup|data/i.test(c.textContent||''))||cards[cards.length-1];
    if(!host)return;
    const box=document.createElement('div');box.id='pvOfflineBackupBox';box.style.cssText='margin-top:10px;padding:10px;border:1px solid var(--pvx-border,var(--border,#d8e3da));border-radius:10px;background:var(--pvx-panel2,var(--panel2,#eef3ee));font:11px Inter,system-ui';
    box.innerHTML='<b>Lifetime Offline Backup</b><div style="margin-top:4px;opacity:.7">Export a backup before changing browser or computer.</div><div style="display:flex;gap:7px;margin-top:8px;flex-wrap:wrap"><button type="button" data-pv-export>Export Backup</button><button type="button" data-pv-import>Restore Backup</button><input hidden type="file" accept="application/json,.json" data-pv-file></div>';
    host.appendChild(box);
    const f=box.querySelector('[data-pv-file]');
    box.querySelector('[data-pv-export]').onclick=()=>window.PavenroOfflineBackup.export();
    box.querySelector('[data-pv-import]').onclick=()=>f.click();
    f.onchange=()=>f.files?.[0]&&window.PavenroOfflineBackup.import(f.files[0]).catch(e=>alert(e.message));
  }
  document.addEventListener('click',()=>setTimeout(mountBackup,180),true);
  setInterval(mountBackup,1200);
  setTimeout(mountBackup,500);
})();
'''

# Inject CSS at the end of head, preserving the same cascade order used online.
css_bundle = ''.join(style_tag(css, label) for label, css in core_styles)
if '</head>' in html.lower():
    pos = html.lower().rfind('</head>')
    html = html[:pos] + css_bundle + html[pos:]
else:
    html = css_bundle + html

# Inject runtime scripts at body end, in the exact current online order.
js_bundle = ''.join(script_tag(code, label) for label, code in core_scripts)
# Online patch-loader emits pavenro:ready after core UI has settled. Keep that contract.
js_bundle += script_tag("document.dispatchEvent(new CustomEvent('pavenro:ready'));", 'ready-event')
js_bundle += ''.join(script_tag(code, label) for label, code in phase_scripts)
js_bundle += script_tag(offline_safety, 'offline-safety')

if '</body>' in html.lower():
    pos = html.lower().rfind('</body>')
    html = html[:pos] + js_bundle + html[pos:]
else:
    html += js_bundle

# Offline/Etsy metadata only; no visible redesign.
meta = '<meta name="pavenro-edition" content="Finance Lifetime Offline"><meta name="robots" content="noindex,nofollow">'
if '<head>' in html.lower():
    pos = html.lower().find('<head>') + len('<head>')
    html = html[:pos] + meta + html[pos:]

# Quality gates: runtime must have no fetch-based patch loader/dependencies.
for forbidden in ['patch-loader.js', 'data/0.txt', "fetch(`patch", "fetch('patch", 'fetch("patch']:
    if forbidden in html:
        print('WARNING: residual reference:', forbidden, file=sys.stderr)

OUT.write_text(html, encoding='utf-8')
print(f'Built {OUT} ({OUT.stat().st_size:,} bytes)')
print('Bundled scripts:', len(core_scripts)+len(phase_scripts)+2)
