import { memo, useCallback, useEffect, useMemo, useReducer, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Copy, Eraser, EllipsisVertical, PaintBucket, Pencil, Trash2 } from 'lucide-react';
import { toWesternDigits } from '@shared/arabic';
import { ASSESSMENT_TYPE, MASTERY_LEVELS, SCORE_DECIMALS, type ResultStatus } from '@shared/constants';
import type { AssessmentDto, GradebookDto } from '@shared/dto';
import { computeStudentTotals, hasAtMostDecimals, levelForPercent, round, supportFlag, totalWeight, type ResultLite } from '@shared/gradebook';
import { api, errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useBeforeUnload, useFmt } from '@/lib/hooks';
import { qk } from '@/lib/queries';
import { Badge, Button, Input, Menu, MenuItem, MenuSeparator, Modal, Select, bandTone } from '@/components/ui';

// ───────────── نموذج الخلية ─────────────
type Cell = {
  text: string;
  status: ResultStatus;
  score: number | null;
  level: number | null;
  invalid: boolean;
  /** يزداد مع كل تعديل: لنعرف هل تغيّرت الخلية أثناء إرسال الحفظ */
  ver: number;
  dirty: boolean;
  failed: boolean;
  /** آخر نص أكّده الخادم — يعود إليه زر Esc */
  saved: string;
};

const keyOf = (studentId: string, assessmentId: string) => `${studentId}|${assessmentId}`;

type Parsed = Pick<Cell, 'text' | 'status' | 'score' | 'level' | 'invalid'>;

/** يفسّر ما يكتبه المعلم: رقم، «غ» غائب، «ع» معذور، أو 1–4 للإتقان. يقبل الأرقام الهندية. */
function parseInput(a: AssessmentDto, raw: string): Parsed {
  const text = toWesternDigits(raw).replace(/\s+/g, '');
  const base = { text, status: 'graded' as ResultStatus, score: null, level: null, invalid: false };
  if (text === '') return base;
  if (text === 'غ') return { ...base, status: 'absent' };
  if (text === 'ع') return { ...base, status: 'excused' };
  if (a.mode === 'mastery') return /^[1-4]$/.test(text) ? { ...base, level: Number(text) } : { ...base, invalid: true };
  const t = text.replace(',', '.');
  if (!/^\d+(\.\d*)?$/.test(t)) return { ...base, invalid: true };
  const n = Number(t.endsWith('.') ? t.slice(0, -1) : t);
  if (a.maxScore !== null && n > a.maxScore) return { ...base, invalid: true };
  if (!hasAtMostDecimals(n, SCORE_DECIMALS)) return { ...base, invalid: true };
  return { ...base, score: n };
}

function cellFromServer(a: AssessmentDto, r: { score: number | null; level: number | null; status: ResultStatus } | undefined): Cell {
  if (!r) return { text: '', status: 'graded', score: null, level: null, invalid: false, ver: 0, dirty: false, failed: false, saved: '' };
  const text = r.status === 'absent' ? 'غ' : r.status === 'excused' ? 'ع' : a.mode === 'mastery' ? (r.level ? String(r.level) : '') : r.score === null ? '' : String(r.score);
  return { text, status: r.status, score: r.score, level: r.level, invalid: false, ver: 0, dirty: false, failed: false, saved: text };
}

export type SaveStatus = { pending: number; saving: boolean; failed: number; invalid: number };

type GridProps = {
  gb: GradebookDto;
  onEdit: (a: AssessmentDto) => void;
  onCopy: (a: AssessmentDto) => void;
  onDelete: (a: AssessmentDto) => void;
  onStatus: (s: SaveStatus) => void;
  registerApi: (api: { flush: () => Promise<void>; retry: () => Promise<void> }) => void;
};

