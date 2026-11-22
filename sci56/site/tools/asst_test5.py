"""Assistant: direct Anthropic API mode (no window.claude): key setup, headers, streaming, errors, persistence, delete."""
import json
from playwright.sync_api import sync_playwright
exec(open('/home/user/Ali/sci56/site/tools/asst_test.py').read().split("fails = []")[0])
fails = []
def check(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name, extra if not cond else '')
    if not cond: fails.append(name)
def sse(text, stop='end_turn'):
    ev = ['event: message_start\ndata: ' + json.dumps({'type':'message_start','message':{'id':'m','role':'assistant','content':[]}}),
          'event: content_block_start\ndata: ' + json.dumps({'type':'content_block_start','index':0,'content_block':{'type':'text','text':''}}),
          'event: ping\ndata: {"type":"ping"}']
    for i in range(0, len(text), 37):
        ev.append('event: content_block_delta\ndata: ' + json.dumps({'type':'content_block_delta','index':0,'delta':{'type':'text_delta','text':text[i:i+37]}}, ensure_ascii=False))
    ev.append('event: message_delta\ndata: ' + json.dumps({'type':'message_delta','delta':{'stop_reason':stop}}))
    ev.append('event: message_stop\ndata: {"type":"message_stop"}')
    return '\r\n\r\n'.join(ev) + '\r\n\r\n'
