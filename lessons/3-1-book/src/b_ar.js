/* ---------- relative atomic mass Ar (book pp. 53-55) ---------- */

/* 5 atom components: tap the part that carries the mass */
slide({id:'parts',ch:2,title:'أين تتركّز كتلة الذرّة؟',tag:'اضغط على الجواب',
 html:function(){
  var E=[[40.1,11.1],[95.6,24.6],[58.7,27.2],[10.3,54.7],[79.0,73.5],[38.1,73.6],[58.5,97.3]];
  var spots=E.map(function(e){return '<div class="spot" data-p="e" style="left:'+(e[0]-6)+'%;top:'+(e[1]-6)+'%;width:12%;height:12%"></div>'}).join('')+'<div class="spot" data-p="nuc" style="left:41.5%;top:37.5%;width:34%;height:34%"></div>';
  return '<div style="display:flex;gap:10px;flex:1;align-items:center">'+
  '<div class="callout frm hid" id="ce" style="padding:16px 18px;width:250px;font-size:25px;line-height:1.6"><h4 style="color:var(--cyan);font-size:28px">الإلكترونات (e⁻)</h4>كتلة الإلكترون صغيرة جداً وتُهمل.</div>'+
  '<div class="col grow" style="align-items:center;gap:4px"><div class="imgwrap" style="width:480px"><img class="pic fade" src="'+IMG.parts_navy+'" alt="ذرة: نواة ذهبية وإلكترونات حمراء" style="width:480px">'+spots+'</div><div class="fb" style="min-height:40px;text-align:center;font-size:26px">من خلال فهم مكونات الذرة: اضغط على الجزء اللي يحمل معظم كتلة الذرة</div></div>'+
  '<div class="callout frm gold hid" id="cp" style="padding:16px 18px;width:270px;font-size:25px;line-height:1.6"><h4 style="color:var(--gold);font-size:28px">البروتونات (p) والنيوترونات (n)</h4>معظم كتلة الذرة تتركز في النواة، وهي تساوي مجموع كتل البروتونات والنيوترونات.</div></div>';},
 init:function(el){
  var fb=$('.fb',el);
  $$('.spot',el).forEach(function(p){p.addEventListener('click',function(){
    if(p.getAttribute('data-p')==='nuc'){ $('#cp',el).classList.remove('hid'); say(fb,'✓ النواة تحمل معظم الكتلة','ok') }
    else { $('#ce',el).classList.remove('hid'); say(fb,'الإلكترونات كتلتها صغيرة جداً... جرّب النواة','bad') }
  })});
 },
 note:'<ul><li>كتاب الطالب ص٥٣: معظم كتلة الذرّة في النواة (بروتونات ونيوترونات)، وكتلة الإلكترونات بالغة الصغر مقارنة بها فتُهمل. ولهذا تُقاس كتل الذرّات بمقارنة بعضها مع بعض.</li></ul>'});

