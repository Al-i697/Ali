/* ---------- exam-style practice: the first slide uses real past-paper items on the mole, the second is written in the same style ---------- */
(function(){
  var P1=[
   {yr:'2025/2026 · الدور الأول',mk:1,q:'ما المصطلح الذي يعبّر عن كمية من مادة تحتوي على <span class="num">6.02×10<sup>23</sup></span> ذرة أو جزيء أو وحدة صيغة (وفقاً لطبيعتها)؟',opts:[['كتلة الصيغة النسبية',0],['الكتلة الذرية النسبية',0],['المول',1],['ثابت أفوجادرو',0]],why:'المول'},
   {yr:'2025/2026 · الدور الأول (من سؤال ١٩)',mk:1,q:'يُستخدم أكسيد الحديد (III) لإنتاج <span class="num">100 g</span> من الحديد. احسب عدد مولات الحديد (Fe = 56).',nums:[{lab:'n(Fe) =',ans:1.78,tol:0.02,why:'100 ÷ 56 = 1.78 mol'}]},
   {yr:'2025/2026 · الدور الأول (من سؤال ١٩)',mk:1,q:'احسب الكتلة المولية لأكسيد الحديد (III) <span class="num">Fe<sub>2</sub>O<sub>3</sub></span> (Fe = 56, O = 16).',nums:[{lab:'M =',ans:160,tol:0.5,why:'(2 × 56) + (3 × 16) = 160 g/mol'}]},
   {yr:'2022/2023 · الدور الأول (مسائي)',mk:1,q:'عدد مولات الخارصين Zn الناتجة <span class="num">0.031 mol</span>. احسب كتلة Zn بالجرام (Zn = 65).',nums:[{lab:'m =',ans:2.03,tol:0.03,why:'0.031 × 65 ≈ 2.0 g (مفتاح الامتحان: 2.03 g ويقبل 2.0 g)'}]},
   {yr:'2022/2023 · الدور الثاني',mk:1,q:'عدد مولات الماغنيسيوم <span class="num">0.021 mol</span>. احسب كتلته بالجرام (Mg = 24).',nums:[{lab:'m =',ans:0.504,tol:0.006,why:'0.021 × 24 = 0.504 g'}]}
  ];
  var P2=[
   {yr:'على نمط الامتحان',mk:1,q:'ما المصطلح الذي يعبّر عن كتلة مول واحد من مادة بوحدة g/mol؟',opts:[['الكتلة المولية',1],['ثابت أفوجادرو',0],['الكتلة الذرية النسبية',0]],why:'الكتلة المولية'},
   {yr:'على نمط الامتحان',mk:1,q:'عدد جزيئات الماء في <span class="num">1 mol</span> من الماء:',opts:[['18',0],['<span class="num">6.02×10<sup>23</sup></span>',1],['<span class="num">6.02×10<sup>23</sup> g</span>',0]],why:'المول الواحد يحتوي على عدد أفوجادرو من الجسيمات'},
   {yr:'على نمط الامتحان',mk:2,q:'احسب كتلة <span class="num">0.25 mol</span> من كربونات الكالسيوم <span class="num">CaCO<sub>3</sub></span> (Ca = 40, C = 12, O = 16).',nums:[{lab:'m =',ans:25,tol:0.2,why:'M = 100 ، 0.25 × 100 = 25 g'}]},
   {yr:'على نمط الامتحان',mk:2,q:'احسب عدد مولات <span class="num">9.8 g</span> من حمض الكبريتيك <span class="num">H<sub>2</sub>SO<sub>4</sub></span> (H = 1, S = 32, O = 16).',nums:[{lab:'n =',ans:0.1,tol:0.002,why:'M = 98 ، 9.8 ÷ 98 = 0.1 mol'}]},
   {yr:'على نمط الامتحان',mk:2,q:'احسب عدد جزيئات <span class="num">2 mol</span> من الماء (اكتب المعامل فقط من الصيغة <span class="num">a × 10<sup>24</sup></span>).',nums:[{lab:'a =',ans:1.204,tol:0.01,why:'2 × 6.02×10²³ = 1.204×10²⁴'}]},
   {yr:'على نمط الامتحان',mk:1,q:'عدد الذرات في <span class="num">1 mol</span> من الحديد Fe مقارنة بعدد الذرات في <span class="num">1 mol</span> من الكربون C:',opts:[['أكبر',0],['متساوٍ',1],['أقل',0]],why:'كلاهما 6.02×10²³ ذرة'}
  ];
  function cardHTML(c,i){
    var body='';
    if(c.opts) body+='<div class="sel">'+c.opts.map(function(o,j){return '<button type="button" data-j="'+j+'" style="min-height:42px;font-size:21px;padding:0 12px">'+o[0]+'</button>'}).join('')+'</div>';
    if(c.nums) body+=c.nums.map(function(n,j){return '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="eq" style="font-size:22px">'+n.lab+'</span>'+ninHTML('p'+i+'_'+j,'','sm')+'</div>'}).join('');
    return '<div class="pq" data-i="'+i+'"><div class="pqh"><span class="yr">'+c.yr+'</span><span class="mk">['+ar(c.mk)+']</span></div><p class="pqt">'+c.q+'</p>'+body+'<div class="fb"></div></div>';
  }
  function bindCards(el,P){
    $$('.pq',el).forEach(function(card,i){
      var c=P[i], fb=$('.fb',card);
      if(c.opts){
        $$('.sel button',card).forEach(function(b){b.addEventListener('click',function(){
          if(b.classList.contains('locked')) return;
          var o=c.opts[+b.getAttribute('data-j')];
          if(o[1]){b.classList.add('ok-b'); $$('.sel button',card).forEach(function(x){x.classList.add('locked')}); card.classList.add('ok'); say(fb,'✓ '+c.why,'ok')}
          else{b.classList.add('bad-b','shake','locked'); later(function(){b.classList.remove('shake')},340); say(fb,'راجع السؤال وحاول مرة ثانية','bad')}
        })});
      }
      if(c.nums){
        var left=c.nums.length;
        c.nums.forEach(function(n,j){
          bindNum($('.nin[data-n="p'+i+'_'+j+'"]',card),n.ans,n.tol,function(ok){
            if(ok){ left--; say(fb,'✓ '+n.why,'ok'); if(!left) card.classList.add('ok') } else say(fb,'أعد الحساب','bad');
          });
        });
      }
    });
  }
  function grid(P,extra){return '<div class="col grow" style="gap:8px;justify-content:flex-start"><div class="pgrid">'+P.map(cardHTML).join('')+'</div>'+(extra||'')+'</div>'}
  slide({id:'past1',ch:6,title:'امتحانات سابقة (١): المول',tag:'على نمط الامتحان',
   html:function(){return grid(P1,'<div class="sm" style="text-align:center;font-size:18px;color:var(--muted)">الأسئلة من امتحانات الصف العاشر السابقة (٢٠٢٢–٢٠٢٦)؛ الأسئلة ٢ و٣ جزء من سؤال ١٩ الذي يكتمل في الدرس ٣-٣.</div>')},
   init:function(el){bindCards(el,P1)},
   note:'<ul><li>الإجابات: المول، ١٫٧٨ mol، ١٦٠ g/mol، ٢٫٠٣ g، ٠٫٥٠٤ g.</li><li>سؤال ١٩ (٢٠٢٥/٢٠٢٦ الدور الأول) كاملاً يطلب كتلة Fe₂O₃ اللازمة لإنتاج ١٠٠ g من Fe؛ أخذنا خطوتيه الأوليين (المول والكتلة المولية)، والباقي في ٣-٣.</li><li>الجزئيتان الأخيرتان مأخوذتان من خطوات حل سؤالين عن غاز الهيدروجين (٢٠٢٢/٢٠٢٣): في الامتحان يُعطى العدد بعد حساب حجم الغاز، وهنا نعطيه مباشرة.</li></ul>'});
  slide({id:'past2',ch:6,title:'امتحانات سابقة (٢): تدريب على نمط الامتحان',tag:'على نمط الامتحان',
   html:function(){return grid(P2,'<div class="sm" style="text-align:center;font-size:18px;color:var(--muted)">هذه الأسئلة مكتوبة على نمط أسئلة الامتحانات (وليست منقولة منها حرفياً). استخدم القيم الذرية المعطاة في كل سؤال.</div>')},
   init:function(el){bindCards(el,P2)},
   note:'<ul><li>الإجابات: الكتلة المولية، 6.02×10²³، ٢٥ g، ٠٫١ mol، 1.204 (×10²⁴)، متساوٍ.</li><li>أسئلة بنمط الامتحان من إعدادي (ليست من ملف الامتحانات الأصلي).</li></ul>'});
})();
