"""Build lesson32.html: the shared core and unit helpers in ../_core plus this lesson's src/ (new look: photo backgrounds behind solid cards).   python3 build.py [--standalone] [--shared]"""
import sys
sys.path.insert(0, '../_core/tools')
from u4build import build
build('32', 'المول ٣-٢', ['assets.js', 'helpers.js', 'mole_a.js', 'mole_b.js', 'past.js', 'tail.js'], sys.argv, css_extra=['mole.css'], skin='cards', shuffle=True)
