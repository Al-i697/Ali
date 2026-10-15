// قراءة قوائم الطلاب من Excel (.xlsx) أو CSV أو نص ملصوق، مع اكتشاف الأعمدة تلقائيًا.
// كل ما يُقرأ هنا «بيانات غير موثوقة»: نُنظّفه ونقيّد حجمه ثم يمرّ عبر المعاينة قبل أي كتابة.
import ExcelJS from 'exceljs';
import { cleanName, normalizeArabic, toWesternDigits } from '../../../shared/arabic';
import { LIMITS } from '../../../shared/constants';
import type { ImportPreviewDto } from '../../../shared/dto';
import { badRequest } from '../../lib/errors';
import type { RawImportRow } from './service';

type Cells = string[];
type SheetRow = { rowNumber: number; cells: Cells };

function decodeText(buf: Buffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf).replace(/^﻿/, '');
  } catch {
    // ملفات CSV من Excel العربي القديم تكون غالبًا Windows-1256
    return new TextDecoder('windows-1256').decode(buf);
  }
}

/** محلّل CSV/TSV صغير يراعي علامات الاقتباس (RFC 4180) */
function parseDelimited(text: string): SheetRow[] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
  const rows: SheetRow[] = [];
  let cells: string[] = [];
  let field = '';
  let quoted = false;
  let line = 1;
  const pushField = () => {
    cells.push(field.trim());
    field = '';
  };
  const pushRow = () => {
    pushField();
    if (cells.some((c) => c !== '')) rows.push({ rowNumber: line, cells });
    cells = [];
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) pushField();
    else if (ch === '\n') {
      pushRow();
      line++;
    } else if (ch !== '\r') field += ch;
  }
  pushRow();
  return rows;
}

async function readXlsx(buf: Buffer): Promise<SheetRow[]> {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(buf as unknown as ArrayBuffer);
  } catch {
    throw badRequest('تعذّرت قراءة ملف Excel. تأكد أنه بصيغة xlsx سليمة', 'BAD_FILE');
  }
  const ws = wb.worksheets.find((s) => s.actualRowCount > 0);
  if (!ws) throw badRequest('الملف فارغ', 'EMPTY_FILE');
  if (ws.actualRowCount > LIMITS.importMaxRows + 30)
    throw badRequest(`الملف كبير: الحد الأقصى ${LIMITS.importMaxRows} طالب في المرة الواحدة`, 'TOO_MANY_ROWS');
  const rows: SheetRow[] = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const cells: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      let text = '';
      try {
        text = cell.text ?? '';
      } catch {
        text = '';
      }
      cells[col - 1] = text.trim();
    });
    for (let i = 0; i < cells.length; i++) cells[i] ??= '';
    if (cells.some((c) => c !== '')) rows.push({ rowNumber, cells });
  });
  return rows;
}

export async function readFileRows(buf: Buffer, filename: string): Promise<SheetRow[]> {
  const lower = filename.toLowerCase();
  if (buf.length === 0) throw badRequest('الملف فارغ', 'EMPTY_FILE');
  const isZip = buf[0] === 0x50 && buf[1] === 0x4b; // PK — xlsx
  const isOldXls = buf[0] === 0xd0 && buf[1] === 0xcf; // OLE — xls القديم
  if (isOldXls || lower.endsWith('.xls')) {
    throw badRequest('صيغة xls القديمة غير مدعومة. افتح الملف في Excel واحفظه بصيغة xlsx أو CSV', 'UNSUPPORTED_XLS');
  }
  if (isZip || lower.endsWith('.xlsx')) return readXlsx(buf);
  if (/\.(csv|tsv|txt)$/.test(lower)) return parseDelimited(decodeText(buf));
  throw badRequest('صيغة الملف غير مدعومة. استخدم Excel (xlsx) أو CSV أو الصق الأسماء مباشرة', 'UNSUPPORTED_FILE');
}

/** نص ملصوق: سطر لكل طالب، واختياريًا «الاسم [تبويب/فاصلة] الرقم» */
export function readPastedText(text: string): SheetRow[] {
  const rows: SheetRow[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    // حذف الترقيم في بداية السطر: «1. » أو «٢) » أو «3-»
    let line = raw.replace(/^\s*[\d٠-٩۰-۹]+\s*[.)\-–:،]\s*/, '').trim();
    if (!line) return;
    let cells: string[];
    if (line.includes('\t')) cells = line.split('\t').map((c) => c.trim());
    else if (/[,;،]/.test(line) && /[\d٠-٩]/.test(line.split(/[,;،]/).slice(1).join(''))) cells = line.split(/[,;،]/).map((c) => c.trim());
    else cells = [line];
    rows.push({ rowNumber: i + 1, cells });
  });
  return rows;
}

// ───────────── اكتشاف الأعمدة ─────────────
const NAME_HEADERS = ['اسم الطالب', 'الاسم', 'اسم', 'الطالب', 'name', 'student name', 'full name', 'student'];
const NUMBER_HINTS = ['مدني', 'رقم الطالب', 'تعريف', 'civil', 'student id', 'student number', 'national', 'id number', 'رقم القيد', 'رقم الهويه'];
const GENDER_HEADERS = ['الجنس', 'النوع', 'gender', 'sex'];
const NOT_NAME = ['ولي', 'guardian', 'parent', 'الاب', 'الام', 'المدرسه', 'school', 'المعلم', 'teacher'];

