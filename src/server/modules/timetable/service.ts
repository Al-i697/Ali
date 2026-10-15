import { and, asc, eq } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import type { SlotDto } from '../../../shared/dto';
import { badRequest } from '../../lib/errors';
import { assignmentMap, requireAssignment, requireYear } from '../_shared/owned';

const { timetableSlots } = schema;

export function getTimetable(db: Db, ownerId: string, yearId: string): SlotDto[] {
  requireYear(db, ownerId, yearId);
  const rows = db
    .select()
    .from(timetableSlots)
    .where(and(eq(timetableSlots.ownerId, ownerId), eq(timetableSlots.yearId, yearId)))
    .orderBy(asc(timetableSlots.weekday), asc(timetableSlots.period))
    .all();
  const infos = assignmentMap(db, ownerId, rows.map((r) => r.assignmentId));
  return rows.flatMap((r) => {
    const assignment = infos.get(r.assignmentId);
    return assignment
      ? [{ id: r.id, yearId: r.yearId, weekday: r.weekday, period: r.period, room: r.room, assignment }]
      : [];
  });
}

/** يضع مقررًا في خانة (يوم × حصة) أو يفرغها عند assignmentId = null */
export function setSlot(
  db: Db,
  ownerId: string,
  input: { yearId: string; weekday: number; period: number; assignmentId: string | null; room?: string | null },
): SlotDto | null {
  requireYear(db, ownerId, input.yearId);
  const existing = db
    .select()
    .from(timetableSlots)
    .where(
      and(
        eq(timetableSlots.ownerId, ownerId),
        eq(timetableSlots.yearId, input.yearId),
        eq(timetableSlots.weekday, input.weekday),
        eq(timetableSlots.period, input.period),
      ),
    )
    .get();

  if (input.assignmentId === null) {
    if (existing) db.delete(timetableSlots).where(eq(timetableSlots.id, existing.id)).run();
    return null;
  }

  const assignment = requireAssignment(db, ownerId, input.assignmentId);
  if (assignment.yearId !== input.yearId) throw badRequest('المقرر لا يتبع العام الدراسي المحدد');

  const id = existing
    ? db
        .update(timetableSlots)
        .set({ assignmentId: input.assignmentId, room: input.room ?? existing.room })
        .where(eq(timetableSlots.id, existing.id))
        .returning()
        .get().id
    : db
        .insert(timetableSlots)
        .values({
          ownerId,
          yearId: input.yearId,
          assignmentId: input.assignmentId,
          weekday: input.weekday,
          period: input.period,
          room: input.room ?? null,
        })
        .returning()
        .get().id;
  return getTimetable(db, ownerId, input.yearId).find((s) => s.id === id)!;
}
