"""Cut the stickers out of the four sticker sheets (art-src/stickers/sheet*.jpg) with a die-cut white outline.
   python3 cut_stickers.py scan   -> scratch/scan_<sheet>.png: every sticker found, numbered (use the centres as anchors in STICKERS)
   python3 cut_stickers.py cut    -> art-src/stickers/cut/<name>.png for every entry of STICKERS, plus scratch/contact.png
"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'art-src', 'stickers')
SHEETS = {'k': 'sheet1_kids.jpg', 'p': 'sheet2_praise.jpg', 's': 'sheet3_science.jpg', 'n': 'sheet4_night.jpg'}
# thr: colour distance from the paper that counts as ink; merge: px that joins the parts of one sticker; amin: smaller blobs are decoration (stars, bubbles) and are attached to the nearest sticker; attach: how far
PARAMS = {'k': dict(thr=14, merge=2, amin=4000, attach=26), 'p': dict(thr=30, merge=2, amin=6000, attach=26),
          's': dict(thr=30, merge=2, amin=6000, attach=16), 'n': dict(thr=14, merge=2, amin=2500, attach=24)}

SM = {'k': 3, 'p': 3, 's': 3, 'n': 6}  # smoothing of the cut line per sheet

def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return (x * x + y * y) <= r * r

def load(key):
    im = Image.open(os.path.join(SRC, SHEETS[key])).convert('RGB'); a = np.asarray(im).astype(np.int16)
    edge = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(edge, 0)
    fg = ndi.binary_opening(np.abs(a - bg).max(2) > PARAMS[key]['thr'], structure=disk(1))
    return im, fg

def cores(key, fg):
    p = PARAMS[key]
    lab, n = ndi.label(ndi.binary_dilation(fg, structure=disk(p['merge'])))
    area = ndi.sum(fg, lab, range(1, n + 1))
    return lab, n, area

def sticker_mask(key, fg, anchor, excl=()):
    p = PARAMS[key]; fg = fg.copy()
    for (x0, y0, x1, y1) in excl: fg[y0:y1, x0:x1] = False
    lab, n, area = cores(key, fg)
    ax, ay = anchor; L = lab[ay, ax]
    if not L:  # the anchor fell between ink: take the biggest blob around it
        w = lab[max(0, ay - 25):ay + 25, max(0, ax - 25):ax + 25]; w = w[w > 0]; L = np.bincount(w).argmax()
    core = (lab == L) & fg
    big = {i + 1 for i, a in enumerate(area) if a >= p['amin']}
    near = ndi.binary_dilation(core, structure=disk(p['attach']))
    ids = [i for i in np.unique(lab[near]) if i and i != L and i not in big]
    mask = core | (np.isin(lab, ids) & fg & near)
    return mask

def cut(key, anchor, excl=(), ring=0, pad=8):
    im, fg = load(key)
    mask = sticker_mask(key, fg, anchor, excl)
    body = ndi.binary_fill_holes(ndi.binary_closing(mask, structure=disk(3)))
    body = ndi.gaussian_filter(ndi.binary_dilation(ndi.binary_closing(body, structure=disk(SM[key])), structure=disk(2)).astype(float), SM[key]) > .5
    ink = body.copy()
    if ring: body = ndi.binary_fill_holes(ndi.binary_dilation(body, structure=disk(ring)))
    rgb = np.asarray(im).copy()
    if ring: rgb[body & ~ink] = (255, 255, 255)
    alpha = Image.fromarray((body * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    out = Image.fromarray(rgb).convert('RGBA'); out.putalpha(alpha)
    ys, xs = np.nonzero(body); H, W = body.shape
    return out.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(W, xs.max() + 1 + pad), min(H, ys.max() + 1 + pad)))

def scan():
    os.makedirs('scratch', exist_ok=True)
    for key in SHEETS:
        im, fg = load(key); p = PARAMS[key]
        lab, n, area = cores(key, fg); dr = ImageDraw.Draw(im); k = 0
        for i in range(1, n + 1):
            if area[i - 1] < p['amin']: continue
            ys, xs = np.nonzero(lab == i); cx, cy = int(xs.mean()), int(ys.mean())
            dr.rectangle((xs.min(), ys.min(), xs.max(), ys.max()), outline=(255, 0, 80), width=2); dr.text((cx - 6, cy - 5), str(k), fill=(255, 0, 80))
            print(key, k, 'centre', (cx, cy), 'ink-px', int(area[i - 1])); k += 1
        im.save('scratch/scan_%s.png' % key)

# name: (sheet, anchor inside the sticker, ink rectangles to ignore so touching neighbours stay out, white ring in px for sheets whose stickers have none)
STICKERS = {}
exec(open(os.path.join(HERE, 'stickers_list.py')).read()) if os.path.exists(os.path.join(HERE, 'stickers_list.py')) else None

if __name__ == '__main__':
    if sys.argv[1] == 'scan': scan()
    elif sys.argv[1] == 'cut':
        out = os.path.join(SRC, 'cut'); os.makedirs(out, exist_ok=True); os.makedirs('scratch', exist_ok=True)
        ims = {}
        for name, (key, anchor, excl, ring) in STICKERS.items():
            im = cut(key, anchor, excl, ring); im.save(os.path.join(out, name + '.png')); ims[name] = im
        # contact sheet on a dark and a light ground so the outlines can be judged
        cols = 8; cell = 190; rows = (len(ims) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * cell, rows * cell), (22, 60, 52))
        d = ImageDraw.Draw(sheet)
        for j, (name, im) in enumerate(ims.items()):
            t = im.copy(); t.thumbnail((cell - 20, cell - 34)); x, y = (j % cols) * cell + 10, (j // cols) * cell + 8
            sheet.paste(t, (x, y), t); d.text((x, y + cell - 24), name, fill=(255, 255, 255))
        sheet.save('scratch/contact.png'); print(len(ims), 'stickers cut')
