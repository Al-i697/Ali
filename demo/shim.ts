// الطبقة الوسيطة للمعاينة التفاعلية: تعمل داخل الصفحة قبل التطبيق وتحلّ محل الخادم.
//  • fetch('/api/...'): تعيد الاستجابات المسجَّلة من التطبيق الحقيقي (demo/record.mjs)، وترفض أي تعديل برسالة عربية واضحة.
//  • الساعة: تُثبَّت على لحظة التسجيل (ثم تمضي طبيعيًا) كي تتطابق التواريخ التي يحسبها المتصفح مع بيانات اليوم المسجَّل.
//  • المساعد الذكي: ردود جاهزة بلا أي اتصال، مع حمايات الإرسال نفسها (الأرقام وأسماء الطلاب) ليُجرَّب مسار النافذة كاملًا.
// لا يُستعمل هذا الملف خارج بناء المعاينة (demo/build.mjs).
import { CONTACT_MESSAGES, NAME_CONFIRM_MESSAGE, buildNameMatcher, cleanFreeText, detectContactData, mentionsStudent } from '../src/server/ai/sanitize';
import { demoKey } from './key.mjs';

declare const __DEMO_DATA__: string;

type Entry = { t: 'j' | 'h'; b: string };
type Payload = { now: string; plexCss: string; entries: Record<string, Entry> };
type Json = Record<string, unknown>;

const READONLY = 'هذه معاينة للتصفح فقط: لا تُحفظ التعديلات. شغّل التطبيق على جهازك لتجرّب الحفظ والتعديل.';
const NOT_IN_PREVIEW = 'هذه الصفحة غير مضمّنة في المعاينة.';

const data = JSON.parse(__DEMO_DATA__) as Payload;
const store = new Map<string, Entry>(Object.entries(data.entries));

