"""Deletable formative items and editable / deletable signature labels (screen, print, Word).
   python3 tools/edit_test.py [app.html]"""
import sys, json, os, subprocess, tempfile
from playwright.sync_api import sync_playwright
HTML = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'app.html')
SEED = {"v": 2, "meta": {"teacher": "أ. اختبار", "school": ""}, "lessons": {}, "profile": {"name": "أ. اختبار", "school": "x", "courses": ["sci6"]}}
bad = []
def check(name, ok, info=""):
    print(("PASS " if ok else "FAIL ") + name, "" if ok else info)
    if not ok: bad.append(name)
def text(pdf):
    return subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, text=True).stdout
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1300, 'height': 1000}, accept_downloads=True); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + HTML + '#sci6~3-4'); pg.evaluate("s => localStorage.setItem('sci56-smart-planner:v2', s)", json.dumps(SEED)); pg.reload(); pg.wait_for_timeout(900)
    n = lambda sel: pg.locator(sel).count()
    n0, p0 = n('li.scr-only'), n('li.pr-only')
    check('formative list starts with one item per row', n0 == 6 and p0 >= 5, (n0, p0))
    pg.locator('li.scr-only').first.hover(); pg.locator('[data-evdel]').first.click(); pg.wait_for_timeout(300)
    check('x deletes an item (screen + print), restore button appears', n('li.scr-only') == n0 - 1 and n('li.pr-only') == p0 - 1 and n('[data-evrestore]') == 1, (n('li.scr-only'), n('li.pr-only')))
    # clear the text of another item by hand and leave the field
    pg.locator('li.scr-only [data-edit]').first.click(); pg.keyboard.press('Control+A'); pg.keyboard.press('Delete'); pg.locator('.sh-title').first.click(); pg.wait_for_timeout(400)
    check('clearing an item and leaving it removes the bullet', n('li.scr-only') == n0 - 2, n('li.scr-only'))
    pg.reload(); pg.wait_for_timeout(900)
    check('deletions survive a reload', n('li.scr-only') == n0 - 2)
    pg.click('[data-evrestore]'); pg.wait_for_timeout(300)
    check('restore brings every item back', n('li.scr-only') == n0 and n('[data-evrestore]') == 0, n('li.scr-only'))
    # signatures
    labs = lambda: pg.evaluate("() => [...document.querySelectorAll('[data-sglab]')].map(e => e.innerText)")
    check('three signature labels by default', labs() == ['معلم المادة', 'مشرف المادة', 'مدير المدرسة'], labs())
    pg.click('[data-sglab="teacher"]'); pg.keyboard.press('Control+A'); pg.keyboard.type('المعلم الأول'); pg.wait_for_timeout(500)
    pg.click('[data-sglab="supervisor"]'); pg.keyboard.press('Control+A'); pg.keyboard.type('المشرف التربوي'); pg.wait_for_timeout(500)
    pg.locator('[data-sg="principal"]').hover(); pg.click('[data-sgdel="principal"]'); pg.wait_for_timeout(400)
    check('labels edited and the principal box deleted', labs() == ['المعلم الأول', 'المشرف التربوي'] and n('[data-sgrestore]') == 1, labs())
    pg.reload(); pg.wait_for_timeout(900)
    check('signature edits survive a reload', labs() == ['المعلم الأول', 'المشرف التربوي'], labs())
    with tempfile.TemporaryDirectory() as d:
        pg.emulate_media(media='print'); pg.pdf(path=d + '/s.pdf', format='A4', print_background=True)
        t = text(d + '/s.pdf')
        check('print shows the new labels and not the deleted one', 'المشرف التربوي' in t and 'اسم مدير المدرسة' not in t and 'مدير المدرسة' not in t and '↺' not in t, t[-300:])
        pg.emulate_media(media='screen')
        with pg.expect_download(timeout=15000) as dl: pg.click('#wordBtn')
        dl.value.save_as(d + '/w.docx')
        import docx
        dd = docx.Document(d + '/w.docx'); cells = [c.text for t_ in dd.tables for r in t_.rows for c in r.cells]
        joined = ' | '.join(cells)
        check('Word shows the new labels and not the deleted one', 'المعلم الأول' in joined and 'المشرف التربوي' in joined and 'مدير المدرسة' not in joined and 'معلم المادة' not in joined)
    pg.click('[data-sgrestore]'); pg.wait_for_timeout(300)
    check('restore brings back the deleted box (labels keep the edit)', labs() == ['المعلم الأول', 'المشرف التربوي', 'مدير المدرسة'], labs())
    # all three removed: nothing printed
    for k in ('teacher', 'supervisor', 'principal'):
        pg.locator(f'[data-sg="{k}"]').hover(); pg.click(f'[data-sgdel="{k}"]'); pg.wait_for_timeout(200)
    with tempfile.TemporaryDirectory() as d:
        pg.emulate_media(media='print'); pg.pdf(path=d + '/s.pdf', format='A4', print_background=True)
        tt = text(d + '/s.pdf'); check('with every box deleted nothing is printed in the sign-off', 'المشرف التربوي' not in tt and 'اسم مشرف المادة' not in tt, tt[-200:])
    check('no page errors', not errs, errs)
    b.close()
print('FAILED: ' + ', '.join(bad) if bad else 'ALL PASS'); sys.exit(1 if bad else 0)
