// تصدير ReportDoc إلى Excel (.xlsx): الأرقام تُكتب أرقامًا حقيقية (قابلة للفرز والجمع)، والورقة من اليمين لليسار.
import ExcelJS from 'exceljs';
import { cellBold, cellTone, cellValue, type Block, type Cell, type Column, type ReportDoc, type Tone } from './types';

const FILL: Record<Tone, string | null> = {
  good: 'FFE2F3EA',
  info: 'FFE3EDFA',
  warn: 'FFFDF0D5',
  bad: 'FFFBE2DE',
  neutral: null,
  muted: null,
};
const FONT_COLOR: Record<Tone, string | null> = {
  good: 'FF14633A',
  info: 'FF1B4F8A',
  warn: 'FF8A5A00',
  bad: 'FF9C2A1D',
  neutral: null,
  muted: 'FF8A918F',
};

const HEADER_FILL = 'FFE4EFEB';
const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFC9D6D1' } },
  bottom: { style: 'thin', color: { argb: 'FFC9D6D1' } },
  left: { style: 'thin', color: { argb: 'FFC9D6D1' } },
  right: { style: 'thin', color: { argb: 'FFC9D6D1' } },
};

/** أسماء الأوراق في Excel: ≤31 حرفًا وبلا الرموز المحظورة، وفريدة */
function sheetName(raw: string, used: Set<string>): string {
  let base = raw.replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 31) || 'ورقة';
  let name = base;
  let i = 2;
  while (used.has(name.toLowerCase())) name = `${base.slice(0, 28)} ${i++}`;
  used.add(name.toLowerCase());
  return name;
}

function styleCell(cell: ExcelJS.Cell, c: Cell, col?: Column) {
  const tone = cellTone(c);
  if (tone) {
    const fill = FILL[tone];
    if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    const color = FONT_COLOR[tone];
    if (color) cell.font = { ...(cell.font ?? {}), color: { argb: color } };
  }
  if (cellBold(c)) cell.font = { ...(cell.font ?? {}), bold: true };
  cell.border = BORDER;
  cell.alignment = { vertical: 'middle', horizontal: col?.align === 'center' ? 'center' : col?.align === 'end' ? 'right' : 'right', wrapText: true, readingOrder: 'rtl' };
  void col;
}

export async function reportToXlsx(doc: ReportDoc): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'سجلي';
  wb.created = new Date(doc.generatedAt);
  wb.title = doc.title;

  const used = new Set<string>();
  let ws!: ExcelJS.Worksheet;
  let row = 1;
  let colWidths: number[] = [];
  let freezeAt: number | null = null;

  const startSheet = (name: string) => {
    ws = wb.addWorksheet(sheetName(name, used), {
      views: [{ rightToLeft: true }],
      pageSetup: { paperSize: 9, orientation: doc.landscape ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });
    row = 1;
    colWidths = [];
    freezeAt = null;
  };

  const widen = (index: number, text: string) => {
    const w = Math.min(48, Math.max(8, [...text].length + 3));
    colWidths[index] = Math.max(colWidths[index] ?? 8, w);
  };

  const finishSheet = () => {
    if (!ws) return;
    colWidths.forEach((w, i) => {
      if (w) ws.getColumn(i + 1).width = w;
    });
    if (freezeAt) ws.views = [{ rightToLeft: true, state: 'frozen', ySplit: freezeAt }];
  };

  startSheet(doc.title);

  // ───────── الترويسة ─────────
  const titleCell = ws.getCell(row, 1);
  titleCell.value = doc.title;
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF0B3F36' } };
  row++;
  if (doc.subtitle) {
    ws.getCell(row, 1).value = doc.subtitle;
    ws.getCell(row, 1).font = { color: { argb: 'FF4A5B56' } };
    row++;
  }
  for (const m of doc.meta) {
    ws.getCell(row, 1).value = m.label;
    ws.getCell(row, 1).font = { bold: true };
    ws.getCell(row, 2).value = m.value;
    widen(0, m.label);
    row++;
  }
  row++;

  const writeTable = (b: Extract<Block, { type: 'table' }>) => {
    if (b.title) {
      ws.getCell(row, 1).value = b.title;
      ws.getCell(row, 1).font = { bold: true, size: 12, color: { argb: 'FF0B3F36' } };
      row++;
    }
    if (b.rows.length === 0) {
      ws.getCell(row, 1).value = b.empty ?? 'لا توجد بيانات';
      row += 2;
      return;
    }
    // الرأس
    b.columns.forEach((c, i) => {
      const cell = ws.getCell(row, i + 1);
      cell.value = c.sub ? `${c.title} ${c.sub}` : c.title;
      cell.font = { bold: true, color: { argb: 'FF0B3F36' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
      cell.border = BORDER;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true, readingOrder: 'rtl' };
      widen(i, c.title.length > 14 ? c.title.slice(0, 14) : c.title);
    });
    if (freezeAt === null) freezeAt = row;
    row++;
    const write = (cells: Cell[]) => {
      cells.forEach((c, i) => {
        const col = b.columns[i]!;
        const v = cellValue(c);
        const cell = ws.getCell(row, i + 1);
        cell.value = v === null ? null : v;
        if (typeof v === 'number') {
          cell.numFmt = col.kind === 'percent' ? '0.0"%"' : Number.isInteger(v) ? '0' : '0.0#';
          widen(i, String(v));
        } else if (typeof v === 'string') widen(i, v);
        styleCell(cell, c, col);
        if (col.kind && col.kind !== 'text') cell.alignment = { ...(cell.alignment ?? {}), horizontal: 'center' };
      });
      row++;
    };
    b.rows.forEach(write);
    b.footer?.forEach(write);
    row++;
  };

  for (const block of doc.blocks) {
    switch (block.type) {
      case 'sheet':
        finishSheet();
        startSheet(block.name);
        break;
      case 'heading':
        ws.getCell(row, 1).value = block.text;
        ws.getCell(row, 1).font = { bold: true, size: 13, color: { argb: 'FF0B3F36' } };
        row++;
        break;
      case 'paragraph':
        ws.getCell(row, 1).value = block.text;
        row += 2;
        break;
      case 'kv':
        for (const i of block.items) {
          ws.getCell(row, 1).value = i.label;
          ws.getCell(row, 1).font = { bold: true };
          ws.getCell(row, 2).value = i.value;
          widen(0, i.label);
          row++;
        }
        row++;
        break;
      case 'stats':
        for (const i of block.items) {
          ws.getCell(row, 1).value = i.label;
          ws.getCell(row, 1).font = { bold: true };
          ws.getCell(row, 2).value = i.value;
          widen(0, i.label);
          row++;
        }
        row++;
        break;
      case 'table':
        writeTable(block);
        break;
      case 'bars':
        writeTable({
          type: 'table',
          title: block.title,
          columns: [
            { key: 'l', title: 'البند' },
            { key: 'v', title: 'القيمة', align: 'center' },
          ],
          rows: block.items.map((i) => [i.label, i.display]),
        });
        break;
      case 'list':
        if (block.title) {
          ws.getCell(row, 1).value = block.title;
          ws.getCell(row, 1).font = { bold: true };
          row++;
        }
        for (const i of block.items) {
          ws.getCell(row, 1).value = `• ${i}`;
          row++;
        }
        row++;
        break;
      case 'pagebreak':
        break;
    }
  }
  finishSheet();
  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out as ArrayBuffer);
}
