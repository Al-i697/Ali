"""Build lesson31.html: the shared core and unit helpers in ../_core plus this lesson's src/ (new look: photo backgrounds behind solid cards).   python3 build.py [--standalone] [--shared]"""
import sys
sys.path.insert(0, '../_core/tools')
from u4build import build
build('31', 'الكتل النسبية ٣-١ (من الكتاب)', ['assets.js', 'art.js', 'helpers.js', 'a_intro.js', 'b_ar.js', 'c_mr.js', 'd_lab.js', 'e_models.js', 'f_npk.js', 'g_questions.js', 'past.js', 'tail.js'], sys.argv, css_extra=['lesson.css'], skin='cards', shuffle=True)
