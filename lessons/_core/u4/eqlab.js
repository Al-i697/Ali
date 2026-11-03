/* ---------- the formulas and equations workshop (shared by the unit-1 lessons) ----------
   Students meet the same three tools in every lesson that needs a formula or an equation:
     1. the formula builder: pick a positive ion and a negative ion, watch the valencies cross, simplify, check the charges;
     2. the atom balancer (later lessons): change coefficients only and watch the atoms on both sides;
     3. the equation ladder (later lessons): words -> formulas -> states -> balancing -> ionic equation.
   This file has the builder (part 1) and the formula parser used by the others. Every message names the mistake it found. */
var EQL=(function(){
  function gcd(a,b){return b?gcd(b,a%b):Math.abs(a)}
  /* positive and negative ions: s symbol, c charge size, n Arabic name, v =1 when the metal has more than one valency, poly =1 for a bracketed group */
  var CAT={
    Li:{s:'Li',c:1,n:'الليثيوم'}, Na:{s:'Na',c:1,n:'الصوديوم'}, K:{s:'K',c:1,n:'البوتاسيوم'}, Ag:{s:'Ag',c:1,n:'الفضة'},
    Mg:{s:'Mg',c:2,n:'الماغنيسيوم'}, Ca:{s:'Ca',c:2,n:'الكالسيوم'}, Zn:{s:'Zn',c:2,n:'الخارصين'},
    Cu:{s:'Cu',c:2,n:'النحاس (II)',v:1}, Fe2:{s:'Fe',c:2,n:'الحديد (II)',v:1}, Al:{s:'Al',c:3,n:'الألومنيوم'}, Fe3:{s:'Fe',c:3,n:'الحديد (III)',v:1}
  };
  var ANI={
    Cl:{s:'Cl',c:1,n:'كلوريد'}, OH:{s:'OH',c:1,n:'هيدروكسيد',poly:1}, NO3:{s:'NO3',c:1,n:'نترات',poly:1},
    O:{s:'O',c:2,n:'أكسيد'}, SO4:{s:'SO4',c:2,n:'كبريتات',poly:1}, CO3:{s:'CO3',c:2,n:'كربونات',poly:1}
  };
  function subs(f){return String(f).replace(/(\d+)/g,'<sub>$1</sub>')}
  function ionH(i,cat){return subs(i.s)+'<sup>'+(i.c>1?i.c:'')+(cat?'+':'−')+'</sup>'}
  /* the formula of the compound with n1 cations and n2 anions, as html */
  function formulaH(ca,an,n1,n2){
    var a=ca.s+(n1>1?'<sub>'+n1+'</sub>':'');
    var b=an.poly&&n2>1?'('+subs(an.s)+')<sub>'+n2+'</sub>':subs(an.s)+(n2>1?'<sub>'+n2+'</sub>':'');
    return a+b;
  }
  function formulaT(ca,an,n1,n2){return ca.s+(n1>1?n1:'')+(an.poly&&n2>1?'('+an.s+')':an.s)+(n2>1?n2:'')}
  function nameOf(ca,an){return an.n+' '+ca.n}
  /* the correct subscripts of a pair */
  function right(ca,an){var g=gcd(ca.c,an.c);return {n1:an.c/g,n2:ca.c/g,g:g,r1:an.c,r2:ca.c}}
  /* element counts of a formula such as Ca(OH)2 */
  function parse(f){
    var i=0;
    function num(){var s='';while(i<f.length&&/\d/.test(f[i]))s+=f[i++];return s?+s:1}
    function grp(){var m={},k,e,inner,n;
      while(i<f.length&&f[i]!==')'){
        if(f[i]==='('){i++;inner=grp();i++;n=num();for(k in inner)m[k]=(m[k]||0)+inner[k]*n}
        else{e=f[i++];while(i<f.length&&/[a-z]/.test(f[i]))e+=f[i++];n=num();m[e]=(m[e]||0)+n}}
      return m}
    return grp();
  }
  function shake(el){el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');setTimeout(function(){el.classList.remove('shake')},400)}

  /* ---- 1. the formula builder ---- */
  function builderHTML(o){
    o=o||{};
    return '<div class="eqb">'+
      '<div class="eqb-pick panel"><div class="eqb-h">اختر الأيونين</div>'+
       '<div class="eqb-lab">الكاتيونات (موجبة، من الفلزات)</div><div class="eqb-row" id="eqCats"></div>'+
       '<div class="eqb-lab">الأنيونات (سالبة، من اللافلزات)</div><div class="eqb-row" id="eqAnis"></div>'+
       '<div class="eqb-modes"><button type="button" class="btn acc" id="eqExp">اشرح خطوة بخطوة</button><button type="button" class="btn" id="eqTry">جرّب بنفسك</button><button type="button" class="btn" id="eqRnd">تحدٍّ عشوائي</button></div>'+
       '<div class="eqb-msg" id="eqMsg">اختر أيونين لتبدأ.</div></div>'+
      '<div class="eqb-bench panel"><div id="eqBench"></div><div class="eqb-tools" id="eqTools"></div><div class="eqb-name" id="eqName"></div></div></div>';
  }
  function bindBuilder(el,o){
    o=o||{};
    var cats=(o.cats||['Na','Mg','Al','K','Ca','Cu','Fe2','Fe3']).map(function(k){return CAT[k]});
    var anis=(o.anis||['Cl','O','OH','SO4']).map(function(k){return ANI[k]});
    var B={ci:Math.max(0,(o.cats||['Na']).indexOf(o.startCat||'Mg')),ai:Math.max(0,(o.anis||['Cl']).indexOf(o.startAni||'O')),mode:'exp',step:0,n1:1,n2:1,done:{}};
    if(B.ci<0)B.ci=0; if(B.ai<0)B.ai=0;
    var elCats=$('#eqCats',el),elAnis=$('#eqAnis',el),msgEl=$('#eqMsg',el),bench=$('#eqBench',el),tools=$('#eqTools',el),nm=$('#eqName',el);
    function msg(cls,h){msgEl.className='eqb-msg '+(cls||'');msgEl.innerHTML=h||''}
    function paintIons(){
      elCats.innerHTML=cats.map(function(c,i){return '<button type="button" class="eqb-ion'+(i===B.ci?' on':'')+'" data-k="c" data-i="'+i+'">'+ionH(c,1)+'<small>'+c.n+'</small></button>'}).join('');
      elAnis.innerHTML=anis.map(function(c,i){return '<button type="button" class="eqb-ion'+(i===B.ai?' on':'')+'" data-k="a" data-i="'+i+'">'+ionH(c,0)+'<small>'+c.n+'</small></button>'}).join('');
    }
    function head(ca,an){
      return '<div class="eqb-b">'+ionH(ca,1)+'</div><div class="eqb-b">'+ionH(an,0)+'</div>'+
        '<div class="eqb-vc"><span class="eqb-val">'+ca.c+'</span><div>التكافؤ</div></div><div class="eqb-vc"><span class="eqb-val">'+an.c+'</span><div>التكافؤ</div></div>';
    }
    function paintBench(){
      var ca=cats[B.ci],an=anis[B.ai],R=right(ca,an),s=B.step,tryM=B.mode==='try';
      nm.innerHTML='';
      if(!tryM){
        var n1d=null,n2d=null,old1='',old2='';
        if(s===1){n1d=R.r1;n2d=R.r2}
        else if(s>=2){n1d=R.n1;n2d=R.n2;if(s===2&&R.g>1){old1='<sub class="eqb-old"><s>'+R.r1+'</s></sub>';old2='<sub class="eqb-old"><s>'+R.r2+'</s></sub>'}}
        var sb=function(n){return n===null?'<sub class="eqb-q">؟</sub>':(n>1?'<sub>'+n+'</sub>':'<sub class="eqb-q">1</sub>')};
        var br=an.poly&&n2d!==null&&n2d>1;
        var fm=ca.s+old1+sb(n1d)+(br?'(':'')+subs(an.s)+(br?')':'')+old2+sb(n2d);
        var polyNote=an.poly&&R.n2>1?' ونضع الأيون المركب بين قوسين لأن عدده أكثر من واحد.':(an.poly&&R.r2>1&&R.n2===1?' ويختفي القوسان لأن العدد صار 1.':'');
        var txt=[
          '١) نكتب الأيونين. <b>تكافؤ</b> الأيون = عدد الشحنات التي يحملها ('+ca.c+' للكاتيون، '+an.c+' للأنيون).'+(ca.v?' <b>تنبيه:</b> لهذا الفلز تكافؤان (II) و(III)، والرقم الروماني في الاسم يحدد المقصود.':''),
          '٢) <b>نتبادل التكافؤ:</b> تكافؤ الكاتيون ('+ca.c+') يصير رقماً سفلياً للأنيون، وتكافؤ الأنيون ('+an.c+') يصير رقماً سفلياً للكاتيون.'+(an.poly&&R.r2>1?' ونضع الأيون المركب بين قوسين.':''),
          R.g>1?'٣) <b>نبسّط:</b> للرقمين عامل مشترك ('+R.g+')، فنقسمهما عليه.'+polyNote:'٣) ليس للرقمين عامل مشترك، فلا حاجة للتبسيط.'+polyNote,
          '٤) <b>نتحقق:</b> ('+R.n1+' × +'+ca.c+') + ('+R.n2+' × −'+an.c+') = '+(R.n1*ca.c)+' − '+(R.n2*an.c)+' = 0 ✓ المركب متعادل.'];
        msg(s===3?'ok':'',txt[s]);
        bench.innerHTML='<div class="eqb-grid">'+head(ca,an)+
          '<svg class="eqb-x'+(s>=1?' on':'')+'" viewBox="0 0 400 62" preserveAspectRatio="none" aria-hidden="true"><line x1="100" y1="4" x2="300" y2="58"/><line x1="300" y1="4" x2="100" y2="58"/></svg>'+
          '<div class="eqb-f">'+fm+'</div></div>';
        tools.innerHTML='<button type="button" class="btn" id="eqPrev"'+(s===0?' disabled':'')+'>▸ السابق</button><span class="eqb-dots">'+[0,1,2,3].map(function(i){return '<i class="'+(i<=s?'on':'')+'"></i>'}).join('')+'</span><button type="button" class="btn acc" id="eqNext"'+(s===3?' disabled':'')+'>التالي ◂</button>';
        if(s===3){nm.innerHTML='<span class="eqb-final">'+formulaH(ca,an,R.n1,R.n2)+'</span><br>'+nameOf(ca,an); done(ca,an)}
      }else{
        var tot=B.n1*ca.c-B.n2*an.c;
        bench.innerHTML='<div class="eqb-grid">'+head(ca,an)+
          '<div class="eqb-st"><span class="eqb-stepper"><button type="button" data-s="1" data-d="-1">−</button><b>'+B.n1+'</b><button type="button" data-s="1" data-d="1">+</button></span><div class="eqb-vl">الرقم السفلي للكاتيون</div></div>'+
          '<div class="eqb-st"><span class="eqb-stepper"><button type="button" data-s="2" data-d="-1">−</button><b>'+B.n2+'</b><button type="button" data-s="2" data-d="1">+</button></span><div class="eqb-vl">الرقم السفلي للأنيون</div></div>'+
          '<div class="eqb-f">'+formulaH(ca,an,B.n1,B.n2)+'</div>'+
          '<div class="eqb-vl eqb-sum">مجموع الشحنات: ('+B.n1+' × +'+ca.c+') + ('+B.n2+' × −'+an.c+') = <b>'+(tot>0?'+':'')+tot+'</b></div></div>';
        tools.innerHTML='<button type="button" class="btn acc" id="eqCheck">تحقق ✓</button><button type="button" class="btn" id="eqHelp">تلميح</button>';
      }
    }
    function done(ca,an){ var k=formulaT(ca,an,right(ca,an).n1,right(ca,an).n2); if(!B.done[k]){B.done[k]=1; if(o.onDone)o.onDone(Object.keys(B.done).length,k)} }
    function verdict(){
      var ca=cats[B.ci],an=anis[B.ai],tot=B.n1*ca.c-B.n2*an.c,g=gcd(B.n1,B.n2),R=right(ca,an);
      if(tot!==0){
        if(B.n1===ca.c&&B.n2===an.c&&ca.c!==an.c) msg('bad','كتبتَ تكافؤ كل أيون على نفسه. التبادل: تكافؤ <b>الكاتيون</b> ('+ca.c+') يذهب إلى <b>الأنيون</b>، وتكافؤ الأنيون ('+an.c+') يذهب إلى الكاتيون.');
        else msg('bad','الشحنات غير متعادلة (المجموع '+(tot>0?'+':'')+tot+'). غيّر الرقمين السفليين حتى يصبح المجموع صفراً.');
        shake(bench);return;
      }
      if(g>1){msg('bad','الشحنات متعادلة ✓ لكن الصيغة ليست الأبسط: اقسم الرقمين على '+g+'.');shake(bench);return}
      msg('ok','✓ صحيحة: '+nameOf(ca,an)+'.');
      nm.innerHTML='<span class="eqb-final">'+formulaH(ca,an,B.n1,B.n2)+'</span><br>'+nameOf(ca,an); done(ca,an);
    }
    function reset(){B.step=0;B.n1=1;B.n2=1;paintIons();paintBench();if(B.mode==='try')msg('','حدّد الرقمين السفليين ثم اضغط «تحقق». تلميح: التكافؤ يُتبادل بين الأيونين.')}
    elCats.addEventListener('click',function(e){var b=e.target.closest('.eqb-ion');if(!b)return;B.ci=+b.getAttribute('data-i');reset()});
    elAnis.addEventListener('click',function(e){var b=e.target.closest('.eqb-ion');if(!b)return;B.ai=+b.getAttribute('data-i');reset()});
    $('#eqExp',el).addEventListener('click',function(){B.mode='exp';reset()});
    $('#eqTry',el).addEventListener('click',function(){B.mode='try';reset()});
    $('#eqRnd',el).addEventListener('click',function(){B.ci=Math.floor(Math.random()*cats.length);B.ai=Math.floor(Math.random()*anis.length);B.mode='try';reset()});
    tools.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;
      if(b.id==='eqNext'&&B.step<3){B.step++;paintBench()}
      else if(b.id==='eqPrev'&&B.step>0){B.step--;paintBench()}
      else if(b.id==='eqCheck')verdict()
      else if(b.id==='eqHelp'){var ca=cats[B.ci],an=anis[B.ai];msg('','الرقم السفلي للكاتيون = تكافؤ الأنيون ('+an.c+') والرقم السفلي للأنيون = تكافؤ الكاتيون ('+ca.c+')، ثم بسّط إن أمكن.')}});
    bench.addEventListener('click',function(e){var b=e.target.closest('button[data-s]');if(!b)return;var k=b.getAttribute('data-s')==='1'?'n1':'n2';B[k]=Math.max(1,Math.min(6,B[k]+ +b.getAttribute('data-d')));paintBench()});
    paintIons();paintBench();
    return {state:B,cats:cats,anis:anis,reset:reset,select:function(c,a){B.ci=c;B.ai=a;reset()}};
  }
  return {gcd:gcd,CAT:CAT,ANI:ANI,parse:parse,ionH:ionH,formulaH:formulaH,formulaT:formulaT,right:right,builderHTML:builderHTML,bindBuilder:bindBuilder,subs:subs};
})();

window.EQL=EQL;   /* exposed for the tests */
