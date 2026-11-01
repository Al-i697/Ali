/* ---------- final ticket, summary and homework, then start ---------- */
ticketSlide({id:'final',ch:7,title:'تذكرة الخروج النهائية',tag:'تذكرة خروج',items:[
 {type:'num',q:'كم ذرة هيدروجين في جزيء البنتين <span class="num">C<sub>5</sub>H<sub>x</sub></span> (ألكين)؟',unit:'ذرة',ans:10,tol:.01,why:'2×5 = 10: الصيغة C₅H₁₀',hint:'الألكين: 2n'},
 {q:'ماذا يحدث لماء البروم عند رجّه مع ألكين؟',opts:[{t:'يتحوّل من البرتقالي إلى عديم اللون',ok:true,why:'تفاعل إضافة يزيل البروم من المحلول'},{t:'يبقى برتقالياً',why:'هذا مع الألكانات'},{t:'يتحوّل إلى الأخضر',why:'لا يتغير إلى الأخضر'}]},
 {q:'ما نوع التفاعل الذي تتحد فيه مادتان لتكوين ناتج واحد فقط عند كسر الرابطة الثنائية؟',opts:[{t:'تفاعل إضافة',ok:true,why:'تنكسر C=C وتُضاف ذرتان'},{t:'احتراق',why:'الاحتراق ناتجاه CO₂ وH₂O'},{t:'تكسير حراري',why:'يفكّك الجزيء ولا يضيف إليه'}]},
 {q:'ناتج هدرجة الألكين هو:',opts:[{t:'ألكان',ok:true,why:'ألكين + H₂ ← ألكان (مشبع)'},{t:'كحول',why:'الكحول ناتج الإماهة'},{t:'ألكين آخر',why:'الهدرجة تزيل الرابطة الثنائية'}]},
 {q:'عامل حفّاز حمض الفوسفوريك عند 300 °C وضغط 60 atm يُستخدم في:',opts:[{t:'الإماهة: تحويل الإيثين إلى إيثانول',ok:true,why:'ألكين + بخار الماء ← كحول'},{t:'الهدرجة',why:'الهدرجة بالنيكل'},{t:'إضافة البروم',why:'إضافة البروم عند درجة حرارة الغرفة'}]}
 ],
 note:'<ul><li>الإجابات: ١٠، يتحوّل من البرتقالي إلى عديم اللون، تفاعل إضافة، ألكان، الإماهة.</li></ul>'});

slide({id:'hw',ch:7,title:'ماذا تعلّمنا؟ والواجب',
 html:function(){
  var hw=['كتاب الطالب: الأسئلة ٤-١١ إلى ٤-٢٠','كتاب الطالب: النشاط ٤-١ (اختبار الهيدروكربونات غير المشبعة)','كتاب الطالب: أسئلة نهاية الوحدة (السؤال ٣)','كتاب النشاط: تمرين ٤-٢ هيدروكربونات غير مشبعة','كتاب النشاط: تمرين ٤-٣ الهيدروكربونات وتفاعلاتها'];
  return `<div class="col grow" style="gap:14px;flex-direction:row">
   <div class="panel dark" style="flex:1;padding:20px 26px"><h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:30px;color:var(--accent)">خلاصة الدرس</h3>
    <ul style="margin:0;padding-inline-start:26px;font-size:22px;line-height:1.55"><li>الألكينات: هيدروكربونات <b>غير مشبعة</b> فيها رابطة ثنائية <b class="num">C=C</b>، صيغتها العامة <b class="num">C<sub>n</sub>H<sub>2n</sub></b>، واسمها ينتهي بـ «ين».</li><li>ترتفع <b>درجة الغليان</b> بزيادة عدد ذرات الكربون: الإيثين والبروبين والبيوتين غازات.</li><li><b>اختبار عدم التشبع</b>: ماء البروم من البرتقالي إلى <b>عديم اللون</b> مع الألكين.</li><li><b>تفاعل الإضافة</b>: تنكسر C=C وتُضاف ذرتان فيتكوّن ناتج واحد: بروم (حرارة الغرفة)، هيدروجين (نيكل، 150–300 °C)، بخار ماء (حمض الفوسفوريك، 300 °C، 60 atm).</li><li>الاستخدامات: إيثانول، سمن، وبلاستيك.</li></ul></div>
   <div class="col" style="width:430px;flex:none;gap:12px"><div class="panel" style="padding:12px 18px"><h3 style="margin:0 0 6px;font-family:var(--font-display);font-size:26px">الواجب</h3><div class="steps" style="gap:6px">${hw.map(function(h,i){return `<button type="button" class="stp" style="padding:5px 12px;font-size:18px"><span class="sn">${ar(i+1)}</span><span>${h}</span></button>`}).join('')}</div></div>
    <div class="panel" style="padding:8px 16px"><div class="sm" style="font-size:19px;color:var(--cyan);font-weight:800">الدرس التالي</div><p style="margin:0;font-size:20px;line-height:1.35">٤-٣ البترول (النفط الخام) والوقود الأحفوري</p></div></div></div>`;},
 init:function(el){ $$('.stp',el).forEach(function(b,i){b.addEventListener('click',function(){var on=b.classList.toggle('final'); $('.sn',b).textContent=on?'✓':ar(i+1)})}) },
 note:'<ul><li>الواجب من دليل المعلم للموضوع ٤-٢: الأسئلة ٤-١١ إلى ٤-٢٠، النشاط ٤-١، سؤال نهاية الوحدة ٣، وتمرينا ٤-٢ و٤-٣ في كتاب النشاط. اضغط على البند لتظليله.</li></ul>'});

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
