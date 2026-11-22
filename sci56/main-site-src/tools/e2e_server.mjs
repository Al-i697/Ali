// Local stand-in for Cloudflare Pages: serves a folder as ASSETS and runs server/_worker.js in front of it.
// Anthropic is simulated (no network). Usage: node tools/e2e_server.mjs <folder> <port> [ACCESS_CODE]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import worker from '../server/_worker.js';
const [dir, port, code] = [process.argv[2], +process.argv[3], process.argv[4]];
const realFetch = globalThis.fetch; const upstream = [];
globalThis.fetch = async (url, init) => {
  if (String(url).startsWith('https://api.anthropic.com/')) {
    const b = JSON.parse(init.body); upstream.push({ key: init.headers['x-api-key'], b });
    const t = 'رد تجريبي من الخادم الوسيط (' + b.model + ').';
    const sse = ['event: content_block_delta\ndata: ' + JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: t } }), 'event: message_stop\ndata: {"type":"message_stop"}'].join('\n\n') + '\n\n';
    return new Response(sse, { status: 200, headers: { 'content-type': 'text/event-stream' } });
  }
  return realFetch(url, init);
};
const env = { ANTHROPIC_API_KEY: 'sk-ant-SERVER-SECRET', ASSETS: { fetch: async r => { let p = new URL(r.url).pathname; if (p === '/') p = '/index.html'; const f = path.join(dir, p); if (!f.startsWith(dir) || !fs.existsSync(f)) return new Response('not found', { status: 404 }); return new Response(fs.readFileSync(f), { headers: { 'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' } }); } } };
if (code) env.ACCESS_CODE = code;
http.createServer(async (req, res) => {
  if (req.url === '/__upstream') { res.end(JSON.stringify(upstream)); return; }
  const chunks = []; for await (const c of req) chunks.push(c);
  const r = new Request('http://127.0.0.1:' + port + req.url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
  const out = await worker.fetch(r, env);
  res.writeHead(out.status, Object.fromEntries(out.headers)); res.end(Buffer.from(await out.arrayBuffer()));
}).listen(port, '127.0.0.1', () => console.log('ready'));
