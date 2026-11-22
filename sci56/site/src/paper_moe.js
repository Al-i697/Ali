/* The prep sheet in the Ministry of Education template: screen, preview and print.
   Spliced over the main site's paper (formHTML, measureFlow, pageBreaks) by tools/fork_sci.py; the styles are src/paper_moe.css.
   Page 1: banner, unit | lesson | grade, day/period/outcome codes, prior learning/warm-up, outcomes | strategies | execution | resources, signatures.
   Page 2: banner, formative | enrichment/remedial | closing | homework, teacher notes, signatures. The execution column is cut between activities when it
   passes a page (measureFlow), the evaluation page always starts a new page. */

/*@formHTML*/
document.addEventListener("input", e => {   // the signatures appear on both pages: keep the two inputs in step
  const t = e.target;
  if (t && t.dataset && t.dataset.meta && t.dataset.meta !== "date") document.querySelectorAll(`[data-meta="${t.dataset.meta}"]`).forEach(o => { if (o !== t) o.value = t.value; });
});
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {   // measured with the final fonts: re-measure once they are in
  for (const k in flowCache) delete flowCache[k];
  if (typeof renderOutput === "function" && state.key && state.view === "form" && document.activeElement === document.body) renderOutput();
});
function formHTML(pl, splits){
  const d = pl.d, m = pl.meta, unit = splitUnit(d.unitTitle), wk = weekData(pl), cm = courseMeta(pl.key), multi = !!pl.split;
  const objById = {}; pl.objs.forEach(o => { objById[o.id] = o; });
  const codesOf = r => [...new Set((r.objIds || []).map(id => objById[id]).filter(Boolean).map(objLabel))];
  const banner = `<div class="m-banner m-hdr"><div class="h-r"><img class="lg-em" src="${LOGO_EMBLEM}" alt="" width="${LOGO_DIM.emblem[0]}" height="${LOGO_DIM.emblem[1]}"></div><div class="h-c"><img class="lg-v" src="${LOGO_V2040}" alt="رؤية عُمان 2040" width="${LOGO_DIM.v2040[0]}" height="${LOGO_DIM.v2040[1]}"></div><div class="h-l"><img class="lg-q" src="${LOGO_QMS}" alt="نظام إدارة الجودة" width="${LOGO_DIM.qms[0]}" height="${LOGO_DIM.qms[1]}"></div></div>`;
  const sign = () => `<div class="m-sign">${[["teacher", "معلم المادة"], ["supervisor", "مشرف المادة"], ["principal", "مدير المدرسة"]].map(([k, l]) =>
    `<label class="sg"><b>${l}</b><input class="m-in" data-meta="${k}" value="${escapeHTML(m[k] || "")}" placeholder="اسم ${l}" autocomplete="${k === "teacher" ? "name" : "off"}"></label>`).join("")}</div>`;

  const info = `<table class="m-t m-info"><colgroup><col style="width:30%"><col style="width:46%"><col style="width:24%"></colgroup><tr>
    <td><b>الوحدة:</b> <span class="mv">${escapeHTML(unit.label ? unit.label.replace(/^الوحدة\s*/, "") + ": " : "")}${escapeHTML(unit.name)}</span></td>
    <td><b>عنوان الدرس:</b> <span class="mc"><bdi dir="ltr">(${escapeHTML(d.code)})</bdi></span> <span class="mv">${escapeHTML(d.title)}</span></td>
    <td><b>الصف:</b> <span class="mv">${escapeHTML(cm.gradeName)} / <input class="m-in m-sec" data-meta="section" value="${escapeHTML(m.section || "")}" placeholder="الشعبة" aria-label="الشعبة"></span></td></tr></table>`;

  const wrow = (label, cls, cell) => `<tr class="${cls}"><th>${label}</th>${wk.map((w, i) => `<td>${cell(w, i)}</td>`).join("")}</tr>`;
  const week = `<table class="m-t m-week"><colgroup><col style="width:19%">${'<col style="width:16.2%">'.repeat(5)}</colgroup>
    ${wrow("اليوم والتاريخ", "m-r1", (w, i) => `<span class="wd${w.date || w.period || w.codes ? "" : " emp"}">${w.name}</span><input class="m-in wdate" data-week="${i}:date" value="${escapeHTML(w.date)}" placeholder="التاريخ" aria-label="تاريخ ${w.name}">`)}
    ${wrow("الحصة", "m-r2", (w, i) => `<input class="m-in" data-week="${i}:period" value="${escapeHTML(w.period)}" placeholder="—" aria-label="حصة ${w.name}">`)}
    ${wrow("أرقام المخرجات", "m-r3", (w, i) => `<input class="m-in codes ${fitCls(w.codes)}" data-week="${i}:codes" value="${escapeHTML(w.codes)}" placeholder="—" aria-label="أرقام مخرجات ${w.name}">`)}</table>`;

  // outcomes | strategies | execution | resources
  const objs = pl.objs.length ? pl.objs.map(o => `<div class="m-o"><b>المخرج (${codeHTML(objLabel(o))})</b><div>${ltrChem(o.text)}</div></div>`).join("") : `<p class="warn-text">لم يُحدَّد أي هدف.</p>`;
  const chosen = new Set(pl.strategies), locked = new Set(pl.lockedStrats);
  const stratList = [...new Set((pl.def ? [pl.def.label] : []).concat(pl.lockedStrats, allStrategies(pl.key)))];
  const stratCodes = s => [...new Set(pl.flow.filter(r => r.strat === s).flatMap(codesOf))];
  const strats = `<ul class="chk m-chk">${stratList.map((s, i) => {
    const on = chosen.has(s), cs = on ? stratCodes(s) : [];
    return `<li${on ? ' class="on"' : ""}${(pl.def && i === 0) || locked.has(s) ? ' data-prim="1"' : ` data-strat="${escapeHTML(s)}" role="checkbox" aria-checked="${on}" tabindex="0"`}><span class="bx" aria-hidden="true">${on ? "(" + (cs.length ? cs.map(c => codeHTML(c)).join("، ") : "✓") + ")" : "(&nbsp;&nbsp;&nbsp;)"}</span><span>${escapeHTML(s)}</span></li>`;
  }).join("")}</ul>`;
  const listify = s => String(s || "").split(/،|<br\s*\/?>|\n/).map(x => x.trim()).filter(Boolean).map(x => "- " + x).join("<br>");
  const res = `<span ${editAttrs("s:resources", pl.tEd.resources)}>${pl.tEd.resources ? escapeHTML(pl.t.resources) : richText(listify(pl.t.resources))}</span>`
    + (pl.opts.lab ? `<div class="m-lab"><b>النشاط العملي والسلامة:</b> ${edSpan(pl, "lab")}</div>` : "");
  const actHTML = (r, i) => {
    const cs = codesOf(r);
    return `<div class="m-act${r.bk ? " pband pb-" + r.bk : ""}" data-rid="${escapeHTML(r.id)}" data-fi="${i}">${multi && (i === 0 || pl.flow[i - 1].period !== r.period) ? `<div class="m-per">الحصة ${r.period}</div>` : ""}
      <div class="m-ah"><b class="n">${i + 1}-</b> ${cs.length ? `<span class="cd">(${cs.map(c => codeHTML(c)).join("، ")})</span> ` : ""}<b>${escapeHTML(r.code)}</b>${r.strat ? ` <span class="st">باستخدام استراتيجية ${escapeHTML(r.strat)}</span>` : ""} <span class="tm">(${escapeHTML(r.time)})</span></div>
      <div class="m-ar"><b>المعلم:</b> ${flowCell(r, "teacher", !!pl.def)}</div>
      <div class="m-ar"><b>المتعلم:</b> ${flowCell(r, "student", false)}</div></div>`;
  };
  const cg = `<colgroup><col style="width:16%"><col style="width:15%"><col style="width:56%"><col style="width:13%"></colgroup>`;
  const execAll = pl.flow.length ? pl.flow.map((r, i) => actHTML(r, i)).join("") : `<p class="warn-text">حدّد هدفاً تعليمياً واحداً على الأقل لتظهر الأنشطة.</p>`;
  const body = `<tr class="m-body"><td>${objs}</td><td>${strats}</td><td class="m-exec">${execAll}</td><td>${res}</td></tr>`;
  const main = `<table class="m-t m-main">${cg}
    <tr class="m-prior"><th>التعلم القبلي/ التمهيد</th><td colspan="3"><div class="kv-line"><b>التعلم القبلي${multi ? " (الحصة 1)" : ""}:</b> ${edSpan(pl, "prior")}</div><div class="kv-line"><b>التمهيد${multi ? " (الحصة 1)" : ""}:</b> ${edSpan(pl, "warm")}</div></td></tr>
    ${pl.opts.mis ? `<tr class="m-mis"><th>المفاهيم الخاطئة وسوء الفهم</th><td colspan="3">${edSpan(pl, "mis")}</td></tr>` : ""}
    <tr class="m-head"><th>المخرجات التعليمية</th><th>الاستراتيجيات/ طرق التدريس</th><th>آلية التنفيذ/ الأنشطة التدريبية/ التعليمية</th><th>الوسائل ومصادر التعلم</th></tr>
    ${body}</table>`;

  // page 2
  const evCell = r => `<span ${editAttrs("f:" + r.id + ":eval", r.ed.eval)}>${r.ed.eval ? escapeHTML(r.eval) : richText(String(r.eval || "").replace(/<br\s*\/?>/gi, " ؛ "))}</span>`;
  const evals = pl.flow.length ? pl.flow.map((r, i) => `<div class="m-ev" data-rid="${escapeHTML(r.id)}">${multi && (i === 0 || pl.flow[i - 1].period !== r.period) ? `<div class="m-per">الحصة ${r.period}</div>` : ""}<div class="m-evh">${i + 1}- ${escapeHTML(r.code)}</div><div class="m-evb">${evCell(r)}</div></div>`).join("") : `<span class="empty-v">—</span>`;
  const diff = k => `<div class="diffedit" data-diff="${k}" contenteditable="true" spellcheck="false" data-ph="${k === "support" ? "نشاط علاجي للطلاب المتعثرين…" : "نشاط إثرائي للطلاب المتفوقين…"}">${pl.diff[k + "Auto"] ? richText(pl.diff[k]) : escapeHTML(pl.diff[k] || "")}</div>${sampleFn ? `<button class="mini no-print" type="button" data-aidiff="${k}">✨ توليد بالمساعد الذكي</button>` : ""}`;
  const ai = pl.ai.map((it, i) => `<div class="note ai"><div class="hd"><span>✨ ${escapeHTML(it.title)}</span><button class="rm no-print" type="button" data-rm-ai="${i}">حذف</button></div><div class="pre">${escapeHTML(it.text)}</div></div>`).join("");
  const rf = pl.reflect || {};
  const notes = [["تحقق الأهداف", rf.goals], ["الصعوبات والتحديات", rf.challenges], ["مقترحات التطوير", rf.next]].filter(x => x[1] && String(x[1]).trim()).map(x => `<div><b>${x[0]}:</b> ${escapeHTML(String(x[1]))}</div>`).join("");
  const page2 = `<section class="m-page m-p2">${banner}
    <table class="m-t m-eval"><colgroup><col style="width:46.5%"><col style="width:20.9%"><col style="width:20.9%"><col style="width:11.7%"></colgroup>
      <tr class="m-head2"><th>التقويم التكويني</th><th>نشاط إثرائي/ علاجي/ تفريد التعليم</th><th>التقويم الختامي</th><th>الواجب المنزلي</th></tr>
      <tr class="m-evrow"><td>${evals}</td>
        <td><div class="subsec"><span class="sublab">الطلاب ذوو التحصيل الدراسي المنخفض (علاجي)</span>${diff("support")}</div><div class="subsec"><span class="sublab">الطلاب ذوو التحصيل الدراسي المرتفع (إثرائي)</span>${diff("enrich")}</div>${ai}</td>
        <td>${multi ? `<b>الحصة ${pl.flow[pl.flow.length - 1].period}:</b> ` : ""}${edSpan(pl, "exit")}</td><td>${edSpan(pl, "homework")}</td></tr>
      <tr class="m-notes"><th>ملاحظات المعلم</th><td colspan="3">${notes}</td></tr></table>
    ${sign()}</section>`;

  return `<article class="paper sheet" data-moe="1" aria-label="تحضير الدرس">
    <section class="m-page m-p1">${banner}${info}${week}${main}${sign()}</section>
    ${page2}
  </article>`;
}

