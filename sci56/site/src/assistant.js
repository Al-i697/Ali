/* ============================================================
   مساعد التحضير العائم: محادثة + اقتراحات قابلة للتطبيق والتراجع
   (يعمل عبر قدرة sample؛ التعديلات تمر على المعلم قبل أن تُطبَّق)
   ============================================================ */
const AX = { open: false, busy: false, ctl: null, chats: {}, undo: {}, deck: null, seq: 0, shownKey: null };
const AX_FIELDS = { prior: "التعلم القبلي", warm: "التمهيد", exit: "التقويم الختامي", homework: "الواجب المنزلي", mis: "المفاهيم الخاطئة", lab: "النشاط العملي والسلامة", resources: "الوسائل ومصادر التعلم", support: "النشاط العلاجي", enrich: "النشاط الإثرائي" };
const AX_KEYS = { phase: "المرحلة", strat: "الاستراتيجية", min: "الزمن", obj: "الأهداف", t: "خطوات المعلم", s: "خطوات الطالب", tool: "أداة التقويم", q: "السؤال", ans: "الإجابة", crit: "معيار النجاح" };
const AX_CHIPS = [
  { id: "ppt-in", key: 1, icon: "i-upload", label: "من عرض PowerPoint إلى تحضير" },
  { id: "ppt-out", key: 1, icon: "i-ppt", label: "من التحضير إلى عرض PowerPoint" },
  { label: "تهيئة عُمانية مبتكرة", prompt: "اقترح تهيئة حافزة جديدة (5 دقائق) من البيئة أو الصناعة في سلطنة عُمان لبداية الدرس، وبدّل بها صف التمهيد الحالي." },
  { label: "اجعلها تعاونية", prompt: "أعد صياغة أنشطة هذا الدرس بالتعلم التعاوني (مجموعات بأدوار واضحة) مع الحفاظ على محتوى كتاب الطالب وأزمنة الحصة." },
  { label: "أسئلة تفكير عليا", prompt: "اقترح ثلاثة أسئلة تفكير عليا (تحليل وتقويم) تقيس أهداف الدرس، مع إجابة نموذجية لكل سؤال، وأضفها في أنسب مواضعها من التقويم التكويني." },
  { label: "علاجي وإثرائي", prompt: "اكتب نشاطاً علاجياً ونشاطاً إثرائياً محددين بهذا الدرس وبدّل بهما الحاليين." },
  { label: "ما الاستراتيجية الأنسب؟", prompt: "ما الاستراتيجية الأنسب لهذا الدرس؟ قارن بين خيارين فقط وأعطني توصيتك المختصرة، ولا ترفق اقتراح تعديل بعد." }
];

