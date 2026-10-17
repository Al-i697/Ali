import { describe, expect, it } from 'vitest';
import type { ParticipationEntry } from '../../src/shared/classroom';
import { buildStudentReport, buildSummary, makeMetaResolver, type RosterEntry } from '../../src/shared/classroom-views';
import type { AssignmentDto, ClassRecordDto, StudentDto } from '../../src/shared/dto';
import { classSectionDoc, classStudentDoc, resolveClassRange } from '../../src/server/reports/class-docs';
import { renderReportHtmlWith } from '../../src/server/reports/render';
import type { Block, Branding, ReportDoc } from '../../src/server/reports/types';

const A1: AssignmentDto = { id: 'a1', sectionId: 'sec1', subjectId: 'sub1', yearId: 'y', gradeLevel: 10, sectionName: '3', sectionLabel: '10/3', subjectName: 'العلوم', subjectColor: 'teal', weeklyPeriods: null };
const A2: AssignmentDto = { ...A1, id: 'a2', subjectId: 'sub2', subjectName: 'الرياضيات', subjectColor: 'violet' };
const meta = makeMetaResolver(new Map([['a1', A1], ['a2', A2]]), [{ id: 'l1', assignmentId: 'a1', date: '2026-10-05', period: 1, title: 'الخلية' }]);
const student = (over: Partial<StudentDto> = {}): StudentDto => ({
  id: 's1', fullName: 'أحمد بن سالم', studentNumber: '9001', gender: 'male', birthDate: null, guardianName: 'سالم بن خليفة', guardianPhone: '99000000', notes: null, status: 'active', createdAt: '2026-08-01T00:00:00.000Z',
  enrollment: { sectionId: 'sec1', sectionLabel: '10/3', yearId: 'y', rollNo: 1 }, ...over,
});
const part = (studentId: string, date: string, count: number, period: number | null = 1, assignmentId: string | null = 'a1'): ParticipationEntry => ({ studentId, assignmentId, date, period, count });
let seq = 0;
const rec = (studentId: string, date: string, kind: ClassRecordDto['kind'], reason: string | null, note: string | null = null, period: number | null = 1, assignmentId: string | null = 'a1'): ClassRecordDto => ({
  id: `r${++seq}`, studentId, assignmentId, date, period, kind, reason, note, createdAt: `2026-10-01T08:00:${String(seq).padStart(2, '0')}.000Z`,
});
const brand: Branding = { schoolName: 'مدرسة', directorate: null, teacherName: 'معلم', jobTitle: null, specialization: null, seniorTeacherName: null, principalName: null, digits: 'latn' };
const range = { everything: false, from: '2026-08-23', to: '2027-01-19' };
const common = { range, digits: 'latn' as const, teacherName: 'معلم تجريبي', now: '2026-10-13T05:30:00.000Z' };

const block = <T extends Block['type']>(doc: ReportDoc, type: T, title?: string) => doc.blocks.find((b): b is Extract<Block, { type: T }> => b.type === type && (title === undefined || ('title' in b && b.title === title)));

describe('الفترة الافتراضية لتقارير الصف', () => {
  const term = { startDate: '2026-08-23', endDate: '2027-01-19' };
  it('كل الفترات صراحةً تتجاهل الفصل والتاريخين', () => {
    expect(resolveClassRange({ all: true, from: '2026-09-01' }, term, '2026-10-13')).toEqual({ everything: true });
  });
  it('الفصل الحالي افتراضيًا، والتاريخان المحددان يتقدمان عليه، وبلا فصل اليوم', () => {
    expect(resolveClassRange({}, term, '2026-10-13')).toEqual({ everything: false, from: '2026-08-23', to: '2027-01-19' });
    expect(resolveClassRange({ from: '2026-10-01' }, term, '2026-10-13')).toEqual({ everything: false, from: '2026-10-01', to: '2027-01-19' });
    expect(resolveClassRange({ all: false }, null, '2026-10-13')).toEqual({ everything: false, from: '2026-10-13', to: '2026-10-13' });
  });
});

