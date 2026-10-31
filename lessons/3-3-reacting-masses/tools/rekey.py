"""Cut the artwork out of the NotebookLM deck (art-src/sNN.jpg) and write src/assets.js.

Photos on the pale green panel (bread, cheese, sandwich) are separated from the panel by colour; the glassware on the cream slide is keyed by
brightness so it stays translucent. Run from the lesson folder:  python3 tools/rekey.py
"""
import numpy as np, io, base64
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

# (source slide, box in the 1376x768 slide, name, mode, max width)
JOBS = [
    ('s02', (50, 55, 380, 305), 'bread3', 'photo', 330), ('s02', (385, 85, 630, 280), 'cheese2', 'photo', 245),
    ('s02', (55, 440, 380, 680), 'sandwich', 'photo', 325), ('s02', (380, 460, 630, 615), 'bread1', 'photo', 250),
    ('s12', (850, 55, 1345, 665), 'flasks', 'key', 250),
]

def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]; return (x * x + y * y) <= r * r

out, sizes = {}, {}
for src, box, name, mode, mw in JOBS:
    im = Image.open('art-src/%s.jpg' % src).convert('RGB').crop(box)
    a = np.asarray(im).astype(np.float32) / 255; hh, ww = a.shape[:2]
    if mode == 'photo':
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        m = (r - g) > -.02                      # panel is green (g > r); bread, crust and cheese are not
        m = ndi.binary_opening(m, structure=disk(2)); lab, n = ndi.label(ndi.binary_closing(m, structure=disk(5)))
        if n: m = lab == (1 + int(np.argmax(ndi.sum(m, lab, range(1, n + 1)))))
        m = ndi.binary_fill_holes(ndi.binary_closing(m, structure=disk(6)))
        al = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))).astype(np.float32) / 255
        al = np.clip((al - .35) / .45, 0, 1); rgb = a
    else:
        lum = a.mean(-1); border = np.concatenate([lum[0], lum[-1], lum[:, 0], lum[:, -1]]); bg = float(np.percentile(border, 70))
        al = np.clip((bg - lum - .015) / .16, 0, 1) ** .8
        yy, xx = np.mgrid[0:hh, 0:ww]; F = 14; al = al * np.clip(np.minimum(np.minimum(xx, ww - 1 - xx), np.minimum(yy, hh - 1 - yy)) / F, 0, 1)
        m = ndi.binary_opening(al > .12, structure=disk(4)); lab, n = ndi.label(m)      # thin circuit lines of the slide are not part of the glassware
        keep = [i for i in range(1, n + 1) if (lab == i).sum() > 2500]; m = np.isin(lab, keep); al = al * ndi.binary_dilation(m, structure=disk(6))
        rgb = np.clip(a * 1.0, 0, 1)
    img = Image.fromarray((np.clip(np.dstack([rgb, al]), 0, 1) * 255).astype(np.uint8), 'RGBA')
    ys, xs = np.nonzero(al > .02); img = img.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    if img.width > mw: img = img.resize((mw, round(img.height * mw / img.width)), Image.LANCZOS)
    buf = io.BytesIO(); img.save(buf, 'WEBP', quality=84, method=6)
    out[name] = base64.b64encode(buf.getvalue()).decode(); sizes[name] = img.size
    bgc = Image.new('RGB', img.size, (24, 62, 70)); bgc.paste(img, (0, 0), img); bgc.save('/tmp/prev_%s.png' % name)
    print(name, img.size, len(out[name]) // 1024, 'KB')

js = 'var IMG={' + ','.join('%s:"data:image/webp;base64,%s"' % (n, out[n]) for n in out) + '};\n'
js += 'var IMGW={' + ','.join('%s:[%d,%d]' % (n, sizes[n][0], sizes[n][1]) for n in out) + '};\n'
open('src/assets.js', 'w').write(js)
