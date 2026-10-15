// سجل المختبر والأنشطة: تجربة/عرض/نشاط/مشروع/زيارة تُخطَّط أولًا (مخطَّط) ثم يُسجَّل تنفيذها ونتائجها وعدد المشاركين،
// وتُنسخ خطتها إلى شعب وتواريخ أخرى دون إعادة كتابة. لا يُسجَّل «نُفِّذ» لتاريخ لم يحن بعد: السجل وثيقة.
import { and, asc, desc, eq, gte, lt, lte, ne, sql, type SQL } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { normalizeArabic } from '../../../shared/arabic';
import type { LabKind, LabStatus } from '../../../shared/constants';
import { LAB_KIND } from '../../../shared/constants';
import { todayISO } from '../../../shared/dates';
import type { AssignmentDto, CalendarItemDto, LabActivitiesPage, LabActivityDto, LabActivitySummaryDto, LabStats } from '../../../shared/dto';
import type { CopyLabActivityInput, CreateLabActivityInput, UpdateLabActivityInput } from '../../../shared/schemas/lab';
import { badRequest } from '../../lib/errors';
import { likeContains } from '../../lib/sql';
import { assignmentMap, requireAssignment, requireLabActivity } from '../_shared/owned';

const { labActivities, assignments } = schema;

type LabRow = typeof labActivities.$inferSelect;

const searchTextOf = (title: string, location: string | null | undefined, materials: readonly string[]) =>
  normalizeArabic(`${title} ${location ?? ''} ${materials.join(' ')}`);

function toSummary(l: LabRow, a: AssignmentDto | undefined, today: string): LabActivitySummaryDto {
  return {
    id: l.id,
    assignmentId: l.assignmentId,
    sectionLabel: a?.sectionLabel ?? null,
    subjectName: a?.subjectName ?? null,
    subjectColor: a?.subjectColor ?? null,
    date: l.date,
    period: l.period,
    kind: l.kind,
    title: l.title,
    location: l.location,
    status: l.status,
    participants: l.participants,
    overdue: l.status === 'planned' && l.date < today,
    updatedAt: l.updatedAt,
  };
}

function toDto(l: LabRow, a: AssignmentDto | undefined, today: string): LabActivityDto {
  return {
    ...toSummary(l, a, today),
    objectives: l.objectives,
    materials: l.materials,
    safety: l.safety,
    procedure: l.procedure,
    results: l.results,
    notes: l.notes,
    sourceId: l.sourceId,
    createdAt: l.createdAt,
  };
}

/** «نُفِّذ» لا يصح لتاريخ مستقبلي — يمنع تدوين تنفيذ لم يحدث بعد */
function assertDoneNotFuture(status: LabStatus, date: string, today: string): void {
  if (status === 'done' && date > today) {
    throw badRequest('لا يمكن تسجيل «نُفِّذ» لنشاط تاريخه لم يحن بعد. عدّل التاريخ أو أبقِه «مخطَّطًا».', 'FUTURE_DONE', { date: 'تاريخ مستقبلي' });
  }
}

// ───────────── القراءة ─────────────
export type LabFilter = {
  from?: string;
  to?: string;
  assignmentId?: string;
  sectionId?: string;
  subjectId?: string;
  kind?: LabKind;
  status?: LabStatus;
  view?: 'overdue';
  q?: string;
  limit: number;
  offset: number;
};

/** شروط التصفية المشتركة بين القائمة والإحصاءات (عدا الحالة والعرض) */
function baseConds(ownerId: string, f: LabFilter): SQL[] {
  const conds: SQL[] = [eq(labActivities.ownerId, ownerId)];
  if (f.from) conds.push(gte(labActivities.date, f.from));
  if (f.to) conds.push(lte(labActivities.date, f.to));
  if (f.assignmentId) conds.push(eq(labActivities.assignmentId, f.assignmentId));
  if (f.sectionId) conds.push(eq(assignments.sectionId, f.sectionId));
  if (f.subjectId) conds.push(eq(assignments.subjectId, f.subjectId));
  if (f.kind) conds.push(eq(labActivities.kind, f.kind));
  if (f.q) {
    for (const token of normalizeArabic(f.q).split(' ').filter(Boolean).slice(0, 5)) conds.push(likeContains(labActivities.searchText, token));
  }
  return conds;
}

