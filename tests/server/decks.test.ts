import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DECK_LIMITS } from '../../src/shared/constants';
import { DECK_CONTENT_CSP } from '../../src/server/modules/decks/routes';
import { TestClient, makeEnv, multipart, seedFor, type TestEnv } from './helpers';

let env: TestEnv;
let ctx: Awaited<ReturnType<typeof seedFor>>;
let other: TestClient;
let ownerId: string;

const PAGE = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>الكتل النسبية</title></head><body><script>document.title='x'</script><h1>مرحبًا بالمول</h1></body></html>`;

async function newTeacher(admin: TestClient, email: string) {
  await admin.post('/api/users', { email, password: 'Temp-Pass-91', fullName: 'معلم ' + email, role: 'teacher' });
  const t = new TestClient(env.app);
  await t.login(email, 'Temp-Pass-91');
  await t.post('/api/auth/password', { currentPassword: 'Temp-Pass-91', newPassword: 'Real-Pass-77' });
  return t;
}

/** رفع ملف بأسلوب المتصفح: الحقول ثم الملف */
function upload(c: TestClient, method: 'POST' | 'PUT', url: string, name: string, content: Buffer | string, fields: Record<string, string> = {}) {
  const { payload, headers } = multipart(name, content, 'text/html', fields);
  return env.app.inject({
    method,
    url,
    payload,
    headers: { ...headers, cookie: [...c.cookies].map(([k, v]) => `${k}=${v}`).join('; '), 'x-sijilli-client': 'web' },
  });
}

beforeAll(async () => {
  env = await makeEnv();
  const admin = new TestClient(env.app);
  await admin.setupAdmin();
  const t1 = await newTeacher(admin, 'a@school.om');
  other = await newTeacher(admin, 'b@school.om');
  ctx = await seedFor(t1);
  ownerId = (await t1.get('/api/auth/me')).body.user.id;
});
afterAll(async () => {
  await env.app.close();
});

const clean = () => env.db.sqlite.prepare('delete from interactive_decks where owner_id = ?').run(ownerId);

describe('الرفع والقراءة', () => {
  afterAll(clean);

  it('يرفع درسًا بعنوانه ومادته (201) ويعيد حجمه دون صفحته، ويسجّل الحدث في التدقيق بلا العنوان', async () => {
    const r = await upload(ctx.c, 'POST', '/api/decks', 'lesson31.html', PAGE, { title: 'الكتل النسبية ٣-١', subjectId: ctx.subject.id, description: 'درس المول' });
    expect(r.statusCode).toBe(201);
    const deck = r.json();
    expect(deck).toMatchObject({ title: 'الكتل النسبية ٣-١', subjectId: ctx.subject.id, subjectName: 'العلوم', description: 'درس المول', bytes: Buffer.byteLength(PAGE) });
    expect(deck).not.toHaveProperty('html');
    const logs = env.db.sqlite.prepare("select meta, entity_id from audit_log where action='deck_created'").all() as { meta: string; entity_id: string }[];
    expect(logs.at(-1)!.entity_id).toBe(deck.id);
    expect(logs.at(-1)!.meta).not.toContain('الكتل');
  });

  it('يسرد الدروس ويبحث بعربية مطبَّعة ويصفّي بالمادة، ولا يعيد الصفحة في القائمة', async () => {
    await upload(ctx.c, 'POST', '/api/decks', 'a.html', PAGE, { title: 'أنواع الروابط الكيميائية' });
    const all = await ctx.c.get('/api/decks');
    expect(all.body).toHaveLength(2);
    expect(JSON.stringify(all.body)).not.toContain('<script>');
    expect((await ctx.c.get('/api/decks?q=الروابط')).body.map((d: { title: string }) => d.title)).toEqual(['أنواع الروابط الكيميائية']);
    expect((await ctx.c.get('/api/decks?q=الكتل')).body).toHaveLength(1);
    expect((await ctx.c.get(`/api/decks?subjectId=${ctx.subject.id}`)).body).toHaveLength(1);
  });

  it('يعدّل العنوان والوصف والمادة (PATCH) ويفرّغ المادة بـnull', async () => {
    const id = (await ctx.c.get('/api/decks?q=الروابط')).body[0].id;
    const r = await ctx.c.patch(`/api/decks/${id}`, { title: 'الروابط الأيونية', description: '  ', subjectId: ctx.subject.id });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ title: 'الروابط الأيونية', description: null, subjectName: 'العلوم' });
    expect((await ctx.c.patch(`/api/decks/${id}`, { subjectId: null })).body.subjectName).toBeNull();
    expect((await ctx.c.get('/api/decks?q=الأيونية')).body).toHaveLength(1);
  });

  it('يستبدل صفحة الدرس بنسخة جديدة دون تغيير بياناته', async () => {
    const id = (await ctx.c.get('/api/decks?q=الكتل')).body[0].id;
    const next = PAGE.replace('مرحبًا بالمول', 'نسخة محدّثة');
    const r = await upload(ctx.c, 'PUT', `/api/decks/${id}/file`, 'v2.html', next);
    expect(r.statusCode).toBe(200);
    expect(r.json()).toMatchObject({ id, title: 'الكتل النسبية ٣-١', bytes: Buffer.byteLength(next) });
    expect((await ctx.c.get(`/api/decks/${id}/content`)).body).toContain('نسخة محدّثة');
  });

  it('يحذف الدرس وصفحته معًا', async () => {
    const id = (await ctx.c.get('/api/decks?q=الأيونية')).body[0].id;
    expect((await ctx.c.del(`/api/decks/${id}`)).status).toBe(200);
    expect((await ctx.c.get(`/api/decks/${id}`)).status).toBe(404);
    const left = env.db.sqlite.prepare('select count(*) n from interactive_deck_files where deck_id = ?').get(id) as { n: number };
    expect(left.n).toBe(0);
  });
});

describe('المحتوى المعزول', () => {
  afterAll(clean);

  it('يرسل الصفحة كما رُفعت مع سياسة عزل صارمة وبلا تخزين مؤقت', async () => {
    const id = (await upload(ctx.c, 'POST', '/api/decks', 'p.html', PAGE, { title: 'درس' })).json().id;
    const r = await ctx.c.get(`/api/decks/${id}/content`);
    expect(r.status).toBe(200);
    expect(r.body).toBe(PAGE);
    expect(String(r.headers['content-type'])).toContain('text/html');
    expect(r.headers['content-security-policy']).toBe(DECK_CONTENT_CSP);
    expect(r.headers['cache-control']).toBe('no-store');
    expect(r.headers['x-content-type-options']).toBe('nosniff');
  });

  it('السياسة تعزل الأصل (sandbox بلا same-origin) وتمنع الشبكة والنماذج والإطارات', () => {
    const sandbox = DECK_CONTENT_CSP.split('; ').find((d) => d.startsWith('sandbox'))!;
    expect(sandbox).toContain('allow-scripts');
    expect(sandbox).not.toContain('allow-same-origin');
    for (const d of ["connect-src 'none'", "form-action 'none'", "frame-src 'none'", "object-src 'none'", "base-uri 'none'", "default-src 'none'"]) {
      expect(DECK_CONTENT_CSP).toContain(d);
    }
    // الخارج الوحيد المسموح: خطوط Google
    const hosts = DECK_CONTENT_CSP.match(/https:\/\/[a-z.]+/g) ?? [];
    expect(new Set(hosts)).toEqual(new Set(['https://fonts.googleapis.com', 'https://fonts.gstatic.com']));
  });

  it('لا يقدَّم المحتوى لغير المسجَّل (401)', async () => {
    const id = (await upload(ctx.c, 'POST', '/api/decks', 'p.html', PAGE, { title: 'درس' })).json().id;
    expect((await new TestClient(env.app).get(`/api/decks/${id}/content`)).status).toBe(401);
  });
});

describe('العزل بين المعلمين', () => {
  afterAll(clean);

  it('معلم آخر لا يرى ولا يقرأ ولا يعدّل ولا يستبدل ولا يحذف (404)', async () => {
    const id = (await upload(ctx.c, 'POST', '/api/decks', 'p.html', PAGE, { title: 'درس خاص' })).json().id;
    expect((await other.get('/api/decks')).body).toEqual([]);
    expect((await other.get(`/api/decks/${id}`)).status).toBe(404);
    expect((await other.get(`/api/decks/${id}/content`)).status).toBe(404);
    expect((await other.patch(`/api/decks/${id}`, { title: 'سطو' })).status).toBe(404);
    expect((await upload(other, 'PUT', `/api/decks/${id}/file`, 'x.html', PAGE)).statusCode).toBe(404);
    expect((await other.del(`/api/decks/${id}`)).status).toBe(404);
    expect((await ctx.c.get(`/api/decks/${id}`)).body.title).toBe('درس خاص');
  });

  it('لا يسند درسه إلى مادة معلم آخر', async () => {
    const r = await upload(other, 'POST', '/api/decks', 'p.html', PAGE, { title: 'درسي', subjectId: ctx.subject.id });
    expect(r.statusCode).toBe(404);
    expect((await other.get('/api/decks')).body).toEqual([]);
  });
});

describe('التحقق والحدود', () => {
  afterAll(clean);

  it('يرفض العنوان الفارغ ومادة بمعرّف غير صالح (400 برسالة عربية)', async () => {
    const empty = await upload(ctx.c, 'POST', '/api/decks', 'p.html', PAGE, { title: '   ' });
    expect(empty.statusCode).toBe(400);
    expect(empty.json().error.fields).toHaveProperty('title');
    expect((await upload(ctx.c, 'POST', '/api/decks', 'p.html', PAGE, { title: 'د', subjectId: 'x' })).statusCode).toBe(400);
  });

  it('يرفض ما ليس صفحة HTML: امتداد خاطئ وملف فارغ وبايتات ثنائية وترميز غير UTF-8 ونص عادي', async () => {
    const code = async (name: string, content: Buffer | string) => (await upload(ctx.c, 'POST', '/api/decks', name, content, { title: 'د' })).json().error.code;
    expect(await code('x.exe', PAGE)).toBe('DECK_NOT_HTML');
    expect(await code('x.html', '')).toBe('DECK_EMPTY');
    expect(await code('x.html', Buffer.from([0xff, 0xfe, 0x00, 0x3c, 0x62]))).toBe('DECK_ENCODING');
    expect(await code('x.html', 'مجرد نص عادي لا وسوم فيه')).toBe('DECK_NOT_HTML');
    expect((await ctx.c.get('/api/decks')).body).toEqual([]);
  });

  it('يقبل جزء صفحة بلا html/body (كما تحفظه منصات العرض) ويُسقط BOM', async () => {
    const r = await upload(ctx.c, 'POST', '/api/decks', 'frag.htm', '﻿<style>b{color:red}</style><div>جزء</div>', { title: 'جزء' });
    expect(r.statusCode).toBe(201);
    const body = (await ctx.c.get(`/api/decks/${r.json().id}/content`)).body as string;
    expect(body.charCodeAt(0)).not.toBe(0xfeff);
    expect(body).toContain('<div>جزء</div>');
  });

  it('يرفض ما يتجاوز الحد الأقصى للحجم (413) ولا يحفظ شيئًا', async () => {
    const big = Buffer.concat([Buffer.from('<div>'), Buffer.alloc(DECK_LIMITS.maxBytes, 0x61)]);
    const r = await upload(ctx.c, 'POST', '/api/decks', 'big.html', big, { title: 'ضخم' });
    expect(r.statusCode).toBe(413);
    expect((await ctx.c.get('/api/decks?q=ضخم')).body).toEqual([]);
  });

  it('يرفض طلبًا ليس multipart وطلب كتابة بلا رأس CSRF', async () => {
    expect((await ctx.c.post('/api/decks', { title: 'د' })).status).toBe(400);
    const noCsrf = new TestClient(env.app, false);
    noCsrf.cookies = ctx.c.cookies;
    expect((await noCsrf.post('/api/decks', {})).status).toBe(403);
  });

  it('يحدّ عدد دروس المعلم (409) ويعيد الإذن بعد الحذف', async () => {
    clean(); // يبدأ العدّ من صفر مهما أُنشئ قبله في المجموعة
    const ins = env.db.sqlite.prepare("insert into interactive_decks (id, owner_id, title, bytes, created_at, updated_at) values (?, ?, 'ح', 1, '2026-01-01', '2026-01-01')");
    for (let i = 0; i < DECK_LIMITS.maxPerOwner; i++) ins.run(`filler-${i}`, ownerId);
    const r = await upload(ctx.c, 'POST', '/api/decks', 'p.html', PAGE, { title: 'فوق الحد' });
    expect(r.statusCode).toBe(409);
    expect(r.json().error.code).toBe('DECK_LIMIT');
    env.db.sqlite.prepare("delete from interactive_decks where id = 'filler-0'").run();
    expect((await upload(ctx.c, 'POST', '/api/decks', 'p.html', PAGE, { title: 'يدخل' })).statusCode).toBe(201);
  });
});

describe('الحذف المتسلسل', () => {
  afterAll(clean);

  it('حذف المادة يُبقي الدرس بلا مادة، وحذف الحساب يمحو دروسه وصفحاتها', async () => {
    clean();
    const subj = (await ctx.c.post('/api/subjects', { name: 'مادة مؤقتة' })).body;
    const id = (await upload(ctx.c, 'POST', '/api/decks', 'p.html', PAGE, { title: 'درس المادة', subjectId: subj.id })).json().id;
    expect((await ctx.c.del(`/api/subjects/${subj.id}`)).status).toBe(200);
    expect((await ctx.c.get(`/api/decks/${id}`)).body).toMatchObject({ subjectId: null, subjectName: null });

    const admin = new TestClient(env.app);
    await admin.login('admin@school.om', 'Str0ng-Pass!');
    const tmp = await newTeacher(admin, 'tmp@school.om');
    const tmpId = (await tmp.get('/api/auth/me')).body.user.id as string;
    await upload(tmp, 'POST', '/api/decks', 'p.html', PAGE, { title: 'درس مؤقت' });
    env.db.sqlite.prepare('delete from users where id = ?').run(tmpId);
    expect((env.db.sqlite.prepare('select count(*) n from interactive_decks where owner_id = ?').get(tmpId) as { n: number }).n).toBe(0);
    expect((env.db.sqlite.prepare("select count(*) n from interactive_deck_files where deck_id not in (select id from interactive_decks)").get() as { n: number }).n).toBe(0);
  });
});
