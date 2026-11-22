"""Assistant: PowerPoint -> prep and prep -> PowerPoint, with mock window.claude."""
import sys, os, base64, subprocess, json, zipfile
from playwright.sync_api import sync_playwright
exec(open('/home/user/Ali/sci56/site/tools/asst_test.py').read().split("fails = []")[0])
fails = []
def check(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name, extra if not cond else '')
    if not cond: fails.append(name)
BUILD_DECK = r'''async () => {
  const z = new JSZip();
  const NS = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
  z.file("ppt/presentation.xml", `<?xml version="1.0"?><p:presentation ${NS}><p:sldIdLst><p:sldId id="256" r:id="rId2"/><p:sldId id="257" r:id="rId1"/><p:sldId id="258" r:id="rId3"/></p:sldIdLst></p:presentation>`);
  z.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="x/slide" Target="slides/slide1.xml"/><Relationship Id="rId2" Type="x/slide" Target="slides/slide2.xml"/><Relationship Id="rId3" Type="x/slide" Target="slides/slide3.xml"/></Relationships>`);
  const sp = (type, paras) => `<p:sp><p:nvSpPr><p:cNvPr id="2" name="x"/><p:cNvSpPr/><p:nvPr>${type ? `<p:ph type="${type}"/>` : ""}</p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/>${paras.map(t => `<a:p><a:pPr lvl="0"/><a:r><a:rPr lang="ar-SA"/><a:t>${t}</a:t></a:r></a:p>`).join("")}</p:txBody></p:sp>`;
  const slide = body => `<?xml version="1.0"?><p:sld ${NS}><p:cSld><p:spTree><p:nvGrpSpPr/><p:grpSpPr/>${body}</p:spTree></p:cSld></p:sld>`;
  z.file("ppt/slides/slide2.xml", slide(sp("ctrTitle", ["المنهج العلمي"]) + sp("subTitle", ["الصف الحادي عشر"])));
  z.file("ppt/slides/slide1.xml", slide(sp("title", ["ما الفرضية؟"]) + sp("body", ["تفسير مقترح قابل للاختبار", "تُصاغ بصيغة: إذا … فإن …"]) + sp("sldNum", ["7"]) + `<p:pic><p:nvPicPr><p:cNvPr id="5" name="Picture" descr="صورة طائرة ورقية"/></p:nvPicPr></p:pic>`));
  z.file("ppt/slides/slide3.xml", slide(sp("title", ["المتغيرات"]) + `<p:graphicFrame><a:graphic><a:graphicData><a:tbl><a:tr><a:tc><a:txBody><a:p><a:r><a:t>المتغير</a:t></a:r></a:p></a:txBody></a:tc><a:tc><a:txBody><a:p><a:r><a:t>النوع</a:t></a:r></a:p></a:txBody></a:tc></a:tr><a:tr><a:tc><a:txBody><a:p><a:r><a:t>المسافة</a:t></a:r></a:p></a:txBody></a:tc><a:tc><a:txBody><a:p><a:r><a:t>تابع</a:t></a:r></a:p></a:txBody></a:tc></a:tr></a:tbl></a:graphicData></a:graphic></p:graphicFrame>`));
  z.file("ppt/slides/_rels/slide1.xml.rels", `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide1.xml"/></Relationships>`);
  z.file("ppt/notesSlides/notesSlide1.xml", slide(sp("sldImg", ["صورة"]) + sp("body", ["اسأل الطلاب: ما الفرق بين الفرضية والتنبؤ؟"]) + sp("sldNum", ["1"])));
  return await z.generateAsync({ type: "base64" });
}'''
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 1400, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    pg.add_init_script(INIT); pg.add_init_script(MOCK)
    pg.goto(URL + '#sci6~1-3'); pg.wait_for_timeout(900)
    b64 = pg.evaluate(BUILD_DECK)
    open(OUT + '/test_deck.pptx', 'wb').write(base64.b64decode(b64))
    pg.click('#asstFab'); pg.wait_for_timeout(150)
    # --- deck in
    with pg.expect_file_chooser() as fc:
        pg.click('#asstTools [data-chip="0"]')
    fc.value.set_files(OUT + '/test_deck.pptx')
    pg.wait_for_selector('.acard [data-ax=deckin-build]', timeout=5000)
    meta = pg.inner_text('.acard')
    print(meta[:400].replace('\n', ' | '))
    check('deck read: 3 slides', '3 شريحة' in meta)
    check('deck order by sldIdLst (المنهج العلمي first)', pg.inner_text('.acard .slides').index('المنهج العلمي') < pg.inner_text('.acard .slides').index('ما الفرضية'))
    ol = pg.evaluate('axDeckOutline(AX.deck,1,3,60000)')
    print(ol)
    check('outline has notes', 'ما الفرق بين الفرضية والتنبؤ' in ol)
    check('outline has table', 'المتغير | النوع' in ol)
    check('outline has pic alt', 'صورة طائرة ورقية' in ol)
    check('outline skips slide number placeholder', ' 7' not in ol.split('الشريحة 2')[1].split('الشريحة 3')[0])
    pg.evaluate('''window.__deckInReply = () => { const rows = [
      {p:1,bk:"",phase:"التمهيد",strat:"الحوار والمناقشة",min:5,obj:[],t:["يعرض الشريحة 1","يسأل عن الفرق"],s:["يجيب"],tool:"سؤال شفهي",q:"ما الفرضية؟",ans:"تفسير مقترح",crit:"يذكر الخاصية"},
      {p:1,phase:"الفرضية",strat:"الأسئلة السابرة",min:12,obj:["1-2"],t:["يعرض الشريحتين 2–3"],s:["يدوّن"],tool:"قائمة رصد",q:"اذكر خاصية للفرضية",ans:"قابلة للاختبار",crit:"خاصيتان"},
      {p:1,phase:"صياغة فرضية",strat:"التعلم التعاوني",min:15,obj:["2-2"],t:["يوزع المجموعات"],s:["يصوغون فرضية"],tool:"تقييم الأقران",q:"صغ فرضية عن الطائرة",ans:"إذا زاد الطول فإن المسافة تزيد",crit:"بصيغة إذا فإن"},
      {p:1,bk:"close",phase:"تقويم الحصة",min:8,obj:[],t:["يطرح السؤال"],s:["يجيب"],tool:"بطاقة",q:"ما الفرق بين الفرضية والتنبؤ؟",ans:"التنبؤ نتيجة محددة",crit:"فرق صحيح"},
      {p:2,bk:"open",phase:"مراجعة وتمهيد",min:5,obj:[],t:["يراجع"],s:["يجيب"],tool:"سؤال",q:"ما المتغير المستقل؟",ans:"ما يغيره الباحث",crit:"تعريف"},
      {p:2,phase:"المتغيرات",strat:"النمذجة العلمية",min:15,obj:["3-2"],t:["يعرض الشريحة 4"],s:["يصنف"],tool:"قائمة",q:"صنّف المسافة",ans:"تابع",crit:"تصنيف صحيح"},
      {p:2,phase:"الضابطة",min:12,obj:["4-2"],t:["يناقش"],s:["يحدد"],tool:"سؤال",q:"لماذا نضبط المتغيرات؟",ans:"لعزل أثر المستقل",crit:"تعليل"},
      {p:2,phase:"الختام",strat:"بطاقة الخروج",min:5,obj:[],t:["يوزع البطاقة"],s:["يجيب"],tool:"بطاقة الخروج",q:"قارن بين المستقل والتابع",ans:"المستقل يُغيَّر والتابع يُقاس",crit:"مقارنة"}];
      return "وزّعت الشرائح على حصتين.\\n@@PROPOSAL {\\"title\\":\\"تحضير مبني على العرض\\"}\\n@@PLAN " + JSON.stringify({periods:2,prior:{items:["الملاحظة"],technique:"سؤال",qs:[{q:"ما الملاحظة؟",a:"مشاهدة"}]},warm:{stimulus:"طائرة ورقية",question:"ما الفرضية؟",expected:"تفسير"},exit:{q:"قارن بين المستقل والتابع",a:"المستقل يُغيَّر",crit:"مقارنة"},homework:"أكمل الورقة",support:["أعد القراءة"],enrich:["صمم تجربة"]}) + "\\n" + rows.map(r => "@@ROW " + JSON.stringify(r)).join("\\n") + "\\n@@END"; };''')
    pg.fill('.acard [name=note]', 'اجعل المجموعات تعاونية')
    pg.select_option('.acard [name=periods]', '2')
    pg.fill('.acard [name=strat]', 'التعلم التعاوني')
    pg.click('[data-ax=deckin-build]')
    pg.wait_for_selector('.prop .btn-gold', timeout=8000)
    call = pg.evaluate('__calls[__calls.length-1].last')
    check('deck prompt has outline + options', 'الشريحة 1' in call and 'التعلم التعاوني' in call and 'اجعل المجموعات تعاونية' in call and 'عدد الحصص: 2' in call)
    check('plan proposal 1 item (all)', pg.locator('.prop li').count() == 1)
    pg.screenshot(path=OUT + '/10_deckin_proposal.png')
    pg.click('.prop .btn-gold'); pg.wait_for_timeout(500)
    st = pg.evaluate('''(()=>{const p=computePlan(); const s={}; p.flow.forEach(r=>s[r.period]=(s[r.period]||0)+r.minutes); return {rows:p.flow.length, periods:p.periods, sums:s, bk:p.flow.map(r=>r.bk), split:p.split, codes:p.codes, exit:p.t.exit, warm:p.t.warm, total:p.total, dur:p.duration}})()''')
    print(st)
    check('plan applied 2 periods', st['periods'] == 2 and st['rows'] == 8)
    check('each period 35', all(v == 35 for v in st['sums'].values()), st['sums'])
    check('bands set', st['bk'][3] == 'close' and st['bk'][4] == 'open')
    check('split flag', st['split'])
    check('exit synced', 'قارن بين المستقل والتابع' in st['exit'])
    check('meter total = duration', st['total'] == st['dur'])
    check('report note on minutes', 'ضُبطت' in pg.inner_text('.prop'))
    pg.evaluate("document.querySelector('#asstClose').click()"); pg.wait_for_timeout(300)
    check('table has bands', pg.locator('tr.pband').count() == 2, pg.locator('tr.pband').count())
    pg.pdf(path=OUT + '/deckin_print.pdf', format='A4', print_background=True) if False else None
    # --- deck out
    pg.click('#asstFab'); pg.wait_for_timeout(150)
    pg.click('#asstTools [data-chip="1"]'); pg.wait_for_selector('[data-ax=deckout-ai]')
    pg.evaluate('''window.__deckOutReply = () => "عرض من 8 شرائح.\\n@@DECK " + JSON.stringify({title:"المنهج العلمي: الفرضية والمتغيرات", sub:"الوحدة 2 — الصف الحادي عشر"}) + "\\n" + [
      {k:"list",h:"أهداف الدرس",b:["أصوغ فرضية قابلة للاختبار","أميّز بين المتغير المستقل والتابع","أضبط المتغيرات في استقصاء بسيط"],n:"1. يقرأ الأهداف مع الطلاب"},
      {k:"question",h:"فكّر",q:"ما الفرق بين الفرضية والتنبؤ؟ وهل يمكن أن تكون الفرضية خاطئة؟",hint:"فكّر في طائرة ورقية",n:"الإجابة: التنبؤ نتيجة محددة", tag:"5 د · الحوار والمناقشة"},
      {k:"steps",h:"صياغة فرضية",st:["اقرأ الموقف في الشريحة","حدد المتغيرين","اكتب فرضية بصيغة إذا… فإن…","شاركها مع مجموعتك"],tag:"15 د · التعلم التعاوني",n:"يمر المعلم على المجموعات"},
      {k:"cols",h:"المستقل والتابع",cols:[{h:"المتغير المستقل",b:["ما يغيّره الباحث","يُرسم على المحور الأفقي","مثال: طول الذيل"]},{h:"المتغير التابع",b:["ما يقيسه الباحث","يُرسم على المحور الرأسي","مثال: مسافة الطيران"]}],n:"قارن"},
      {k:"table",h:"أنواع المتغيرات",head:["المتغير","النوع","مثال"],rows:[["المسافة","تابع","3 م"],["الطول","مستقل","20 سم"],["الورق","ضابط","A4"]],n:""},
      {k:"divider",h:"الحصة 2"},
      {k:"summary",h:"خلاصة الدرس",b:["الفرضية تفسير قابل للاختبار","المستقل يُغيَّر والتابع يُقاس","نضبط المتغيرات لنعزل الأثر"],n:""}
    ].map(s => "@@SLIDE " + JSON.stringify(s)).join("\\n") + "\\n@@END";''')
    pg.click('[data-ax=deckout-ai]')
    pg.wait_for_selector('[data-ax=deck-save]', timeout=15000)
    check('deck ready card', 'شرائح' in pg.inner_text('#asstLog'))
    print(pg.inner_text('.acard:last-of-type')[:200])
    pg.screenshot(path=OUT + '/11_deckout_ready.png')
    pg.click('[data-ax=deck-save]'); pg.wait_for_timeout(800)
    sv = pg.evaluate('window.__saved')
    print(sv)
    check('saved via downloads', sv and sv['filename'].endswith('.pptx') and sv['size'] > 20000, sv)
    data = pg.evaluate('(async()=>{const b=window.__savedBlob; const buf=await b.arrayBuffer(); let s=""; const u=new Uint8Array(buf); for(let i=0;i<u.length;i++) s+=String.fromCharCode(u[i]); return btoa(s)})()')
    open(OUT + '/out_deck.pptx', 'wb').write(base64.b64decode(data))
    zf = zipfile.ZipFile(OUT + '/out_deck.pptx'); names = zf.namelist()
    check('pptx has 8 slides (title+7)', len([n for n in names if n.startswith('ppt/slides/slide')]) == 8, [n for n in names if n.startswith('ppt/slides/slide')])
    check('pptx has notes', any('notesSlide' in n for n in names))
    # --- quick deck without AI
    pg.click('#asstFab') if not pg.is_visible('#asst') else None
    pg.click('#asstTools [data-chip="1"]'); pg.wait_for_selector('[data-ax=deckout-quick]')
    pg.click('[data-ax=deckout-quick]'); pg.wait_for_selector('.acard [data-ax=deck-save] >> nth=1', timeout=10000)
    sl = pg.evaluate('axChat().msgs.filter(m=>m.card&&m.card.type==="deckfile").map(m=>[m.card.state,m.card.count])')
    print(sl)
    check('quick deck built', sl[-1][0] == 'ready' and sl[-1][1] > 8, sl)
    check('no page errors', not errs, errs[:5])
    b.close()
print('FAILS', fails)
sys.exit(1 if fails else 0)