PROP = '''سأضيف واجباً جديداً.
@@PROPOSAL {"title":"واجب جديد"}
@@OP {"op":"set","field":"homework","value":"حل سؤال 3\\nكتابة تقرير قصير"}
@@END'''
state = {'mode': 'ok', 'reqs': []}
def handler(route, request):
    body = json.loads(request.post_data)
    state['reqs'].append({'url': request.url, 'headers': request.headers, 'body': body})
    m = state['mode']
    cors = {'access-control-allow-origin': '*', 'access-control-allow-headers': '*'}
    if request.method == 'OPTIONS':
        route.fulfill(status=204, headers=cors); return
    if m == '401': route.fulfill(status=401, headers=cors, content_type='application/json', body=json.dumps({'type':'error','error':{'type':'authentication_error','message':'invalid x-api-key'}})); return
    if m == 'credit': route.fulfill(status=400, headers=cors, content_type='application/json', body=json.dumps({'type':'error','error':{'type':'invalid_request_error','message':'Your credit balance is too low to access the Anthropic API.'}})); return
    if m == '529': route.fulfill(status=529, headers=cors, content_type='application/json', body=json.dumps({'type':'error','error':{'type':'overloaded_error','message':'Overloaded'}})); return
    if m == 'streamerr':
        route.fulfill(status=200, headers=cors, content_type='text/event-stream', body='event: content_block_delta\ndata: ' + json.dumps({'type':'content_block_delta','delta':{'type':'text_delta','text':'بداية رد'}}, ensure_ascii=False) + '\n\nevent: error\ndata: {"type":"error","error":{"type":"overloaded_error","message":"Overloaded"}}\n\n'); return
    if body['max_tokens'] <= 16: route.fulfill(status=200, headers=cors, content_type='text/event-stream', body=sse('تم')); return
    if m == 'prop': route.fulfill(status=200, headers=cors, content_type='text/event-stream', body=sse(PROP)); return
    route.fulfill(status=200, headers=cors, content_type='text/event-stream', body=sse('رد عادي من النموذج المباشر.'))
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    ctx = b.new_context(viewport={'width': 1400, 'height': 900})
    ctx.route('https://api.anthropic.com/**', handler); ctx.route('https://proxy.example.org/**', handler)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script(INIT)
    pg.goto(URL + '#sci6~1-3'); pg.wait_for_timeout(1000)
    pg.click('#asstFab'); pg.wait_for_timeout(300)
    check('cfg: shown automatically', pg.is_visible('#asstCfg') and pg.is_visible('#axKey'))
    check('cfg: gear visible, input disabled', pg.is_visible('#asstCfgBtn') and pg.is_disabled('#asstIn'))
    pg.screenshot(path=OUT + '/40_cfg.png')
    # empty / bad inputs
    pg.click('#axSave'); check('cfg: empty key rejected', 'أدخل المفتاح' in pg.inner_text('#axCfgMsg'))
    pg.click('#axCfgDet summary'); pg.fill('#axKey', 'sk-ant-test-123'); pg.fill('#axBase', 'http://evil.example.com'); pg.click('#axSave')
    check('cfg: insecure base rejected', 'https' in pg.inner_text('#axCfgMsg') and not state['reqs'])
    pg.fill('#axBase', '')
    # 401
    state['mode'] = '401'; pg.click('#axSave'); pg.wait_for_timeout(500)
    check('cfg: 401 -> invalid_key message', 'invalid_key' in pg.inner_text('#axCfgMsg') and pg.is_visible('#asstCfg'), pg.inner_text('#axCfgMsg'))
    check('cfg: nothing saved on failure', pg.evaluate('localStorage.getItem("sci56-smart-planner:ai-conn")') is None and pg.evaluate('sampleFn') is None)
    state['mode'] = 'credit'; pg.click('#axSave'); pg.wait_for_timeout(500)
    check('cfg: credit -> no_credit message', 'no_credit' in pg.inner_text('#axCfgMsg'))
    # success
    state['mode'] = 'ok'; state['reqs'].clear()
    pg.select_option('#axModel', 'claude-haiku-5-5'); pg.click('#axSave'); pg.wait_for_timeout(700)
    r = state['reqs'][-1] if state['reqs'] else None
    check('direct: request sent to api.anthropic.com/v1/messages', r and r['url'] == 'https://api.anthropic.com/v1/messages', r and r['url'])
    h = (r or {}).get('headers', {})
    check('direct: headers (key, version, browser access)', h.get('x-api-key') == 'sk-ant-test-123' and h.get('anthropic-version') == '2023-06-01' and h.get('anthropic-dangerous-direct-browser-access') == 'true', h)
    check('direct: body model/stream', r and r['body']['model'] == 'claude-haiku-5-5' and r['body']['stream'] is True and r['body']['messages'][0]['role'] == 'user')
    check('cfg: closed after success', not pg.is_visible('#asstCfg'))
    check('cfg: input enabled + sampleFn set', not pg.is_disabled('#asstIn') and pg.evaluate('sampleFn === axdSample'))
    check('cfg: banner cleared', not pg.is_visible('#asstSt'))
    check('cfg: key persisted', json.loads(pg.evaluate('localStorage.getItem("sci56-smart-planner:ai-conn")'))['key'] == 'sk-ant-test-123')
    check('cfg: key NOT in planner state', 'sk-ant' not in (pg.evaluate('localStorage.getItem("sci56-smart-planner:v2")') or ''))
    check('cfg: aiBtn shown in form', pg.is_visible('#aiBtn') or pg.is_visible('#aiBtnTop'))
    # chat
    state['reqs'].clear()
    pg.fill('#asstIn', 'اشرح لي الاستراتيجية'); pg.press('#asstIn', 'Enter'); pg.wait_for_selector('.am.a .bd', timeout=5000); pg.wait_for_timeout(600)
    check('chat: streamed reply shown', 'رد عادي من النموذج المباشر' in pg.inner_text('#asstLog'), pg.inner_text('#asstLog')[-200:])
    bd = state['reqs'][-1]['body']
    check('chat: turns sent (instructions + user)', bd['messages'][-1]['role'] == 'user' and 'اشرح لي الاستراتيجية' in bd['messages'][-1]['content'] and bd['max_tokens'] >= 8000)
    state['mode'] = 'prop'
    pg.fill('#asstIn', 'أضف واجباً'); pg.press('#asstIn', 'Enter'); pg.wait_for_selector('.prop .btn-gold', timeout=8000)
    pg.click('.prop .btn-gold'); pg.wait_for_timeout(500)
    check('chat: proposal applied', 'كتابة تقرير قصير' in pg.evaluate('document.body.innerText'))
    pg.screenshot(path=OUT + '/41_direct_chat.png')
    # errors in chat
    state['mode'] = '529'
    pg.fill('#asstIn', 'سؤال'); pg.press('#asstIn', 'Enter'); pg.wait_for_timeout(900)
    check('chat: overloaded message with code', 'overloaded' in pg.inner_text('#asstLog'))
    state['mode'] = 'streamerr'
    pg.fill('#asstIn', 'سؤال آخر'); pg.press('#asstIn', 'Enter'); pg.wait_for_timeout(900)
    lg = pg.inner_text('#asstLog')
    check('chat: partial kept + stream error shown', 'بداية رد' in lg and 'overloaded' in lg, lg[-250:])
    # reload: persisted
    state['mode'] = 'ok'
    safe_reload(pg, 1200); pg.wait_for_function('window.__axChecked === true', timeout=15000)
    check('reload: connected from stored key', pg.evaluate('sampleFn === axdSample'))
    pg.click('#asstFab'); pg.wait_for_timeout(300)
    check('reload: no cfg popup, input enabled', not pg.is_visible('#asstCfg') and not pg.is_disabled('#asstIn'))
    # settings -> delete
    pg.click('#asstCfgBtn'); pg.wait_for_timeout(200)
    check('settings: reopens with key + delete button', pg.input_value('#axKey') == 'sk-ant-test-123' and pg.is_visible('#axDel') and pg.input_value('#axModel') == 'claude-haiku-5-5')
    pg.click('#axDel'); pg.wait_for_timeout(400)
    check('delete: key removed + disabled again', pg.evaluate('localStorage.getItem("sci56-smart-planner:ai-conn")') is None and pg.is_disabled('#asstIn') and pg.evaluate('sampleFn') is None)
    # custom base + do not remember
    pg.click('#asstCfgBtn'); pg.evaluate('document.querySelector("#axCfgDet").open = true'); pg.fill('#axKey', 'sk-ant-other'); pg.fill('#axBase', 'https://proxy.example.org/'); pg.uncheck('#axRem'); state['reqs'].clear()
    _dbg = pg.evaluate('JSON.stringify([document.querySelector("#axBase").value, document.querySelector("#axKey").value, AXD.cfg.base, !document.querySelector("#asstCfg").hidden, state.key])')
    pg.click('#axSave'); pg.wait_for_function('document.querySelector("#asstCfg").hidden', timeout=8000)
    _dbg2 = pg.evaluate('JSON.stringify([AXD.cfg, AXD.mode])')
    check('custom base used', any(r['url'] == 'https://proxy.example.org/v1/messages' for r in state['reqs']), str([r['url'] for r in state['reqs']]) + _dbg + _dbg2)
    check('no-remember: not stored but connected', pg.evaluate('localStorage.getItem("sci56-smart-planner:ai-conn")') is None and pg.evaluate('sampleFn === axdSample'))
    check('no page errors', not errs, errs[:3])
    pg.close()
    # ---- viewer mode must NOT show the gear and must not touch the network
    state['reqs'].clear()
    pv = ctx.new_page(); pv.on('pageerror', lambda e: errs.append(str(e)))
    pv.add_init_script(INIT); pv.add_init_script(MOCK)
    pv.goto(URL + '#sci6~1-3'); pv.wait_for_timeout(1000); pv.click('#asstFab'); pv.wait_for_timeout(300)
    check('viewer: gear hidden, cfg hidden', not pv.is_visible('#asstCfgBtn') and not pv.is_visible('#asstCfg'))
    pv.evaluate('window.__chatReply = () => "من sample"'); pv.fill('#asstIn', 'مرحبا'); pv.press('#asstIn', 'Enter'); pv.wait_for_timeout(700)
    check('viewer: uses sample, no direct requests', 'من sample' in pv.inner_text('#asstLog') and not state['reqs'])
    check('viewer: no page errors', not errs, errs[:3])
    b.close()
print('FAILS', fails)