/*@measureFlow*/
function measureFlow(paperHTML, rebuild){ return { flow: "cont", splits: [], tail: false }; }

/*@pageBreaks*/
function pageBreaks(paper){
  const pageH = 280 * MM, top = 7 * MM, breaks = []; breaks.acts = [];
  let limit = top + pageH, shift = 0;                     // shift: distance between the continuous measured layout and the paginated one
  const Yv = el => offsetIn(el, paper) + shift;
  const hard = (y, extra = 0) => { breaks.push(y); limit = y + pageH + extra; };
  const cut = (y, h) => { while (y + h > limit + 1){ breaks.push(limit); limit += pageH; } };   // a block the browser may cut anywhere
  const atom = (y, h) => {                                                                        // a block that must not be cut
    if (y + h <= limit + 1) return;
    if (h > pageH - 2){ cut(y, h); return; }
    breaks.push(y); limit = y + pageH;
  };
  const unitsOf = td => {
    const ul = td.querySelector(":scope > ul");
    if (ul) return Array.from(ul.children);
    const blocks = Array.from(td.querySelectorAll(":scope > .m-act, :scope > .m-o"));
    return blocks.length ? blocks : Array.from(td.children);
  };
  const p1 = paper.querySelector(".m-p1"), p2 = paper.querySelector(".m-p2");
  if (!p1) return breaks;
  [".m-banner", ".m-info", ".m-week"].forEach(sel => { const e = p1.querySelector(sel); if (e) atom(Yv(e), e.offsetHeight); });
  const trs = Array.from(p1.querySelectorAll(".m-main > tbody > tr"));
  trs.forEach((tr, i) => {
    if (tr.classList.contains("m-head")){ const nx = trs[i + 1], f = nx && nx.querySelector(".m-act"); atom(Yv(tr), tr.offsetHeight + (f ? f.offsetHeight : 0)); return; }
    if (!tr.classList.contains("m-body")){ atom(Yv(tr), tr.offsetHeight); return; }
    // the body row splits across pages like in Word: every column breaks between its own blocks, the row ends where its longest column ends
    const rowEndDom = offsetIn(tr, paper) + tr.offsetHeight;
    let best = null;
    Array.from(tr.children).forEach(td => {
      const base = offsetIn(td, paper), us = unitsOf(td).map(u => [offsetIn(u, paper) - base, u.offsetHeight]);
      let start = 0, top0 = base + shift, pageLimit = limit; const brk = [];
      us.forEach(([o, h]) => {
        while (top0 + (o + h - start) > pageLimit + 1){
          if (o <= start + 1 || h > pageH - 2){ brk.push(pageLimit); start += pageLimit - top0; top0 = pageLimit; pageLimit += pageH; }   // taller than the room left: cut it
          else { const y = top0 + (o - start); brk.push(y); start = o; top0 = y; pageLimit = y + pageH; }                                   // move the block to the next page
        }
      });
      const endAbs = top0 + Math.max(0, td.offsetHeight - start), pages = brk.length + 1;
      if (!best || pages > best.pages || (pages === best.pages && endAbs > best.endAbs)) best = { brk, endAbs, pages, pageLimit };
    });
    if (best && best.brk.length){ best.brk.forEach(y => breaks.push(y)); shift = best.endAbs - rowEndDom; limit = best.pageLimit; }
  });
  const sg = p1.querySelector(".m-sign"); if (sg) atom(Yv(sg), sg.offsetHeight);
  if (p2){
    hard(Yv(p2), 3 * MM);                                  // the evaluation page always starts a new page (its start is exact, so no safety margin)
    const bn = p2.querySelector(".m-banner"); if (bn) atom(Yv(bn), bn.offsetHeight);
    Array.from(p2.querySelectorAll(".m-eval > tbody > tr")).forEach(tr => { if (tr.classList.contains("m-evrow")) cut(Yv(tr), tr.offsetHeight); else atom(Yv(tr), tr.offsetHeight); });
    const s2 = p2.querySelector(".m-sign"); if (s2) atom(Yv(s2), s2.offsetHeight);
  }
  return breaks;
}
