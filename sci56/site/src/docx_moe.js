/* Word export in the Ministry of Education prep template (2 pages). Replaces the main site's colourful DOCX builder; spliced in by tools/fork_sci.py.
   Header: the three logos of the Ministry template (QMS, Oman Vision 2040, Ministry of Education logo), from src/logos.js. */
const DOCX = (() => {
  const FONT = "Arial";
  const W = 9638;               // عرض منطقة الكتابة في A4 بهوامش 2 سم (twips)
  const BORDER = "94A3B8";
  const BRAND = "1B3F73", GOLD = "A06B1C", SOFT = "44506A";
  const xml = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

  function rPr({ bold = false, size = 22, color = null } = {}){
    return `<w:rPr><w:rFonts w:ascii="${FONT}" w:hAnsi="${FONT}" w:cs="${FONT}"/>${bold ? "<w:b/><w:bCs/>" : ""}${color ? `<w:color w:val="${color}"/>` : ""}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/><w:lang w:val="en-US" w:bidi="ar-OM"/></w:rPr>`;
  }
  function run(text, o){ return `<w:r>${rPr(o)}<w:t xml:space="preserve">${xml(text)}</w:t></w:r>`; }
  /* يحوّل نصًا فيه b/strong/br إلى مقاطع Word */
  function rich(html, base = {}){
    let bold = false, out = "";
    String(html || "").split(RICH_SPLIT).forEach(part => {
      if (!part) return;
      if (/^<br/i.test(part)){ out += `<w:r>${rPr(base)}<w:br/></w:r>`; return; }
      if (/^<\/(b|strong)/i.test(part)){ bold = false; return; }
      if (/^<(b|strong)/i.test(part)){ bold = true; return; }
      const text = ltrPlain(part.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&"));
      out += run(text, Object.assign({}, base, { bold: base.bold || bold }));
    });
    return out;
  }
  function p(runs, { center = false, after = 100, before = 0, keepNext = false, bottomBorder = null, topBorder = null, fill = null, leftBar = null } = {}){
    const bd = (topBorder || bottomBorder || leftBar) ? `<w:pBdr>${topBorder ? `<w:top w:val="single" w:sz="6" w:space="6" w:color="${topBorder}"/>` : ""}${bottomBorder ? `<w:bottom w:val="single" w:sz="12" w:space="6" w:color="${bottomBorder}"/>` : ""}${leftBar ? `<w:right w:val="single" w:sz="24" w:space="6" w:color="${leftBar}"/>` : ""}</w:pBdr>` : "";
    return `<w:p><w:pPr>${keepNext ? "<w:keepNext/>" : ""}${bd}${fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : ""}<w:bidi/><w:spacing w:before="${before}" w:after="${after}" w:line="300" w:lineRule="auto"/>${center ? '<w:jc w:val="center"/>' : ""}</w:pPr>${runs}</w:p>`;
  }
  function heading(num, title){
    return p(run(`${num}. `, { bold: true, size: 24, color: GOLD }) + run(title, { bold: true, size: 24, color: BRAND }), { before: 220, after: 80, keepNext: true });
  }
  function cell(content, width, { fill = null, span = 0, bottom = null, pad = 0, vm = null } = {}){
    const inner = content || p("", { after: 0 });
    return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${span > 1 ? `<w:gridSpan w:val="${span}"/>` : ""}${vm ? `<w:vMerge${vm === "restart" ? ' w:val="restart"' : ""}/>` : ""}${bottom ? `<w:tcBorders><w:bottom w:val="single" w:sz="10" w:space="0" w:color="${bottom}"/></w:tcBorders>` : ""}${fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : ""}${pad ? `<w:tcMar><w:left w:w="${pad}" w:type="dxa"/><w:right w:w="${pad}" w:type="dxa"/></w:tcMar>` : ""}<w:vAlign w:val="top"/></w:tcPr>${inner}</w:tc>`;
  }
  function gap(h = 40){ return `<w:p><w:pPr><w:bidi/><w:spacing w:before="0" w:after="0" w:line="${h}" w:lineRule="exact"/></w:pPr></w:p>`; }
  function table(widths, rows, { headerRow = false, style = "lite", topColor = null } = {}){
    const line = (n, c, sz = 4) => `<w:${n} w:val="single" w:sz="${sz}" w:space="0" w:color="${c}"/>`;
    const none = n => `<w:${n} w:val="nil"/>`;
    const borders = style === "grid" ? ["top","left","bottom","right","insideH","insideV"].map(n => line(n, BORDER)).join("") : style === "none"
      ? ["top","left","bottom","right","insideH","insideV"].map(none).join("")
      : (topColor ? line("top", topColor, 12) : line("top", BORDER)) + none("left") + line("bottom", BORDER) + none("right") + line("insideH", BORDER) + none("insideV");
    const grid = widths.map(w => `<w:gridCol w:w="${w}"/>`).join("");
    const trs = rows.map((row, ri) => {
      const cells = Array.isArray(row) ? row : row.cells;
      const h = Array.isArray(row) ? 0 : (row.height || 0);
      const isHead = headerRow && ri === 0;
      return `<w:tr><w:trPr>${!Array.isArray(row) && row.split ? "" : "<w:cantSplit/>"}${h ? `<w:trHeight w:val="${h}" w:hRule="atLeast"/>` : ""}${isHead ? "<w:tblHeader/>" : ""}</w:trPr>${cells.join("")}</w:tr>`;
    }).join("");
    return `<w:tbl><w:tblPr><w:bidiVisual/><w:tblW w:w="${W}" w:type="dxa"/><w:tblBorders>${borders}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="100" w:type="dxa"/><w:left w:w="110" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:right w:w="110" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${trs}</w:tbl>`;
  }
  const small = { size: 20 };

  

  const LOGO_FILES = [["rIdQms", "qms.png", LOGO_QMS, "qms"], ["rIdV2040", "vision2040.png", LOGO_V2040, "v2040"], ["rIdEmblem", "emblem.png", LOGO_EMBLEM, "emblem"]];
  function logoRun(id, key, hCm){
    const f = LOGO_FILES.find(x => x[3] === key), d = LOGO_DIM[key], cy = Math.round(hCm * 360000), cx = Math.round(cy * d[0] / d[1]);
    return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="Logo${id}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="${f[1]}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${f[0]}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  }
  function dataBytes(uri){
    const bin = atob(uri.split(",")[1]), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  /* ============================================================
     قالب وزارة التربية والتعليم (ورقة التحضير): الصفحة الأولى ترويسة (الوحدة والدرس والصف) وجدول اليوم والحصة والمخرجات،
     ثم التعلم القبلي/التمهيد وجدول المخرجات والاستراتيجيات والتنفيذ والوسائل؛ والصفحة الثانية التقويم التكويني ونشاط
     إثرائي/علاجي والتقويم الختامي والواجب وملاحظات المعلم. الترويسة: شعارات القالب الثلاثة (الجودة، رؤية عُمان 2040، الوزارة) بعرض الصفحة.
     ============================================================ */
  const PW = 10546;                       // عرض منطقة الكتابة في A4 بهوامش 1.2 سم (twips)
  const INK = "000000", BLUE = "0070C0", RED = "C00000", PURPLE = "7030A0", GREEN = "00863D", ORANGE = "C55A11", SKY = "2E75B6", NAVY = "1F3864", PEACH = "FBE4D5";
  function mp(runs, { center = false, after = 40, before = 0, keep = false, pageBreak = false, exact = 0 } = {}){
    return `<w:p><w:pPr>${pageBreak ? "<w:pageBreakBefore/>" : ""}<w:bidi/><w:spacing w:before="${before}" w:after="${after}" w:line="${exact || 264}" w:lineRule="${exact ? "exact" : "auto"}"/>${center ? '<w:jc w:val="center"/>' : ""}</w:pPr>${runs}</w:p>`;
  }
  function mc(content, width, { fill = null, span = 0, va = "top" } = {}){
    return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${span > 1 ? `<w:gridSpan w:val="${span}"/>` : ""}${fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : ""}<w:vAlign w:val="${va}"/></w:tcPr>${content || mp("", { after: 0 })}</w:tc>`;
  }
  function mt(widths, rows, { none = false } = {}){
    const ln = n => none ? `<w:${n} w:val="nil"/>` : `<w:${n} w:val="single" w:sz="${/^(top|left|bottom|right)$/.test(n) ? 18 : 12}" w:space="0" w:color="000000"/>`;
    const borders = ["top", "left", "bottom", "right", "insideH", "insideV"].map(ln).join("");
    const total = widths.reduce((a, b) => a + b, 0);
    const trs = rows.map(r => `<w:tr><w:trPr>${r.split ? "" : "<w:cantSplit/>"}${r.height ? `<w:trHeight w:val="${r.height}" w:hRule="atLeast"/>` : ""}</w:trPr>${r.cells.join("")}</w:tr>`).join("");
    return `<w:tbl><w:tblPr><w:bidiVisual/><w:tblW w:w="${total}" w:type="dxa"/><w:tblBorders>${borders}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="50" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="50" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map(w => `<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>${trs}</w:tbl>`;
  }

  function documentXML(pl){
    const d = pl.d, m = pl.meta, unit = splitUnit(d.unitTitle), wk = weekData(pl), cm = courseMeta(pl.key);
    const T = 18;                                              // خط المتن: 9 نقطة
    const P = (html, o = {}) => mp(rich(html || "—", { size: T }), Object.assign({ after: 40 }, o));
    const L = (k, html, kc = INK, base = {}) => mp(run(k + " ", { bold: true, size: T, color: kc }) + rich(html || "—", Object.assign({ size: T }, base)), { after: 40 });
    const hd = (txt, w, o = {}) => mc(mp(run(txt, { bold: true, size: 24 }), { center: true, after: 0 }), w, Object.assign({ va: "center", fill: PEACH }, o));
    const gp = h => gap(h);
    const ph = (r, i, arr) => pl.split && (i === 0 || arr[i - 1].period !== r.period) ? mp(run(`الحصة ${r.period}`, { bold: true, size: 19, color: NAVY }), { after: 30, before: i ? 60 : 0, keep: true }) : "";
    const objById = {}; pl.objs.forEach(o => { objById[o.id] = o; });
    const codesOf = r => [...new Set((r.objIds || []).map(id => objById[id]).filter(Boolean).map(objLabel))];

    const crest = n => { const b = n === 1 ? 1 : 4; return mt([3400, PW - 6800, 3400], [{ cells: [
      mc(mp(logoRun(b, "emblem", 2.3), { center: true, after: 0 }), 3400, { va: "center" }),
      mc(mp(logoRun(b + 1, "v2040", 2.1), { center: true, after: 0 }), PW - 6800, { va: "center" }),
      mc(mp(logoRun(b + 2, "qms", 2.1), { center: true, after: 0 }), 3400, { va: "center" })] }], { none: true }); };

    // الوحدة / عنوان الدرس / الصف
    const lv = (label, val) => mp(run(label + " ", { bold: true, size: 22 }) + val, { center: true, after: 0 });
    const info = mt([3000, PW - 6000, 3000], [{ cells: [
      mc(lv("الوحدة:", run(`${unit.label ? unit.label.replace(/^الوحدة\s*/, "") + ": " : ""}${unit.name}`, { size: 22, color: PURPLE })), 3000, { va: "center", fill: PEACH }),
      mc(lv("عنوان الدرس:", run(`(‎${d.code}‎) `, { bold: true, size: 22, color: ORANGE }) + run(d.title, { size: 22, color: PURPLE })), PW - 6000, { va: "center", fill: PEACH }),
      mc(lv("الصف:", run(cm.gradeName + (m.section ? " / " + m.section : ""), { size: 22, color: PURPLE })), 3000, { va: "center", fill: PEACH })
    ] }]);

    // اليوم والتاريخ / الحصة / أرقام المخرجات
    const LW = 2001, DW = 1709;
    const dayTxt = w => (w.date || w.period || w.codes) ? w.name + (w.date ? "  " + w.date : "") : "";
    const dc = (txt, color) => mc(mp(run(txt || " ", { bold: true, size: 19, color }), { center: true, after: 0 }), DW, { va: "center" });
    const days = mt([LW, DW, DW, DW, DW, DW], [
      { cells: [hd("اليوم والتاريخ", LW)].concat(wk.map(w => dc(dayTxt(w), SKY))) },
      { cells: [hd("الحصة", LW)].concat(wk.map(w => dc(w.period, ORANGE))) },
      { cells: [hd("أرقام المخرجات", LW)].concat(wk.map(w => dc(w.codes, ORANGE))) }
    ]);

    // المخرجات
    const outc = pl.objs.length ? pl.objs.map(o => mp(run(`المخرج (${objLabel(o)})`, { bold: true, size: T, color: BLUE }), { after: 0, keep: true }) + mp(rich(o.text, { size: T, color: BLUE }), { after: 80 })).join("") : P("—");
    // الاستراتيجيات: بين القوسين أرقام المخرجات التي تخدمها الاستراتيجية (كما في القالب)
    const chosen = new Set(pl.strategies);
    const list = (pl.def ? [pl.def.label] : []).concat(allStrategies(pl.key));
    const stratCodes = s => [...new Set(pl.flow.filter(r => r.strat === s).flatMap(codesOf))];
    const strat = list.map(s => {
      if (!chosen.has(s)) return mp(run("(    ) ", { size: T }) + run(s, { size: T }), { after: 30 });
      const cs = stratCodes(s);
      return mp(run(`(${cs.length ? cs.join("، ") : "✓"}) `, { bold: true, size: T, color: BLUE }) + run(s, { bold: true, size: T }), { after: 30 });
    }).join("");
    // آلية التنفيذ
    const acts = pl.flow.length ? pl.flow.map((r, i, arr) => {
      const cs = codesOf(r);
      return ph(r, i, arr)
        + mp(run(`${i + 1}- `, { bold: true, size: T }) + (cs.length ? run(`(${cs.join("، ")}) `, { bold: true, size: T, color: BLUE }) : "") + run(r.code, { bold: true, size: T })
          + (r.strat ? run(`  باستخدام استراتيجية ${r.strat}`, { bold: true, size: T, color: RED }) : "") + run(`  (${r.time})`, { bold: true, size: T }), { after: 10, keep: true })
        + mp(run("المعلم: ", { bold: true, size: T }) + rich(pl.def && !(r.ed && r.ed.teacher) ? stripPhase(r.teacher) : r.teacher, { size: T }), { after: 10 })
        + mp(run("المتعلم: ", { bold: true, size: T }) + rich(r.student, { size: T }), { after: 50 });
    }).join("") : P("—");
    // الوسائل ومصادر التعلم
    const resItems = String(pl.t.resources || "").split(/،|<br\s*\/?>|\n/).map(s => s.trim()).filter(Boolean);
    const res = (resItems.length ? resItems.map(s => mp(run("- ", { size: T }) + rich(s, { size: T }), { after: 30 })).join("") : P("—")) + (pl.opts.lab ? L("النشاط العملي والسلامة:", pl.t.lab, PURPLE) : "");

    const WO = 1700, WS = 1700, WE = 5700, WR = PW - WO - WS - WE;
    const rows1 = [{ cells: [hd("التعلم القبلي/ التمهيد", WO), mc(L("التعلم القبلي:", pl.t.prior) + L("التمهيد:", pl.t.warm), WS + WE + WR, { span: 3 })] }];
    if (pl.opts.mis) rows1.push({ cells: [hd("المفاهيم الخاطئة وسوء الفهم", WO), mc(P(pl.t.mis), WS + WE + WR, { span: 3 })] });
    rows1.push({ cells: [hd("المخرجات التعليمية", WO), hd("الاستراتيجيات/ طرق التدريس", WS), hd("آلية التنفيذ/ الأنشطة التدريبية/ التعليمية", WE), hd("الوسائل ومصادر التعلم", WR)] });
    rows1.push({ split: true, cells: [mc(outc, WO), mc(strat, WS), mc(acts, WE), mc(res, WR)] });
    const big = mt([WO, WS, WE, WR], rows1);

    // الصفحة الثانية
    const PS = html => mp(rich(html || "—", { size: 16 }), { after: 30 });
    const evals = pl.flow.length ? pl.flow.map((r, i, arr) => ph(r, i, arr) + mp(run(`${i + 1}- ${r.code}`, { bold: true, size: 16, color: PURPLE }), { after: 10 }) + PS(String(r.eval || "").replace(/<br\s*\/?>/gi, " ؛ "))).join("") : P("—");
    const diffT = L("الطلاب ذوو التحصيل الدراسي المنخفض (علاجي):", pl.diff.support || "—", GREEN, { color: BLUE }) + L("الطلاب ذوو التحصيل الدراسي المرتفع (إثرائي):", pl.diff.enrich || "—", GREEN, { color: BLUE })
      + (pl.ai || []).map(it => L(it.title + ":", it.text, GREEN, { color: BLUE })).join("");
    const rf = pl.reflect || {};
    const notes = [["تحقق الأهداف", rf.goals], ["الصعوبات والتحديات", rf.challenges], ["مقترحات التطوير", rf.next]].filter(x => x[1] && String(x[1]).trim()).map(x => L(x[0] + ":", String(x[1]).replace(/&/g, "&amp;").replace(/</g, "&lt;"))).join("");
    const W2 = [4900, 2200, 2200, PW - 9300];
    const page2 = mt(W2, [
      { cells: [hd("التقويم التكويني", W2[0], { fill: PEACH }), hd("نشاط إثرائي/ علاجي/ تفريد التعليم", W2[1], { fill: PEACH }), hd("التقويم الختامي", W2[2], { fill: PEACH }), hd("الواجب المنزلي", W2[3], { fill: PEACH })] },
      { split: true, cells: [mc(evals, W2[0]), mc(diffT, W2[1]), mc(P(pl.t.exit), W2[2]), mc(P(pl.t.homework), W2[3])] },
      { height: 600, cells: [hd("ملاحظات المعلم", W2[0], { fill: PEACH }), mc(notes, W2[1] + W2[2] + W2[3], { span: 3 })] }
    ]);

    const sgw = Math.floor(PW / 3);
    const sgn = (k, v, w) => mc(mp(run(k, { bold: true, size: 20 }), { center: true, after: 30, before: 60 }) + mp(run(v ? `أ/ ${String(v).replace(/^أ[./]\s*/, "")}` : "....................................", { size: 19, color: v ? INK : "9AA3B5" }), { center: true, after: 0 }), w);
    const sig = () => mt([sgw, sgw, PW - 2 * sgw], [{ cells: [sgn("معلم المادة", m.teacher, sgw), sgn("مشرف المادة", m.supervisor, sgw), sgn("مدير المعهد", m.principal, PW - 2 * sgw)] }], { none: true });

    const b = crest(1) + gp(60) + info + gp(60) + days + gp(60) + big + gp(80) + sig()
      + mp("", { pageBreak: true, exact: 20, after: 0 }) + crest(2) + gp(60) + page2 + gp(80) + sig() + mp("", { exact: 20, after: 0 });
    const sect = `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="454" w:right="680" w:bottom="454" w:left="680" w:header="283" w:footer="283" w:gutter="0"/><w:bidi/></w:sectPr>`;
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>${b}${sect}</w:body></w:document>`;
  }

  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${FONT}" w:eastAsia="${FONT}" w:hAnsi="${FONT}" w:cs="${FONT}"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="ar-OM"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:bidi/><w:spacing w:after="100" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:bidi/></w:pPr></w:style><w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/><w:unhideWhenUsed/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>`;
  const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
  const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
  const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdQms" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/qms.png"/><Relationship Id="rIdV2040" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/vision2040.png"/><Relationship Id="rIdEmblem" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/emblem.png"/></Relationships>`;
  const APP = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>منظومة التحضير الذكي للعلوم</Application></Properties>`;
  function core(title, author){
    const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xml(title)}</dc:title><dc:creator>${xml(author)}</dc:creator><dc:language>ar-OM</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
  }

  /* ---- ZIP (بدون ضغط) ---- */
  const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(bytes){ let c = 0xFFFFFFFF; for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files){
    const enc = new TextEncoder();
    const d = new Date();
    const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    const parts = [], central = [];
    let offset = 0;
    files.forEach(f => {
      const name = enc.encode(f.name), data = typeof f.data === "string" ? enc.encode(f.data) : f.data, crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true); lh.setUint32(14, crc, true);
      lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0, true); ch.setUint16(10, 0, true);
      ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true); ch.setUint32(16, crc, true);
      ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, name.length, true);
      ch.setUint16(30, 0, true); ch.setUint16(32, 0, true); ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    });
    const cdSize = central.reduce((s, a) => s + a.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }

  
  function build(pl){
    return zip([
      { name: "[Content_Types].xml", data: CONTENT_TYPES },
      { name: "_rels/.rels", data: ROOT_RELS },
      { name: "docProps/core.xml", data: core(`تحضير ${courseMeta(pl.key).subj.short} ${courseMeta(pl.key).grade}، ${pl.d.code} ${pl.d.title}`, pl.meta.teacher || "") },
      { name: "docProps/app.xml", data: APP },
      { name: "word/document.xml", data: documentXML(pl) },
      { name: "word/_rels/document.xml.rels", data: DOC_RELS },
      { name: "word/styles.xml", data: STYLES },
      ...LOGO_FILES.map(f => ({ name: "word/media/" + f[1], data: dataBytes(f[2]) })),
    ]);
  }
  return { build };
})();