describe('مستند تقرير الطالب', () => {
  const rows = {
    participation: [part('s1', '2026-10-05', 2), part('s1', '2026-10-06', 0), part('s1', '2026-10-07', 1, 2, 'a2')],
    records: [rec('s1', '2026-10-05', 'negative', 'حديث جانبي', 'تكرر أثناء الشرح'), rec('s1', '2026-10-07', 'positive', 'مساعدة زميل', null, 2, 'a2'), rec('s1', '2026-10-06', 'note', null, 'يحتاج مقعدًا أقرب', 1)],
  };
  const rep = (over: { assignmentId?: string | null; limit?: number } = {}) =>
    buildStudentReport({ student: student(), assignmentId: over.assignmentId ?? null, limit: over.limit ?? 500, rows, meta, sectionRate: 40 });

  it('الترويسة والأعداد والأسباب والخط الزمني بالأقدم أولًا وبصيغة «شارك ×2» و«لم يشارك»', () => {
    const doc = classStudentDoc({ ...common, rep: rep(), subjectScope: 'كل المواد' });
    expect(doc).toMatchObject({ type: 'class-student', title: 'تقرير المشاركة والسلوك الصفي', subtitle: 'أحمد بن سالم', signatures: true, generatedAt: common.now });
    expect(doc.meta).toEqual([{ label: 'من', value: expect.any(String) }, { label: 'إلى', value: expect.any(String) }, { label: 'المعلم', value: 'معلم تجريبي' }]);

    const kv = block(doc, 'kv')!;
    expect(kv.items.map((i) => i.label)).toEqual(['اسم الطالب', 'الرقم التعريفي', 'الشعبة', 'المادة']); // بلا ولي الأمر ما لم يُطلب
    const stats = block(doc, 'stats')!;
    expect(stats.items.find((i) => i.label === 'نسبة المشاركة')).toMatchObject({ value: '66.7%', hint: 'متوسط الشعبة 40%' });
    expect(stats.items.find((i) => i.label === 'سلوك غير حسن')).toMatchObject({ value: '1', hint: 'و1 ملاحظة', tone: 'bad' });

    expect(block(doc, 'bars', 'أسباب السلوك غير الحسن')!.items).toEqual([{ label: 'حديث جانبي', value: 1, display: '1', tone: 'bad' }]);
    expect(block(doc, 'table', 'حسب المادة')!.rows).toHaveLength(2); // مقرران ⇒ جدول «حسب المادة»

    const timeline = block(doc, 'table', 'الخط الزمني')!;
    const text = timeline.rows.map((r) => JSON.stringify(r)).join('\n');
    // الأقدم أولًا: حصة 5 أكتوبر (علوم، شارك ×2) ثم 6 (لم يشارك) ثم 7 (رياضيات)
    expect(JSON.stringify(timeline.rows[0])).toContain('شارك ×2');
    expect(JSON.stringify(timeline.rows[1])).toContain('لم يشارك');
    expect(JSON.stringify(timeline.rows.at(-1))).toContain('الرياضيات');
    expect(text).toContain('شارك ×2');
    expect(text).toContain('لم يشارك');
    expect(text).toContain('سلوك غير حسن: حديث جانبي — تكرر أثناء الشرح');
    expect(text).toContain('الخلية'); // عنوان الدرس من تحضيرك
  });

  it('مقرر واحد: لا جدول «حسب المادة»، ورأس المادة من النطاق المطلوب', () => {
    const doc = classStudentDoc({ ...common, rep: rep({ assignmentId: 'a1' }), subjectScope: 'العلوم' });
    expect(block(doc, 'table', 'حسب المادة')).toBeUndefined();
    expect(block(doc, 'kv')!.items.find((i) => i.label === 'المادة')!.value).toBe('العلوم');
  });

  it('ولي الأمر والملاحظات العامة لا يُطبعان إلا عند الطلب، وتُرشَّح الملاحظات بالفترة وتقتصر على 30', () => {
    const base = { ...common, rep: rep(), subjectScope: 'كل المواد' };
    const without = classStudentDoc(base);
    expect(JSON.stringify(without)).not.toContain('سالم بن خليفة');
    expect(block(without, 'list')).toBeUndefined();

    const notes = [{ date: '2026-07-01', text: 'قبل الفترة' }, ...Array.from({ length: 40 }, (_, i) => ({ date: '2026-10-05', text: `ملاحظة ${i + 1}` }))];
    const withAll = classStudentDoc({ ...base, includeGuardian: true, notes });
    expect(block(withAll, 'kv')!.items.map((i) => i.label)).toContain('ولي الأمر');
    expect(block(withAll, 'kv')!.items.map((i) => i.label)).toContain('هاتف ولي الأمر');
    const list = block(withAll, 'list')!;
    expect(list.items).toHaveLength(30);
    expect(JSON.stringify(list.items)).not.toContain('قبل الفترة');
    // «كل الفترات» لا يرشّح بالتاريخ
    const everything = classStudentDoc({ ...base, range: { everything: true }, notes });
    expect(block(everything, 'list')!.items.join('|')).toContain('قبل الفترة');
    expect(everything.meta[0]).toEqual({ label: 'الفترة', value: 'كل الفترات' });
  });

  it('عند اقتصار الخط الزمني على أحدث الحصص يُنبَّه بأن الأعداد تشمل الكل', () => {
    const many = { participation: Array.from({ length: 6 }, (_, i) => part('s1', `2026-10-0${i + 1}`, 1)), records: [] };
    const r = buildStudentReport({ student: student(), assignmentId: null, limit: 2, rows: many, meta, sectionRate: null });
    const doc = classStudentDoc({ ...common, rep: r, subjectScope: 'كل المواد' });
    const note = block(doc, 'paragraph')!;
    expect(note.tone).toBe('warn');
    expect(note.text).toContain('أحدث 2 حصة من 6');
    expect(block(doc, 'table', 'الخط الزمني')!.rows).toHaveLength(2);
  });

  it('طالب بلا تسجيلات: جدول فارغ برسالته، وبلا شعبة: «غير مسجّل هذا العام»', () => {
    const r = buildStudentReport({ student: student({ enrollment: null }), assignmentId: null, limit: 500, rows: { participation: [], records: [] }, meta, sectionRate: null });
    const doc = classStudentDoc({ ...common, rep: r, subjectScope: 'كل المواد' });
    expect(block(doc, 'kv')!.items.find((i) => i.label === 'الشعبة')!.value).toBe('غير مسجّل هذا العام');
    expect(block(doc, 'stats')!.items.find((i) => i.label === 'نسبة المشاركة')!.value).toBe('—');
    expect(block(doc, 'table', 'الخط الزمني')).toMatchObject({ rows: [], empty: 'لا تسجيلات لهذا الطالب في الفترة' });
  });

  it('العارض يهرّب الأسماء والأسباب ويضمّن الخطوط الممرَّرة ويحترم الأرقام الهندية', () => {
    const evil = buildStudentReport({
      student: student({ fullName: '<img src=x onerror=alert(1)> الخبيث' }),
      assignmentId: null,
      limit: 500,
      rows: { participation: [part('s1', '2026-10-05', 3)], records: [rec('s1', '2026-10-05', 'negative', '<script>x</script>')] },
      meta,
      sectionRate: null,
    });
    const doc = classStudentDoc({ ...common, rep: evil, subjectScope: 'كل المواد' });
    const html = renderReportHtmlWith(doc, brand, '@font-face{font-family:Plex;}');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('@font-face{font-family:Plex;}');
    expect(html).toContain('dir="rtl"');
    expect(renderReportHtmlWith(doc, { ...brand, digits: 'arab' }, '')).toContain('٣'); // «شارك ×٣»
  });
});

