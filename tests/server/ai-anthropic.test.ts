import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createAnthropicProvider } from '../../src/server/ai/anthropic';
import { AiError, type AiProvider } from '../../src/server/ai/provider';
import { errorBody, messageBody, startFakeAnthropic, type FakeReply, type RecordedRequest } from './fake-anthropic';

const KEY = 'sk-ant-test-SECRET-KEY-123456';
const schema = z.object({ items: z.array(z.string()), note: z.string().nullable() });
const ok = { items: ['أ', 'ب'], note: null };
const call = (p: AiProvider) => p.complete({ system: 'تعليمات النظام', user: 'نص المعلم', schema });

type Fake = Awaited<ReturnType<typeof startFakeAnthropic>>;
const fakes: Fake[] = [];
async function setup(handler: (r: RecordedRequest, n: number) => FakeReply | Promise<FakeReply>, over: Record<string, unknown> = {}) {
  const fake = await startFakeAnthropic(handler);
  fakes.push(fake);
  const provider = createAnthropicProvider({ apiKey: KEY, baseUrl: fake.baseUrl, model: 'claude-opus-5-5', effort: 'low', timeoutMs: 5000, maxRetries: 0, ...over });
  return { fake, provider };
}
afterEach(async () => {
  await Promise.all(fakes.splice(0).map((f) => f.close()));
});

describe('مزوّد Claude: شكل الطلب', () => {
  it('يرسل طلب Messages صحيحًا: المفتاح والنموذج والتعليمات والبنية المنظَّمة والرجوع التلقائي، بلا thinking ولا sampling', async () => {
    const { fake, provider } = await setup(() => ({ body: messageBody(JSON.stringify(ok)) }));
    const res = await call(provider);
    expect(res).toEqual({ data: ok, model: 'claude-opus-5-5', usage: { inputTokens: 120, outputTokens: 340 } });

    expect(fake.requests).toHaveLength(1);
    const r = fake.requests[0]!;
    expect(r.method).toBe('POST');
    expect(r.url).toMatch(/^\/v1\/messages/);
    expect(r.headers['x-api-key']).toBe(KEY);
    expect(r.headers['anthropic-version']).toBeTruthy();
    expect(String(r.headers['anthropic-beta'])).toContain('server-side-fallback-2026-07-01');
    expect(r.body).toMatchObject({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      system: 'تعليمات النظام',
      messages: [{ role: 'user', content: 'نص المعلم' }],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema' } },
    });
    expect(r.body.output_config.format.schema.properties).toHaveProperty('items');
    expect(r.body.output_config.format.schema.additionalProperties).toBe(false);
    expect(r.body).not.toHaveProperty('thinking');
    expect(r.body).not.toHaveProperty('temperature');
    expect(r.body).not.toHaveProperty('top_p');
    expect(JSON.stringify(r.body)).not.toContain(KEY); // المفتاح في الرأس فقط
  });

  it('معلومات المزوّد: المضيف ومحلي أم لا', async () => {
    const { provider } = await setup(() => ({ body: messageBody('{}') }));
    expect(provider).toMatchObject({ id: 'anthropic', label: 'Claude (Anthropic)', model: 'claude-opus-5-5', local: true });
    expect(provider.host).toMatch(/^127\.0\.0\.1:\d+$/);
    const remote = createAnthropicProvider({ apiKey: KEY, model: 'm', effort: 'low', timeoutMs: 5000 });
    expect(remote).toMatchObject({ host: 'api.anthropic.com', local: false });
  });

  it('إن رفض المزوّد بيتا الرجوع (400 لحساب لم يُفعَّل له) يُعاد الطلب بدونه ويُتذكَّر ذلك', async () => {
    const { fake, provider } = await setup((r) =>
      String(r.headers['anthropic-beta'] ?? '').includes('server-side-fallback')
        ? { status: 400, body: errorBody('invalid_request_error', 'Unexpected value(s) `server-side-fallback-2026-07-01` for the `anthropic-beta` header.') }
        : { body: messageBody(JSON.stringify(ok)) },
    );
    expect((await call(provider)).data).toEqual(ok);
    expect(fake.requests).toHaveLength(2);
    expect(fake.requests[1]!.body).not.toHaveProperty('fallbacks');
    expect(fake.requests[1]!.headers['anthropic-beta']).toBeUndefined();
    await call(provider); // الطلب التالي مباشرةً بلا بيتا
    expect(fake.requests).toHaveLength(3);
    expect(fake.requests[2]!.body).not.toHaveProperty('fallbacks');
  });

  it('رفض الرجوع التلقائي بأي رسالة 400 (نموذج أو بوابة لا تدعمه) يُعاد بدونه مرة واحدة ويُتذكَّر', async () => {
    const { fake, provider } = await setup((r) =>
      r.body.fallbacks ? { status: 400, body: errorBody('invalid_request_error', 'fallbacks: not supported for this model') } : { body: messageBody(JSON.stringify(ok)) },
    );
    expect((await call(provider)).data).toEqual(ok);
    expect(fake.requests).toHaveLength(2);
    expect(fake.requests[1]!.body).not.toHaveProperty('fallbacks');
    await call(provider);
    expect(fake.requests).toHaveLength(3);
    expect(fake.requests[2]!.body).not.toHaveProperty('fallbacks');
  });

  it('نماذج Haiku: لا يُرسَل الرجوع التلقائي ولا رأس البيتا من الأصل', async () => {
    const { fake, provider } = await setup(() => ({ body: messageBody(JSON.stringify(ok), { model: 'claude-haiku-5-5' }) }), { model: 'claude-haiku-5-5' });
    expect((await call(provider)).data).toEqual(ok);
    expect(fake.requests).toHaveLength(1);
    expect(fake.requests[0]!.body).not.toHaveProperty('fallbacks');
    expect(fake.requests[0]!.headers['anthropic-beta']).toBeUndefined();
    expect(fake.requests[0]!.body.model).toBe('claude-haiku-5-5');
  });

  it('طلب 400 حقيقي (ليس بسبب الرجوع) يصير bad_request بعد محاولة واحدة إضافية، ويبقى الرجوع مفعّلًا لما بعده', async () => {
    const { fake, provider } = await setup(() => ({ status: 400, body: errorBody('invalid_request_error', 'messages: roles must alternate') }));
    await expect(call(provider)).rejects.toMatchObject({ kind: 'bad_request', detail: { status: 400 } });
    expect(fake.requests).toHaveLength(2);
    expect(fake.requests[0]!.body.fallbacks).toBe('default');
    expect(fake.requests[1]!.body).not.toHaveProperty('fallbacks');
    await expect(call(provider)).rejects.toMatchObject({ kind: 'bad_request' });
    expect(fake.requests[2]!.body.fallbacks).toBe('default'); // لم يُعطَّل الرجوع بسبب خطأ ليس منه
  });
});

