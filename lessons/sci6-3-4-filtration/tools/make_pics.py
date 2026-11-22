"""Cuts the teacher's pictures (16 generated images he supplied) into the small crops the lesson uses, then packs them into src/pics.js (data URIs).
Usage:  python3 tools/make_pics.py <folder-with-the-16-source-images>   (the sources are named A_cards.png ... P_stickers_t.png, see SRC below)
Only the useful part of each picture is kept (he said: not the whole picture, only the suitable parts). Photos -> JPEG, stickers -> WebP with alpha.
Without a source folder it only repacks img/*  ->  src/pics.js."""
import os, sys, json, base64
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(HERE, 'img')
os.makedirs(OUT, exist_ok=True)

# name: (source, box, width of the result)
PHOTOS = {
 'ap_mask':    ('A_cards.png', (1331, 99, 1729, 746), 380),
 'ap_dripper': ('A_cards.png', (907, 99, 1291, 746), 380),
 'ap_flamingo':('A_cards.png', (487, 99, 864, 746), 380),
 'ap_tea':     ('A_cards.png', (44, 99, 452, 746), 380),
 'lab_setup':  ('B_setup.png', (0, 0, 1672, 941), 1200),
 'fold1': ('C_woodfold.png', (1342, 200, 1672, 650), 330),
 'fold2': ('C_woodfold.png', (1030, 200, 1360, 650), 330),
 'fold3': ('C_woodfold.png', (710, 200, 1040, 650), 330),
 'fold4': ('C_woodfold.png', (407, 200, 737, 650), 330),
 'fold5': ('C_woodfold.png', (0, 118, 390, 650), 330),
 'paper_xsec': ('E_xsec.png', (0, 0, 1672, 941), 1100),
 'hook_kettle':('H_sievecup.png', (1090, 60, 1672, 860), 420),
 'hook_sieve': ('H_sievecup.png', (470, 190, 990, 880), 440),
 'hook_funnel':('B_setup.png', (690, 50, 1250, 830), 440),
 'sieve_zoom': ('F_sieve1.png', (134, 94, 776, 766), 520),
 'mix3':       ('I_beakers3.png', (0, 0, 1672, 941), 1100),
 'obs_zoom':   ('J_pour.png', (749, 18, 1396, 602), 560),
 'obs_paper':  ('J_pour.png', (716, 624, 1054, 926), 300),
 'wetland':    ('L_wetland.jpg', (0, 0, 640, 360), 640),
 'cover':      ('N_banner.png', (0, 0, 830, 941), 640),
}
# stickers cut out of the transparent sheet: name: (box, optional x-range to keep when the neighbours touch)
STICKERS = {
 'st_beaker': (20, 29, 283, 344), 'st_funnel': (535, 10, 818, 349), 'st_papers': (804, 34, 1209, 379),
 'st_beaker_mix': (1223, 14, 1512, 380), 'st_beaker_clear': (1215, 665, 1506, 986),
 'st_sand': (665, 418, 905, 590), 'st_gravel': (905, 418, 1117, 590), 'st_stones': (1117, 418, 1320, 590),
}

def cut():
    src = sys.argv[1]
    cache = {}
    def load(n):
        if n not in cache:
            im = Image.open(os.path.join(src, n))
            if im.mode == 'RGBA':
                bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[3]); im = bg
            cache[n] = im.convert('RGB')
        return cache[n]
    for k, (s, box, w) in PHOTOS.items():
        im = load(s).crop(box)
        h = round(im.height * w / im.width)
        im = im.resize((w, h), Image.LANCZOS)
        im.save(os.path.join(OUT, k + '.jpg'), quality=80, optimize=True, progressive=True)
    sheet = Image.open(os.path.join(src, 'P_stickers_t.png')).convert('RGBA')
    for k, box in STICKERS.items():
        im = sheet.crop(box)
        a = np.array(im)
        m = a[:, :, 3] > 128
        lab, n = ndi.label(ndi.binary_closing(m, iterations=3))
        if n > 1:   # keep the biggest piece only (a neighbour's edge may sit in the box)
            sizes = ndi.sum(m, lab, range(1, n + 1)); keep = lab == (1 + int(np.argmax(sizes)))
            keep = ndi.binary_dilation(keep, iterations=6)
            a[:, :, 3] = np.where(keep, a[:, :, 3], 0)
            im = Image.fromarray(a)
        bb = im.getbbox(); im = im.crop(bb)
        s = 280 / max(im.size); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        im.save(os.path.join(OUT, k + '.webp'), quality=88, method=6)

def pack():
    pk = {}
    for f in sorted(os.listdir(OUT)):
        n, e = os.path.splitext(f)
        mt = {'.jpg': 'image/jpeg', '.webp': 'image/webp'}.get(e)
        if mt: pk[n] = 'data:%s;base64,%s' % (mt, base64.b64encode(open(os.path.join(OUT, f), 'rb').read()).decode())
    open(os.path.join(HERE, 'src', 'pics.js'), 'w').write('/* the teacher\'s pictures, cut and packed by tools/make_pics.py */\nvar PIC=' + json.dumps(pk) + ';\n')
    print(len(pk), 'pictures,', sum(len(v) for v in pk.values()) // 1024, 'KB in src/pics.js')

if len(sys.argv) > 1: cut()
pack()