export function listLab(db: Db, ownerId: string, f: LabFilter, today: string = todayISO()): LabActivitiesPage {
  const base = baseConds(ownerId, f);
  const listConds = [...base];
  if (f.status) listConds.push(eq(labActivities.status, f.status));
  if (f.view === 'overdue') listConds.push(eq(labActivities.status, 'planned'), lt(labActivities.date, today));
  const where = and(...listConds);

  const rows = db
    .select({ l: labActivities })
    .from(labActivities)
    .leftJoin(assignments, eq(assignments.id, labActivities.assignmentId))
    .where(where)
    .orderBy(desc(labActivities.date), asc(sql`coalesce(${labActivities.period}, 99)`), asc(labActivities.createdAt))
    .limit(f.limit)
    .offset(f.offset)
    .all();
  const total =
    db
      .select({ c: sql<number>`count(*)` })
      .from(labActivities)
      .leftJoin(assignments, eq(assignments.id, labActivities.assignmentId))
      .where(where)
      .get()?.c ?? 0;

  const stats: LabStats = { planned: 0, done: 0, cancelled: 0, overdue: 0, participants: 0 };
  const grouped = db
    .select({
      status: labActivities.status,
      n: sql<number>`count(*)`,
      overdue: sql<number>`coalesce(sum(case when ${labActivities.status} = 'planned' and ${labActivities.date} < ${today} then 1 else 0 end), 0)`,
      participants: sql<number>`coalesce(sum(case when ${labActivities.status} = 'done' then coalesce(${labActivities.participants}, 0) else 0 end), 0)`,
    })
    .from(labActivities)
    .leftJoin(assignments, eq(assignments.id, labActivities.assignmentId))
    .where(and(...base))
    .groupBy(labActivities.status)
    .all();
  for (const g of grouped) {
    stats[g.status] = g.n;
    stats.overdue += g.overdue;
    stats.participants += g.participants;
  }

  const infos = assignmentMap(db, ownerId, rows.flatMap((r) => (r.l.assignmentId ? [r.l.assignmentId] : [])));
  return { total, stats, items: rows.map((r) => toSummary(r.l, r.l.assignmentId ? infos.get(r.l.assignmentId) : undefined, today)) };
}

export function getLab(db: Db, ownerId: string, id: string, today: string = todayISO()): LabActivityDto {
  const l = requireLabActivity(db, ownerId, id);
  return toDto(l, l.assignmentId ? requireAssignment(db, ownerId, l.assignmentId) : undefined, today);
}

// ───────────── الكتابة ─────────────
export function createLab(db: Db, ownerId: string, input: CreateLabActivityInput, today: string = todayISO()): LabActivityDto {
  const asg = input.assignmentId ? requireAssignment(db, ownerId, input.assignmentId) : undefined;
  const status = input.status ?? 'planned';
  assertDoneNotFuture(status, input.date, today);
  const materials = input.materials ?? [];
  const row = db
    .insert(labActivities)
    .values({
      ownerId,
      assignmentId: asg?.id ?? null,
      date: input.date,
      period: input.period ?? null,
      kind: input.kind ?? 'experiment',
      title: input.title,
      searchText: searchTextOf(input.title, input.location, materials),
      location: input.location ?? null,
      objectives: input.objectives ?? [],
      materials,
      safety: input.safety ?? [],
      procedure: input.procedure ?? null,
      results: input.results ?? null,
      participants: input.participants ?? null,
      notes: input.notes ?? null,
      status,
    })
    .returning()
    .get();
  return toDto(row, asg, today);
}

export function updateLab(db: Db, ownerId: string, id: string, input: UpdateLabActivityInput, today: string = todayISO()): LabActivityDto {
  const cur = requireLabActivity(db, ownerId, id);
  const patch: Partial<typeof labActivities.$inferInsert> = {};

  if (input.assignmentId !== undefined && input.assignmentId !== cur.assignmentId) {
    patch.assignmentId = input.assignmentId ? requireAssignment(db, ownerId, input.assignmentId).id : null;
  }
  // الحارس يُطبَّق عند تغيير الحالة أو التاريخ فقط، فلا يمنع تعديل حقول نشاط قديم
  if (input.status !== undefined || input.date !== undefined) assertDoneNotFuture(input.status ?? cur.status, input.date ?? cur.date, today);

  const copy = ['date', 'period', 'kind', 'title', 'location', 'objectives', 'materials', 'safety', 'procedure', 'results', 'participants', 'notes', 'status'] as const;
  for (const key of copy) {
    if (input[key] !== undefined) (patch as Record<string, unknown>)[key] = input[key];
  }
  if (input.title !== undefined || input.location !== undefined || input.materials !== undefined) {
    patch.searchText = searchTextOf(
      input.title ?? cur.title,
      input.location !== undefined ? input.location : cur.location,
      input.materials ?? cur.materials,
    );
  }
  if (Object.keys(patch).length) db.update(labActivities).set(patch).where(eq(labActivities.id, id)).run();
  return getLab(db, ownerId, id, today);
}