/* 6 carbon-12: build the nucleus */
slide({id:'c12',ch:2,title:'الذرة المقياس: لماذا الكربون-12؟',tag:'ابنِ النواة',
 html:function(){return '<div class="frm brk gold" style="width:370px;flex:none;align-self:stretch;justify-content:center;padding:22px 24px;gap:16px"><p style="font-size:29px;line-height:1.6;font-weight:700;text-align:center">تم اعتماد ذرة الكربون-12 لتكون وحدة قياس الكتل الذرية للذرات الأخرى.</p><p id="why" style="font-size:30px;line-height:1.55;font-weight:800;text-align:center;color:var(--gold)">لماذا؟</p><p class="hide" id="why2" style="font-size:24px;line-height:1.7;text-align:center">بنِ النواة وستعرف.</p></div>'+
  '<div class="col grow" style="gap:12px"><div class="frm brk" style="flex:none;padding:8px 14px"><div style="display:flex;align-items:center;gap:6px;height:310px"><div class="vline" style="color:#f4fbf8"><span>العدد الكتلي A = <b class="num" id="av">0</b></span><i></i></div><div style="flex:1;position:relative;height:310px" id="cwrap"><div id="cs" style="position:absolute;inset:0;transition:opacity 400ms var(--ease-out)">'+c12Svg(1,1)+'</div><img id="c12img" class="pic fade" src="'+IMG.c12_violet+'" alt="" style="position:absolute;inset:0;margin:auto;height:100%;width:auto;max-width:100%;opacity:0;transition:opacity 500ms var(--ease-out)"></div><div class="vline" style="color:var(--gold)"><span>العدد الذري Z = <b class="num" id="zv">0</b></span><i></i></div></div>'+
   '<div style="display:flex;gap:28px;justify-content:center;padding:6px 0 4px"><div class="stp2"><span style="font-weight:700;font-size:22px;color:var(--cyan)">بروتونات (p)</span><button type="button" data-k="p" data-d="-1">−</button><b class="num" id="pv">0</b><button type="button" data-k="p" data-d="1">+</button></div>'+
   '<div class="stp2"><span style="font-weight:700;font-size:22px">نيوترونات (n)</span><button type="button" data-k="n" data-d="-1">−</button><b class="num" id="nv">0</b><button type="button" data-k="n" data-d="1">+</button></div></div></div>'+
   '<div class="gbar hide" id="c12b" style="font-size:23px;padding:10px 20px">تمتلك ذرة الكربون-12: <b>6</b> بروتونات + <b>6</b> نيوترونات، مما يعطيها عدداً كتلياً يساوي <b>12</b> وحدة كتلة ذرية (ذ.ك.ذ).</div></div>';},
 init:function(el){
  var p=1,n=1, done=false;
  function upd(){
    if(!done) $('#cs',el).style.opacity='1';
    $('#pv',el).textContent=p; $('#nv',el).textContent=n; $('#av',el).textContent=p+n; $('#zv',el).textContent=p; $('#cs',el).innerHTML=c12Svg(p,n);
    if(!done&&p===6&&n===6){ done=true; $('#cs',el).style.opacity='0'; $('#c12img',el).style.opacity='1'; var b=$('#c12b',el); b.classList.remove('hide'); b.classList.add('up'); $('#why',el).textContent='لأن عددها الكتلي 12 بالضبط'; $('#why2',el).classList.remove('hide'); $('#why2',el).textContent='٦ بروتونات + ٦ نيوترونات = ١٢' }
  }
  $$('.stp2 button',el).forEach(function(b){b.addEventListener('click',function(){
    var k=b.getAttribute('data-k'), d=+b.getAttribute('data-d'); if(k==='p') p=Math.max(0,Math.min(10,p+d)); else n=Math.max(0,Math.min(10,n+d)); upd();
  })});
  upd();
 },
 note:'<ul><li>كتاب الطالب ص٥٣: اختار الكيميائيون ذرّة نظير الكربون-12 ذرّةً قياسية وأعطوها كتلة تساوي ١٢ وحدة كتلة ذرّية (و.ك.ذ)، لأنها تمتلك ٦ بروتونات و٦ نيوترونات فعددها الكتلي ١٢. هنا الطالب يبني النواة بنفسه.</li></ul>'});

