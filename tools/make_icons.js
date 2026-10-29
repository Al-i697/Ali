/* يولّد أيقونات الشاشة الرئيسية من SVG (يحتاج Playwright) */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const out = path.join(__dirname, '..', 'src', 'icons'); fs.mkdirSync(out, { recursive: true });
const svg = (round) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
 <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d8a96"/><stop offset="1" stop-color="#125a63"/></linearGradient></defs>
 <rect width="512" height="512" ${round ? 'rx="112"' : ''} fill="url(#g)"/>
 <g transform="rotate(-38 256 256)" fill="none" stroke-linecap="round">
  <line x1="92" y1="256" x2="420" y2="256" stroke="#e8f3f4" stroke-width="14"/>
  <rect x="150" y="214" width="62" height="84" rx="22" fill="#ffffff"/>
  <rect x="226" y="208" width="62" height="96" rx="22" fill="#f6c453"/>
  <rect x="302" y="214" width="62" height="84" rx="22" fill="#ffffff"/>
  <circle cx="92" cy="256" r="12" fill="#e8f3f4"/>
 </g>
</svg>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  for (const [name, size, round] of [['icon-512.png', 512, true], ['icon-192.png', 192, true], ['apple-touch-icon.png', 180, false], ['maskable-512.png', 512, false]]) {
    await p.setViewportSize({ width: size, height: size });
    const inner = name.startsWith('maskable') ? `<div style="position:fixed;inset:0;background:#17707A"></div><div style="position:fixed;inset:${size * 0.1}px">${svg(false).replace('width="512" height="512"', `width="${size * 0.8}" height="${size * 0.8}"`)}</div>` : svg(round).replace('width="512" height="512"', `width="${size}" height="${size}"`);
    await p.setContent(`<body style="margin:0;background:transparent">${inner}</body>`);
    await p.screenshot({ path: path.join(out, name), omitBackground: true });
  }
  await b.close(); console.log('icons ok');
})();
