/* ---------- exam practice: the first slide uses real past-paper items on gas volumes, the second is written in the same style ---------- */
(function(){
  var P1=[
   {yr:'2025/2026 · الدور الأول (سؤال ٢٣)',mk:1,q:'<span class="num">2CO(g) + O<sub>2</sub>(g) → 2CO<sub>2</sub>(g)</span>. في بداية التفاعل: <span class="num">25 mL</span> من CO و<span class="num">10 mL</span> من O<sub>2</sub>. وفي نهايته: <span class="num">0 mL</span> من O<sub>2</sub> و<span class="num">20 mL</span> من CO<sub>2</sub>. استنتج حسابياً حجم الغاز الذي لم يتفاعل.',nums:[{lab:'V =',ans:5,tol:0.1,why:'تكوّن 20 mL من CO₂ فتفاعل 20 mL من CO: 25 − 20 = 5 mL من CO'}]},
   {yr:'2022/2023 · الدور الأول (صباحي، سؤال ١٢)',mk:4,q:'أُضيف <span class="num">0.4 g</span> من الصوديوم إلى فائض من الماء: <span class="num">2Na + 2H<sub>2</sub>O → 2NaOH + H<sub>2</sub></span>. احسب حجم H<sub>2</sub> الناتج عند درجة حرارة الغرفة والضغط القياسي بوحدة mL <span class="num">(Na = 23)</span>.',nums:[{lab:'V =',ans:208.7,tol:2.5,why:'n(Na) = 0.4 ÷ 23 = 0.0174 mol ← n(H₂) = 0.0174 ÷ 2 = 0.0087 mol ← × 24000 ≈ 209 mL'}]},
   {yr:'2022/2023 · الدور الأول (مسائي)',mk:4,q:'<span class="num">Zn + 2HCl → ZnCl<sub>2</sub> + H<sub>2</sub></span>. كان حجم H<sub>2</sub> الناتج في نهاية التجربة <span class="num">750 mL</span>. احسب كتلة الخارصين المستخدمة <span class="num">(Zn = 65)</span>.',nums:[{lab:'m =',ans:2.03,tol:0.03,why:'n(H₂) = 750 ÷ 24000 = 0.03125 mol = n(Zn) ← × 65 = 2.03 g'}]},
   {yr:'2022/2023 · الدور الثاني',mk:1,q:'قراءات حجم H<sub>2</sub> في ثلاث تجارب (شريط Mg طوله 10 cm مع حمض فائض): <span class="num">497</span> و<span class="num">503</span> و<span class="num">500</span> mL. احسب المتوسط.',nums:[{lab:'V =',ans:500,tol:0.5,why:'(497 + 503 + 500) ÷ 3 = 500 mL'}]},
   {yr:'2022/2023 · الدور الثاني',mk:4,q:'احسب كتلة شريط الماغنيسيوم المستخدم بالغرام إذا كان متوسط حجم H<sub>2</sub> <span class="num">500 mL</span> <span class="num">(Mg = 24)</span>.',nums:[{lab:'m =',ans:0.5,tol:0.01,why:'n(H₂) = 500 ÷ 24000 = 0.0208 mol = n(Mg) ← × 24 = 0.5 g'}]},
   {yr:'2022/2023 · الدور الثاني',mk:1,q:'وضّح أهمية عدم وجود فقاعات هواء في المخبار المقلوب قبل بدء التجربة.',opts:[['حتى لا يُحسب الهواء ضمن حجم الغاز',1],['حتى يتفاعل الشريط أسرع',0],['حتى لا يسخن الحمض',0]],why:'وجود الهواء يزيد من حجم الغاز المقيس'}
  ];
  var P2=[
   {yr:'على نمط الامتحان',mk:1,q:'الحجمان المتساويان من غازين مختلفين، عند درجة الحرارة والضغط نفسيهما، يحتويان على:',opts:[['العدد نفسه من الجزيئات',1],['الكتلة نفسها',0],['العدد نفسه من الذرات',0]],why:'قانون أفوجادرو'},
   {yr:'على نمط الامتحان',mk:1,q:'احسب حجم <span class="num">0.25 mol</span> من غاز الأمونيا NH<sub>3</sub> عند درجة حرارة الغرفة والضغط القياسي بوحدة L.',nums:[{lab:'V =',ans:6,tol:0.1,why:'0.25 × 24 = 6 L'}]},
   {yr:'على نمط الامتحان',mk:1,q:'كم مولاً من غاز CO<sub>2</sub> في <span class="num">2.4 L</span> منه عند درجة حرارة الغرفة والضغط القياسي؟',nums:[{lab:'n =',ans:0.1,tol:0.001,why:'2.4 ÷ 24 = 0.1 mol'}]},
   {yr:'على نمط الامتحان',mk:2,q:'<span class="num">N<sub>2</sub> + 3H<sub>2</sub> → 2NH<sub>3</sub></span>. تفاعل <span class="num">10 mL</span> من N<sub>2</sub> مع كمية كافية من H<sub>2</sub>. احسب حجم H<sub>2</sub> المتفاعل وحجم NH<sub>3</sub> الناتج (mL).',nums:[{lab:'H₂ =',ans:30,tol:0.3,why:'10 × 3 = 30 mL'},{lab:'NH₃ =',ans:20,tol:0.2,why:'10 × 2 = 20 mL'}]},
   {yr:'على نمط الامتحان',mk:3,q:'<span class="num">Mg + 2HCl → MgCl<sub>2</sub> + H<sub>2</sub></span>. احسب حجم H<sub>2</sub> بوحدة mL الناتج من <span class="num">0.6 g</span> من Mg مع حمض فائض <span class="num">(Mg = 24)</span>.',nums:[{lab:'V =',ans:600,tol:6,why:'n(Mg) = 0.6 ÷ 24 = 0.025 mol = n(H₂) ← × 24000 = 600 mL'}]},
   {yr:'على نمط الامتحان',mk:1,q:'في التفاعل <span class="num">2CO + O<sub>2</sub> → 2CO<sub>2</sub></span> يتفاعل <span class="num">20 mL</span> من CO مع كمية كافية من O<sub>2</sub>. حجم CO<sub>2</sub> الناتج:',opts:[['20 mL',1],['40 mL',0],['10 mL',0]],why:'النسبة 2 : 2 أي 1 : 1 فالحجم نفسه'}
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
  slide({id:'past1',ch:6,title:'امتحانات سابقة (١): حجوم الغازات',tag:'على نمط الامتحان',
   html:function(){return grid(P1,'<div class="sm" style="text-align:center;font-size:18px;color:var(--muted)">الأسئلة من امتحانات الصف العاشر السابقة (٢٠٢٢–٢٠٢٦). رقم الأسئلة وسنة الامتحان فوق كل بطاقة.</div>')},
   init:function(el){bindCards(el,P1)},
   note:'<ul><li>الإجابات: ٥ mL؛ ٢٠٩ mL (تقريباً)؛ ٢٫٠٣ g؛ ٥٠٠ mL؛ ٠٫٥ g؛ حتى لا يُحسب الهواء ضمن حجم الغاز.</li><li><b>تصحيح مهم:</b> نموذج الإجابة في ملف الامتحانات لسؤال ٢٠٢٢/٢٠٢٣ (الدور الأول، صباحي، سؤال ١٢ ب) كتب n(H₂) = 2n(Na) = 0.0348 mol وحجماً 835 mL. هذا خطأ في الحساب: من المعادلة 2Na : 1 H₂ فيكون n(H₂) = n(Na) ÷ 2 = 0.0087 mol، والحجم ≈ 209 mL. اعتمدنا القيمة الصحيحة (وتتفق مع إجابة سؤال ٣-١٥ في الكتاب لنفس النوع من المسائل).</li><li>سؤال الزنك (مسائي): المعادلة المكتوبة هنا Zn + 2HCl لإكمال السؤال؛ النسبة 1 : 1 مع أي حمض.</li><li>الدور الثاني: النتائج 497 و503 و500 mL، المتوسط 500 mL، كتلة Mg = 0.5 g.</li></ul>'});
  slide({id:'past2',ch:6,title:'امتحانات سابقة (٢): تدريب على نمط الامتحان',tag:'على نمط الامتحان',
   html:function(){return grid(P2,'<div class="sm" style="text-align:center;font-size:18px;color:var(--muted)">هذه الأسئلة مكتوبة على نمط أسئلة الامتحانات (وليست منقولة منها حرفياً). الحجم المولي 24 L/mol.</div>')},
   init:function(el){bindCards(el,P2)},
   note:'<ul><li>الإجابات: العدد نفسه من الجزيئات؛ ٦ L؛ ٠٫١ mol؛ ٣٠ mL و٢٠ mL؛ ٦٠٠ mL؛ ٢٠ mL.</li><li>أسئلة بنمط الامتحان من إعدادي (ليست من ملف الامتحانات الأصلي).</li></ul>'});
})();
