"""Build lesson42.html: the shared core and unit-4 helpers in ../_core plus this lesson's src/.   python3 build.py [--standalone] [--shared]"""
import sys
sys.path.insert(0, '../_core/tools')
from u4build import build
build('42', 'الألكينات وتفاعلات الإضافة ٤-٢', ['alk.js', 'part_a.js', 'part_b.js', 'part_c.js', 'part_d.js', 'past.js', 'tail.js'], sys.argv, skin='photo')
