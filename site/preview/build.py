"""Assemble the platform mock-up: site/preview/dist/index.html (+ shared/stickers_assets.js).   python3 site/preview/build.py"""
import os, json
here = os.path.dirname(os.path.abspath(__file__)); site = os.path.join(here, '..'); core = os.path.join(site, '..', 'lessons', '_core')
rd = lambda p: open(p, encoding='utf8').read()
out = os.path.join(here, 'dist'); os.makedirs(os.path.join(out, 'shared'), exist_ok=True)
page = rd(os.path.join(here, 'platform.src.html'))
cat = json.dumps(json.load(open(os.path.join(site, 'catalog.json'), encoding='utf8')), ensure_ascii=False)
for tag, f in [('/*CORE_CSS*/', 'style.css'), ('/*THEME4_CSS*/', 'theme4.css'), ('/*THEME5_CSS*/', 'theme5.css'), ('/*STICKERS_CSS*/', 'stickers.css')]:
    page = page.replace(tag, rd(os.path.join(core, f)))
page = page.replace('/*BG_JS*/', rd(os.path.join(core, 'bg.js')) + '\n' + rd(os.path.join(core, 'stickers.js'))).replace('/*CATALOG_JSON*/', cat)
html = '<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' + page + '</head><body></body></html>\n'
open(os.path.join(out, 'index.html'), 'w', encoding='utf8').write(html)
open(os.path.join(out, 'shared', 'stickers_assets.js'), 'w', encoding='utf8').write(rd(os.path.join(core, 'stickers_assets.js')))
# one self-contained file (the sticker pictures inlined) to download or send: works by double-click, no server
one = html.replace('<script src="shared/stickers_assets.js"></script>', '<script>' + rd(os.path.join(core, 'stickers_assets.js')) + '</script>')
open(os.path.join(out, 'platform-mockup.html'), 'w', encoding='utf8').write(one)
print({f: os.path.getsize(os.path.join(out, f)) for f in ['index.html', 'platform-mockup.html']})
