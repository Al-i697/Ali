// عرض ReportDoc كمستند HTML للخادم: يحمّل الخطوط من مجلد الأصول ويمرّرها إلى العارض النقي (render.ts).
import fs from 'node:fs';
import path from 'node:path';
import { renderReportHtmlWith } from './render';
import type { Branding, ReportDoc } from './types';

// ───────────── الخطوط (مضمّنة base64، تُحمَّل مرة واحدة) ─────────────
let fontCss: string | null = null;

function loadFontCss(assetsDir: string): string {
  if (fontCss) return fontCss;
  const dir = path.join(assetsDir, 'fonts');
  const ranges = {
    arabic:
      'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC',
    latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  } as const;
  const faces: string[] = [];
  for (const weight of [400, 600, 700]) {
    for (const subset of ['arabic', 'latin'] as const) {
      const file = path.join(dir, `ibm-plex-sans-arabic-${subset}-${weight}-normal.woff2`);
      if (!fs.existsSync(file)) continue;
      const b64 = fs.readFileSync(file).toString('base64');
      faces.push(
        `@font-face{font-family:'Plex';font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2');unicode-range:${ranges[subset]};}`,
      );
    }
  }
  fontCss = faces.join('\n');
  return fontCss;
}

export function renderReportHtml(doc: ReportDoc, brand: Branding, assetsDir: string): string {
  return renderReportHtmlWith(doc, brand, loadFontCss(assetsDir));
}
