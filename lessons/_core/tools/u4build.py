"""Shared build of the unit-4 lessons (4-1, 4-2, 4-3): one HTML file made of the core, the unit-4 helpers/scenes and the lesson's own src/.
Each lesson's build.py calls  build('41', 'الألكانات ٤-١', [part files...], sys.argv)  from its own folder.
Only the photo backgrounds a lesson really uses are packed into it (the scenes in config.js / the lesson files -> _core/u4/scenes.js -> _core/bgimg_assets.js)."""
import os, re, json
CORE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + '/'

def used_photos(config, parts_src, scenes):
    names = set(re.findall(r"['\"]((?:p|pm|mol)_\w+)['\"]", config + parts_src))
    bgs = set()
    for m in re.finditer(r"R\('(\w+)'\s*,\s*\{([^\n]*)\}\);?", scenes):
        if m.group(1) in names:
            bgs.update(re.findall(r"bg:'(\w+)'", m.group(2)))
    return bgs

def build(num, title, parts, args, css_extra=(), skin=None):
    """skin='photo': still photographs (u4/photobg.js instead of bg.js, no 3D scenes) behind solid coloured cards (u4/skin_photo.css).
    skin='cards': the living background engine (bg.js, 3D molecules, photos that zoom, drift and cross-fade) behind the same solid cards and click-by-click points."""
    d = 'src/'
    css = ''.join(open(CORE + f).read() + '\n' for f in ['style.css', 'theme.css', 'theme3.css', 'theme4.css', 'theme5.css', 'stickers.css', 'u4/lesson.css'] + (['u4/skin_photo.css'] if skin else [])) \
        + ''.join(open(d + f).read() + '\n' for f in css_extra)
    config = open(d + 'config.js').read()
    lesson_js = [open(d + f).read() for f in parts]
    scenes = open(CORE + 'u4/scenes.js').read()
    keep = used_photos(config, '\n'.join(lesson_js), scenes) if skin != 'photo' else set(re.findall(r"['\"]((?:u|nb|s)_\w+)['\"]", config))
    raw = open(CORE + 'bgimg_assets.js').read()
    body = raw[raw.index('var BGIMG=') + 10:]
    pack = json.loads(body[:body.rindex('}') + 1])
    missing = sorted(k for k in keep if k not in pack)
    assert not missing, 'missing photo backgrounds: %s' % missing
    bgimg = '/* photo backgrounds used by this lesson (made by _core/tools/make_bg.py) */\nvar BGIMG=' + json.dumps({k: pack[k] for k in sorted(keep)}) + ';\n'
    stk = open(CORE + 'stickers_assets.js').read() + '\n'
    skinned = skin == 'photo'   # still pictures: no living engine
    core_a = ['engine.js', 'art_core.js'] + ([] if skinned else ['bg.js'])
    core_b = (['u4/photobg.js'] if skinned else ['mol3d.js']) + ['motion.js', 'stickers_assets.js', 'stickers.js', 'u4/helpers.js'] + ([] if skinned else ['u4/scenes.js']) + (['u4/skin.js'] if skin else [])
    rd = lambda fs: ''.join(open(CORE + f).read() + '\n' for f in fs)
    js = config + '\n' + rd(core_a) + bgimg + rd(core_b) + '\n'.join(lesson_js) + '\n'
    if '--standalone' in args: js = js.replace("home:'index.html'", "home:''")
    shared = '--shared' in args   # site build: the sticker pictures (about 780 KB, the same in every lesson) load once from shared/stickers_assets.js
    if shared:
        assert stk in js; js = js.replace(stk, '')
    html = '''<title>%s</title>
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
''' % (title, css, js)
    if shared: html = html.replace('<script>\ndocument.documentElement.lang', '<script src="shared/stickers_assets.js"></script>\n<script>\ndocument.documentElement.lang', 1)
    out = 'lesson%s.slim.html' % num if shared else 'lesson%s.html' % num
    open(out, 'w').write(html)
    print(out, len(html), 'bytes;', len(keep), 'photos:', ', '.join(sorted(keep)))
