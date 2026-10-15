import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/server/app';
import { loadConfig, type AppConfig } from '../../src/server/config';
import { AppDatabase } from '../../src/server/db/client';

export type TestEnv = { app: FastifyInstance; db: AppDatabase; config: AppConfig };

export async function makeEnv(overrides: Record<string, string> = {}): Promise<TestEnv> {
  const config = loadConfig({ NODE_ENV: 'test', DATA_DIR: '/tmp/sijilli-test-unused', ...overrides });
  const db = AppDatabase.open(':memory:');
  db.migrate(config.migrationsDir);
  const app = await buildApp({ config, db });
  await app.ready();
  return { app, db, config };
}

export type Res<T = any> = { status: number; body: T; headers: Record<string, any>; raw: Buffer };

/** عميل اختبار بحافظة كوكيز يحاكي المتصفح (مع رأس CSRF المطلوب) */
export class TestClient {
  cookies = new Map<string, string>();
  constructor(
    readonly app: FastifyInstance,
    readonly csrf = true,
  ) {}

  private cookieHeader() {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  async request<T = any>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    url: string,
    body?: unknown,
    headers: Record<string, string> = {},
  ): Promise<Res<T>> {
    const res = await this.app.inject({
      method,
      url,
      payload: body === undefined ? undefined : (body as any),
      headers: {
        ...(this.cookies.size ? { cookie: this.cookieHeader() } : {}),
        ...(this.csrf && method !== 'GET' ? { 'x-sijilli-client': 'web' } : {}),
        ...headers,
      },
    });
    for (const c of ([] as string[]).concat((res.headers['set-cookie'] as any) ?? [])) {
      const [pair] = c.split(';');
      const eq = pair!.indexOf('=');
      const name = pair!.slice(0, eq);
      const value = pair!.slice(eq + 1);
      if (/Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(c) || value === '') this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
    let parsed: any = undefined;
    const ct = String(res.headers['content-type'] ?? '');
    if (ct.includes('application/json')) parsed = res.json();
    else if (ct.startsWith('text/')) parsed = res.body;
    return { status: res.statusCode, body: parsed, headers: res.headers, raw: res.rawPayload };
  }

  get = <T = any>(url: string, headers?: Record<string, string>) => this.request<T>('GET', url, undefined, headers);
  post = <T = any>(url: string, body?: unknown, headers?: Record<string, string>) => this.request<T>('POST', url, body ?? {}, headers);
  patch = <T = any>(url: string, body?: unknown) => this.request<T>('PATCH', url, body ?? {});
  put = <T = any>(url: string, body?: unknown) => this.request<T>('PUT', url, body ?? {});
  del = <T = any>(url: string) => this.request<T>('DELETE', url);

  /** إعداد أول مدير (أو تسجيل دخول مستخدم موجود) وإرجاع العميل جاهزًا */
  async setupAdmin(email = 'admin@school.om', password = 'Str0ng-Pass!', fullName = 'مدير النظام') {
    const r = await this.post('/api/auth/setup', { email, password, fullName });
    if (r.status !== 201) throw new Error(`setup failed: ${r.status} ${JSON.stringify(r.body)}`);
    return this;
  }

  async login(email: string, password: string, remember = false) {
    return this.post('/api/auth/login', { email, password, remember });
  }
}

export const PASSWORD = 'Str0ng-Pass!';

/** يبني جسم multipart/form-data يدويًا (لرفع الملفات في الاختبارات) */
export function multipart(filename: string, content: Buffer | string, mime = 'text/csv') {
  const boundary = '----sijilli' + Math.random().toString(16).slice(2);
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`,
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([head, Buffer.isBuffer(content) ? content : Buffer.from(content), tail]);
  return { payload: body, headers: { 'content-type': `multipart/form-data; boundary=${boundary}` } };
}

/** يهيّئ معلمًا جاهزًا بعام وشعبة ومادة وثلاثة طلاب — لتقليل التكرار في الاختبارات */
export async function seedTeacher(app: import('fastify').FastifyInstance, email = 'admin@school.om') {
  const c = new TestClient(app);
  await c.setupAdmin(email);
  return seedFor(c);
}

export async function seedFor(c: TestClient) {
  const year = (await c.post('/api/years', { name: '2026/2027', startDate: '2026-08-23', endDate: '2027-06-17' })).body;
  const subject = (await c.post('/api/subjects', { name: 'العلوم' })).body;
  const section = (
    await c.post('/api/sections', { yearId: year.id, gradeLevel: 10, name: '3', subjectIds: [subject.id] })
  ).body;
  const roster = (
    await c.post(`/api/sections/${section.id}/students`, {
      students: [
        { fullName: 'أحمد بن سالم الحارثي', studentNumber: '10000001', gender: 'male' },
        { fullName: 'فاطمة بنت خالد البلوشية', studentNumber: '10000002', gender: 'female' },
        { fullName: 'سعيد بن ناصر الهنائي', studentNumber: '10000003', gender: 'male' },
      ],
    })
  ).body;
  const assignmentId = section.assignments[0].id as string;
  return { c, year, term1: year.terms[0], term2: year.terms[1], subject, section, roster, assignmentId };
}
