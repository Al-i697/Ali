/* ============================================================
   الاتصال بالذكاء الاصطناعي خارج Claude
   ------------------------------------------------------------
   أولوية الاتصال عند فتح الموقع:
     1) داخل Claude: قدرة sample (بلا مفتاح)                         → AXD.mode = "claude"
     2) مفتاح Anthropic API شخصي أدخله المستخدم في هذا المتصفح       → "key"
     3) خادم الموقع نفسه (/api/ai) إن كان الموقع منشوراً مع server/_worker.js
        فيعمل لكل الزوار بلا مفتاح، وقد يطلب رمز دخول                  → "server"
   axdSample / axdSampleSrv يحاكيان واجهة sample (النص المتدفق، الإيقاف، رموز الأخطاء)
   فلا يتغير أي كود آخر في الموقع.
   ============================================================ */
const AXD_KEY = "chem10-smart-planner:ai-conn";
const AXD_CODE = "chem10-smart-planner:ai-code";
const AXD_BASE = "https://api.anthropic.com";
const AXD_MODELS = [
  ["claude-sonnet-5-5", "Sonnet 5.5 — متوازن (موصى به)"],
  ["claude-opus-5-5", "Opus 5.5 — أعمق وأبطأ"],
  ["claude-haiku-5-5", "Haiku 5.5 — أسرع وأرخص"]
];
const AXD = { mode: "none", srv: null, code: "", cfg: { key: "", model: AXD_MODELS[0][0], base: "", remember: true } };

