// عرض ReportDoc كمستند HTML مكتفٍ بذاته صالح للمعاينة والطباعة وتوليد PDF. دوال نقية بلا Node (لا ملفات ولا مسارات)،
// فيعمل العرض نفسه في الخادم وفي المعاينة التفاعلية داخل المتصفح؛ والخطوط تُمرَّر نصًا جاهزًا (انظر html.ts).
// كل نص يمرّ عبر html`` الذي يهرّب القيم تلقائيًا — فلا يمكن لاسم طالب أو عنوان درس أن يحقن شيفرة في التقرير.
import { APP_NAME } from '../../shared/constants';
import { formatDate, type DigitStyle } from '../../shared/dates';
import { toArabicIndicDigits } from '../../shared/arabic';
import { cellBold, cellTone, cellValue, type Block, type Branding, type Cell, type Column, type ReportDoc, type Tone } from './types';

// ───────────── قالب HTML آمن ─────────────
class Raw {
  constructor(readonly value: string) {}
  toString() {
    return this.value;
  }
}
export const raw = (value: string) => new Raw(value);

export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function part(v: unknown): string {
  if (v instanceof Raw) return v.value;
  if (Array.isArray(v)) return v.map(part).join('');
  if (v === null || v === undefined || v === false) return '';
  return esc(v);
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): Raw {
  let out = strings[0] ?? '';
  values.forEach((v, i) => {
    out += part(v) + (strings[i + 1] ?? '');
  });
  return new Raw(out);
}

// ───────────── الأنماط ─────────────
const TONES: Record<Tone, { bg: string; fg: string }> = {
  good: { bg: '#e2f3ea', fg: '#14633a' },
  info: { bg: '#e3edfa', fg: '#1b4f8a' },
  warn: { bg: '#fdf0d5', fg: '#8a5a00' },
  bad: { bg: '#fbe2de', fg: '#9c2a1d' },
  neutral: { bg: 'transparent', fg: 'inherit' },
  muted: { bg: 'transparent', fg: '#8a918f' },
};

const BAR_COLORS: Record<Tone, string> = {
  good: '#2e8b57',
  info: '#3a73b5',
  warn: '#d9961b',
  bad: '#c2412d',
  neutral: '#7a8a85',
  muted: '#aab3b0',
};

