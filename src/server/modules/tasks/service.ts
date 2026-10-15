import { and, asc, desc, eq, gte, lte, ne, type SQL } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import type { CalendarItemDto, TaskDto } from '../../../shared/dto';
import { badRequest } from '../../lib/errors';
import { assignmentMap, requireAssignment, requireTask } from '../_shared/owned';

const { tasks, assessments, lessonPlans } = schema;

type TaskRow = typeof tasks.$inferSelect;

function toDto(t: TaskRow, labels: Map<string, string>): TaskDto {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    kind: t.kind,
    dueDate: t.dueDate,
    dueTime: t.dueTime,
    priority: t.priority,
    status: t.status,
    assignmentId: t.assignmentId,
    assignmentLabel: t.assignmentId ? labels.get(t.assignmentId) ?? null : null,
    completedAt: t.completedAt,
  };
}

function labelsFor(db: Db, ownerId: string, rows: TaskRow[]): Map<string, string> {
  const infos = assignmentMap(db, ownerId, rows.map((r) => r.assignmentId).filter((x): x is string => !!x));
  return new Map([...infos].map(([id, a]) => [id, `${a.subjectName} — ${a.sectionLabel}`]));
}

export function listTasks(db: Db, ownerId: string, f: { status?: TaskRow['status']; from?: string; to?: string; limit: number }): TaskDto[] {
  const conds: (SQL | undefined)[] = [eq(tasks.ownerId, ownerId)];
  if (f.status) conds.push(eq(tasks.status, f.status));
  if (f.from) conds.push(gte(tasks.dueDate, f.from));
  if (f.to) conds.push(lte(tasks.dueDate, f.to));
  const rows = db
    .select()
    .from(tasks)
    .where(and(...conds))
    .orderBy(asc(tasks.status), asc(tasks.dueDate), asc(tasks.dueTime), desc(tasks.createdAt))
    .limit(f.limit)
    .all();
  const labels = labelsFor(db, ownerId, rows);
  return rows.map((r) => toDto(r, labels));
}

export function getTask(db: Db, ownerId: string, id: string): TaskDto {
  const t = requireTask(db, ownerId, id);
  return toDto(t, labelsFor(db, ownerId, [t]));
}

type TaskInput = {
  title: string;
  description?: string | null;
  kind: TaskRow['kind'];
  dueDate?: string | null;
  dueTime?: string | null;
  priority: TaskRow['priority'];
  status: TaskRow['status'];
  assignmentId?: string | null;
};

export function createTask(db: Db, ownerId: string, input: TaskInput): TaskDto {
  if (input.assignmentId) requireAssignment(db, ownerId, input.assignmentId);
  if (input.dueTime && !input.dueDate) throw badRequest('حدّد التاريخ مع الوقت', 'TIME_WITHOUT_DATE', { dueDate: 'التاريخ مطلوب' });
  const row = db
    .insert(tasks)
    .values({
      ownerId,
      title: input.title,
      description: input.description ?? null,
      kind: input.kind,
      dueDate: input.dueDate ?? null,
      dueTime: input.dueTime ?? null,
      priority: input.priority,
      status: input.status,
      assignmentId: input.assignmentId ?? null,
      completedAt: input.status === 'done' ? new Date().toISOString() : null,
    })
    .returning()
    .get();
  return getTask(db, ownerId, row.id);
}

export function updateTask(db: Db, ownerId: string, id: string, input: Partial<TaskInput>): TaskDto {
  const current = requireTask(db, ownerId, id);
  if (input.assignmentId) requireAssignment(db, ownerId, input.assignmentId);
  const patch: Partial<typeof tasks.$inferInsert> = { ...input };
  if (input.status && input.status !== current.status) patch.completedAt = input.status === 'done' ? new Date().toISOString() : null;
  const dueDate = input.dueDate !== undefined ? input.dueDate : current.dueDate;
  const dueTime = input.dueTime !== undefined ? input.dueTime : current.dueTime;
  if (dueTime && !dueDate) throw badRequest('حدّد التاريخ مع الوقت', 'TIME_WITHOUT_DATE', { dueDate: 'التاريخ مطلوب' });
  db.update(tasks).set(patch).where(eq(tasks.id, id)).run();
  return getTask(db, ownerId, id);
}

export function deleteTask(db: Db, ownerId: string, id: string): void {
  requireTask(db, ownerId, id);
  db.delete(tasks).where(eq(tasks.id, id)).run();
}

/** التقويم الدراسي: دمج المهام والاختبارات/التقويمات والتحضيرات في خط زمني واحد */
export function calendar(db: Db, ownerId: string, from: string, to: string): CalendarItemDto[] {
  const items: CalendarItemDto[] = [];

  const taskRows = db
    .select()
    .from(tasks)
    .where(and(eq(tasks.ownerId, ownerId), gte(tasks.dueDate, from), lte(tasks.dueDate, to)))
    .all();
  const labels = labelsFor(db, ownerId, taskRows);
  for (const t of taskRows) {
    items.push({
      id: `task:${t.id}`,
      type: 'task',
      date: t.dueDate!,
      time: t.dueTime,
      title: t.title,
      subtitle: t.assignmentId ? labels.get(t.assignmentId) ?? null : null,
      tone: t.status === 'done' ? 'good' : t.priority === 'high' ? 'bad' : t.kind === 'exam' ? 'warn' : 'info',
      done: t.status === 'done',
      href: '/tasks',
    });
  }

  const asmRows = db
    .select()
    .from(assessments)
    .where(and(eq(assessments.ownerId, ownerId), gte(assessments.date, from), lte(assessments.date, to)))
    .all();
  const lessonRows = db
    .select()
    .from(lessonPlans)
    .where(and(eq(lessonPlans.ownerId, ownerId), eq(lessonPlans.isTemplate, false), gte(lessonPlans.date, from), lte(lessonPlans.date, to), ne(lessonPlans.title, '')))
    .all();
  const infos = assignmentMap(db, ownerId, [...asmRows.map((a) => a.assignmentId), ...lessonRows.map((l) => l.assignmentId)]);

  for (const a of asmRows) {
    const info = infos.get(a.assignmentId);
    if (!info) continue;
    items.push({
      id: `assessment:${a.id}`,
      type: 'assessment',
      date: a.date!,
      time: null,
      title: a.title,
      subtitle: `${info.subjectName} — ${info.sectionLabel}`,
      tone: 'warn',
      done: false,
      href: `/assessments/${a.assignmentId}?term=${a.termId}`,
    });
  }
  for (const l of lessonRows) {
    const info = infos.get(l.assignmentId);
    if (!info) continue;
    items.push({
      id: `lesson:${l.id}`,
      type: 'lesson',
      date: l.date,
      time: null,
      title: l.title,
      subtitle: `${info.subjectName} — ${info.sectionLabel}${l.period ? ` · الحصة ${l.period}` : ''}`,
      tone: l.status === 'delivered' ? 'good' : l.status === 'ready' ? 'info' : 'neutral',
      done: l.status === 'delivered',
      href: `/lessons/${l.id}`,
    });
  }
  return items.sort((a, b) => (a.date === b.date ? (a.time ?? '') < (b.time ?? '') ? -1 : 1 : a.date < b.date ? -1 : 1));
}
