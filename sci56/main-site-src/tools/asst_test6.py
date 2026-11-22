"""Assistant: server mode (site deployed with server/_worker.js): no key for users, optional access code, fallbacks."""
import json, subprocess, time
from playwright.sync_api import sync_playwright
exec(open('/home/claude/work/tools/asst_test.py').read().split("fails = []")[0])
def sse(text, stop='end_turn'):
    ev = ['event: message_start\ndata: ' + json.dumps({'type':'message_start','message':{'id':'m','role':'assistant','content':[]}})]
    for i in range(0, len(text), 37):
        ev.append('event: content_block_delta\ndata: ' + json.dumps({'type':'content_block_delta','index':0,'delta':{'type':'text_delta','text':text[i:i+37]}}, ensure_ascii=False))
    ev.append('event: message_delta\ndata: ' + json.dumps({'type':'message_delta','delta':{'stop_reason':stop}}))
    ev.append('event: message_stop\ndata: {"type":"message_stop"}')
    return '\r\n\r\n'.join(ev) + '\r\n\r\n'
PROP = '''سأضيف واجباً جديداً.
@@PROPOSAL {"title":"واجب جديد"}
@@OP {"op":"set","field":"homework","value":"حل سؤال 3\\nكتابة تقرير قصير"}
@@END'''
fails = []
def check(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name, extra if not cond else '')
    if not cond: fails.append(name)