// ───────────── الساعة ─────────────
{
  const RealDate = Date;
  const offset = RealDate.parse(data.now) - RealDate.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class DemoDate extends (RealDate as any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      if (args.length === 0) super(RealDate.now() + offset);
      else super(...args);
    }
    static now() {
      return RealDate.now() + offset;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Date = DemoDate;
}

// ───────────── أدوات ─────────────
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
const fail = (status: number, code: string, message: string) => json(status, { error: { code, message } });
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function notify(text: string) {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.textContent = text;
  el.style.cssText =
    'position:fixed;inset-inline:16px;bottom:calc(88px + env(safe-area-inset-bottom,0px));margin-inline:auto;width:fit-content;max-width:min(28rem,calc(100% - 32px));z-index:2147483000;padding:10px 14px;border-radius:12px;background:#14231f;color:#f3f4ee;font:500 14px/1.7 system-ui,sans-serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.28)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

function parse(entry: Entry): unknown {
  return JSON.parse(entry.b);
}

function merge(base: unknown, patch: unknown): unknown {
  if (patch && typeof patch === 'object' && !Array.isArray(patch) && base && typeof base === 'object' && !Array.isArray(base)) {
    const out: Json = { ...(base as Json) };
    for (const [k, v] of Object.entries(patch as Json)) out[k] = merge((base as Json)[k], v);
    return out;
  }
  return patch;
}

// ───────────── القراءة ─────────────
/** عند غياب استجابة مسجَّلة لنطاق تاريخ (أسبوع/شهر خارج ما سُجّل) تُعاد قائمة فارغة لا بيانات فترة أخرى */
const EMPTY: [RegExp, unknown][] = [
  [/^\/lessons$/, { items: [], total: 0 }],
  [/^\/calendar$/, []],
  [/^\/tasks$/, []],
  [/^\/support-plans$/, []],
  [/^\/lab-activities$/, { items: [], total: 0, stats: { planned: 0, done: 0, cancelled: 0, overdue: 0, participants: 0 } }],
];

function respondEntry(entry: Entry): Response {
  if (entry.t === 'h') {
    return new Response(entry.b.split('@@PLEX@@').join(data.plexCss), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  return new Response(entry.b, { status: 200, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

let settingsOverride: unknown = null;

function read(path: string, params: URLSearchParams): Response {
  if (path === '/ai/status') return json(200, aiStatus());
  // تنزيل PDF وExcel يحتاج الخادم (Chromium وExcelJS): نرفضه برسالة واضحة بدل «غير مضمَّن»
  if (/^\/reports\/[^/]+\/(pdf|xlsx)$/.test(path)) return fail(403, 'DEMO_DOWNLOAD', 'تنزيل ملفات PDF وExcel يعمل في التطبيق الكامل.');
  if (path === '/settings' && settingsOverride) return json(200, settingsOverride);

  const key = demoKey(path, params);
  const hit = store.get(key);
  if (hit) {
    // المعاينة تُظهر المساعد جاهزًا (بردود جاهزة)، وأزرار PDF تبقى ظاهرة كما في التطبيق (وتشرح عند الضغط أنها تعمل في التطبيق الكامل)
    if (path === '/system/info') return json(200, { ...(parse(hit) as Json), capabilities: { pdf: true, ai: true } });
    return respondEntry(hit);
  }

  // معاينة التقرير: لا نُعيد تقرير طالب أو مقرر آخر أبدًا. نقبل فقط نفس الهوية (الطالب/المقرر) بمعاملات عرض مختلفة
  if (/^\/reports\/[^/]+\/html$/.test(path)) {
    const identity = ['studentId', 'assignmentId'];
    let best: Entry | null = null;
    let bestScore = -1;
    for (const [k, v] of store) {
      const [p, qs = ''] = k.split('?');
      if (p !== path) continue;
      const cand = new URLSearchParams(qs);
      if (identity.some((id) => (params.get(id) ?? null) !== (cand.get(id) ?? null))) continue;
      let score = 0;
      for (const [name, value] of params) if (cand.get(name) === value) score++;
      score = score * 100 - qs.length / 100;
      if (score > bestScore) {
        best = v;
        bestScore = score;
      }
    }
    return best ? respondEntry(best) : fail(404, 'DEMO_NOT_RECORDED', 'هذا التقرير غير مضمّن في المعاينة. جرّب طالبًا أو مقررًا آخر.');
  }

  const hasRange = params.has('from') || params.has('to');
  const empty = EMPTY.find(([re]) => re.test(path));
  if (empty && hasRange) return json(200, empty[1]);

  // الترشيح غير المسجَّل: أقرب اختلاف في المعاملات لنفس المسار (الأقل معاملات) بدل خطأ
  let best: Entry | null = null;
  let bestLen = Infinity;
  for (const [k, v] of store) {
    const [p, qs = ''] = k.split('?');
    if (p === path && qs.length < bestLen) {
      best = v;
      bestLen = qs.length;
    }
  }
  if (best) return respondEntry(best);
  if (empty) return json(200, empty[1]);
  return fail(404, 'DEMO_NOT_RECORDED', NOT_IN_PREVIEW);
}

// ───────────── الكتابة ─────────────
function write(method: string, path: string, body: unknown): Response | Promise<Response> {
  if (method === 'PATCH' && path === '/settings') {
    // التفضيلات (السمة، شكل الأرقام…) تعمل أثناء الجلسة فقط
    const current = settingsOverride ?? parse(store.get('/settings')!);
    settingsOverride = merge(current, body);
    return json(200, settingsOverride);
  }
  if (method === 'POST' && path === '/ai/run') return runAi(body as Json);
  return fail(403, 'DEMO_READONLY', READONLY);
}

// ───────────── المساعد الذكي (ردود جاهزة) ─────────────
const AI_PROVIDER = { id: 'demo', label: 'مساعد المعاينة (ردود جاهزة)', model: 'عرض توضيحي', host: 'بلا اتصال', local: false };
const AI_PER_DAY = 30;
let aiUsed = 0;
const aiStatus = () => ({ ready: true, provider: AI_PROVIDER, limits: { perDay: AI_PER_DAY, usedToday: aiUsed } });

function studentNames(): string[] {
  const hit = store.get('/students?limit=500');
  if (!hit) return [];
  return ((parse(hit) as { items?: { fullName: string }[] }).items ?? []).map((s) => s.fullName);
}

const split = (total: number, shares: number[]) => {
  const sum = shares.reduce((a, b) => a + b, 0);
  const parts = shares.map((s) => Math.floor((total * s) / sum));
  parts[parts.length - 1] += total - parts.reduce((a, b) => a + b, 0);
  return parts;
};

function lessonDraft(title: string, minutes: number) {
  const [a, b, c, d] = split(minutes, [10, 35, 40, 15]) as [number, number, number, number];
  return {
    outcomes: [`يفسّر الطالب مفهوم «${title}» ويربطه بأمثلة من حياته اليومية`, `يطبّق الطالب ما تعلّمه عن «${title}» في موقف جديد`],
    objectives: [`أن يعرّف الطالب مفهوم «${title}»`, `أن يميّز الطالب بين الأمثلة الصحيحة وغير الصحيحة على «${title}»`, `أن يوظّف الطالب «${title}» في حل نشاط تطبيقي`],
    concepts: [title, 'مثال', 'تطبيق'],
    strategies: ['التعلم التعاوني', 'الاستقصاء الموجَّه', 'الحوار والمناقشة'],
    resources: ['السبورة والعرض التقديمي', 'ورقة عمل', 'الكتاب المدرسي'],
    activities: [
      { phase: 'intro', description: `سؤال تمهيدي يثير الفضول حول «${title}» ويستدعي المعرفة السابقة`, minutes: a },
      { phase: 'main', description: `شرح موجز لـ«${title}» مع مثال محلول ثم مناقشة قصيرة مع الطلاب`, minutes: b },
      { phase: 'practice', description: 'نشاط تعاوني في مجموعات صغيرة يطبّق فيه الطلاب ما تعلّموه ويعرضون نتائجهم', minutes: c },
      { phase: 'closure', description: 'تلخيص أبرز الأفكار بمشاركة الطلاب وتقويم ختامي سريع', minutes: d },
    ],
    assessmentMethods: ['أسئلة شفهية', 'ورقة عمل قصيرة'],
    homework: `حل تدريبات قصيرة على «${title}»`,
    supportIdea: 'أمثلة محلولة إضافية وتدريب موجَّه في مجموعة صغيرة',
    enrichmentIdea: `مهمة بحثية قصيرة تربط «${title}» بموقف من الحياة`,
  };
}

function assessmentIdeas(title: string) {
  return {
    ideas: [
      { title: 'اختبار قصير', type: 'written', description: `خمسة أسئلة متنوعة في نهاية الحصة لقياس فهم «${title}»`, criteria: ['صحة الإجابة', 'وضوح التعليل'] },
      { title: 'عرض شفهي', type: 'oral', description: `يشرح الطالب «${title}» لزملائه في دقيقتين بمثال من اختياره`, criteria: ['دقة المعلومة', 'وضوح العرض'] },
      { title: 'نشاط تطبيقي', type: 'practical', description: `يطبّق الطالب ما تعلّمه عن «${title}» ويدوّن ملاحظاته`, criteria: ['تسلسل الخطوات', 'استنتاج صحيح'] },
    ],
  };
}

function supportIdeas(kind: string, focus: string) {
  return kind === 'enrichment'
    ? {
        reason: `يُظهر الطالب تمكّنًا في «${focus}» ويحتاج إلى مهام تتجاوز المنهج الأساسي`,
        goal: `أن ينجز الطالب مشروعًا مصغّرًا يوظّف فيه «${focus}» بنهاية الفصل`,
        strategies: ['مشروع بحثي مصغّر', 'مسائل تحدٍّ متقدمة', 'تقديم عرض أمام الزملاء', 'مساعدة الزملاء بإشراف المعلم'],
      }
    : {
        reason: `قد تعود الصعوبة في «${focus}» إلى ضعف في مهارات سابقة أو قلة التدريب`,
        goal: `أن يتقن الطالب «${focus}» بدقة 70% فأكثر بنهاية الفصل`,
        strategies: ['نماذج محلولة خطوة بخطوة', 'تدريب متدرج من السهل إلى الأصعب', 'تغذية راجعة فورية', 'ورقة عمل علاجية قصيرة'],
      };
}

async function runAi(b: Json): Promise<Response> {
  const task = String(b.task ?? '');
  const title = cleanFreeText(String(task === 'support-plan-ideas' ? (b.focus ?? '') : (b.title ?? '')));
  if (!['lesson-draft', 'assessment-ideas', 'support-plan-ideas'].includes(task) || !title) {
    return fail(400, 'VALIDATION_ERROR', 'أكمل الحقول المطلوبة');
  }
  const objectives = Array.isArray(b.objectives) ? (b.objectives as unknown[]).map((o) => cleanFreeText(String(o))).filter(Boolean) : [];
  const notes = typeof b.notes === 'string' ? cleanFreeText(b.notes) : '';
  const joined = [title, ...objectives, ...(notes ? [notes] : [])].join('\n');
  if (joined.length > 4000) return fail(400, 'AI_INPUT_TOO_LONG', `النص طويل جدًا (${joined.length} حرفًا). الحد 4000 حرف.`);
  const contact = detectContactData(joined);
  if (contact) return fail(400, 'AI_INPUT_REJECTED', CONTACT_MESSAGES[contact]);
  if (mentionsStudent(joined, buildNameMatcher(studentNames())) && !b.acknowledgeNames) return fail(422, 'AI_NAME_CONFIRM_REQUIRED', NAME_CONFIRM_MESSAGE);
  if (aiUsed >= AI_PER_DAY) return fail(429, 'AI_DAILY_LIMIT', `بلغتَ الحد اليومي للمساعد (${AI_PER_DAY} طلبًا خلال 24 ساعة).`);

  await wait(1300); // يُظهر خطوة «جارٍ الإعداد» كما في التشغيل الحقيقي
  aiUsed++;
  const source = AI_PROVIDER;
  const usage = { usedToday: aiUsed, perDay: AI_PER_DAY };
  if (task === 'lesson-draft') return json(200, { task, result: lessonDraft(title, Number(b.minutes) || 45), source, usage });
  if (task === 'assessment-ideas') return json(200, { task, result: assessmentIdeas(title), source, usage });
  return json(200, { task, result: supportIdeas(String(b.kind ?? 'remedial'), title), source, usage });
}

// ───────────── اعتراض fetch و window.open ─────────────
const realFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (!/^(https?:\/\/[^/]+)?\/api\//.test(raw)) return realFetch(input, init);
  const method = (init?.method ?? (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase();
  const u = new URL(raw, 'http://demo.invalid');
  const path = u.pathname.replace(/^\/api/, '');
  await wait(25 + Math.random() * 45); // زمن شبكة صغير: لا وميض ولا تعارض بين الطلبات المتتابعة
  if (method === 'GET' || method === 'HEAD') return read(path, u.searchParams);
  let body: unknown;
  try {
    body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
  } catch {
    body = {};
  }
  return write(method, path, body);
};

window.open = () => {
  notify('الطباعة وفتح التقارير في نافذة مستقلة تعملان في التطبيق الكامل.');
  return null;
};
window.print = () => notify('الطباعة تعمل في التطبيق الكامل.');

// معاينة التقرير داخل iframe: زر «طباعة» يستدعي contentWindow.print() (وهو الاستعمال الوحيد لـcontentWindow في التطبيق).
// في الإطار المعزول يُعدّ إطار المعاينة عبر-أصل (cross-origin) فيرمي الوصول إليه خطأ أمنيًا ولا يطبع شيئًا؛ فنُعيد كائنًا بسيطًا يشرح الوضع.
{
  const desc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');
  if (desc?.get) {
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
      configurable: true,
      get() {
        const w = desc.get!.call(this) as Window | null;
        return w ? ({ print: () => notify('الطباعة تعمل في التطبيق الكامل.') } as unknown as Window) : w;
      },
    });
  }
}
