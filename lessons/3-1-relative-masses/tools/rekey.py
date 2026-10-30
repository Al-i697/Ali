"""Rebuild src/assets.js from art-src/*.png.

The PNGs are the artwork cut from the NotebookLM deck (dark blue ground). Each one is keyed to a
transparent background and its cyan/blue line colour is moved to the hue of the palette of the slide
that uses it (gold and red stay as drawn). Run from the lesson folder:  python3 tools/rekey.py
"""
import numpy as np, io, base64
from PIL import Image

# (source, name in IMG, target hue, saturation factor)
JOBS = [('goals', 'goals_navy', 208, 1.0), ('agri', 'agri', 156, 1.05), ('env', 'env', 156, 1.05), ('med', 'med', 156, 1.05),
        ('atomq', 'atomq_navy', 208, 1.0), ('shop', 'shop_navy', 208, 1.0), ('parts', 'parts_navy', 208, 1.0),
        ('c12', 'c12_violet', 268, 1.0), ('lattice', 'lattice', 156, 1.05), ('mol', 'mol', 156, 1.05)]

def rgb2hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]; mx = a.max(-1); mn = a.min(-1); d = mx - mn + 1e-9
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-9), 0)
    return h, s, mx

def hsv2rgb(h, s, v):
    h = (h % 360) / 60; c = v * s; x = c * (1 - np.abs(h % 2 - 1)); m = v - c
    z = np.zeros_like(h); i = h.astype(int) % 6
    r = np.choose(i, [c, x, z, z, x, c]); g = np.choose(i, [x, c, c, x, z, z]); b = np.choose(i, [z, z, x, c, c, x])
    return np.stack([r + m, g + m, b + m], -1)

out, sizes = {}, {}
for src, name, hue, sat in JOBS:
    im = Image.open('art-src/%s.png' % src).convert('RGB'); a = np.asarray(im).astype(np.float32) / 255
    h, s, v = rgb2hsv(a)
    border = np.concatenate([v[0], v[-1], v[:, 0], v[:, -1]])
    t0 = float(np.percentile(border, 40 if src in ('lattice', 'mol') else 55)) + (.08 if src in ('lattice', 'mol') else .05)
    t1 = t0 + .17
    al = np.clip((v - t0) / (t1 - t0), 0, 1); al = al * al * (3 - 2 * al)
    hh, ww = al.shape; yy, xx = np.mgrid[0:hh, 0:ww]; F = max(8, 0.05 * min(hh, ww))
    edge = np.minimum(np.minimum(xx, ww - 1 - xx), np.minimum(yy, hh - 1 - yy)) / F
    if src == 'c12':   # the crop carries a scrap of the deck's caption and an arrow at its edges
        edge = np.minimum(edge, (hh * 0.935 - yy) / F); edge = np.minimum(edge, (ww * 0.965 - xx) / F)
    al = al * np.clip(edge, 0, 1)
    sel = (h >= 165) & (h <= 265) & (s > .2)
    h2 = np.where(sel, hue - (190 - h) * .3, h); s2 = np.where(sel, np.clip(s * sat, 0, 1), s); v2 = np.where(sel, np.clip(v * 1.04, 0, 1), v)
    rgba = np.dstack([hsv2rgb(h2, s2, v2), al])
    img = Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), 'RGBA')
    buf = io.BytesIO(); img.save(buf, 'WEBP', quality=84, method=6)
    out[name] = base64.b64encode(buf.getvalue()).decode(); sizes[name] = im.size
    print(name, im.size, len(out[name]) // 1024, 'KB')

js = 'var IMG={' + ','.join('%s:"data:image/webp;base64,%s"' % (n, out[n]) for n in out) + '};\n'
js += 'var IMGW={' + ','.join('%s:[%d,%d]' % (n, sizes[n][0], sizes[n][1]) for n in out) + '};\n'
open('src/assets.js', 'w').write(js)
