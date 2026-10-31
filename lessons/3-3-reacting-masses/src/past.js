/* ---------- exam practice: the first slide uses real past-paper items on formulas, limiting reactants and masses, the second is written in the same style ---------- */
(function(){
  var P1=[
   {yr:'2022/2023 · الدور الأول',q:'ما المقصود بالمادة المحددة للتفاعل؟',opts:[['المادة المتفاعلة التي تنتهي أولاً وتحدد كمية الناتج',1],['المادة التي يبقى منها جزء بعد التفاعل',0],['المادة الناتجة بكمية أقل',0]],why:'المادة المحددة تنتهي أولاً فتحدد كمية الناتج'},
   {yr:'2023/2024 · الدور الأول (سؤال ٢٢)',q:'استنتج الصيغة الكيميائية لمركب يحتوي على <span class="num">32.5 g</span> من الأكسجين و<span class="num">14.45 g</span> من النيتروجين (N = 14, O = 16).',nums:[{lab:'n(N) =',ans:1.03,tol:0.02,why:'14.45 ÷ 14 = 1.03 mol'},{lab:'n(O) =',ans:2.03,tol:0.03,why:'32.5 ÷ 16 = 2.03 mol'}],opts:[['NO',0],['<span class="num">NO<sub>2</sub></span>',1],['<span class="num">N<sub>2</sub>O</span>',0]],why:'النسبة 1 : 2 ← NO₂'},
   {yr:'2025/2026 · الدور الأول (سؤال ١٩)',mk:3,q:'احسب كتلة أكسيد الحديد (III) <span class="num">Fe<sub>2</sub>O<sub>3</sub></span> اللازمة لإنتاج <span class="num">100 g</span> من الحديد: <span class="num">Fe<sub>2</sub>O<sub>3</sub> + 3CO → 2Fe + 3CO<sub>2</sub></span> (Fe = 56, O = 16).',nums:[{lab:'n(Fe) =',ans:1.78,tol:0.02,why:'100 ÷ 56 = 1.78 mol'},{lab:'n(Fe₂O₃) =',ans:0.89,tol:0.01,why:'1.78 ÷ 2 = 0.89 mol'},{lab:'m =',ans:142.6,tol:1.5,why:'0.89 × 160 ≈ 142.4 g (والدقيق 142.86 g، وكلاهما مقبول)'}]},
   {yr:'2023/2024 · الدور الثاني (سؤال ٢٢)',q:'احسب عدد مولات النحاس إذا كانت كتلته <span class="num">2.5 g</span> (Cu = 63.5).',nums:[{lab:'n =',ans:0.0394,tol:0.0007,why:'2.5 ÷ 63.5 = 0.039 mol'}]},
   {yr:'2023/2024 · الدور الثاني (سؤال ٢٣)',q:'<span class="num">2Cu + O<sub>2</sub> → 2CuO</span>. احسب كتلة أكسيد النحاس الناتجة إذا كان عدد مولاته <span class="num">0.039 mol</span> (Cu = 63.5, O = 16).',nums:[{lab:'m =',ans:3.1,tol:0.05,why:'0.039 × 79.5 = 3.1 g'}]},
   {yr:'2023/2024 · الدور الثاني (سؤال ٢٤)',q:'في التفاعل <span class="num">2Cu + O<sub>2</sub> → 2CuO</span> تنبأ بالمادة المحددة والفائضة، علماً بأن عدد مولات Cu = 0.039 mol وعدد مولات O<sub>2</sub> = 2 mol.',opts:[['المحددة Cu والفائضة O₂',1],['المحددة O₂ والفائضة Cu',0]],why:'Cu: 0.039 ÷ 2 = 0.0195 أقل من O₂: 2 ÷ 1 = 2'}
  ];
  var P2=[
   {yr:'على نمط الامتحان',mk:1,q:'المادة الفائضة في التفاعل هي:',opts:[['المادة التي يبقى منها جزء بعد انتهاء التفاعل',1],['المادة التي تنتهي أولاً',0],['المادة التي تحدد كمية الناتج',0]],why:'الفائضة يبقى منها جزء'},
   {yr:'على نمط الامتحان',mk:3,q:'استنتج صيغة مركب يحتوي على <span class="num">7.8 g</span> من البوتاسيوم و<span class="num">1.6 g</span> من الأكسجين (K = 39, O = 16).',nums:[{lab:'n(K) =',ans:0.2,tol:0.004,why:'7.8 ÷ 39 = 0.2 mol'},{lab:'n(O) =',ans:0.1,tol:0.002,why:'1.6 ÷ 16 = 0.1 mol'}],opts:[['KO',0],['<span class="num">K<sub>2</sub>O</span>',1],['<span class="num">KO<sub>2</sub></span>',0]],why:'النسبة 2 : 1 ← K₂O'},
   {yr:'على نمط الامتحان',mk:2,q:'<span class="num">2Mg + O<sub>2</sub> → 2MgO</span>. احسب كتلة MgO الناتجة من <span class="num">6 g</span> من Mg (Mg = 24, O = 16).',nums:[{lab:'m =',ans:10,tol:0.1,why:'6 ÷ 24 = 0.25 mol ← 0.25 × 40 = 10 g'}]},
   {yr:'على نمط الامتحان',mk:1,q:'<span class="num">N<sub>2</sub> + 3H<sub>2</sub> → 2NH<sub>3</sub></span>. لديك 0.5 mol من N<sub>2</sub> و0.9 mol من H<sub>2</sub>. المادة المحددة:',opts:[['N₂',0],['H₂',1]],why:'N₂: 0.5 ÷ 1 = 0.5 ، H₂: 0.9 ÷ 3 = 0.3 ← الأقل H₂'},
   {yr:'على نمط الامتحان',mk:2,q:'<span class="num">Fe + S → FeS</span>. تفاعل <span class="num">2.8 g</span> من Fe مع <span class="num">3.2 g</span> من S. احسب كتلة S المتبقية (Fe = 56, S = 32).',nums:[{lab:'m =',ans:1.6,tol:0.03,why:'n(Fe) = 0.05 ← S المتفاعل 1.6 g ← يبقى 3.2 − 1.6 = 1.6 g'}]},
   {yr:'على نمط الامتحان',mk:1,q:'في <span class="num">Fe<sub>2</sub>O<sub>3</sub> + 3CO → 2Fe + 3CO<sub>2</sub></span> النسبة بين مولات Fe<sub>2</sub>O<sub>3</sub> ومولات Fe:',opts:[['1 : 2',1],['2 : 1',0],['1 : 3',0]],why:'المعاملان 1 و 2'}
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
  slide({id:'past1',ch:7,title:'امتحانات سابقة (١): الصيغة والمحددة والكتلة',tag:'على نمط الامتحان',
   html:function(){return grid(P1,'<div class="sm" style="text-align:center;font-size:18px;color:var(--muted)">الأسئلة من امتحانات الصف العاشر السابقة (٢٠٢٢–٢٠٢٦). سؤال ١٩ هو الذي بدأناه في الدرس ٣-٢.</div>')},
   init:function(el){bindCards(el,P1)},
   note:'<ul><li>الإجابات: المادة التي تنتهي أولاً؛ ١٫٠٣ و٢٫٠٣ ثم NO₂؛ ١٫٧٨ ثم ٠٫٨٩ ثم ١٤٢٫٤ g؛ ٠٫٠٣٩ mol؛ ٣٫١ g؛ المحددة Cu والفائضة O₂.</li><li>سؤال ٢٤ (٢٠٢٣/٢٠٢٤ الدور الثاني) في نموذج الإجابة: المحددة النحاس والفائضة الأكسجين؛ وصياغته هنا مختصرة لتوضيح الكميات.</li><li>سؤال ١٩ (٢٠٢٥/٢٠٢٦ الدور الأول): نموذج الإجابة ١٫٧٨ mol ثم ٠٫٨٩ mol ثم ١٤٢٫٤ g (نقبل ١٤٢ إلى ١٤٤).</li></ul>'});
  slide({id:'past2',ch:7,title:'امتحانات سابقة (٢): تدريب على نمط الامتحان',tag:'على نمط الامتحان',
   html:function(){return grid(P2,'<div class="sm" style="text-align:center;font-size:18px;color:var(--muted)">هذه الأسئلة مكتوبة على نمط أسئلة الامتحانات (وليست منقولة منها حرفياً). استخدم القيم الذرية المعطاة في كل سؤال.</div>')},
   init:function(el){bindCards(el,P2)},
   note:'<ul><li>الإجابات: الفائضة يبقى منها جزء؛ ٠٫٢ و٠٫١ ثم K₂O؛ ١٠ g؛ H₂؛ ١٫٦ g؛ ١ : ٢.</li><li>أسئلة بنمط الامتحان من إعدادي (ليست من ملف الامتحانات الأصلي).</li></ul>'});
})();
