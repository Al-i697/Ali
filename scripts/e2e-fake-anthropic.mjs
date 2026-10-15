// خادم Claude وهمي لاختبارات E2E: يحاكي واجهة Messages بما يكفي لمزوّد المساعد الذكي (بنية الرد ونوع المهمة).
// لا يتصل بأحد ولا يتحقق من المفتاح؛ يسجّل كل طلب ليتحقق الاختبار مما أُرسل فعلًا.
//   node scripts/e2e-fake-anthropic.mjs        يشغّله مستقلًا ويطبع عنوانه (لتجربة ai-check يدويًا)
import { Buffer } from 'node:buffer';
import http from 'node:http';
import { pathToFileURL } from 'node:url';

const LESSON = {
  outcomes: ['يفسّر الطالب حركة الجزيئات عبر الأغشية الحية'],
  objectives: ['أن يعرّف الطالب الانتشار', 'أن يقارن الطالب بين الانتشار والخاصية الأسموزية'],
  concepts: ['الانتشار', 'الخاصية الأسموزية'],
  strategies: ['التعلم التعاوني'],
  resources: ['شفافيات توضيحية'],
  activities: [
    { phase: 'intro', description: 'سؤال تمهيدي عن انتشار رائحة العطر في الغرفة', minutes: 5 },
    { phase: 'main', description: 'شرح مفهوم الانتشار مع تجربة صبغة في الماء', minutes: 20 },
    { phase: 'practice', description: 'حل أنشطة الكتاب في مجموعات', minutes: 12 },
    { phase: 'closure', description: 'تلخيص الدرس بثلاث جمل', minutes: 8 },
  ],
  assessmentMethods: ['أسئلة شفهية'],
  homework: 'حل تمارين الصفحة 40',
  supportIdea: 'مخطط مبسّط للمفهوم مع أمثلة من الحياة',
  enrichmentIdea: 'بحث قصير عن الانتشار في الكائنات الحية',
};

const ASSESSMENT = {
  ideas: [
    { title: 'اختبار قصير', type: 'written', description: 'خمسة أسئلة موضوعية في نهاية الحصة', criteria: ['صحة الإجابة', 'وضوح التعليل'] },
    { title: 'عرض شفهي', type: 'oral', description: 'يشرح الطالب المفهوم لزملائه في دقيقتين', criteria: ['دقة المعلومة'] },
    { title: 'تقرير تجربة', type: 'practical', description: 'يدوّن الطالب ملاحظاته من تجربة الصبغة', criteria: ['تسلسل الخطوات', 'استنتاج صحيح'] },
  ],
};

const SUPPORT = {
  reason: 'صعوبة في ربط محاور الرسم البياني بالقيم',
  goal: 'أن يقرأ الطالب الرسوم البيانية بدقة 70% فأكثر بنهاية الفصل',
  strategies: ['نماذج محلولة خطوة بخطوة', 'تدريب متدرج على قراءة المحاور', 'تغذية راجعة فورية', 'ورقة عمل علاجية قصيرة'],
};

/** mode: 'ok' | 'error' (500 دائمًا) — delayMs: تأخير الرد */
export function startFakeAnthropic() {
  const requests = [];
  const state = { mode: 'ok', delayMs: 0 };
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      let body = null;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null');
      } catch {
        body = null;
      }
      requests.push({ method: req.method, url: req.url, headers: req.headers, body });
      const respond = () => {
        if (state.mode === 'error') {
          res.writeHead(500, { 'content-type': 'application/json', 'request-id': 'req_e2e_err' });
          res.end(JSON.stringify({ type: 'error', error: { type: 'api_error', message: 'internal failure (e2e)' } }));
          return;
        }
        // نوع المهمة من بنية الرد المطلوبة
        const props = body?.output_config?.format?.schema?.properties ?? {};
        const payload = 'activities' in props ? LESSON : 'ideas' in props ? ASSESSMENT : 'goal' in props ? SUPPORT : 'ok' in props ? { ok: true } : {};
        res.writeHead(200, { 'content-type': 'application/json', 'request-id': 'req_e2e_ok' });
        res.end(
          JSON.stringify({
            id: 'msg_e2e',
            type: 'message',
            role: 'assistant',
            model: body?.model ?? 'claude-opus-5-5',
            content: [{ type: 'text', text: JSON.stringify(payload) }],
            stop_reason: 'end_turn',
            stop_sequence: null,
            usage: { input_tokens: 210, output_tokens: 480 },
          }),
        );
      };
      if (state.delayMs) setTimeout(respond, state.delayMs);
      else respond();
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      resolve({
        baseUrl: `http://127.0.0.1:${server.address().port}`,
        requests,
        setMode: (mode) => (state.mode = mode),
        setDelay: (ms) => (state.delayMs = ms),
        close: () =>
          new Promise((r) => {
            server.closeAllConnections?.();
            server.close(() => r());
          }),
      });
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fake = await startFakeAnthropic();
  console.log(`Claude الوهمي يعمل على ${fake.baseUrl}  (Ctrl+C للإيقاف)`);
  console.log(`AI_PROVIDER=anthropic ANTHROPIC_API_KEY=sk-ant-fake AI_BASE_URL=${fake.baseUrl} npm run cli -- ai-check`);
}
