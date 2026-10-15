# دليل إضافة وحدة جديدة

«سجلي» مبنيّ ليتّسع: وحدة جديدة (مثل **الخطط العلاجية** أو **سجل المختبر**) **لا تتطلب تعديل أي وحدة قائمة** — مجلد في الخادم، صفحة في الواجهة، وسطر في سجلّين.

الوحدة المرجعية الصغيرة والكاملة: **المهام** (`tasks`) — اقرأها أولًا فهي تطبّق كل ما في هذا الدليل:

| الطبقة | ملف المرجع |
|---|---|
| الجدول | `src/server/db/schema.ts` ← `tasks` |
| العقد المشترك | `src/shared/schemas/tasks.ts` · `src/shared/dto.ts` (`TaskDto`) |
| الخدمة | `src/server/modules/tasks/service.ts` |
| المسارات | `src/server/modules/tasks/routes.ts` |
| الاختبار | `tests/server/planning.test.ts` |
| الصفحة | `src/web/features/tasks/tasks-page.tsx` |

## القواعد غير القابلة للتفاوض

1. **كل جدول بيانات يحمل `owner_id`** (المعلم)، وكل دالة خدمة تأخذ `(db, ownerId, …)` وتقيّد **كل** استعلام به.
2. **الوصول لمورد غيرك = 404** (لا 403): استعمل `require…` من `modules/_shared/owned.ts`.
3. **كل مدخل يمرّ بمخطط Zod** عبر `parse(schema, data)`؛ لا تقرأ `req.body` مباشرة.
4. **كل نص موجّه للمستخدم عربي** (رسائل الأخطاء والإشعارات).
5. **لا أزرار ميتة:** لا تضف عنصر تنقّل أو زرًّا لوظيفة لم تُنفَّذ.
6. **لا أسماء طلاب أو درجات في سجل العمليات** (`audit`).

## الخطوات

### 1) الجدول والهجرة

أضف الجدول في `src/server/db/schema.ts` (استعمل المساعدين `id()` و`owner()` و`timestamps`):

```ts
export const remedialPlans = sqliteTable(
  'remedial_plans',
  {
    id: id(),
    ownerId: owner(),                                   // ← إلزامي
    studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    assignmentId: text('assignment_id').references(() => assignments.id, { onDelete: 'set null' }),
    kind: text('kind').$type<'remedial' | 'enrichment'>().notNull(),
    goal: text('goal').notNull(),
    startDate: text('start_date').notNull(),            // YYYY-MM-DD
    status: text('status').$type<'open' | 'done'>().notNull().default('open'),
    ...timestamps,
  },
  (t) => [index('remedial_owner_student_idx').on(t.ownerId, t.studentId)],
);
```

ثم ولّد الهجرة وراجع ملف SQL الناتج قبل اعتماده:

```bash
npm run db:generate      # ينشئ src/server/db/migrations/00NN_*.sql
```

> **لا تعدّل هجرة قديمة بعد نشرها.** أي تغيير = هجرة جديدة. التطبيق يأخذ نسخة `pre-migration` تلقائيًا عند الترقية.

### 2) العقد المشترك

`src/shared/schemas/remedial.ts` (واصدّره من `schemas/index.ts`):

```ts
import { z } from 'zod';
import { dateSchema, idSchema, requiredText } from './common';

export const createRemedialSchema = z.object({
  studentId: idSchema,
  assignmentId: idSchema.nullable().optional(),
  kind: z.enum(['remedial', 'enrichment']),
  goal: requiredText(500),
  startDate: dateSchema,
});
export const updateRemedialSchema = createRemedialSchema.partial().extend({ status: z.enum(['open', 'done']).optional() });
```

وأضف أنواع الاستجابة (`RemedialPlanDto`) في `src/shared/dto.ts`. هذا الملف يستورده الخادم **والواجهة** معًا فتتطابق قواعد التحقق في الطرفين.

### 3) الخدمة (المنطق + الاستعلامات)

`src/server/modules/remedial/service.ts` — دوال عادية بلا HTTP:

```ts
import { and, eq } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { schema } from '../../db/client';
import { requireStudent } from '../_shared/owned';
import { notFound } from '../../lib/errors';

const { remedialPlans } = schema;

export function listPlans(db: Db, ownerId: string, studentId: string) {
  requireStudent(db, ownerId, studentId);                    // يتحقق من الملكية (404)
  return db.select().from(remedialPlans)
    .where(and(eq(remedialPlans.ownerId, ownerId), eq(remedialPlans.studentId, studentId)))
    .all();
}
```

إن احتجت كيانًا جديدًا قابلًا للجلب بالمعرّف فأضف `requireRemedialPlan` إلى `modules/_shared/owned.ts` على نمط الباقي.

### 4) المسارات

`src/server/modules/remedial/routes.ts`:

```ts
import type { FastifyPluginAsync } from 'fastify';
import { createRemedialSchema } from '../../../shared/schemas/remedial';
import { audit } from '../../lib/audit';
import { getCtx } from '../../lib/context';
import { parse } from '../../lib/validate';
import * as svc from './service';

export const remedialModule: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { studentId: string } }>('/students/:studentId/remedial', async (req) => {
    const { db, ownerId } = getCtx(req);
    return svc.listPlans(db, ownerId, req.params.studentId);
  });

  app.post('/remedial', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const plan = svc.createPlan(db, ownerId, parse(createRemedialSchema, req.body));
    audit(req, { action: 'remedial_created', entityType: 'remedial_plan', entityId: plan.id });  // بلا أسماء/درجات
    return reply.code(201).send(plan);
  });
};
```

