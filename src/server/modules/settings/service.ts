import { eq } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { DEFAULT_GRADING, DEFAULT_SCHEDULE } from '../../../shared/constants';
import type { SettingsDto } from '../../../shared/dto';
import type { UpdateSettingsInput } from '../../../shared/schemas/settings';
import { notFound } from '../../lib/errors';

const { users, userSettings } = schema;

function ensureRow(db: Db, userId: string) {
  let row = db.select().from(userSettings).where(eq(userSettings.userId, userId)).get();
  if (!row) {
    db.insert(userSettings).values({ userId }).run();
    row = db.select().from(userSettings).where(eq(userSettings.userId, userId)).get();
  }
  return row!;
}

export function getSettings(db: Db, userId: string): SettingsDto {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) throw notFound('المستخدم');
  const s = ensureRow(db, userId);
  return {
    profile: {
      fullName: user.fullName,
      email: user.email,
      schoolName: s.schoolName,
      directorate: s.directorate,
      jobTitle: s.jobTitle,
      specialization: s.specialization,
      seniorTeacherName: s.seniorTeacherName,
      principalName: s.principalName,
    },
    preferences: { theme: s.theme, digits: s.digits },
    grading: s.grading ?? DEFAULT_GRADING,
    schedule: s.schedule ?? DEFAULT_SCHEDULE,
  };
}

export function updateSettings(db: Db, userId: string, input: UpdateSettingsInput): SettingsDto {
  ensureRow(db, userId);
  db.transaction((tx) => {
    const { profile, preferences, grading, schedule } = input;
    if (profile?.fullName) {
      tx.update(users).set({ fullName: profile.fullName }).where(eq(users.id, userId)).run();
    }
    const patch: Partial<typeof userSettings.$inferInsert> = {};
    if (profile) {
      if (profile.schoolName !== undefined) patch.schoolName = profile.schoolName;
      if (profile.directorate !== undefined) patch.directorate = profile.directorate;
      if (profile.jobTitle !== undefined) patch.jobTitle = profile.jobTitle;
      if (profile.specialization !== undefined) patch.specialization = profile.specialization;
      if (profile.seniorTeacherName !== undefined) patch.seniorTeacherName = profile.seniorTeacherName;
      if (profile.principalName !== undefined) patch.principalName = profile.principalName;
    }
    if (preferences?.theme) patch.theme = preferences.theme;
    if (preferences?.digits) patch.digits = preferences.digits;
    if (grading) patch.grading = { ...grading, bands: [...grading.bands].sort((a, b) => b.min - a.min) };
    if (schedule) patch.schedule = schedule;
    if (Object.keys(patch).length > 0) {
      tx.update(userSettings).set(patch).where(eq(userSettings.userId, userId)).run();
    }
  });
  return getSettings(db, userId);
}