// ───────────── خلية الإدخال ─────────────
type CellInputProps = {
  r: number;
  c: number;
  value: string;
  invalid: boolean;
  failed: boolean;
  dirty: boolean;
  status: ResultStatus;
  level: number | null;
  mastery: boolean;
  label: string;
  max: number | null;
  register: (r: number, c: number, el: HTMLInputElement | null) => void;
  onChange: (r: number, c: number, v: string) => void;
  onKey: (e: KeyboardEvent<HTMLInputElement>, r: number, c: number) => void;
  onPaste: (e: ClipboardEvent<HTMLInputElement>, r: number, c: number) => void;
};

const CellInput = memo(function CellInput(p: CellInputProps) {
  const masteryTone = p.mastery && p.level ? MASTERY_LEVELS.find((m) => m.value === p.level)?.tone : undefined;
  return (
    <input
      ref={(el) => p.register(p.r, p.c, el)}
      value={p.value}
      inputMode={p.mastery ? 'numeric' : 'decimal'}
      autoComplete="off"
      aria-label={p.label}
      aria-invalid={p.invalid || undefined}
      title={p.invalid ? (p.mastery ? 'أدخل 1 إلى 4' : `أدخل رقمًا من 0 إلى ${p.max}`) : p.failed ? 'تعذّر الحفظ — سيُعاد تلقائيًا' : undefined}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => p.onChange(p.r, p.c, e.target.value)}
      onKeyDown={(e) => p.onKey(e, p.r, p.c)}
      onPaste={(e) => p.onPaste(e, p.r, p.c)}
      className={cn(
        'h-11 w-full min-w-[4.25rem] border-0 bg-transparent px-1 text-center text-[15px] tnum outline-none transition-colors placeholder:text-muted/40 focus:bg-brand-soft focus:ring-2 focus:ring-inset focus:ring-brand',
        p.invalid && 'bg-bad-soft text-bad focus:bg-bad-soft',
        !p.invalid && p.status === 'absent' && 'bg-bad-soft/60 font-semibold text-bad',
        !p.invalid && p.status === 'excused' && 'bg-surface-3 font-semibold text-muted',
        masteryTone === 'good' && 'bg-good-soft font-semibold text-good',
        masteryTone === 'info' && 'bg-info-soft font-semibold text-info',
        masteryTone === 'warn' && 'bg-warn-soft font-semibold text-warn',
        masteryTone === 'bad' && 'bg-bad-soft font-semibold text-bad',
        p.failed && 'shadow-[inset_0_0_0_2px_var(--bad)]',
        p.dirty && !p.failed && 'shadow-[inset_-3px_0_0_var(--accent)]',
      )}
    />
  );
});

