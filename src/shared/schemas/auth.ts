import { z } from 'zod';
import { USER_ROLE, USER_STATUS } from '../constants';
import { requiredText } from './common';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ error: 'البريد الإلكتروني غير صالح' }));

const COMMON_PASSWORDS = new Set([
  '12345678',
  '123456789',
  '1234567890',
  '11111111',
  '00000000',
  'password',
  'password1',
  'password123',
  'qwertyui',
  'qwerty123',
  'abcd1234',
  'iloveyou',
  'admin123',
  'admin1234',
  'sijilli123',
  'teacher123',
  'oman1234',
]);

export const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف')
  .max(128, 'كلمة المرور طويلة جدًا')
  .refine((p) => !/^\d+$/.test(p), 'يجب ألا تتكوّن كلمة المرور من أرقام فقط')
  .refine((p) => !COMMON_PASSWORDS.has(p.toLowerCase()), 'كلمة المرور شائعة وسهلة التخمين');

export const setupSchema = z.object({
  fullName: requiredText(),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  remember: z.boolean().optional().default(false),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const createUserSchema = z.object({
  fullName: requiredText(),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(USER_ROLE.values).default('teacher'),
});

export const updateUserSchema = z.object({
  fullName: requiredText().optional(),
  role: z.enum(USER_ROLE.values).optional(),
  status: z.enum(USER_STATUS.values).optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export type SetupInput = z.infer<typeof setupSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateUserInput = z.input<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
