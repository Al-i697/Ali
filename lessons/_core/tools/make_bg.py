"""Make photo backgrounds from the NotebookLM lesson decks.

The decks are exported as one picture per slide (text baked in). For each chosen slide this script
  1. erases the text panels with a smooth diffusion fill (the artwork at the edges stays sharp),
  2. crops / flips / shifts the hue to make several different-looking backgrounds from one slide,
  3. saves 1280x720 JPEGs to ../bgimg/ and packs them into ../bgimg_assets.js (BGIMG = {name: data-URI}).

usage:  python3 make_bg.py [<folder with the slide pictures named x01.png ... z15.png>]   (without the folder only the teacher's own photos in ../bgimg/src are processed)
  x = deck of 4-1 (alkanes), y = deck of 4-2 (alkenes), z = deck of 4-3 (petroleum).
"""
import sys, os, io, base64, json
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

SRC = sys.argv[1] if len(sys.argv) > 1 else None
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'bgimg')
os.makedirs(OUT, exist_ok=True)
W, H = 1280, 720

def load(name):
    return Image.open(os.path.join(SRC, name)).convert('RGB')

def diffuse(img, rects, feather=16, f=8, iters=900):
    """erase the rectangles (x0,y0,x1,y1 in source pixels) and fill them smoothly from the surroundings"""
    w, h = img.size
    m = Image.new('L', (w, h), 0)
    px = m.load()
    for (x0, y0, x1, y1) in rects:
        for y in range(max(0, y0), min(h, y1)):
            for x in range(max(0, x0), min(w, x1)):
                px[x, y] = 255
    a = np.asarray(img).astype(np.float32)
    ms = np.asarray(m.resize((w // f, h // f), Image.BOX)) > 0
    sm = np.asarray(img.resize((w // f, h // f), Image.BOX)).astype(np.float32)
    known = ~ms
    cur = sm.copy(); cur[ms] = sm[known].mean(axis=0)
    for _ in range(iters):
        p = np.pad(cur, ((1, 1), (1, 1), (0, 0)), mode='edge')
        avg = (p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]) / 4
        cur[ms] = avg[ms]
    chans = [np.asarray(Image.fromarray(cur[..., c].astype(np.float32), 'F').resize((w, h), Image.BICUBIC)) for c in range(3)]
    fill = np.stack(chans, axis=-1).astype(np.float32)
    fe = np.asarray(m.filter(ImageFilter.GaussianBlur(feather))).astype(np.float32)[..., None] / 255.0
    rng = np.random.default_rng(3)
    noise = rng.normal(0, 2.6, a.shape).astype(np.float32)
    out = a * (1 - fe) + (fill + noise) * fe
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

def cover(img, box=None, flip=False):
    if box: img = img.crop(box)
    if flip: img = img.transpose(Image.FLIP_LEFT_RIGHT)
    iw, ih = img.size
    s = max(W / iw, H / ih)
    img = img.resize((int(iw * s + .5), int(ih * s + .5)), Image.LANCZOS)
    l, t = (img.width - W) // 2, (img.height - H) // 2
    return img.crop((l, t, l + W, t + H))

def extend(img, box, side='right'):
    """a narrow photo on one side, the rest filled with a blurred mirror of it"""
    ph = img.crop(box); s = H / ph.height
    ph = ph.resize((int(ph.width * s + .5), H), Image.LANCZOS)
    canvas = Image.new('RGB', (W, H))
    mir = ph.transpose(Image.FLIP_LEFT_RIGHT)
    x = 0
    tiles = []
    while x < W:
        tiles.append((mir if len(tiles) % 2 == 0 else ph, x)); x += ph.width
    for t, x0 in tiles: canvas.paste(t, (x0, 0))
    far = canvas.filter(ImageFilter.GaussianBlur(26))
    # sharp photo at the start, then a soft hand-over to the blurred mirror
    mask = Image.new('L', (W, H), 0); mp = mask.load()
    edge = ph.width
    for xx in range(W):
        v = 255 if xx < edge - 60 else int(255 * max(0, (edge + 90 - xx) / 150.0))
        for yy in range(0, H, 1): mp[xx, yy] = max(0, min(255, v))
    sharp = Image.new('RGB', (W, H)); sharp.paste(ph, (0, 0))
    out = Image.composite(sharp, far, mask)
    if side == 'left': out = out.transpose(Image.FLIP_LEFT_RIGHT)
    return out

def hue(img, deg):
    if not deg: return img
    hsv = np.asarray(img.convert('HSV')).astype(np.int32)
    hsv[..., 0] = (hsv[..., 0] + int(deg / 360.0 * 256)) % 256
    return Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')

def tone(img, sat=1.0, bright=1.0, blur=0):
    if blur: img = img.filter(ImageFilter.GaussianBlur(blur))
    img = ImageEnhance.Color(img).enhance(sat)
    return ImageEnhance.Brightness(img).enhance(bright)

OUTS = {}
QUAL = 88
def grain(img, s=2.4):
    """remove the banding of the smooth gradients (smooth where there is no detail), then add fine grain so it cannot come back"""
    a = np.asarray(img).astype(np.float32)
    lp = np.asarray(img.filter(ImageFilter.GaussianBlur(9))).astype(np.float32)
    g = np.asarray(img.convert('L').filter(ImageFilter.FIND_EDGES)).astype(np.float32)
    g = np.asarray(Image.fromarray(np.clip(g * 8, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255.0
    m = np.clip((g - .06) / .22, 0, 1)[..., None]
    out = a * m + lp * (1 - m)
    out = out + np.random.default_rng(11).normal(0, s, a.shape[:2])[..., None]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

def darkgrade(img, k=.30, lift=(6, 16, 24)):
    """a light slide becomes a dark moody background: scale the brightness down and lift the blacks to a deep tint"""
    a = np.asarray(img).astype(np.float32) * k + np.array(lift, np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

GRAIN = 2.4
def save(name, img, g=None):
    img = grain(img, GRAIN if g is None else g)
    img.save(os.path.join(OUT, name + '.jpg'), quality=QUAL, optimize=True, progressive=True)
    OUTS[name] = os.path.getsize(os.path.join(OUT, name + '.jpg'))

LOGO = (1240, 735, 1376, 768)
if SRC and os.path.exists(os.path.join(SRC, 'x01.png')):
    # ---- x01: the cover of the alkanes deck (a molecule on a ginkgo leaf, deep blue) ----
    x01 = diffuse(load('x01.png'), [(650, 485, 1330, 705), LOGO])
    save('nb_leaf',   cover(x01))
    save('nb_leaf_z', cover(x01, (160, 20, 920, 448)))
    save('nb_leaf_v', hue(cover(x01, flip=True), 55))
    save('nb_leaf_g', hue(tone(cover(x01, (0, 0, 1000, 563), flip=True), 1.0, .95), -48))
    save('nb_leaf_d', tone(cover(x01, (0, 300, 760, 728)), 1.0, 1.1, 1.5))
    # ---- x03: the periodic table with the crowned carbon (dark teal) ----
    x03 = diffuse(load('x03.png'), [(770, 90, 1376, 720), (360, 385, 760, 650), LOGO])
    save('nb_table',   cover(x03, (40, 30, 740, 424)))
    save('nb_table_v', hue(cover(x03, (40, 30, 740, 424)), 95))
    # ---- z01: the oil-rig photograph of the petroleum deck (three crops, the flare, the cranes, the barrel and the oil) ----
    z01 = load('z01.png')
    def sharp(img): return img.filter(ImageFilter.UnsharpMask(radius=2, percent=70, threshold=2))
    save('nb_rig',   sharp(cover(z01, (84, 250, 562, 519))))
    save('nb_rig_s', sharp(cover(z01, (84, 78, 562, 347))))
    save('nb_rig_o', sharp(cover(z01, (84, 400, 562, 669))))

# ---- the teacher's own photographs (736 px wide, so every crop is enlarged about 1.7x: a light unsharp mask, then grain hides the softness) ----
USR = os.path.join(OUT, 'src')
def usr(n): return Image.open(os.path.join(USR, n)).convert('RGB')
def up(img): return img.filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
QUAL = 76
GRAIN = 1.5   # the photos are dimmed and blurred behind the panels: finer grain keeps the files small
pump = usr('user_pump.jpg')          # a pumpjack at sunset (736x981)
save('u_pump_sky',  up(cover(pump, (0, 40, 736, 454))))                # the stormy sky and the orange glow
save('u_pump_head', up(cover(pump, (0, 250, 736, 664), flip=True)))     # the pumpjack head against the glow
save('u_pump_base', up(cover(pump, (0, 540, 736, 954))))                # the horizon, the base and the ground
earth = usr('user_earth.jpg')        # a globe with a seedling in a forest (736x1308)
save('u_earth_top', up(cover(earth, (0, 0, 736, 414))))                 # sun rays and green bokeh
save('u_earth',     up(cover(earth, (30, 330, 736, 727))))              # the seedling and the top of the globe
save('u_earth_g',   hue(up(cover(earth, (0, 60, 736, 474), flip=True)), -30), 1.6)
ref = usr('user_refinery.jpg')       # a refinery with flares (736x736)
save('u_ref_top',   up(cover(ref, (0, 0, 736, 414))))                   # flares against the sky
save('u_ref_mid',   up(cover(ref, (0, 150, 736, 564), flip=True)))      # the towers
save('u_ref_low',   up(cover(ref, (0, 322, 736, 736))))                 # the tanks and the control boxes
hands = usr('user_hands.jpg')        # a green infographic held in two hands (736x736)
save('u_hands',     darkgrade(up(cover(hands, (0, 30, 736, 444))), .55, (4, 12, 10)), 1.6)
pipes = usr('user_pipes.jpg')        # offshore platform and pipes at sunset (736x736)
save('u_pipes_sun', up(cover(pipes, (0, 120, 736, 534))))               # the sun between the pipes
save('u_pipes_top', up(cover(pipes, (0, 0, 736, 414))))                 # the platform and the sky
save('u_pipes_sea', up(cover(pipes, (0, 322, 736, 736), flip=True)))    # the sea and the pipes

pack = {}
names = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith('.jpg'))
for n in names:
    pack[n] = 'data:image/jpeg;base64,' + base64.b64encode(open(os.path.join(OUT, n + '.jpg'), 'rb').read()).decode()
js = '/* photo backgrounds (from the NotebookLM decks and the teacher\'s own photographs) made by tools/make_bg.py: {name: data-URI}. Do not edit by hand. */\nvar BGIMG=' + json.dumps(pack) + ';\n'
open(os.path.join(OUT, '..', 'bgimg_assets.js'), 'w').write(js)
print(len(names), 'images,', sum(os.path.getsize(os.path.join(OUT, n + '.jpg')) for n in names) // 1024, 'KB of JPEG, bgimg_assets.js', len(js) // 1024, 'KB')
