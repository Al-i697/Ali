# Progress: separate science site (grades 5 & 6)
Working root: /home/claude/sci56 ; site: /home/claude/sci56/site (symlink /home/claude/work -> site for tools)
Published artifact (separate from the main chemistry site): https://claude.ai/artifact/18gjGusRxhFqcvp7s3vQjN  (publish by same file path: /home/claude/sci56/out/sci56-planner.html, capabilities sample; downloads)
Deliverable copy in outputs: /mnt/user-data/outputs/تحضير-علوم-الخامس-والسادس.html ; source backup /mnt/user-data/outputs/src-backup-sci56/

## Workflow
1. Read sources: ./rd.sh sb6|tb6|ab6 <first> [last]  (OCR text; pdf page = printed+1 for sb6/tb6; images via Read on src_pdf/*.pdf with pages) 
2. Write data/sci6_s1_uN_lM.py (copy an existing file, scilib API: Unit("sci6", sem, unit, title, short).lesson(key, title, code=, objectives=, periods=, prior=, warm=, exit=, homework, support, enrich, resources, strategies, lab, misconception, guideAnswers))
   - phase title <= 18 chars; unique formative questions; each period 40 min; closers (CLOSE) have no objectives; last row = exit ticket R("الختام","بطاقة الخروج",5,[],...)
   - lessons > 3 periods: split into 2-period sheets (keys "3","3b"), same code, titles "…: أ. …" / "ب. …"
3. python3 tools/build.py ; bash tools/check.sh ; python3 tools/tests.py --pages ; (asst_test*.py optional)
4. Copy app.html to out/sci56-planner.html and publish with Artifact (same path), copy html + src-backup to /mnt/user-data/outputs
Re-fork engine from main site base only if engine changes are needed: python3 tools/fork_sci.py

## Periods (teacher guide) grade 6 sem 1
U1: 1-1:2, 1-2:2, 1-3:4(split a/b), 1-4:4(split a/b), 1-5:3, 1-6:3, 1-7:3, 1-8:2  -> DONE (10 sheets, files sci6_s1_u1_l*.py)
U2 (10 topics) and U3 (8 topics): to do (periods per topic from teacher guide overview table: tb6 pdf p46-48 for unit 2, ~p70 for unit 3)
Grade 5: books OCR in ocr_sb5/ocr_tb5/ocr_ab5 (check counts), nothing authored yet.
Inquiry codes (sb6 p18): 6Ep1,2,4,5,6,7; 6Eo1..6Eo9 (see lesson files for texts)
Notes: lesson 1-3 exercise average = 93 (book OCR said 98 but data sum to 465/5).
U2 periods (tb6 p48 image): 2-1:2, 2-2:4(a/b), 2-3:2, 2-4:3, 2-5:3, 2-6:4(a/b), 2-7:4(a/b), 2-8:4(a/b), 2-9:2, 2-10:2 = 30 periods -> 14 sheets. Teacher guide topic pages start tb6 pdf p49. Grade5 OCR started in background (jobs5.txt, ocr5.log).


## حالة 2026-11-22 (مساءً)
- السادس ف1: الوحدة 1 (10 أوراق) + الوحدة 2 (14 ورقة: 2-1…2-10) منشورة (Artifact V2). build: injected sci6/s1 = 24.
- build.py صار يرتب ملفات data ترتيباً طبيعياً (l2 < l10).
- التالي: الوحدة 3 «تغيّرات المادة» (3-1…3-8) ثم الخامس ف1 (تحقق من اكتمال OCR: ls ocr_sb5 ocr_tb5 ocr_ab5 | wc -l، المطلوب 264).


## حالة التسليم إلى Claude Code (2026-11-22 21:45)
Build: injected sci6/s1 = 32 sheets (U1 10 + U2 14 + U3 so far 8). Published artifact still shows only U1+U2 (24 sheets).
Unit 3 authored (files in site/data): sci6_s1_u3_l1 / l1b (3-1 a/b, 4p), l2 / l2b (3-2 a=2p, b=3p; 5p), l3 (3-3, 3p), l4 / l4b (3-4 a/b, 4p), l5 (3-5 a, 2p).
Unit 3 periods (tb6 p71): 3-1:4, 3-2:5, 3-3:3, 3-4:4, 3-5:4, 3-6:5, 3-7:3, 3-8:2 = 30 periods -> 14 sheets.
Unit 3 key: Unit("sci6", 1, 3, "الوحدة الثالثة: تغيّرات المادة", "تغيّرات المادة"). Codes: 3-1 6Cc1; 3-2 6Cc2; 3-3 6Cc3+6Cc5; 3-4 6Cc4+6Cc3; 3-5 6Cc5+6Cc3; 3-6/3-7 6Cc5 (+6Ep6/6Ep4/6Eo1/6Eo3/6Eo9 per TG).
Page map (pdf pages): TG tb6: 3-1 72-75, 3-2 75-78, 3-3 78-81, 3-4 81-83, 3-5 83-86, 3-6 87-90, 3-7 91-92, 3-8 93-94, unit objectives table 99, answers are inside each topic.
SB sb6: 3-1 55-56, 3-2 57-58, 3-3 59-60, 3-4 61-62, 3-5 63-64, 3-6 65-66, 3-7 67-69, 3-8 70 (questions), scientific-enquiry section 71-76.
AB ab6 exercises: 3-1 p38 ... 3-8 language review p45 (one page each, in order). AB worksheets: 3-1 p73-74, 3-2 p75, 3-3 p76, 3-5أ p77-78, 3-5ب p79, 3-6أ p80, 3-6ب p81-82, 3-6ج p83-84(?), 3-7 p85-86.

### Remaining for grade 6 / unit 3
1. 3-5 part B (key "5b", periods 3-4, title "المحاليل: ب. الأسئلة والتخطيط للاستقصاء"). Plan: objectives 6Cc5, 6Ep4, 6Ep3 (choose evidence), 6Ep7 (choose tools), 6Eo7, 6Eo9.
   P3: warm "هل ماء البحر مادة نقية أم مخلوط؟"; SB Q1 predict (solution = mixture); Q2-Q4 evidence/tools (try separating into two substances; evaporate solvent in open dishes in a warm place); Q5 fair test (same solvent/amounts/place).
   P4: «تحدث عن» orange juice (stands -> clear watery layer + dark suspended layer: a mixture); worksheet 3-5أ (answers: salt soluble, water solvent, salt solute, solution homogeneous, separate by evaporation; insoluble: sand, sulphur powder, chalk; soluble: copper sulphate, sugar; sugar+chalk: mix with water, filter, evaporate; classify water/gold pure, coffee/air/mud mixtures); plan worksheet 3-5ب (how much sugar dissolves in 100 mL tea: predict, apparatus, controlled variable = volume/temperature of tea (المتغير الضابط), changed variable = amount of sugar, use results to predict for 250 mL). Homework: ws 3-5أ.
   TG answers (SB 3-5): Q1 a solution is a mixture; Q2 try to separate into two substances (if possible it is a mixture); Q3 use several different solutions; Q4 propose a method (evaporate the solvent leaving the solute) with an open dish per solution in a warm place; Q5 same solvent, same amounts, same warm place. AB 3-5: (1a) yes; (1b) coloured solid disappears and colour spreads evenly; solute = coloured substance, solvent = water; (2) if the liquid can be separated into different substances it is a mixture.
2. 3-6 (5 periods: A 3p + B 2p) كيف نجعل المواد الصلبة تذوب أسرع؟ (stirring, temperature; activity 3-6; AB worksheets 3-6أ/ب/ج) — read sb6 65-66, tb6 87-90, ab6 43 + 80-84.
3. 3-7 (3 periods) كيف يؤثر حجم الحبيبات في الذوبان؟ — sb6 67-69, tb6 91-92, ab6 44 + 85-86.
4. 3-8 تحقق من تقدمك (2 periods) — sb6 70 (questions) , tb6 93-94, ab6 45 language review. Also tb6 pdf 95-100 has «أستطيع» statements and the semester enquiry summary.
5. Then: python3 tools/lint_titles.py; build; check; tests --pages; deliver app.html.

### Grade 5 (not started)
OCR complete: ocr_sb5 (80 pages), ocr_tb5 (92), ocr_ab5 (92). Read TOC and the teacher guide overview tables first, record periods per topic in this file, then author course "sci5" (Unit("sci5", 1, n, …)); the UI shows «قريباً» for sci5 until lessons exist. Semester 2 books (both grades) have not been provided.

## حالة 2026-11-22 (Claude Code، ليلاً)
- أُنجزت 3-5 الجزء ب (`sci6_s1_u3_l5b.py`)، وأُعيدت كتابة 3-4 (`l4`, `l4b`) على تسلسل خطة المعلم المكتوبة بخط اليد (التعلم القبلي «المحلول المعلق»، «أستطيع أن»، القهوة العُمانية والغربال، ورقة الترشيح، نشاط Science Coffee، النشاط الختامي ملح ورمل، التطبيقات الأربعة). البناء: 33 ورقة.
- تصدير Word صار على قالب وزارة التربية والتعليم (`site/src/docx_moe.js`، انظر CLAUDE.md). العرض المطبوع داخل الموقع (HTML) لم يتغير. أوراق الثلاث حصص (1-5، 1-6، 1-7، 2-4، 2-5، 3-2ب، 3-3) تخرج في 4 صفحات، والباقي في 3.
- المتبقي في الوحدة 3: 3-6 (5 حصص: أ 3 + ب 2)، 3-7، 3-8 (انظر الخطة أعلاه)، ثم الخامس ف1.
- (لاحقاً) تصميم الموقع نفسه (الشاشة والمعاينة والطباعة) صار على قالب التربية: `site/src/paper_moe.js` و`paper_moe.css`، والترويسة الثلاثية (الجودة، رؤية عُمان 2040، الوزارة) في الصفحتين وفي ملف Word. التقدير يطابق الطباعة الفعلية في كل الأوراق الـ33؛ 29 ورقة في 3 صفحات أو أقل، و4 (1-6، 2-4، 2-5، 3-3، وكلها ثلاث حصص) في 4.
- (هوية الموقع) صارت للوزارة فقط: ترويسة الصفحة الرئيسية والورقة وWord = رمز الدولة + «سلطنة عُمان / وزارة التعليم» + رؤية عُمان 2040 + الجودة. أُزيل شعار ديوان البلاط وسطر مركز السلطان قابوس واسم المعهد الافتراضي. شعار الوزارة في الملفات هو القديم (من قالب المستخدم): يُستبدل `assets/logos/emblem.jpg` متى أرسل الجديد.
- (توضيح) «الموقع الأساسي» في طلبات الهوية الأخيرة = موقع الخامس والسادس هذا، لا موقع الكيمياء. موقع الكيمياء (`main-site-src`) لم يُمسّ (أُعيد مطابقاً للأصل بعد خطأ في التفسير).
- (الشكل) اختار المستخدم الشكل القديم الملوّن للموقع والورقة وملف Word بدل قالب التربية الذي أعدتُ بناءه؛ بقيت الهوية الجديدة (شعارات الوزارة ورؤية 2040 والجودة) و«مدير المدرسة». قالب التربية محفوظ في `site/alt/ministry_template/` دون بناء.
- (2026-11-22، مساءً) مدة الحصة صارت اختياراً في الخطوة 3 (30/35/40/45/50، الافتراضي 35 وتُحفظ لكل الدروس): تُحوَّل أزمنة التحضير المكتوب (40 د) تناسبياً لكل حصة؛ عنوان الدرس في الورقة = «(رقم) العنوان» دون «أ./ب.» وقابل للتحرير؛ واسم «معهد العلوم الإسلامية» المحفوظ قديماً في المتصفح يُمسح عند الفتح. اختبار جديد `tools/period_test.py`.
- (2026-11-22، ليلاً) 3-4 أ أُعيدت كتابتها حرفياً من تحضير المعلم (PDF، حصة واحدة، 6 مراحل بأزمنتها 3+4+4+10+5+5 = 31 من 35 د، الاستراتيجيات، الوسائل، الواجب «تمرين ص 40»، التفريد: نشاط الملح والرمل للمرتفع وسؤال «أي مما يلي يعمل كمرشّح؟» للمنخفض). صارت وضع `exact=35` في scilib (أزمنة حقيقية لا تُحوَّل عند 35). النسخة القديمة (حصتان) في `site/alt/lesson_versions/`. ورقة 3-4 ب كما هي.
- (2026-11-22، ليلاً) بنود «التقويم التكويني» صارت قابلة للحذف (زر × أو مسح النص، مع «استعادة البنود المحذوفة») وتسميات التواقيع (معلم المادة/مشرف المادة/مدير المدرسة) صارت قابلة للتعديل والحذف والاستعادة، وتنعكس في الطباعة وWord. اختبار `tools/edit_test.py`.
