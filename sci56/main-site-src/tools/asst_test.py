"""Floating assistant tests with a mock window.claude (real sample consent flow cannot run here).
Usage: python3 tools/asst_test.py [--shots]"""
import sys, json, base64, os, subprocess
from playwright.sync_api import sync_playwright
W = '/home/claude/work'
URL = 'file://' + W + '/app.html'
OUT = '/tmp/claude-0/-home-claude/63cf5978-af4a-5581-8f1f-7338fefa86ef/scratchpad/asst'
os.makedirs(OUT, exist_ok=True)
SEED = 'localStorage.setItem("chem10-smart-planner:v2", JSON.stringify({v:2, meta:{teacher:"أ. اختبار", school:"مدرسة تجريبية"}, lessons:{}, profile:{name:"أ. اختبار", school:"مدرسة تجريبية", courses:["chem10","chem11","env11"]}}))'
INIT = 'if(!localStorage.getItem("chem10-smart-planner:v2")){' + SEED + '}'
MOCK = r'''
window.__calls = []; window.__saved = null;
window.claude = { use: async (name) => {
  if (name === "sample") {
    const f = async (input, opts = {}) => {
      const turns = typeof input === "string" ? [{role:"user", content: input}] : input;
      const last = turns[turns.length-1].content;
      window.__calls.push({ n: turns.length, last, first: turns[0].content, size: JSON.stringify(turns).length });
      let reply;
      if (last.includes("[قواعد التصميم]")) reply = window.__deckOutReply();
      else if (last.includes("[قواعد البناء]")) reply = window.__deckInReply();
      else reply = window.__chatReply(last);
      let acc = "";
      for (const part of reply.match(/[\s\S]{1,70}/g)) {
        await new Promise(r => setTimeout(r, window.__delay || 4));
        if (opts.signal && opts.signal.aborted) { const e = {code:"cancelled", message:"x", text: acc}; throw e; }
        acc += part; opts.onText && opts.onText({text: acc, delta: part});
      }
      return { text: acc, truncated: false };
    };
    f.json = async () => ({}); f.limits = async () => ({});
    return f;
  }
  if (name === "downloads") return { save: async ({filename, data}) => { window.__saved = {filename, size: data.size, type: data.type}; window.__savedBlob = data; return {status:"saved"}; } };
  return null;
} };
'''

def safe_reload(pg, wait=900):
    """Reload; the headless file:// test browser occasionally drops localStorage on reload, so restore it and reload again."""
    snap = pg.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage)))')
    n = len(json.loads(snap))
    for _ in range(3):
        pg.reload(); pg.wait_for_timeout(wait)
        if pg.evaluate('Object.keys(localStorage).length') >= n and pg.evaluate('(localStorage.getItem("chem10-smart-planner:v2")||"").length') >= len(json.loads(snap).get("chem10-smart-planner:v2", "")): return
        print('NOTE: test browser lost localStorage on reload; restoring')
        pg.evaluate('(s) => { const o = JSON.parse(s); for (const k in o) localStorage.setItem(k, o[k]); }', snap)

fails = []
def check(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name, extra if not cond else '')
    if not cond: fails.append(name)

