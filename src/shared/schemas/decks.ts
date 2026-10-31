import { z } from 'zod';
import { DECK_LIMITS } from '../constants';
import { idSchema, optText, requiredText } from './common';

const deckFields = {
  title: requiredText(DECK_LIMITS.title),
  description: optText(DECK_LIMITS.description),
  subjectId: idSchema.nullable().optional(),
};

/** حقول نموذج الرفع (مع ملف HTML في الطلب نفسه multipart) */
export const createDeckSchema = z.object(deckFields);
export const updateDeckSchema = z.object(deckFields).partial();

export const decksQuery = z.object({
  q: z.string().trim().max(100).optional(),
  subjectId: idSchema.optional(),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