describe('مزوّد Claude: معالجة الرد', () => {
  it('الرفض (HTTP 200 مع stop_reason=refusal) يصير refused مع الفئة قبل قراءة المحتوى', async () => {
    const { provider } = await setup(() => ({ body: messageBody('', { content: [], stop_reason: 'refusal', stop_details: { type: 'refusal', category: 'bio', explanation: 'x' } }) }));
    await expect(call(provider)).rejects.toMatchObject({ kind: 'refused', detail: { category: 'bio' } });
  });

  it('تجاوز max_tokens يصير truncated ولو كان المحتوى JSON ناقصًا', async () => {
    const { provider } = await setup(() => ({ body: messageBody('{"items": ["أ"', { stop_reason: 'max_tokens' }) }));
    await expect(call(provider)).rejects.toMatchObject({ kind: 'truncated' });
  });

  it.each([
    ['نص ليس JSON', 'مرحبًا! إليك الاقتراح'],
    ['JSON لا يطابق البنية', '{"items": "ليست قائمة", "note": null}'],
    ['حقل ناقص', '{"items": []}'],
  ])('رد غير صالح (%s) يصير invalid_output', async (_n, text) => {
    const { provider } = await setup(() => ({ body: messageBody(text) }));
    await expect(call(provider)).rejects.toMatchObject({ kind: 'invalid_output' });
  });

  it('يتجاهل كتل thinking ويقرأ النص، ويعيد النموذج الذي أجاب فعلًا (قد يكون بديلًا عند الرجوع)', async () => {
    const { provider } = await setup(() => ({
      body: messageBody('', { model: 'claude-opus-4-8', content: [{ type: 'thinking', thinking: '', signature: 'sig' }, { type: 'text', text: JSON.stringify(ok) }] }),
    }));
    expect(await call(provider)).toMatchObject({ data: ok, model: 'claude-opus-4-8' });
  });
});

describe('مزوّد Claude: تصنيف الأخطاء (بلا أسرار)', () => {
  it.each([
    [401, 'authentication_error', 'auth'],
    [403, 'permission_error', 'auth'],
    [404, 'not_found_error', 'bad_request'],
    [429, 'rate_limit_error', 'rate_limit'],
    [500, 'api_error', 'server'],
    [529, 'overloaded_error', 'server'],
  ])('HTTP %i ← %s ← %s', async (status, type, kind) => {
    const { provider } = await setup(() => ({ status, body: errorBody(type, `رسالة المزوّد ${KEY}`) }));
    const err = await call(provider).catch((e) => e);
    expect(err).toBeInstanceOf(AiError);
    expect(err).toMatchObject({ kind, detail: { status, requestId: 'req_test_01' } });
    // لا رسالة المزوّد (قد تحوي أسرارًا) ولا المفتاح في الخطأ بأي شكل
    expect(JSON.stringify({ m: err.message, d: err.detail, s: String(err) })).not.toContain(KEY);
  });

  it('انتهاء المهلة ← timeout', async () => {
    const { provider } = await setup(() => ({ body: messageBody('{}'), delayMs: 1500 }), { timeoutMs: 200 });
    await expect(call(provider)).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('تعذّر الاتصال ← network', async () => {
    const provider = createAnthropicProvider({ apiKey: KEY, baseUrl: 'http://127.0.0.1:1', model: 'm', effort: 'low', timeoutMs: 3000, maxRetries: 0 });
    await expect(call(provider)).rejects.toMatchObject({ kind: 'network' });
  });

  it('الـSDK يعيد المحاولة مرة عند 5xx إن سُمح (maxRetries=1) فينجح الطلب الثاني', async () => {
    const { fake, provider } = await setup((_r, n) => (n === 1 ? { status: 500, body: errorBody('api_error', 'x') } : { body: messageBody(JSON.stringify(ok)) }), { maxRetries: 1 });
    expect((await call(provider)).data).toEqual(ok);
    expect(fake.requests).toHaveLength(2);
  });
});
