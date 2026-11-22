/* ============================================================
   مساعد التحضير: العروض التقديمية (PowerPoint ⇄ التحضير)
   ============================================================ */
function axPath(base, target){
  if (!target) return "";
  if (target[0] === "/") return target.slice(1);
  const parts = (base + target).split("/"), out = [];
  parts.forEach(p => { if (p === "..") out.pop(); else if (p && p !== ".") out.push(p); });
  return out.join("/");
}
function axXmlParas(node){
  const res = [];
  Array.from(node.getElementsByTagNameNS("*", "p")).forEach(p => {
    let t = "";
    Array.from(p.children).forEach(c => {
      const n = c.localName;
      if (n === "r" || n === "fld"){ const tt = c.getElementsByTagNameNS("*", "t")[0]; if (tt) t += tt.textContent; }
      else if (n === "br") t += "\n";
    });
    t = t.replace(/\u000b/g, "\n").trim();
    if (!t) return;
    const pr = Array.from(p.children).find(c => c.localName === "pPr");
    res.push({ lvl: pr && pr.getAttribute("lvl") ? parseInt(pr.getAttribute("lvl"), 10) || 0 : 0, text: t });
  });
  return res;
}
function axSlideContent(doc){
  const out = { title: "", items: [], tables: [], pics: [], charts: 0 };
  const tree = doc.getElementsByTagNameNS("*", "spTree")[0];
  if (!tree) return out;
  const walk = node => {
    Array.from(node.children).forEach(ch => {
      const n = ch.localName;
      if (n === "grpSp") walk(ch);
      else if (n === "sp"){
        const ph = ch.getElementsByTagNameNS("*", "ph")[0], pt = ph ? (ph.getAttribute("type") || "body") : "";
        if (/^(sldNum|dt|ftr|hdr)$/.test(pt)) return;
        const paras = axXmlParas(ch); if (!paras.length) return;
        if (/^(title|ctrTitle)$/.test(pt) && !out.title) out.title = paras.map(p => p.text).join(" ");
        else out.items.push(...paras);
      } else if (n === "graphicFrame"){
        const tbl = ch.getElementsByTagNameNS("*", "tbl")[0];
        if (tbl){
          const rows = Array.from(tbl.getElementsByTagNameNS("*", "tr")).map(tr => Array.from(tr.getElementsByTagNameNS("*", "tc")).map(tc => axXmlParas(tc).map(p => p.text).join(" ")));
          if (rows.length) out.tables.push(rows);
        } else if (ch.getElementsByTagNameNS("*", "chart").length) out.charts++;
      } else if (n === "pic"){
        const c = ch.getElementsByTagNameNS("*", "cNvPr")[0];
        out.pics.push(c ? (c.getAttribute("descr") || "").trim() : "");
      }
    });
  };
  walk(tree);
  return out;
}
async function axReadPptx(file){
  if (typeof JSZip === "undefined") throw new Error("lib");
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const rd = async p => { const f = zip.file(p); return f ? await f.async("string") : ""; };
  const parse = s => new DOMParser().parseFromString(s, "application/xml");
  const presXml = await rd("ppt/presentation.xml");
  if (!presXml) throw new Error("notpptx");
  const pres = parse(presXml), rels = parse(await rd("ppt/_rels/presentation.xml.rels")), relMap = {};
  Array.from(rels.getElementsByTagName("Relationship")).forEach(r => { relMap[r.getAttribute("Id")] = r.getAttribute("Target"); });
  const ids = Array.from(pres.getElementsByTagNameNS("*", "sldId")).map(e => e.getAttribute("r:id") || e.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id"));
  let paths = ids.map(id => relMap[id]).filter(Boolean).map(t => axPath("ppt/", t));
  if (!paths.length) paths = Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => parseInt(a.match(/(\d+)\.xml/)[1], 10) - parseInt(b.match(/(\d+)\.xml/)[1], 10));
  if (!paths.length) throw new Error("empty");
  const slides = [];
  for (let i = 0; i < paths.length; i++){
    const xml = await rd(paths[i]); if (!xml) continue;
    const c = axSlideContent(parse(xml)); c.n = slides.length + 1;
    const base = paths[i].replace(/[^/]+$/, ""), nm = paths[i].replace(/^.*\//, "");
    const relDoc = await rd(base + "_rels/" + nm + ".rels");
    let notes = "";
    if (relDoc){
      const r = Array.from(parse(relDoc).getElementsByTagName("Relationship")).find(x => /notesSlide$/.test(x.getAttribute("Type") || ""));
      if (r){
        const nx = await rd(axPath(base, r.getAttribute("Target")));
        if (nx){
          const nd = parse(nx), tree = nd.getElementsByTagNameNS("*", "spTree")[0], parts = [];
          if (tree) Array.from(tree.getElementsByTagNameNS("*", "sp")).forEach(sp => {
            const ph = sp.getElementsByTagNameNS("*", "ph")[0], pt = ph ? (ph.getAttribute("type") || "") : "";
            if (pt === "body" || (ph && ph.getAttribute("idx") === "1")) parts.push(axXmlParas(sp).map(p => p.text).join("\n"));
          });
          notes = parts.join("\n").trim();
        }
      }
    }
    c.notes = notes; if (!c.title && c.items.length) c.title = c.items[0].text.split("\n")[0].slice(0, 90);
    slides.push(c);
  }
  return { name: file.name.replace(/\.(pptx|ppsx)$/i, ""), slides };
}
function axDeckOutline(deck, from, to, cap){
  const sl = deck.slides.slice(Math.max(1, from) - 1, Math.max(from, to));
  const per = Math.max(350, Math.floor(cap / Math.max(1, sl.length)));
  return sl.map(s => {
    const L = [`الشريحة ${s.n}: «${s.title || "بلا عنوان"}»`];
    s.items.forEach(it => { if (it.text !== s.title) L.push("  ".repeat(Math.min(3, it.lvl)) + "- " + it.text.replace(/\n+/g, " / ")); });
    s.tables.forEach(t => L.push("  (جدول) " + t.map(r => r.join(" | ")).join(" ؛ ")));
    s.pics.forEach(a => L.push("  [صورة" + (a ? ": " + a : "") + "]"));
    if (s.charts) L.push("  [رسم بياني]");
    if (s.notes) L.push("  ملاحظات المتحدث: " + s.notes.replace(/\n+/g, " / "));
    let t = L.join("\n"); if (t.length > per) t = t.slice(0, per) + " …";
    return t;
  }).join("\n");
}
async function axLoadDeck(file){
  if (!sampleFn){ axSys("بناء التحضير من العرض يحتاج الاتصال بالذكاء الاصطناعي. أدخل مفتاح API من أيقونة المفتاح أعلى النافذة."); axdShowCfg(true); return; }
  if (!/\.(pptx|ppsx)$/i.test(file.name)){ axSys("الصيغة المدعومة هي ‎.pptx‎ فقط؛ إن كان عرضك بصيغة قديمة (‎.ppt‎) فاحفظه من PowerPoint بصيغة ‎.pptx‎ ثم أعد المحاولة."); return; }
  if (file.size > 80 * 1024 * 1024){ axSys("حجم العرض كبير جداً (أكثر من 80 ميجابايت)."); return; }
  axSys("جارٍ قراءة العرض…");
  try {
    const deck = await axReadPptx(file);
    AX.deck = deck;
    const ch = axChat(); ch.msgs.pop();
    ch.msgs.push({ id: ++AX.seq, role: "a", card: { type: "deckin" } });
    axRender(true);
  } catch (e){
    const ch = axChat(); ch.msgs.pop(); axRender(true);
    axSys(e && e.message === "notpptx" ? "هذا الملف ليس عرض PowerPoint صالحاً." : e && e.message === "empty" ? "لم أجد شرائح داخل هذا العرض." : "تعذّرت قراءة العرض، تأكد أنه ملف ‎.pptx‎ سليم.");
  }
}

/* ---------- بطاقات النماذج داخل المحادثة ---------- */
function axStratOptions(){ return AX_STRATS.map(s => `<option value="${escapeHTML(s)}"></option>`).join(""); }
function axCardHTML(m){
  const c = m.card, pl = DB[state.key], rec = getRec(state.key);
  if (c.type === "deckin"){
    const dk = AX.deck; if (!dk) return `<div class="bd">انتهت جلسة هذا العرض؛ أعد رفعه.</div>`;
    const n = dk.slides.length, nn = dk.slides.filter(s => s.notes).length, np = dk.slides.reduce((t, s) => t + s.pics.length, 0), nt = dk.slides.reduce((t, s) => t + s.tables.length, 0);
    const per = axLocked(rec) ? axLocked(rec).periods : (OFFICIAL_PERIODS[state.key] || 1);
    if (c.used) return `<div class="bd">تم إرسال العرض «${escapeHTML(dk.name)}» إلى المساعد لبناء التحضير.</div>`;
    return `<div class="acard"><h3><svg class="i"><use href="#i-ppt"/></svg>قرأتُ العرض «${escapeHTML(dk.name)}»</h3>
      <div class="meta">${n} شريحة، منها ${nn} بملاحظات المتحدث، و${nt} جدول، و${np} صورة (تُقرأ النصوص فقط).</div>
      <div class="slides">${dk.slides.slice(0, 60).map(s => `<div><b>${s.n}.</b> ${escapeHTML((s.title || "—").slice(0, 70))}</div>`).join("")}</div>
      <div class="row2"><label>عدد الحصص<select name="periods">${[1, 2, 3, 4, 5, 6].map(x => `<option value="${x}"${x === per ? " selected" : ""}>${x} ${x === 1 ? "حصة" : x === 2 ? "حصتان" : "حصص"} (${x * PM()} د)</option>`).join("")}</select></label>
      <label>الاستراتيجية المطلوبة<input type="text" name="strat" list="axStrats" placeholder="اتركه فارغاً ليختار المساعد"></label></div>
      <div class="row2"><label>من الشريحة<input type="number" name="from" min="1" max="${n}" value="1"></label><label>إلى الشريحة<input type="number" name="to" min="1" max="${n}" value="${n}"></label></div>
      <label>ملاحظات للمساعد (اختياري)<textarea name="note" placeholder="مثال: اجعل الشرائح 5 إلى 8 عملاً في مجموعات، وأبقِ أسئلة العرض كما هي."></textarea></label>
      <div class="fr"><button class="btn btn-gold" type="button" data-ax="deckin-build" data-mid="${m.id}"><svg class="i"><use href="#i-spark"/></svg>ابنِ التحضير من العرض</button><button class="btn" type="button" data-ax="card-x" data-mid="${m.id}">إلغاء</button></div></div>`;
  }
  if (c.type === "deckout"){
    if (c.used) return `<div class="bd">طلبتَ إنشاء عرض PowerPoint من هذا التحضير.</div>`;
    const P = axLocked(rec) ? axLocked(rec).periods : (OFFICIAL_PERIODS[state.key] || 1);
    return `<div class="acard"><h3><svg class="i"><use href="#i-ppt"/></svg>إنشاء عرض PowerPoint من التحضير</h3>
      <div class="meta">يُصمَّم العرض للطلاب بتسلسل التحضير الحالي، وتوضع خطوات المعلم والإجابات في ملاحظات كل شريحة.</div>
      <div class="row2"><label>الجزء المطلوب<select name="part"><option value="0">كل الحصص (${P})</option>${Array.from({ length: P }, (_, i) => i + 1).filter(() => P > 1).map(x => `<option value="${x}">الحصة ${x} فقط</option>`).join("")}</select></label>
      <label>عدد الشرائح التقريبي<select name="count"><option value="0">يحدده المساعد</option><option value="8">قصير (8)</option><option value="12">متوسط (12)</option><option value="18">مفصّل (18)</option><option value="26">موسّع (26)</option></select></label></div>
      <label>ملاحظات (اختياري)<textarea name="note" placeholder="مثال: أريد أسئلة تفاعلية أكثر، وجدولاً يقارن بين المفهومين."></textarea></label>
      <label class="ck"><input type="checkbox" name="notes" checked> وضع خطوات المعلم والإجابات في ملاحظات الشرائح</label>
      <div class="fr">${sampleFn ? `<button class="btn btn-gold" type="button" data-ax="deckout-ai" data-mid="${m.id}"><svg class="i"><use href="#i-spark"/></svg>صمّم العرض بالذكاء الاصطناعي</button>` : ""}<button class="btn" type="button" data-ax="deckout-quick" data-mid="${m.id}">إنشاء سريع بدون ذكاء</button><button class="btn" type="button" data-ax="card-x" data-mid="${m.id}">إلغاء</button></div></div>`;
  }
  if (c.type === "deckfile"){
    if (c.state === "building") return `<div class="acard"><h3><svg class="i"><use href="#i-ppt"/></svg>${escapeHTML(c.head || "جارٍ تصميم العرض")}</h3><div class="meta">${escapeHTML(c.prog || "جارٍ التفكير…")}</div></div>`;
    if (c.state === "error") return `<div class="bd err">${escapeHTML(c.msg)}</div>`;
    return `<div class="acard"><h3><svg class="i"><use href="#i-check"/></svg>العرض جاهز</h3><div class="meta">${c.count} شريحة${c.mode === "quick" ? " (إنشاء سريع من نص التحضير)" : ""}. افتحه في PowerPoint وراجع التنسيق قبل استخدامه. ${c.note ? escapeHTML(c.note) : ""}</div>
      <div class="fr"><button class="btn btn-gold" type="button" data-ax="deck-save" data-mid="${m.id}"><svg class="i"><use href="#i-download"/></svg>حفظ ملف PowerPoint</button></div></div>`;
  }
  return "";
}
function axDeckOutCard(){
  axChat().msgs.push({ id: ++AX.seq, role: "a", card: { type: "deckout" } }); axRender(true);
}
function axForm(mid){
  const root = document.querySelector(`#asstLog [data-mid="${mid}"] .acard`);
  const g = n => { const e = root && root.querySelector(`[name="${n}"]`); return e ? (e.type === "checkbox" ? e.checked : e.value.trim()) : ""; };
  return g;
}
function axCardAction(act, btn, bot){
  const m = axBotById(btn.dataset.mid); if (!m) return;
  if (act === "card-x"){ axChat().msgs = axChat().msgs.filter(x => x !== m); axRender(); }
  else if (act === "deckin-build") axDeckInBuild(m);
  else if (act === "deckout-ai") axDeckOutBuild(m, false);
  else if (act === "deckout-quick") axDeckOutBuild(m, true);
  else if (act === "deck-save") axDeckSave(m);
}

/* ---------- العرض → تحضير ---------- */
function axDeckPrompt(pl, deck, o){
  const S = Object.values(STRAT).find(s => o.strat && (s.label.indexOf(o.strat) >= 0 || o.strat.indexOf(s.label.split(" (")[0]) >= 0));
  const stratTxt = !o.strat ? "اختر الاستراتيجية الأنسب لمحتوى العرض وسمِّها بوضوح في حقل strat." : `${o.strat}${S ? ` (مراحلها: ${[S.open.label].concat(S.mid.map(x => x.label), [S.close.label]).join(" ← ")})` : ""} — اجعل مراحل الصفوف تعكسها.`;
  return `أنت «مساعد التحضير» داخل منظومة تحضير العلوم لمعلم في سلطنة عُمان. مهمتك الآن: تحويل عرض PowerPoint أعدّه المعلم إلى تحضير درس كامل جاهز للتنفيذ، يكون العرض فيه العمود الفقري لسير الحصص.

${axLessonCtx(pl).replace(/عدد الحصص في هذه الورقة: \d+/, "عدد الحصص المطلوب: " + o.periods)}

[خيارات المعلم]
- عدد الحصص: ${o.periods} (الحصة ${PM()} دقيقة).
- الاستراتيجية: ${stratTxt}
- نطاق الشرائح المعتمد: من ${o.from} إلى ${o.to}.
${o.note ? "- ملاحظات المعلم: " + o.note : ""}

[محتوى العرض: «${deck.name}»]
${axDeckOutline(deck, o.from, o.to, 60000)}

[قواعد البناء]
1) وزّع شرائح العرض بالترتيب على صفوف الحصص، ولا تُسقط شريحة ذات محتوى علمي دون سبب. اذكر أرقام الشرائح في خطوات المعلم ("يعرض الشريحة 4"، "الشرائح 5–7").
2) استخدم أسئلة العرض وأنشطته ومعلوماته كما هي في صفوف الخطة، ولا تستبدل بها أنشطة من عندك. وأكمل ما ينقص فقط (التمهيد، التقويم التكويني، أدوار الطلاب، الأسئلة السابرة) بما يناسب الاستراتيجية.
3) اربط الصفوف بأهداف الدرس (obj) وتأكد أن كل هدف محدد يظهر في صف واحد على الأقل.
4) إن وجدت في العرض معلومة علمية مشكوكاً فيها أو تعارضاً مع أهداف الدرس فنبّه إليه في النص التمهيدي ولا تصحح بصمت. وإن كان العرض لا يغطي هدفاً فاقترح صفاً يغطيه وسمّه في النص.
5) خطوات المعلم 2–4 خطوات قصيرة (كل خطوة حتى 18 كلمة)، وخطوات الطالب 1–3، وفي كل صف أداة تقويم ومعيار نجاح، وسؤال وإجابة حيث يُطرح سؤال. اختصر لأن الخطة كاملة تُكتب في رد واحد.

[صيغة الإخراج]
جملتان على الأكثر تشرحان كيف وزّعتَ الشرائح على الحصص وأي تنبيهات، ثم الخطة كاملة بالصيغة الآتية دون أي نص بعد @@END:
@@PROPOSAL {"title":"تحضير مبني على العرض"}
${axPlanFmt()}`;
}
async function axDeckInBuild(m){
  if (AX.busy || !AX.deck) return;
  const g = axForm(m.id), n = AX.deck.slides.length;
  const o = { periods: axInt(g("periods"), 2, 1, 6), strat: g("strat"), from: axInt(g("from"), 1, 1, n), to: axInt(g("to"), n, 1, n), note: g("note") };
  if (o.to < o.from) o.to = o.from;
  m.card.used = true;
  const pl = computePlan(), ch = axChat();
  ch.msgs.push({ id: ++AX.seq, role: "u", text: `ابنِ التحضير من العرض «${AX.deck.name}» (الشرائح ${o.from}–${o.to}) على ${o.periods} ${o.periods === 1 ? "حصة" : "حصص"}${o.strat ? "، بإستراتيجية " + o.strat : ""}.` });
  const bot = { id: ++AX.seq, role: "a", text: "", busy: true, prop: null, snapIds: pl.flow.map(r => r.id), snapRows: pl.flow.map(r => ({ code: r.code })), key: state.key };
  ch.msgs.push(bot);
  await axStream(bot, axDeckPrompt(pl, AX.deck, o), pl);
}

/* ---------- التحضير → عرض ---------- */
const axPlanFmt = () => `@@PLAN {"periods":2,"prior":{"items":[".."],"technique":"..","qs":[{"q":"..","a":".."}]},"warm":{"stimulus":"..","question":"..","expected":".."},"exit":{"q":"..","a":"..","crit":".."},"homework":"..","support":[".."],"enrich":[".."]}
@@ROW {"p":1,"bk":"","phase":"التمهيد","strat":"..","min":5,"obj":[],"t":[".."],"s":[".."],"tool":"..","q":"..","ans":"..","crit":".."}
(سطر @@ROW لكل صف بالترتيب. قواعد الخطة: مجموع دقائق كل حصة ${PM()} بالضبط؛ أول صف في الحصة 1 هو «التمهيد» وسؤاله هو سؤال warm؛ أول صف في كل حصة تالية bk:"open" (مراجعة التعلم القبلي + تمهيد)؛ آخر صف في كل حصة غير الأخيرة bk:"close" (تقويم تكويني بسؤال وإجابة ومعيار)؛ وآخر صف في الخطة «الختام» (بطاقة الخروج، 5 دقائق) وسؤاله هو سؤال exit؛ في كل حصة صف واحد على الأقل مرتبط بهدف (obj)؛ أسئلة التقويم غير مكررة؛ لا تتجاوز 8 صفوف في الحصة.)
@@END`;
function axDeckOutPrompt(pl, o){
  const rows = o.part ? pl.flow.filter(r => (r.period || 1) === o.part) : pl.flow;
  const idx = r => pl.flow.indexOf(r) + 1;
  const listing = rows.map(r => `#${idx(r)} | الحصة ${r.period || 1}${r.bk ? (r.bk === "open" ? " [افتتاحية]" : " [ختامية]") : ""} | «${r.code}» | ${r.minutes} د | ${r.strat || "—"}\n  المعلم: ${axPlain(r.teacher)}\n  الطالب: ${axPlain(r.student)}\n  التقويم: ${axPlain(r.eval)}`).join("\n");
  const target = o.count ? `حوالي ${o.count} شريحة` : `عدد مناسب (غالباً شريحتان لكل صف، بين 8 و28)`;
  return `أنت «مساعد التحضير» داخل منظومة تحضير العلوم لمعلم في سلطنة عُمان. مهمتك: تصميم محتوى عرض PowerPoint صفّي موجّه للطلاب من تحضير الدرس أدناه، يخدم خطوات الحصة بترتيبها.

${axLessonCtx(pl)}

[التحضير${o.part ? " — الحصة " + o.part + " فقط" : ""}]
${listing}
${axSections(pl)}

[خيارات المعلم]
- حجم العرض: ${target}.
${o.note ? "- ملاحظات المعلم: " + o.note : ""}

[قواعد التصميم]
1) العرض يراه الطلاب: عبارات قصيرة (البند الواحد حتى 12 كلمة، وحتى 5 بنود في الشريحة)، ولا تنقل نص التحضير حرفياً.
2) كل صف من التحضير يظهر في شريحة واحدة على الأقل بالترتيب، وأسئلة التقويم تظهر في شرائح سؤال (k:"question") ولا توضع إجاباتها على الشريحة بل في الملاحظات n.
3) خطوات المعلم ونص الحوار والإجابات المتوقعة ومعايير النجاح تُكتب في حقل الملاحظات n لكل شريحة (جمل قصيرة مرقمة).
4) أنواع الشرائح k: "list" (عنوان h وبنود b)، "steps" (خطوات الطالب st)، "question" (سؤال q وتلميح hint اختياري)، "cols" (مقارنة: cols=[{"h":"..","b":[".."]}] من عمودين أو ثلاثة)، "table" (head=[..] وrows=[[..]] حتى 6 صفوف و4 أعمدة)، "summary" (خلاصة b)، "divider" (فاصل بين الحصص h).
5) في كل شريحة h عنوان قصير (حتى 7 كلمات)، وtag اختياري مثل "10 د · الاستقصاء الموجه". استخدم الرموز الكيميائية الصحيحة بالأرقام السفلية (H₂O، CO₂) ولا تستخدم الحرف Σ.
6) أنشئ شريحة أهداف الدرس بعد العنوان (k:"list") وشريحة خلاصة أو بطاقة خروج في النهاية.
7) لا تضف معلومات علمية غير موجودة في التحضير أو في الأهداف.

[صيغة الإخراج] جملة واحدة تلخّص العرض، ثم:
@@DECK {"title":"عنوان العرض","sub":"عنوان فرعي: الوحدة والصف"}
@@SLIDE {"k":"list","h":"أهداف الدرس","b":[".."],"n":"ملاحظات المعلم","tag":""}
@@SLIDE {"k":"question","h":"فكّر","q":"السؤال","hint":"","n":"الإجابة: ..","tag":"5 د"}
(سطر @@SLIDE لكل شريحة، كل سطر JSON واحد، ثم @@END ولا تكتب شيئاً بعده)`;
}
function axQuickSpec(pl, o){
  const rows = o.part ? pl.flow.filter(r => (r.period || 1) === o.part) : pl.flow;
  const steps = h => plainText(h).split(/\n+/).map(s => s.replace(/^\s*\d+\s*[.)-]\s*/, "").trim()).filter(Boolean);
  const sl = [{ k: "list", h: "أهداف الدرس", b: pl.objs.map(x => plainText(x.text)).slice(0, 6), n: "" }];
  let per = 0;
  rows.forEach(r => {
    if (pl.periods > 1 && !o.part && (r.period || 1) !== per){ per = r.period || 1; sl.push({ k: "divider", h: "الحصة " + per, n: "" }); }
    const e = axParseEval(r.eval), tag = r.minutes + " د" + (r.strat ? " · " + r.strat : "");
    const notes = o.notes ? "المعلم:\n" + steps(r.teacher).map((s, i) => `${i + 1}. ${s}`).join("\n") + (e.ans ? "\nالإجابة المتوقعة: " + plainText(e.ans) : "") + (e.crit ? "\nمعيار النجاح: " + plainText(e.crit) : "") : "";
    if (e.q && (r.bk || /تمهيد|ختام|تقويم/.test(r.code))) sl.push({ k: "question", h: r.code, q: plainText(e.q), tag, n: notes });
    else sl.push({ k: "steps", h: r.code, st: steps(r.student).slice(0, 6), tag, n: notes });
  });
  return { title: pl.d.title, sub: pl.d.unitTitle, slides: sl };
}
async function axDeckOutBuild(m, quick){
  if (AX.busy) return;
  const g = axForm(m.id);
  const o = { part: axInt(g("part"), 0, 0, 9), count: axInt(g("count"), 0, 0, 40), note: g("note"), notes: !!g("notes") };
  m.card.used = true;
  const pl = computePlan(), ch = axChat();
  const fc = { id: ++AX.seq, role: "a", card: { type: "deckfile", state: "building", head: quick ? "جارٍ إنشاء العرض" : "جارٍ تصميم العرض بالذكاء الاصطناعي", prog: "جارٍ التفكير…", count: 0, mode: quick ? "quick" : "ai", key: state.key } };
  ch.msgs.push(fc); axRender(true);
  const refresh1 = () => { const el = document.querySelector(`#asstLog [data-mid="${fc.id}"]`); if (el) el.innerHTML = axCardHTML(fc); };
  try {
    let spec;
    if (quick) spec = axQuickSpec(pl, o);
    else {
      AX.busy = true; AX.ctl = new AbortController(); axControls();
      let raw = "";
      try {
        const res = await sampleFn(axDeckOutPrompt(pl, o), { cache: false, signal: AX.ctl.signal, onText: ({ text: t }) => { raw = t; const k = (t.match(/^\s*@@SLIDE\b/gm) || []).length; fc.card.prog = k ? `كُتبت ${k} ${k === 1 ? "شريحة" : "شرائح"}…` : "جارٍ التفكير…"; refresh1(); } });
        raw = res.text;
      } finally { AX.busy = false; AX.ctl = null; axControls(); }
      const sp = axSplit(raw), slides = [];
      let head = { title: pl.d.title, sub: pl.d.unitTitle };
      sp.recs.forEach(r => { const ob = axParseObj(r.buf); if (!ob) return; if (r.kind === "DECK") head = Object.assign(head, ob); else if (r.kind === "SLIDE") slides.push(ob); });
      if (slides.length < 2) throw new Error("few");
      if (!o.notes) slides.forEach(s => { s.n = ""; });
      spec = { title: head.title || pl.d.title, sub: head.sub || pl.d.unitTitle, slides };
      fc.card.note = sp.text && sp.text.length < 220 ? sp.text : "";
    }
    fc.card.prog = "جارٍ تجهيز ملف PowerPoint…"; refresh1();
    const blob = await axBuildPptx(spec, pl);
    const clean = s => String(s).replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
    Object.assign(fc.card, { state: "ready", blob, count: spec.slides.length + (spec.slides[0] && spec.slides[0].k === "title" ? 0 : 1), fname: ("عرض " + pl.d.code + " " + clean(pl.d.title)).slice(0, 90) + ".pptx" });
  } catch (e){
    fc.card.state = "error";
    fc.card.msg = e && e.code === "cancelled" ? "تم إيقاف تصميم العرض." : e && e.message === "few" ? "لم يرجع المساعد شرائح كافية، حاول مرة أخرى أو استخدم الإنشاء السريع." : e && e.code ? axErr(e) : "تعذّر إنشاء ملف PowerPoint: " + (e && e.message ? e.message : "خطأ غير معروف");
  }
  axRender(true);
}
async function axDeckSave(m){
  const c = m.card; if (!c.blob) return;
  await saveFile(c.fname, c.blob, "جارٍ تنزيل ملف PowerPoint");
}

