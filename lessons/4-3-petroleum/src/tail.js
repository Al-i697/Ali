/* ---------- final ticket, summary and homework, then start ---------- */
ticketSlide({id:'final',ch:5,title:'تذكرة الخروج النهائية',tag:'تذكرة خروج',items:[
 {q:'ما العملية التي تفصل النفط الخام إلى مشتقات؟',opts:[{t:'التقطير التجزيئي',ok:true,why:'تفصل بحسب اختلاف درجات الغليان'},{t:'التكسير الحراري',why:'التكسير يفكّك الجزيئات الكبيرة'},{t:'الاحتراق',why:'الاحتراق يحرق الوقود'}]},
 {q:'أي المشتقات يخرج من قمة عمود التجزئة؟',opts:[{t:'غازات مصافي التكرير',ok:true,why:'الأخف وأقل درجة غليان (أقل من 25 °C)'},{t:'الأسفلت',why:'الأسفلت من القاعدة'},{t:'زيت الديزل',why:'يخرج من منتصف العمود'}]},
 {q:'ماذا يحدث للزوجة المشتقات كلما نزلنا نحو قاعدة العمود؟',opts:[{t:'تزداد',ok:true,why:'السلاسل الأطول أكثر تشابكاً'},{t:'تقل',why:'العكس'},{t:'لا تتغير',why:'تتغير مع طول السلسلة'}]},
 {q:'ما نواتج التكسير الحراري لألكان طويل السلسلة؟',opts:[{t:'ألكان أقصر وألكين (أو ألكين وهيدروجين)',ok:true,why:'هذه القاعدة'},{t:'ثاني أكسيد الكربون وماء',why:'هذا الاحتراق'},{t:'كحول فقط',why:'الكحول ناتج الإماهة'}]},
 {type:'num',q:'<span class="num">C<sub>10</sub>H<sub>22</sub> → C<sub>7</sub>H<sub>16</sub> + C<sub>3</sub>H<sub>x</sub></span>: كم ذرة هيدروجين x في الألكين الناتج؟',unit:'ذرة',ans:6,tol:.01,why:'22 − 16 = 6: الناتج C₃H₆ (بروبين)',hint:'اطرح 16 من 22'}
 ],
 note:'<ul><li>الإجابات: التقطير التجزيئي، غازات مصافي التكرير، تزداد، ألكان أقصر وألكين (أو ألكين وهيدروجين)، ٦.</li></ul>'});

slide({id:'hw',ch:5,title:'ماذا تعلّمنا؟ والواجب',
 html:function(){
  var hw=['كتاب الطالب: الأسئلة ٤-٢١ إلى ٤-٢٤','كتاب الطالب: النشاطان ٤-٢ و٤-٣','كتاب الطالب: أسئلة نهاية الوحدة (السؤال ٤)','كتاب النشاط: تمرين ٤-٤ العمليات الأساسية في الصناعة البتروكيميائية','كتاب النشاط: ورقة العمل ٤-٣ التقطير التجزيئي والتكسير الحراري'];
  return `<div class="col grow" style="gap:14px;flex-direction:row">
   <div class="panel dark" style="flex:1;padding:20px 26px"><h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:30px;color:var(--accent)">خلاصة الدرس</h3>
    <ul style="margin:0;padding-inline-start:26px;font-size:22px;line-height:1.55"><li>الوقود الأحفوري: <b>الفحم والنفط والغاز الطبيعي</b>، تكوّنت عبر ملايين السنين فهي موارد غير متجددة.</li><li>النفط <b>مخلوط</b> هيدروكربونات، يُفصل بـ <b>التقطير التجزيئي</b> بحسب درجة الغليان.</li><li>كلما نزلنا في العمود: ازدادت <b>درجة الغليان واللزوجة</b>، وقلّ <b>التطاير والاشتعال</b>.</li><li><b>التكسير الحراري</b>: يفكّك الألكانات الطويلة إلى <b>ألكان أقصر + ألكين</b> (أو ألكين + هيدروجين)، بحرارة عالية (> 800 °C مع بخار) أو 500 °C مع عامل حفّاز.</li><li>الألكينات الناتجة مواد أولية لصنع البلاستيك والإيثانول.</li></ul></div>
   <div class="col" style="width:430px;flex:none;gap:12px"><div class="panel" style="padding:12px 18px"><h3 style="margin:0 0 6px;font-family:var(--font-display);font-size:26px">الواجب</h3><div class="steps" style="gap:6px">${hw.map(function(h,i){return `<button type="button" class="stp" style="padding:5px 12px;font-size:18px"><span class="sn">${ar(i+1)}</span><span>${h}</span></button>`}).join('')}</div></div>
    <div class="panel" style="padding:8px 16px"><div class="sm" style="font-size:19px;color:var(--cyan);font-weight:800">الدرس التالي</div><p style="margin:0;font-size:20px;line-height:1.35">مراجعة الوحدة الرابعة: الكيمياء العضوية</p></div></div></div>`;},
 init:function(el){ $$('.stp',el).forEach(function(b,i){b.addEventListener('click',function(){var on=b.classList.toggle('final'); $('.sn',b).textContent=on?'✓':ar(i+1)})}) },
 note:'<ul><li>الواجب من دليل المعلم للموضوع ٤-٣: الأسئلة ٤-٢١ إلى ٤-٢٤، النشاطان ٤-٢ و٤-٣، سؤال نهاية الوحدة ٤، وتمرين ٤-٤ وورقة العمل ٤-٣ في كتاب النشاط. اضغط على البند لتظليله.</li></ul>'});

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
