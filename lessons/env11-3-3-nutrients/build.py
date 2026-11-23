"""Build lessone33.html (environmental science, grade 11, unit 3, section 3-3 "nutrient cycles"): the shared core and unit helpers in ../_core plus this lesson's src/ (cards look on plain palette backgrounds, every picture drawn in code).   python3 build.py [--standalone] [--shared]"""
import sys
sys.path.insert(0, '../_core/tools')
from u4build import build
build('e33', 'دورات المغذيات ٣-٣', ['photos.js', 'helpers.js', 'svgs.js', 'part_a.js', 'part_b.js', 'part_c.js', 'part_d.js', 'part_e.js', 'part_f.js', 'tail.js'], sys.argv, css_extra=['env.css'], skin='cards', shuffle=True, digits=True, book=True, tools=True, kinds=True, predict=True, summary=True)