وسجّلها في **`src/server/modules/index.ts`** (السطر الوحيد الذي تلمسه خارج مجلدك):

```ts
import { remedialModule } from './remedial/routes';
const modules: FastifyPluginAsync[] = [ /* … */ remedialModule ];
```

المصادقة والـCSRF وتحديد المعدل **تُطبَّق تلقائيًا** على مسارك. لجعل مسار للمدير فقط: `{ config: { roles: ['admin'] } }` كما في `users/routes.ts`.

### 5) الاختبارات (إلزامية قبل الدمج)

في `tests/server/remedial.test.ts` (انسخ هيكل `planning.test.ts`):

- المسار السعيد (إنشاء/قراءة/تعديل/حذف).
- **العزل:** معلم ثانٍ لا يرى ولا يعدّل ولا يحذف (يتوقع 404).
- التحقق: مدخلات خاطئة ← 400 برسالة عربية وحقل محدد.
- أي منطق حساب يُختبر كدوال نقية.

**مصفوفة الصلاحيات تلتقط مسارك تلقائيًا** (`tests/server/security.test.ts`): ستتحقق أنه يرفض غير المسجّل وأن كل طلب كتابة يتطلب رأس CSRF. لا تحتاج تعديلها إلا إن جعلت مسارًا **عامًّا** عمدًا (ستُفشل الاختبار حتى تضيفه للقائمة المسموحة بعد مراجعة).

### 6) الواجهة

1. **مفاتيح الاستعلام** في `src/web/lib/queries.ts` ← `qk`:
   ```ts
   remedial: (studentId: string) => ['remedial', studentId] as const,
   ```
2. **الصفحة** في `src/web/features/remedial/remedial-page.tsx` (تصدير افتراضي) باستعمال مكوّنات `@/components/ui` والمساعدين:
   - `useQuery` + `api.get` للقراءة، و`useAppMutation` للكتابة (يتولى الإبطال والإشعار العربي).
   - النماذج: `react-hook-form` + `zodResolver(createRemedialSchema)` + `applyApiError` لعرض أخطاء الخادم على الحقول.
   - الحالات الثلاث دائمًا: **تحميل** (`PageLoader`/`Skeleton`)، **خطأ** (`QueryError` مع إعادة المحاولة)، **فارغ** (`EmptyState` بإجراء واضح).
   - استعمل **الخصائص المنطقية** (`ms-*`, `ps-*`, `start-*`) لا `ml/left` حتى يعمل RTL.
   - الأرقام والتواريخ عبر `useFmt()` (يحترم تفضيل الأرقام).
3. **المسار** في `src/web/App.tsx`:
   ```tsx
   const RemedialPage = lazy(() => import('@/features/remedial/remedial-page'));
   // … <Route path="remedial" element={<RemedialPage />} />
   ```
4. **التنقل** في `src/web/nav.tsx` (سطر واحد؛ `mobile: true` لإظهاره في الشريط السفلي بالجوال):
   ```ts
   { to: '/remedial', label: 'الخطط العلاجية', icon: HeartHandshake },
   ```

### 7) التقارير (إن لزم)

أضف قيمة إلى `REPORT_TYPE` في `src/shared/constants.ts`، ثم دالة بناء في `src/server/reports/builders.ts` تُرجع `ReportDoc` (كتل: عنوان، جدول، حقول…)، وسجّلها في `reports/service.ts`. تحصل تلقائيًا على **HTML وPDF وExcel** بلا كتابة قوالب. وأضف الخيار إلى `features/reports/reports-page.tsx`.

### 8) الوثائق والتحقق

```bash
npm run docs:api        # يحدّث docs/API.md من المسارات الفعلية
npm run lint && npm run typecheck && npm test
npm run build && npm run test:e2e
```

- أضف خطوة في `scripts/e2e.mjs` تجرّب الوحدة من الواجهة فعليًا (الإنشاء ← التحديث ← الاستمرار بعد إعادة التحميل).
- حدّث جدول «المُنجز» في `README.md` و`docs/ROADMAP.md`.

## قائمة «تمّ فعلًا» (Definition of Done)

- [ ] جدول بـ`owner_id` وهجرة جديدة (لا تعديل هجرة قديمة).
- [ ] مخطط Zod في `src/shared` وأنواع DTO.
- [ ] كل استعلام مقيَّد بـ`ownerId`، وكيانات غيره تُرجع 404.
- [ ] اختبار تكامل يشمل **العزل** والتحقق والمسار السعيد.
- [ ] الواجهة تعالج: تحميل، خطأ، فارغ، ونجاح/فشل الحفظ برسائل عربية.
- [ ] لا زر أو رابط لوظيفة غير موجودة.
- [ ] RTL سليم على الجوال (لا تمرير أفقي) في الفاتح والداكن — فحص `npm run test:e2e` البصري يلتقط ذلك إن أضفت الصفحة لقائمته.
- [ ] `docs/API.md` محدَّث، و`README`/`ROADMAP` يعكسان الحالة بصدق.
- [ ] لا أسماء طلاب أو درجات في `audit_log`.
