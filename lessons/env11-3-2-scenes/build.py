"""Build lessone32s.html: environmental science, grade 11, unit 3, section 3-2 "feeding relationships", scene edition.
The shared core and unit helpers in ../_core plus this lesson's src/ (cards look on plain palette backgrounds) plus the infographic-style
scene slides (src/scn_*.js), whose pictures come from ../env11-scenes-pilot/art (the teacher's generated art).
   python3 build.py [--standalone] [--shared]
First it writes src/scn_assets.js (pictures and icon tiles as data URIs; generated, not committed), then calls the shared builder."""
import sys, os, io, json, base64, pathlib
from PIL import Image
here = pathlib.Path(__file__).resolve().parent
ART = here.parent / 'env11-scenes-pilot' / 'art'
sys.path.insert(0, str(here.parent / '_core' / 'tools'))

def _enc(im, fmt, q):
    b = io.BytesIO()
    if fmt == 'PNG': im.save(b, 'PNG', optimize=True)
    else: im.save(b, 'WEBP', quality=q, method=4)
    return 'data:image/%s;base64,%s' % (fmt.lower(), base64.b64encode(b.getvalue()).decode())

def has_alpha(im):
    if im.mode != 'RGBA': return False
    lo = im.getchannel('A').getextrema()[0]
    return lo < 200

def uri(name, w, q=84):
    im = Image.open(ART / name)
    alpha = has_alpha(im)
    im = im.convert('RGBA' if alpha else 'RGB')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    return _enc(im, 'WEBP', q)

def comp_tiles(sheet, cols, rows, w, q):
    """Icon sheet with real transparency: find each icon as a connected shape (shapes closer than a few pixels count as one icon; the gap is tried from wide to narrow until every row has the right number of icons), crop it tightly and clear every pixel that belongs to a neighbouring icon, so nothing is cut and nothing from the next icon shows."""
    import numpy as np
    from scipy import ndimage as ndi
    A = np.array(sheet.getchannel('A'))
    for thr, gap in [(t, g) for t in (24, 90, 170, 230) for g in (14, 10, 7, 5, 3, 2, 1)]:
        mask = A > thr
        lab, n = ndi.label(ndi.binary_dilation(mask, iterations=gap))
        if n < cols * rows: continue
        sizes = ndi.sum(mask, lab, index=range(1, n + 1))
        keep = sorted(range(1, n + 1), key=lambda k: -sizes[k - 1])[:cols * rows]
        items = []
        for k in keep:
            ys, xs = np.nonzero(mask & (lab == k)); items.append((k, int(ys.mean()), int(xs.mean()), xs.min(), xs.max(), ys.min(), ys.max()))
        H = sheet.height; band = [[] for _ in range(rows)]
        for it in items: band[min(rows - 1, int(it[1] / (H / rows)))].append(it)
        if any(len(x) != cols for x in band): continue
        out = []
        for row in band:
            for (k, cy, cx, x0, x1, y0, y1) in sorted(row, key=lambda t: t[2]):
                pad = 8; box = (max(0, x0 - pad), max(0, y0 - pad), min(sheet.width, x1 + pad + 1), min(sheet.height, y1 + pad + 1))
                t = sheet.crop(box); al = np.array(t.getchannel('A')); own = (lab[box[1]:box[3], box[0]:box[2]] == k)
                al = np.where(own | ~mask[box[1]:box[3], box[0]:box[2]], al, 0).astype('uint8'); t.putalpha(Image.fromarray(al))
                t = t.resize((w, max(1, round(w * t.height / t.width))), Image.LANCZOS); out.append(_enc(t, 'WEBP', q))
        print('  icons cut one by one (alpha>%d, gap %d): %s' % (thr, gap, sheet.size))
        return out
    return None

def tiles(name, cols, rows, w, q=82):
    """Cut an icon sheet into cells (row by row, left to right). Sheets with real transparency are cut icon by icon (comp_tiles);
    the others (a background is part of the picture) in equal cells."""
    sheet = Image.open(ART / name)
    alpha = has_alpha(sheet)
    sheet = sheet.convert('RGBA' if alpha else 'RGB')
    if alpha:
        got = comp_tiles(sheet, cols, rows, w, q)
        if got: return got
    cw, ch = sheet.width // cols, sheet.height // rows
    out = []
    for r in range(rows):
        my = round(ch * 0.02)
        for c in range(cols):
            t = sheet.crop((c * cw, r * ch + my, (c + 1) * cw, (r + 1) * ch - my))
            t = t.resize((w, round(w * t.height / t.width)), Image.LANCZOS)
            out.append(_enc(t, 'WEBP', q))
    return out