/* ---------- أدوات النص ---------- */
function axClean(s){
  return String(s == null ? "" : s).replace(/\r/g, "").replace(/Σ/g, "∑")
    .replace(/<\/?(?!(?:b|strong|br)\b)[a-zA-Z][^>]*>/gi, "").replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>").trim();
}
function axRich(s){ return axClean(s).replace(/\n+/g, "<br>"); }
function axSteps(v){
  const a = (Array.isArray(v) ? v : String(v == null ? "" : v).split(/\n+/)).map(x => axClean(x).replace(/^\s*(?:\d+\s*[.)\-–]|[•\-*])\s*/, "")).filter(Boolean);
  return stepsHTML(a);
}
function axInt(v, d, lo, hi){ const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(hi == null ? 999 : hi, Math.max(lo == null ? 1 : lo, n)) : d; }
function axPhase(s){ const t = axClean(s).replace(/<[^>]*>/g, "").replace(/\s+/g, " "); return t.length > 26 ? t.slice(0, 26).replace(/\s+\S*$/, "") : t || "نشاط"; }
function axPlain(h){ return plainText(h).replace(/\n+/g, " / ").replace(/\s+/g, " ").trim(); }
function axFmt(text){
  const inl = s => escapeHTML(s).replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  const blocks = String(text || "").replace(/\r/g, "").split(/\n{2,}/), out = [];
  blocks.forEach(b => {
    const ls = b.split("\n").filter(l => l.trim());
    if (!ls.length) return;
    if (ls.every(l => /^\s*[-•*]\s+/.test(l))) out.push("<ul>" + ls.map(l => `<li>${inl(l.replace(/^\s*[-•*]\s+/, ""))}</li>`).join("") + "</ul>");
    else if (ls.every(l => /^\s*\d+\s*[.)]\s+/.test(l))) out.push("<ol>" + ls.map(l => `<li>${inl(l.replace(/^\s*\d+\s*[.)]\s+/, ""))}</li>`).join("") + "</ol>");
    else out.push("<p>" + ls.map(inl).join("<br>") + "</p>");
  });
  return out.join("");
}
function axLocked(rec){ return rec && rec.aiFlow && rec.aiFlow.locked ? rec.aiFlow : null; }
function axScale(mins, total){
  const sum = mins.reduce((t, x) => t + x, 0);
  if (!sum) return mins.map(() => 0);
  const raw = mins.map(x => x * total / sum), out = raw.map(x => Math.max(1, Math.floor(x)));
  let diff = total - out.reduce((t, x) => t + x, 0);
  const order = raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; diff > 0 && k < order.length * 4; k++){ out[order[k % order.length][1]]++; diff--; }
  for (let k = 0; diff < 0 && k < out.length * 6; k++){ const i = out.indexOf(Math.max(...out)); if (out[i] > 1){ out[i]--; diff++; } else break; }
  return out;
}
function axFirstJSON(s){
  const i = s.indexOf("{"); if (i < 0) return null;
  let depth = 0, str = false, esc = false;
  for (let k = i; k < s.length; k++){
    const c = s[k];
    if (str){ if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') str = false; continue; }
    if (c === '"') str = true; else if (c === "{") depth++; else if (c === "}"){ depth--; if (!depth) return s.slice(i, k + 1); }
  }
  return null;
}
function axFixJSON(j){
  let out = "", str = false, esc = false;
  for (let k = 0; k < j.length; k++){
    const c = j[k];
    if (str){
      if (esc){ esc = false; out += c; }
      else if (c === "\\"){ esc = true; out += c; }
      else if (c === '"'){ str = false; out += c; }
      else if (c === "\n") out += "\\n"; else if (c === "\r") out += ""; else if (c === "\t") out += "\\t"; else out += c;
    } else { if (c === '"') str = true; out += c; }
  }
  return out.replace(/,\s*([}\]])/g, "$1");
}
function axParseObj(buf){
  const j = axFirstJSON(String(buf || ""));
  if (!j) return null;
  try { return JSON.parse(j); } catch (e) { try { return JSON.parse(axFixJSON(j)); } catch (e2) { return null; } }
}
function axSplit(raw){
  const lines = String(raw || "").replace(/\r/g, "").split("\n"), text = [], recs = [];
  let cur = null;
  for (const ln of lines){
    const m = /^\s*@@([A-Z]+)\b[ \t]*(.*)$/.exec(ln);
    if (m){ if (m[1] === "END"){ cur = null; continue; } cur = { kind: m[1], buf: m[2] }; recs.push(cur); continue; }
    if (cur){ if (!/^\s*```/.test(ln)) cur.buf += "\n" + ln; } else text.push(ln);
  }
  return { text: text.join("\n").replace(/\s*```[a-zA-Z]*\s*$/, "").trim(), recs };
}
/* ---------- تقويم الصف (أداة، سؤال، إجابة، معيار) ---------- */
function axParseEval(html){
  const o = { tool: "", q: "", ans: "", crit: "", extra: [] };
  String(html || "").split(/<br\s*\/?>/i).forEach(seg => {
    const m = /^\s*<strong>\s*([^<]*?)\s*:?\s*<\/strong>\s*([\s\S]*)$/i.exec(seg);
    if (!m){ if (seg.trim()) o.extra.push(seg.trim()); return; }
    const lab = m[1].replace(/:$/, ""), v = m[2].trim();
    if (/^الأداة/.test(lab)) o.tool = v; else if (lab === "السؤال") o.q = v; else if (/^الإجابة/.test(lab)) o.ans = v; else if (/^معيار/.test(lab)) o.crit = v; else o.extra.push(seg.trim());
  });
  return o;
}
function axBuildEval(e){
  const base = evalHTML({ tool: e.tool || "سؤال شفهي", q: e.q, ans: e.ans, crit: e.crit });
  return e.extra && e.extra.length ? base + "<br>" + e.extra.join("<br>") : base;
}
function axObjIds(list, d){
  const arr = Array.isArray(list) ? list : String(list || "").split(/[،,\s]+/);
  const out = [];
  arr.forEach(x => {
    const t = String(x).replace(/[\[\]\s]/g, ""); if (!t) return;
    const o = d.objectives.find(o => objLabel(o).replace(/\s/g, "") === t) || d.objectives.find(o => o.code === t);
    if (o && !out.includes(o.id)) out.push(o.id);
  });
  return out;
}

/* ---------- تجسيد الخطة الحالية (مع دمج التعديلات اليدوية) ---------- */
function axMaterialize(pl){
  const T = k => pl.tEd[k] ? axRich(plainText(pl.t[k])) : pl.t[k];
  const rows = pl.flow.map(r => {
    const col = k => r.ed && r.ed[k] ? axRich(r[k]) : r[k];
    const ids = r.objIds && r.objIds.length ? r.objIds.slice() : (r.id && r.id.indexOf(":") > 0 ? [r.id.split(":")[0]] : []);
    return { id: r.id, period: r.period || 1, bk: r.bk || "", phase: r.code, strat: r.strat || "", minutes: r.minutes, time: r.minutes + " د", q: r.q || "", objIds: ids, teacher: col("teacher"), student: col("student"), eval: col("eval") };
  });
  const ds = pl.diff.supportAuto ? pl.diff.support : axRich(pl.diff.support), de = pl.diff.enrichAuto ? pl.diff.enrich : axRich(pl.diff.enrich);
  let seq = 0; rows.forEach(r => { const m = /^m(\d+)$/.exec(r.id); if (m) seq = Math.max(seq, +m[1]); });
  return { locked: true, sig: pl.sig, periods: pl.periods, seq, rows, prior: T("prior"), warm: T("warm"), exit: T("exit"), homework: T("homework"), mis: T("mis"), lab: T("lab"), resources: T("resources"), support: ds, enrich: de };
}
function axSnap(rec){ return JSON.parse(JSON.stringify({ aiFlow: rec.aiFlow || null, edits: rec.edits || {}, diff: rec.diff || { support: "", enrich: "" } })); }
function axRestore(rec, s){ rec.aiFlow = s.aiFlow; rec.edits = s.edits; rec.diff = s.diff; }
function axCommit(rec, mat){
  Object.keys(rec.edits).forEach(k => { if (/^[fs]:/.test(k)) delete rec.edits[k]; });
  rec.diff.support = ""; rec.diff.enrich = "";
  rec.aiFlow = mat; touch();
  Object.keys(flowCache).forEach(k => delete flowCache[k]);
}

/* ---------- تحويل صفوف الاقتراح إلى صفوف الخطة ---------- */
function axPatchRow(row, s, d){
  if (s.phase != null) row.phase = axPhase(s.phase);
  if (s.strat != null) row.strat = axClean(s.strat).replace(/<[^>]*>/g, "").slice(0, 40);
  if (s.min != null) row.minutes = axInt(s.min, row.minutes || 5, 1, 40);
  if (s.obj != null) row.objIds = axObjIds(s.obj, d);
  if (s.t != null) row.teacher = axSteps(s.t);
  if (s.s != null) row.student = axSteps(s.s);
  if (["tool", "q", "ans", "crit"].some(k => s[k] != null)){
    const e = axParseEval(row.eval);
    ["tool", "q", "ans", "crit"].forEach(k => { if (s[k] != null) e[k] = axRich(s[k]); });
    row.eval = axBuildEval(e); row.q = plainText(e.q);
  }
  row.time = row.minutes + " د";
  return row;
}
function axNewRow(mat, r, d){
  const row = { id: "m" + (++mat.seq), period: axInt(r.p, 1, 1, 9), bk: "", phase: "نشاط", strat: "", minutes: 5, q: "", objIds: [], teacher: "", student: "", eval: "" };
  axPatchRow(row, r, d);
  if (!row.teacher) row.teacher = axSteps(["ينفّذ المعلم النشاط ويوجّه الطلاب."]);
  if (!row.student) row.student = axSteps(["ينفّذ الطالب النشاط ويشارك في الحوار."]);
  if (!row.eval) row.eval = axBuildEval({ tool: "سؤال شفهي", q: "", ans: "", crit: "", extra: [] });
  return row;
}
const AX_SETTERS = {
  prior: v => v && typeof v === "object" && !Array.isArray(v) ? aPriorHTML({ prior: { items: (v.items || []).map(axClean), technique: axClean(v.technique || "أسئلة تشخيصية قصيرة"), qs: (v.qs || []).map(x => ({ q: axClean(x.q), a: axClean(x.a) })) } }) : axRich(v),
  warm: v => v && typeof v === "object" && !Array.isArray(v) ? aWarmHTML({ warm: { stimulus: axClean(v.stimulus), question: axClean(v.question), expected: axClean(v.expected) } }) : axRich(v),
  exit: v => v && typeof v === "object" && !Array.isArray(v) ? axBuildEval({ tool: "", q: axClean(v.q), ans: axClean(v.a), crit: axClean(v.crit), extra: [] }).replace(/^<strong>الأداة:<\/strong>[^<]*<br>/, "") : axRich(v),
  homework: axRich, mis: axRich, lab: axRich, resources: axRich, support: axSteps, enrich: axSteps
};

/* ---------- تنفيذ العمليات على نسخة الخطة ---------- */
function axInsertAt(mat, ref, row){
  let i = ref >= 0 ? ref + 1 : mat.rows.length;
  if (ref >= 0 && mat.rows[ref].bk === "close" && mat.rows[ref].period === row.period) i = ref;
  mat.rows.splice(i, 0, row);
}
function axApplyOps(mat, ops, d, rep){
  const idx = id => mat.rows.findIndex(r => r.id === id);
  for (const op of ops){
    const kind = op.op;
    if (kind === "set"){
      const f = op.field, fn = AX_SETTERS[f];
      if (!fn || op.value == null || op.value === ""){ rep.skipped.push("بند غير مفهوم (" + (f || "؟") + ")"); continue; }
      mat[f] = fn(op.value); rep.ok++;
    } else if (kind === "update_row"){
      const i = idx(op.rid);
      if (i < 0){ rep.skipped.push("لم يُعثر على الصف " + (op.at || "؟")); continue; }
      axPatchRow(mat.rows[i], op.set || {}, d); rep.ok++;
    } else if (kind === "insert_row"){
      const ref = op.rid ? idx(op.rid) : (op.after === 0 ? 0 : -1);
      const base = ref >= 0 ? mat.rows[ref] : mat.rows[mat.rows.length - 1];
      const r = op.row || {};
      if (r.p == null && base) r.p = base.period;
      const row = axNewRow(mat, r, d);
      if (!op.row || !op.row.t) { rep.skipped.push("صف مضاف بلا خطوات للمعلم: «" + row.phase + "»"); continue; }
      axInsertAt(mat, ref, row); rep.ok++;
    } else if (kind === "delete_row"){
      const i = idx(op.rid);
      if (i < 0){ rep.skipped.push("لم يُعثر على الصف " + (op.at || "؟")); continue; }
      const r = mat.rows[i], same = mat.rows.filter(x => x.period === r.period && !x.bk);
      if (i === 0 || i === mat.rows.length - 1 || r.bk || same.length <= 1){ rep.skipped.push("لا يُحذف صف التمهيد أو الختام أو أحد صفوف بداية الحصة ونهايتها: «" + r.phase + "»"); continue; }
      mat.rows.splice(i, 1); rep.ok++;
    } else if (kind === "move_row"){
      const i = idx(op.rid), j = idx(op.rid2);
      if (i < 0 || j < 0 || i === j){ rep.skipped.push("نقل غير ممكن"); continue; }
      const r = mat.rows[i]; if (r.bk || i === 0 || i === mat.rows.length - 1){ rep.skipped.push("لا يُنقل صف التمهيد أو الختام أو صفوف الحدود: «" + r.phase + "»"); continue; }
      mat.rows.splice(i, 1);
      const j2 = idx(op.rid2); r.period = mat.rows[j2].period;
      axInsertAt(mat, j2, r); rep.ok++;
    } else rep.skipped.push("عملية غير معروفة: " + kind);
  }
}
function axApplyPlan(mat, plan, d, rep){
  const rows = (plan.rows || []).map(r => axNewRow(mat, r, d));
  if (rows.length < 3){ rep.skipped.push("الخطة المقترحة قصيرة جداً (" + rows.length + " صفوف)"); return; }
  rows.forEach((r, i) => { if (!r.teacher) r.teacher = axSteps(["—"]); });
  mat.rows = rows;
  ["prior", "warm", "exit", "homework", "mis", "lab", "resources", "support", "enrich"].forEach(f => { if (plan[f] != null && plan[f] !== "" && !(Array.isArray(plan[f]) && !plan[f].length)) mat[f] = AX_SETTERS[f](plan[f]); });
  rep.ok++;
}
/* ---------- ضبط البنية والأزمنة بعد كل تطبيق ---------- */
function axNormalize(mat, pl, rep){
  const rows = mat.rows, d = pl.d;
  let last = 1; rows.forEach(r => { r.period = Math.max(last, r.period || 1); last = r.period; });
  const ps = [...new Set(rows.map(r => r.period))]; rows.forEach(r => { r.period = ps.indexOf(r.period) + 1; });
  const P = ps.length; mat.periods = P;
  rows.forEach((r, i) => {
    const first = i === 0 || rows[i - 1].period !== r.period, lastOf = i === rows.length - 1 || rows[i + 1].period !== r.period;
    r.bk = first && r.period > 1 ? "open" : (lastOf && r.period < P ? "close" : "");
  });
  for (let p = 1; p <= P; p++){
    const seg = rows.filter(r => r.period === p), sum = seg.reduce((t, r) => t + r.minutes, 0);
    if (sum !== 40){
      const bands = seg.filter(r => r.bk), free = seg.filter(r => !r.bk), bsum = bands.reduce((t, r) => t + r.minutes, 0);
      if (free.length && bsum <= 14 && 40 - bsum >= free.length){ const m = axScale(free.map(r => r.minutes), 40 - bsum); free.forEach((r, i) => { r.minutes = m[i]; }); }
      else { const m = axScale(seg.map(r => r.minutes), 40); seg.forEach((r, i) => { r.minutes = m[i]; }); }
      rep.notes.push(`ضُبطت أزمنة الحصة ${p} لتصبح 40 دقيقة (كانت ${sum}).`);
    }
  }
  rows.forEach(r => { r.time = r.minutes + " د"; if (!/^[A-Za-z]/.test(r.id || "")) r.id = "m" + (++mat.seq); });
  // اتساق التمهيد والختام مع الصفوف
  const f = rows[0], l = rows[rows.length - 1];
  const fe = axParseEval(f.eval);
  if (fe.q && mat.warm){
    const wq = /<strong>السؤال المحفز:<\/strong>\s*([^<]*)/.exec(mat.warm);
    if (wq && normQ(wq[1]) !== normQ(fe.q)) mat.warm = mat.warm.replace(wq[0], "<strong>السؤال المحفز:</strong> " + fe.q);
  }
  const le = axParseEval(l.eval);
  if (le.q) mat.exit = axBuildEval({ tool: "", q: le.q, ans: le.ans, crit: le.crit, extra: [] }).replace(/^<strong>الأداة:<\/strong>[^<]*<br>/, "");
  // تنبيهات
  for (let p = 1; p <= P; p++) if (!rows.some(r => r.period === p && r.objIds.length)) rep.warn.push(`الحصة ${p} ليس فيها صف مرتبط بهدف تعليمي.`);
  const sel = d.objectives.filter(o => pl.rec.sel[o.id]), cov = new Set(rows.flatMap(r => r.objIds));
  const miss = sel.filter(o => !cov.has(o.id)).map(objLabel);
  if (miss.length) rep.warn.push("أهداف غير مغطاة في الصفوف: " + miss.join("، ") + ".");
  const qs = rows.map(r => normQ(axParseEval(r.eval).q)).filter(Boolean), dup = qs.length - new Set(qs).size;
  if (dup) rep.warn.push("يوجد " + dup + " سؤال تقويم مكرر بين الصفوف.");
  const noQ = rows.filter(r => r.bk && !axParseEval(r.eval).q).length;
  if (noQ) rep.warn.push("صفوف بداية/نهاية الحصة بلا سؤال تقويم.");
}

/* ---------- نص الخطة الحالية للنموذج ---------- */
function axListing(pl){
  const L = [];
  pl.flow.forEach((r, i) => {
    const tag = r.bk === "open" ? " [افتتاحية الحصة]" : r.bk === "close" ? " [ختامية الحصة]" : "";
    L.push(`#${i + 1} | الحصة ${r.period || 1}${tag} | «${r.code}» | ${r.minutes} د | استراتيجية: ${r.strat || "—"} | أهداف: ${rowObjLabels(r, pl.d).join("، ") || "—"}`);
    L.push("  المعلم: " + axPlain(r.teacher)); L.push("  الطالب: " + axPlain(r.student)); L.push("  التقويم: " + axPlain(r.eval));
  });
  return L.join("\n");
}
function axSections(pl){
  return [["التعلم القبلي", pl.t.prior], ["التمهيد", pl.t.warm], ["التقويم الختامي", pl.t.exit], ["الواجب المنزلي", pl.t.homework], ["النشاط العلاجي", pl.diff.support], ["النشاط الإثرائي", pl.diff.enrich]].map(([k, v]) => `${k}: ${axPlain(v)}`).join("\n");
}
function axStratInfo(){
  return Object.values(STRAT).map(s => `- ${s.label}: ${[s.open.label].concat(s.mid.map(m => m.label), [s.close.label]).join(" ← ")}`).join("\n");
}
function axLessonCtx(pl){
  const d = pl.d, cm = courseMeta(pl.key);
  const objs = d.objectives.map(o => `- [${objLabel(o)}] ${o.text}${pl.rec.sel[o.id] ? "" : " (غير محدد في التحضير)"}`).join("\n");
  return `المقرر: ${cm.subj.name} للصف ${cm.gradeName} (سلسلة كامبريدج المواءمة، سلطنة عُمان)
الدرس: ${d.code} ${d.title} — ${d.unitTitle}
عدد الحصص في هذه الورقة: ${pl.periods}، والحصة الواحدة 40 دقيقة.
أهداف الدرس:
${objs}
التعلم القبلي في الدليل: ${axPlain(d.prior)}
المفهوم الخاطئ الشائع: ${axPlain(d.misconception)}
النشاط العملي والسلامة: ${axPlain(d.lab)}
إجابات أسئلة كتاب الطالب (من دليل المعلم): ${axPlain(d.guideAnswers).slice(0, 2500)}`;
}
const AX_STRATS = DEFAULT_STRATEGIES.concat(["التقويم الذاتي", "الأسئلة السابرة", "العرض التوضيحي", "بطاقة الخروج"]);
function axProtocol(){
  return `بروتوكول الاقتراحات (مهم جداً):
- الرد العادي نص عربي للمحادثة. لا يُطبَّق أي تغيير على التحضير إلا بعد أن يراجعه المعلم ويضغط «تطبيق». فاشرح في جملة أو جملتين ما ستغيّره ثم أرفق الاقتراح بعد النص مباشرة.
- أرفق اقتراحاً فقط عندما يطلب المعلم تعديلاً أو إضافة أو إعادة بناء، أو يوافق صراحة على فكرة عرضتَها. إن كان الطلب غامضاً بما يغيّر الناتج فاسأل سؤالاً واحداً قصيراً دون اقتراح. وإن كان سؤالاً أو نقاشاً فأجب دون اقتراح.
- صيغة الاقتراح: كل سطر يبدأ بـ @@ ثم JSON صالح في سطر واحد، وينتهي بسطر @@END:
@@PROPOSAL {"title":"عنوان قصير للاقتراح"}
@@OP {"op":"update_row","at":4,"set":{"phase":"..","strat":"..","min":10,"t":["خطوة","خطوة"],"s":["خطوة"],"tool":"..","q":"..","ans":"..","crit":".."}}
@@OP {"op":"insert_row","after":4,"row":{"phase":"..","strat":"..","min":8,"obj":["2-2"],"t":[".."],"s":[".."],"tool":"..","q":"..","ans":"..","crit":".."}}
@@OP {"op":"delete_row","at":6}
@@OP {"op":"move_row","at":6,"after":2}
@@OP {"op":"set","field":"homework","value":"نص"}
@@END
- at وafter رقم الصف كما في القائمة (#). في update_row أرسل في set الحقول المراد تغييرها فقط. حقول الصف: phase اسم المرحلة (حتى 18 حرفاً)، strat الاستراتيجية، min الدقائق، obj أرقام الأهداف مثل ["2-2"]، t خطوات المعلم (قائمة نصوص قصيرة)، s خطوات الطالب، tool أداة التقويم، q سؤال التقويم، ans الإجابة المتوقعة، crit معيار النجاح.
- حقول set المسموحة: prior و warm و exit و homework و mis و lab و resources (نص عادي؛ أو للثلاثة الأولى كائن: prior={"items":[..],"technique":"..","qs":[{"q":"..","a":".."}]}، warm={"stimulus":"..","question":"..","expected":".."}، exit={"q":"..","a":"..","crit":".."})، و support و enrich (قائمة خطوات).
- لإعادة بناء التحضير كاملاً (تغيير الاستراتيجية أو توزيع الأنشطة من جديد) استخدم بدل @@OP الصيغة الآتية (وتنتهي بـ @@END)، وهي تحلّ محل الجدول الحالي كله:
${AX_PLAN_FMT}`;
}
function axInstr(pl){
  return `أنت «مساعد التحضير» داخل منظومة تحضير العلوم لمعلم في سلطنة عُمان. تحاور المعلم بالعربية الفصحى المبسطة وبإيجاز (غالباً أقل من 110 كلمات)، وتعينه على تطوير تحضير الدرس الحالي ليناسب الاستراتيجية وأسلوب التدريس الذي يريده، مع الحفاظ على الدقة العلمية.
${axLessonCtx(pl)}
الاستراتيجيات المعتمدة في المنظومة (يمكن اقتراح غيرها بالاسم المعروف): ${AX_STRATS.join("، ")}.
مراحل بعض الاستراتيجيات:
${axStratInfo()}
قواعد المحتوى:
- التحضير الحالي مبني على تسلسل كتاب الطالب؛ حافظ على هذا التسلسل وعلى المحتوى العلمي ما لم يطلب المعلم غيره. لا تختلق أرقام صفحات أو أسئلة كتاب أو بيانات؛ إن لم تكن متأكداً فاذكر ذلك.
- اكتب خطوات المعلم والطالب قصيرة وقابلة للتنفيذ (خطوة = جملة واحدة)، وضع في التقويم أداة وسؤالاً وإجابة متوقعة ومعيار نجاح.
- استخدم الرموز الكيميائية بصيغتها المعتادة (H₂O، CO₂) ولا تستخدم الحرف Σ (استخدم ∑).
${axProtocol()}`;
}
function axTurns(userText, pl, hist){
  const turns = [{ role: "user", content: axInstr(pl) }];
  if (AX.deck) turns[0].content += `\n\nعرض PowerPoint مرفق من المعلم («${AX.deck.name}»، ${AX.deck.slides.length} شريحة) — محتواه للاستئناس عند الحديث عنه:\n${axDeckOutline(AX.deck, 1, AX.deck.slides.length, 30000)}`;
  hist.slice(-12).forEach(m => turns.push({ role: m.role === "u" ? "user" : "assistant", content: m.text + (m.prop ? `\n[أرفقتُ اقتراحاً «${m.prop.title}» — ${m.prop.status === "applied" ? "طبّقه المعلم" : m.prop.status === "dismissed" ? "تجاهله المعلم" : m.prop.status === "undone" ? "تراجع عنه المعلم" : "لم يبتّ فيه المعلم بعد"}]` : "") }));
  turns.push({ role: "user", content: `[حالة التحضير الحالية — الصفوف المرقمة]\n${axListing(pl)}\n${axSections(pl)}\n\n[رسالة المعلم]\n${userText}` });
  let size = turns.reduce((t, x) => t + x.content.length, 0);
  while (size > 90000 && turns.length > 3){ size -= turns[1].content.length; turns.splice(1, 1); }
  return turns;
}

/* ---------- الحالة والعرض ---------- */
function axChat(){ return AX.chats[state.key] || (AX.chats[state.key] = { msgs: [] }); }
function axMsgHTML(m){
  if (m.role === "u") return `<div class="am u"><div class="bd">${escapeHTML(m.text)}</div></div>`;
  if (m.role === "s") return `<div class="am sys"><div class="bd">${escapeHTML(m.text)}</div></div>`;
  if (m.card) return `<div class="am a" data-mid="${m.id}">${axCardHTML(m)}</div>`;
  const live = m.busy && !m.text;
  const body = `<div class="bd${m.err ? " err" : ""}${live ? " busy" : ""}" id="axb${m.id}">${m.text ? axFmt(m.text) : (m.busy ? escapeHTML(m.prog || "جارٍ التفكير") : "")}</div>`;
  const meta = !m.busy && m.text && !m.err ? `<div class="mt"><button type="button" data-ax="note" data-mid="${m.id}">أضف كملاحظة إلى التحضير</button><button type="button" data-ax="copy" data-mid="${m.id}">نسخ</button></div>` : "";
  return `<div class="am a" data-mid="${m.id}">${body}${m.prop ? axPropHTML(m) : ""}${m.busy && m.text && m.prog ? `<div class="prop-n">${escapeHTML(m.prog)}</div>` : ""}${meta}</div>`;
}
function axWelcome(){
  const pl = DB[state.key];
  return `<div class="am a"><div class="bd"><p><strong>أهلاً بك.</strong> أنا مساعدك داخل تحضير «${escapeHTML(pl.title)}». حاورني في الاستراتيجية التي تريد تقديمها، وسأقترح تعديلات على جدول الحصة تراجعها قبل أن تُطبَّق، ويمكنك التراجع عنها.</p><p>يمكنني أيضاً <strong>بناء التحضير من عرض PowerPoint جاهز</strong>، أو <strong>تصميم عرض PowerPoint من التحضير</strong>. ابدأ من الأزرار بالأسفل أو اكتب طلبك.</p></div></div>`;
}
function axRender(stick){
  const log = $("#asstLog"), ch = axChat();
  const near = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
  log.innerHTML = (ch.msgs.length ? "" : axWelcome()) + ch.msgs.map(axMsgHTML).join("");
  if (stick || near) log.scrollTop = log.scrollHeight;
  axControls();
}
function axControls(){
  const ai = !!sampleFn, f = $("#asstForm"), inp = $("#asstIn"), snd = $("#asstSend");
  inp.disabled = !ai;
  inp.placeholder = ai ? "اكتب ما تريد تغييره أو أضفه في هذا الدرس…" : window.__axChecked ? "المحادثة غير متصلة بعد (انظر التنبيه بالأعلى)" : "جارٍ الاتصال…";
  snd.classList.toggle("stop", AX.busy); snd.disabled = !ai && !AX.busy;
  snd.setAttribute("aria-label", AX.busy ? "إيقاف" : "إرسال");
  axSet(snd, AX.busy ? '<svg class="i"><use href="#i-pause"/></svg>' : '<svg class="i"><use href="#i-send"/></svg>');
  axSet($("#asstTools"), AX_CHIPS.map((c, i) => `<button type="button" data-chip="${i}" class="${c.key ? "key" : ""}"${(!ai && c.id !== "ppt-out") || AX.busy ? " disabled" : ""}>${c.icon ? `<svg class="i"><use href="#${c.icon}"/></svg>` : ""}${c.label}</button>`).join(""));
}
function axSet(el, html){ if (el.__h !== html){ el.__h = html; el.innerHTML = html; } }
function axVV(){
  const el = $("#asst"), vv = window.visualViewport;
  if (!vv || !AX.open || !matchMedia("(max-width:720px)").matches){ el.style.height = ""; el.style.top = ""; el.style.bottom = ""; return; }
  el.style.height = vv.height + "px"; el.style.bottom = "auto"; el.style.top = vv.offsetTop + "px";
}
function asstSync(){
  const d = DB[state.key]; if (!d) return;
  $("#asstCtx").textContent = `${d.code} ${d.title}`;
  const rec = getRec(state.key), L = axLocked(rec), st = $("#asstSt");
  if (!sampleFn && window.__axChecked){
    st.className = "asst-st on";
    const viewer = !!(window.claude && typeof window.claude.use === "function");
    st.innerHTML = (viewer
      ? "لم يتصل المساعد بـ Claude في هذا العرض. افتح الصفحة داخل تطبيق Claude أو موقع claude.ai (من بطاقتها)، ثم اضغط إعادة الفحص. أو فعّله بمفتاحك الخاص."
      : AXD.srv ? "هذا الموقع يتطلب رمز دخول لاستخدام المساعد. اطلب الرمز من مسؤول الموقع."
      : "لتفعيل المحادثة خارج Claude أدخل مفتاح Anthropic API مرة واحدة على هذا الجهاز.") + (viewer ? ` <button type="button" data-ax="recheck">إعادة فحص الاتصال</button>` : "") + ` <button type="button" data-ax="cfg">${viewer ? "استخدام مفتاح API" : AXD.srv ? "إدخال الرمز" : "إدخال المفتاح"}</button><br>يمكنك مع ذلك إنشاء عرض PowerPoint سريعاً من التحضير دون ذكاء اصطناعي.`;
  }
  else if (L){ st.className = "asst-st on info"; st.innerHTML = `التحضير الحالي معدّل بمساعد التحضير، ${durLabel(L.periods)}. <button type="button" data-ax="restore">استعادة التحضير الأصلي</button>`; }
  else { st.className = "asst-st"; st.innerHTML = ""; }
  if (AX.shownKey !== state.key){ AX.shownKey = state.key; axRender(true); } else axControls();
}
function axOpen(v){
  AX.open = v; $("#asst").hidden = !v; document.body.classList.toggle("asst-open", v);
  $("#asstFab").setAttribute("aria-expanded", String(v)); axVV();
  if (v){
    asstSync(); axRender(true);
    if (window.__axChecked && !sampleFn && !window.claude) axdShowCfg(true);
    else if (!matchMedia("(pointer:coarse)").matches && sampleFn) $("#asstIn").focus();
  }
  else $("#asstFab").focus();
}
async function axRecheck(){
  if (!(window.claude && typeof window.claude.use === "function")){ axdShowCfg(true); return; }
  let s = null, why = "";
  try { s = await window.claude.use("sample"); } catch (e) { why = e && e.code ? e.code : "error"; }
  if (s){ sampleFn = s; AXD.mode = "claude"; toast("تم الاتصال بـ Claude"); }
  else toast("ما زال الاتصال غير متاح" + (why ? " (" + why + ")" : ""));
  axdApply();
}
function axSys(text){ axChat().msgs.push({ id: ++AX.seq, role: "s", text }); axRender(true); }

/* ---------- بطاقة الاقتراح ---------- */
function axOpLines(prop, bot){
  const rn = id => { const i = bot.snapIds.indexOf(id); return i < 0 ? "؟" : `${i + 1} «${bot.snapRows[i].code}»`; };
  const val = v => Array.isArray(v) ? v.join("\n") : (v && typeof v === "object" ? Object.values(v).map(x => Array.isArray(x) ? x.map(y => typeof y === "object" ? Object.values(y).join(" — ") : y).join("؛ ") : x).join("\n") : String(v == null ? "" : v));
  if (prop.plan){
    const rows = prop.plan.rows || [], per = {};
    rows.forEach(r => { (per[r.p || 1] = per[r.p || 1] || []).push(`${r.phase || "؟"} (${r.min || "؟"} د)`); });
    return [{ k: "all", t: `<b>خطة جديدة كاملة:</b> ${rows.length} صفاً على ${Object.keys(per).length} حصص، وتحلّ محل الجدول الحالي.`, d: Object.keys(per).map(p => `الحصة ${p}: ${per[p].join(" ← ")}`).join("\n") }];
  }
  return prop.ops.map(op => {
    if (op.op === "update_row"){
      const set = op.set || {}, keys = Object.keys(set).filter(k => AX_KEYS[k]);
      return { k: "", t: `<b>تعديل الصف ${op.rid ? rn(op.rid) : (op.at || "؟")}:</b> ${keys.map(k => AX_KEYS[k]).join("، ") || "—"}`, d: keys.map(k => `${AX_KEYS[k]}: ${val(set[k])}`).join("\n") };
    }
    if (op.op === "insert_row"){
      const r = op.row || {};
      return { k: "add", t: `<b>إضافة صف</b> بعد الصف ${op.rid ? rn(op.rid) : (op.after || "؟")}: «${escapeHTML(r.phase || "نشاط")}» (${r.min || 5} د)`, d: ["المعلم: " + val(r.t), "الطالب: " + val(r.s), r.q ? "السؤال: " + r.q : "", r.ans ? "الإجابة: " + r.ans : ""].filter(Boolean).join("\n") };
    }
    if (op.op === "delete_row") return { k: "del", t: `<b>حذف الصف</b> ${op.rid ? rn(op.rid) : (op.at || "؟")}`, d: "" };
    if (op.op === "move_row") return { k: "", t: `<b>نقل الصف</b> ${op.rid ? rn(op.rid) : (op.at || "؟")} بعد الصف ${op.rid2 ? rn(op.rid2) : (op.after || "؟")}`, d: "" };
    if (op.op === "set") return { k: "", t: `<b>تعديل:</b> ${AX_FIELDS[op.field] || escapeHTML(op.field || "؟")}`, d: val(op.value) };
    return { k: "", t: "بند غير مفهوم", d: "" };
  });
}
function axPropHTML(m){
  const p = m.prop, lines = axOpLines(p, m);
  const li = lines.map(l => `<li><span class="k ${l.k}">${l.k === "add" ? "إضافة" : l.k === "del" ? "حذف" : l.k === "all" ? "إعادة بناء" : "تعديل"}</span>${l.t}${l.d ? `<details><summary>عرض التفاصيل</summary><div>${escapeHTML(l.d)}</div></details>` : ""}</li>`).join("");
  const top = (AX.undo[state.key] || []).slice(-1)[0];
  const rep = p.report;
  let foot;
  if (p.status === "applied") foot = `<span class="prop-st ok">✓ طُبّق على التحضير</span>${top && top.mid === m.id ? `<button class="btn" type="button" data-ax="undo" data-mid="${m.id}"><svg class="i"><use href="#i-undo"/></svg>تراجع</button>` : ""}<button class="btn" type="button" data-ax="show" data-mid="${m.id}">عرض الجدول</button>`;
  else if (p.status === "undone") foot = `<span class="prop-st no">تم التراجع عن هذا الاقتراح</span><button class="btn" type="button" data-ax="apply" data-mid="${m.id}">إعادة التطبيق</button>`;
  else if (p.status === "dismissed") foot = `<span class="prop-st no">تم تجاهل الاقتراح</span>`;
  else foot = `<button class="btn btn-gold" type="button" data-ax="apply" data-mid="${m.id}"><svg class="i"><use href="#i-check"/></svg>تطبيق على التحضير</button><button class="btn" type="button" data-ax="dismiss" data-mid="${m.id}">تجاهل</button>`;
  const warns = []; if (p.bad) warns.push(`تعذّرت قراءة ${p.bad} بند من الاقتراح وتم تجاهلها.`); if (p.truncated) warns.push("قُطع الرد قبل نهايته، فقد يكون الاقتراح ناقصاً؛ راجعه جيداً."); if (rep) { rep.skipped.forEach(s => warns.push("تعذّر: " + s)); rep.notes.forEach(s => warns.push(s)); rep.warn.forEach(s => warns.push(s)); }
  return `<div class="prop"><div class="prop-h"><svg class="i"><use href="#i-spark"/></svg><span>${escapeHTML(p.title || "اقتراح تعديل")}</span></div>
    <div class="prop-n">${lines.length} ${lines.length === 1 ? "بند" : "بنود"}، ولا يُطبَّق شيء قبل موافقتك</div><ul>${li}</ul>${warns.map(w => `<div class="prop-w">${escapeHTML(w)}</div>`).join("")}<div class="prop-f">${foot}</div></div>`;
}

/* ---------- إرسال رسالة ---------- */
function axStopOrSend(e){
  e.preventDefault();
  if (AX.busy){ if (AX.ctl) AX.ctl.abort(); return; }
  const inp = $("#asstIn"), v = inp.value.trim();
  if (!v) return;
  inp.value = ""; axGrow(); axSend(v);
}
function axGrow(){ const t = $("#asstIn"); t.style.height = "auto"; t.style.height = Math.min(130, t.scrollHeight) + "px"; }
function axErr(e){
  const c = e && e.code;
  const m = c === "not_granted" ? "لم يُسمح لهذه الصفحة باستخدام Claude. أعد المحاولة ووافق على نافذة الإذن إن ظهرت."
    : c === "sampling_disabled" || c === "capability_disabled" || c === "capability_removed" || c === "not_declared" ? "الذكاء الاصطناعي غير متاح لهذا الحساب أو في هذا العرض."
    : c === "rate_limited" ? "الطلبات كثيرة حالياً أو بلغت حدّ الاستخدام، حاول بعد قليل."
    : c === "session_expired" ? "انتهت الجلسة، سجّل الدخول إلى Claude من جديد ثم أعد المحاولة."
    : c === "prompt_too_large" ? "المحتوى أكبر من الحد المسموح؛ قلّل نطاق الشرائح أو ابدأ محادثة جديدة."
    : c === "no_key" ? "لم تُدخل مفتاح API بعد. افتح الإعدادات من أيقونة المفتاح أعلى النافذة."
    : c === "invalid_key" ? "مفتاح API غير صحيح أو ملغى. افتح الإعدادات من أيقونة المفتاح أعلى النافذة وأدخله من جديد."
    : c === "forbidden" ? "المفتاح لا يملك صلاحية لهذا الطلب، أو الحساب غير مفعّل للاستخدام."
    : c === "invalid_code" ? "رمز الدخول غير صحيح. اطلبه من مسؤول الموقع وأدخله من أيقونة المفتاح أعلى النافذة."
    : c === "daily_limit" ? "بلغ المساعد حدّه اليومي من الاستخدام في هذا الموقع. حاول غداً أو تواصل مع مسؤول الموقع."
    : c === "server_error" ? "تعذّر على خادم الموقع الاتصال بـ Anthropic. إعداد الموقع يحتاج مراجعة من مسؤوله."
    : c === "no_credit" ? (AXD.mode === "server" ? "انتهى رصيد المساعد في هذا الموقع. أبلغ مسؤول الموقع." : "رصيد حساب API غير كافٍ. أضف رصيداً من console.anthropic.com ثم أعد المحاولة.")
    : c === "overloaded" ? "خوادم Anthropic مزدحمة الآن، أعد المحاولة بعد قليل."
    : c === "model_not_found" ? "النموذج المختار غير متاح لمفتاحك. اختر نموذجاً آخر من إعدادات المفتاح."
    : c === "network" ? (AXD.mode === "server" || AXD.srv ? "تعذّر الاتصال بخادم الموقع. تحقق من الإنترنت وأعد المحاولة." : "تعذّر الوصول إلى خادم Anthropic. تحقق من الإنترنت، أو من أن الشبكة أو المتصفح لا يحجبان الاتصال.")
    : c === "invalid_json" ? "جاء الرد بصيغة غير مقروءة، أعد المحاولة."
    : c === "refused" ? "تعذّر على Claude تنفيذ هذا الطلب، جرّب صياغة أخرى."
    : c === "empty_completion" ? "لم يصل أي رد من Claude، أعد المحاولة."
    : c === "invalid_request" || c === "transform_error" ? "رُفض الطلب لأن صيغته غير صالحة (خلل في الصفحة)."
    : "انقطع الاتصال بـ Claude أثناء الطلب، أعد المحاولة.";
  try { console.warn("assistant sample error", e); } catch (x) {}
  return m + (c ? `\n(رمز الخطأ: ${c}${e && e.message ? " — " + String(e.message).slice(0, 140) : ""})` : "");
}
async function axSend(text){
  if (AX.busy || !sampleFn) return;
  const pl = computePlan(), ch = axChat();
  const hist = ch.msgs.filter(m => (m.role === "u" || m.role === "a") && !m.card && m.text && !m.err && !m.busy);
  const turns = axTurns(text, pl, hist);
  ch.msgs.push({ id: ++AX.seq, role: "u", text });
  const bot = { id: ++AX.seq, role: "a", text: "", busy: true, prop: null, snapIds: pl.flow.map(r => r.id), snapRows: pl.flow.map(r => ({ code: r.code })), key: state.key };
  ch.msgs.push(bot);
  await axStream(bot, turns, pl);
}
async function axStream(bot, input, pl, extra){
  AX.busy = true; AX.ctl = new AbortController(); axRender(true);
  const upd = raw => {
    const sp = axSplit(raw), n = sp.recs.length;
    bot.text = sp.text; bot.prog = n ? (n > 1 || sp.recs[0].kind !== "PROPOSAL" ? `جارٍ تجهيز الاقتراح… (${n} ${n === 1 ? "بند" : "بنود"})` : "جارٍ تجهيز الاقتراح…") : "";
    const el = document.getElementById("axb" + bot.id), log = $("#asstLog");
    if (el && state.key === bot.key){
      const near = log.scrollHeight - log.scrollTop - log.clientHeight < 90;
      el.classList.remove("busy"); el.style.whiteSpace = ""; el.innerHTML = bot.text ? axFmt(bot.text) : escapeHTML(bot.prog || "");
      let pg = el.parentNode.querySelector(".prop-n.live"); if (bot.text && bot.prog){ if (!pg){ pg = document.createElement("div"); pg.className = "prop-n live"; el.parentNode.appendChild(pg); } pg.textContent = bot.prog; } else if (pg) pg.remove();
      if (near) log.scrollTop = log.scrollHeight;
    }
  };
  let raw = "", truncated = false, failed = null;
  const t0 = Date.now();
  const tick = setInterval(() => {
    if (raw) return;
    const el = document.getElementById("axb" + bot.id); if (!el || bot.text) return;
    const s = Math.round((Date.now() - t0) / 1000);
    el.textContent = s < 6 ? "جارٍ التفكير…" : `جارٍ التفكير… ${s} ث\nقد يستغرق الرد حتى دقيقة. وإن ظهرت نافذة إذن من Claude فوافق عليها.`;
    el.style.whiteSpace = "pre-line";
  }, 1000);
  try {
    const res = await sampleFn(input, { cache: false, signal: AX.ctl.signal, onText: ({ text: t }) => { raw = t; upd(t); } });
    raw = res.text; truncated = !!res.truncated;
  } catch (e){ failed = e; if (e && e.text) raw = e.text; }
  clearInterval(tick);
  AX.busy = false; AX.ctl = null; bot.busy = false; bot.prog = "";
  const sp = axSplit(raw); bot.text = sp.text;
  if (failed){
    if (failed.code === "cancelled"){ bot.text = (bot.text ? bot.text + "\n\n" : "") + "(تم الإيقاف)"; }
    else { bot.err = !bot.text; bot.text = (bot.text ? bot.text + "\n\n" : "") + axErr(failed); }
  } else {
    const parsed = axParseProposal(sp.recs);
    if (parsed && (parsed.ops.length || (parsed.plan && parsed.plan.rows.length))){
      parsed.status = "new"; parsed.truncated = truncated; axResolve(parsed, bot);
      bot.prop = parsed;
      if (!bot.text) bot.text = "هذا اقتراحي، راجعه ثم اضغط «تطبيق».";
    } else if (parsed && parsed.bad){ bot.text += "\n\n(تعذّرت قراءة الاقتراح المرفق، اطلبه مرة أخرى.)"; }
    if (extra && extra.done) extra.done(bot, parsed);
  }
  if (!bot.text && !bot.prop) { bot.text = "لم يصلني رد، حاول مرة أخرى."; bot.err = true; }
  axRender(true);
  if (failed && failed.code === "invalid_code") axdBadCode();
}
function axParseProposal(recs){
  if (!recs.length) return null;
  const out = { title: "", ops: [], plan: null, bad: 0 };
  recs.forEach(r => {
    if (!r.buf.trim()) return;
    const o = axParseObj(r.buf);
    if (!o){ out.bad++; return; }
    if (r.kind === "PROPOSAL") out.title = String(o.title || "").slice(0, 90);
    else if (r.kind === "OP") out.ops.push(o);
    else if (r.kind === "PLAN") out.plan = Object.assign({ rows: [] }, o, { rows: (out.plan && out.plan.rows) || [] });
    else if (r.kind === "ROW"){ if (!out.plan) out.plan = { rows: [] }; out.plan.rows.push(o); }
  });
  return out;
}
function axResolve(prop, bot){
  const id = n => bot.snapIds[(parseInt(n, 10) || 0) - 1];
  prop.ops.forEach(op => {
    if (op.at != null) op.rid = id(op.at);
    if (op.op === "insert_row" && op.after != null) op.rid = id(op.after);
    if (op.op === "move_row" && op.after != null) op.rid2 = id(op.after);
  });
  if (!prop.title) prop.title = prop.plan ? "إعادة بناء التحضير" : "تعديل على التحضير";
}

/* ---------- تطبيق الاقتراح والتراجع ---------- */
function axApply(bot){
  const prop = bot.prop; if (!prop || prop.status === "applied") return;
  if (bot.key !== state.key){ toast("هذا الاقتراح يخص درساً آخر"); return; }
  const pl = computePlan(), rec = pl.rec, before = axSnap(rec), mat = axMaterialize(pl);
  const rep = { ok: 0, skipped: [], notes: [], warn: [] };
  if (prop.plan) axApplyPlan(mat, prop.plan, pl.d, rep); else axApplyOps(mat, prop.ops, pl.d, rep);
  if (!rep.ok){ prop.report = rep; axRender(); toast("لم يمكن تطبيق أي بند من هذا الاقتراح"); return; }
  axNormalize(mat, pl, rep);
  axCommit(rec, mat);
  (AX.undo[state.key] = AX.undo[state.key] || []).push({ mid: bot.id, before });
  prop.status = "applied"; prop.report = rep;
  refresh(); axRender(); asstSync();
  toast("طُبّق الاقتراح على التحضير");
}
function axUndo(bot){
  const st = AX.undo[state.key] || [], top = st[st.length - 1];
  if (!top || top.mid !== bot.id) return;
  st.pop(); axRestore(getRec(state.key), top.before); touch();
  Object.keys(flowCache).forEach(k => delete flowCache[k]);
  bot.prop.status = "undone"; bot.prop.report = null;
  refresh(); axRender(); asstSync(); toast("تم التراجع عن الاقتراح");
}
function axRestoreOriginal(){
  const rec = getRec(state.key); if (!axLocked(rec)) return;
  const before = axSnap(rec);
  rec.aiFlow = null; touch(); Object.keys(flowCache).forEach(k => delete flowCache[k]);
  (AX.undo[state.key] = AX.undo[state.key] || []).push({ mid: -1, before });
  refresh(); axRender(); asstSync(); toast("استُعيد التحضير الأصلي");
}
function axBotById(id){ return axChat().msgs.find(m => m.id === +id); }

/* ---------- الأحداث ---------- */
function axBind(){
  $("#asstFab").addEventListener("click", () => axOpen(true));
  $("#asstClose").addEventListener("click", () => axOpen(false));
  $("#asstNew").addEventListener("click", () => { if (AX.busy) return; AX.chats[state.key] = { msgs: [] }; AX.deck = null; axRender(true); });
  $("#asstForm").addEventListener("submit", axStopOrSend);
  $("#asstIn").addEventListener("input", axGrow);
  $("#asstIn").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !matchMedia("(pointer:coarse)").matches){ e.preventDefault(); $("#asstForm").requestSubmit(); }
  });
  $("#asst").addEventListener("keydown", e => { if (e.key === "Escape" && !e.defaultPrevented){ axOpen(false); } });
  $("#asstTools").addEventListener("click", e => {
    const b = e.target.closest("[data-chip]"); if (!b || AX.busy) return;
    const c = AX_CHIPS[+b.dataset.chip];
    if (c.id === "ppt-in") { $("#asstFile").value = ""; $("#asstFile").click(); }
    else if (c.id === "ppt-out") axDeckOutCard();
    else axSend(c.prompt);
  });
  if (window.visualViewport){ visualViewport.addEventListener("resize", axVV); visualViewport.addEventListener("scroll", axVV); }
  $("#asstFile").addEventListener("change", e => { const f = e.target.files && e.target.files[0]; if (f) axLoadDeck(f); });
  $("#asstSt").addEventListener("click", e => { if (e.target.closest("[data-ax=restore]")) axRestoreOriginal(); else if (e.target.closest("[data-ax=recheck]")) axRecheck(); else if (e.target.closest("[data-ax=cfg]")) axdShowCfg(true); });
  axdBind();
  $("#asstLog").addEventListener("click", e => {
    const b = e.target.closest("[data-ax]"); if (!b) return;
    const act = b.dataset.ax, bot = axBotById(b.dataset.mid);
    if (act === "apply" && bot){ if (bot.prop.status === "undone") bot.prop.status = "new"; axApply(bot); }
    else if (act === "dismiss" && bot){ bot.prop.status = "dismissed"; axRender(); }
    else if (act === "undo" && bot) axUndo(bot);
    else if (act === "show"){ if (matchMedia("(max-width:720px)").matches) axOpen(false); setStep(4, true); const t = $(".exec-tbl"); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }
    else if (act === "note" && bot){ getRec(state.key).ai.push({ title: "اقتراح مساعد التحضير", text: bot.text }); touch(); renderOutput(); toast("أُضيف إلى ملاحظات التحضير"); }
    else if (act === "copy" && bot){ (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(bot.text) : Promise.reject()).then(() => toast("تم النسخ"), () => toast("تعذّر النسخ")); }
    else axCardAction(act, b, bot);
  });
}
