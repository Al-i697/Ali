"""Prepares the lesson 2-2 pictures and packs them into src/imgs.js.
   python3 tools/make_imgs.py [folder-with-the-teacher's-originals]
With a folder: the text-less template frames (1672x941 style, 16:9) are saved as img/<name>.webp at 1600 px wide, and the three real cut-outs
(PNG with a true alpha channel) are cropped to their visible part and saved at most 900 px wide, keeping the transparency.
Without a folder: only repacks what is already in img/. Do not run from inside the originals folder."""
import os, sys, json, base64
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'img')
FRAMES = {  # name: original file (template frames the live text and buttons are laid over)
  'title_forge': 't_title_forge.png', 'roadmap4': 't_roadmap4.png', 'furnace': 't_furnace_anatomy.png', 'zones': 't_zones.png',
  'co': 't_co_reduction.png', 'slag': 't_slag_lining.png', 'bof3': 't_bof_stages3.png', 'funnel3': 't_funnel3.png'}
CUTS = {'pig_bof': 't_bof_vs_pig.png', 'ladle_scrap': 't_ladle_scrap.png', 'ladles_pour': 't_ladles_pour.png'}
if len(sys.argv) > 1:
    src = sys.argv[1]
    for n, f in FRAMES.items():
        im = Image.open(os.path.join(src, f)).convert('RGB')
        assert im.width >= 1500 and abs(im.width / im.height - 16 / 9) < .03, '%s is not a 16:9 frame (%dx%d)' % (f, im.width, im.height)
        im = im.resize((1600, 900), Image.LANCZOS); im.save(os.path.join(OUT, n + '.webp'), quality=82, method=6)
    for n, f in CUTS.items():
        im = Image.open(os.path.join(src, f)).convert('RGBA')
        assert im.getchannel('A').getextrema()[0] == 0, '%s has no real transparency' % f
        im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())
        if im.width > 900: im = im.resize((900, round(900 * im.height / im.width)), Image.LANCZOS)
        im.save(os.path.join(OUT, n + '.webp'), quality=86, method=6, exact=True)
pack = {}
for f in sorted(os.listdir(OUT)):
    if f.endswith('.webp'):
        pack[f[:-5]] = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(OUT, f), 'rb').read()).decode()
        print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB', Image.open(os.path.join(OUT, f)).size)
js = '/* lesson 2-2 pictures: text-less template frames and cut-outs sent by the teacher, packed by tools/make_imgs.py: {name: data-URI}. Do not edit by hand. */\nvar IMG=' + json.dumps(pack) + ';\n'
open(os.path.join(HERE, '..', 'src', 'imgs.js'), 'w').write(js)
print(len(pack), 'pictures, imgs.js', len(js) // 1024, 'KB')
