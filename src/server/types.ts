import type { AppConfig } from './config';
import type { AppDatabase } from './db/client';
import type { UserRole } from '../shared/constants';
import type { PdfService } from './reports/pdf';
import type { BackupService } from './modules/backup/service';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isDemo: boolean;
  mustChangePassword: boolean;
};

export type AuthContext = { user: AuthUser; sessionId: string };

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
    db: AppDatabase;
    pdf: PdfService;
    backups: BackupService;
  }
  interface FastifyRequest {
    auth: AuthContext | null;
  }
  interface FastifyContextConfig {
    /** مسار عام لا يتطلب تسجيل دخول */
    public?: boolean;
    /** الأدوار المسموح لها (الافتراضي: أي مستخدم مسجّل) */
    roles?: UserRole[];
    /** يسمح للمستخدم المُلزَم بتغيير كلمة المرور بالوصول */
    allowMustChange?: boolean;
  }
}
