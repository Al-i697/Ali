// Node test for server/_worker.js (mock upstream fetch, mock ASSETS / KV)
import worker from '../server/_worker.js';
let fails = [];
const check = (n, c, x = '') => { console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : x); if (!c) fails.push(n); };
const calls = [];
globalThis.fetch = async (url, init) => {
  calls.push({ url, init, body: init && init.body ? JSON.parse(init.body) : null });
  const mode = globalThis.__up || 'ok';
  if (mode === '401') return new Response('{"type":"error","error":{"type":"authentication_error","message":"bad"}}', { status: 401, headers: { 'content-type': 'application/json' } });
  if (mode === 'credit') return new Response('{"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is too low"}}', { status: 400, headers: { 'content-type': 'application/json' } });
  if (mode === 'down') throw new Error('net');
  const s = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"مرحبا"}}\n\n')); c.close(); } });
  return new Response(s, { status: 200, headers: { 'content-type': 'text/event-stream' } });
};
const kv = new Map();
const env = { ANTHROPIC_API_KEY: 'sk-ant-SECRET', ASSETS: { fetch: async (r) => new Response('ASSET:' + new URL(r.url).pathname) } };
const req = (path, o = {}) => new Request('https://site.pages.dev' + path, o);
const post = (body, headers = {}) => req('/api/ai', { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, headers), body: typeof body === 'string' ? body : JSON.stringify(body) });
const ok = { model: 'claude-sonnet-5-5', max_tokens: 5000, stream: true, messages: [{ role: 'user', content: 'سؤال' }] };

