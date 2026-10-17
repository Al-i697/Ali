# دليل إضافة وحدة جديدة

«سجلي» مبنيّ ليتّسع: وحدة جديدة (مثل **سجل المختبر** أو **الخطط العلاجية** اللتين أُضيفتا بهذه الطريقة بالضبط) **لا تتطلب تعديل أي وحدة قائمة** — مجلد في الخادم، صفحة في الواجهة، وسطر في سجلّين.

المرجع الأكمل والأحدث: **سجل المختبر والأنشطة** (`lab`) — يطبّق كل ما في هذا الدليل بما فيه التكامل مع لوحة التحكم والتقويم والتقارير والبيانات التجريبية. والمرجع الأصغر: **المهام** (`tasks`). الأمثلة أدناه مقتطفات حقيقية من وحدة المختبر (مختصرة).

| الطبقة | ملف المرجع |
|---|---|
| الجدول والهجرة | `src/server/db/schema.ts` ← `labActivities` · `src/server/db/migrations/0002_lab_activities.sql` |
| العقد المشترك | `src/shared/constants.ts` (`LAB_KIND`، `LAB_STATUS`) · `src/shared/schemas/lab.ts` · `src/shared/dto.ts` (`LabActivityDto`…) |
| الخدمة | `src/server/modules/lab/service.ts` |
| المسارات | `src/server/modules/lab/routes.ts` |
| التكامل | `dashboardLab` (لوحة التحكم) · `calendarItems` (التقويم) · `buildLabLog` في `reports/builders.ts` · `demo/seed.ts` |
| الاختبار | `tests/server/lab.test.ts` · `tests/server/upgrade.test.ts` |
| الواجهة | `src/web/features/lab/` (`lab-page` · `lab-dialog` · `complete-dialog` · `copy-dialog`) |
| الاختبار الشامل | `scripts/e2e.mjs` ← خطوات «المختبر…» |

## القواعد غير القابلة للتفاوض

1. **كل جدول بيانات يحمل `owner_id`** (المعلم)، وكل دالة خدمة تأخذ `(db, ownerId, …)` وتقيّد **كل** استعلام به.
2. **الوصول لمورد غيرك = 404** (لا 403): استعمل `require…` من `modules/_shared/owned.ts`.
3. **كل مدخل يمرّ بمخطط Zod** عبر `parse(schema, data)`؛ لا تقرأ `req.body` مباشرة.
4. **كل نص موجّه للمستخدم عربي** (رسائل الأخطاء والإشعارات).
5. **لا أزرار ميتة:** لا تضف عنصر تنقّل أو زرًّا لوظيفة لم تُنفَّذ.
6. **لا أسماء طلاب أو درجات في سجل العمليات** (`audit`)، ولا عناوين/نصوص يكتبها المعلم.
7. **السجلات التوثيقية لا تُمحى بحذف مقرّرها:** ما نُفِّذ فعلًا (نشاط، خطة) يبقى بعد حذف الشعبة/المقرر (`ON DELETE SET NULL` ثم يظهر «عامًّا»)، على خلاف التقويمات والتحضير التي تتبع مقررها.
8. **الحكم على «اليوم» في الخادم لا في العميل:** دوال الخدمة التي تعتمد على التاريخ الحالي تأخذه وسيطًا (`today = todayISO()` افتراضيًا) فتُختبر بتاريخ مُحقَن، والمسارات تمرّر تاريخ المنطقة الزمنية المُعدّة (`nowInZone(app.config.timezone).date`).

## الخطوات

### 1) الجدول والهجرة

أضف الجدول في `src/server/db/schema.ts` (استعمل المساعدين `id()` و`owner()` و`timestamps`):

