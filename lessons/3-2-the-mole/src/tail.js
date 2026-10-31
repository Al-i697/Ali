/* ---------- final ticket, summary and homework, then start ---------- */
(function(){
  var items=[
   {type:'num',q:'احسب كتلة 2 mol من أكسيد الماغنيسيوم MgO (Mg = 24, O = 16)',unit:'g',ans:80,tol:0.01,why:'M = 40 ، 2 × 40 = 80 g',hint:'M(MgO) = 24 + 16 = 40 ثم m = n × M'},
   {type:'num',q:'احسب عدد مولات 4 g من غاز الهيدروجين H<sub>2</sub> (H = 1)',unit:'mol',ans:2,tol:0.01,why:'M = 2 ، 4 ÷ 2 = 2 mol',hint:'M(H₂) = 2 × 1 = 2'},
   {q:'كم ذرة كربون في 0.5 mol من الكربون؟',opts:[{t:'6.02×10²³'},{t:'3.01×10²³',ok:true,why:'0.5 × 6.02×10²³ = 3.01×10²³'},{t:'12'}]},
   {q:'أي علاقة تربط الكتلة بعدد المولات؟',opts:[{t:'n = m ÷ M',ok:true,why:'عدد المولات = الكتلة ÷ الكتلة المولية'},{t:'n = m × M'},{t:'n = M ÷ m'}]}
  ];
  slide({id:'final',ch:7,title:'تذكرة الخروج النهائية',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'final')},
   note:'<ul><li>الإجابات: ٨٠ g، ٢ mol، 3.01×10²³، n = m ÷ M.</li><li>الأسئلة من إعدادي: ١ كتلة من المولات (MgO)، ٢ مولات من الكتلة (H₂)، ٣ عدد الذرات في 0.5 mol، ٤ العلاقة n = m ÷ M. الصيغتان m = n × M وn = m ÷ M هما أساس الحسابات في ٣-٣ وما بعده.</li></ul>'});
})();

slide({id:'hw',ch:7,title:'ماذا تعلّمنا؟ والواجب',
 html:function(){
  var hw=['كتاب النشاط: ورقة العمل ٣-٢ (المول والصيغ الكيميائية)','كتاب النشاط: تمرين ٣-٣ الازدياد النسبي (الجزئية أ)','كتاب الطالب: الأسئلة ٣-٥ إلى ٣-٧','أسئلة نهاية الوحدة: السؤال ٢'];
  return `<div class="col grow" style="gap:14px;flex-direction:row">
   <div class="panel dark" style="flex:1;padding:20px 26px"><h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:30px;color:var(--accent)">خلاصة الدرس</h3>
    <ul style="margin:0;padding-inline-start:26px;font-size:26px;line-height:1.6"><li>المول = <b class="num">6.02×10<sup>23</sup></b> جسيم (عدد أفوجادرو)</li><li>الكتلة المولية M = كتلة الصيغة النسبية بوحدة <b class="num">g/mol</b></li><li>عدد المولات <b class="num">n = m ÷ M</b></li><li>عدد الجسيمات <b class="num">N = n × 6.02×10<sup>23</sup></b></li><li>الكتلة تختلف من مادة لأخرى وعدد الجسيمات في المول ثابت</li></ul></div>
   <div class="col" style="width:420px;flex:none;gap:12px"><div class="panel" style="padding:18px 22px"><h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:28px">الواجب</h3><div class="steps" style="gap:10px">${hw.map(function(h,i){return `<button type="button" class="stp" style="padding:10px 14px;font-size:21px"><span class="sn">${ar(i+1)}</span><span>${h}</span></button>`}).join('')}</div></div>
    <div class="panel" style="padding:12px 20px"><div class="sm" style="font-size:20px;color:var(--cyan);font-weight:800">الدرس التالي</div><p style="margin:0;font-size:23px;line-height:1.4">٣-٣ حسابات تتضمن كتلاً متفاعلة (استنباط الصيغ الكيميائية)</p></div></div></div>`;},
 init:function(el){ $$('.stp',el).forEach(function(b,i){b.addEventListener('click',function(){var on=b.classList.toggle('final'); $('.sn',b).textContent=on?'✓':ar(i+1)})}) },
 note:'<ul><li>الواجب حسب دليل المعلم للموضوع ٣-٢. اضغط على البند لتظليله عند الإعلان عنه.</li><li>دليل المعلم ص٥٥: ورقة العمل ٣-٢ (المول والصيغ الكيميائية) في كتاب النشاط غير متوفرة في الملفات المرسلة (الملف ينتهي عند ص٥٠)، فلا توجد لها شريحة. سؤال نهاية الوحدة ٢ (كتاب الطالب ص٧٨) مذكور في الواجب وليس له شريحة.</li></ul>'});

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
