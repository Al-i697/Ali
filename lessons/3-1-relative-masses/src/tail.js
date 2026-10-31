/* 23 final ticket */
(function(){
  var items=[
   {type:'num',q:'احسب M<sub>r</sub> لهيدروكسيد الماغنيسيوم Mg(OH)<sub>2</sub> (Mg = 24, O = 16, H = 1)',ans:58,tol:0.01,why:'٢٤ + ٢×(١٦+١) = ٥٨',hint:'القوس يضاعف O وH'},
   {q:'نموذج جزيء فيه كرة كربون واحدة و٤ كرات هيدروجين. صيغته:',opts:[{t:'C<sub>4</sub>H'},{t:'CH<sub>4</sub>',ok:true,why:'صح: ذرة C مقابل ٤ ذرات H'},{t:'CH'}]},
   {q:'مخطط لمركب أيوني فيه ٦ أيونات Na⁺ و٦ أيونات Cl⁻. الصيغة البسيطة:',opts:[{t:'Na<sub>6</sub>Cl<sub>6</sub>'},{t:'NaCl',ok:true,why:'٦ : ٦ تتبسّط إلى ١ : ١'},{t:'NaCl<sub>6</sub>'}]},
   {q:'في تجربة حرق الماغنيسيوم، الخط البياني المستقيم الذي يمر بنقطة الأصل يدل على:',opts:[{t:'نسبة كتلة الأكسجين إلى كتلة الماغنيسيوم ثابتة فالصيغة ثابتة',ok:true,why:'صح'},{t:'أن الأكسجين لم يتفاعل'},{t:'أن الكتلة تقل بعد الحرق'}]}
  ];
  slide({id:'final',ch:7,title:'تذكرة الخروج النهائية',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'final')},
   note:'<ul><li>الإجابات: ٥٨، CH₄، NaCl، نسبة ثابتة.</li><li>الأسئلة من إعدادي وتغطي أهداف الدرس: Mr مع قوس، صيغة من نموذج جزيء، تبسيط نسبة أيونات، وتفسير خط التمثيل البياني لنشاط ٣-١ (نسبة ثابتة من الأكسجين إلى الماغنيسيوم).</li></ul>'});
})();

/* 24 summary and homework */
slide({id:'hw',ch:7,title:'ماذا تعلّمنا؟ والواجب',
 html:function(){
  var hw=['كتاب النشاط: تمرين ٣-١ (حساب كتل الصيغ الكيميائية) وتمرين ٣-٢ (التناسب في الحسابات الكيميائية)','كتاب الطالب: الأسئلة ٣-١ إلى ٣-٤ (ص٥٨)','أسئلة نهاية الوحدة: السؤال ١','ورقة العمل ٣-١: النسب الكيميائية'];
  return '<div class="col grow" style="gap:14px">'+
   '<div class="panel dark" style="padding:22px 28px"><h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:30px;color:var(--accent)">خلاصة الدرس</h3><ul style="margin:0;padding-inline-start:26px;font-size:27px;line-height:1.65"><li>نقارن كتل الذرات بذرة <b>C-12 = 12 و.ك.ذ</b> فنحصل على Ar.</li><li>لمعظم العناصر نظائر، فـ Ar <b>متوسط</b> وقد لا تكون عدداً صحيحاً (Cl = 35.5).</li><li><b>M<sub>r</sub></b> = مجموع Ar لكل الذرات في الصيغة (انتبه للأقواس والنقطة).</li><li>الصيغة من نموذج أو مخطط: <b>نعدّ ثم نبسّط النسبة</b>.</li></ul></div></div>'+
   '<div class="col" style="width:430px;flex:none;gap:12px"><div class="panel" style="padding:20px 24px"><h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:28px">الواجب</h3><div class="steps" style="gap:10px">'+hw.map(function(h,i){return '<button type="button" class="stp" style="border:0;text-align:start;font:inherit;font-size:21px;padding:10px 14px;gap:12px;background:var(--surface);cursor:pointer"><span class="sn" style="width:36px;height:36px;font-size:20px">'+ar(i+1)+'</span><span>'+h+'</span></button>'}).join('')+'</div></div></div>';
 },
 init:function(el){ $$('.stp',el).forEach(function(b){b.addEventListener('click',function(){var on=b.classList.toggle('final'); $('.sn',b).textContent=on?'✓':ar($$('.stp',el).indexOf(b)+1); if(on) b.style.background=''; else b.style.background='var(--surface)'})}) },
 note:'<ul><li>الواجب حسب دليل المعلم للدرس ٣-١. اضغط على البند لتظليله عند الإعلان عنه.</li><li>الدرس التالي: ٣-٢ المول (عدد أفوجادرو ٦٫٠٢×١٠²³).</li><li>دليل المعلم ص٥٤: ورقة العمل ٣-١ (النسب الكيميائية) غير متوفرة في الملفات المرسلة (كتاب النشاط ينتهي عند ص٥٠)، وسؤال نهاية الوحدة ١ (كبريتات الأمونيوم، كتاب الطالب ص٧٨) له شريحة في الدرس (eou1) قبل الأسئلة السابقة.</li></ul>'});

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
