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
    Li:{s:'Li',c:1,n:'الليثيوم'}, Na:{s:'Na',c:1,n:'الصوديوم'}, K:{s:'K',c:1,n:'البوتاسيوم'}, Rb:{s:'Rb',c:1,n:'الروبيديوم'}, Cs:{s:'Cs',c:1,n:'السيزيوم'}, Ag:{s:'Ag',c:1,n:'الفضة'},
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

  /* ---- 2. the atom balancer: change the coefficients only and watch the atoms of every element on both sides ---- */
  var COLR={H:'#6ec3ff',O:'#ff7a6b',Na:'#f6c945',Li:'#c79bff',K:'#d9a8ff',Cs:'#ffb3d9',Ca:'#7be39a',Mg:'#b6f26a',Cl:'#5ee0e0',Fe:'#d98a5a',C:'#b5bcc8',Cu:'#ff9a45',Al:'#d5dbe6',S:'#f2e35a'};
  function colr(e){return COLR[e]||'#fff'}
  function subL(f){return String(f).replace(/(\d+)/g,'<sub class="eqx-lk">$1</sub>')}
  function setMsg(el,cls,html){el.className='eqx-msg '+(cls||'');el.innerHTML=html||''}
  function eqHTML(def,co){
    function side(a,off){return a.map(function(t,i){var c=co[off+i];return (c>1?'<span style="color:var(--gold)">'+c+'</span>':'')+subs(t.f)+'<small style="font-size:.5em">('+t.st+')</small>'}).join(' + ')}
    return side(def.l,0)+' → '+side(def.r,def.l.length);
  }
  /* def: {l:[{f,st}], r:[{f,st}], co:[solution], tip}; opt: {onSolved} */
  function balancer(root,def,opt){
    opt=opt||{};
    var nl=def.l.length, terms=def.l.concat(def.r), sol=def.co, atoms=terms.map(function(t){return parse(t.f)}), els=[], lvl=0, done=false, co=terms.map(function(){return 1});
    atoms.forEach(function(a){Object.keys(a).forEach(function(k){if(els.indexOf(k)<0)els.push(k)})});
    var prio=els.filter(function(e){return e!=='H'&&e!=='O'}).concat(els.filter(function(e){return e==='H'}),els.filter(function(e){return e==='O'}));
    root.innerHTML='<div class="eqx-row"></div><div class="eqx-ctr"></div><div class="eqx-msg"></div><div class="eqx-btns"><button type="button" class="btn acc" data-a="hint">💡 تلميح</button><button type="button" class="btn" data-a="reset">↺ من جديد</button><span class="eqx-aw"></span></div>';
    var eqr=$('.eqx-row',root), ctr=$('.eqx-ctr',root), msg=$('.eqx-msg',root), aw=$('.eqx-aw',root);
    function counts(){return els.map(function(e){var L=0,R=0;terms.forEach(function(t,i){var c=(atoms[i][e]||0)*co[i];if(i<nl)L+=c;else R+=c});return{e:e,L:L,R:R}})}
    function term(i){var t=terms[i];return '<div class="eqx-term"><div class="eqx-coef"><button type="button" data-i="'+i+'" data-d="1" aria-label="زيادة المعامل">▲</button><b class="'+(co[i]===1?'one':'')+'">'+co[i]+'</b><button type="button" data-i="'+i+'" data-d="-1" aria-label="إنقاص المعامل">▼</button></div><span class="eqx-fm">'+subL(t.f)+'<small>('+t.st+')</small></span></div>'}
    function dots(n,e){var s='',k=Math.min(n,16),i;for(i=0;i<k;i++)s+='<i style="background:'+colr(e)+'"></i>';return '<div class="eqx-dots">'+s+'<em>'+n+'</em></div>'}
    function paint(){
      var h='',i;
      for(i=0;i<nl;i++){h+=(i?'<span class="eqx-op">+</span>':'')+term(i)}
      h+='<span class="eqx-arr">→</span>';
      for(i=nl;i<terms.length;i++){h+=(i>nl?'<span class="eqx-op">+</span>':'')+term(i)}
      eqr.innerHTML=h;
      var cs=counts();
      ctr.innerHTML='<span></span><span class="h">ذرات المتفاعلات (يسار)</span><span class="h">ذرات النواتج (يمين)</span><span></span>'+cs.map(function(c){return '<span class="es" style="color:'+colr(c.e)+'">'+c.e+'</span>'+dots(c.L,c.e)+dots(c.R,c.e)+'<span class="ck '+(c.L===c.R?'ok':'no')+'">'+(c.L===c.R?'✓':'✗')+'</span>'}).join('');
      var bal=cs.every(function(c){return c.L===c.R}), g=co.reduce(gcd);
      if(!bal){ if(!lvl) setMsg(msg,'','الأعمدة التي عليها ✗ غير متوازنة. غيّر المعاملات (الأرقام الكبيرة) فقط.'); done=false }
      else if(g>1){ setMsg(msg,'bad','موزونة ✓ لكن اكتبها بأبسط نسبة: اقسم كل المعاملات على '+g+'.') }
      else{ setMsg(msg,'ok','✓ موزونة بأبسط نسبة: '+co.join(' : ')+'<br><span class="eqx-fm" style="font-size:30px;direction:ltr;display:inline-block">'+eqHTML(def,co)+'</span>');
        if(!done){done=true; if(opt.onSolved) opt.onSolved()} }
    }
    function firstBad(){var cs=counts(),i,c;for(i=0;i<prio.length;i++){c=cs.filter(function(x){return x.e===prio[i]})[0];if(c.L!==c.R)return c}return null}
    root.addEventListener('click',function(e){
      var t=e.target;
      if(t.classList&&t.classList.contains('eqx-lk')){shake(eqr);setMsg(msg,'bad','الرقم السفلي لا يتغيّر! هو جزء من هوية المادة (H₂O ماء، أما H₂O₂ فمادة أخرى تماماً). غيّر <b>المعامل</b> الذي أمام الصيغة.');return}
      var b=t.closest&&t.closest('button'); if(!b) return;
      if(b.hasAttribute('data-i')){var i=+b.getAttribute('data-i');co[i]=Math.max(1,Math.min(12,co[i]+ +b.getAttribute('data-d')));lvl=0;aw.innerHTML='';paint();return}
      var a=b.getAttribute('data-a');
      if(a==='reset'){co=terms.map(function(){return 1});lvl=0;done=false;aw.innerHTML='';paint()}
      else if(a==='hint'){
        lvl++; var fb=firstBad();
        if(!fb){setMsg(msg,'','المعادلة متوازنة. تأكد أنها بأبسط نسبة.');return}
        if(lvl===1) setMsg(msg,'','<b>استراتيجية:</b> '+(def.tip||'ابدأ بالفلزات، وأخّر الهيدروجين والأكسجين.'));
        else if(lvl===2) setMsg(msg,'','العنصر <b>'+fb.e+'</b> غير متوازن الآن: '+fb.L+' ذرة في المتفاعلات و'+fb.R+' في النواتج.');
        else{ var k=-1; terms.forEach(function(tm,i){if(k<0&&atoms[i][fb.e]&&co[i]!==sol[i])k=i}); if(k<0)terms.forEach(function(tm,i){if(k<0&&co[i]!==sol[i])k=i});
          if(lvl===3) setMsg(msg,'','جرّب أن تجعل معامل <b class="eqx-fm" style="font-size:24px;direction:ltr;display:inline-block">'+subs(terms[k].f)+'</b> يساوي <b>'+sol[k]+'</b>.');
          else{ setMsg(msg,'','الحل: <b>'+sol.join(' : ')+'</b>'); aw.innerHTML='<button type="button" class="btn" data-a="apply">طبّق الحل</button>' } }
      }
      else if(a==='apply'){co=sol.slice();lvl=0;aw.innerHTML='';paint()}
    });
    paint();
    return {solution:sol,counts:counts,setCo:function(c){co=c.slice();paint()},isDone:function(){return done}};
  }

  /* ---- 3. the equation ladder: words, formulas, states, balancing (one step at a time; every wrong choice says what is wrong) ----
     def: {steps:[names], word:{R,P,bank,why}, subs:[{n,o:[[formula, 1 if right, message]]}], stw:{formula:[state, message]}, eq:{l,r,co,tip}} */
  function ladder(host,d,opt){
    opt=opt||{};
    var st={step:0,done:[]}, names=['المعادلة اللفظية','الصيغ','الحالات','الموازنة'].concat(d.ion?['المعادلة الأيونية']:[]);
    function eqText(co){return '<span class="eqx-fm" style="font-size:32px;direction:ltr;display:inline-block">'+eqHTML(d.eq,co)+'</span>'}
    function paint(){
      host.innerHTML='<div class="eqx-prog">'+names.map(function(s,i){return '<span class="eqx-pg'+(st.done[i]?' done':'')+(i===st.step?' cur':'')+'">'+(i+1)+'. '+s+'</span>'}).join('')+'</div><div class="eqx-body"></div><div class="eqx-btns" style="justify-content:space-between"><button type="button" class="btn" data-a="prev"'+(st.step===0?' disabled':'')+'>▸ السابق</button><button type="button" class="btn acc" data-a="next"'+((st.done[st.step]&&st.step<names.length-1)?'':' disabled')+'>التالي ◂</button></div>';
      var body=$('.eqx-body',host);
      function fin(){ st.done[st.step]=true; var n=$('[data-a="next"]',host); if(n&&st.step<names.length-1) n.disabled=false; var pg=$$('.eqx-pg',host)[st.step]; if(pg) pg.classList.add('done');
        if(st.step===names.length-1){ if(opt.onDone) opt.onDone() } }   /* the balancer has already written the final equation */
      [stepWord,stepForm,stepState,stepBal,stepIon][st.step](body,fin);
    }
    function stepWord(el,fin){
      var R=d.word.R, P=d.word.P, pl={r:[],p:[]};
      el.innerHTML='<p class="eqx-p">اكتب المعادلة اللفظية: اضغط على البطاقات بالترتيب، <b>المتفاعلات أولاً</b> ثم النواتج.</p>'+
        '<div class="eqx-slots"><div class="eqx-slot" data-s="r0"></div><b>+</b><div class="eqx-slot" data-s="r1"></div><b style="font-size:34px">←</b><div class="eqx-slot" data-s="p0"></div><b>+</b><div class="eqx-slot" data-s="p1"></div></div>'+
        '<div class="eqx-chips">'+d.word.bank.map(function(w){return '<button type="button" class="eqx-chip" data-w="'+w+'">'+w+'</button>'}).join('')+'</div><div class="eqx-msg"></div>';
      var msg=$('.eqx-msg',el);
      el.addEventListener('click',function(e){
        var c=e.target.closest('.eqx-chip[data-w]'); if(!c||c.disabled) return;
        var w=c.getAttribute('data-w'), g=pl.r.length<2?'r':'p', set=g==='r'?R:P;
        if(set.indexOf(w)>-1&&pl[g].indexOf(w)<0){
          var s=$('[data-s="'+g+pl[g].length+'"]',el); pl[g].push(w); s.textContent=w; s.classList.add('f'); c.disabled=true; c.classList.add('okc'); setMsg(msg,'','');
          if(pl.r.length===2&&pl.p.length===2){ setMsg(msg,'ok','✓ معادلة لفظية صحيحة.'); fin() }
        }else{ shake(c); var other=(g==='r'?P:R).indexOf(w)>-1; setMsg(msg,'bad',other?'هذه مادة '+(g==='r'?'<b>ناتجة</b>':'<b>متفاعلة</b>')+'. نبدأ بالمتفاعلات ثم النواتج.':(d.word.why[w]||'ليست من مواد هذا التفاعل.')) }
      });
    }
    function stepForm(el,fin){
      var ok=0;
      el.innerHTML='<p class="eqx-p">اختر الصيغة الكيميائية الصحيحة لكل مادة:</p>'+d.subs.map(function(s,i){return '<div class="eqx-subrow"><b>'+s.n+'</b><div class="eqx-opts" data-i="'+i+'">'+s.o.map(function(o,j){return '<button type="button" class="eqx-opt" data-j="'+j+'">'+subs(o[0])+'</button>'}).join('')+'</div></div>'}).join('')+'<div class="eqx-msg"></div>';
      var msg=$('.eqx-msg',el);
      el.addEventListener('click',function(e){
        var b=e.target.closest('.eqx-opt'); if(!b||b.classList.contains('okc')) return;
        var row=b.parentNode, s=d.subs[+row.getAttribute('data-i')], o=s.o[+b.getAttribute('data-j')];
        if(o[1]){ b.classList.add('okc'); $$('.eqx-opt',row).forEach(function(x){x.disabled=true}); ok++; setMsg(msg,'ok','✓ '+s.n+': '+subs(o[0])); if(ok===d.subs.length){ setMsg(msg,'ok','✓ كل الصيغ صحيحة.'); fin() } }
        else{ b.classList.add('badc'); shake(b); setMsg(msg,'bad',o[2]) }
      });
    }
    function stepState(el,fin){
      var ok=0, fs=Object.keys(d.stw);
      el.innerHTML='<p class="eqx-p">اختر رمز الحالة الفيزيائية لكل مادة:</p>'+fs.map(function(f){return '<div class="eqx-subrow"><b style="direction:ltr;font-size:30px;font-family:var(--font-display)">'+subs(f)+'</b><div class="eqx-opts" data-f="'+f+'">'+['s','l','g','aq'].map(function(s){return '<button type="button" class="eqx-opt" data-s="'+s+'">('+s+')</button>'}).join('')+'</div></div>'}).join('')+'<div class="eqx-note">(s) صلب · (l) سائل · (g) غاز · (aq) محلول مائي (ذائب في الماء)</div><div class="eqx-msg"></div>';
      var msg=$('.eqx-msg',el);
      el.addEventListener('click',function(e){
        var b=e.target.closest('.eqx-opt'); if(!b||b.classList.contains('okc')) return;
        var row=b.parentNode, f=row.getAttribute('data-f'), want=d.stw[f];
        if(b.getAttribute('data-s')===want[0]){ b.classList.add('okc'); $$('.eqx-opt',row).forEach(function(x){x.disabled=true}); ok++; setMsg(msg,'ok','✓ '+want[1]); if(ok===fs.length){ setMsg(msg,'ok','✓ كل الحالات صحيحة.'); fin() } }
        else{ b.classList.add('badc'); shake(b); setMsg(msg,'bad','ليست هذه. فكّر: '+want[1]) }
      });
    }
    function stepBal(el,fin){ el.innerHTML='<p class="eqx-p">وازن المعادلة بتغيير المعاملات فقط:</p><div class="eqx-bal"></div>'; balancer($('.eqx-bal',el),d.eq,{onSolved:fin}) }
    /* step 5 (lesson 1-4): the ionic equation. The soluble salts are split into ions, the student strikes out the spectator ions, then picks the net ionic equation.
       d.ion: {l:[{h,st,k,c}], r:[...], spect:key of the spectator ion, nm:{key:message when pressed}, opts:[[html, 1 if right, message]]} */
    function stepIon(el,fin){
      var I=d.ion, need=0, all=I.l.concat(I.r);
      all.forEach(function(t){ if(t.k===I.spect) need++ });
      function tok(t){ return '<span class="eqx-tk'+(t.k?' ion':'')+'" data-k="'+(t.k||'')+'"><span class="eqx-th">'+(t.c>1?'<b class="eqx-c">'+t.c+'</b>':'')+t.h+'</span><small>('+t.st+')</small></span>' }
      function side(a){ return a.map(tok).join('<span class="eqx-op">+</span>') }
      el.innerHTML='<p class="eqx-p">المعادلة الأيونية التامة: المحاليل المائية تتفكّك إلى أيونات. <b>اضغط على الأيونات التي تظهر في الطرفين دون أي تغيّر</b> (الأيونات المتفرّجة).</p>'+
        '<div class="eqx-ionrow">'+side(I.l)+'<b class="eqx-arr">→</b>'+side(I.r)+'</div><div class="eqx-msg"></div><div class="eqx-ionq hide"></div>';
      var msg=$('.eqx-msg',el), q=$('.eqx-ionq',el);
      el.addEventListener('click',function(e){
        var t=e.target.closest('.eqx-tk');
        if(t){
          if(t.classList.contains('out')||need===0) return;
          var k=t.getAttribute('data-k');
          if(k&&k===I.spect){
            t.classList.add('out'); need--;
            if(need===0){
              setMsg(msg,'ok','✓ '+((I.nm&&I.nm[k])||'أيون متفرّج: يظهر في الطرفين كما هو، فنحذفه.'));
              q.classList.remove('hide');
              q.innerHTML='<p class="eqx-p">اختر <b>المعادلة الأيونية الصافية</b> بعد حذف المتفرّجات:</p><div class="eqx-opts" style="flex-direction:column;align-items:stretch">'+I.opts.map(function(o,j){return '<button type="button" class="eqx-opt eqx-ionopt" data-j="'+j+'">'+o[0]+'</button>'}).join('')+'</div>';
            }else setMsg(msg,'ok','✓ متفرّج. ابحث عن الآخر في الطرف الثاني.');
          }else{ shake(t); setMsg(msg,'bad',k?((I.nm&&I.nm[k])||'هذا الأيون يتغيّر في التفاعل.'):'هذه مادة صلبة تتغيّر في التفاعل، وليست أيوناً في المحلول.') }
          return;
        }
        var b=e.target.closest('.eqx-ionopt'); if(!b||b.classList.contains('okc')) return;
        var o=I.opts[+b.getAttribute('data-j')];
        if(o[1]){ b.classList.add('okc'); $$('.eqx-ionopt',el).forEach(function(x){x.disabled=true}); setMsg(msg,'ok','✓ '+(o[2]||'معادلة أيونية صحيحة: الذرات والشحنات متساوية في الطرفين.')); fin() }
        else{ b.classList.add('badc'); shake(b); setMsg(msg,'bad',o[2]||'راجع الذرات والشحنات في الطرفين.') }
      });
    }
    host.addEventListener('click',function(e){
      var b=e.target.closest('[data-a="prev"],[data-a="next"]'); if(!b||b.disabled) return;
      st.step+=b.getAttribute('data-a')==='next'?1:-1; paint();
    });
    paint();
    return {state:st};
  }

  return {balancer:balancer,ladder:ladder,eqHTML:eqHTML,gcd:gcd,CAT:CAT,ANI:ANI,parse:parse,ionH:ionH,formulaH:formulaH,formulaT:formulaT,right:right,builderHTML:builderHTML,bindBuilder:bindBuilder,subs:subs};
})();

window.EQL=EQL;   /* exposed for the tests */
