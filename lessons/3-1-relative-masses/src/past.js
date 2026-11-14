/* ---------- exam-style practice: questions taken from past Grade 10 exams on unit 3 ---------- */
(function(){
  var T='direction="ltr" font-family="Cairo,Tajawal,sans-serif" font-weight="800" fill="#f4fbf8" text-anchor="middle" dominant-baseline="central"';
  function tx(x,y,s,fs){return '<text x="'+x+'" y="'+y+'" '+T+' font-size="'+(fs||16)+'">'+s+'</text>'}
  function ion(x,y,r,lab,col,ink){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+col+'" stroke="rgba(0,0,0,.35)" stroke-width="1.6"/><text x="'+x+'" y="'+y+'" '+T.replace('#f4fbf8',ink||'#f4fbf8')+' font-size="'+(r*.62)+'">'+lab+'</text>'}
  function svg(inner){return '<svg viewBox="0 0 240 100" style="width:100%;height:68px" aria-hidden="true">'+inner+'</svg>'}

  /* drawings (simplified, like the exam figures) */
  var PCL5=(function(){var s='',cx=120,cy=50,P=[[120,12],[120,88],[62,30],[62,70],[178,50]]; P.forEach(function(p){s+=bond(cx,cy,p[0],p[1],5)}); P.forEach(function(p){s+=sph(p[0],p[1],14,'Cl',{fs:12})}); s+=ion(cx,cy,19,'P','#E8A33D','#3a2300'); return svg(s)})();
  var MGO=(function(){var s='',r,c; for(r=0;r<2;r++)for(c=0;c<4;c++){var mg=(r+c)%2===0; s+=ion(36+c*56,26+r*48,22,mg?'Mg²⁺':'O²⁻',mg?'#6FA8E4':'#F2B4AE')} return svg(s)})();
  var KNO3=(function(){var s='',r,c; for(r=0;r<2;r++)for(c=0;c<4;c++){var k=(r+c)%2===0; s+=ion(36+c*56,26+r*48,k?19:24,k?'K⁺':'NO₃⁻',k?'#C9A6EE':'#BFE3B4')} return svg(s)})();
  var C3H8=(function(){var s='',C=[[60,56],[120,44],[180,56]],H=[[20,28],[20,76],[60,92],[100,12],[140,12],[180,92],[220,28],[220,76]],pr=[0,0,0,1,1,2,2,2];
    H.forEach(function(h,i){s+=bond(C[pr[i]][0],C[pr[i]][1],h[0],h[1],4)}); s+=bond(C[0][0],C[0][1],C[1][0],C[1][1],5)+bond(C[1][0],C[1][1],C[2][0],C[2][1],5);
    H.forEach(function(h){s+=sph(h[0],h[1],11,'H',{fs:11})}); C.forEach(function(c){s+=sph(c[0],c[1],17,'C',{fs:15})}); return svg(s)})();

  var P1=[
   {yr:'2025/2026 · الدور الثاني',mk:2,q:'الكتلة الفعلية للذرة A هي <span class="num">3.16×10<sup>−23</sup></span> g، ولذرة كربون-12 <span class="num">1.99×10<sup>−23</sup></span> g. استنتج Ar للذرة A.',nums:[{lab:'Ar(A) =',ans:19,tol:0.6,why:'٣٫١٦ ÷ ١٫٩٩ = ١٫٥٨٧ ثم × ١٢ ≈ ١٩'}]},
   {yr:'2022/2023 · الدور الأول',mk:2,q:'كتلة الذرة س <span class="num">3.98×10<sup>−23</sup></span> g وكتلة كربون-12 <span class="num">1.99×10<sup>−23</sup></span> g. ما Ar للذرة س؟',nums:[{lab:'Ar(س) =',ans:24,tol:0.5,why:'النسبة س : C-12 = ٢ : ١ ⇒ ٢ × ١٢ = ٢٤ (Mg)'}]},
   {yr:'2022/2023 · الدور الثاني',mk:1,q:'ما الذرة المستخدمة لمقارنة كتل جميع الذرات الأخرى؟',opts:[['الهيدروجين',0],['الكربون',1],['النيتروجين',0],['الأكسجين',0]],why:'كربون-١٢'},
   {yr:'2022/2023 · الدور الثاني',mk:1,q:'كتلة الذرة القياسية المستخدمة للمقارنة تساوي ______ وحدة كتلة ذرية.',nums:[{lab:'',ans:12,tol:0.01,why:'١٢ و.ك.ذ'}]},
   {yr:'2024/2025 · الدور الأول',mk:2,q:'احسب M<sub>r</sub> لنترات الماغنيسيوم Mg(NO<sub>3</sub>)<sub>2</sub> (Mg = 24, N = 14, O = 16).',nums:[{lab:'M<sub>r</sub> =',ans:148,tol:0.01,why:'٢٤ + ٢×(١٤ + ٤٨) = ١٤٨'}]},
   {yr:'2025/2026 · الدور الأول',mk:1,q:'احسب M<sub>r</sub> للمركب BaCl<sub>2</sub>·2H<sub>2</sub>O (Ba = 137, Cl = 35.5, H = 1, O = 16).',nums:[{lab:'M<sub>r</sub> =',ans:244,tol:0.01,why:'١٣٧ + ٧١ + (٢×١٨) = ٢٤٤'}]}
  ];
  var P2=[
   {yr:'2024/2025 · الدور الأول',mk:1,q:'اكتب صيغة المركب A من النموذج.',art:PCL5,opts:[['PCl<sub>3</sub>',0],['PCl<sub>5</sub>',1],['P<sub>5</sub>Cl',0]],why:'ذرة P واحدة و٥ ذرات Cl'},
   {yr:'2024/2025 · الدور الأول',mk:1,q:'اكتب صيغة المركب B (تركيب أيوني ضخم).',art:MGO,opts:[['Mg<sub>4</sub>O<sub>4</sub>',0],['MgO',1],['MgO<sub>2</sub>',0]],why:'٤ : ٤ تتبسّط إلى ١ : ١'},
   {yr:'2023/2024 · الدور الثاني',mk:1,q:'ما صيغة المركب في الشكل؟',art:KNO3,opts:[['K<sub>2</sub>NO<sub>3</sub>',0],['K(NO<sub>3</sub>)<sub>2</sub>',0],['KNO<sub>3</sub>',1]],why:'K⁺ واحد مقابل NO₃⁻ واحد'},
   {yr:'2022/2023 · الدور الأول',mk:2,q:'المركب A فيه ٣ ذرات C و٨ ذرات H. احسب كتلة صيغته النسبية (C = 12, H = 1).',art:C3H8,nums:[{lab:'M<sub>r</sub> (C<sub>3</sub>H<sub>8</sub>) =',ans:44,tol:0.01,why:'٣×١٢ + ٨×١ = ٤٤'}]},
   {yr:'2023/2024 · الدور الثاني',mk:2,q:'احسب الكتلة الجزيئية النسبية (C = 12, H = 1, B = 11, F = 19):',nums:[{lab:'C<sub>2</sub>H<sub>6</sub> =',ans:30,tol:0.01,why:'٢٤ + ٦ = ٣٠'},{lab:'BF<sub>3</sub> =',ans:68,tol:0.01,why:'١١ + ٥٧ = ٦٨'}]},
   {yr:'2024/2025 · الدور الأول',mk:2,q:'البيريت FeX<sub>2</sub> كتلته النسبية M<sub>r</sub> = 120 (Fe = 56). ما Ar للعنصر X؟',nums:[{lab:'Ar(X) =',ans:32,tol:0.01,why:'١٢٠ = ٥٦ + ٢X ⇒ X = ٣٢ ⇒ الكبريت S'}]}
  ];

  function cardHTML(c,i){
    var body='';
    if(c.art) body+=c.art;
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

  /* end-of-unit question 1 (student book p.78): the ammonium sulfate fertiliser */
  /* a verbal equation always starts from the RIGHT: reactants on the right, the arrow pointing left, products on the left (forced right-to-left, so no browser can flip it) */
  function veq(a,b){ return '<span dir="rtl" style="unicode-bidi:isolate"><bdi dir="rtl">'+a+'</bdi> ← <bdi dir="rtl">'+b+'</bdi></span>' }
  slide({id:'eou1',ch:6,title:'سؤال نهاية الوحدة ١',tag:'كتاب الطالب ص٧٨',
   html:function(){
    function row(lab,id,unit){return '<div class="frm brk" style="padding:8px 14px;gap:4px"><div style="font-size:21px;line-height:1.35">'+lab+'</div><div style="display:flex;align-items:center;gap:10px">'+ninHTML(id,unit,'sm')+'<div class="fb" style="flex:1;min-height:22px;font-size:18px"></div></div></div>'}
    return '<div class="col grow" style="gap:8px;justify-content:flex-start">'+
     '<div class="frm brk" style="padding:8px 18px;gap:2px;align-items:center"><p class="lead" style="margin:0;font-size:21px">تبيّن المعادلة كيف يُصنع سماد كبريتات الأمونيوم:</p><div class="bigeq" style="font-size:30px;color:var(--gold)">2NH<sub>3</sub>(aq) + H<sub>2</sub>SO<sub>4</sub>(aq) → (NH<sub>4</sub>)<sub>2</sub>SO<sub>4</sub>(aq)</div></div>'+
     '<div style="display:flex;gap:12px;flex:1;align-items:flex-start">'+
      '<div class="frm brk" id="eoa" style="flex:1;padding:10px 14px;gap:6px"><div style="font-size:21px;font-weight:800">أ. اكتب المعادلة اللفظية لهذا التفاعل</div>'+optsHTML([{t:veq('الأمونيا + حمض الكبريتيك','كبريتات الأمونيوم')},{t:veq('كبريتات الأمونيوم + حمض الكبريتيك','الأمونيا')},{t:veq('الأمونيا + كبريتات الأمونيوم','حمض الكبريتيك')}])+'<div class="fb fa" style="min-height:22px;font-size:18px"></div></div>'+
      '<div class="col" style="flex:1;gap:6px">'+
       row('ب. كم عدد ذرات الهيدروجين في صيغة كبريتات الأمونيوم <span class="num">(NH<sub>4</sub>)<sub>2</sub>SO<sub>4</sub></span>؟','b','ذرة')+
       row('ج. احسب M<sub>r</sub> لحمض الكبريتيك <span class="num">H<sub>2</sub>SO<sub>4</sub></span> <span class="num">(H = 1, S = 32, O = 16)</span>','c','g/mol')+
       row('د. كل <span class="num">17 g</span> من الأمونيا تنتج <span class="num">66 g</span> من كبريتات الأمونيوم. كم تنتج <span class="num">3.4 g</span> من الأمونيا؟','d','g')+
      '</div></div></div>';
   },
   init:function(el){
    var fa=$('.fa',el), left=4;
    $$('.opt',el).forEach(function(b){ b.style.minHeight='46px'; b.style.fontSize='21px'; b.style.padding='4px 14px' });
    function one(){ left--; if(!left) say(fa,'✓ أحسنت! أكملت السؤال ١ كاملاً','ok') }
    bindMcq($('#eoa',el),[{ok:true,why:'الأمونيا وحمض الكبريتيك متفاعلان وكبريتات الأمونيوم ناتج'},{why:'المتفاعلات على اليمين والناتج بعد السهم'},{why:'المتفاعلان هما الأمونيا وحمض الكبريتيك'}],fa,one);
    [['b',8,0.01,'✓ العدد 2 × 4 = 8 ذرات H','(NH₄)₂ تعني مجموعتين فيهما 4 ذرات H لكل منهما'],['c',98,0.01,'✓ \u2066(2 × 1) + 32 + (4 × 16) = 98\u2069','اجمع: 2 H + S + 4 O'],['d',13.2,0.15,'✓ \u20663.4 ÷ 34 × 132 = 13.2 g\u2069','الأمونيا 2 × 17 = 34 g تعطي 2 × 66 = 132 g؛ أو 3.4 ÷ 17 × 66']].forEach(function(q){
      var box=$('.nin[data-n="'+q[0]+'"]',el), fb=$('.fb',box.parentNode);
      bindNum(box,q[1],q[2],function(ok){ if(ok){ say(fb,q[3],'ok'); one() } else say(fb,q[4],'bad') });
    });
   },
   note:'<ul><li>كتاب الطالب ص٧٨، أسئلة نهاية الوحدة، السؤال ١ (واجب دليل المعلم للدرس ٣-١، ص٥٤). إجابات الدليل (ص٧٥): (أ) الأمونيا + حمض الكبريتيك ← كبريتات الأمونيوم، (ب) ٨، (ج) ٩٨ g/mol، (د) ١٣٫٢ g.</li><li>في (د) نسبة الكتل 17 : 66 تعني أن 34 g من الأمونيا (2 mol) تعطي 132 g (Mr لكبريتات الأمونيوم = 132)، ومنها 3.4 g تعطي 13.2 g. هذه أول لمحة عن حسابات الكتل في المعادلات (الدرس ٣-٣).</li><li>خطأ متوقع في (ب): عدّ 4 ذرات فقط ونسيان العدد 2 خارج القوس.</li></ul>'});
  slide({id:'past1',ch:6,title:'امتحانات سابقة (١): الكتل النسبية',tag:'على نمط الامتحان',
   html:function(){return grid(P1)},
   init:function(el){bindCards(el,P1)},
   note:'<ul><li>الأسئلة من امتحانات الصف العاشر السابقة للوحدة الثالثة (٢٠٢٢–٢٠٢٦)، والأرقام بين [ ] هي الدرجات.</li><li>الإجابات: ١٩، ٢٤، الكربون، ١٢، ١٤٨، ٢٤٤.</li><li>في امتحان الدور الثاني ٢٠٢٥/٢٠٢٦ يُطلب Ar من نسبة الكتل مع C-12 (الطريقة الثانية).</li></ul>'});

  slide({id:'past2',ch:6,title:'امتحانات سابقة (٢): الصيغ و M<sub>r</sub>',tag:'على نمط الامتحان',
   html:function(){return grid(P2,'<div class="sm" style="text-align:center;font-size:18px;color:var(--muted)">انتبه: في امتحان ٢٠٢٣/٢٠٢٤ أُعطي Mg = 24.31 فكان M<sub>r</sub>(MgO) = 40.31. استخدم دائماً قيم Ar المعطاة في السؤال.</div>')},
   init:function(el){bindCards(el,P2)},
   note:'<ul><li>الإجابات: PCl₅، MgO، KNO₃، ٤٤، (٣٠ و٦٨)، ٣٢ (الكبريت).</li><li>الرسوم مبسّطة ومعادة رسمها، وليست صور الامتحان نفسها.</li><li>إذا أعطى الامتحان Ar بقيم غير الكتاب (مثل Mg = 24.31) فالجواب يتبع القيم المعطاة.</li></ul>'});
})();