// ───────────── الشبكة ─────────────
export function GradeGrid({ gb, onEdit, onCopy, onDelete, onStatus, registerApi }: GridProps) {
  const fmt = useFmt();
  const qc = useQueryClient();
  const { assessments, students, grading } = gb;
  // مصدر الحقيقة للخلايا: ref يُحدَّث دائمًا عبر update() الذي يطلب إعادة الرسم — فلا تأثيرات جانبية داخل دوال تحديث React
  const cellsRef = useRef(new Map<string, Cell>());
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const cells = cellsRef.current;
  const update = useCallback((fn: (m: Map<string, Cell>) => void) => {
    const next = new Map(cellsRef.current);
    fn(next);
    cellsRef.current = next;
    rerender();
  }, []);

  const pending = useRef(new Set<string>()); // خلايا صالحة تنتظر الحفظ
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inFlight = useRef(0);
  const inputs = useRef(new Map<string, HTMLInputElement>());
  const [fill, setFill] = useState<AssessmentDto | null>(null);
  const [fillValue, setFillValue] = useState('');

  const gbRef = useRef(gb);
  gbRef.current = gb;

  // ── تهيئة الخلايا من الخادم مع الحفاظ على التعديلات غير المحفوظة ──
  useEffect(() => {
    update((next) => {
      next.clear();
      for (const s of students) {
        for (const a of assessments) {
          const k = keyOf(s.studentId, a.id);
          const old = cellsRef.current.get(k);
          next.set(k, old && (old.dirty || old.failed || old.invalid) ? old : cellFromServer(a, s.results[a.id]));
        }
      }
    });
  }, [students, assessments, update]);

  const [status, setStatus] = useState<SaveStatus>({ pending: 0, saving: false, failed: 0, invalid: 0 });
  const lastStatus = useRef<SaveStatus | null>(null);
  useEffect(() => {
    let failed = 0;
    let invalid = 0;
    for (const c of cells.values()) {
      if (c.failed) failed++;
      if (c.invalid) invalid++;
    }
    const s = { pending: pending.current.size, saving: inFlight.current > 0, failed, invalid };
    // نُبلّغ الصفحة عند تغيّر الحالة فقط (وإلا تدخل الواجهة في حلقة إعادة رسم لا تنتهي)
    const prev = lastStatus.current;
    if (!prev || prev.pending !== s.pending || prev.saving !== s.saving || prev.failed !== s.failed || prev.invalid !== s.invalid) {
      lastStatus.current = s;
      setStatus(s);
      onStatus(s);
    }
  });

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void flushRef.current(), 600);
  }, []);

  // ── الحفظ المُجمَّع: خلايا كل تقويم تُرسل في طلب واحد ──
  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    type Item = { key: string; ver: number; text: string; entry: { studentId: string; score: number | null; level: number | null; status: ResultStatus } };
    const groups = new Map<string, Item[]>();
    for (const key of [...pending.current]) {
      const cell = cellsRef.current.get(key);
      if (!cell || cell.invalid) {
        pending.current.delete(key);
        continue;
      }
      const [studentId, assessmentId] = key.split('|') as [string, string];
      const list = groups.get(assessmentId) ?? [];
      list.push({ key, ver: cell.ver, text: cell.text, entry: { studentId, score: cell.score, level: cell.level, status: cell.status } });
      groups.set(assessmentId, list);
    }
    if (!groups.size) {
      rerender();
      return;
    }
    inFlight.current += groups.size;
    rerender();
    let errorShown = false;
    await Promise.all(
      [...groups].map(async ([assessmentId, items]) => {
        try {
          await api.put(`/assessments/${assessmentId}/results`, { results: items.map((i) => i.entry) });
          update((m) => {
            for (const it of items) {
              const cur = m.get(it.key);
              // إن تغيّرت الخلية أثناء الإرسال نُبقيها «غير محفوظة» لتُرسل في الدورة التالية
              if (cur && cur.ver === it.ver) {
                m.set(it.key, { ...cur, dirty: false, failed: false, saved: it.text });
                pending.current.delete(it.key);
              } else if (cur) m.set(it.key, { ...cur, saved: it.text });
            }
          });
        } catch (e) {
          update((m) => {
            for (const it of items) {
              const cur = m.get(it.key);
              if (cur) m.set(it.key, { ...cur, failed: true });
              pending.current.delete(it.key); // لا إعادة تلقائية متكررة؛ الزر اليدوي أو عودة الاتصال يعيدان الإرسال
              failedKeys.current.add(it.key);
            }
          });
          if (!errorShown) {
            errorShown = true;
            toast.error(`تعذّر حفظ بعض الدرجات: ${errorMessage(e)}`);
          }
        } finally {
          inFlight.current -= 1;
        }
      }),
    );
    rerender();
    // تحديث ما يعتمد على الدرجات (الشبكة نفسها تُحدَّث لتبقى الذاكرة المؤقتة سليمة عند العودة للصفحة)
    void qc.invalidateQueries({ queryKey: ['gradebook'] });
    void qc.invalidateQueries({ queryKey: qk.dashboard });
    void qc.invalidateQueries({ queryKey: ['profile'] });
    if (pending.current.size > 0) schedule(); // تعديلات جاءت أثناء الإرسال
  }, [qc, update, schedule]);

  const failedKeys = useRef(new Set<string>());
  /** إعادة إرسال ما فشل (زر «إعادة المحاولة» أو عودة الاتصال) */
  const retry = useCallback(async () => {
    for (const key of failedKeys.current) pending.current.add(key);
    failedKeys.current.clear();
    await flushRef.current();
  }, []);

  const flushRef = useRef(flush);
  flushRef.current = flush;
  useEffect(() => registerApi({ flush: () => flushRef.current(), retry }), [registerApi, retry]);

  // حفظ عند إخفاء التبويب أو مغادرة الصفحة، وإعادة المحاولة عند عودة الاتصال
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') void flushRef.current();
    };
    const onOnline = () => void retry();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('online', onOnline);
      clearTimeout(timer.current);
      void flushRef.current();
    };
  }, [retry]);
  useBeforeUnload(status.pending > 0 || status.saving || status.invalid > 0);

  // ── تعديل خلية ──
  const setCellText = useCallback(
    (r: number, c: number, raw: string) => {
      const s = gbRef.current.students[r];
      const a = gbRef.current.assessments[c];
      if (!s || !a) return;
      const k = keyOf(s.studentId, a.id);
      const parsed = parseInput(a, raw);
      const old = cellsRef.current.get(k);
      const unchanged = old && !old.dirty && !old.failed && old.saved === parsed.text && !parsed.invalid;
      update((m) => {
        m.set(k, { ...parsed, ver: (old?.ver ?? 0) + 1, dirty: !unchanged, failed: false, saved: old?.saved ?? '' });
      });
      failedKeys.current.delete(k);
      if (parsed.invalid || unchanged) pending.current.delete(k);
      else {
        pending.current.add(k);
        schedule();
      }
    },
    [update, schedule],
  );

  // ── التنقل بلوحة المفاتيح ──
  const register = useCallback((r: number, c: number, el: HTMLInputElement | null) => {
    const k = `${r}:${c}`;
    if (el) inputs.current.set(k, el);
    else inputs.current.delete(k);
  }, []);
  const focusCell = (r: number, c: number) => {
    const el = inputs.current.get(`${r}:${c}`);
    if (el) {
      el.focus();
      el.select();
    }
  };

  const onKey = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
      const lastRow = gbRef.current.students.length - 1;
      const lastCol = gbRef.current.assessments.length - 1;
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          focusCell(Math.max(0, Math.min(lastRow, r + (e.shiftKey ? -1 : 1))), c);
          break;
        case 'ArrowDown':
          e.preventDefault();
          focusCell(Math.min(lastRow, r + 1), c);
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusCell(Math.max(0, r - 1), c);
          break;
        // الواجهة من اليمين لليسار: العمود التالي على اليسار
        case 'ArrowLeft':
          e.preventDefault();
          focusCell(r, Math.min(lastCol, c + 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          focusCell(r, Math.max(0, c - 1));
          break;
        case 'Escape': {
          const s = gbRef.current.students[r];
          const a = gbRef.current.assessments[c];
          if (s && a) setCellText(r, c, cellsRef.current.get(keyOf(s.studentId, a.id))?.saved ?? '');
          break;
        }
        default:
      }
    },
    [setCellText],
  );

  // لصق من Excel: صفوف بسطر جديد وأعمدة بـ Tab، من الخلية الحالية نزولًا ويسارًا
  const onPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>, r: number, c: number) => {
      const text = e.clipboardData.getData('text');
      if (!/[\n\t]/.test(text.trim())) return;
      e.preventDefault();
      const rows = text.replace(/\r/g, '').replace(/\n$/, '').split('\n');
      let count = 0;
      rows.forEach((line, i) => {
        line.split('\t').forEach((v, j) => {
          const rr = r + i;
          const cc = c + j;
          if (rr < gbRef.current.students.length && cc < gbRef.current.assessments.length) {
            setCellText(rr, cc, v.trim());
            count++;
          }
        });
      });
      toast.success(`لُصقت ${fmt.num(count)} خلية`);
    },
    [fmt, setCellText],
  );

  // ── إجراءات العمود ──
  const columnIndex = (a: AssessmentDto) => assessments.findIndex((x) => x.id === a.id);
  const clearColumn = (a: AssessmentDto) => {
    const c = columnIndex(a);
    students.forEach((s, r) => {
      if ((cellsRef.current.get(keyOf(s.studentId, a.id))?.text ?? '') !== '') setCellText(r, c, '');
    });
  };
  const applyFill = (a: AssessmentDto, value: string, onlyBlank: boolean) => {
    const c = columnIndex(a);
    students.forEach((s, r) => {
      const cur = cellsRef.current.get(keyOf(s.studentId, a.id))?.text ?? '';
      if (!onlyBlank || cur === '') setCellText(r, c, value);
    });
  };

  // ── الحساب اللحظي (نفس دوال الخادم) ──
  const lites = useMemo(() => assessments.map((a) => ({ id: a.id, mode: a.mode, maxScore: a.maxScore, weight: a.weight, countsTowardTotal: a.countsTowardTotal })), [assessments]);
  const rows = useMemo(
    () =>
      students.map((s) => {
        const results: Record<string, ResultLite> = {};
        for (const a of assessments) {
          const cell = cells.get(keyOf(s.studentId, a.id));
          if (!cell || cell.invalid) continue;
          if (cell.status === 'graded' && cell.score === null && cell.level === null) continue;
          results[a.id] = { score: cell.score, level: cell.level, status: cell.status };
        }
        const totals = computeStudentTotals(lites, results);
        return { totals, level: levelForPercent(totals.percent, grading.bands), flag: supportFlag(totals.percent, grading) };
      }),
    [students, assessments, cells, lites, grading],
  );

  const colStats = useMemo(
    () =>
      assessments.map((a) => {
        const vals: number[] = [];
        let recorded = 0;
        for (const s of students) {
          const cell = cells.get(keyOf(s.studentId, a.id));
          if (!cell || cell.invalid) continue;
          if (cell.status !== 'graded') recorded++;
          else if (a.mode === 'score' && cell.score !== null) {
            vals.push(cell.score);
            recorded++;
          } else if (a.mode === 'mastery' && cell.level !== null) {
            vals.push(cell.level);
            recorded++;
          }
        }
        return { mean: vals.length ? round(vals.reduce((x, y) => x + y, 0) / vals.length) : null, recorded };
      }),
    [assessments, students, cells],
  );
  const classPercents = rows.map((r) => r.totals.percent).filter((p): p is number => p !== null);
  const classMean = classPercents.length ? round(classPercents.reduce((x, y) => x + y, 0) / classPercents.length) : null;
  const weightSum = totalWeight(lites);

  return (
    <>
      <div className="max-h-[calc(100dvh-15rem)] min-h-64 overflow-auto rounded-card border border-line bg-surface shadow-card">
        <table className="w-max min-w-full border-separate border-spacing-0 text-[14.5px]">
          <thead>
            <tr>
              <th className="sticky start-0 top-0 z-30 w-11 min-w-11 border-b border-line bg-surface-3 px-1 py-2 text-center text-[12.5px] font-medium text-muted">م</th>
              <th className="sticky start-11 top-0 z-30 w-44 min-w-44 border-b border-line bg-surface-3 px-3 py-2 text-start text-[13px] font-medium text-muted">الطالب</th>
              {/* أعمدة النتيجة بعد الاسم مباشرة: تبقى ظاهرة (مثبّتة) أثناء التمرير الأفقي بين التقويمات */}
              <th className="top-0 z-30 w-20 min-w-20 border-b border-s border-line bg-surface-3 px-2 py-2 text-center text-[13px] font-semibold text-ink sticky lg:start-[13.75rem]">
                المجموع<span className="block text-[11.5px] font-normal text-muted tnum">من {fmt.num(weightSum)}</span>
              </th>
              <th className="top-0 z-30 w-16 min-w-16 border-b border-line bg-surface-3 px-2 py-2 text-center text-[13px] font-semibold text-ink sticky lg:start-[18.75rem]">النسبة</th>
              <th className="top-0 z-30 w-28 min-w-28 border-b border-e border-line-strong bg-surface-3 px-2 py-2 text-center text-[13px] font-semibold text-ink sticky lg:start-[22.75rem]">المستوى</th>
              {assessments.map((a) => (
                <th key={a.id} className="sticky top-0 z-20 w-28 min-w-28 border-b border-s border-line bg-surface-3 px-1.5 py-1.5 align-top">
                  <Menu
                    trigger={
                      <button className="group flex w-full flex-col items-center rounded-lg px-1 py-1 text-center transition-colors hover:bg-surface" title={a.description ?? undefined}>
                        <span className="line-clamp-2 text-[13.5px] font-semibold leading-5 text-ink">{a.title}</span>
                        <span className="mt-0.5 text-[11.5px] font-normal leading-4 text-muted tnum">
                          {ASSESSMENT_TYPE.labels[a.type]} · {a.mode === 'mastery' ? 'إتقان' : `من ${fmt.num(a.maxScore)}`}
                        </span>
                        {a.mode === 'score' && a.weight !== a.maxScore ? <span className="text-[11px] font-normal leading-4 text-accent tnum">وزن {fmt.num(a.weight)}</span> : null}
                        {a.mode === 'score' && !a.countsTowardTotal ? <span className="text-[11px] font-normal leading-4 text-warn">لا يُحتسب</span> : null}
                        {a.date ? <span className="text-[11px] font-normal leading-4 text-muted tnum">{fmt.date(a.date, 'short')}</span> : null}
                        <EllipsisVertical className="mt-0.5 size-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
                      </button>
                    }
                  >
                    <MenuItem icon={<Pencil className="size-4" />} onSelect={() => onEdit(a)}>تعديل التقويم</MenuItem>
                    <MenuItem icon={<PaintBucket className="size-4" />} onSelect={() => { setFill(a); setFillValue(a.mode === 'mastery' ? '4' : String(a.maxScore ?? '')); }}>تعبئة الفراغات…</MenuItem>
                    <MenuItem icon={<Copy className="size-4" />} onSelect={() => onCopy(a)}>نسخ إلى شعب أخرى</MenuItem>
                    <MenuItem icon={<Eraser className="size-4" />} onSelect={() => clearColumn(a)}>مسح كل الدرجات</MenuItem>
                    <MenuSeparator />
                    <MenuItem icon={<Trash2 className="size-4" />} danger onSelect={() => onDelete(a)}>حذف التقويم</MenuItem>
                  </Menu>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, r) => {
              const row = rows[r]!;
              return (
                <tr key={s.studentId} className="focus-within:[&>td]:!bg-brand-soft">
                  <td className="sticky start-0 z-10 border-b border-line bg-surface px-1 text-center text-[13px] text-muted tnum">{fmt.num(r + 1)}</td>
                  <td className="sticky start-11 z-10 border-b border-line bg-surface px-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('size-2 shrink-0 rounded-full', row.flag === 'remedial' ? 'bg-bad' : row.flag === 'enrichment' ? 'bg-good' : 'bg-transparent')} title={row.flag === 'remedial' ? 'يحتاج دعمًا' : row.flag === 'enrichment' ? 'مرشح للإثراء' : undefined} />
                      <Link to={`/students/${s.studentId}`} className="truncate py-2.5 font-medium text-ink hover:text-brand" title={s.fullName}>{s.fullName}</Link>
                    </div>
                  </td>
                  <td className="border-b border-s border-line bg-surface px-2 text-center font-bold tnum text-ink lg:sticky lg:start-[13.75rem] lg:z-10">{row.totals.percent === null ? <span className="font-normal text-muted">—</span> : fmt.num(row.totals.earned)}</td>
                  <td className="border-b border-line bg-surface px-2 text-center tnum lg:sticky lg:start-[18.75rem] lg:z-10">{row.totals.percent === null ? <span className="text-muted">—</span> : <span className="font-semibold">{fmt.pct(row.totals.percent)}</span>}</td>
                  <td className="border-b border-e border-line-strong bg-surface px-2 text-center lg:sticky lg:start-[22.75rem] lg:z-10">{row.level ? <Badge tone={bandTone(row.level.tone)}>{row.level.label}</Badge> : <span className="text-muted">—</span>}</td>
                  {assessments.map((a, c) => {
                    const cell = cells.get(keyOf(s.studentId, a.id));
                    return (
                      <td key={a.id} className="border-b border-s border-line bg-surface p-0">
                        <CellInput
                          r={r}
                          c={c}
                          value={cell?.text ?? ''}
                          invalid={cell?.invalid ?? false}
                          failed={cell?.failed ?? false}
                          dirty={cell?.dirty ?? false}
                          status={cell?.status ?? 'graded'}
                          level={cell?.level ?? null}
                          mastery={a.mode === 'mastery'}
                          max={a.maxScore}
                          label={`${s.fullName} — ${a.title}`}
                          register={register}
                          onChange={setCellText}
                          onKey={onKey}
                          onPaste={onPaste}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="[&>td]:sticky [&>td]:bottom-0 [&>td]:z-20 [&>td]:border-t [&>td]:border-line [&>td]:bg-surface-3">
              <td className="start-0 !z-30 px-1" />
              <td className="start-11 !z-30 px-3 py-2 text-[13px] font-semibold text-ink-2">المتوسط · المرصود</td>
              <td className="border-s lg:start-[13.75rem] lg:!z-30" />
              <td className="px-2 text-center font-semibold tnum text-ink lg:start-[18.75rem] lg:!z-30">{classMean === null ? '—' : fmt.pct(classMean)}</td>
              <td className="border-e !border-e-line-strong lg:start-[22.75rem] lg:!z-30" />
              {assessments.map((a, c) => (
                <td key={a.id} className="border-s px-1.5 py-1.5 text-center leading-4">
                  <div className="font-semibold tnum text-ink">{colStats[c]!.mean === null ? '—' : fmt.num(colStats[c]!.mean)}</div>
                  <div className={cn('text-[11.5px] tnum', colStats[c]!.recorded < students.length ? 'text-warn' : 'text-good')}>{fmt.num(colStats[c]!.recorded)}/{fmt.num(students.length)}</div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <Modal
        open={!!fill}
        onOpenChange={(o) => !o && setFill(null)}
        size="sm"
        title="تعبئة الفراغات"
        description={fill ? `تُعبّأ الخانات الفارغة فقط في «${fill.title}»، ولا تتغير الدرجات المرصودة.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setFill(null)}>إلغاء</Button>
            <Button variant="primary" onClick={() => { if (fill) applyFill(fill, fillValue, true); setFill(null); }}>تعبئة</Button>
          </>
        }
      >
        {fill?.mode === 'mastery' ? (
          <Select value={fillValue} onChange={(e) => setFillValue(e.target.value)} aria-label="المستوى">
            {[...MASTERY_LEVELS].reverse().map((m) => <option key={m.value} value={m.value}>{m.value} — {m.label}</option>)}
          </Select>
        ) : (
          <div className="space-y-2">
            <Input value={fillValue} onChange={(e) => setFillValue(e.target.value)} inputMode="decimal" className="tnum" aria-label="القيمة" autoFocus />
            <p className="text-[13px] text-muted">أدخل درجة، أو <b>غ</b> لتعيين الغياب، أو <b>ع</b> للعذر.</p>
          </div>
        )}
      </Modal>
    </>
  );
}

export { parseInput };
