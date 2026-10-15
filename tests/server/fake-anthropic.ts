// خادم HTTP محلي يحاكي واجهة Claude Messages لاختبار المزوّد بلا شبكة ولا مفتاح حقيقي.
// يسجّل كل طلب (المسار، الرؤوس، الجسم) ويردّ بما يحدده الاختبار.
import http from 'node:http';
import type { AddressInfo } from 'node:net';

export type RecordedRequest = { method: string; url: string; headers: http.IncomingHttpHeaders; body: any };
export type FakeReply = { status?: number; body?: unknown; delayMs?: number; headers?: Record<string, string> };

export const messageBody = (text: string, over: Record<string, unknown> = {}) => ({
  id: 'msg_test_01',
  type: 'message',
  role: 'assistant',
  model: 'claude-opus-5-5',
  content: [{ type: 'text', text }],
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: { input_tokens: 120, output_tokens: 340 },
  ...over,
});

export const errorBody = (type: string, message: string) => ({ type: 'error', error: { type, message }, request_id: 'req_test_01' });

export async function startFakeAnthropic(handler: (req: RecordedRequest, n: number) => FakeReply | Promise<FakeReply>) {
  const requests: RecordedRequest[] = [];
  const respond = async (req: http.IncomingMessage, res: http.ServerResponse, raw: string) => {
    let body: any;
    try {
      body = JSON.parse(raw || 'null');
    } catch {
      body = null;
    }
    const rec = { method: req.method ?? '', url: req.url ?? '', headers: req.headers, body };
    requests.push(rec);
    const reply = await handler(rec, requests.length);
    if (reply.delayMs) await new Promise((r) => setTimeout(r, reply.delayMs));
    if (res.destroyed) return;
    res.writeHead(reply.status ?? 200, { 'content-type': 'application/json', 'request-id': 'req_test_01', ...reply.headers });
    res.end(JSON.stringify(reply.body ?? {}));
  };
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      void respond(req, res, Buffer.concat(chunks).toString('utf8'));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    requests,
    close: () => new Promise<void>((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); }),
  };
}