```ts
export const labActivities = sqliteTable(
  'lab_activities',
  {
    id: id(),
    ownerId: owner(),                                        // ← إلزامي
    assignmentId: text('assignment_id').references(() => assignments.id, { onDelete: 'set null' }),
    date: text('date').notNull(),                            // YYYY-MM-DD
    period: integer('period'),
    kind: text('kind').$type<LabKind>().notNull().default('experiment'),
    title: text('title').notNull(),
    searchText: text('search_text').notNull().default(''),   // نص مطبَّع (بلا همزات/تشكيل) للبحث العربي
    objectives: text('objectives', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    // … materials · safety · procedure · results · participants · notes
    status: text('status').$type<LabStatus>().notNull().default('planned'),
    sourceId: text('source_id'),                             // النشاط الذي نُسخ منه (للتتبع)
    ...timestamps,
  },
  (t) => [
    index('lab_owner_date_idx').on(t.ownerId, t.date),
    check('lab_status_chk', sql`${t.status} in ('planned','done','cancelled')`),     // القيد في القاعدة نفسها
    check('lab_participants_chk', sql`${t.participants} is null or ${t.participants} >= 0`),
  ],
);
```

ثم ولّد الهجرة **باسم وصفي** وراجع ملف SQL الناتج قبل اعتماده:

```bash
npm run db:generate -- --name lab_activities   # ينشئ src/server/db/migrations/0002_lab_activities.sql
```

> **لا تعدّل هجرة قديمة بعد نشرها.** أي تغيير = هجرة جديدة. الأفضل أن تكون الهجرة **إضافية** (جداول جديدة فقط) فتكون الترقية آمنة بلا إعادة بناء جداول قائمة. التطبيق يأخذ نسخة `pre-migration` تلقائيًا عند الترقية، ويغطي `tests/server/upgrade.test.ts` الترقية من قاعدة قديمة ببيانات حقيقية — أضف فيه تأكيد وجود جدولك الجديد.

### 2) العقد المشترك

القوائم المسمّاة في `src/shared/constants.ts` (قيم + تسميات عربية في مكان واحد):

```ts
export const LAB_STATUS = defineEnum([
  { value: 'planned', label: 'مخطَّط' },
  { value: 'done', label: 'نُفِّذ' },
  { value: 'cancelled', label: 'ملغى' },
] as const);
export type LabStatus = (typeof LAB_STATUS.values)[number];
```

ومخططات Zod في `src/shared/schemas/lab.ts` (واصدّرها من `schemas/index.ts`):

```ts
const labFields = {
  assignmentId: idSchema.nullable().optional(),   // بلا مقرر = نشاط عام
  date: dateSchema,
  title: requiredText(200),
  objectives: stringList(),
  participants: z.number().int().min(0).max(2000).nullable().optional(),
  status: z.enum(LAB_STATUS.values),
  // …
};
export const createLabActivitySchema = z.object({ ...labFields, status: labFields.status.default('planned') /* … */ });
export const updateLabActivitySchema = z.object(labFields).partial();   // PATCH: كل الحقول اختيارية
export const labActivitiesQuery = z.object({ from: dateSchema.optional(), status: z.enum(LAB_STATUS.values).optional(), limit: z.coerce.number().int().min(1).max(500).default(200) /* … */ });
```

> الحقل النصي الاختياري يُعرَّف بـ`optText()`: النص الفارغ يصير `null` وغيابه يبقى `undefined` (هذا هو الفرق الذي يعتمد عليه `PATCH`).

وأضف أنواع الاستجابة في `src/shared/dto.ts` (`LabActivitySummaryDto` للقائمة و`LabActivityDto` للتفاصيل). الملف يستورده الخادم **والواجهة** معًا فتتطابق العقود في الطرفين.

### 3) الخدمة (المنطق + الاستعلامات)

`src/server/modules/lab/service.ts` — دوال عادية بلا HTTP. ثلاثة أنماط تستحق التقليد:

