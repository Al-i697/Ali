/* خادم تجريبي يحاكي دوال Supabase للربط (cafe_push / cafe_pull / cafe_count / cafe_head) على نفس عنوان REST.
   الافتراضي في الذاكرة (نفس سلوك src/sync.sql). ومع PG_URL يشتغل على Postgres حقيقي بعد تطبيق src/sync.sql، لاختبار الـSQL نفسه. */
const http = require('http'), fs = require('fs'), path = require('path');
exports.KEY = 'test-anon-key';

function memBackend() {
  const rows = new Map(); let seq = 0, skew = 0;
  const chk = s => { if (!s || s.length < 32) throw new Error('bad shop'); };
  const of = s => [...rows.values()].filter(r => r.shop === s);
  return {
    async push(shop, list) {
      chk(shop); const last = new Map(); list.forEach(r => last.set(r.k, r)); let n = 0;
      for (const r of last.values()) { if (String(r.d).length > 1500000) continue; rows.set(shop + '|' + r.k, { shop, k: r.k, dev: r.dev, d: r.d, seq: ++seq, at: Date.now() }); n++; }
      return n;
    },
    async pull(shop, after = 0, lim = 500) { chk(shop); return of(shop).filter(r => r.seq > after).sort((a, b) => a.seq - b.seq).slice(0, Math.min(Math.max(lim, 1), 1000)).map(r => ({ seq: r.seq, k: r.k, dev: r.dev, d: r.d, age: Math.floor((Date.now() - r.at) / 1000) + skew })); },
    async count(shop) { chk(shop); return of(shop).length; },
    async head(shop) { chk(shop); return Math.max(0, ...of(shop).map(r => r.seq)); },
    async reset() { rows.clear(); },
    async all() { return [...rows.values()]; },
    setSkew(s) { skew = s; }
  };
}

function pgBackend(url) {
  const { Pool } = require('pg'); const pool = new Pool({ connectionString: url }); let skew = 0;
  const q = async (sql, args) => { const c = await pool.connect(); try { await c.query('begin'); await c.query('set local role anon'); const r = await c.query(sql, args); await c.query('commit'); return r; } catch (e) { await c.query('rollback').catch(() => {}); throw e; } finally { c.release(); } };
  const num = v => v == null ? v : Number(v);
  return {
    async init() { await pool.query(fs.readFileSync(path.join(__dirname, '..', 'src', 'sync.sql'), 'utf8')); await pool.query('truncate public.cafe_rec'); },
    async push(shop, list) { return (await q('select public.cafe_push(p_shop := $1, p_rows := $2::jsonb) as v', [shop, JSON.stringify(list)])).rows[0].v; },
    async pull(shop, after = 0, lim = 500) { return (await q('select * from public.cafe_pull(p_shop := $1, p_after := $2::bigint, p_lim := $3::int)', [shop, after, lim])).rows.map(r => ({ ...r, seq: num(r.seq), age: r.age + skew })); },
    async count(shop) { return num((await q('select public.cafe_count(p_shop := $1) as v', [shop])).rows[0].v); },
    async head(shop) { return num((await q('select public.cafe_head(p_shop := $1) as v', [shop])).rows[0].v); },
    async reset() { await pool.query('truncate public.cafe_rec'); },
    async all() { return (await pool.query('select * from public.cafe_rec')).rows; },
    setSkew(s) { skew = s; },
    async close() { await pool.end(); }
  };
}

exports.start = async (port = 8130) => {
  const be = process.env.PG_URL ? pgBackend(process.env.PG_URL) : memBackend(); if (be.init) await be.init();
  const st = { fail: false, delay: 0, calls: 0, log: [] };
  const srv = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', 'apikey, authorization, content-type, x-client-info'); res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    let body = ''; req.on('data', c => body += c);
    req.on('end', async () => {
      st.calls++; if (st.fail === true) return req.socket.destroy();
      if (st.delay) await new Promise(r => setTimeout(r, st.delay));
      const send = (code, o) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(o === undefined ? '' : JSON.stringify(o)); };
      if (st.fail) return send(+st.fail, { message: 'simulated ' + st.fail });
      if (req.headers.apikey !== exports.KEY) return send(401, { message: 'Invalid API key' });
      const m = /^\/rest\/v1\/rpc\/(cafe_[a-z]+)$/.exec(req.url);
      if (!m) return send(404, { code: 'PGRST202', message: 'Could not find the function ' + req.url });
      let a = {}; try { a = JSON.parse(body || '{}'); } catch (e) { return send(400, { message: 'bad json' }); }
      st.log.push(m[1]);
      try {
        const fn = { cafe_push: () => be.push(a.p_shop, a.p_rows), cafe_pull: () => be.pull(a.p_shop, a.p_after, a.p_lim), cafe_count: () => be.count(a.p_shop), cafe_head: () => be.head(a.p_shop) }[m[1]];
        if (!fn) return send(404, { code: 'PGRST202', message: 'Could not find the function public.' + m[1] });
        send(200, await fn());
      } catch (e) { send(400, { code: 'P0001', message: e.message }); }
    });
  });
  await new Promise(r => srv.listen(port, '127.0.0.1', r));
  return { url: 'http://127.0.0.1:' + port, KEY: exports.KEY, be, st, close: async () => { await new Promise(r => srv.close(r)); srv.closeAllConnections && srv.closeAllConnections(); if (be.close) await be.close(); } };
};
