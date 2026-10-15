// يولّد docs/API.md من المسارات المسجّلة فعليًا (حتى لا يتقادم التوثيق):  npm run docs:api
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { RouteOptions } from 'fastify';
import { buildApp } from '../src/server/app';
import { loadConfig } from '../src/server/config';
import { AppDatabase } from '../src/server/db/client';

type Row = { method: string; url: string; access: string };
const rows: Row[] = [];

const config = loadConfig({ NODE_ENV: 'test', DATA_DIR: path.join(os.tmpdir(), 'sijilli-docs-unused') });
const db = AppDatabase.open(':memory:');
db.migrate(config.migrationsDir);
const app = await buildApp({
  config,
  db,
  onRoute: (r: RouteOptions) => {
    if (!r.url.startsWith('/api/') || r.url === '/api/*') return;
    const cfg = (r.config ?? {}) as { public?: boolean; roles?: string[]; allowMustChange?: boolean };
    const access = cfg.public ? 'عام' : cfg.roles?.includes('admin') ? 'المدير فقط' : 'مسجَّل الدخول';
    for (const method of ([] as string[]).concat(r.method as string | string[])) {
      if (method !== 'HEAD' && method !== 'OPTIONS') rows.push({ method, url: r.url, access });
    }
  },
});
await app.ready();
await app.close();

const GROUPS: [string, string][] = [
  ['auth', 'المصادقة والجلسات'],
  ['users', 'إدارة المستخدمين'],
  ['settings', 'الإعدادات'],
  ['years', 'الأعوام والفصول'],
  ['terms', 'الأعوام والفصول'],
  ['subjects', 'المواد'],
  ['sections', 'الشعب'],
  ['assignments', 'المقررات (شعبة × مادة)'],
  ['students', 'الطلاب'],
  ['notes', 'ملاحظات الطلاب'],
  ['timetable', 'الجدول الأسبوعي'],
  ['lessons', 'التحضير'],
  ['skills', 'المهارات'],
  ['assessments', 'التقويم المستمر'],
  ['gradebook', 'التقويم المستمر'],
  ['tasks', 'المهام والتقويم'],
  ['calendar', 'المهام والتقويم'],
  ['dashboard', 'لوحة التحكم'],
  ['reports', 'التقارير'],
  ['backups', 'النسخ الاحتياطي'],
  ['audit', 'سجل العمليات'],
  ['health', 'النظام'],
  ['system', 'النظام'],
];
const groupOf = (url: string) => GROUPS.find(([seg]) => url.split('/')[2] === seg)?.[1] ?? 'أخرى';

const byGroup = new Map<string, Row[]>();
for (const r of rows) byGroup.set(groupOf(r.url), [...(byGroup.get(groupOf(r.url)) ?? []), r]);

const order = [...new Set(GROUPS.map(([, g]) => g)), 'أخرى'];
let md = `# مرجع الواجهة البرمجية (API)

> **مولَّد تلقائيًا** من المسارات المسجّلة فعليًا بالأمر \`npm run docs:api\` — لا تعدّله يدويًا.
> عدد المسارات: **${rows.length}**.

## قواعد عامة

- كل المسارات تحت \`/api\` وتُرجع JSON (ما عدا ملفات التقارير والنسخ الاحتياطية).
- المصادقة: كوكي جلسة \`HttpOnly\` تُنشئه \`POST /api/auth/login\`. بلا جلسة ← **401**.
- **CSRF**: كل طلب يغيّر البيانات (POST/PUT/PATCH/DELETE) يجب أن يحمل الرأس \`x-sijilli-client: web\`، وإلا ← **403**.
- الأخطاء: \`{ "error": { "code": "…", "message": "رسالة عربية", "fields": { "حقل": "رسالة" } } }\`.
- العزل: كل مورد يخص معلمًا واحدًا. الوصول لمورد معلم آخر يُرجع **404** (لا نكشف وجوده).
- المستخدم الذي أُلزم بتغيير كلمة المرور يُرفض (403 \`PASSWORD_CHANGE_REQUIRED\`) في كل شيء عدا تغييرها وتسجيل الخروج.
- الصلاحيات: **عام** بلا تسجيل دخول، **مسجَّل الدخول** أي مستخدم نشط، **المدير فقط** دور \`admin\`.

`;
for (const g of order) {
  const list = byGroup.get(g);
  if (!list?.length) continue;
  md += `## ${g}\n\n| الطريقة | المسار | الصلاحية |\n|---|---|---|\n`;
  for (const r of list.sort((a, b) => (a.url === b.url ? a.method.localeCompare(b.method) : a.url.localeCompare(b.url)))) {
    md += `| \`${r.method}\` | \`${r.url}\` | ${r.access} |\n`;
  }
  md += '\n';
}
fs.writeFileSync(path.resolve('docs/API.md'), md);
console.log(`✔ docs/API.md (${rows.length} مسارًا)`);
