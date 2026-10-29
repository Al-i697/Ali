#!/usr/bin/env python3
"""يجمّع المصدر (src/) في موقع ثابت جاهز للنشر (docs/): index.html + app.css + app.js + sw.js + manifest + الخطوط والأيقونات."""
import hashlib, json, os, re, shutil, datetime
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = os.path.join(R, 'src'), os.path.join(R, 'docs')
rd = lambda *p: open(os.path.join(SRC, *p), encoding='utf-8').read()

css = '\n'.join(rd('css', n) for n in ['fonts.css', 'fa.css', 'custom.css', 'tw.css', 'base.css', 'extra.css'])
js_parts = rd('core.js') + '\n' + rd('db.js') + '\n' + rd('ui.js')
sig = hashlib.sha1((css + js_parts + rd('body.html')).encode('utf-8')).hexdigest()[:8]
BUILD = datetime.date.today().strftime('%Y.%m.%d') + '-' + sig
js = "(function(){\n'use strict';\n" + js_parts.replace('__BUILD__', BUILD) + "\n})();\n"

head = f'''<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>برنامج المقهى</title>
<meta name="description" content="برنامج مبيعات وحسابات للمقهى يعمل على الآيباد بدون إنترنت">
<meta name="theme-color" content="#17707A">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="المقهى">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="format-detection" content="telephone=no">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<script>try{{var _t=document.documentElement.getAttribute('data-theme');if(_t?_t==='dark':matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark')}}catch(e){{}}</script>
<link rel="stylesheet" href="app.css?v={BUILD}">
<script defer src="vendor/qrcode.min.js"></script>
</head>
<body>
'''
html = head + rd('body.html') + f'\n<script defer src="app.js?v={BUILD}"></script>\n</body>\n</html>\n'

manifest = {
    "name": "برنامج المقهى", "short_name": "المقهى", "lang": "ar", "dir": "rtl",
    "start_url": "./", "scope": "./", "display": "standalone", "orientation": "any",
    "background_color": "#F7F8F7", "theme_color": "#17707A",
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}

# نبني docs من جديد
if os.path.isdir(OUT): shutil.rmtree(OUT)
os.makedirs(OUT)
for d in ['fonts', 'vendor', 'icons']:
    shutil.copytree(os.path.join(SRC, d), os.path.join(OUT, d))
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html)
open(os.path.join(OUT, 'app.css'), 'w', encoding='utf-8').write(css)
open(os.path.join(OUT, 'app.js'), 'w', encoding='utf-8').write(js)
open(os.path.join(OUT, 'manifest.webmanifest'), 'w', encoding='utf-8').write(json.dumps(manifest, ensure_ascii=False, indent=1))
open(os.path.join(OUT, '.nojekyll'), 'w').write('')

files = ['./', 'index.html', f'app.css?v={BUILD}', f'app.js?v={BUILD}', 'manifest.webmanifest']
for d in ['fonts', 'vendor', 'icons']:
    for f in sorted(os.listdir(os.path.join(OUT, d))):
        if not f.endswith('.txt'): files.append(f'{d}/{f}')
sw = rd('sw.js').replace('__BUILD__', BUILD).replace('__FILES__', json.dumps(files, ensure_ascii=False))
open(os.path.join(OUT, 'sw.js'), 'w', encoding='utf-8').write(sw)
open(os.path.join(OUT, 'version.json'), 'w').write(json.dumps({"build": BUILD}))
tot = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(OUT) for f in fs)
print('build', BUILD, '| docs', tot // 1024, 'KB | app.js', len(js) // 1024, 'KB | app.css', len(css) // 1024, 'KB')