/* 8 the maths: C-12 vs H, and fluorine */
slide({id:'calc',ch:2,title:'المقارنة الرياضية ووحدة الكتل الذرية',tag:'أنت تحسب',
 html:function(){return '<div class="col grow" style="gap:12px;justify-content:flex-start">'+
  '<div class="frm brk"><div class="fh">المقارنة بين كتلة ذرة كربون-12 وذرة الهيدروجين</div><div class="flow"><div class="cbox mf" style="font-size:26px;direction:ltr">1.99 × 10<sup>−23</sup> g &nbsp;:&nbsp; 1.67 × 10<sup>−24</sup> g</div><div class="arw">⟶</div><div class="gbox mf" style="font-size:28px;direction:ltr">12 amu &nbsp;:&nbsp; 1 amu</div></div><div class="sm muted" style="text-align:center;padding:0 0 8px;font-size:19px">(بقسمة الطرفين على 1.67 × 10<sup>−24</sup>)</div></div>'+
  '<div class="frm brk"><div class="fh">إيجاد وحدة الكتل الذرية للفلور</div><div class="flow" id="fl">'+
   '<div class="cbox" style="font-size:20px">الكتلة الفعلية لذرة الفلور =<br><span class="mf" style="font-size:25px;color:var(--cyan)">3.16 × 10<sup>−23</sup> g</span></div>'+
   '<div class="arw s1 hide">⟶</div><div class="cbox s1 hide" style="font-size:20px">بما أن: <span class="mf">1 amu</span> =<br><span class="mf" style="font-size:25px;color:var(--cyan)">1.67 × 10<sup>−24</sup> g</span></div>'+
   '<div class="arw s2 hide">⟶</div><div class="cbox s2 hide" style="font-size:19px">(الكتلة النسبية للفلور) X<br><span class="mf" style="font-size:24px"><span class="frac"><span>3.16 × 10<sup>−23</sup></span><span>1.67 × 10<sup>−24</sup></span></span></span></div>'+
   '<div class="arw s3 hide">⟶</div><div class="gbox s3 hide" style="display:flex;align-items:center;justify-content:center;gap:8px;direction:ltr"><span>=</span>'+ninHTML('f','amu','sm')+'</div></div></div>'+
  '<div style="display:flex;gap:16px;align-items:center"><button class="btn acc sm" type="button" id="stn">التالي ▸</button><div class="fb" style="flex:1;font-size:21px;line-height:1.5"></div></div></div>';},
 init:function(el){
  var i=0, btn=$('#stn',el), fb=$('.fb',el);
  btn.addEventListener('click',function(){
    i++; $$('.s'+i,el).forEach(function(x){x.classList.remove('hide'); x.classList.add('pop')});
    if(i===3){ btn.classList.add('hide'); say(fb,'احسب الناتج وأدخله في المربع الذهبي (قرّب لأقرب عدد صحيح)','') }
  });
  bindNum($('.nin[data-n="f"]',el),19,0.6,function(ok){ if(ok) say(fb,'✓ 18.9 ≈ 19. طريقة ثانية (كما في الامتحان): 3.16÷1.99 = 1.587، ثم 1.587 × 12 ≈ 19','ok'); else say(fb,'اقسم 3.16 على 1.67 ثم اضرب في 10','bad') });
 },
 note:'<ul><li>كتاب الطالب ص٥٣: ١٫٩٩×١٠⁻²³ ÷ ١٫٦٧×١٠⁻²⁴ = ١١٫٩ ≈ ١٢، أي أن كتلة C-12 تساوي ١٢ ضعفاً من كتلة H، فكتلة H = ١ و.ك.ذ. وبالطريقة نفسها الفلور (الجدول ٣-١، ٣٫١٦×١٠⁻²³) ≈ ١٩.</li><li>الطريقة الثانية (كتلة الذرة ÷ كتلة C-12 ثم × ١٢) تأتي في الامتحانات السابقة؛ عرضتها هنا من عندي.</li></ul>'});

