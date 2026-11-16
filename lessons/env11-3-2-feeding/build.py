"""Build lessone32.html (environmental science, grade 11, unit 3, section 3-2 "feeding relationships"): the shared core and unit helpers in ../_core plus this lesson's src/ (cards look on plain palette backgrounds).   python3 build.py [--standalone] [--shared]"""
import sys
sys.path.insert(0, '../_core/tools')
from u4build import build
build('e32', 'علاقات التغذية ٣-٢', ['photos.js', 'helpers.js', 'part_a.js', 'part_b.js', 'part_c.js', 'part_d.js', 'part_e.js', 'part_f.js', 'tail.js'], sys.argv, css_extra=['env.css'], skin='cards', shuffle=True, digits=True)
