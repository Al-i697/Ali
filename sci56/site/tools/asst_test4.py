"""Assistant: viewer where sample is unavailable at load -> banner + recheck; error codes shown."""
from playwright.sync_api import sync_playwright
exec(open('/home/user/Ali/sci56/site/tools/asst_test.py').read().split("fails = []")[0])
fails = []
def check(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name, extra if not cond else '')
    if not cond: fails.append(name)
LATE = MOCK.replace('window.claude = { use: async (name) => {\n  if (name === "sample") {',
  'window.claude = { use: async (name) => {\n  if (name === "sample" && !window.__ready) return null;\n  if (name === "sample") {')
assert LATE != MOCK
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 1400, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script(INIT); pg.add_init_script(LATE)
    pg.goto(URL + '#sci6~1-3'); pg.wait_for_timeout(1000)
    pg.click('#asstFab'); pg.wait_for_timeout(200)
    st = pg.inner_text('#asstSt')
    check('viewer-null: banner mentions published link', 'تطبيق Claude' in st and pg.is_visible('#asstSt [data-ax=recheck]') and pg.is_visible('#asstSt [data-ax=cfg]'), st)
    check('viewer-null: input disabled + placeholder explains', pg.is_disabled('#asstIn') and 'غير متصلة' in (pg.get_attribute('#asstIn', 'placeholder') or ''))
    pg.screenshot(path=OUT + '/30_viewer_null.png')
    pg.evaluate('window.__ready = true')
    pg.click('#asstSt [data-ax=recheck]'); pg.wait_for_timeout(500)
    check('recheck: input enabled', not pg.is_disabled('#asstIn'))
    check('recheck: banner cleared', 'تطبيق Claude' not in pg.inner_text('#asstSt'))
    pg.evaluate('window.__chatReply = () => "تمام، المحادثة تعمل."')
    pg.fill('#asstIn', 'مرحبا'); pg.click('#asstSend'); pg.wait_for_selector('.am.a .bd', timeout=5000); pg.wait_for_timeout(300)
    check('recheck: chat works afterwards', 'المحادثة تعمل' in pg.inner_text('#asstLog'))
    # error code surfaced
    pg.evaluate('(()=>{ window.__chatReply = function(){ const e = new Error("boom"); e.code = "upstream_error"; throw e; }; })()')
    pg.fill('#asstIn', 'اختبار خطأ'); pg.click('#asstSend'); pg.wait_for_timeout(700)
    lg = pg.inner_text('#asstLog')
    check('error: code shown', 'upstream_error' in lg, lg[-200:])
    check('no page errors', not errs, errs[:3])
    pg.close(); b.close()
print('FAILS', fails)