```ts
// أ) حارس منطقي: لا «نُفِّذ» لتاريخ لم يحن — السجل وثيقة، والخادم لا يثق بالنموذج وحده
function assertDoneNotFuture(status: LabStatus, date: string, today: string): void {
  if (status === 'done' && date > today)
    throw badRequest('لا يمكن تسجيل «نُفِّذ» لنشاط تاريخه لم يحن بعد…', 'FUTURE_DONE', { date: 'تاريخ مستقبلي' });
}

// ب) الكتابة تتحقق من ملكية كل مرجع (المقرر) ثم تُدرج
export function createLab(db: Db, ownerId: string, input: CreateLabActivityInput, today = todayISO()): LabActivityDto {
  const asg = input.assignmentId ? requireAssignment(db, ownerId, input.assignmentId) : undefined;   // 404 لمقرر غيرك
  assertDoneNotFuture(input.status ?? 'planned', input.date, today);
  const row = db.insert(labActivities).values({ ownerId, assignmentId: asg?.id ?? null, /* … */ }).returning().get();
  return toDto(row, asg, today);
}

// ج) العمليات متعددة الصفوف في معاملة واحدة (إمّا كلها أو لا شيء)
export function copyLab(db: Db, ownerId: string, id: string, input: CopyLabActivityInput) {
  const src = requireLabActivity(db, ownerId, id);
  db.transaction((tx) => { for (const t of input.targets) tx.insert(labActivities).values({ /* … */ }).run(); });
}
```

وأضف `requireLabActivity` إلى `modules/_shared/owned.ts` على نمط الباقي.

### 4) المسارات

`src/server/modules/lab/routes.ts`:

```ts
export const labModule: FastifyPluginAsync = async (app) => {
  const today = () => nowInZone(app.config.timezone).date;      // القاعدة 8

  app.post('/lab-activities', async (req, reply) => {
    const { db, ownerId } = getCtx(req);
    const lab = svc.createLab(db, ownerId, parse(createLabActivitySchema, req.body), today());
    audit(req, { action: 'lab_activity_created', entityType: 'lab_activity', entityId: lab.id, meta: { kind: lab.kind } });  // بلا عنوان ولا نصوص
    return reply.code(201).send(lab);
  });
  // GET (قائمة/تفاصيل) · PATCH · DELETE · POST /:id/copy …
};
```

وسجّلها في **`src/server/modules/index.ts`** (السطر الوحيد الذي تلمسه خارج مجلدك):

```ts
import { labModule } from './lab/routes';
const modules: FastifyPluginAsync[] = [ /* … */ labModule ];
```

المصادقة والـCSRF وتحديد المعدل **تُطبَّق تلقائيًا** على مسارك. لجعل مسار للمدير فقط: `{ config: { roles: ['admin'] } }` كما في `users/routes.ts`.

### 5) التكامل مع الشاشات القائمة (اختياري لكنه يرفع القيمة)

دون تعديل بنية تلك الوحدات — أضف دالة صغيرة في وحدتك واستدعِها من موضع واحد:

| الشاشة | ما تفعله |
|---|---|
| لوحة التحكم | `dashboardLab(db, ownerId, today, yearStart)` تُستدعى من `dashboard/service.ts`، وحقل جديد في `DashboardDto`، وبطاقة في `dashboard-page.tsx` **تُخفى إن لم يستعمل المعلم الوحدة** كي لا تزدحم لوحته |
| التقويم الدراسي | `calendarItems(db, ownerId, from, to)` تُستدعى من `tasks/service.ts → calendar`، ونوع جديد في `CalendarItemDto['type']` وتسمية في `tasks-page.tsx` |
| التقارير | الخطوة 7 |
| البيانات التجريبية | أضف أمثلة في `demo/seed.ts` **عبر دوال الخدمة نفسها** (فتختبر الوحدة نفسها وتبقى منفصلة عن البيانات الحقيقية) |

### 6) الاختبارات (إلزامية قبل الدمج)

في `tests/server/lab.test.ts` (انسخ هيكله):