/* 7 relative atomic mass: the atom balance */
(function(){
  var M={C:12,H:1,He:4,Mg:24}, R={C:30,H:15,He:22,Mg:33};
  var ROUNDS=[
   {q:'كم ذرة <b>هيدروجين H</b> توازن ذرة <b>كربون-١٢</b>؟',fixedL:['C'],fixedR:[],add:'H',side:'R',res:'١٢ ذرة H = ذرة C-12 ⇒ كتلة H = <b class="num">1</b> ذ.ك.ذ',fig:'الشكل ٣-١ (أ)'},
   {q:'كم ذرة <b>هيليوم He</b> توازن ذرة <b>كربون-١٢</b>؟',fixedL:['C'],fixedR:[],add:'He',side:'R',res:'٣ ذرات He = ذرة C-12 ⇒ كتلة He = ١٢ ÷ ٣ = <b class="num">4</b> ذ.ك.ذ',fig:'الشكل ٣-١ (ب)'},
   {q:'كم ذرة <b>كربون-١٢</b> توازن ذرة <b>ماغنيسيوم Mg</b>؟',fixedL:[],fixedR:['Mg'],add:'C',side:'L',res:'ذرتا C-12 = ذرة Mg ⇒ كتلة Mg = ٢ × ١٢ = <b class="num">24</b> ذ.ك.ذ',fig:'الشكل ٣-١ (ج)'}
  ];
  function sum(a){return a.reduce(function(s,x){return s+M[x]},0)}
  function panAtoms(list,cx,cy){
    var rows=[], cur=[], w=0, cap=200;
    list.forEach(function(sym){var d=R[sym]*2+3; if(w+d>cap&&cur.length){rows.push(cur); cur=[]; w=0} cur.push(sym); w+=d});
    if(cur.length) rows.push(cur);
    var s='', y=cy;
    rows.forEach(function(r){
      var rw=r.reduce(function(a,x){return a+R[x]*2+3},0), x=cx-rw/2, rr=Math.max.apply(null,r.map(function(q){return R[q]}));
      y-=rr; r.forEach(function(sym){x+=R[sym]; s+=sph(x,y,R[sym],sym,{fs:R[sym]*.95}); x+=R[sym]+3}); y-=rr+2;
    });
    return s;
  }
  slide({id:'balance',ch:2,title:'الكتلة الذرية النسبية (Ar)',tag:'سحب وإفلات',
   html:function(){return '<div class="col grow" style="gap:12px;justify-content:flex-start"><div class="frm brk gold" style="padding:12px 24px"><p style="font-size:23px;line-height:1.55;text-align:center"><b>الكتلة الذرية النسبية (A<sub>r</sub>):</b> متوسط كتل ذرات العنصر التي توجد في الطبيعة وفقاً لمقياس تكون فيه كتلة ذرة الكربون-12 مساوية لـ 12 وحدة كتلة ذرية (ذ.ك.ذ).</p></div>'+
    '<div style="display:flex;gap:16px;flex:1;min-height:0">'+
    '<div class="frm brk" style="width:340px;flex:none;padding:10px 14px;gap:6px"><div class="rounds" id="rds">'+ROUNDS.map(function(r,i){return '<span class="rd" data-i="'+i+'">'+ar(i+1)+'</span>'}).join('')+'</div>'+
     '<p id="rq" style="font-size:22px;line-height:1.4"></p><div class="tray" id="tr"></div><div class="fb" id="bfb" style="font-size:18px;line-height:1.35"></div><button class="btn acc sm hide" type="button" id="nx">الجولة التالية</button></div>'+
    '<div class="bal" id="bal" style="flex:1"><svg viewBox="0 0 900 460" id="bsvg"></svg><div class="zone" id="zL" style="left:6%;top:38%;width:28%;height:46%"></div><div class="zone" id="zR" style="left:66%;top:38%;width:28%;height:46%"></div></div></div></div>';},
   init:function(el){
    var round=0, L=[], Rr=[], ang=0, tgt=0, vel=0, raf=0, locked=false, svg=$('#bsvg',el);
    var tr=$('#tr',el), fb=$('#bfb',el), nx=$('#nx',el);
    function target(){var d=sum(Rr)-sum(L); return Math.max(-13,Math.min(13,d*1.15))}
    function draw(){
      var th=ang*Math.PI/180, Lh=290, px=450, py=104;
      var lx=px-Lh*Math.cos(th), ly=py-Lh*Math.sin(th), rx=px+Lh*Math.cos(th), ry=py+Lh*Math.sin(th), drop=156;
      var s='<defs><linearGradient id="gWhite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#9FB6CE"/></linearGradient>'+
        '<linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7B861"/><stop offset="1" stop-color="#A9742A"/></linearGradient>'+
        '<linearGradient id="gPan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7FBFF"/><stop offset="1" stop-color="#7F9DBA"/></linearGradient></defs>';
      s+='<rect x="226" y="418" width="448" height="26" rx="5" fill="url(#gWood)"/><rect x="252" y="442" width="46" height="8" fill="#8E5E1F"/><rect x="602" y="442" width="46" height="8" fill="#8E5E1F"/>';
      s+='<path d="M258 418c0-24 14-36 40-36h304c26 0 40 12 40 36z" fill="url(#gWhite)" stroke="#d8f5ea" stroke-width="2"/><rect x="292" y="402" width="316" height="8" rx="4" fill="var(--cyan)" opacity=".9"/>';
      s+='<rect x="430" y="108" width="40" height="278" rx="10" fill="url(#gWhite)" stroke="#d8f5ea" stroke-width="2"/><rect x="446" y="134" width="8" height="216" rx="4" fill="var(--cyan)" opacity=".55"/>';
      s+='<path d="M450 62 l-13 -22 h26 z" fill="#E4BC4B"/>';
      [[lx,ly,L],[rx,ry,Rr]].forEach(function(p,i){
        var x=p[0], y=p[1]+drop;
        s+='<path d="M'+x+' '+p[1]+' L'+(x-112)+' '+y+' M'+x+' '+p[1]+' L'+(x+112)+' '+y+'" stroke="#DCEBFA" stroke-opacity=".8" stroke-width="2.2" fill="none"/>';
        s+='<ellipse cx="'+x+'" cy="'+(y+8)+'" rx="126" ry="15" fill="url(#gPan)" stroke="#fff" stroke-width="2"/><ellipse cx="'+x+'" cy="'+y+'" rx="126" ry="15" fill="rgba(var(--t1),.28)" stroke="#d8f5ea" stroke-width="2"/>';
        s+='<g data-side="'+(i?'R':'L')+'">'+panAtoms(p[2],x,y)+'</g>';
      });
      s+='<g transform="rotate('+ang+' '+px+' '+py+')"><rect x="'+(px-Lh)+'" y="'+(py-10)+'" width="'+(2*Lh)+'" height="20" rx="10" fill="url(#gWhite)" stroke="#d8f5ea" stroke-width="2"/><rect x="'+(px-Lh+16)+'" y="'+(py-2.5)+'" width="'+(2*Lh-32)+'" height="5" rx="2.5" fill="var(--cyan)" opacity=".75"/></g>';
      s+='<circle cx="450" cy="104" r="19" fill="#E4BC4B" stroke="#F8E39B" stroke-width="4"/><circle cx="450" cy="104" r="7" fill="#7A5A10"/>';
      svg.innerHTML=s;
    }
    function anim(){
      cancelAnimationFrame(raf);
      (function step(){ vel+=(tgt-ang)*0.11; vel*=0.80; ang+=vel; draw(); if(Math.abs(vel)>0.01||Math.abs(tgt-ang)>0.02) raf=requestAnimationFrame(step); else {ang=tgt; draw()} })();
    }
    function setRound(i){
      round=i; var r=ROUNDS[i]; locked=false; L=r.fixedL.slice(); Rr=r.fixedR.slice(); say(fb,''); nx.classList.add('hide');
      $('#rq',el).innerHTML=r.q;
      $$('.rd',el).forEach(function(d,j){d.className='rd'+(j<i?' done':(j===i?' cur':''))});
      tr.innerHTML=''; var a=document.createElement('div'); a.className='chip atom '+r.add; a.textContent=r.add; a.setAttribute('aria-label','ذرة '+r.add);
      if(r.add==='C'){a.style.width=a.style.height='62px'} tr.appendChild(a);
      var hint=document.createElement('span'); hint.className='sm muted'; hint.textContent='← اسحبها'; tr.appendChild(hint);
      drag(a,{zone:'.zone',drop:function(it,z){return put(z.id==='zR'?'R':'L')},tap:function(){put(r.side)}});
      $('#zL',el).className='zone'+(r.side==='L'?' show':''); $('#zR',el).className='zone'+(r.side==='R'?' show':'');
      tgt=target(); anim();
    }
    function put(side){
      var r=ROUNDS[round]; if(locked) return false;
      if(side!==r.side){say(fb,'هذي الكفة للذرة الثابتة','bad'); return false}
      var arr=side==='R'?Rr:L; if(arr.length>=22){say(fb,'الكفة امتلأت!','bad'); return false}
      arr.push(r.add); tgt=target(); anim(); check(); return true;
    }
    function check(){
      var r=ROUNDS[round];
      if(sum(L)===sum(Rr)){
        locked=true; tgt=0; anim();
        later(function(){
          say(fb,'⚖ توازنت!','ok'); var d=document.createElement('div'); d.className='panel pop'; d.style.cssText='margin-top:6px;padding:10px 14px;font-size:21px;line-height:1.5'; d.innerHTML=r.res+'<div class="sm muted" style="margin-top:4px;font-size:17px">'+r.fig+' في الكتاب</div>'; fb.appendChild(d);
          if(round<ROUNDS.length-1) nx.classList.remove('hide'); else { $$('.rd',el).forEach(function(x){x.className='rd done'}); var s=document.createElement('div'); s.className='panel dark pop'; s.style.cssText='margin-top:4px;padding:8px 12px;font-size:18px;line-height:1.4'; s.innerHTML='H = 1 · He = 4 · Mg = 24 ... هذي الكتل الذرية النسبية <b>Ar</b>'; fb.appendChild(s)}
        },520);
      }else{ var dd=sum(Rr)-sum(L); say(fb, dd>0?'الكفة اليمنى أثقل':'الكفة اليسرى أثقل','') }
    }
    svg.addEventListener('click',function(e){
      if(locked) return; var g=e.target.closest('.sph'); if(!g) return;
      var side=g.parentNode.getAttribute('data-side'), r=ROUNDS[round];
      if(side!==r.side) return; var arr=side==='R'?Rr:L; var fixed=side==='R'?r.fixedR.length:r.fixedL.length;
      if(arr.length>fixed){arr.pop(); tgt=target(); anim(); say(fb,'')}
    });
    nx.addEventListener('click',function(){setRound(round+1)});
    setRound(0);
   },
   note:'<ul><li><b>قلب الدرس.</b> الشكل ٣-١ (ص٥٤): الجولة ١: ١٢ ذرّة H = C-12 · الجولة ٢: ٣ ذرّات He (كل منها ٤) = C-12 · الجولة ٣: ذرّة Mg (٢٤) = ذرّتا C-12.</li><li>اطلب توقّعاً قبل السحب: «كم ذرة H تحتاج؟»</li></ul>'});
})();

