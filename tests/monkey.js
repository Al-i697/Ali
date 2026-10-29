/* لمسات عشوائية على الآيباد والجوال مع إبطاء المعالج: تكشف الأخطاء البرمجية واللمسات المحجوبة والتعليق */
const H = require('./helpers');
(async () => {
  const browser = await H.launch(); const errs = [];
  const rnd = (s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)(+process.argv[2] || 7);
  const runs = [[1024, 768, 'ipad-land'], [768, 1024, 'ipad-port'], [390, 844, 'phone']];
  for (const [w, h, tag] of runs) {
    const { ctx, errs: e2 } = await H.mkctx(browser, { viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }); const p = await H.mkpage(ctx, errs);
    const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.goto(H.URL); await p.waitForTimeout(800); await p.setInputFiles('#bk-file-setup', '/tmp/claude-0/fixture-300.json'); await p.waitForSelector('[data-a="restore-ok"]'); await p.click('[data-a="restore-ok"]'); await p.waitForSelector('#login-form:not(.hidden)'); await H.login(p, 'admin', '1234');
    let blocked = [], slow = 0, maxMs = 0, acts = 0, stuck = 0; const start = errs.length;
    for (let i = 0; i < 420; i++) {
      const info = await p.evaluate(() => {
        const vis = e => { let r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return null; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return null;
          let L = Math.max(0, r.left), T = Math.max(0, r.top), R = Math.min(innerWidth, r.right), B = Math.min(innerHeight, r.bottom);
          for (let a = e.parentElement; a && a !== document.documentElement; a = a.parentElement) { const c = getComputedStyle(a); if (c.display === 'none') return null; if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { const q = a.getBoundingClientRect(); L = Math.max(L, q.left); T = Math.max(T, q.top); R = Math.min(R, q.right); B = Math.min(B, q.bottom); } }
          if (R - L < 6 || B - T < 6) return null; return { left: L, top: T, width: R - L, height: B - T, right: R, bottom: B }; };
        const ids = ['app-modal', 'invoice-preview-modal', 'whatsapp-modal', 'mobile-cart-overlay', 'sidebar-overlay'];
        const overlay = ids.filter(id => { const e = document.getElementById(id); return e && !e.classList.contains('hidden') && vis(e); });
        const sheetOpen = (() => { const c = document.getElementById('cart-panel-container'); return c && innerWidth < 1024 && !c.classList.contains('translate-y-full'); })();
        const sbOpen = (() => { const s = document.getElementById('app-sidebar'); return s && innerWidth < 1024 && !s.classList.contains('translate-x-full'); })();
        let els = [...document.querySelectorAll('[data-a],#pos-products-grid > button,#sidebar-nav button')].filter(e => vis(e));
        const top = overlay.length ? document.getElementById(overlay[overlay.length - 1]) : null;
        const cand = els.map(e => { const r = vis(e), x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y); return { e, x, y, ok: hit && (e === hit || e.contains(hit) || hit.contains(e)) }; });
        const reach = cand.filter(c => c.ok);
        const unreach = cand.filter(c => !c.ok);
        window.__c = reach.map(c => [c.x, c.y, c.e.dataset.a || c.e.id || c.e.tagName]);
        const d = x => x ? ((x.id ? '#' + x.id : '') + '.' + String(x.className).split(' ').slice(0, 4).join('.')) : '-'; return { n: reach.length, overlay, sheetOpen, sbOpen, unreach: unreach.map(c => (c.e.dataset.a || c.e.id) + ' <- ' + d(document.elementFromPoint(c.x, c.y))).slice(0, 4), unreachN: unreach.length, page: document.getElementById('page-title').textContent };
      });
      if (!info.overlay.length && !info.sheetOpen && !info.sbOpen && info.unreachN) blocked.push(info.page + ' | ' + info.unreach.join(' ; '));
      if (!info.n) { stuck++; await p.keyboard.press('Escape'); continue; }
      const pick = await p.evaluate(r => { const c = window.__c; const act = c.filter(x => !/^(logout|bk-save|bk-save-close|pv-print|pv-share|wa-send|eye|rec-new|restore-ok|rec-copy|rec-share)$/.test(x[2])); return act[Math.floor(r * act.length)]; }, rnd());
      if (!pick) continue;
      const t0 = Date.now();
      await p.touchscreen.tap(pick[0], pick[1]);
      await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const ms = Date.now() - t0; maxMs = Math.max(maxMs, ms); if (ms > 700) slow++; acts++;
      /* لو فتحت نافذة فيها حقل نملأه أحياناً */
      if (rnd() < .35) { const f = p.locator('#modal-box input:visible, #modal-box textarea:visible').first(); if (await f.count()) { try { await f.fill(String(Math.floor(rnd() * 90) + 1), { timeout: 800 }); } catch (e) {} } }
      if (rnd() < .08) { await p.keyboard.press('Escape'); }
      if (rnd() < .06) { await p.mouse.wheel(0, 300).catch(() => {}); }
    }
    /* بعد العشوائي: هل ما زال التطبيق يستجيب؟ نفتح الرئيسية بلمسة */
    await p.keyboard.press('Escape'); await p.keyboard.press('Escape');
    const alive = await p.evaluate(() => { for (const id of ['app-modal', 'invoice-preview-modal', 'whatsapp-modal']) document.getElementById(id).classList.add('hidden'); return true; });
    console.log(`[${tag} ${w}x${h}] actions:${acts} stuck-noTargets:${stuck} slow(>700ms @4xCPU):${slow} maxMs:${maxMs} newErrors:${errs.length - start}`);
    console.log('  blocked taps with NO overlay open:', blocked.length, [...new Set(blocked)].slice(0, 14).join('\n     '));
    await ctx.close();
  }
  console.log('ERRORS:', JSON.stringify(errs.slice(0, 8))); await browser.close();
})().catch(e => { console.error('TESTFAIL', e.message.split('\n').slice(0, 6).join(' | ')); process.exit(1); });
