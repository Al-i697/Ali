/* ---------- exam practice: the first slide uses real past-paper items on concentrations and titration, the second is written in the same style ---------- */
(function(){
  var P1=[
   {yr:'2025/2026 · الدور الأول (سؤال ٢٢ ب)',mk:4,q:'<span class="num">KOH + HCl → KCl + H<sub>2</sub>O</span>. عُويرت عينة HCl مجهولة التركيز بـ <span class="num">20 mL</span> من KOH تركيزه <span class="num">0.05 mol/L</span>. احسب تركيز HCl إذا كان حجمه المستخدم <span class="num">0.025 L</span>.',nums:[{lab:'n(KOH) =',ans:0.001,tol:0.00002,why:'0.05 × 0.020 = 0.001 mol = n(HCl) (النسبة 1 : 1)'},{lab:'C(HCl) =',ans:0.04,tol:0.0006,why:'0.001 ÷ 0.025 = 0.04 mol/L'}]},
   {yr:'2022/2023 · الدور الأول (مسائي، سؤال ١٢)',mk:3,q:'تمت إذابة <span class="num">21 g</span> من KOH في <span class="num">500 mL</span> من الماء (K = 39 ، O = 16 ، H = 1). احسب عدد المولات ثم التركيز المولي.',nums:[{lab:'n =',ans:0.375,tol:0.004,why:'M = 56 ← 21 ÷ 56 = 0.375 mol'},{lab:'C =',ans:0.75,tol:0.01,why:'0.375 ÷ 0.5 = 0.75 mol/L'}]},
   {yr:'2022/2023 · الدور الثاني (سؤال ١٤ ب)',mk:2,q:'أُذيب <span class="num">4 g</span> من NaOH في الماء ليصبح حجم المحلول <span class="num">500 mL</span>. أوجد التركيز المولي (M<sub>r</sub> = 40 g/mol).',nums:[{lab:'C =',ans:0.2,tol:0.003,why:'n = 4 ÷ 40 = 0.1 mol ← 0.1 ÷ 0.5 = 0.2 mol/L'}]},
   {yr:'2022/2023 · الدور الأول (صباحي، سؤال ١٣)',mk:1,q:'إذا تمت إذابة <span class="num">0.3 mol</span> من NaCl في <span class="num">100 mL</span> من الماء فكم سيبلغ تركيزه المولي بوحدة mol/L؟',opts:[['0.03',0],['0.003',0],['3.0',1],['0.3',0]],why:'0.3 ÷ 0.1 L = 3.0 mol/L'},
   {yr:'2022/2023 · الدور الأول (صباحي، سؤال ١٤ أ)',mk:1,q:'عرّف المقصود بالمحلول القياسي.',opts:[['مخلوط متجانس من مذاب ومذيب تركيزه معروف بدقة',1],['محلول مجهول التركيز نريد معايرته',0],['ماء مقطر نقي',0]],why:'المحلول القياسي تركيزه معروف بدقة'},
   {yr:'2023/2024 · الدور الأول (سؤال ٢٤)',mk:2,q:'حجوم HCl المستخدمة في ثلاث معايرات لنفس المادة: <span class="num">25.2</span> و<span class="num">24.2</span> و<span class="num">24.5</span> mL. ما أفضل نتيجتين؟',opts:[['الأولى والثانية',0],['الثانية والثالثة',1],['الأولى والثالثة',0]],why:'24.2 و24.5 هما الأقرب من بعضهما'}
  ];
  var P2=[
   {yr:'على نمط الامتحان',mk:1,q:'أُذيب <span class="num">5 g</span> من ملح الطعام في الماء ليصبح الحجم <span class="num">500 mL</span>. احسب تركيز الكتلة.',nums:[{lab:'C =',ans:10,tol:0.1,why:'5 ÷ 0.5 = 10 g/L'}]},
   {yr:'على نمط الامتحان',mk:2,q:'كم غراماً من NaOH تلزم لتحضير <span class="num">250 mL</span> من محلول تركيزه <span class="num">0.2 mol/L</span>؟ (M<sub>r</sub> = 40)',nums:[{lab:'m =',ans:2,tol:0.03,why:'n = 0.2 × 0.25 = 0.05 mol ← × 40 = 2 g'}]},
   {yr:'على نمط الامتحان',mk:3,q:'<span class="num">NaOH + HCl → NaCl + H<sub>2</sub>O</span>. تعادل <span class="num">25 mL</span> من NaOH مع <span class="num">20 mL</span> من HCl تركيزه <span class="num">0.1 mol/L</span>. احسب تركيز NaOH.',nums:[{lab:'C =',ans:0.08,tol:0.001,why:'n(HCl) = 0.002 = n(NaOH) ← 0.002 ÷ 0.025 = 0.08 mol/L'}]},
   {yr:'على نمط الامتحان',mk:1,q:'الأداتان اللتان تقيسان الحجم بدقة في المعايرة:',opts:[['الماصة والسحاحة',1],['الكأس والمخبار',0],['القمع والقارورة',0]],why:'الماصة لقياس حجم القاعدة والسحاحة لإضافة الحمض'},
   {yr:'على نمط الامتحان',mk:3,q:'<span class="num">H<sub>2</sub>SO<sub>4</sub> + 2KOH → K<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O</span>. تعادل <span class="num">10 mL</span> من H<sub>2</sub>SO<sub>4</sub> (0.1 mol/L) مع KOH تركيزه <span class="num">0.05 mol/L</span>. احسب حجم KOH.',nums:[{lab:'V =',ans:40,tol:0.5,why:'n(H₂SO₄) = 0.001 ← n(KOH) = 0.002 ← 0.002 ÷ 0.05 = 0.04 L = 40 mL'}]},
   {yr:'على نمط الامتحان',mk:1,q:'عند نقطة النهاية في المعايرة:',opts:[['يتغير لون الكاشف وتتكافأ مولات الحمض والقاعدة حسب المعادلة',1],['ينتهي الحمض كله من السحاحة',0],['يتوقف التفاعل تماماً',0]],why:'نقطة النهاية: تغير لون الكاشف عند التكافؤ'}
  ];
  function cardHTML(c,i){
    var body='';
    if(c.nums) body+=c.nums.map(function(n,j){return '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="eq" style="font-size:21px">'+n.lab+'</span>'+ninHTML('p'+i+'_'+j,'','sm')+'</div>'}).join('');
    if(c.opts) body+='<div class="sel">'+c.opts.map(function(o,j){return '<button type="button" data-j="'+j+'" style="min-height:42px;font-size:20px;padding:0 12px">'+o[0]+'</button>'}).join('')+'</div>';
    return '<div class="pq" data-i="'+i+'"><div class="pqh"><span class="yr">'+c.yr+'</span>'+(c.mk?'<span class="mk">['+ar(c.mk)+']</span>':'')+'</div><p class="pqt">'+c.q+'</p>'+body+'<div class="fb"></div></div>';
  }
  function bindCards(el,P){
    $$('.pq',el).forEach(function(card,i){
      var c=P[i], fb=$('.fb',card), left=(c.opts?1:0)+(c.nums?c.nums.length:0);
      function part(){ left--; if(!left) card.classList.add('ok') }
      if(c.opts){
        $$('.sel button',card).forEach(function(b){b.addEventListener('click',function(){
          if(b.classList.contains('locked')) return;
          var o=c.opts[+b.getAttribute('data-j')];
          if(o[1]){b.classList.add('ok-b'); $$('.sel button',card).forEach(function(x){x.classList.add('locked')}); say(fb,'✓ '+c.why,'ok'); part()}
          else{b.classList.add('bad-b','shake','locked'); later(function(){b.classList.remove('shake')},340); say(fb,'راجع السؤال وحاول مرة ثانية','bad')}
        })});
      }
      if(c.nums){
        c.nums.forEach(function(n,j){
          bindNum($('.nin[data-n="p'+i+'_'+j+'"]',card),n.ans,n.tol,function(ok){
            if(ok){ say(fb,'✓ '+n.why,'ok'); part() } else say(fb,'أعد الحساب','bad');
          });
        });
      }
    });
  }
  function grid(P,extra){return '<div class="col grow" style="gap:8px;justify-content:flex-start"><div class="pgrid">'+P.map(cardHTML).join('')+'</div>'+(extra||'')+'</div>'}
  slide({id:'past1',ch:6,title:'امتحانات سابقة (١): تراكيز ومعايرة',tag:'على نمط الامتحان',
   html:function(){return grid(P1,'<div class="sm" style="text-align:center;font-size:18px;color:var(--muted)">الأسئلة من امتحانات الصف العاشر السابقة (٢٠٢٢–٢٠٢٦). رقم السؤال وسنة الامتحان فوق كل بطاقة.</div>')},
   init:function(el){bindCards(el,P1)},
   note:'<ul><li>الإجابات: ٠٫٠٠١ mol و٠٫٠٤ mol/L؛ ٠٫٣٧٥ mol و٠٫٧٥ mol/L؛ ٠٫٢ mol/L؛ ٣٫٠؛ تركيزه معروف بدقة؛ الثانية والثالثة.</li><li>سؤال ٢٠٢٣/٢٠٢٤ (٢٤): النموذج يعتمد أقرب نتيجتين (24.2 و24.5). القاعدة في الكتاب: نتيجتان بفرق لا يزيد عن 0.1 mL، فنكرر إن لم يتحقق ذلك.</li><li>أسئلة أخرى مشابهة في الملف: ترتيب خطوات المعايرة (٢٠٢٢/٢٠٢٣ سؤال ١٥)، وكتابة خطوات المعايرة (٢٠٢٣/٢٠٢٤ دور ثانٍ سؤال ٢٥)، وتبرير استخدام الأدوات (٢٠٢٥/٢٠٢٦ سؤال ٢٢ أ: الماصة لقياس الحجم بدقة، والكاشف لمعرفة نقطة النهاية).</li></ul>'});
  slide({id:'past2',ch:6,title:'امتحانات سابقة (٢): تدريب على نمط الامتحان',tag:'على نمط الامتحان',
   html:function(){return grid(P2,'<div class="sm" style="text-align:center;font-size:18px;color:var(--muted)">هذه الأسئلة مكتوبة على نمط أسئلة الامتحانات (وليست منقولة منها حرفياً).</div>')},
   init:function(el){bindCards(el,P2)},
   note:'<ul><li>الإجابات: ١٠ g/L؛ ٢ g؛ ٠٫٠٨ mol/L؛ الماصة والسحاحة؛ ٤٠ mL؛ تغير لون الكاشف وتكافؤ المولات.</li><li>أسئلة بنمط الامتحان من إعدادي (ليست من ملف الامتحانات الأصلي).</li></ul>'});
})();