/* 11 isotopes: definition and the formula */
slide({id:'iso',ch:2,title:'النظائر: لماذا ليست الكتل أعداداً صحيحة؟',tag:'اضغط ◂ للكشف',
 html:function(){return '<div style="display:flex;gap:18px;flex:1;align-items:center"><div class="col grow" style="gap:16px;justify-content:center">'+
  '<div class="frm brk" style="padding:24px 28px;gap:14px"><p style="font-size:31px;line-height:1.65"><b style="color:var(--gold)">النظائر:</b> ذرات للعنصر نفسه، تمتلك نفس العدد من البروتونات ولكنها تختلف في عدد النيوترونات.</p>'+
   '<div id="a2" class="hide"><p style="font-size:30px;line-height:1.65;border-top:1.5px solid var(--panel-line);padding-top:14px">لأن معظم العناصر لها نظائر، بالتالي يتم أخذ <span class="k">متوسط الكتلة النسبية</span> لذرات النظائر.</p></div></div>'+
  '<div class="frm brk gold hide" id="fm"><div class="fh">قانون حساب متوسط الكتلة الذرية النسبية</div><div style="padding:22px 20px;font-size:38px;line-height:1.7;text-align:center" class="mf">A<sub>r</sub> = (% × Am<sub>1</sub>X) + (% × Am<sub>2</sub>X) + …</div></div>'+
  '<div style="text-align:center"><button class="btn acc" type="button" id="rv">اكشف السبب والقانون ◂</button></div></div>'+
  '<div style="width:300px;flex:none"><img class="pic fade" src="'+IMG.goals_navy+'" alt="" style="width:330px;max-width:none"></div></div>';},
 init:function(el){
  $('#rv',el).addEventListener('click',function(){ ['#a2','#fm'].forEach(function(s){var e=$(s,el); e.classList.remove('hide'); e.classList.add('up')}); this.classList.add('hide') });
 },
 note:'<ul><li>كتاب الطالب ص٥٤: النظائر ذرّات للعنصر نفسه لها أعداد مختلفة من النيوترونات في نوياتها، فتختلف كتلها، ولهذا نأخذ <b>متوسط</b> الكتلة النسبية.</li><li>الصيغة العامة Ar = (% × كتلة النظير ١) + (% × كتلة النظير ٢) + … من عندي (الكتاب يعرض مثال الكلور فقط). اسأل الطلاب أولاً: لماذا ٣٥٫٥؟ ثم اكشف.</li></ul>'});

