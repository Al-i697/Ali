"""Build lesson22.html: the shared core and unit helpers in ../_core plus this lesson's src/.   python3 build.py [--standalone] [--shared]
src/imgs.js (the teacher's template frames and cut-outs) is made by tools/make_imgs.py."""
import sys
sys.path.insert(0, '../_core/tools')
from u4build import build
build('22', 'إنتاج الحديد والفولاذ ٢-٢', ['imgs.js', 'helpers.js', 'part_a.js', 'part_b.js', 'part_c.js', 'part_d.js', 'tail.js'], sys.argv, css_extra=['lesson.css'], skin='cards', eqlab=True, shuffle=True)