let r = await worker.fetch(req('/'), env); check('static: / goes to ASSETS', (await r.text()) === 'ASSET:/');
r = await worker.fetch(req('/index.html'), env); check('static: index.html', (await r.text()) === 'ASSET:/index.html');
r = await worker.fetch(req('/api/ai/status'), env); let j = await r.json();
check('status: ok, no code needed', j.ok === true && j.needsCode === false && j.authorized === true, JSON.stringify(j));
r = await worker.fetch(req('/api/ai/status'), {}); j = await r.json(); check('status: not ok without server key', j.ok === false);
r = await worker.fetch(post(ok), env); const txt = await r.text();
check('chat: 200 + stream passthrough', r.status === 200 && txt.includes('مرحبا') && r.headers.get('content-type').includes('event-stream'));
let c = calls.at(-1);
check('chat: upstream url + secret key + version', c.url === 'https://api.anthropic.com/v1/messages' && c.init.headers['x-api-key'] === 'sk-ant-SECRET' && c.init.headers['anthropic-version'] === '2023-06-01');
check('chat: key never in response', !txt.includes('SECRET') && ![...r.headers.values()].some(v => v.includes('SECRET')));
check('chat: body forwarded clean', c.body.model === 'claude-sonnet-5-5' && c.body.max_tokens === 5000 && c.body.stream === true && c.body.messages.length === 1 && Object.keys(c.body).sort().join() === 'max_tokens,messages,model,stream');
// sanitising
await worker.fetch(post({ model: 'claude-evil-9', max_tokens: 900000, system: 'x', tools: [{}], messages: [{ role: 'user', content: 'a', extra: 1 }] }), env); c = calls.at(-1);
check('sanitise: model->default, max_tokens capped, extras dropped', c.body.model === 'claude-sonnet-5-5' && c.body.max_tokens === 16000 && !c.body.system && !c.body.tools && !('extra' in c.body.messages[0]), JSON.stringify(c.body));
await worker.fetch(post({ messages: ok.messages }), env); c = calls.at(-1); check('default model when none given', c.body.model === 'claude-sonnet-5-5' && c.body.max_tokens === 16000);
await worker.fetch(post(ok), Object.assign({}, env, { MODEL: 'claude-haiku-5-5', MAX_TOKENS: '3000' })); c = calls.at(-1);
check('env MODEL / MAX_TOKENS honoured', c.body.max_tokens === 3000 && c.body.model === 'claude-sonnet-5-5'); // body.model allowed -> kept
await worker.fetch(post({ messages: ok.messages }), Object.assign({}, env, { MODEL: 'claude-haiku-5-5' })); c = calls.at(-1); check('env MODEL default', c.body.model === 'claude-haiku-5-5');
// validation
for (const [n, b] of [['bad json', '{x'], ['no messages', { model: 'x' }], ['assistant last', { messages: [{ role: 'assistant', content: 'a' }] }], ['bad role', { messages: [{ role: 'system', content: 'a' }] }], ['non-string content', { messages: [{ role: 'user', content: [{ type: 'text', text: 'a' }] }] }]]) {
  const n0 = calls.length; r = await worker.fetch(post(b), env); check('validate: ' + n + ' -> 400, no upstream call', r.status === 400 && calls.length === n0, r.status);
}
const n1 = calls.length; r = await worker.fetch(post({ messages: [{ role: 'user', content: 'x'.repeat(800000) }] }), env); check('oversize -> 413', r.status === 413 && calls.length === n1);
r = await worker.fetch(req('/api/ai'), env); check('GET /api/ai -> 405', r.status === 405);
// access code
const e2 = Object.assign({}, env, { ACCESS_CODE: 'abc-123' });
r = await worker.fetch(req('/api/ai/status'), e2); j = await r.json(); check('code: status needsCode, unauthorized', j.needsCode === true && j.authorized === false);
r = await worker.fetch(req('/api/ai/status', { headers: { 'x-access-code': 'abc-123' } }), e2); j = await r.json(); check('code: authorized with right code', j.authorized === true);
const n2 = calls.length; r = await worker.fetch(post(ok), e2); j = await r.json(); check('code: chat without code -> 401 access_code_invalid, no upstream', r.status === 401 && j.error.type === 'access_code_invalid' && calls.length === n2);
r = await worker.fetch(post(ok, { 'x-access-code': 'wrong' }), e2); check('code: wrong code -> 401', r.status === 401);
r = await worker.fetch(post(ok, { 'x-access-code': 'abc-123' }), e2); check('code: right code -> 200', r.status === 200); await r.text();
// upstream errors
globalThis.__up = '401'; r = await worker.fetch(post(ok), env); j = await r.json(); check('upstream 401 -> server_key_error (not leaking as user key error)', r.status === 502 && j.error.type === 'server_key_error');
globalThis.__up = 'credit'; r = await worker.fetch(post(ok), env); j = await r.json(); check('upstream credit error passed through', r.status === 400 && /credit/.test(j.error.message));
globalThis.__up = 'down'; r = await worker.fetch(post(ok), env); check('upstream unreachable -> 502', r.status === 502); globalThis.__up = 'ok';
r = await worker.fetch(post(ok), { ASSETS: env.ASSETS }); j = await r.json(); check('no server key -> 500 server_key_error', r.status === 500 && j.error.type === 'server_key_error');
// daily limit
const e3 = Object.assign({}, env, { DAILY_LIMIT: '2', USAGE: { get: async k => kv.get(k) || null, put: async (k, v) => { kv.set(k, v); } } });
const s = []; for (let i = 0; i < 3; i++) { r = await worker.fetch(post(ok), e3); s.push(r.status); await r.text(); }
check('daily limit: 200,200,429', s.join() === '200,200,429', s.join());
// CORS
r = await worker.fetch(req('/api/ai', { method: 'OPTIONS' }), env); check('no CORS by default', r.status === 204 && !r.headers.get('access-control-allow-origin'));
r = await worker.fetch(req('/api/ai', { method: 'OPTIONS' }), Object.assign({}, env, { ALLOW_ORIGIN: 'https://a.example' })); check('CORS when ALLOW_ORIGIN', r.headers.get('access-control-allow-origin') === 'https://a.example');
console.log('FAILS', fails);
process.exit(fails.length ? 1 : 0);