/* 13 chlorine application: the slider drives the maths */
slide({id:'cl',ch:2,title:'تطبيق عملي: متوسط الكتلة النسبية للكلور',tag:'حرّك المؤشر',
 html:function(){return '<div class="col grow" style="gap:12px;justify-content:flex-start">'+
  '<div class="frm brk" style="padding:10px 20px;gap:2px"><b style="font-size:23px;color:var(--gold)">المشكلة</b><p style="font-size:23px;line-height:1.55">تحتوي عينة نموذجية من غاز الكلور على 75% من الكلور-35 و 25% من الكلور-37. أوجد متوسط الكتلة النسبية لذرة الكلور؟</p></div>'+
  '<div style="display:flex;gap:16px;align-items:stretch">'+
   '<div class="frm brk" style="flex:1"><div class="fh" style="font-size:21px">المعطيات (Given)</div><div style="padding:10px 16px;font-size:22px;line-height:1.9"><div>النظير الأول: الكتلة = 35، النسبة = <b class="num" id="p1">50</b>% (<span class="num" id="d1">0.50</span>)</div><div>النظير الثاني: الكتلة = 37، النسبة = <b class="num" id="p2">50</b>% (<span class="num" id="d2">0.50</span>)</div></div></div>'+
   '<div class="arw" style="align-self:center">⟵</div>'+
   '<div class="frm brk" style="flex:1"><div class="fh" style="font-size:21px">الحل (Calculation)</div><div class="mf" style="padding:10px 16px;font-size:26px;line-height:1.8;text-align:left;direction:ltr"><div>A<sub>r</sub> = (<span id="c1">0.50</span> × 35) + (<span id="c2">0.50</span> × 37)</div><div>A<sub>r</sub> = (<span id="e1">17.5</span>) + (<span id="e2">18.5</span>)</div></div></div></div>'+
  '<div style="display:flex;gap:18px;align-items:center"><div style="flex:1"><div class="sm" style="font-size:21px;margin-bottom:2px">اضبط نسبة الكلور-35 لين يصير A<sub>r</sub> = 35.5</div><input class="rng" id="rg" type="range" min="0" max="100" step="1" value="50" aria-label="نسبة كلور-35"></div>'+
   '<div class="gbox" id="res" style="min-width:300px"><div style="font-size:19px;font-weight:600">النتيجة (Result)</div><div class="mf" style="font-size:40px" >A<sub>r</sub> = <span id="rv">36.0</span></div></div></div>'+
  '<div class="fb" id="cfb" style="min-height:34px;font-size:22px"></div></div>';},
 init:function(el){
  var rg=$('#rg',el), cfb=$('#cfb',el), res=$('#res',el);
  function upd(){
    var p=+rg.value, q=100-p; rg.style.setProperty('--p',(100-p)+'%');
    var a=(35*p+37*q)/100;
    $('#p1',el).textContent=p; $('#p2',el).textContent=q; $('#d1',el).textContent=(p/100).toFixed(2); $('#d2',el).textContent=(q/100).toFixed(2);
    $('#c1',el).textContent=(p/100).toFixed(2); $('#c2',el).textContent=(q/100).toFixed(2); $('#e1',el).textContent=(35*p/100).toFixed(2); $('#e2',el).textContent=(37*q/100).toFixed(2);
    $('#rv',el).textContent=a.toFixed(2).replace(/0$/,''); var hit=Math.abs(a-35.5)<0.001; res.classList.toggle('ok-b',hit);
    if(hit) say(cfb,'✓ هذي النسبة الطبيعية: 75% كلور-35 و25% كلور-37. لذلك Ar(Cl) = 35.5 مو عدد صحيح','ok'); else say(cfb,'','');
  }
  rg.addEventListener('input',upd); upd();
 },
 note:'<ul><li>كتاب الطالب ص٥٤: للكلور نظيران، الكلور-35 والكلور-37، وفي عيّنة نموذجية ٧٥٪ و٢٥٪، فمتوسط الكتلة النسبية ٣٥٫٥.</li><li>الحساب خطوة بخطوة من عندي: ٠٫٧٥×٣٥ + ٠٫٢٥×٣٧ = ٢٦٫٢٥ + ٩٫٢٥ = ٣٥٫٥. الطالب يبحث عن النسبة بنفسه بالمؤشر.</li></ul>'});