function headerKind(cell: string): 'name' | 'number' | 'gender' | null {
  const n = normalizeArabic(cell);
  if (!n) return null;
  if (GENDER_HEADERS.some((h) => n === h || n.startsWith(`${h} `))) return 'gender';
  if (NUMBER_HINTS.some((h) => n.includes(h))) return 'number';
  if (NOT_NAME.some((h) => n.includes(h))) return null;
  if (NAME_HEADERS.some((h) => n === h || n.startsWith(`${h} `) || n.endsWith(` ${h}`))) return 'name';
  return null;
}

function parseGender(value: string | undefined): 'male' | 'female' | null {
  if (!value) return null;
  const n = normalizeArabic(value);
  if (['ذكر', 'ذكور', 'ولد', 'm', 'male', 'boy'].includes(n)) return 'male';
  if (['انثي', 'اناث', 'بنت', 'f', 'female', 'girl'].includes(n)) return 'female';
  return null;
}

function cleanNumber(value: string | undefined): string | null {
  if (!value) return null;
  const v = toWesternDigits(value).trim().replace(/\.0+$/, '').replace(/\s+/g, '');
  const safe = v.replace(/[^\p{L}\p{N}\-_/.]/gu, '');
  return safe ? safe.slice(0, 30) : null;
}

function looksLikeName(value: string | undefined): boolean {
  if (!value) return false;
  const v = cleanName(value);
  return /[؀-ۿ]/.test(v) && v.includes(' ') && v.length >= 5 && !/\d{4,}/.test(v);
}

export function extractStudents(rows: SheetRow[]): { rows: RawImportRow[]; detected: ImportPreviewDto['detected'] } {
  if (rows.length === 0) throw badRequest('لم يُعثر على بيانات في الملف', 'EMPTY_FILE');
  if (rows.length > LIMITS.importMaxRows + 30)
    throw badRequest(`الحد الأقصى ${LIMITS.importMaxRows} طالب في المرة الواحدة`, 'TOO_MANY_ROWS');

  let headerIndex = -1;
  let nameCol = -1;
  let numberCol = -1;
  let genderCol = -1;
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const cells = rows[i]!.cells;
    const kinds = cells.map((c) => headerKind(c ?? ''));
    if (kinds.includes('name')) {
      headerIndex = i;
      nameCol = kinds.indexOf('name');
      numberCol = kinds.indexOf('number');
      genderCol = kinds.indexOf('gender');
      break;
    }
  }

  let start = 0;
  if (headerIndex >= 0) {
    start = headerIndex + 1;
  } else {
    // بلا رأس: نختار العمود الأكثر شبهًا بالأسماء، والعمود الرقمي الأطول كرقم تعريفي
    const width = Math.max(...rows.map((r) => r.cells.length));
    let best = -1;
    let bestScore = 0;
    for (let c = 0; c < width; c++) {
      const score = rows.filter((r) => looksLikeName(r.cells[c])).length;
      if (score > bestScore) {
        best = c;
        bestScore = score;
      }
    }
    nameCol = best >= 0 ? best : 0;
    // عمود الرقم التعريفي: كل الخلايا غير الفارغة فيه أرقام من 5 خانات فأكثر (قد تكون بعض الصفوف بلا رقم)
    for (let c = 0; c < width; c++) {
      if (c === nameCol) continue;
      const filled = rows.filter((r) => (r.cells[c] ?? '') !== '');
      const nums = filled.filter((r) => /^\d{5,}$/.test(toWesternDigits(r.cells[c] ?? '')));
      if (filled.length > 0 && nums.length / filled.length >= 0.9) {
        numberCol = c;
        break;
      }
    }
  }

  const out: RawImportRow[] = [];
  for (const row of rows.slice(start)) {
    const name = cleanName(row.cells[nameCol] ?? '');
    if (!name) continue;
    // نتجاوز صفوف الإجماليات والتذييلات
    if (/^(المجموع|الاجمالي|الإجمالي|total)/i.test(name)) continue;
    out.push({
      rowNumber: row.rowNumber,
      fullName: name.slice(0, LIMITS.nameMax),
      studentNumber: numberCol >= 0 ? cleanNumber(row.cells[numberCol]) : null,
      gender: genderCol >= 0 ? parseGender(row.cells[genderCol]) : null,
    });
  }
  if (out.length === 0) throw badRequest('لم يُعثر على أسماء طلاب في الملف. تحقق من وجود عمود «اسم الطالب»', 'NO_NAMES');
  if (out.length > LIMITS.importMaxRows) throw badRequest(`الحد الأقصى ${LIMITS.importMaxRows} طالب في المرة الواحدة`, 'TOO_MANY_ROWS');

  const label = (i: number) => (i >= 0 ? `العمود ${i + 1}` : null);
  return {
    rows: out,
    detected: { name: label(nameCol), number: label(numberCol), gender: label(genderCol), headerRow: headerIndex >= 0 ? rows[headerIndex]!.rowNumber : null },
  };
}
