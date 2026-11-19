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

def build(num, title, parts, args, css_extra=(), skin=None, eqlab=False, shuffle=False, digits=False, book=False, tools=False, kinds=False, predict=False, summary=False, fill=False):
    """skin='photo': still photographs (u4/photobg.js instead of bg.js, no 3D scenes) behind solid coloured cards (u4/skin_photo.css).
    skin='cards': the living background engine (bg.js, 3D molecules, photos that zoom, drift and cross-fade) behind the same solid cards and click-by-click points.
    eqlab=True: adds the formulas-and-equations workshop (u4/eqlab.js + eqlab.css) used by the unit-1 lessons.
    shuffle=True: adds u4/shuffle.js, which shuffles every group of choices so the right answer is not always the first (unit-1 lessons).
    digits=True: adds u4/digits.js, which shows one numeral style (Western digits, with . , % to match) on every slide.
    book=True: the page of the book on every slide listed in src/pages.js (u4/bookpg.js, a badge above the title) and the shared definition card and how-to strip (u4/defn.js + u4/book.css).
    kinds=True: the kind of each slide (تمهيد، شرح، مثال، نشاط، تدريب، امتحان، تذكرة خروج، الواجب) as a coloured pill, a coloured line under each progress segment and a key in the index (u4/kinds.js + u4/kinds.css).
    predict=True: «توقّع ثم اكتشف» on the lab slides listed in PREDICT (src/pages.js): a prediction card before the lab, the verdict when its result appears (u4/predict.js; needs book=True).
    summary=True: the student's one-page printable summary (a button in the lesson index or key S; u4/summary.js + u4/summary.css), assembled from what the lesson already says.
    fill=True: the slides listed in FILL (src/pages.js) get their content enlarged with CSS zoom, by a factor that still fits (u4/fill.js; the factors come from _core/tools/fill_tune.js).
    tools=True: the teacher tools (u4/tools.js + u4/tools.css): pen, highlighter, eraser, laser pointer, timer, blank screen."""
    d = 'src/'
    css = ''.join(open(CORE + f).read() + '\n' for f in ['style.css', 'theme.css', 'theme3.css', 'theme4.css', 'theme5.css', 'stickers.css', 'u4/lesson.css'] + (['u4/skin_photo.css'] if skin else []) + (['u4/eqlab.css'] if eqlab else []) + (['u4/book.css'] if book else []) + (['u4/kinds.css'] if kinds else []) + (['u4/summary.css'] if summary else []) + (['u4/tools.css'] if tools else [])) \
        + ''.join(open(d + f).read() + '\n' for f in css_extra)
    config = open(d + 'config.js').read()
    if book and os.path.exists(d + 'pages.js') and 'pages.js' not in parts: parts = ['pages.js'] + list(parts)
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
    core_b = (['u4/photobg.js'] if skinned else ['mol3d.js']) + ['motion.js', 'stickers_assets.js', 'stickers.js', 'u4/helpers.js'] + ([] if skinned else ['u4/scenes.js']) + (['u4/eqlab.js'] if eqlab else []) + (['u4/shuffle.js'] if shuffle else []) + (['u4/skin.js'] if skin else []) + (['u4/bookpg.js', 'u4/defn.js'] if book else []) + (['u4/kinds.js'] if kinds else []) + (['u4/predict.js'] if predict else []) + (['u4/fill.js'] if fill else []) + (['u4/summary.js'] if summary else []) + (['u4/tools.js'] if tools else [])
    rd = lambda fs: ''.join(open(CORE + f).read() + '\n' for f in fs)
    js = config + '\n' + rd(core_a) + bgimg + rd(core_b) + '\n'.join(lesson_js) + '\n' + (rd(['u4/digits.js']) if digits else '')
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