/* 10 Table 3-2: find the elements whose Ar is not a whole number */
slide({id:'table',ch:2,title:'الجدول ٣-٢: الكتل الذرية النسبية (Ar)',tag:'اضغط على الصفوف',
 html:function(){
  var T=[['الهيدروجين','H',1],['الكربون','C',12],['النيتروجين','N',14],['الأكسجين','O',16],['الفلور','F',19],['الصوديوم','Na',23],['الماغنيسيوم','Mg',24],['الألومنيوم','Al',27],['الكبريت','S',32],['الكلور','Cl',35.5],['الحديد','Fe',56],['النحاس','Cu',63.5]];
  return '<div class="frm brk" style="width:700px;flex:none;padding:10px 14px"><table class="atab"><thead><tr><th>العنصر</th><th>الرمز</th><th>الكتلة الذرية النسبية Ar</th></tr></thead><tbody>'+
   T.map(function(t){return '<tr data-n="'+(t[2]%1?1:0)+'"><td>'+t[0]+'</td><td class="s">'+t[1]+'</td><td class="v">'+t[2]+'</td></tr>'}).join('')+'</tbody></table></div>'+
   '<div class="col grow" style="gap:16px;justify-content:center"><p class="lead" style="font-size:28px"><b>اضغط على العناصر اللي كتلتها الذرية النسبية <span class="k">ليست عدداً صحيحاً</span>.</b></p><div class="fb" id="tf" style="min-height:60px;font-size:24px"></div><div class="frm gold hide" id="tn" style="padding:14px 18px"><p style="font-size:25px;line-height:1.6">لماذا؟ لأن لمعظم العناصر <b>نظائر</b>. هذا موضوع الشريحة التالية.</p></div></div>';
 },
 init:function(el){
  var found=0, fb=$('#tf',el);
  $$('tr[data-n]',el).forEach(function(r){r.addEventListener('click',function(){
    if(r.classList.contains('hit')) return;
    if(r.getAttribute('data-n')==='1'){ r.classList.add('hit'); found++; say(fb,found<2?'✓ واحد... في الثاني؟':'✓ الكلور والنحاس','ok'); if(found===2){var n=$('#tn',el); n.classList.remove('hide'); n.classList.add('up')} }
    else { r.classList.add('miss'); later(function(){r.classList.remove('miss')},500); say(fb,'هذا عدد صحيح، جرّب صفاً ثانياً','bad') }
  })});
 },
 note:'<ul><li>كتاب الطالب ص٥٤–٥٥: الجدول ٣-٢ مرجع قيم Ar في كل حسابات الوحدة. «وباستثناء الكلور والنحاس، فقد تم تقريب قيم الكتلة الذرية النسبية للعناصر إلى أقرب عدد صحيح لجعل حساباتنا أكثر سهولة»، وتجدها في الجدول الدوري بجانب رمز العنصر.</li></ul>'});