PORT = 8766; HURL = f'http://127.0.0.1:{PORT}/app.html'
srv = subprocess.Popen(['python3', '-m', 'http.server', str(PORT), '--bind', '127.0.0.1', '--directory', W], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
CODE = 'teacher-123'
S = {'needs': False, 'chat': 'ok', 'reqs': [], 'status404': False, 'statusReqs': []}
def api(route, request):
    p = request.url.split('127.0.0.1:%d' % PORT)[1]
    if p.startswith('/api/ai/status'):
        S['statusReqs'].append(request.headers.get('x-access-code'))
        if S['status404']: route.fulfill(status=404, body='nope'); return
        auth = (not S['needs']) or request.headers.get('x-access-code') == CODE
        route.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': True, 'needsCode': S['needs'], 'authorized': auth})); return
    body = json.loads(request.post_data); S['reqs'].append({'h': request.headers, 'b': body})
    if S['chat'] == 'badcode': route.fulfill(status=401, content_type='application/json', body=json.dumps({'type':'error','error':{'type':'access_code_invalid','message':'x'}})); return
    if S['chat'] == 'daily': route.fulfill(status=429, content_type='application/json', body=json.dumps({'type':'error','error':{'type':'daily_limit','message':'x'}})); return
    if S['chat'] == 'credit': route.fulfill(status=400, content_type='application/json', body=json.dumps({'type':'error','error':{'type':'invalid_request_error','message':'Your credit balance is too low'}})); return
    if S['chat'] == 'keyerr': route.fulfill(status=502, content_type='application/json', body=json.dumps({'type':'error','error':{'type':'server_key_error','message':'x'}})); return
    route.fulfill(status=200, content_type='text/event-stream', body=sse(PROP if S['chat'] == 'prop' else 'رد من خادم الموقع.'))
def newctx(b):
    ctx = b.new_context(viewport={'width': 1400, 'height': 900})
    ctx.route('**/api/ai**', api)
    ctx.route('https://api.anthropic.com/**', lambda r, q: (S['reqs'].append({'h': q.headers, 'b': json.loads(q.post_data), 'direct': True}), r.fulfill(status=200, headers={'access-control-allow-origin':'*'}, content_type='text/event-stream', body=sse('تم')))[1])
    return ctx
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    # ---------- A: no code needed
    ctx = newctx(b); pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.add_init_script(INIT)
    pg.goto(HURL + '#env11~2-1'); pg.wait_for_function('window.__axChecked === true', timeout=15000); pg.wait_for_timeout(300)
    check('A: server mode on load', pg.evaluate('AXD.mode') == 'server' and pg.evaluate('sampleFn === axdSampleSrv'))
    pg.click('#asstFab'); pg.wait_for_timeout(300)
    check('A: no cfg popup, no banner, input enabled', not pg.is_visible('#asstCfg') and not pg.is_visible('#asstSt') and not pg.is_disabled('#asstIn'))
    S['reqs'].clear(); pg.fill('#asstIn', 'اشرح'); pg.press('#asstIn', 'Enter'); pg.wait_for_selector('.am.a .bd', timeout=5000); pg.wait_for_timeout(500)
    r = S['reqs'][-1]
    check('A: reply shown', 'رد من خادم الموقع' in pg.inner_text('#asstLog'))
    check('A: request carries no key / no code / no model', not any(k in r['h'] for k in ('x-api-key', 'x-access-code')) and 'model' not in r['b'] and r['b']['stream'] is True and r['b']['messages'][-1]['role'] == 'user', str(r['h'])[:200])
    S['chat'] = 'prop'; pg.fill('#asstIn', 'أضف واجباً'); pg.press('#asstIn', 'Enter'); pg.wait_for_selector('.prop .btn-gold', timeout=8000); pg.click('.prop .btn-gold'); pg.wait_for_timeout(400)
    check('A: proposal applied via server', 'كتابة تقرير قصير' in pg.evaluate('document.body.innerText'))
    for mode, needle, label in (('daily', 'daily_limit', 'daily limit'), ('credit', 'مسؤول الموقع', 'credit -> tell the site admin'), ('keyerr', 'مسؤوله', 'server key error')):
        S['chat'] = mode; pg.fill('#asstIn', 'سؤال ' + mode); pg.press('#asstIn', 'Enter'); pg.wait_for_timeout(700)
        check('A: ' + label, needle in pg.inner_text('#asstLog'), pg.inner_text('#asstLog')[-160:])
    S['chat'] = 'ok'
    # personal key overrides, delete returns to server
    pg.click('#asstCfgBtn'); pg.wait_for_timeout(200)
    check('A: settings: key section collapsed behind a summary', pg.is_visible('#axKeySum') and not pg.is_visible('#axKey') and not pg.is_visible('#axCodeBox'))
    pg.click('#axKeySum'); pg.fill('#axKey', 'sk-ant-mine'); S['reqs'].clear(); pg.click('#axSave'); pg.wait_for_timeout(700)
    check('A: personal key goes direct to Anthropic', pg.evaluate('AXD.mode') == 'key' and any(q.get('direct') and q['h'].get('x-api-key') == 'sk-ant-mine' for q in S['reqs']), str(S['reqs'])[:200])
    pg.click('#asstCfgBtn'); pg.wait_for_timeout(200); pg.click('#axDel'); pg.wait_for_timeout(400)
    check('A: delete personal key -> back to server', pg.evaluate('AXD.mode') == 'server' and not pg.is_disabled('#asstIn'))
    check('A: no page errors', not errs, errs[:3])
    ctx.close()
    # ---------- B: access code required
    S['needs'] = True; S['chat'] = 'ok'; S['statusReqs'].clear()
    ctx = newctx(b); pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.add_init_script(INIT)
    pg.goto(HURL + '#env11~2-1'); pg.wait_for_function('window.__axChecked === true', timeout=15000); pg.wait_for_timeout(300)
    check('B: locked until code (mode none, srv known)', pg.evaluate('AXD.mode') == 'none' and pg.evaluate('AXD.srv && AXD.srv.needsCode'))
    pg.click('#asstFab'); pg.wait_for_timeout(300)
    check('B: cfg auto-opens with code box, key section collapsed', pg.is_visible('#axCode') and pg.is_visible('#axKeySum') and not pg.is_visible('#axKey'))
    pg.screenshot(path=OUT + '/50_code.png')
    pg.fill('#axCode', 'wrong'); pg.click('#axSave'); pg.wait_for_timeout(500)
    check('B: wrong code rejected with message', 'رمز الدخول غير صحيح' in pg.inner_text('#axCfgMsg') and pg.evaluate('AXD.mode') == 'none')
    pg.fill('#axCode', ''); pg.click('#axSave'); pg.wait_for_timeout(300)
    check('B: empty code asks for it', 'أدخل رمز الدخول' in pg.inner_text('#axCfgMsg'))
    pg.fill('#axCode', CODE); pg.click('#axSave'); pg.wait_for_timeout(600)
    check('B: right code connects', pg.evaluate('AXD.mode') == 'server' and not pg.is_visible('#asstCfg') and not pg.is_disabled('#asstIn'))
    check('B: code persisted', pg.evaluate('localStorage.getItem("chem10-smart-planner:ai-code")') == CODE)
    S['reqs'].clear(); pg.fill('#asstIn', 'سؤال'); pg.press('#asstIn', 'Enter'); pg.wait_for_timeout(700)
    check('B: chat sends x-access-code', S['reqs'] and S['reqs'][-1]['h'].get('x-access-code') == CODE and 'رد من خادم الموقع' in pg.inner_text('#asstLog'))
    safe_reload(pg, 1200); pg.wait_for_function('window.__axChecked === true', timeout=15000)
    check('B: reload keeps working (stored code sent to status)', pg.evaluate('AXD.mode') == 'server' and CODE in S['statusReqs'])
    # server rotates the code
    S['chat'] = 'badcode'; pg.click('#asstFab') if not pg.is_visible('#asst') else None; pg.wait_for_timeout(200)
    pg.fill('#asstIn', 'بعد تغيير الرمز'); pg.press('#asstIn', 'Enter'); pg.wait_for_timeout(900)
    check('B: rejected code -> message + back to code prompt', 'رمز الدخول غير صحيح' in pg.inner_text('#asstLog') + pg.inner_text('#asstCfg') and pg.evaluate('AXD.mode') == 'none' and pg.is_visible('#axCode') and pg.evaluate('localStorage.getItem("chem10-smart-planner:ai-code")') is None)
    check('B: no page errors', not errs, errs[:3])
    ctx.close()
    # ---------- C: no server behind the site -> key setup
    S['needs'] = False; S['status404'] = True
    ctx = newctx(b); pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.add_init_script(INIT)
    pg.goto(HURL + '#env11~2-1'); pg.wait_for_function('window.__axChecked === true', timeout=15000); pg.wait_for_timeout(300)
    pg.click('#asstFab'); pg.wait_for_timeout(300)
    check('C: no server -> key form (no summary), no code box', pg.is_visible('#axKey') and not pg.is_visible('#axKeySum') and not pg.is_visible('#axCodeBox') and pg.evaluate('AXD.srv') is None)
    check('C: no page errors', not errs, errs[:3])
    b.close()
finally:
    srv.terminate()
print('FAILS', fails)