def grid_boxes(cols, rows, over=None):
    """Equal grid cells as fractions of the sheet; over = {index: (x0, x1)} widens or narrows the cell of an icon that crosses its grid line."""
    over = over or {}; out = []
    for r in range(rows):
        for c in range(cols):
            o = over.get(r * cols + c, (c / cols, (c + 1) / cols)); y0, y1 = (o[2], o[3]) if len(o) > 2 else (r / rows, (r + 1) / rows)
            out.append((o[0], y0, o[1], y1))
    return out

def cuts(name, boxes, w, q=82):
    """Crop named boxes (x0, y0, x1, y1 as fractions of the sheet) out of a sheet whose rows are not equal grids."""
    sheet = Image.open(ART / name); alpha = has_alpha(sheet); sheet = sheet.convert('RGBA' if alpha else 'RGB'); out = []
    for (x0, y0, x1, y1) in boxes:
        t = sheet.crop((round(x0 * sheet.width), round(y0 * sheet.height), round(x1 * sheet.width), round(y1 * sheet.height)))
        t = t.resize((w, round(w * t.height / t.width)), Image.LANCZOS); out.append(_enc(t, 'WEBP', q))
    return out

# 9b: three icons in the first two rows, four in the last: leaf, prism, chloroplast, kelp, log, bacteria, fungi, glucose, mitochondrion, sun
B9 = [(0, 0, 1/3, 1/3), (1/3, 0, 2/3, 1/3), (2/3, 0, 1, 1/3), (0, 1/3, 1/3, 2/3), (1/3, 1/3, 2/3, 2/3), (2/3, 1/3, 1, 2/3),
      (0, 2/3, .25, 1), (.25, 2/3, .5, 1), (.5, 2/3, .75, 1), (.75, 2/3, 1, 1)]

IMG = {'a1': ('1a.webp', 1000), 'a4': ('4a.webp', 1600), 'a5': ('5a.webp', 1672), 'a6': ('6a.webp', 1600), 'a7': ('7a.webp', 1000),
       'a8': ('8a.webp', 1600), 'a14': ('14a.webp', 1672), 'a3b': ('3b_v2.png', 1672), 'a9': ('9a.webp', 1600), 'b8': ('8b.webp', 1672)}
SETS = {'t4b': ('4b_v2.png', 3, 3, 300), 't10a': ('10a.png', 3, 3, 260), 't2a': ('2a.png', 3, 3, 340), 't3a': ('3a_v2.png', 3, 3, 340),
        't5b': ('5b_v2.png', 3, 3, 300), 't9b': ('9b_v2.png', 3, 3, 300), 't11a': ('11a.png', 5, 2, 230), 't11b': ('11b_v2.png', 5, 2, 230),
        }
SCN_TILES = {k: tiles(f, c, r, w) for k, (f, c, r, w) in SETS.items()}
# 12a, 13a, 14b: an icon crosses its grid line (the shark and the plankton chain in the bottom-left cell, the tilapia in the last cell)
SCN_TILES['t12a'] = cuts('12a.png', grid_boxes(3, 3, {5: (.667, 1, .335, .658), 6: (0, .404), 7: (.404, .667)}), 300)
SCN_TILES['t13a'] = cuts('13a.png', grid_boxes(3, 3, {6: (0, .404), 7: (.404, .667)}), 300)
SCN_TILES['t14b'] = cuts('14b.png', grid_boxes(3, 3, {8: (.641, 1)}), 300)
assets = 'var SCN_IMG=' + json.dumps({k: uri(f, w) for k, (f, w) in IMG.items()}) + ';\nvar SCN_TL=' + json.dumps(SCN_TILES) + ';\n'
(here / 'src' / 'scn_assets.js').write_text(assets, encoding='utf-8')
print('scn_assets.js', len(assets) // 1024, 'KB')

os.chdir(here)
from u4build import build
build('e32s', 'علاقات التغذية ٣-٢ المصوّرة',
      ['photos.js', 'helpers.js', 'pages.js', 'scn_assets.js', 'scn_css.js', 'scn_kit.js', 'scn_data.js', 'part_a.js', 'part_b.js', 'part_c.js', 'part_d.js', 'part_e.js', 'part_f.js', 'tail.js'],
      sys.argv, css_extra=['env.css'], skin='cards', shuffle=True, digits=True)
