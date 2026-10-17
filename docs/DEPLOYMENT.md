# التشغيل والنشر

## المتطلبات

| العنصر | التفصيل |
|---|---|
| Node.js | **≥ 22.12** |
| نظام التشغيل | Linux (موصى به) أو macOS أو Windows. `better-sqlite3` يأتي بثنائيات جاهزة للأنظمة الشائعة؛ وإلا يلزم `python3 make g++` للبناء |
| Chromium | **اختياري** لتصدير PDF المباشر. بدونه تعمل «الطباعة» و«Excel» |
| الذاكرة | 512 م.ب تكفي لمعلم/مدرسة صغيرة (كل تجزئة كلمة مرور تستعمل لحظيًا ~64 م.ب؛ وChromium يضيف ~150–300 م.ب أثناء توليد PDF) |
| القرص | القاعدة صغيرة (مئات الكيلوبايتات إلى بضعة ميغابايتات)، لكن اترك مساحة للنسخ الاحتياطية (14 نسخة افتراضيًا) |

## متغيرات البيئة

كلها اختيارية؛ الافتراضيات تصلح للتجربة المحلية. القالب الكامل: [`.env.example`](../.env.example). يُتحقَّق منها عند البدء، وأي قيمة خاطئة توقف الخادم برسالة واضحة.

