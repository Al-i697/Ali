/* ============================================================
   خادم وسيط لمنظومة التحضير الذكي — Cloudflare Pages (_worker.js)
   - يقدّم الموقع (index.html) ويستقبل طلبات المساعد على /api/ai
   - مفتاح Anthropic API يبقى سرّاً هنا ولا يصل المتصفح أبداً
   - لا يحفظ أي محتوى ولا يسجّله

   متغيرات البيئة (Settings ← Variables and Secrets):
     ANTHROPIC_API_KEY  (سرّي، مطلوب)   مفتاح حسابك في Anthropic
     ACCESS_CODE        (سرّي، موصى به)  رمز دخول تعطيه للزملاء؛ بدونه يستطيع أي زائر الاستخدام على حسابك
     MODEL              (اختياري)        النموذج الافتراضي، الافتراضي claude-sonnet-5-5
     MODELS             (اختياري)        النماذج المسموحة مفصولة بفواصل
     MAX_TOKENS         (اختياري)        أقصى طول للرد، الافتراضي 16000
     DAILY_LIMIT        (اختياري)        أقصى عدد طلبات يومياً للموقع كله (يحتاج ربط KV باسم USAGE)
     ALLOW_ORIGIN       (اختياري)        للسماح بالاستدعاء من موقع آخر (CORS)
   ============================================================ */
const UPSTREAM = "https://api.anthropic.com/v1/messages";
const MAX_BODY = 700000;          // حرفاً؛ أكبر من أي طلب حقيقي للمساعد
const MAX_MESSAGES = 60;
const DEFAULT_MODEL = "claude-sonnet-5-5";
const DEFAULT_MODELS = ["claude-sonnet-5-5", "claude-haiku-5-5", "claude-opus-5-5"];

const enc = new TextEncoder();
function corsHeaders(request, env){
  if (!env.ALLOW_ORIGIN) return {};
  return { "access-control-allow-origin": env.ALLOW_ORIGIN, "access-control-allow-headers": "content-type, x-access-code", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-max-age": "86400", "vary": "origin" };
}
function json(obj, status, request, env){
  return new Response(JSON.stringify(obj), { status, headers: Object.assign({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }, corsHeaders(request, env)) });
}
function fail(status, type, message, request, env){ return json({ type: "error", error: { type, message } }, status, request, env); }

async function sha(s){ return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(String(s)))); }
async function codeOK(request, env){
  if (!env.ACCESS_CODE) return true;
  const given = request.headers.get("x-access-code") || "";
  const [a, b] = await Promise.all([sha(given), sha(env.ACCESS_CODE)]);
  let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}
function allowedModels(env){
  const l = String(env.MODELS || "").split(",").map(s => s.trim()).filter(Boolean);
  return l.length ? l : DEFAULT_MODELS;
}
function dayKey(){ return "d:" + new Date().toISOString().slice(0, 10); }

async function status(request, env){
  return json({ ok: !!env.ANTHROPIC_API_KEY, needsCode: !!env.ACCESS_CODE, authorized: await codeOK(request, env) }, 200, request, env);
}

async function chat(request, env){
  if (!env.ANTHROPIC_API_KEY) return fail(500, "server_key_error", "الخادم غير مُعدّ: ANTHROPIC_API_KEY مفقود", request, env);
  if (!(await codeOK(request, env))) return fail(401, "access_code_invalid", "رمز الدخول غير صحيح", request, env);
  const len = Number(request.headers.get("content-length") || 0);
  if (len > MAX_BODY * 3) return fail(413, "request_too_large", "الطلب كبير جداً", request, env);
  const raw = await request.text();
  if (raw.length > MAX_BODY) return fail(413, "request_too_large", "الطلب كبير جداً", request, env);
  let b; try { b = JSON.parse(raw); } catch (e) { return fail(400, "invalid_request_error", "JSON غير صالح", request, env); }
  const ms = b && b.messages;
  if (!Array.isArray(ms) || !ms.length || ms.length > MAX_MESSAGES) return fail(400, "invalid_request_error", "messages غير صالحة", request, env);
  const clean = [];
  for (const m of ms){
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || !m.content) return fail(400, "invalid_request_error", "رسالة غير صالحة", request, env);
    clean.push({ role: m.role, content: m.content });
  }
  if (clean[0].role !== "user" || clean[clean.length - 1].role !== "user") return fail(400, "invalid_request_error", "يجب أن تبدأ المحادثة وتنتهي برسالة مستخدم", request, env);

  if (env.USAGE && env.DAILY_LIMIT){
    const k = dayKey(), n = parseInt(await env.USAGE.get(k), 10) || 0;
    if (n >= parseInt(env.DAILY_LIMIT, 10)) return fail(429, "daily_limit", "بلغ الموقع حدّه اليومي", request, env);
    await env.USAGE.put(k, String(n + 1), { expirationTtl: 172800 });
  }
  const allowed = allowedModels(env), def = allowed.includes(env.MODEL) ? env.MODEL : (allowed.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : allowed[0]);
  const model = allowed.includes(b.model) ? b.model : def;
  const cap = Math.max(16, Math.min(parseInt(env.MAX_TOKENS, 10) || 16000, 64000));
  const max_tokens = Math.max(1, Math.min(parseInt(b.max_tokens, 10) || cap, cap));
  let up;
  try {
    up = await fetch(UPSTREAM, { method: "POST", headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model, max_tokens, stream: true, messages: clean }) });
  } catch (e){ return fail(502, "api_error", "تعذّر الوصول إلى Anthropic", request, env); }
  if (up.status === 401 || up.status === 403) return fail(502, "server_key_error", "مفتاح الخادم غير صالح", request, env);
  const h = Object.assign({ "content-type": up.headers.get("content-type") || "text/event-stream", "cache-control": "no-store", "x-accel-buffering": "no" }, corsHeaders(request, env));
  return new Response(up.body, { status: up.status, headers: h });
}

export default {
  async fetch(request, env){
    const url = new URL(request.url), p = url.pathname.replace(/\/+$/, "") || "/";
    if (p === "/api/ai" || p === "/api/ai/status"){
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });
      if (p === "/api/ai/status") return request.method === "GET" ? status(request, env) : fail(405, "invalid_request_error", "GET فقط", request, env);
      return request.method === "POST" ? chat(request, env) : fail(405, "invalid_request_error", "POST فقط", request, env);
    }
    return env.ASSETS.fetch(request);
  }
};
