# مرجع الواجهة البرمجية (API)

> **مولَّد تلقائيًا** من المسارات المسجّلة فعليًا بالأمر `npm run docs:api` — لا تعدّله يدويًا.
> عدد المسارات: **121**.

## قواعد عامة

- كل المسارات تحت `/api` وتُرجع JSON (ما عدا ملفات التقارير والنسخ الاحتياطية).
- المصادقة: كوكي جلسة `HttpOnly` تُنشئه `POST /api/auth/login`. بلا جلسة ← **401**.
- **CSRF**: كل طلب يغيّر البيانات (POST/PUT/PATCH/DELETE) يجب أن يحمل الرأس `x-sijilli-client: web`، وإلا ← **403**.
- الأخطاء: `{ "error": { "code": "…", "message": "رسالة عربية", "fields": { "حقل": "رسالة" } } }`.
- العزل: كل مورد يخص معلمًا واحدًا. الوصول لمورد معلم آخر يُرجع **404** (لا نكشف وجوده).
- المستخدم الذي أُلزم بتغيير كلمة المرور يُرفض (403 `PASSWORD_CHANGE_REQUIRED`) في كل شيء عدا تغييرها وتسجيل الخروج.
- الصلاحيات: **عام** بلا تسجيل دخول، **مسجَّل الدخول** أي مستخدم نشط، **المدير فقط** دور `admin`.

## المصادقة والجلسات

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `POST` | `/api/auth/login` | عام |
| `POST` | `/api/auth/logout` | مسجَّل الدخول |
| `POST` | `/api/auth/logout-others` | مسجَّل الدخول |
| `GET` | `/api/auth/me` | عام |
| `POST` | `/api/auth/password` | مسجَّل الدخول |
| `GET` | `/api/auth/sessions` | مسجَّل الدخول |
| `DELETE` | `/api/auth/sessions/:id` | مسجَّل الدخول |
| `POST` | `/api/auth/setup` | عام |

## إدارة المستخدمين

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/users` | المدير فقط |
| `POST` | `/api/users` | المدير فقط |
| `DELETE` | `/api/users/:id` | المدير فقط |
| `PATCH` | `/api/users/:id` | المدير فقط |
| `POST` | `/api/users/:id/reset-password` | المدير فقط |

## الإعدادات

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/settings` | مسجَّل الدخول |
| `PATCH` | `/api/settings` | مسجَّل الدخول |

## الأعوام والفصول

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `PATCH` | `/api/terms/:id` | مسجَّل الدخول |
| `GET` | `/api/years` | مسجَّل الدخول |
| `POST` | `/api/years` | مسجَّل الدخول |
| `DELETE` | `/api/years/:id` | مسجَّل الدخول |
| `PATCH` | `/api/years/:id` | مسجَّل الدخول |
| `POST` | `/api/years/:id/current` | مسجَّل الدخول |
| `POST` | `/api/years/clone-structure` | مسجَّل الدخول |

## المواد

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/subjects` | مسجَّل الدخول |
| `POST` | `/api/subjects` | مسجَّل الدخول |
| `DELETE` | `/api/subjects/:id` | مسجَّل الدخول |
| `PATCH` | `/api/subjects/:id` | مسجَّل الدخول |

## الشعب

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/sections` | مسجَّل الدخول |
| `POST` | `/api/sections` | مسجَّل الدخول |
| `DELETE` | `/api/sections/:id` | مسجَّل الدخول |
| `GET` | `/api/sections/:id` | مسجَّل الدخول |
| `PATCH` | `/api/sections/:id` | مسجَّل الدخول |
| `POST` | `/api/sections/:id/assignments` | مسجَّل الدخول |
| `GET` | `/api/sections/:id/impact` | مسجَّل الدخول |
| `GET` | `/api/sections/:id/students` | مسجَّل الدخول |
| `POST` | `/api/sections/:id/students` | مسجَّل الدخول |
| `DELETE` | `/api/sections/:id/students/:studentId` | مسجَّل الدخول |
| `POST` | `/api/sections/:id/students/enroll` | مسجَّل الدخول |
| `POST` | `/api/sections/:id/students/import/commit` | مسجَّل الدخول |
| `POST` | `/api/sections/:id/students/import/preview` | مسجَّل الدخول |
| `POST` | `/api/sections/:id/students/reorder` | مسجَّل الدخول |

## المقررات (شعبة × مادة)

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/assignments` | مسجَّل الدخول |
| `DELETE` | `/api/assignments/:id` | مسجَّل الدخول |
| `PATCH` | `/api/assignments/:id` | مسجَّل الدخول |
| `GET` | `/api/assignments/:id/impact` | مسجَّل الدخول |

## الطلاب

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/students` | مسجَّل الدخول |
| `POST` | `/api/students` | مسجَّل الدخول |
| `DELETE` | `/api/students/:id` | مسجَّل الدخول |
| `GET` | `/api/students/:id` | مسجَّل الدخول |
| `PATCH` | `/api/students/:id` | مسجَّل الدخول |
| `POST` | `/api/students/:id/move` | مسجَّل الدخول |
| `GET` | `/api/students/:id/notes` | مسجَّل الدخول |
| `POST` | `/api/students/:id/notes` | مسجَّل الدخول |
| `GET` | `/api/students/:id/profile` | مسجَّل الدخول |

