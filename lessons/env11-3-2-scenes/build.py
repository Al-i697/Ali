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

def tiles(name, cols, rows, w, q=82):
    """Cut an icon sheet into equal grid cells (row by row, left to right); keep transparency where the sheet has it."""
    sheet = Image.open(ART / name)
    alpha = has_alpha(sheet)
    sheet = sheet.convert('RGBA' if alpha else 'RGB')
    cw, ch = sheet.width // cols, sheet.height // rows
    out = []
    for r in range(rows):
        for c in range(cols):
            my = round(ch * 0.02)
            t = sheet.crop((c * cw, r * ch + my, (c + 1) * cw, (r + 1) * ch - my))
            t = t.resize((w, round(w * t.height / t.width)), Image.LANCZOS)
            out.append(_enc(t, 'WEBP', q))
    return out

IMG = {'a1': ('1a.webp', 1000), 'a4': ('4a.webp', 1600), 'a5': ('5a.webp', 1672), 'a6': ('6a.webp', 1600), 'a7': ('7a.webp', 1000),
       'a8': ('8a.webp', 1600), 'a9': ('9a.webp', 1600), 'b8': ('8b.webp', 1672)}
SETS = {'t4b': ('4b.webp', 3, 3, 300), 't10a': ('10a.png', 3, 3, 260), 't2a': ('2a.png', 3, 3, 340), 't3a': ('3a.png', 3, 3, 340),
        't5b': ('5b.webp', 3, 3, 300), 't9b': ('9b.webp', 3, 3, 300), 't11a': ('11a.png', 5, 2, 230), 't11b': ('11b.png', 5, 2, 230),
        't12a': ('12a.png', 3, 3, 300), 't13a': ('13a.png', 3, 3, 300), 't14b': ('14b.png', 3, 3, 300)}
assets = 'var SCN_IMG=' + json.dumps({k: uri(f, w) for k, (f, w) in IMG.items()}) + ';\nvar SCN_TL=' + json.dumps({k: tiles(f, c, r, w) for k, (f, c, r, w) in SETS.items()}) + ';\n'
(here / 'src' / 'scn_assets.js').write_text(assets, encoding='utf-8')
print('scn_assets.js', len(assets) // 1024, 'KB')

os.chdir(here)
from u4build import build
build('e32s', 'علاقات التغذية: نسخة المشاهد',
      ['photos.js', 'helpers.js', 'scn_assets.js', 'scn_css.js', 'scn_kit.js', 'scn_data.js', 'part_a.js', 'part_b.js', 'part_c.js', 'part_d.js', 'part_e.js', 'part_f.js', 'tail.js'],
      sys.argv, css_extra=['env.css'], skin='cards', shuffle=True, digits=True)
