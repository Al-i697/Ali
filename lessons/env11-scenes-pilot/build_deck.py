"""Build deck.html: embeds the generated scenes and icon tiles (art/*) into deck.src.html."""
import base64, io, json, pathlib
from PIL import Image
d = pathlib.Path(__file__).parent

def uri(name, w, fmt='WEBP', q=86):
    im = Image.open(d / 'art' / name)
    im = im.convert('RGBA' if fmt == 'PNG' else 'RGB')
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    if fmt == 'PNG': im.save(b, 'PNG', optimize=True)
    else: im.save(b, 'WEBP', quality=q)
    return 'data:image/%s;base64,%s' % (fmt.lower(), base64.b64encode(b.getvalue()).decode())

def tiles(name, cols, rows, w, fmt):
    """Cut an icon sheet into equal grid cells (row by row, left to right) and return data URIs."""
    sheet = Image.open(d / 'art' / name)
    sheet = sheet.convert('RGBA' if fmt == 'PNG' else 'RGB')
    cw, ch = sheet.width // cols, sheet.height // rows
    out = []
    for r in range(rows):
        for c in range(cols):
            my = round(ch * 0.02)
            t = sheet.crop((c * cw, r * ch + my, (c + 1) * cw, (r + 1) * ch - my))
            t = t.resize((w, round(w * t.height / t.width)), Image.LANCZOS)
            b = io.BytesIO()
            if fmt == 'PNG': t.save(b, 'PNG', optimize=True)
            else: t.save(b, 'WEBP', quality=84)
            out.append('data:image/%s;base64,%s' % (fmt.lower(), base64.b64encode(b.getvalue()).decode()))
    return out

s = (d / 'deck.src.html').read_text(encoding='utf-8')
for k, (f, w) in {'6a': ('6a.webp', 1600), '7a': ('7a.webp', 1000), '8a': ('8a.webp', 1600), '9a': ('9a.webp', 1600),
                  '8b': ('8b.webp', 1672), '4a': ('4a.webp', 1600)}.items():
    s = s.replace('{{IMG_%s}}' % k, uri(f, w))
TL = {'t4b': tiles('4b.webp', 3, 3, 300, 'WEBP'), 't10a': tiles('10a.png', 3, 3, 240, 'PNG')}
s = s.replace('{{TILES}}', json.dumps(TL))
(d / 'deck.html').write_text(s, encoding='utf-8')
print('deck.html', len(s) // 1024, 'KB')
