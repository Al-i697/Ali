"""Build lesson33.html: the shared core in ../_core plus this lesson's src/.   python3 build.py [--standalone] [--shared]"""
import sys
core, d = '../_core/', 'src/'
css = ''.join(open(core + f).read() + '\n' for f in ['style.css', 'theme.css', 'theme3.css', 'theme4.css', 'theme5.css', 'stickers.css']) + open(d + 'lesson.css').read()
js = ''.join(open(f).read() + '\n' for f in [d + 'config.js', core + 'engine.js', core + 'art_core.js', d + 'assets.js', core + 'bg.js', core + 'motion.js', core + 'stickers_assets.js', core + 'stickers.js',
                                              d + 'helpers.js', d + 'part_a.js', d + 'part_b.js', d + 'part_c.js', d + 'part_d.js', d + 'past.js', d + 'tail.js'])
if '--standalone' in sys.argv: js = js.replace("home:'index.html'", "home:''")
shared = '--shared' in sys.argv   # site build: the sticker pictures (about 780 KB, the same in every lesson) load once from shared/stickers_assets.js instead of being copied into each lesson
if shared:
    blob = open(core + 'stickers_assets.js').read() + '\n'
    assert blob in js; js = js.replace(blob, '')
html = '''<title>كتل متفاعلة ٣-٣</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800&family=Tajawal:wght@400;500;700&family=STIX+Two+Text:ital,wght@1,600&display=swap" rel="stylesheet">
<style>
%s
</style>
<script>
document.documentElement.lang="ar";document.documentElement.dir="rtl";
(function(){
'use strict';
%s
})();
</script>
''' % (css, js)
if shared: html = html.replace('<script>\ndocument.documentElement.lang', '<script src="shared/stickers_assets.js"></script>\n<script>\ndocument.documentElement.lang', 1)
out = 'lesson33.slim.html' if shared else 'lesson33.html'
open(out, 'w').write(html); print(out, len(html))
