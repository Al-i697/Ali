import { z } from 'zod';
import { BAND_TONES, DIGITS_PREF, MAX_PERIODS, THEME_PREF, WEEKDAYS } from '../constants';
import { validateBands } from '../gradebook';
import { optText, requiredText, timeSchema } from './common';
import { timeToMinutes } from '../dates';

export const profileSchema = z.object({
  fullName: requiredText().optional(),
  schoolName: optText(200),
  directorate: optText(200),
  jobTitle: optText(120),
  specialization: optText(120),
  seniorTeacherName: optText(120),
  principalName: optText(120),
});

export const preferencesSchema = z.object({
  theme: z.enum(THEME_PREF.values).optional(),
  digits: z.enum(DIGITS_PREF.values).optional(),
});

export const gradingSchema = z
  .object({
    bands: z
      .array(
        z.object({
          min: z.number().min(0).max(100),
          label: requiredText(40),
          tone: z.enum(BAND_TONES),
        }),
      )
      .min(2)
      .max(8),
    remedialBelow: z.number().min(0).max(100),
    enrichmentFrom: z.number().min(0).max(100),
    passFrom: z.number().min(0).max(100),
  })
  .superRefine((g, ctx) => {
    const err = validateBands(g.bands);
    if (err) ctx.addIssue({ code: 'custom', message: err, path: ['bands'] });
    if (g.enrichmentFrom <= g.remedialBelow)
      ctx.addIssue({
        code: 'custom',
        message: 'حد الإثراء يجب أن يكون أعلى من حد العلاج',
        path: ['enrichmentFrom'],
      });
  });

export const scheduleSchema = z
  .object({
    workDays: z
      .array(z.number().int().min(0).max(6))
      .min(1, 'اختر يوم عمل واحدًا على الأقل')
      .max(WEEKDAYS.length),
    periods: z
      .array(z.object({ n: z.number().int().min(1).max(MAX_PERIODS), start: timeSchema, end: timeSchema }))
      .min(1)
      .max(MAX_PERIODS),
  })
  .superRefine((s, ctx) => {
    s.periods.forEach((p, i) => {
      if (timeToMinutes(p.end) <= timeToMinutes(p.start))
        ctx.addIssue({ code: 'custom', message: 'نهاية الحصة يجب أن تكون بعد بدايتها', path: ['periods', i, 'end'] });
      if (p.n !== i + 1)
        ctx.addIssue({ code: 'custom', message: 'ترقيم الحصص يجب أن يكون متسلسلًا', path: ['periods', i, 'n'] });
    });
  });

export const updateSettingsSchema = z.object({
  profile: profileSchema.optional(),
  preferences: preferencesSchema.optional(),
  grading: gradingSchema.optional(),
  schedule: scheduleSchema.optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
