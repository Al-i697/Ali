import { afterEach, describe, expect, it } from 'vitest';
import { runAiCheck } from '../../src/server/ai/check';
import type { AiConfig } from '../../src/server/config';
import { errorBody, messageBody, startFakeAnthropic, type FakeReply, type RecordedRequest } from './fake-anthropic';

const KEY = 'sk-ant-test-SECRET-KEY-654321';

type Fake = Awaited<ReturnType<typeof startFakeAnthropic>>;
const fakes: Fake[] = [];
async function setup(handler: (r: RecordedRequest, n: number) => FakeReply | Promise<FakeReply>, over: Partial<AiConfig> = {}) {
  const fake = await startFakeAnthropic(handler);
  fakes.push(fake);
  const cfg: AiConfig = {
    provider: 'anthropic',
    apiKey: KEY,
    baseUrl: fake.baseUrl,
    model: 'claude-opus-5-5',
    effort: 'low',
    timeoutMs: 5000,
    dailyLimit: 30,
    perMinute: 6,
    maxConcurrency: 3,
    ...over,
  };
  return { fake, cfg };
}
afterEach(async () => {
  await Promise.all(fakes.splice(0).map((f) => f.close()));
});

describe('ai-check (فحص اتصال المساعد من سطر الأوامر)', () => {
  it('غير مضبوط: لا يتصل بأحد ويشرح ما يلزم', async () => {
    const r = await runAiCheck({ provider: 'none', apiKey: null, baseUrl: null, model: 'm', effort: 'low', timeoutMs: 5000, dailyLimit: 30, perMinute: 6, maxConcurrency: 3 });
    expect(r).toMatchObject({ ok: false, kind: 'not_configured' });
    expect(r.ok === false && r.message).toContain('AI_PROVIDER=anthropic');
  });

  it('نجاح: يرسل طلبًا واحدًا صغيرًا بلا بيانات حقيقية ويعيد النموذج والزمن والرموز', async () => {
    const { fake, cfg } = await setup(() => ({ body: messageBody('{"ok":true}', { model: 'claude-opus-5-5' }) }));
    const r = await runAiCheck(cfg);
    expect(r).toMatchObject({ ok: true, provider: 'Claude (Anthropic)', model: 'claude-opus-5-5', answeredBy: 'claude-opus-5-5', inputTokens: 120, outputTokens: 340 });
    expect(r.ok && r.host).toMatch(/^127\.0\.0\.1:\d+$/);
    expect(fake.requests).toHaveLength(1);
    expect(fake.requests[0]!.headers['x-api-key']).toBe(KEY);
    expect(JSON.stringify(fake.requests[0]!.body)).not.toContain(KEY);
  });

  it('لا يعيد المحاولة عند الفشل: يظهر الخطأ الحقيقي من أول مرة (429 مثلًا)', async () => {
    const { fake, cfg } = await setup(() => ({ status: 429, body: errorBody('rate_limit_error', 'slow down') }));
    const r = await runAiCheck(cfg);
    expect(r).toMatchObject({ ok: false, kind: 'rate_limit', status: 429 });
    expect(fake.requests).toHaveLength(1);
  });

  it.each([
    [401, 'authentication_error', 'auth', 'ANTHROPIC_API_KEY'],
    [404, 'not_found_error', 'bad_request', 'AI_MODEL'],
    [500, 'api_error', 'server', '5xx'],
  ] as const)('HTTP %i ← %s: النوع %s ورسالة إرشاد للمدير', async (status, type, kind, hint) => {
    const { cfg } = await setup(() => ({ status, body: errorBody(type, 'detail that must not matter') }));
    const r = await runAiCheck(cfg);
    expect(r).toMatchObject({ ok: false, kind, status });
    expect(r.ok === false && r.message).toContain(hint);
    expect(r.ok === false && r.requestId).toBe('req_test_01');
  });

  it('رد ناقص أو مرفوض أو غير مطابق: أنواع واضحة', async () => {
    const refused = await setup(() => ({ body: messageBody('', { stop_reason: 'refusal', content: [] }) }));
    expect(await runAiCheck(refused.cfg)).toMatchObject({ ok: false, kind: 'refused' });
    const cut = await setup(() => ({ body: messageBody('{"ok":', { stop_reason: 'max_tokens' }) }));
    expect(await runAiCheck(cut.cfg)).toMatchObject({ ok: false, kind: 'truncated' });
    const bad = await setup(() => ({ body: messageBody('{"unexpected":1}') }));
    expect(await runAiCheck(bad.cfg)).toMatchObject({ ok: false, kind: 'invalid_output' });
  });

  it('الخادم غير متاح: network؛ والمهلة: timeout — والمفتاح لا يظهر في أي ناتج', async () => {
    const { cfg } = await setup(() => ({ body: messageBody('{"ok":true}') }));
    const dead = { ...cfg, baseUrl: 'http://127.0.0.1:1' };
    const net = await runAiCheck(dead);
    expect(net).toMatchObject({ ok: false, kind: 'network' });

    const slow = await setup(() => ({ delayMs: 1500, body: messageBody('{"ok":true}') }), { timeoutMs: 300 });
    const to = await runAiCheck({ ...slow.cfg, timeoutMs: 300 });
    expect(to).toMatchObject({ ok: false, kind: 'timeout' });

    expect(JSON.stringify([net, to])).not.toContain(KEY);
  });
});
