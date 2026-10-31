/* ---------- final ticket, summary and homework, then start ---------- */
(function(){
  var items=[
   {type:'num',q:'احسب حجم H<sub>2</sub> الناتج من <span class="num">0.12 g</span> من Mg مع حمض فائض: <span class="num">Mg + 2HCl → MgCl<sub>2</sub> + H<sub>2</sub></span> <span class="num">(Mg = 24)</span>',unit:'mL',ans:120,tol:1.5,why:'0.12 ÷ 24 = 0.005 mol Mg = 0.005 mol H₂ ← × 24000 = 120 mL',hint:'n(Mg) ثم نسبة 1 : 1 ثم × 24000'},
   {q:'<span class="num">2NO + O<sub>2</sub> → 2NO<sub>2</sub></span>. خُلط <span class="num">40 mL</span> من NO مع <span class="num">30 mL</span> من O<sub>2</sub>. المادة المحددة:',opts:[{t:'NO',ok:true,why:'40 mL من NO تحتاج 20 mL فقط من O₂، فالأكسجين فائض والمحدد NO'},{t:'O<sub>2</sub>'},{t:'لا يوجد محدد'}]},
   {type:'num',q:'ما حجم NO<sub>2</sub> الناتج في السؤال السابق؟',unit:'mL',ans:40,tol:0.4,why:'NO هو المحدد: 40 mL من NO تعطي 40 mL من NO₂ (النسبة 1 : 1)',hint:'النسبة بين NO وNO₂ هي 2 : 2'},
   {q:'القيمة <span class="num">24 L/mol</span> تُستخدم:',opts:[{t:'للغازات عند درجة حرارة الغرفة والضغط القياسي',ok:true,why:'صح: لا تصح للمواد الصلبة أو السائلة'},{t:'لكل المواد في أي ظروف'},{t:'للمحاليل فقط'}]}
  ];
  slide({id:'final',ch:7,title:'تذكرة الخروج النهائية',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'final')},
   note:'<ul><li>الإجابات: ١٢٠ mL، NO، ٤٠ mL، للغازات عند درجة حرارة الغرفة والضغط القياسي.</li></ul>'});
})();

slide({id:'hw',ch:7,title:'ماذا تعلّمنا؟ والواجب',
 html:function(){
  var hw=['كتاب الطالب: الأسئلة ٣-١٢ إلى ٣-١٥','كتاب النشاط: تمرين ٣-٤ (شريط Mg طوله 5 cm)','كتاب النشاط: تمرين ٣-٥ (حجوم الغازات المتفاعلة)','كتاب النشاط: ورقة العمل ٣-٥ السؤال ١','أسئلة نهاية الوحدة: السؤال ٤'];
  return `<div class="col grow" style="gap:14px;flex-direction:row">
   <div class="panel dark" style="flex:1;padding:20px 26px"><h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:30px;color:var(--accent)">خلاصة الدرس</h3>
    <ul style="margin:0;padding-inline-start:26px;font-size:23px;line-height:1.55"><li>قانون أفوجادرو: الحجوم المتساوية من الغازات (الظروف نفسها) فيها العدد نفسه من الجسيمات</li><li>الحجم المولي <b class="num">24 L/mol</b> عند درجة حرارة الغرفة والضغط القياسي: <b class="num">V = n × 24</b></li><li>تفاعلات الغازات فقط: <b>نسبة الحجوم = نسبة المعاملات</b></li><li>كتلة وغاز: المعطى ← مولات ← نسبة المعادلة ← مولات ← المطلوب</li><li>نشاط ٣-٣: حجم H<sub>2</sub> يتناسب مع كتلة Mg، وكل <b class="num">1 mL</b> ≙ <b class="num">0.001 g</b> من Mg</li></ul></div>
   <div class="col" style="width:430px;flex:none;gap:12px"><div class="panel" style="padding:12px 18px"><h3 style="margin:0 0 6px;font-family:var(--font-display);font-size:26px">الواجب</h3><div class="steps" style="gap:6px">${hw.map(function(h,i){return `<button type="button" class="stp" style="padding:5px 12px;font-size:18px"><span class="sn">${ar(i+1)}</span><span>${h}</span></button>`}).join('')}</div></div>
    <div class="panel" style="padding:8px 16px"><div class="sm" style="font-size:19px;color:var(--cyan);font-weight:800">الدرس التالي</div><p style="margin:0;font-size:20px;line-height:1.35">٣-٥ حسابات تتضمن محاليل متفاعلة (التركيز والمعايرة)</p></div></div></div>`;},
 init:function(el){ $$('.stp',el).forEach(function(b,i){b.addEventListener('click',function(){var on=b.classList.toggle('final'); $('.sn',b).textContent=on?'✓':ar(i+1)})}) },
 note:'<ul><li>الواجب حسب دليل المعلم للموضوع ٣-٤: تمرين ٣-٤ وتمرين ٣-٥ وورقة العمل ٣-٥ سؤال ١ وأسئلة ٣-١٢ إلى ٣-١٥ وأسئلة نهاية الوحدة سؤال ٤. اضغط على البند لتظليله.</li><li>في ورقة العمل ٣-٥ سؤال ١، الجزءان (أ) و(ب) عن التركيز ويُحلان بعد الدرس ٣-٥، والجزء (ج) (الخارصين) حلّلناه في الدرس.</li></ul>'});

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
