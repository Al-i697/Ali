"""Assemble the lessons site into site/dist: index.html (the home page) plus every lesson as a full HTML page.   python3 site/build.py"""
import subprocess, os, re
root = os.path.dirname(os.path.abspath(__file__)); L = os.path.join(root, '..', 'lessons'); core = os.path.join(L, '_core')
dist = os.path.join(root, 'dist'); os.makedirs(dist, exist_ok=True)
HEAD = '<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n'
def doc(fragment): return HEAD + fragment + '</head><body></body></html>\n'
def rd(p): return open(p).read()
# the lessons (built with the home link back to index.html)
for folder, out in [('3-1-relative-masses', 'lesson31.html'), ('3-2-the-mole', 'lesson32.html')]:
    subprocess.run(['python3', 'build.py'], cwd=os.path.join(L, folder), check=True, stdout=subprocess.DEVNULL)
    open(os.path.join(dist, out), 'w').write(doc(rd(os.path.join(L, folder, out))))
# the home page
page = rd(os.path.join(root, 'index.src.html'))
page = page.replace('/*CORE_CSS*/', rd(os.path.join(core, 'style.css'))).replace('/*THEME4_CSS*/', rd(os.path.join(core, 'theme4.css'))).replace('/*THEME5_CSS*/', rd(os.path.join(core, 'theme5.css')))
page = page.replace('/*STICKERS_CSS*/', rd(os.path.join(core, 'stickers.css')))
page = page.replace('/*BG_JS*/', rd(os.path.join(core, 'bg.js')) + '\n' + rd(os.path.join(core, 'stickers_assets.js')) + '\n' + rd(os.path.join(core, 'stickers.js')))
open(os.path.join(dist, 'index.html'), 'w').write(doc(page))
open(os.path.join(dist, 'index.fragment.html'), 'w').write(page)   # for hosts that wrap the page themselves
print({f: os.path.getsize(os.path.join(dist, f)) for f in sorted(os.listdir(dist))})