function axdLoad(){
  try {
    const o = JSON.parse(localStorage.getItem(AXD_KEY) || "null");
    if (o && typeof o === "object"){
      AXD.cfg.key = String(o.key || ""); AXD.cfg.base = String(o.base || "");
      if (AXD_MODELS.some(m => m[0] === o.model)) AXD.cfg.model = o.model;
    }
  } catch (e) {}
  try { AXD.code = localStorage.getItem(AXD_CODE) || ""; } catch (e) {}
}
function axdPersist(){
  try {
    if (AXD.cfg.remember && AXD.cfg.key) localStorage.setItem(AXD_KEY, JSON.stringify({ key: AXD.cfg.key, model: AXD.cfg.model, base: AXD.cfg.base }));
    else localStorage.removeItem(AXD_KEY);
  } catch (e) {}
}
function axdPersistCode(remember){
  try { if (remember && AXD.code) localStorage.setItem(AXD_CODE, AXD.code); else localStorage.removeItem(AXD_CODE); } catch (e) {}
}
function axdURL(){
  const b = (AXD.cfg.base || AXD_BASE).trim().replace(/\/+$/, "");
  return b + "/v1/messages";
}
function axdBaseOK(b){
  b = String(b || "").trim(); if (!b) return true;
  return /^https:\/\/[^\s/]+(\/[^\s]*)?$/i.test(b) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/[^\s]*)?$/i.test(b);
}
function axdCode(status, type, msg){
  if (type === "access_code_invalid") return "invalid_code";
  if (type === "daily_limit") return "daily_limit";
  if (type === "server_key_error") return "server_error";
  if (status === 401 || type === "authentication_error") return "invalid_key";
  if (status === 403 || type === "permission_error") return "forbidden";
  if (status === 404 || type === "not_found_error") return "model_not_found";
  if (status === 413 || type === "request_too_large") return "prompt_too_large";
  if (status === 429 || type === "rate_limit_error") return "rate_limited";
  if (status === 529 || type === "overloaded_error") return "overloaded";
  if (/credit balance|billing/i.test(msg || "")) return "no_credit";
  if (status === 400 || type === "invalid_request_error") return "invalid_request";
  return "upstream_error";
}
function axdTargetKey(){
  return { url: axdURL(), model: AXD.cfg.model, key: AXD.cfg.key, headers: { "x-api-key": AXD.cfg.key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" } };
}
function axdTargetSrv(){
  return { url: "/api/ai", model: "", key: "server", headers: AXD.code ? { "x-access-code": AXD.code } : {} };
}
async function axdRun(input, opts, tgt){
  opts = opts || {};
  if (!tgt.key) throw { code: "no_key", message: "no key", text: "" };
  const turns = typeof input === "string" ? [{ role: "user", content: input }] : input.map(t => ({ role: t.role, content: String(t.content) }));
  const body = { max_tokens: opts.maxTokens || 16000, stream: true, messages: turns };
  if (tgt.model) body.model = tgt.model;
  let res;
  try {
    res = await fetch(tgt.url, {
      method: "POST", signal: opts.signal,
      headers: Object.assign({ "content-type": "application/json" }, tgt.headers),
      body: JSON.stringify(body)
    });
  } catch (e){
    if (e && e.name === "AbortError") throw { code: "cancelled", message: "cancelled", text: "" };
    throw { code: "network", message: String(e && e.message || e), text: "" };
  }
  if (!res.ok){
    let type = "", msg = "";
    try { const j = await res.json(); type = j && j.error && j.error.type || ""; msg = j && j.error && j.error.message || ""; } catch (e) {}
    throw { code: axdCode(res.status, type, msg), message: msg || ("HTTP " + res.status), text: "" };
  }
  let text = "", truncated = false, buf = "";
  const feed = block => {
    let ev = "", data = "";
    block.split("\n").forEach(l => {
      if (l.startsWith("event:")) ev = l.slice(6).trim();
      else if (l.startsWith("data:")) data += l.slice(5).replace(/^ /, "");
    });
    if (!data) return;
    let j; try { j = JSON.parse(data); } catch (e) { return; }
    const ty = j.type || ev;
    if (ty === "content_block_delta" && j.delta && j.delta.type === "text_delta" && j.delta.text){
      text += j.delta.text;
      if (opts.onText) opts.onText({ text, delta: j.delta.text });
    } else if (ty === "message_delta" && j.delta && j.delta.stop_reason === "max_tokens") truncated = true;
    else if (ty === "error"){
      const er = j.error || {};
      throw { code: axdCode(0, er.type, er.message), message: er.message || "stream error", text };
    }
  };
  try {
    const rd = res.body.getReader(), dec = new TextDecoder();
    for (;;){
      const r = await rd.read(); if (r.done) break;
      buf += dec.decode(r.value, { stream: true }).replace(/\r\n/g, "\n");
      let i;
      while ((i = buf.indexOf("\n\n")) >= 0){ const blk = buf.slice(0, i); buf = buf.slice(i + 2); feed(blk); }
    }
    if (buf.trim()) feed(buf);
  } catch (e){
    if (e && e.code) throw e;
    if (e && e.name === "AbortError") throw { code: "cancelled", message: "cancelled", text };
    throw { code: "network", message: String(e && e.message || e), text };
  }
  if (!text.trim()) throw { code: "empty_completion", message: "empty", text: "" };
  return { text, truncated };
}
function axdWrap(fn){
  fn.json = async function(input, opts){
    const r = await fn(input, opts);
    const o = axParseObj(r.text);
    if (o == null) throw { code: "invalid_json", message: "json", text: r.text };
    return o;
  };
  fn.limits = async () => ({});
  return fn;
}
const axdSample = axdWrap((input, opts) => axdRun(input, opts, axdTargetKey()));
const axdSampleSrv = axdWrap((input, opts) => axdRun(input, opts, axdTargetSrv()));

/* هل الموقع منشور مع خادم وسيط؟ (فقط عند الفتح من http/https خارج Claude) */
async function axdProbe(code){
  if (window.claude || !/^https?:$/.test(location.protocol)) return null;
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch("/api/ai/status", { cache: "no-store", signal: ctl.signal, headers: code ? { "x-access-code": code } : {} });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.ok === true ? { needsCode: !!j.needsCode, authorized: !!j.authorized } : null;
  } catch (e) { return null; } finally { clearTimeout(to); }
}
async function axdInit(){
  axdLoad();
  if (AXD.cfg.key && !sampleFn){ sampleFn = axdSample; AXD.mode = "key"; return; }
  const s = await axdProbe(AXD.code);
  if (s){
    AXD.srv = s;
    if (s.authorized){ sampleFn = axdSampleSrv; AXD.mode = "server"; }
  }
}
/* تطبيق حالة الاتصال على بقية الواجهة (أزرار الذكاء في الاستمارة، المساعد) */
function axdApply(){
  const on = !!sampleFn;
  $("#aiBtn").hidden = !on; $("#aiBtnTop").hidden = !on;
  $("#asstCfgBtn").hidden = AXD.mode === "claude";
  renderStep3(); renderOutput(); asstSync(); axControls();
}
/* رمز الدخول مرفوض (غُيّر في الخادم مثلاً): نرجع لطلب الرمز */
function axdBadCode(){
  AXD.code = ""; axdPersistCode(false);
  if (AXD.mode === "server"){ sampleFn = null; AXD.mode = "none"; if (AXD.srv) AXD.srv.authorized = false; axdApply(); axdShowCfg(true); }
}

/* ---------- بطاقة الإعداد ---------- */
function axdShowCfg(v){
  const f = $("#asstCfg"); if (!f) return;
  f.hidden = !v; $("#asst").classList.toggle("cfg-open", !!v); $("#asstCfgBtn").setAttribute("aria-expanded", String(!!v));
  if (!v) return;
  if (!$("#axModel").options.length) $("#axModel").innerHTML = AXD_MODELS.map(m => `<option value="${m[0]}">${m[1]}</option>`).join("");
  const srv = AXD.srv, needCode = !!(srv && srv.needsCode);
  $("#axKey").value = AXD.cfg.key; $("#axModel").value = AXD.cfg.model; $("#axBase").value = AXD.cfg.base; $("#axRem").checked = true;
  $("#axCodeBox").hidden = !needCode; $("#axCode").value = AXD.code;
  $("#axKeyDet").open = !srv || AXD.mode === "key"; $("#axKeySum").hidden = !srv;
  $("#axCfgDet").open = !!AXD.cfg.base;
  const t = AXD.mode === "server" ? "الاتصال فعّال عبر خادم الموقع، ولا تحتاج إلى مفتاح." + (needCode ? " يمكنك تغيير رمز الدخول أدناه." : "")
    : AXD.mode === "key" ? "الاتصال فعّال بمفتاحك الخاص. يمكنك تغيير المفتاح أو النموذج، أو حذفه من هذا الجهاز."
    : srv ? "هذا الموقع يتطلب رمز دخول لاستخدام المساعد. اطلب الرمز من مسؤول الموقع وأدخله هنا مرة واحدة على هذا الجهاز."
    : "أدخل مفتاح Anthropic API ليعمل المساعد خارج Claude. تُدخله مرة واحدة على كل جهاز.";
  $("#asstCfgMode").textContent = t;
  $("#axDel").hidden = AXD.mode !== "key" && !AXD.cfg.key;
  $("#axCfgMsg").textContent = ""; $("#axCfgMsg").className = "cfg-msg";
  setTimeout(() => { try { (needCode && AXD.mode !== "server" ? $("#axCode") : AXD.cfg.key || (srv && !needCode) ? $("#axModel") : $("#axKey")).focus(); } catch (e) {} }, 30);
}
function axdMsg(t, kind){ const m = $("#axCfgMsg"); m.textContent = t; m.className = "cfg-msg" + (kind ? " " + kind : ""); }
async function axdSubmitCode(code, remember){
  if (AXD.srv.needsCode && !code){ axdMsg("أدخل رمز الدخول أو مفتاحك الخاص.", "bad"); return; }
  const btn = $("#axSave"); btn.disabled = true; axdMsg("جارٍ التحقق…");
  try {
    const s = await axdProbe(code);
    if (!s){ axdMsg(axErr({ code: "network" }), "bad"); return; }
    if (s.needsCode && !s.authorized){ axdMsg(axErr({ code: "invalid_code" }), "bad"); return; }
    AXD.srv = s; AXD.code = code; axdPersistCode(remember);
    AXD.cfg.key = ""; axdPersist();
    sampleFn = axdSampleSrv; AXD.mode = "server";
    axdShowCfg(false); axdApply(); toast("تم الاتصال بنجاح، المساعد جاهز");
  } finally { btn.disabled = false; }
}
async function axdSubmit(e){
  e.preventDefault();
  const key = $("#axKey").value.trim(), base = $("#axBase").value.trim(), remember = $("#axRem").checked;
  if (!key && AXD.srv) return axdSubmitCode($("#axCode").value.trim(), remember);
  if (!key){ axdMsg("أدخل المفتاح أولاً.", "bad"); return; }
  if (/[^\x21-\x7E]/.test(key)){ axdMsg("المفتاح يحوي رموزاً غير صالحة، انسخه من console.anthropic.com كما هو بلا مسافات.", "bad"); return; }
  if (!axdBaseOK(base)){ axdMsg("عنوان الخادم غير صالح؛ يجب أن يبدأ بـ https://", "bad"); return; }
  const prev = Object.assign({}, AXD.cfg);
  Object.assign(AXD.cfg, { key, base, model: $("#axModel").value, remember });
  const btn = $("#axSave"); btn.disabled = true; axdMsg("جارٍ اختبار الاتصال…");
  try {
    await axdRun("أجب بكلمة واحدة فقط: تم", { maxTokens: 16 }, axdTargetKey());
    axdPersist(); sampleFn = axdSample; AXD.mode = "key";
    axdShowCfg(false); axdApply(); toast("تم الاتصال بنجاح، المساعد جاهز");
    if (matchMedia("(pointer:coarse)").matches === false) $("#asstIn").focus();
  } catch (er){
    Object.assign(AXD.cfg, prev);
    axdMsg(axErr(er), "bad");
  } finally { btn.disabled = false; }
}
function axdDelete(){
  AXD.cfg.key = ""; axdPersist(); $("#axKey").value = "";
  if (AXD.mode === "key"){
    if (AXD.srv && AXD.srv.authorized){ sampleFn = axdSampleSrv; AXD.mode = "server"; }
    else { sampleFn = null; AXD.mode = "none"; }
  }
  axdShowCfg(false); axdApply(); toast(AXD.mode === "server" ? "حُذف مفتاحك، والمساعد يعمل الآن عبر خادم الموقع" : "حُذف المفتاح من هذا الجهاز");
}
function axdBind(){
  $("#asstCfgBtn").addEventListener("click", () => axdShowCfg($("#asstCfg").hidden));
  $("#asstCfg").addEventListener("submit", axdSubmit);
  $("#axDel").addEventListener("click", axdDelete);
  $("#axCfgClose").addEventListener("click", () => axdShowCfg(false));
}