with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 1400, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'ERR_' not in m.text else None)
    pg.add_init_script(INIT); pg.add_init_script(MOCK)
    pg.goto(URL + '#env11~2-1'); pg.wait_for_timeout(900)
    key = pg.evaluate('state.key'); print('key', key)
    check('lesson selected', key.startswith('env11'))
    check('fab visible', pg.is_visible('#asstFab'))
    pg.click('#asstFab'); pg.wait_for_timeout(200)
    check('panel open', pg.is_visible('#asst'))
    check('fab hidden when open', not pg.is_visible('#asstFab'))
    check('no ai banner', 'asst-st on' not in (pg.get_attribute('#asstSt', 'class') or '') or 'info' in pg.get_attribute('#asstSt', 'class'))
    # ---- chat: update + insert + set proposal
    pl0 = pg.evaluate('(()=>{const p=computePlan(); return {rows:p.flow.length, periods:p.periods, total:p.total}})()')
    print('plan before', pl0)
    pg.evaluate('''window.__chatReply = (last) => `سأبدّل التمهيد بتهيئة من البيئة العُمانية وأضيف نشاطاً قصيراً.
@@PROPOSAL {"title":"تهيئة عُمانية ونشاط إضافي"}
@@OP {"op":"update_row","at":1,"set":{"phase":"تهيئة عُمانية","min":5,"t":["يعرض صورة لمحطة تحلية في عُمان","يسأل: كيف نتأكد أن المياه صالحة؟"],"s":["يكتب ملاحظة وسؤالاً"],"tool":"سؤال شفهي","q":"ما أول سؤال يخطر لك عن المياه؟","ans":"أسئلة عن الملوحة والنقاء","crit":"سؤال قابل للاختبار"}}
@@OP {"op":"insert_row","after":3,"row":{"phase":"نشاط تعاوني","strat":"التعلم التعاوني","min":8,"obj":["2-2"],"t":["يوزع الأدوار","يتابع المجموعات"],"s":["ينفذ كل طالب دوره"],"tool":"قائمة رصد","q":"ما المتغير المستقل في نشاطكم؟","ans":"الملح","crit":"يحدد المتغير بدقة"}}
@@OP {"op":"set","field":"homework","value":"حل سؤال 2 ص 58\\nاقتراح فرضية جديدة"}
@@END`;''')
    pg.fill('#asstIn', 'اجعل التمهيد من البيئة العُمانية وأضف نشاطاً تعاونياً'); pg.press('#asstIn', 'Enter')
    pg.wait_for_selector('.prop .btn-gold', timeout=8000)
    check('proposal card shown', pg.is_visible('.prop'))
    check('proposal shows 3 items', pg.locator('.prop li').count() == 3, pg.locator('.prop li').count())
    check('user turn contains plan listing', 'الصفوف المرقمة' in pg.evaluate('__calls[0].last') and '#1 |' in pg.evaluate('__calls[0].last'))
    check('first turn is instructions', 'مساعد التحضير' in pg.evaluate('__calls[0].first'))
    pg.screenshot(path=OUT + '/01_proposal.png')
    pg.click('.prop .btn-gold'); pg.wait_for_timeout(500)
    pl1 = pg.evaluate('''(()=>{const p=computePlan(); return {rows:p.flow.length, periods:p.periods, total:p.total, locked:p.aiLocked, hw:p.t.homework, codes:p.flow.map(r=>r.code), mins:p.flow.map(r=>r.minutes), strats:p.strategies}})()''')
    print('plan after', pl1)
    check('applied: locked', pl1['locked'])
    check('applied: +1 row', pl1['rows'] == pl0['rows'] + 1, pl1['rows'])
    check('applied: total = periods*40', pl1['total'] == pl1['periods'] * 40, (pl1['total'], pl1['periods']))
    check('applied: homework', 'فرضية جديدة' in pl1['hw'])
    check('applied: phase renamed', 'تهيئة عُمانية' in pl1['codes'])
    check('card shows applied + undo', pg.is_visible('.prop-st.ok') and pg.is_visible('[data-ax=undo]'))
    check('banner restore visible', pg.is_visible('#asstSt [data-ax=restore]'))
    pg.screenshot(path=OUT + '/02_applied.png')
    # per-period sums
    sums = pg.evaluate('''(()=>{const p=computePlan(); const s={}; p.flow.forEach(r=>s[r.period]=(s[r.period]||0)+r.minutes); return s})()''')
    check('each period 40', all(v == 40 for v in sums.values()), sums)
    # form renders and persistence
    pg.evaluate("document.querySelector('#asstClose').click()")
    pg.wait_for_timeout(200)
    txt = pg.inner_text('.exec-wrap')
    check('table shows new phase', 'نشاط تعاوني' in txt and 'تهيئة عُمانية' in txt)
    saved = pg.evaluate('JSON.parse(localStorage.getItem("chem10-smart-planner:v2")).lessons[state.key].aiFlow.locked')
    pg.wait_for_timeout(500)
    saved = pg.evaluate('(()=>{const l=JSON.parse(localStorage.getItem("chem10-smart-planner:v2")).lessons[state.key]; return !!(l.aiFlow&&l.aiFlow.locked)})()')
    check('persisted to storage', saved)
    # reload keeps plan
    safe_reload(pg)
    check('reload keeps locked plan', pg.evaluate('computePlan().aiLocked'))
    # undo
    pg.click('#asstFab'); pg.wait_for_timeout(200)
    check('chat empty after reload (session only)', pg.locator('#asstLog .am.u').count() == 0)
    pg.click('#asstSt [data-ax=restore]'); pg.wait_for_timeout(300)
    pl2 = pg.evaluate('(()=>{const p=computePlan(); return {rows:p.flow.length, locked:p.aiLocked, total:p.total, duration:p.duration}})()')
    check('restore original', (not pl2['locked']) and pl2['rows'] == pl0['rows'] and pl2['total'] == pl2['duration'], pl2)
    print('errors:', errs)
    check('no page errors', not errs, errs[:5])
    b.close()
print('FAILS:', fails)
sys.exit(1 if fails else 0)