function styles(landscape: boolean): string {
  const toneCss = (Object.keys(TONES) as Tone[])
    .map((t) => `.t-${t}{background:${TONES[t].bg};color:${TONES[t].fg}}`)
    .join('');
  return `
@page{size:A4 ${landscape ? 'landscape' : 'portrait'};margin:14mm 12mm 16mm;
  @bottom-center{content:"${APP_NAME} — صفحة " counter(page) " من " counter(pages);font-family:'Plex',sans-serif;font-size:8.5pt;color:#7a8a85}}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font-family:'Plex','DejaVu Sans',sans-serif;font-size:10.5pt;line-height:1.55;color:#14231f;background:#fff}
.page{max-width:${landscape ? '297mm' : '210mm'};margin:0 auto}
@media screen{body{background:#e8ece9;padding:18px 0}.page{background:#fff;padding:14mm 12mm 16mm;box-shadow:0 2px 14px rgba(20,35,31,.18);border-radius:3px}}
.letterhead{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:2.5px solid #0f5f52;padding-bottom:8px;margin-bottom:12px}
.lh-org{font-size:9.5pt;line-height:1.6;color:#33443f}
.lh-org b{font-weight:700;color:#14231f}
.lh-brand{text-align:left;direction:ltr;font-weight:700;color:#0f5f52;font-size:13pt;letter-spacing:.2px}
.lh-brand small{display:block;direction:rtl;text-align:left;font-weight:400;font-size:8pt;color:#7a8a85}
h1{font-size:17pt;line-height:1.3;margin:4px 0 2px;color:#0b3f36}
.subtitle{color:#4a5b56;margin:0 0 8px}
.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:4px 14px;margin:8px 0 12px;padding:8px 10px;background:#f3f7f5;border:1px solid #dbe6e1;border-radius:6px}
.meta div{font-size:9.5pt}.meta span{color:#6a7b76}.meta b{font-weight:600}
h2{font-size:12.5pt;margin:16px 0 6px;color:#0b3f36;border-inline-start:4px solid #0f5f52;padding-inline-start:8px;break-after:avoid}
h3{font-size:11pt;margin:12px 0 4px;color:#0b3f36;break-after:avoid}
p{margin:6px 0}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin:8px 0 12px;break-inside:avoid}
.stat{border:1px solid #dbe6e1;border-radius:6px;padding:7px 10px;background:#fff}
.stat .l{font-size:8.5pt;color:#6a7b76}.stat .v{font-size:15pt;font-weight:700;line-height:1.25;color:#0b3f36}.stat .h{font-size:8pt;color:#8a918f}
table{border-collapse:collapse;width:100%;margin:4px 0 10px}
th,td{border:1px solid #c9d6d1;padding:4px 7px;vertical-align:middle;text-align:start}
th{background:#e4efeb;font-weight:600;color:#0b3f36;font-size:9.5pt}
th small{display:block;font-weight:400;font-size:7.5pt;color:#5f716b}
thead{display:table-header-group}
tr{break-inside:avoid}
tbody tr:nth-child(even) td{background-color:#f8faf9}
tfoot td{background:#eef4f1;font-weight:600}
.compact th,.compact td{padding:2.5px 5px;font-size:9pt}
.num{font-variant-numeric:tabular-nums}
.c{text-align:center}.e{text-align:end}
.empty{padding:14px;text-align:center;color:#7a8a85;border:1px dashed #c9d6d1;border-radius:6px}
.bars{margin:6px 0 12px;break-inside:avoid}
.bar{display:grid;grid-template-columns:110px 1fr 70px;gap:8px;align-items:center;margin:3px 0;font-size:9.5pt}
.bar .track{height:12px;background:#edf2f0;border-radius:3px;overflow:hidden}
.bar .fill{height:100%;border-radius:3px}
.bar .val{color:#33443f;font-variant-numeric:tabular-nums}
ul{margin:4px 0 8px;padding-inline-start:20px}
.field{margin:6px 0 10px;break-inside:avoid}.fl{font-weight:600;color:#0b3f36;font-size:10pt}.ft{white-space:pre-wrap;padding:4px 0 0}
.kv{display:grid;gap:3px 16px;margin:6px 0 10px}
.kv div{font-size:10pt}.kv span{color:#6a7b76}
.pb{break-after:page}
.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:26px;break-inside:avoid;font-size:10pt}
.sign div{border-top:1px solid #8a918f;padding-top:5px;text-align:center;min-height:42px}
.sign small{display:block;color:#6a7b76}
.foot{margin-top:14px;font-size:8pt;color:#8a918f}
${toneCss}
td.t-neutral,td.t-muted{background:transparent}
`;
}

// ───────────── العرض ─────────────
function num(v: number, digits: DigitStyle, fraction = 2): string {
  const f = 10 ** fraction;
  const s = Number.isInteger(v) ? String(v) : String(Math.round(v * f) / f);
  return digits === 'arab' ? toArabicIndicDigits(s) : s;
}

function renderCell(c: Cell, col: Column, digits: DigitStyle): Raw {
  const v = cellValue(c);
  const tone = cellTone(c);
  let text: string;
  if (v === null || v === undefined || v === '') text = '—';
  // النسب بخانة عشرية واحدة في كل مكان (تطابق بطاقات الملخص)، والدرجات حتى خانتين
  else if (typeof v === 'number') text = col.kind === 'percent' ? `${num(v, digits, 1)}%` : num(v, digits);
  // النصوص (أسماء، عناوين) تُعرض كما كُتبت؛ الأرقام وحدها تتبع تفضيل المعلم
  else text = v;
  const cls = [col.align === 'center' ? 'c' : col.align === 'end' ? 'e' : '', col.kind && col.kind !== 'text' ? 'num' : '', tone ? `t-${tone}` : ''].filter(Boolean).join(' ');
  const style = cellBold(c) ? ' style="font-weight:700"' : '';
  return html`<td class="${cls}"${raw(style)}>${text}</td>`;
}