describe('مستند تقرير الشعبة', () => {
  const roster: RosterEntry[] = [
    { studentId: 's1', rollNo: 1, fullName: 'أحمد', gender: 'male' },
    { studentId: 's2', rollNo: 2, fullName: 'فاطمة', gender: 'female' },
  ];
  const rows = {
    participation: [...['2026-10-01', '2026-10-02', '2026-10-05', '2026-10-06'].map((d) => part('s2', d, 0)), part('s1', '2026-10-05', 2)],
    records: [rec('s1', '2026-10-05', 'negative', 'حديث جانبي'), rec('s1', '2026-10-06', 'negative', 'إزعاج'), rec('s1', '2026-10-07', 'negative', 'نسيان الواجب')],
  };
  const sum = buildSummary({ section: { id: 'sec1', label: '10/3' }, assignment: A1, from: null, to: null, roster, rows, meta, recentLimit: 500 });

  it('جدول الطلاب بالمؤشرات، وورقة «الحصص» مستقلة، والاتجاه أفقي، واسم الملف بالفترة', () => {
    const doc = classSectionDoc({ ...common, sum });
    expect(doc).toMatchObject({ type: 'class-section', title: 'سجل المشاركة والسلوك الصفي', subtitle: 'العلوم — 10/3', landscape: true, filename: 'مشاركة-وسلوك-10-3-2026-08-23-2027-01-19' });
    const students = block(doc, 'table', 'الطلاب')!;
    const flags = (name: string) => JSON.stringify(students.rows.find((r) => r[1] === name));
    expect(flags('فاطمة')).toContain('لم يشارك مطلقًا'); // 4 حصص بلا مشاركة
    expect(flags('أحمد')).toContain('ملاحظات غير حسنة كثيرة'); // 3 غير حسنة
    const sheetAt = doc.blocks.findIndex((b) => b.type === 'sheet');
    expect(doc.blocks[sheetAt]).toEqual({ type: 'sheet', name: 'الحصص' });
    expect(doc.blocks.findIndex((b) => b.type === 'table' && b.title === 'الحصص المسجّلة')).toBeGreaterThan(sheetAt);
    expect(block(doc, 'table', 'الحصص المسجّلة')!.rows.length).toBe(sum.sessions);
  });

  it('«كل الفترات» في اسم الملف وفي البيانات الوصفية، وتنبيه عند اقتصار قائمة الحصص', () => {
    const doc = classSectionDoc({ ...common, range: { everything: true }, sum: { ...sum, sessions: sum.recent.length + 5 } });
    expect(doc.filename).toBe('مشاركة-وسلوك-10-3-كل-الفترات');
    expect(doc.meta[0]).toEqual({ label: 'الفترة', value: 'كل الفترات' });
    expect(block(doc, 'paragraph')!.text).toContain('عُرض أحدث');
  });

  it('المخرجات تُعرض HTML بأسماء الطلاب وتنبيهاتهم', () => {
    const html = renderReportHtmlWith(classSectionDoc({ ...common, sum }), brand, '');
    expect(html).toContain('فاطمة');
    expect(html).toContain('لم يشارك مطلقًا');
    expect(html).toContain('A4 landscape');
  });
});