- المسار السعيد (إنشاء/قراءة/تعديل/حذف/نسخ) وقواعد الحساب بتاريخ مُحقَن (`TODAY`).
- **العزل:** معلم ثانٍ لا يرى ولا يعدّل ولا ينسخ ولا يحذف ولا يطبع تقريرًا (يتوقع 404)، ولا يستطيع إسناد نشاطه إلى مقرر غيره.
- التحقق: مدخلات خاطئة ← 400 برسالة عربية وحقل محدد.
- **الذرّية:** عملية متعددة الصفوف تفشل في منتصفها لا تترك شيئًا.
- سلوك الحذف المتسلسل (حذف المقرر يُبقي السجل، وحذف الحساب يمحوه).
- نظّف ما تنشئه كل مجموعة اختبارات حتى لا تتأثر أعداد المجموعة التالية.

**مصفوفة الصلاحيات تلتقط مسارك تلقائيًا** (`tests/server/security.test.ts`): ستتحقق أنه يرفض غير المسجّل وأن كل طلب كتابة يتطلب رأس CSRF. لا تحتاج تعديلها إلا إن جعلت مسارًا **عامًّا** عمدًا.

### 7) الواجهة

1. **مفاتيح الاستعلام** في `src/web/lib/queries.ts` ← `qk` (كلها تحت بادئة واحدة فيكفي إبطالها معًا) وأضف البادئة إلى `invalidateAcademic`:
   ```ts
   lab: (params?: unknown) => ['lab', 'list', params ?? {}] as const,
   labItem: (id: string) => ['lab', 'item', id] as const,
   ```
2. **الصفحة** في `src/web/features/lab/lab-page.tsx` (تصدير افتراضي) باستعمال مكوّنات `@/components/ui` والمساعدين:
   - `useQuery` + `api.get` للقراءة، و`useAppMutation` للكتابة (يتولى الإبطال والإشعار العربي).
   - النماذج: `react-hook-form` + `zodResolver` + `applyApiError` لعرض أخطاء الخادم على الحقول.
   - الحالات الثلاث دائمًا: **تحميل** (`PageLoader`/`Skeleton`)، **خطأ** (`QueryError` مع إعادة المحاولة)، **فارغ** (`EmptyState` بإجراء واضح) — وفرّق بين «لا بيانات بعد» و«لا نتائج للتصفية».
   - التصفية في عنوان الصفحة (`useSearchParams`) فتعمل الروابط العميقة من لوحة التحكم (`/lab?view=overdue`) والتقويم (`/lab?open=<id>`).
   - استعمل **الخصائص المنطقية** (`ms-*`, `ps-*`, `start-*`) لا `ml/left` حتى يعمل RTL.
   - الأرقام والتواريخ عبر `useFmt()` (يحترم تفضيل الأرقام).
   - **فخ معروف في React Hook Form:** `formState.isDirty` لا يُتتبَّع إلا إن قُرئ أثناء الرسم؛ قراءته داخل معالج الإغلاق وحده تعيد `false` دائمًا فيضيع ما كُتب بلا تحذير (`lab-dialog.tsx`). اقرأه بتفكيك `const { isDirty } = form.formState` في جسم المكوّن.
3. **المسار** في `src/web/App.tsx`:
   ```tsx
   const LabPage = lazy(() => import('@/features/lab/lab-page'));
   // … <Route path="lab" element={<LabPage />} />
   ```
4. **التنقل** في `src/web/nav.tsx` (سطر واحد؛ `mobile: true` لإظهاره في الشريط السفلي بالجوال):
   ```ts
   { to: '/lab', label: 'المختبر والأنشطة', icon: FlaskConical },
   ```

### 8) التقارير (إن لزم)

