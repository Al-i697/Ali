/* ---------- final ticket, summary and homework, then start ---------- */
(function(){
  var items=[
   {type:'num',q:'كم ذرة هيدروجين في جزيء الهكسان <span class="num">C<sub>6</sub>H<sub>x</sub></span>؟',unit:'ذرة',ans:14,tol:.01,why:'2×6 + 2 = 14: الصيغة C₆H₁₄',hint:'2n + 2 حيث n = 6'},
   {q:'ماذا يحدث لدرجة الغليان عند الانتقال من البروبان إلى البنتان؟',opts:[{t:'ترتفع',ok:true,why:'من −42 إلى 36 °C: السلسلة أطول فقوى التجاذب أقوى'},{t:'تنخفض',why:'العكس'},{t:'لا تتغيّر',why:'تتدرّج درجة الغليان'}]},
   {q:'ما ناتجا الاحتراق الكامل للألكانات؟',opts:[{t:'ثاني أكسيد الكربون والماء',ok:true,why:'وتنطلق طاقة حرارية'},{t:'الكربون والهيدروجين',why:'هذان عنصران وليسا ناتجي الاحتراق الكامل'},{t:'أول أكسيد الكربون فقط',why:'ينتج عند نقص الأكسجين'}]},
   {q:'لماذا الألكانات غير نشطة كيميائياً؟',opts:[{t:'لأنها مشبعة وروابطها الأحادية قوية',ok:true,why:'لا مكان لإضافة ذرات، والروابط تحتاج طاقة كبيرة لتنكسر'},{t:'لأنها تحتوي رابطة ثنائية',why:'هذه الألكينات'},{t:'لأنها فلزات',why:'الألكانات مركبات هيدروكربونية'}]},
   {q:'أي هذه المركبات ينتمي إلى السلسلة المتجانسة للألكانات؟',opts:[{t:'<span class="num">C<sub>4</sub>H<sub>10</sub></span>',ok:true,why:'2×4 + 2 = 10: البيوتان'},{t:'<span class="num">C<sub>4</sub>H<sub>8</sub></span>',why:'صيغة ألكين'},{t:'<span class="num">C<sub>2</sub>H<sub>5</sub>OH</span>',why:'هذا كحول فيه أكسجين'}]}
  ];
  slide({id:'final',ch:6,title:'تذكرة الخروج النهائية',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'final')},
   note:'<ul><li>الإجابات: ١٤، ترتفع، ثاني أكسيد الكربون والماء، لأنها مشبعة وروابطها الأحادية قوية، C₄H₁₀.</li></ul>'});
})();

slide({id:'hw',ch:6,title:'ماذا تعلّمنا؟ والواجب',
 html:function(){
  var hw=['كتاب الطالب: الأسئلة ٤-١ إلى ٤-١٠','كتاب الطالب: أسئلة نهاية الوحدة (السؤالان ١ و٢)','كتاب النشاط: تمرين ٤-١ عائلات الهيدروكربونات','كتاب النشاط: ورقة العمل ٤-١ الألكانات','كتاب النشاط: ورقة العمل ٤-٢ حرق الهيدروكربونات'];
  return `<div class="col grow" style="gap:14px;flex-direction:row">
   <div class="panel dark" style="flex:1;padding:20px 26px"><h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:30px;color:var(--accent)">خلاصة الدرس</h3>
    <ul style="margin:0;padding-inline-start:26px;font-size:22px;line-height:1.55"><li>الكيمياء العضوية: دراسة مركّبات الكربون، وذرة الكربون تكوّن <b>٤ روابط</b> تساهمية.</li><li>الألكانات: هيدروكربونات <b>مشبعة</b>، صيغتها العامة <b class="num">C<sub>n</sub>H<sub>2n+2</sub></b>، واسمها ينتهي بـ «ان».</li><li>تزداد <b>درجة الغليان</b> بزيادة عدد ذرات الكربون، لأن قوى التجاذب بين الجزيئات تقوى.</li><li><b>غير نشطة</b> كيميائياً، ولكنها <b>تحترق</b> فتعطي CO<sub>2</sub> وH<sub>2</sub>O وطاقة.</li><li>السلسلة المتجانسة: الصيغة العامة نفسها، وتختلف بـ <b class="num">CH<sub>2</sub></b>.</li></ul></div>
   <div class="col" style="width:430px;flex:none;gap:12px"><div class="panel" style="padding:12px 18px"><h3 style="margin:0 0 6px;font-family:var(--font-display);font-size:26px">الواجب</h3><div class="steps" style="gap:6px">${hw.map(function(h,i){return `<button type="button" class="stp" style="padding:5px 12px;font-size:18px"><span class="sn">${ar(i+1)}</span><span>${h}</span></button>`}).join('')}</div></div>
    <div class="panel" style="padding:8px 16px"><div class="sm" style="font-size:19px;color:var(--cyan);font-weight:800">الدرس التالي</div><p style="margin:0;font-size:20px;line-height:1.35">٤-٢ الألكينات وتفاعلات الإضافة</p></div></div></div>`;},
 init:function(el){ $$('.stp',el).forEach(function(b,i){b.addEventListener('click',function(){var on=b.classList.toggle('final'); $('.sn',b).textContent=on?'✓':ar(i+1)})}) },
 note:'<ul><li>الواجب من دليل المعلم للموضوع ٤-١: تمرين ٤-١ وورقتا العمل ٤-١ و٤-٢ في كتاب النشاط، والأسئلة ٤-١ إلى ٤-١٠ وسؤالا نهاية الوحدة ١ و٢ في كتاب الطالب. اضغط على البند لتظليله.</li></ul>'});

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
