// سجل الوحدات: لإضافة وحدة جديدة (مثل «الخطط العلاجية») أنشئ مجلدًا في modules/ بملف routes.ts
// يصدّر FastifyPluginAsync ثم أضفه هنا. انظر docs/ADDING-A-MODULE.md
import type { FastifyPluginAsync } from 'fastify';
import { academicModule } from './academic/routes';
import { assessmentsModule } from './assessments/routes';
import { auditModule } from './audit/routes';
import { authModule } from './auth/routes';
import { backupModule } from './backup/routes';
import { dashboardModule } from './dashboard/routes';
import { lessonsModule } from './lessons/routes';
import { reportsModule } from './reports/routes';
import { settingsModule } from './settings/routes';
import { studentsModule } from './students/routes';
import { tasksModule } from './tasks/routes';
import { timetableModule } from './timetable/routes';
import { usersModule } from './users/routes';

const modules: FastifyPluginAsync[] = [
  authModule,
  usersModule,
  settingsModule,
  academicModule,
  studentsModule,
  assessmentsModule,
  timetableModule,
  lessonsModule,
  tasksModule,
  dashboardModule,
  reportsModule,
  backupModule,
  auditModule,
];

export const registerModules: FastifyPluginAsync = async (app) => {
  for (const mod of modules) await app.register(mod);
};