export function deleteLab(db: Db, ownerId: string, id: string): void {
  requireLabActivity(db, ownerId, id);
  db.delete(labActivities).where(and(eq(labActivities.id, id), eq(labActivities.ownerId, ownerId))).run();
}

/**
 * نسخ الخطة إلى وجهات متعددة (شعب/تواريخ) كأنشطة «مخطَّطة» جديدة، في معاملة واحدة.
 * ما يخص التنفيذ الفعلي (النتائج، المشاركون، الملاحظات) لا يُنسخ لأنه يخص الحصة الأصلية.
 */
export function copyLab(db: Db, ownerId: string, id: string, input: CopyLabActivityInput, today: string = todayISO()): LabActivitySummaryDto[] {
  const src = requireLabActivity(db, ownerId, id);
  const created: LabRow[] = [];
  db.transaction((tx) => {
    for (const t of input.targets) {
      const asg = t.assignmentId ? requireAssignment(tx as unknown as Db, ownerId, t.assignmentId) : undefined;
      created.push(
        tx
          .insert(labActivities)
          .values({
            ownerId,
            assignmentId: asg?.id ?? null,
            date: t.date,
            period: t.period ?? null,
            kind: src.kind,
            title: src.title,
            searchText: src.searchText,
            location: src.location,
            objectives: src.objectives,
            materials: src.materials,
            safety: src.safety,
            procedure: src.procedure,
            results: null,
            participants: null,
            notes: null,
            status: 'planned',
            sourceId: src.id,
          })
          .returning()
          .get(),
      );
    }
  });
  const infos = assignmentMap(db, ownerId, created.flatMap((c) => (c.assignmentId ? [c.assignmentId] : [])));
  return created.map((c) => toSummary(c, c.assignmentId ? infos.get(c.assignmentId) : undefined, today));
}

// ───────────── تكامل مع لوحة التحكم والتقويم ─────────────
/** القادمة (اليوم فما بعد) + عدد ما فات موعده دون تسجيل تنفيذه ضمن العام الدراسي الحالي */
export function dashboardLab(db: Db, ownerId: string, today: string, yearStart?: string | null): { upcoming: LabActivitySummaryDto[]; overdue: number; total: number } {
  const upcomingRows = db
    .select()
    .from(labActivities)
    .where(and(eq(labActivities.ownerId, ownerId), eq(labActivities.status, 'planned'), gte(labActivities.date, today)))
    .orderBy(asc(labActivities.date), asc(sql`coalesce(${labActivities.period}, 99)`))
    .limit(5)
    .all();
  const overdueConds = [eq(labActivities.ownerId, ownerId), eq(labActivities.status, 'planned'), lt(labActivities.date, today)];
  if (yearStart) overdueConds.push(gte(labActivities.date, yearStart));
  const overdue = db.select({ c: sql<number>`count(*)` }).from(labActivities).where(and(...overdueConds)).get()?.c ?? 0;
  const total = db.select({ c: sql<number>`count(*)` }).from(labActivities).where(eq(labActivities.ownerId, ownerId)).get()?.c ?? 0;
  const infos = assignmentMap(db, ownerId, upcomingRows.flatMap((r) => (r.assignmentId ? [r.assignmentId] : [])));
  return { upcoming: upcomingRows.map((r) => toSummary(r, r.assignmentId ? infos.get(r.assignmentId) : undefined, today)), overdue, total };
}

/** أنشطة المختبر ضمن نطاق تاريخ (عدا الملغاة) — تظهر في التقويم الدراسي */
export function calendarItems(db: Db, ownerId: string, from: string, to: string, today: string = todayISO()): CalendarItemDto[] {
  const rows = db
    .select()
    .from(labActivities)
    .where(and(eq(labActivities.ownerId, ownerId), ne(labActivities.status, 'cancelled'), gte(labActivities.date, from), lte(labActivities.date, to)))
    .all();
  if (!rows.length) return [];
  const infos = assignmentMap(db, ownerId, rows.flatMap((r) => (r.assignmentId ? [r.assignmentId] : [])));
  return rows.map((r) => {
    const a = r.assignmentId ? infos.get(r.assignmentId) : undefined;
    const where = a ? `${a.subjectName} — ${a.sectionLabel}` : 'نشاط عام';
    return {
      id: `lab:${r.id}`,
      type: 'lab' as const,
      date: r.date,
      time: null,
      title: r.title,
      subtitle: `${LAB_KIND.labels[r.kind]} · ${where}${r.period ? ` · الحصة ${r.period}` : ''}`,
      tone: r.status === 'done' ? ('good' as const) : r.date < today ? ('bad' as const) : ('info' as const),
      done: r.status === 'done',
      href: `/lab?open=${r.id}`,
    };
  });
}
