/* ---------- final ticket, summary and homework, then start ---------- */
(function(){
  var items=[
   {type:'num',q:'احسب كتلة Fe<sub>2</sub>O<sub>3</sub> اللازمة لإنتاج 5.6 g من Fe: Fe<sub>2</sub>O<sub>3</sub> + 3CO → 2Fe + 3CO<sub>2</sub> (Fe = 56, O = 16)',unit:'g',ans:8,tol:0.1,why:'5.6 ÷ 56 = 0.1 mol Fe ← 0.05 mol Fe₂O₃ × 160 = 8 g',hint:'n(Fe) ثم ÷ 2 ثم × 160'},
   {q:'2Mg + O<sub>2</sub> → 2MgO. لديك 0.2 mol من Mg و0.2 mol من O<sub>2</sub>. المادة المحددة:',opts:[{t:'Mg',ok:true,why:'Mg: 0.2 ÷ 2 = 0.1 ، O₂: 0.2 ÷ 1 = 0.2 ← الأقل Mg'},{t:'O<sub>2</sub>'},{t:'لا يوجد محدد'}]},
   {type:'num',q:'كم mol من MgO تتكوّن في السؤال السابق؟',unit:'mol',ans:0.2,tol:0.004,why:'Mg المحددة: 0.2 mol Mg تعطي 0.2 mol MgO (النسبة 1 : 1)',hint:'النسبة بين Mg وMgO هي 2 : 2'},
   {q:'لإيجاد أبسط نسبة في الصيغة نقسم عدد المولات على:',opts:[{t:'أقل عدد مولات',ok:true,why:'صح: ÷ الأقل'},{t:'أكبر عدد مولات'},{t:'الكتلة المولية'}]}
  ];
  slide({id:'final',ch:8,title:'تذكرة الخروج النهائية',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'final')},
   note:'<ul><li>الإجابات: ٨ g، Mg، ٠٫٢ mol، أقل عدد مولات.</li></ul>'});
})();

slide({id:'hw',ch:8,title:'ماذا تعلّمنا؟ والواجب',
 html:function(){
  var hw=['كتاب الطالب: الأسئلة ٣-٨ إلى ٣-١١','كتاب النشاط: ورقة العمل ٣-٣ (الكتل المتفاعلة)','كتاب النشاط: تمرين ٣-٣ الازدياد النسبي (الجزئيتان ب وج)','كتاب النشاط: ورقة العمل ٣-٤ BaCl₂ (اختياري)','أسئلة نهاية الوحدة: السؤال ٣'];
  return `<div class="col grow" style="gap:14px;flex-direction:row">
   <div class="panel dark" style="flex:1;padding:20px 26px"><h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:30px;color:var(--accent)">خلاصة الدرس</h3>
    <ul style="margin:0;padding-inline-start:26px;font-size:24px;line-height:1.55"><li>الصيغة من الكتل: كتلة ← مولات (÷ M) ← أبسط نسبة (÷ الأقل)</li><li>الكتلة من المعادلة: كتلة ← مولات ← نسبة المعادلة ← كتلة</li><li>المادة المحددة: الأقل في <b class="num">n ÷ المعامل</b>، تنتهي أولاً وتحدد الناتج</li><li>المادة الفائضة: يبقى منها جزء بعد التفاعل</li><li>نشاط ٣-٢: <b class="num">n(Na<sub>2</sub>CO<sub>3</sub>) : n(CO<sub>2</sub>) = 1 : 1</b></li></ul></div>
   <div class="col" style="width:430px;flex:none;gap:12px"><div class="panel" style="padding:12px 18px"><h3 style="margin:0 0 6px;font-family:var(--font-display);font-size:26px">الواجب</h3><div class="steps" style="gap:6px">${hw.map(function(h,i){return `<button type="button" class="stp" style="padding:5px 12px;font-size:18px"><span class="sn">${ar(i+1)}</span><span>${h}</span></button>`}).join('')}</div></div>
    <div class="panel" style="padding:8px 16px"><div class="sm" style="font-size:19px;color:var(--cyan);font-weight:800">الدرس التالي</div><p style="margin:0;font-size:20px;line-height:1.35">٣-٤ حسابات تتضمن حجوم الغازات (الحجم المولي ومختبر النشاط ٣-٣)</p></div></div></div>`;},
 init:function(el){ $$('.stp',el).forEach(function(b,i){b.addEventListener('click',function(){var on=b.classList.toggle('final'); $('.sn',b).textContent=on?'✓':ar(i+1)})}) },
 note:'<ul><li>الواجب حسب دليل المعلم للموضوع ٣-٣: الأسئلة ٣-٨ إلى ٣-١١، وورقة العمل ٣-٣، وورقة العمل ٣-٤ (إزالة ماء التبلور من BaCl₂·2H₂O) اختيارية، وأسئلة نهاية الوحدة السؤال ٣. اضغط على البند لتظليله.</li><li>في ورقة العمل ٣-٣ سؤال ٢ أجزاء الحجم (أ.٢ و ب.٢) تُحَلّ بعد الدرس ٣-٤.</li></ul>'});

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
