"""Cut the artwork out of the NotebookLM deck (art-src/sNN.jpg) and write src/assets.js.

Line art is keyed to a transparent background and its cyan/blue colour is moved to the hue of the palette
of the slide that uses it (gold and white stay as drawn). Photos (coins, balloons, rice, coal) are masked.
Run from the lesson folder:  python3 tools/rekey.py
"""
import numpy as np, io, base64
from PIL import Image

# (source slide, box in the 1376x768 slide, name, mode, hue)  mode: 'circle' | 'soft' (photo) | 'key' (line art)
JOBS = [
    ('s02', (110, 165, 428, 483), 'rice', 'circle', 0), ('s02', (530, 165, 848, 483), 'balloons', 'circle', 0), ('s02', (950, 165, 1268, 483), 'coins', 'circle', 0),
    ('s03', (915, 280, 1265, 575), 'coal', 'soft', 0),
    ('s03', (95, 305, 420, 475), 'lat2d', 'key', 208), ('s03', (455, 245, 765, 505), 'lat3d', 'key', 208),
    ('s04', (120, 130, 350, 260), 'eggs', 'key', 208), ('s04', (795, 140, 940, 290), 'shoes', 'key', 208),
    ('s04', (760, 450, 990, 605), 'paper', 'key', 208), ('s04', (205, 345, 565, 505), 'atomglow', 'key', 0),
    ('s06', (95, 185, 740, 660), 'device', 'key', 268),
]

def rgb2hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]; mx = a.max(-1); mn = a.min(-1); d = mx - mn + 1e-9
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, np.where(mx > 0, (mx - mn) / (mx + 1e-9), 0), mx

def hsv2rgb(h, s, v):
    h = (h % 360) / 60; c = v * s; x = c * (1 - np.abs(h % 2 - 1)); m = v - c
    z = np.zeros_like(h); i = h.astype(int) % 6
    return np.stack([np.choose(i, [c, x, z, z, x, c]) + m, np.choose(i, [x, c, c, x, z, z]) + m, np.choose(i, [z, z, x, c, c, x]) + m], -1)

out, sizes = {}, {}
for src, box, name, mode, hue in JOBS:
    im = Image.open('art-src/%s.jpg' % src).convert('RGB').crop(box)
    a = np.asarray(im).astype(np.float32) / 255; hh, ww = a.shape[:2]
    yy, xx = np.mgrid[0:hh, 0:ww]
    if mode == 'circle':
        r = min(hh, ww) / 2; d = np.hypot(xx - ww / 2, yy - hh / 2); al = np.clip((r - 2 - d) / 5, 0, 1); rgb = a
    elif mode == 'soft':
        d = np.hypot((xx - ww / 2) / (ww / 2), (yy - hh / 2) / (hh / 2)); al = np.clip((1 - d) / .22, 0, 1); rgb = a
    else:
        h, s, v = rgb2hsv(a)
        border = np.concatenate([v[0], v[-1], v[:, 0], v[:, -1]]); t0 = float(np.percentile(border, 60)) + .06; t1 = t0 + .17
        al = np.clip((v - t0) / (t1 - t0), 0, 1); al = al * al * (3 - 2 * al)
        F = max(6, 0.05 * min(hh, ww)); edge = np.minimum(np.minimum(xx, ww - 1 - xx), np.minimum(yy, hh - 1 - yy)) / F
        al = al * np.clip(edge, 0, 1)
        if hue:
            sel = (h >= 165) & (h <= 265) & (s > .2)
            h = np.where(sel, hue - (190 - h) * .3, h); v = np.where(sel, np.clip(v * 1.04, 0, 1), v)
        rgb = hsv2rgb(h, s, v)
    img = Image.fromarray((np.clip(np.dstack([rgb, al]), 0, 1) * 255).astype(np.uint8), 'RGBA')
    buf = io.BytesIO(); img.save(buf, 'WEBP', quality=84, method=6)
    out[name] = base64.b64encode(buf.getvalue()).decode(); sizes[name] = img.size
    img.save('/tmp/prev_%s.png' % name)
    print(name, img.size, len(out[name]) // 1024, 'KB')

js = 'var IMG={' + ','.join('%s:"data:image/webp;base64,%s"' % (n, out[n]) for n in out) + '};\n'
js += 'var IMGW={' + ','.join('%s:[%d,%d]' % (n, sizes[n][0], sizes[n][1]) for n in out) + '};\n'
open('src/assets.js', 'w').write(js)