function renderBlock(b: Block, digits: DigitStyle): Raw {
  switch (b.type) {
    case 'heading':
      return html`<h2>${b.text}</h2>`;
    case 'paragraph':
      return html`<p class="${b.tone ? `t-${b.tone}` : ''}">${b.text}</p>`;
    case 'field':
      return html`<div class="field"><div class="fl">${b.label}</div><div class="ft">${b.text}</div></div>`;
    case 'kv':
      return html`<div class="kv" style="grid-template-columns:repeat(${b.columns ?? 2},1fr)">${b.items.map((i) => html`<div><span>${i.label}:</span> <b>${i.value}</b></div>`)}</div>`;
    case 'stats':
      return html`<div class="stats">${b.items.map((i) => html`<div class="stat ${i.tone ? `t-${i.tone}` : ''}"><div class="l">${i.label}</div><div class="v num">${i.value}</div>${i.hint ? html`<div class="h">${i.hint}</div>` : ''}</div>`)}</div>`;
    case 'table': {
      const totalWidth = b.columns.reduce((s, c) => s + (c.width ?? 1), 0);
      return html`${b.title ? html`<h3>${b.title}</h3>` : ''}${
        b.rows.length === 0
          ? html`<div class="empty">${b.empty ?? 'لا توجد بيانات'}</div>`
          : html`<table class="${b.compact ? 'compact' : ''}">
<colgroup>${b.columns.map((c) => html`<col style="width:${(((c.width ?? 1) / totalWidth) * 100).toFixed(2)}%">`)}</colgroup>
<thead><tr>${b.columns.map((c) => html`<th class="${c.align === 'center' ? 'c' : c.align === 'end' ? 'e' : ''}">${c.title}${c.sub ? html`<small>${c.sub}</small>` : ''}</th>`)}</tr></thead>
<tbody>${b.rows.map((r) => html`<tr>${r.map((c, i) => renderCell(c, b.columns[i]!, digits))}</tr>`)}</tbody>
${b.footer?.length ? html`<tfoot>${b.footer.map((r) => html`<tr>${r.map((c, i) => renderCell(c, b.columns[i]!, digits))}</tr>`)}</tfoot>` : ''}
</table>`
      }`;
    }
    case 'bars': {
      const max = Math.max(1, ...b.items.map((i) => i.value));
      return html`${b.title ? html`<h3>${b.title}</h3>` : ''}<div class="bars">${b.items.map(
        (i) => html`<div class="bar"><span>${i.label}</span><div class="track"><div class="fill" style="width:${((i.value / max) * 100).toFixed(1)}%;background:${BAR_COLORS[i.tone ?? 'neutral']}"></div></div><span class="val">${i.display}</span></div>`,
      )}</div>`;
    }
    case 'list':
      return html`${b.title ? html`<h3>${b.title}</h3>` : ''}<ul>${b.items.map((i) => html`<li>${i}</li>`)}</ul>`;
    case 'pagebreak':
      return html`<div class="pb"></div>`;
    case 'sheet':
      return html``;
  }
}

/** fontCss: قواعد @font-face جاهزة (مضمّنة base64)؛ فارغة فيرجع المتصفح إلى الخطوط المتاحة */
export function renderReportHtmlWith(doc: ReportDoc, brand: Branding, fontCss: string): string {
  const d = brand.digits;
  const org: string[] = ['سلطنة عُمان', 'وزارة التربية والتعليم'];
  if (brand.directorate) org.push(brand.directorate);
  if (brand.schoolName) org.push(brand.schoolName);

  const page = html`
<div class="page">
  <div class="letterhead">
    <div class="lh-org">${org.map((l, i) => (i < 2 ? html`<div><b>${l}</b></div>` : html`<div>${l}</div>`))}</div>
    <div class="lh-brand">${APP_NAME}<small>السجل الإلكتروني للمعلم</small></div>
  </div>
  <h1>${doc.title}</h1>
  ${doc.subtitle ? html`<p class="subtitle">${doc.subtitle}</p>` : ''}
  ${doc.meta.length ? html`<div class="meta">${doc.meta.map((m) => html`<div><span>${m.label}:</span> <b>${m.value}</b></div>`)}</div>` : ''}
  ${doc.blocks.map((b) => renderBlock(b, d))}
  ${
    doc.signatures
      ? html`<div class="sign">
    <div>المعلم<small>${brand.teacherName}</small></div>
    <div>المعلم الأول<small>${brand.seniorTeacherName ?? ''}</small></div>
    <div>مدير المدرسة<small>${brand.principalName ?? ''}</small></div>
  </div>`
      : ''
  }
  <div class="foot">أُعدّ بواسطة ${APP_NAME} — ${formatDate(doc.generatedAt.slice(0, 10), d, 'long')}</div>
</div>`;

  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(doc.title)}</title>
<style>${fontCss}${styles(Boolean(doc.landscape))}</style></head>
<body>${page.value}</body></html>`;
}