أضف قيمة إلى `REPORT_TYPE` في `src/shared/constants.ts` ومعاملات الاستعلام اللازمة إلى `schemas/reports.ts`، ثم دالة بناء في `src/server/reports/builders.ts` تُرجع `ReportDoc` (كتل: عنوان، جدول، حقول…)، وسجّلها في `reports/service.ts` (الـ`switch` شامل فيُنبّهك المترجم إن نسيت). تحصل تلقائيًا على **HTML وPDF وExcel** بلا كتابة قوالب. وأضف الخيار إلى `features/reports/reports-page.tsx`.

### 9) الوثائق والتحقق

```bash
npm run docs:api        # يحدّث docs/API.md من المسارات الفعلية
npm run lint && npm run typecheck && npm test
npm run build && npm run test:e2e
```

- أضف خطوات في `scripts/e2e.mjs` تجرّب الوحدة من الواجهة فعليًا (الإنشاء ← التحديث ← الاستمرار بعد إعادة التحميل ← الحذف)، وأضف صفحتك إلى قائمة المسح البصري (`phaseVisual`).
- حدّث جدول «المُنجز» في `README.md` و`docs/ROADMAP.md` وقائمة الجداول في `docs/ARCHITECTURE.md`.

## مثال ثانٍ: إدارة الصف (حالة مطلوبة + حساب نقي مشترك)

وحدة **إدارة الصف** (`modules/classroom`، راجع [CLASSROOM](CLASSROOM.md)) تضيف نمطين تستحق تقليدهما:

1. **الكتابة بالحالة المطلوبة لا بالزيادة** — حين تُكرَّر النقرات بسرعة (مشاركة الطالب): `PUT /class/participation` يستلم الحالة النهائية (`null/0/n`) فيكون تكرار الطلب أو تأخره بلا أثر، والواجهة تطبّق الحالة فورًا (`onMutate`) وترسلها **بالترتيب نفسه** (سلسلة وعود واحدة) ثم تعيد الحقيقة من الخادم عند الخطأ فقط.
2. **الحساب كله في `src/shared/classroom.ts` بدوال نقية** (بلا قاعدة بيانات ولا HTTP): الأعداد والنسبة والمؤشرات وتجميع الحصص. الخادم يجلب الصفوف ويمرّرها إليها، والاختبارات تفحص حدودها منفردة (`tests/shared/classroom.test.ts`)، فلا يتكرر المنطق بين الخادم والواجهة.

وأمران في القاعدة: **رقم الحصة المجهول يُخزَّن 0 لا `NULL`** كي يعمل القيد الفريد (كل `NULL` يخالف كل `NULL` في SQLite) مع تحويله `null` في الـDTO من موضع واحد، و**القيود في القاعدة نفسها** (`CHECK` لعدّاد المشاركة والنوع، وإلزام السبب أو الملاحظة) مع اختبار يتجاوز التطبيق ويحاول كسرها.

## قائمة «تمّ فعلًا» (Definition of Done)

- [ ] جدول بـ`owner_id` وهجرة جديدة (لا تعديل هجرة قديمة) وتأكيد في اختبار الترقية.
- [ ] مخطط Zod في `src/shared` وأنواع DTO.
- [ ] كل استعلام مقيَّد بـ`ownerId`، وكيانات غيره تُرجع 404.
- [ ] اختبار تكامل يشمل **العزل** والتحقق والمسار السعيد والذرّية.
- [ ] الواجهة تعالج: تحميل، خطأ، فارغ، ونجاح/فشل الحفظ برسائل عربية، وتحمي النماذج الطويلة من الإغلاق العرَضي.
- [ ] لا زر أو رابط لوظيفة غير موجودة.
- [ ] RTL سليم على الجوال (لا تمرير أفقي) في الفاتح والداكن، وبلا مخالفات axe — فحص `npm run test:e2e` البصري يلتقط ذلك إن أضفت الصفحة لقائمته.
- [ ] `docs/API.md` محدَّث، و`README`/`ROADMAP`/`ARCHITECTURE` يعكسان الحالة بصدق.
- [ ] لا أسماء طلاب أو درجات أو نصوص حرة في `audit_log`.
