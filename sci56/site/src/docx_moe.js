/* Word export in the Ministry of Education prep template (2 pages). Replaces the main site's colourful DOCX builder; spliced in by tools/fork_sci.py.
   Logo: the Ministry crest only (no Vision 2040 / QMS logos, per CLAUDE.md). */
const LOGO_MOE = "data:image/jpeg;base64,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";
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

  

  const LOGO_EMU = { cx: 880000, cy: 760000 };   // شعار الوزارة (176×152)
  function logoRun(id = 1){
    return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${LOGO_EMU.cx}" cy="${LOGO_EMU.cy}"/><wp:docPr id="${id}" name="Logo${id}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="logo.jpg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdLogo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${LOGO_EMU.cx}" cy="${LOGO_EMU.cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  }
  function logoBytes(){
    const bin = atob(LOGO_MOE.split(",")[1]), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  /* ============================================================
     قالب وزارة التربية والتعليم (ورقة التحضير): الصفحة الأولى ترويسة (الوحدة والدرس والصف) وجدول اليوم والحصة والمخرجات،
     ثم التعلم القبلي/التمهيد وجدول المخرجات والاستراتيجيات والتنفيذ والوسائل؛ والصفحة الثانية التقويم التكويني ونشاط
     إثرائي/علاجي والتقويم الختامي والواجب وملاحظات المعلم. الشعار: شعار الوزارة فقط (بلا شعاري رؤية عُمان 2040 والجودة).
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
    const ln = n => none ? `<w:${n} w:val="nil"/>` : `<w:${n} w:val="single" w:sz="8" w:space="0" w:color="000000"/>`;
    const borders = ["top", "left", "bottom", "right", "insideH", "insideV"].map(ln).join("");
    const total = widths.reduce((a, b) => a + b, 0);
    const trs = rows.map(r => `<w:tr><w:trPr>${r.split ? "" : "<w:cantSplit/>"}${r.height ? `<w:trHeight w:val="${r.height}" w:hRule="atLeast"/>` : ""}</w:trPr>${r.cells.join("")}</w:tr>`).join("");
    return `<w:tbl><w:tblPr><w:bidiVisual/><w:tblW w:w="${total}" w:type="dxa"/><w:tblBorders>${borders}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="50" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="50" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map(w => `<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>${trs}</w:tbl>`;
  }

  function documentXML(pl){
    const d = pl.d, m = pl.meta, unit = splitUnit(d.unitTitle), wk = weekData(pl), cm = courseMeta(pl.key);
    const T = 17;                                              // خط المتن: 8.5 نقطة
    const P = (html, o = {}) => mp(rich(html || "—", { size: T }), Object.assign({ after: 40 }, o));
    const L = (k, html, kc = INK, base = {}) => mp(run(k + " ", { bold: true, size: T, color: kc }) + rich(html || "—", Object.assign({ size: T }, base)), { after: 40 });
    const hd = (txt, w, o = {}) => mc(mp(run(txt, { bold: true, size: 22 }), { center: true, after: 0 }), w, Object.assign({ va: "center" }, o));
    const gp = h => gap(h);
    const ph = (r, i, arr) => pl.split && (i === 0 || arr[i - 1].period !== r.period) ? mp(run(`الحصة ${r.period}`, { bold: true, size: 19, color: NAVY }), { after: 30, before: i ? 60 : 0, keep: true }) : "";
    const objById = {}; pl.objs.forEach(o => { objById[o.id] = o; });
    const codesOf = r => [...new Set((r.objIds || []).map(id => objById[id]).filter(Boolean).map(objLabel))];

    const crest = id => mt([2600, PW - 5200, 2600], [{ cells: [mc(mp(logoRun(id), { after: 0 }), 2600), mc("", PW - 5200), mc("", 2600)] }], { none: true });

    // الوحدة / عنوان الدرس / الصف
    const lv = (label, val) => mp(run(label + " ", { bold: true, size: 22 }) + val, { center: true, after: 0 });
    const info = mt([3000, PW - 6000, 3000], [{ cells: [
      mc(lv("الوحدة:", run(`${unit.label ? unit.label.replace(/^الوحدة\s*/, "") + ": " : ""}${unit.name}`, { size: 22, color: PURPLE })), 3000, { va: "center" }),
      mc(lv("عنوان الدرس:", run(`(‎${d.code}‎) `, { bold: true, size: 22, color: ORANGE }) + run(d.title, { size: 22, color: PURPLE })), PW - 6000, { va: "center" }),
      mc(lv("الصف:", run(cm.gradeName + (m.section ? " / " + m.section : ""), { size: 22, color: PURPLE })), 3000, { va: "center" })
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
  const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
  const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
  const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.jpg"/></Relationships>`;
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
      { name: "word/media/logo.jpg", data: logoBytes() },
    ]);
  }
  return { build };
})();