| المتغير | الافتراضي | الوصف |
|---|---|---|
| `NODE_ENV` | `development` | استعمل `production` في الإنتاج |
| `HOST` / `PORT` | `127.0.0.1` / `3000` | عنوان الاستماع. في Docker يكون `0.0.0.0` |
| `DATA_DIR` | `./data` | مجلد القاعدة والنسخ الاحتياطية — **احفظه على قرص دائم** |
| `DATABASE_FILE` / `BACKUP_DIR` | داخل `DATA_DIR` | لتغيير المواضع كل على حدة |
| `BACKUP_INTERVAL_HOURS` | `24` | الفاصل بين النسخ التلقائية (`0` = إيقاف) |
| `BACKUP_KEEP` | `14` | عدد النسخ التلقائية المحتفظ بها |
| `BACKUP_PASSPHRASE` | — | عبارة تشفير النسخ (AES-256-GCM). **بدونها لا تُستعاد النسخ المشفّرة** |
| `APP_URL` | — | العنوان العام (`https://…`). يفعّل `Secure` على الكوكي ويُستعمل لفحص Origin |
| `TRUST_PROXY` | `false` | اجعلها `true` خلف وكيل عكسي ليُقرأ عنوان IP الحقيقي |
| `COOKIE_SECURE` | `auto` | `auto` = آمن إذا بدأ `APP_URL` بـ`https` |
| `CHROMIUM_PATH` | بحث تلقائي | مسار Chromium لتصدير PDF |
| `PDF_NO_SANDBOX` | `false` | `true` داخل الحاويات (لا يتوفر sandbox لـChromium فيها) |
| `TZ_NAME` | `Asia/Muscat` | المنطقة الزمنية (الأسبوع الدراسي والحصص و«اليوم») |
| `LOG_LEVEL` | `info` | `fatal`…`trace`، `silent` |
| `RATE_LIMIT_PER_MINUTE` | `600` | حد الطلبات العام لكل عنوان IP في الدقيقة (الدخول والنسخ وغيرهما لها حدود أشد). ارفعه إن ظهر كل المستخدمين بعنوان واحد |
| `WEB_ROOT` | `dist/web` | مجلد الواجهة المبنية (نادرًا ما يلزم) |
| `AI_PROVIDER` | `none` | `none` أو `anthropic` — **المساعد الذكي** (اختياري). تفصيل المتغيرات `ANTHROPIC_API_KEY` و`AI_MODEL` و`AI_EFFORT` و`AI_BASE_URL` و`AI_TIMEOUT_MS` و`AI_DAILY_LIMIT` و`AI_RATE_PER_MINUTE` و`AI_MAX_CONCURRENCY` في [AI-EXTENSION](AI-EXTENSION.md#متغيرات-البيئة) |

### المساعد الذكي (اختياري)

معطّل افتراضيًا. للتفعيل: اضبط `AI_PROVIDER=anthropic` و`ANTHROPIC_API_KEY`، أعد التشغيل، نفّذ **`node dist/server/cli.js ai-check`** (يتحقق من المفتاح والنموذج والوصول بطلب صغير بلا بيانات حقيقية)، ثم وافق من الإعدادات ← «المساعد الذكي». يتطلب:

- **وصولًا صادرًا عبر HTTPS** من الخادم إلى مضيف المزوّد (`api.anthropic.com` أو مضيف `AI_BASE_URL`)، وإن كان خلف وكيل صادر فاضبط `HTTPS_PROXY`.
- **مهلة قراءة في الوكيل العكسي** تفوق أقصى انتظار لطلب المساعد (≈ ضعف `AI_TIMEOUT_MS` = ~190 ثانية افتراضيًا)، مثلًا في Nginx:
  ```nginx
  location /api/ai/ {
      proxy_pass http://127.0.0.1:3000;
      proxy_read_timeout 240s;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
  }
  ```
  أما Caddy فلا يفرض مهلة افتراضية على الخادم الخلفي فلا يلزم إعداد إضافي (إلا إن وضعتَ `response_header_timeout` أقصر).
- **سياسة المدرسة** التي تسمح بإرسال نص تعليمي (لا بيانات طلاب) إلى مزوّد خارجي. راجع [SECURITY](SECURITY.md#المساعد-الذكي-اختياري).

## التشغيل المباشر (Node)

```bash
git clone <المستودع> sijilli && cd sijilli
npm ci
npm run build
cp .env.example .env     # عدّل القيم (DATA_DIR، APP_URL، TRUST_PROXY…)
set -a; . ./.env; set +a
node dist/server/index.js
```

أول زيارة: صفحة «الإعداد لأول مرة» لإنشاء المدير. أو من سطر الأوامر:

```bash
node dist/server/cli.js create-admin --email admin@school.om --name "اسم المدير"
# (إن لم تمرّر --password تُولَّد كلمة مؤقتة وتُطبع)
```

### خدمة systemd (Linux)

`/etc/systemd/system/sijilli.service`:

```ini
[Unit]
Description=Sijilli teacher record
After=network.target

[Service]
Type=simple
User=sijilli
WorkingDirectory=/opt/sijilli
EnvironmentFile=/opt/sijilli/.env
ExecStart=/usr/bin/node dist/server/index.js
Restart=on-failure
RestartSec=3
# تقييد الخدمة
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/var/lib/sijilli
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

مع `DATA_DIR=/var/lib/sijilli` في `.env` (والمجلد مملوك لمستخدم `sijilli`). ثم:

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now sijilli
journalctl -u sijilli -f
```

> `ProtectSystem=strict` قد يمنع Chromium من الكتابة في أماكن مؤقتة؛ إن فشل PDF اضبط `PrivateTmp=true` (موجود) وراجع السجل.

## Docker

```bash
docker compose up -d --build
```

- `docker-compose.yml` يربط المنفذ بالمضيف المحلي فقط (`127.0.0.1:3000`)، ويحفظ البيانات في volume `sijilli-data`.
- ضع المتغيرات في ملف `.env` بجوار `docker-compose.yml` (يقرؤه compose تلقائيًا): `APP_URL`, `TRUST_PROXY`, `BACKUP_PASSPHRASE`…
- الصورة تحوي Chromium ولذلك `PDF_NO_SANDBOX=true`.
- فحص صحة داخلي: `GET /api/health`.
- إنشاء مدير من سطر الأوامر داخل الحاوية:
  ```bash
  docker compose exec sijilli node dist/server/cli.js create-admin --email admin@school.om --name "المدير"
  ```

> **تنبيه:** لم يُبنَ `Dockerfile` في بيئة التطوير التي أُنجز فيها المشروع (لا Docker daemon). راجعه وجرّبه على بيئة غير حرجة أولًا.

## الوكيل العكسي وHTTPS (إلزامي خارج الجهاز المحلي)

### Caddy (الأسهل: شهادة تلقائية)

```caddyfile
sijilli.example.om {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
}
```

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name sijilli.example.om;
    ssl_certificate     /etc/letsencrypt/live/sijilli.example.om/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sijilli.example.om/privkey.pem;

    client_max_body_size 600m;     # لرفع نسخ احتياطية للاستعادة (الحد في التطبيق 512 م.ب)

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

وفي `.env`:

```
APP_URL=https://sijilli.example.om
TRUST_PROXY=true
```

> **لا تعرّض المنفذ 3000 للإنترنت مباشرة**: اجعل `HOST=127.0.0.1` (الافتراضي) ودع الوكيل وحده يصل إليه.

## الترقية

1. **خذ نسخة احتياطية** (من الواجهة أو `node dist/server/cli.js backup`). التطبيق نفسه يأخذ نسخة `pre-migration` تلقائيًا إن وُجدت هجرات معلّقة، لكن لا تعتمد على ذلك وحده.
2. حدّث الشيفرة: `git pull && npm ci && npm run build`.
3. أعد التشغيل: `systemctl restart sijilli` (أو `docker compose up -d --build`).
4. عند البدء تُطبَّق الهجرات تلقائيًا. راجع السجل: يجب أن يبدأ الخادم بلا أخطاء.
5. للتراجع: أوقف الخدمة، ثم `node dist/server/cli.js restore <النسخة> --yes`، ثم ارجع للإصدار السابق من الشيفرة.

## الصيانة اليومية

| المهمة | الأمر |
|---|---|
| فحص سلامة القاعدة وعدّ السجلات | `node dist/server/cli.js check` |
| عرض المستخدمين | `node dist/server/cli.js list-users` |
| إعادة تعيين كلمة مرور | `node dist/server/cli.js reset-password --email … [--password …]` |
| نسخة احتياطية الآن | `node dist/server/cli.js backup` |
| حذف الحسابات التجريبية | `node dist/server/cli.js purge-demo` |

(في بيئة التطوير: `npm run cli -- <أمر>`.)

## استكشاف الأخطاء

| العَرَض | السبب والحل |
|---|---|
| «تصدير PDF غير متاح» (501) | Chromium غير موجود. ثبّته أو اضبط `CHROMIUM_PATH`، أو استعمل «طباعة» ثم «حفظ كـ PDF» |
| PDF يفشل داخل Docker/حاوية | اضبط `PDF_NO_SANDBOX=true` |
| «طلب غير مصرّح به» (403) على كل التعديلات خلف وكيل | الوكيل لا يمرّر `Host`/`X-Forwarded-Host` الصحيحين، أو `APP_URL` لا يطابق العنوان الذي يفتحه المتصفح |
| الجلسة لا تثبت بعد تسجيل الدخول على HTTPS | تأكد من `APP_URL=https://…` وأن الوكيل يرسل `X-Forwarded-Proto` و`TRUST_PROXY=true` |
| «الصفحة بيضاء» بعد ترقية | أُعيد البناء دون إعادة تشغيل الخادم (يقرأ `index.html` عند البدء). أعد التشغيل |
| `SQLITE_BUSY` / قفل | لا تفتح ملف القاعدة من برنامج آخر أثناء التشغيل بالكتابة. للقراءة استعمل نسخة احتياطية |
| فشل الاستعادة «النسخة مشفّرة» | اضبط `BACKUP_PASSPHRASE` الأصلية نفسها |
| بطء أول دخول | طبيعي: تجزئة scrypt مقصودة (~0.2–0.5 ثانية) |
| «طلبات كثيرة جدًا» (429) لعدة مستخدمين معًا | كل الطلبات تصل بعنوان الوكيل نفسه. اضبط `TRUST_PROXY=true` ليُقرأ عنوان كل مستخدم، أو ارفع `RATE_LIMIT_PER_MINUTE` |
| فحص الصحة | `curl http://127.0.0.1:3000/api/health` ← `{"status":"ok"}` |
| المساعد: «مفتاح الخدمة غير صالح» (424) | `ANTHROPIC_API_KEY` خاطئ أو بلا صلاحية. نفّذ `ai-check` |
| المساعد: «رفضت خدمة المساعد الطلب» | `AI_MODEL` غير صحيح أو غير متاح لحسابك، أو `AI_BASE_URL` لا يدعم الواجهة. نفّذ `ai-check` |
| المساعد: «تعذّر الوصول إلى خدمة المساعد» | الجدار الناري/الوكيل الصادر يمنع الوصول لمضيف المزوّد |
| المساعد: ينقطع الطلب بعد ~60 ثانية (502/504) | مهلة الوكيل العكسي أقصر من مهلة المساعد (انظر أعلاه) |
| المساعد لا يظهر للمعلمين | يلزم مزوّد مضبوط **و**موافقة المدير (الإعدادات ← المساعد الذكي) ثم تحديث الصفحة |
