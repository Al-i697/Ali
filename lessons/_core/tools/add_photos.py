"""Adds the teacher's high-resolution horizontal photographs to the background pool and repacks bgimg_assets.js.
   python3 tools/add_photos.py name=/path/to/original.png ...
Each original (about 1672x941) is saved as bgimg/<name>.jpg at 1600x900 (JPEG q80, no sharpening, no blur, no crop: they are already 16:9),
then every bgimg/*.jpg is packed into bgimg_assets.js as {name: data-URI}. Used with u4/photobg.js (the 'photo' look), which shows them still."""
import os, sys, json, base64
from PIL import Image
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'bgimg')
for a in sys.argv[1:]:
    name, path = a.split('=', 1)
    im = Image.open(path).convert('RGB')
    assert im.width / im.height > 1.6, '%s is not a horizontal picture (%dx%d)' % (name, im.width, im.height)
    assert im.width >= 1500, '%s is too small (%dx%d): send at least 1600 px wide' % (name, im.width, im.height)
    im = im.resize((1600, round(1600 * im.height / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, name + '.jpg'), quality=80, optimize=True, progressive=True)
    print(name, im.size, os.path.getsize(os.path.join(OUT, name + '.jpg')) // 1024, 'KB')
pack = {}
names = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith('.jpg'))
for n in names:
    pack[n] = 'data:image/jpeg;base64,' + base64.b64encode(open(os.path.join(OUT, n + '.jpg'), 'rb').read()).decode()
js = '/* photo backgrounds (from the NotebookLM decks and the teacher\'s own photographs) made by tools/make_bg.py and tools/add_photos.py: {name: data-URI}. Do not edit by hand. */\nvar BGIMG=' + json.dumps(pack) + ';\n'
open(os.path.join(OUT, '..', 'bgimg_assets.js'), 'w').write(js)
print(len(names), 'images packed, bgimg_assets.js', len(js) // 1024, 'KB')
