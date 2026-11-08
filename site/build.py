"""Assemble the lessons site into site/dist: index.html (the home page) plus every lesson as a full HTML page.   python3 site/build.py"""
import subprocess, os, re
root = os.path.dirname(os.path.abspath(__file__)); L = os.path.join(root, '..', 'lessons'); core = os.path.join(L, '_core')
dist = os.path.join(root, 'dist'); os.makedirs(dist, exist_ok=True)
HEAD = '<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n'
def doc(fragment): return HEAD + fragment + '</head><body></body></html>\n'
def rd(p): return open(p).read()
# the lessons (built with the home link back to index.html): units 1 to 4 as far as they are written
for folder, out in [('1-1-metallic-bonding', 'lesson11.html'), ('1-2-transition-elements', 'lesson12.html'), ('1-3-alkali-metals', 'lesson13.html'), ('1-4-reactivity-series', 'lesson14.html'), ('2-1-extraction', 'lesson21.html'), ('2-2-iron-steel', 'lesson22.html'), ('2-3-alloys', 'lesson23.html'), ('2-4-corrosion', 'lesson24.html'), ('3-1-relative-masses', 'lesson31.html'), ('3-2-the-mole', 'lesson32.html'), ('3-3-reacting-masses', 'lesson33.html'), ('3-4-gas-volumes', 'lesson34.html'), ('3-5-solutions', 'lesson35.html'), ('4-1-alkanes', 'lesson41.html'), ('4-2-alkenes', 'lesson42.html'), ('4-3-petroleum', 'lesson43.html')]:
    # --shared: the sticker pictures (about 780 KB) are not copied into the lesson; every page loads shared/stickers_assets.js once
    subprocess.run(['python3', 'build.py', '--shared'], cwd=os.path.join(L, folder), check=True, stdout=subprocess.DEVNULL)
    open(os.path.join(dist, out), 'w').write(doc(rd(os.path.join(L, folder, out.replace('.html', '.slim.html')))))
os.makedirs(os.path.join(dist, 'shared'), exist_ok=True)
open(os.path.join(dist, 'shared', 'stickers_assets.js'), 'w').write(rd(os.path.join(core, 'stickers_assets.js')))
# the home page: the platform (home, class drawer, teacher's records), built from site/platform
import json
pl = os.path.join(root, 'platform')
page = rd(os.path.join(pl, 'index.src.html'))
for tag, f in [('/*CORE_CSS*/', 'style.css'), ('/*THEME4_CSS*/', 'theme4.css'), ('/*THEME5_CSS*/', 'theme5.css'), ('/*STICKERS_CSS*/', 'stickers.css')]:
    page = page.replace(tag, rd(os.path.join(core, f)))
page = page.replace('/*PLATFORM_CSS*/', rd(os.path.join(pl, 'src', 'platform.css')))
page = page.replace('/*BG_JS*/', rd(os.path.join(core, 'bg.js')) + '\n' + rd(os.path.join(core, 'stickers.js')))
page = page.replace('/*CATALOG_JSON*/', json.dumps(json.load(open(os.path.join(root, 'catalog.json'), encoding='utf8')), ensure_ascii=False))
page = page.replace('/*LOGIC_JS*/', rd(os.path.join(pl, 'src', 'logic.js'))).replace('/*STORE_JS*/', rd(os.path.join(pl, 'src', 'store.js')))
page = page.replace('/*APP_JS*/', ''.join(rd(os.path.join(pl, 'src', f)) + '\n' for f in ['app_a.js', 'app_b.js', 'app_c.js']))
open(os.path.join(dist, 'index.html'), 'w').write(doc(page))
open(os.path.join(dist, 'index.fragment.html'), 'w').write(page)   # for hosts that wrap the page themselves
print({f: os.path.getsize(os.path.join(dist, f)) for f in sorted(os.listdir(dist)) if os.path.isfile(os.path.join(dist, f))})

# the single-file copy: the whole site in one page that opens by double-click (no server, no internet except the fonts)
off = os.path.join(root, 'offline'); os.makedirs(off, exist_ok=True)
stk = rd(os.path.join(core, 'stickers_assets.js')); tag = '<script src="shared/stickers_assets.js"></script>'
lessons = {}
for _, out in [('', 'lesson11.html'), ('', 'lesson12.html'), ('', 'lesson13.html'), ('', 'lesson14.html'), ('', 'lesson21.html'), ('', 'lesson22.html'), ('', 'lesson23.html'), ('', 'lesson24.html'), ('', 'lesson31.html'), ('', 'lesson32.html'), ('', 'lesson33.html'), ('', 'lesson34.html'), ('', 'lesson35.html'), ('', 'lesson41.html'), ('', 'lesson42.html'), ('', 'lesson43.html')]:
    t = rd(os.path.join(dist, out)); assert tag in t
    lessons[out] = t.replace(tag, '<script>var STK_IMG=parent.STK_IMG,STK_WH=parent.STK_WH;</script>')
blob = json.dumps(lessons, ensure_ascii=False).replace('</', '<\\/').replace('<!--', '<\\!--')
host = rd(os.path.join(dist, 'index.html')); assert tag in host
host = host.replace(tag, '<script>' + stk + '</script>\n<script>window.OFFLINE_LESSONS=' + blob + ';</script>')
open(os.path.join(off, 'platform-offline.html'), 'w').write(host)
print('offline copy', os.path.getsize(os.path.join(off, 'platform-offline.html')))
