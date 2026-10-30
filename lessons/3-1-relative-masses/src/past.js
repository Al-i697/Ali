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

  slide({id:'past1',ch:6,title:'امتحانات سابقة (١): الكتل النسبية',tag:'على نمط الامتحان',
   html:function(){return grid(P1)},
   init:function(el){bindCards(el,P1)},
   note:'<ul><li>الأسئلة من امتحانات الصف العاشر السابقة للوحدة الثالثة (٢٠٢٢–٢٠٢٦)، والأرقام بين [ ] هي الدرجات.</li><li>الإجابات: ١٩، ٢٤، الكربون، ١٢، ١٤٨، ٢٤٤.</li><li>في امتحان الدور الثاني ٢٠٢٥/٢٠٢٦ يُطلب Ar من نسبة الكتل مع C-12 (الطريقة الثانية).</li></ul>'});

  slide({id:'past2',ch:6,title:'امتحانات سابقة (٢): الصيغ و M<sub>r</sub>',tag:'على نمط الامتحان',
   html:function(){return grid(P2,'<div class="sm" style="text-align:center;font-size:18px;color:var(--muted)">انتبه: في امتحان ٢٠٢٣/٢٠٢٤ أُعطي Mg = 24.31 فكان M<sub>r</sub>(MgO) = 40.31. استخدم دائماً قيم Ar المعطاة في السؤال.</div>')},
   init:function(el){bindCards(el,P2)},
   note:'<ul><li>الإجابات: PCl₅، MgO، KNO₃، ٤٤، (٣٠ و٦٨)، ٣٢ (الكبريت).</li><li>الرسوم مبسّطة ومعادة رسمها، وليست صور الامتحان نفسها.</li><li>إذا أعطى الامتحان Ar بقيم غير الكتاب (مثل Mg = 24.31) فالجواب يتبع القيم المعطاة.</li></ul>'});
})();