/* 14 exit ticket 1 */
(function(){
  var items=[
   {q:'الذرة المستخدمة مقياساً للكتل الذرية النسبية هي:',opts:[{t:'هيدروجين-1'},{t:'كربون-12',ok:true,why:'صح: ١٢ ذ.ك.ذ بالتعريف'},{t:'أكسجين-16'}]},
   {q:'لماذا لا تكون معظم الكتل الذرية النسبية أعداداً صحيحة؟',opts:[{t:'لأن الذرات تتغير في التفاعل'},{t:'لأن لمعظم العناصر نظائر فنأخذ متوسط كتلها',ok:true,why:'صح: متوسط كتل النظائر حسب نسبتها'},{t:'لأن النيوترونات عديمة الكتلة'}]},
   {q:'لماذا نستخدم الكتلة النسبية بدل كتلة الذرة بالجرام؟',opts:[{t:'لأن الجرام وحدة غير صحيحة'},{t:'لأن كتلة الذرة بالجرام صغيرة جداً ويصعب قياسها',ok:true,why:'صح'},{t:'لأن الذرات كلها لها الكتلة نفسها'}]},
   {type:'num',q:'عنصر له نظيران: ٨٠٪ منهما كتلته ١٠ و٢٠٪ كتلته ١١. ما كتلته الذرية النسبية؟',ans:10.2,tol:0.02,why:'(١٠×٨٠ + ١١×٢٠) ÷ ١٠٠ = ١٠٫٢',hint:'خذ المتوسط حسب النسب'}
  ];
  slide({id:'tk1',ch:2,title:'تذكرة خروج ١: الكتلة الذرية النسبية',tag:'تذكرة خروج',
   html:function(){return ticketHTML(items)},
   init:function(el){bindTicket(el,items,'tk1')},
   note:'<ul><li>٣ دقائق. الإجابات: كربون-١٢، متوسط النظائر، صغيرة جداً، ١٠٫٢.</li><li>الأسئلة: ١ الذرة المقياس، ٢ لماذا Ar ليست عدداً صحيحاً، ٣ لماذا نستخدم الكتلة النسبية بدل الجرام، ٤ حساب Ar لنظيرين. من إعدادي على أهداف دليل المعلم ٢-٨ لتقويم سريع قبل الانتقال إلى Mr.</li></ul>'});
})();