## ملاحظات الطلاب

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `DELETE` | `/api/notes/:id` | مسجَّل الدخول |
| `PATCH` | `/api/notes/:id` | مسجَّل الدخول |

## الجدول الأسبوعي

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/timetable` | مسجَّل الدخول |
| `PUT` | `/api/timetable/slot` | مسجَّل الدخول |

## التحضير

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/lessons` | مسجَّل الدخول |
| `POST` | `/api/lessons` | مسجَّل الدخول |
| `DELETE` | `/api/lessons/:id` | مسجَّل الدخول |
| `GET` | `/api/lessons/:id` | مسجَّل الدخول |
| `PATCH` | `/api/lessons/:id` | مسجَّل الدخول |
| `POST` | `/api/lessons/:id/copy` | مسجَّل الدخول |

## المهارات

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/skills` | مسجَّل الدخول |
| `POST` | `/api/skills` | مسجَّل الدخول |
| `DELETE` | `/api/skills/:id` | مسجَّل الدخول |
| `PATCH` | `/api/skills/:id` | مسجَّل الدخول |

## التقويم المستمر

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/assessments` | مسجَّل الدخول |
| `POST` | `/api/assessments` | مسجَّل الدخول |
| `DELETE` | `/api/assessments/:id` | مسجَّل الدخول |
| `GET` | `/api/assessments/:id` | مسجَّل الدخول |
| `PATCH` | `/api/assessments/:id` | مسجَّل الدخول |
| `POST` | `/api/assessments/:id/copy` | مسجَّل الدخول |
| `PUT` | `/api/assessments/:id/results` | مسجَّل الدخول |
| `GET` | `/api/gradebook` | مسجَّل الدخول |

## المهام والتقويم

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/calendar` | مسجَّل الدخول |
| `GET` | `/api/tasks` | مسجَّل الدخول |
| `POST` | `/api/tasks` | مسجَّل الدخول |
| `DELETE` | `/api/tasks/:id` | مسجَّل الدخول |
| `PATCH` | `/api/tasks/:id` | مسجَّل الدخول |

## الخطط العلاجية والإثرائية

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/support-plans` | مسجَّل الدخول |
| `POST` | `/api/support-plans` | مسجَّل الدخول |
| `DELETE` | `/api/support-plans/:id` | مسجَّل الدخول |
| `GET` | `/api/support-plans/:id` | مسجَّل الدخول |
| `PATCH` | `/api/support-plans/:id` | مسجَّل الدخول |
| `POST` | `/api/support-plans/:id/notes` | مسجَّل الدخول |
| `DELETE` | `/api/support-plans/:id/notes/:noteId` | مسجَّل الدخول |
| `PATCH` | `/api/support-plans/:id/notes/:noteId` | مسجَّل الدخول |
| `POST` | `/api/support-plans/bulk` | مسجَّل الدخول |
| `GET` | `/api/support-plans/suggestions` | مسجَّل الدخول |

## سجل المختبر والأنشطة

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/lab-activities` | مسجَّل الدخول |
| `POST` | `/api/lab-activities` | مسجَّل الدخول |
| `DELETE` | `/api/lab-activities/:id` | مسجَّل الدخول |
| `GET` | `/api/lab-activities/:id` | مسجَّل الدخول |
| `PATCH` | `/api/lab-activities/:id` | مسجَّل الدخول |
| `POST` | `/api/lab-activities/:id/copy` | مسجَّل الدخول |

## إدارة الصف

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/class/overview` | مسجَّل الدخول |
| `PUT` | `/api/class/participation` | مسجَّل الدخول |
| `POST` | `/api/class/records` | مسجَّل الدخول |
| `DELETE` | `/api/class/records/:id` | مسجَّل الدخول |
| `PATCH` | `/api/class/records/:id` | مسجَّل الدخول |
| `DELETE` | `/api/class/session` | مسجَّل الدخول |
| `GET` | `/api/class/session` | مسجَّل الدخول |
| `POST` | `/api/class/session/mark-rest` | مسجَّل الدخول |
| `GET` | `/api/class/students/:id` | مسجَّل الدخول |
| `GET` | `/api/class/summary` | مسجَّل الدخول |

## المساعد الذكي

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `POST` | `/api/ai/run` | مسجَّل الدخول |
| `GET` | `/api/ai/settings` | المدير فقط |
| `PATCH` | `/api/ai/settings` | المدير فقط |
| `GET` | `/api/ai/status` | مسجَّل الدخول |

## لوحة التحكم

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/dashboard` | مسجَّل الدخول |

## التقارير

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/reports/:type/:format` | مسجَّل الدخول |

## النسخ الاحتياطي

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/backups` | المدير فقط |
| `POST` | `/api/backups` | المدير فقط |
| `DELETE` | `/api/backups/:name` | المدير فقط |
| `GET` | `/api/backups/:name/download` | المدير فقط |
| `POST` | `/api/backups/:name/restore` | المدير فقط |
| `POST` | `/api/backups/restore-upload` | المدير فقط |

## سجل العمليات

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/audit` | المدير فقط |

## النظام

| الطريقة | المسار | الصلاحية |
|---|---|---|
| `GET` | `/api/health` | عام |
| `GET` | `/api/system/info` | عام |

