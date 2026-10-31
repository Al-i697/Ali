/* ---------- final ticket, summary and homework, then start ---------- */
(function(){
  var items=[
   {type:'num',q:'ما التركيز المولي لمحلول فيه <span class="num">8 g</span> من NaOH في <span class="num">500 mL</span> من المحلول؟ (M<sub>r</sub> = 40)',unit:'mol/L',ans:0.4,tol:0.006,why:'n = 8 ÷ 40 = 0.2 mol ← 0.2 ÷ 0.5 = 0.4 mol/L',hint:'n = m ÷ M ثم C = n ÷ V'},
   {q:'<span class="num">H<sub>2</sub>SO<sub>4</sub> + 2NaOH → Na<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O</span>. لمعادلة <span class="num">0.01 mol</span> من الحمض نحتاج إلى:',opts:[{t:'0.02 mol من NaOH',ok:true,why:'النسبة 1 : 2 فنضرب في 2'},{t:'0.01 mol من NaOH'},{t:'0.005 mol من NaOH'}]},
   {type:'num',q:'عادلت <span class="num">20 mL</span> من HCl مجهول التركيز <span class="num">25 mL</span> من NaOH تركيزه <span class="num">0.1 mol/L</span>. ما تركيز HCl؟',unit:'mol/L',ans:0.125,tol:0.002,why:'n(NaOH) = 0.0025 = n(HCl) ← 0.0025 ÷ 0.020 = 0.125 mol/L',hint:'n(NaOH) ثم النسبة 1 : 1 ثم ÷ 0.020 L'},
   {q:'نكرر المعايرة حتى نحصل على نتيجتين متقاربتين لأن ذلك:',opts:[{t:'يقلل الأخطاء ويسمح بأخذ المتوسط (فرق ≤ 0.1 mL)',ok:true,why:'تكرار القياس يزيد الثقة بالنتيجة'},{t:'يزيد تركيز الحمض'},{t:'يغيّر لون الكاشف'}]}
  ];
  slide({id:'final',ch:7,title:'تذكرة الخروج النهائية',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'final')},
   note:'<ul><li>الإجابات: ٠٫٤ mol/L، 0.02 mol من NaOH، ٠٫١٢٥ mol/L، يقلل الأخطاء ويسمح بالمتوسط.</li></ul>'});
})();

slide({id:'hw',ch:7,title:'ماذا تعلّمنا؟ والواجب',
 html:function(){
  var hw=['كتاب الطالب: الأسئلة ٣-١٦ إلى ٣-٢٠','كتاب النشاط: تمرين ٣-٦ (حسابات تتضمن محاليل)','كتاب النشاط: ورقة العمل ٣-٥ الأسئلة ٢ و٣ و٤','كتاب النشاط: ورقة العمل ٣-٦ (صيغة حمض عضوي)','أسئلة نهاية الوحدة: السؤال ٥'];
  return `<div class="col grow" style="gap:14px;flex-direction:row">
   <div class="panel dark" style="flex:1;padding:20px 26px"><h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:30px;color:var(--accent)">خلاصة الدرس</h3>
    <ul style="margin:0;padding-inline-start:26px;font-size:23px;line-height:1.55"><li>تركيز الكتلة: <b class="num">C = m ÷ V</b> بوحدة g/L</li><li>التركيز المولي: <b class="num">C = n ÷ V</b> بوحدة mol/L، و<b class="num">n = C × V</b></li><li>الحجم دائماً <b>باللتر</b>: mL ÷ 1000</li><li>المعايرة: محلول قياسي من السحاحة يعادل حجماً محدداً (ماصة) حتى <b>نقطة النهاية</b>، ونأخذ متوسط نتيجتين (≤ 0.1 mL)</li><li>الحل: معطى ← <b>مولات</b> ← نسبة المعادلة ← مولات ← مطلوب</li></ul></div>
   <div class="col" style="width:430px;flex:none;gap:12px"><div class="panel" style="padding:12px 18px"><h3 style="margin:0 0 6px;font-family:var(--font-display);font-size:26px">الواجب</h3><div class="steps" style="gap:6px">${hw.map(function(h,i){return `<button type="button" class="stp" style="padding:5px 12px;font-size:18px"><span class="sn">${ar(i+1)}</span><span>${h}</span></button>`}).join('')}</div></div>
    <div class="panel" style="padding:8px 16px"><div class="sm" style="font-size:19px;color:var(--cyan);font-weight:800">نهاية الوحدة الثالثة</div><p style="margin:0;font-size:20px;line-height:1.35">راجع الخريطة الكبرى وأسئلة نهاية الوحدة</p></div></div></div>`;},
 init:function(el){ $$('.stp',el).forEach(function(b,i){b.addEventListener('click',function(){var on=b.classList.toggle('final'); $('.sn',b).textContent=on?'✓':ar(i+1)})}) },
 note:'<ul><li>الواجب حسب دليل المعلم للموضوع ٣-٥: تمرين ٣-٦، وورقة العمل ٣-٥ الأسئلة ٢ و٣ و٤، وورقة العمل ٣-٦، والأسئلة ٣-١٦ إلى ٣-٢٠، وأسئلة نهاية الوحدة سؤال ٥. اضغط على البند لتظليله.</li></ul>'});

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
