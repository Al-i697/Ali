"""Build deck.html: embeds the generated scene images (art/*.webp, resized) into deck.src.html."""
import base64, io, pathlib
from PIL import Image
d = pathlib.Path(__file__).parent
def uri(name, w):
    im = Image.open(d / 'art' / name).convert('RGB')
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=86)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
s = (d / 'deck.src.html').read_text(encoding='utf-8')
for k, (f, w) in {'6a': ('6a.webp', 1600), '7a': ('7a.webp', 1000), '8a': ('8a.webp', 1600), '9a': ('9a.webp', 1600)}.items():
    s = s.replace('{{IMG_%s}}' % k, uri(f, w))
(d / 'deck.html').write_text(s, encoding='utf-8')
print('deck.html', len(s) // 1024, 'KB')
