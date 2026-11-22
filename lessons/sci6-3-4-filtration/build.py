"""Build lessons634.html (the Grade-6 science lesson 3-4, filtration): the shared core and the light 'sci' look in ../_core plus this lesson's src/.   python3 build.py [--standalone] [--shared]"""
import sys
sys.path.insert(0, '../_core/tools')
from u4build import build
build('s634', 'الترشيح ٣-٤', ['pics.js', 'slides_a.js', 'slides_b.js', 'slides_c.js', 'tail.js'], sys.argv, css_extra=['lesson.css'], skin='sci', digits=True, book=True, tools=True, kinds=True, summary=True)
