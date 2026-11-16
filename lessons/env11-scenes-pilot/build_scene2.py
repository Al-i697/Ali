"""Build scene2-chemosynthesis.html: embeds the cropped vent illustration (vent.webp) into scene2.src.html."""
import base64, pathlib
d = pathlib.Path(__file__).parent
b = base64.b64encode((d / 'vent.webp').read_bytes()).decode()
(d / 'scene2-chemosynthesis.html').write_text((d / 'scene2.src.html').read_text(encoding='utf-8').replace('{{VENT}}', b), encoding='utf-8')
print('built')
