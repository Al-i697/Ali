import { and, count, desc, eq } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { DECK_LIMITS } from '../../../shared/constants';
import type { DeckDto } from '../../../shared/dto';
import { normalizeArabic } from '../../../shared/arabic';
import type { CreateDeckInput, UpdateDeckInput } from '../../../shared/schemas/decks';
import { AppError, badRequest, conflict } from '../../lib/errors';
import { likeContains } from '../../lib/sql';
import { requireDeck, requireSubject } from '../_shared/owned';

const { interactiveDecks, interactiveDeckFiles, subjects } = schema;

type DeckRow = typeof interactiveDecks.$inferSelect;

function toDto(d: DeckRow, subjectName: string | null): DeckDto {
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    subjectId: d.subjectId,
    subjectName,
    bytes: d.bytes,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

/** يقبل صفحات HTML كاملة أو أجزاءً منها (منصات العرض تضيف html/head/body)، ويرفض ما سواها */
const LOOKS_LIKE_HTML = /<\s*(?:!doctype\s+html|html|head|body|main|section|div|style|script|svg|canvas)\b/i;

/**
 * يحوّل ملفًا مرفوعًا إلى نص HTML صالح: UTF-8 صحيح (دون BOM) وحجم ضمن الحد وشكل صفحة.
 * المحتوى لا يُفسَّر هنا ولا يُنفَّذ أبدًا في سياق التطبيق: يُعرض في إطار معزول (انظر routes.ts).
 */
export function readDeckHtml(buffer: Buffer, filename: string | undefined): string {
  if (filename && !/\.html?$/i.test(filename)) throw badRequest('الملف يجب أن يكون صفحة HTML (امتداد html أو htm)', 'DECK_NOT_HTML');
  if (buffer.length === 0) throw badRequest('الملف فارغ', 'DECK_EMPTY');
  if (buffer.length > DECK_LIMITS.maxBytes) throw new AppError(413, 'TOO_LARGE', `حجم الدرس أكبر من ${DECK_LIMITS.maxBytes / (1024 * 1024)} ميغابايت`);
  let html: string;
  try {
    html = new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(buffer);
  } catch {
    throw badRequest('ترميز الملف غير مدعوم. احفظه بترميز UTF-8', 'DECK_ENCODING');
  }
  if (html.charCodeAt(0) === 0xfeff) html = html.slice(1);
  if (!LOOKS_LIKE_HTML.test(html.slice(0, 200_000))) throw badRequest('الملف لا يبدو صفحة HTML', 'DECK_NOT_HTML');
  return html;
}

export function listDecks(db: Db, ownerId: string, f: { q?: string; subjectId?: string } = {}): DeckDto[] {
  const conds = [eq(interactiveDecks.ownerId, ownerId)];
  if (f.subjectId) conds.push(eq(interactiveDecks.subjectId, f.subjectId));
  for (const token of normalizeArabic(f.q ?? '').split(' ').filter(Boolean).slice(0, 5)) conds.push(likeContains(interactiveDecks.searchText, token));
  return db
    .select({ deck: interactiveDecks, subjectName: subjects.name })
    .from(interactiveDecks)
    .leftJoin(subjects, eq(subjects.id, interactiveDecks.subjectId))
    .where(and(...conds))
    .orderBy(desc(interactiveDecks.createdAt))
    .all()
    .map((r) => toDto(r.deck, r.subjectName));
}

function subjectNameOf(db: Db, ownerId: string, subjectId: string | null): string | null {
  return subjectId ? requireSubject(db, ownerId, subjectId).name : null;
}

export function getDeck(db: Db, ownerId: string, id: string): DeckDto {
  const d = requireDeck(db, ownerId, id);
  return toDto(d, subjectNameOf(db, ownerId, d.subjectId));
}

export function createDeck(db: Db, ownerId: string, input: CreateDeckInput, html: string): DeckDto {
  const subjectName = subjectNameOf(db, ownerId, input.subjectId ?? null);
  const bytes = Buffer.byteLength(html, 'utf8');
  return db.transaction((tx) => {
    const owned = tx.select({ n: count() }).from(interactiveDecks).where(eq(interactiveDecks.ownerId, ownerId)).get()?.n ?? 0;
    if (owned >= DECK_LIMITS.maxPerOwner) throw conflict(`بلغت الحد الأقصى (${DECK_LIMITS.maxPerOwner} درسًا). احذف دروسًا لا تحتاجها`, 'DECK_LIMIT');
    const row = tx
      .insert(interactiveDecks)
      .values({
        ownerId,
        subjectId: input.subjectId ?? null,
        title: input.title,
        searchText: normalizeArabic(input.title),
        description: input.description ?? null,
        bytes,
      })
      .returning()
      .get();
    tx.insert(interactiveDeckFiles).values({ deckId: row.id, html }).run();
    return toDto(row, subjectName);
  });
}

export function updateDeck(db: Db, ownerId: string, id: string, input: UpdateDeckInput): DeckDto {
  const current = requireDeck(db, ownerId, id);
  const patch: Partial<typeof interactiveDecks.$inferInsert> = {};
  if (input.title !== undefined) {
    patch.title = input.title;
    patch.searchText = normalizeArabic(input.title);
  }
  if (input.description !== undefined) patch.description = input.description;
  if (input.subjectId !== undefined) {
    if (input.subjectId) requireSubject(db, ownerId, input.subjectId);
    patch.subjectId = input.subjectId;
  }
  const row = Object.keys(patch).length
    ? db.update(interactiveDecks).set(patch).where(and(eq(interactiveDecks.id, id), eq(interactiveDecks.ownerId, ownerId))).returning().get()
    : current;
  return toDto(row, subjectNameOf(db, ownerId, row.subjectId));
}

/** يستبدل صفحة الدرس بنسخة جديدة ويبقي عنوانه وروابطه */
export function replaceDeckHtml(db: Db, ownerId: string, id: string, html: string): DeckDto {
  const current = requireDeck(db, ownerId, id);
  const subjectName = subjectNameOf(db, ownerId, current.subjectId);
  const bytes = Buffer.byteLength(html, 'utf8');
  return db.transaction((tx) => {
    tx.update(interactiveDeckFiles).set({ html }).where(eq(interactiveDeckFiles.deckId, id)).run();
    const row = tx.update(interactiveDecks).set({ bytes }).where(and(eq(interactiveDecks.id, id), eq(interactiveDecks.ownerId, ownerId))).returning().get();
    return toDto(row, subjectName);
  });
}

export function deleteDeck(db: Db, ownerId: string, id: string): void {
  requireDeck(db, ownerId, id);
  db.delete(interactiveDecks).where(and(eq(interactiveDecks.id, id), eq(interactiveDecks.ownerId, ownerId))).run();
}

export function getDeckHtml(db: Db, ownerId: string, id: string): { title: string; html: string } {
  const d = requireDeck(db, ownerId, id);
  const file = db.select({ html: interactiveDeckFiles.html }).from(interactiveDeckFiles).where(eq(interactiveDeckFiles.deckId, id)).get();
  if (!file) throw badRequest('صفحة الدرس غير موجودة. ارفعها من جديد', 'DECK_FILE_MISSING');
  return { title: d.title, html: file.html };
}
