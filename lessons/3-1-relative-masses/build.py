"""Build lesson31.html: the shared core and unit helpers in ../_core plus this lesson's src/ (new look: photo backgrounds behind solid cards).   python3 build.py [--standalone] [--shared]"""
import sys
sys.path.insert(0, '../_core/tools')
from u4build import build
build('31', 'الكتل النسبية ٣-١', ['assets.js', 'art.js', 'deck_a.js', 'deck_b.js', 'slides_b.js', 'deck_c.js', 'lab_main.js', 'past.js', 'tail.js'], sys.argv, css_extra=['lesson.css'], skin='cards', shuffle=True)