/* ---------- بناء ملف PowerPoint (يمين إلى يسار) ---------- */
async function axBuildPptx(spec, pl){
  if (typeof PptxGenJS === "undefined") throw new Error("مكتبة العروض غير محمّلة");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; pptx.rtlMode = true;
  pptx.title = spec.title || pl.d.title; pptx.author = (store.meta && store.meta.teacher) || "معلم المادة"; pptx.subject = pl.d.unitTitle; pptx.company = (store.meta && store.meta.school) || "";
  const W = 13.333, H = 7.5, FONT = "Arial", X0 = 0.8, BW = W - 1.6;
  const C = { navy: "0B1D3A", navy3: "21477F", gold: "D4A548", goldD: "9C7020", gold2: "E9C46A", ivory: "F6F4EE", ink: "14213D", text: "3A4664", white: "FFFFFF", blue50: "EEF3FB", line: "D5D9E3" };
  const cm = courseMeta(pl.key), footer = `${pl.d.code} ${pl.d.title}`;
  const T = (s, text, o) => s.addText(String(text), Object.assign({ fontFace: FONT, color: C.ink, rtlMode: true, lang: "ar-SA", align: "right", valign: "top", margin: 0, fit: "none", isTextBox: true }, o));
  const fitList = (items, w, h, maxFs, minFs, gap) => {
    for (let fs = maxFs; fs >= minFs; fs -= 2){
      const hs = items.map(t => Math.max(1, Math.ceil(String(t).length * fs * 0.54 / (w * 72))) * fs * 1.34 / 72);
      const tot = hs.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
      if (tot <= h || fs - 2 < minFs) return { fs, hs, tot };
    }
  };
  let num = 0;
  const frame = (s, title, tag) => {
    num++;
    s.background = { color: C.ivory };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 1.2, fill: { color: C.navy }, line: { color: C.navy } });
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 1.2, w: W, h: 0.07, fill: { color: C.gold }, line: { color: C.gold } });
    const tw = tag ? W - 1.2 - 3.7 : W - 1.2, fs = title.length > 55 ? 22 : title.length > 38 ? 26 : 30;
    T(s, title, { x: W - 0.6 - tw, y: 0.14, w: tw, h: 0.92, fontSize: fs, bold: true, color: C.white, valign: "middle" });
    if (tag){
      s.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 0.34, w: 3.3, h: 0.52, fill: { color: C.gold }, line: { color: C.gold }, rectRadius: 0.12 });
      T(s, tag, { x: 0.55, y: 0.34, w: 3.2, h: 0.52, fontSize: 14, bold: true, color: C.navy, align: "center", valign: "middle" });
    }
    s.addShape(pptx.ShapeType.line, { x: 0.6, y: 7.0, w: W - 1.2, h: 0, line: { color: C.line, width: 1 } });
    T(s, footer, { x: 3.2, y: 7.06, w: W - 3.8, h: 0.3, fontSize: 11, color: C.text });
    T(s, String(num), { x: 0.6, y: 7.06, w: 1.2, h: 0.3, fontSize: 12, bold: true, color: C.goldD, align: "left" });
  };
  const bullets = (s, items, mk, o) => {
    o = o || {};
    const x = o.x == null ? X0 : o.x, w = o.w == null ? BW : o.w, y0 = o.y == null ? 1.7 : o.y, h = o.h == null ? 5.1 : o.h;
    items = items.map(t => String(t)).filter(Boolean).slice(0, 8);
    if (!items.length) return;
    const tw = w - 0.62, gap = 0.28, f = fitList(items, tw, h, o.max || (items.length <= 4 ? 34 : 28), 16, gap);
    let y = y0 + Math.max(0, Math.min(o.top == null ? 0.7 : o.top, (h - f.tot) / 2));
    items.forEach((t, i) => {
      const hh = f.hs[i], mkD = Math.min(0.46, Math.max(0.26, f.fs / 56));
      if (mk === "num"){
        s.addShape(pptx.ShapeType.ellipse, { x: x + w - 0.5, y: y + 0.01, w: 0.46, h: 0.46, fill: { color: C.navy3 }, line: { color: C.navy3 } });
        T(s, String(i + 1), { x: x + w - 0.5, y: y + 0.01, w: 0.46, h: 0.46, fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle" });
      } else {
        s.addShape(pptx.ShapeType.ellipse, { x: x + w - 0.3, y: y + Math.max(0.06, f.fs * 1.34 / 72 / 2 - 0.09), w: 0.18, h: 0.18, fill: { color: mk === "ok" ? "0E9F6E" : C.gold }, line: { color: mk === "ok" ? "0E9F6E" : C.gold } });
      }
      T(s, t, { x, y, w: tw, h: hh + 0.05, fontSize: f.fs, color: C.ink, valign: "top" });
      y += hh + gap;
    });
  };
  const addNotes = (s, sl) => { if (sl.n) s.addNotes(String(sl.n)); };
  const slides = spec.slides.slice(0, 40);
  // شريحة العنوان
  {
    const s = pptx.addSlide(); num++;
    s.background = { color: C.navy };
    s.addShape(pptx.ShapeType.rect, { x: W - 0.4, y: 0, w: 0.4, h: H, fill: { color: C.gold }, line: { color: C.gold } });
    s.addShape(pptx.ShapeType.rect, { x: W - 0.62, y: 0, w: 0.07, h: H, fill: { color: C.gold2 }, line: { color: C.gold2 } });
    T(s, spec.title || pl.d.title, { x: 1.0, y: 2.0, w: W - 2.4, h: 2.2, fontSize: (spec.title || "").length > 40 ? 40 : 48, bold: true, color: C.white, valign: "bottom" });
    s.addShape(pptx.ShapeType.rect, { x: W - 4.4, y: 4.4, w: 3.0, h: 0.06, fill: { color: C.gold }, line: { color: C.gold } });
    T(s, spec.sub || pl.d.unitTitle, { x: 1.0, y: 4.65, w: W - 2.4, h: 0.7, fontSize: 24, color: C.gold2 });
    T(s, `${cm.subj.name} — الصف ${cm.gradeName}`, { x: 1.0, y: 5.4, w: W - 2.4, h: 0.5, fontSize: 18, color: "C9D6EE" });
    const tn = store.meta && store.meta.teacher; if (tn) T(s, "المعلم: " + tn, { x: 1.0, y: 6.7, w: 6, h: 0.4, fontSize: 14, color: "C9D6EE", align: "left" });
    s.addNotes(`درس: ${pl.d.code} ${pl.d.title}`);
  }
  for (const sl of slides){
    const k = String(sl.k || "list"), h = axClean(sl.h || "").replace(/<[^>]*>/g, "") || pl.d.title, tag = sl.tag ? String(sl.tag).slice(0, 34) : "";
    const s = pptx.addSlide();
    if (k === "divider"){
      num++; s.background = { color: C.navy };
      s.addShape(pptx.ShapeType.rect, { x: W - 0.4, y: 0, w: 0.4, h: H, fill: { color: C.gold }, line: { color: C.gold } });
      T(s, h, { x: 1, y: 2.7, w: W - 2.4, h: 1.6, fontSize: 56, bold: true, color: C.white, valign: "middle" });
      s.addShape(pptx.ShapeType.rect, { x: W - 4.4, y: 4.45, w: 3.0, h: 0.06, fill: { color: C.gold }, line: { color: C.gold } });
      addNotes(s, sl); continue;
    }
    frame(s, h, tag);
    if (k === "question"){
      const q = axClean(sl.q || sl.b && sl.b[0] || h).replace(/<[^>]*>/g, "");
      s.addShape(pptx.ShapeType.roundRect, { x: 1.1, y: 1.95, w: W - 2.2, h: 3.3, fill: { color: C.white }, line: { color: C.gold, width: 3 }, rectRadius: 0.18 });
      const f = fitList([q], W - 3.4, 2.8, 40, 24, 0);
      T(s, q, { x: 1.7, y: 2.1, w: W - 3.4, h: 3.0, fontSize: f.fs, bold: true, color: C.navy, align: "center", valign: "middle" });
      if (sl.hint) T(s, "تلميح: " + axClean(sl.hint).replace(/<[^>]*>/g, ""), { x: 1.1, y: 5.55, w: W - 2.2, h: 0.9, fontSize: 20, color: C.text, align: "center" });
    } else if (k === "cols" && Array.isArray(sl.cols) && sl.cols.length){
      const cols = sl.cols.slice(0, 3), n = cols.length, gap = 0.35, cw = (BW - gap * (n - 1)) / n;
      const cItems = cols.map(c => (c.b || []).map(t => axClean(t).replace(/<[^>]*>/g, "")).filter(Boolean).slice(0, 8));
      const need = Math.max(...cItems.map(it => it.length ? fitList(it, cw - 0.3 - 0.62, 3.9, n === 3 ? 22 : 26, 16, 0.28).tot : 0));
      const cardH = Math.min(5.0, Math.max(3.4, 1.35 + need + 0.5));
      cols.forEach((c, i) => {
        const x = X0 + BW - cw - i * (cw + gap);
        s.addShape(pptx.ShapeType.roundRect, { x, y: 1.75, w: cw, h: cardH, fill: { color: C.white }, line: { color: C.line, width: 1.5 }, rectRadius: 0.12 });
        s.addShape(pptx.ShapeType.rect, { x, y: 1.75, w: cw, h: 0.75, fill: { color: C.navy3 }, line: { color: C.navy3 } });
        T(s, axClean(c.h || "").replace(/<[^>]*>/g, ""), { x: x + 0.15, y: 1.75, w: cw - 0.3, h: 0.75, fontSize: 22, bold: true, color: C.white, align: "center", valign: "middle" });
        bullets(s, cItems[i], "dot", { x: x + 0.15, w: cw - 0.3, y: 2.7, h: cardH - 1.15, max: n === 3 ? 22 : 26, top: 0.1 });
      });
    } else if (k === "table" && Array.isArray(sl.head) && Array.isArray(sl.rows)){
      const head = sl.head.slice(0, 4).map(t => axClean(t)), rows = sl.rows.slice(0, 7).map(r => (r || []).slice(0, head.length).map(t => axClean(t)));
      const cell = (t, hd, ri) => ({ text: String(t == null ? "" : t).replace(/<[^>]*>/g, ""), options: { bold: hd, color: hd ? C.white : C.ink, fill: { color: hd ? C.navy3 : (ri % 2 ? C.blue50 : C.white) }, align: "right", valign: "middle", rtlMode: true, fontFace: FONT, fontSize: hd ? 22 : 20, lang: "ar-SA" } });
      const rev = a => a.slice().reverse();
      const data = [rev(head).map(t => cell(t, true, 0))].concat(rows.map((r, ri) => rev(head.map((_, ci) => r[ci] == null ? "" : r[ci])).map(t => cell(t, false, ri))));
      s.addTable(data, { x: X0, y: 1.75, w: BW, colW: head.map(() => BW / head.length), border: { type: "solid", pt: 1, color: C.line }, rowH: 0.7 });
    } else {
      const items = k === "steps" ? (sl.st || sl.b || []) : (sl.b || sl.st || []);
      bullets(s, items.map(t => axClean(t).replace(/<[^>]*>/g, "")), k === "steps" ? "num" : (k === "summary" ? "ok" : "dot"));
    }
    addNotes(s, sl);
  }
  return await pptx.write({ outputType: "blob" });
}
