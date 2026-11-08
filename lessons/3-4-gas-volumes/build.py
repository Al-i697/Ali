"""Build lesson34.html: the shared core and unit helpers in ../_core plus this lesson's src/ (new look: photo backgrounds behind solid cards).   python3 build.py [--standalone] [--shared]"""
import sys
sys.path.insert(0, '../_core/tools')
from u4build import build
build('34', 'حجوم الغازات ٣-٤', ['helpers.js', 'part_a.js', 'part_b.js', 'part_c.js', 'part_d.js', 'part_e.js', 'past.js', 'tail.js'], sys.argv, css_extra=['lesson.css'], skin='cards', shuffle=True)
