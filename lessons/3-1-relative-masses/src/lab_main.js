/* ---------- virtual lab: Activity 3-1, composition of magnesium oxide ----------
   Masses are the eight groups' results from question 3-4 in the student book. */
(function(){
  var MG=[0.06,0.15,0.22,0.24,0.30,0.28,0.10,0.20], MGO=[0.10,0.25,0.38,0.40,0.50,0.46,0.18,0.32];
  function r2(v){return Math.round(v*100)/100}
  function f2(v){return v.toFixed(2)}
  var STEPS=['السلامة','اختيار الشريط وتنظيفه','وزن الماغنيسيوم','التسخين','وزن الناتج حتى ثبات الكتلة','حساب كتلة الأكسجين','الرسم البياني','الاستنتاج والصيغة'];

  function crucible(cx,y,s){
    var o='';
    if(s.heat) o+='<ellipse cx="'+cx+'" cy="'+(y+4)+'" rx="48" ry="13" fill="#F28C1B" opacity=".4"/>';
    o+='<path d="M'+(cx-28)+' '+(y-40)+'L'+(cx+28)+' '+(y-40)+'L'+(cx+19)+' '+y+'L'+(cx-19)+' '+y+'Z" fill="#E3DED0" stroke="#8E8B80" stroke-width="3" stroke-linejoin="round"/>';
    if(s.content==='mg') o+='<path d="M'+(cx-17)+' '+(y-12)+'q6 -14 11 -2 q6 12 11 -2 q6 -12 12 0" stroke="'+(s.clean?'#F2F6F7':'#8D9A9E')+'" stroke-width="5" fill="none" stroke-linecap="round"/>';
    if(s.content==='burn') o+='<circle cx="'+cx+'" cy="'+(y-24)+'" r="40" fill="#fff" opacity=".22"/><circle class="flare" cx="'+cx+'" cy="'+(y-24)+'" r="19" fill="#fff"/>';
    if(s.content==='ash') o+='<path d="M'+(cx-19)+' '+(y-1)+'q3 -20 19 -20 q16 0 19 20z" fill="#F4F1E8"/>';
    var lid='<rect x="'+(cx-32)+'" y="'+(y-48)+'" width="64" height="8" rx="4" fill="#CFC9B8" stroke="#8E8B80" stroke-width="2"/>';
    o+= s.lid==='ajar' ? '<g transform="rotate(13 '+(cx+30)+' '+(y-44)+')">'+lid+'</g>' : lid;
    if(s.content==='burn') o+='<ellipse class="sm1" cx="'+(cx-8)+'" cy="'+(y-56)+'" rx="14" ry="10" fill="#fff" opacity=".7"/><ellipse class="sm2" cx="'+(cx+10)+'" cy="'+(y-58)+'" rx="12" ry="9" fill="#fff" opacity=".7"/><ellipse class="sm3" cx="'+cx+'" cy="'+(y-60)+'" rx="16" ry="11" fill="#fff" opacity=".7"/>';
    return o;
  }
  function scene(s){
    var o='<svg viewBox="0 56 500 284" role="img" aria-label="طاولة مختبر: موقد بنزن وحامل ثلاثي وميزان رقمي وبوتقة">';
    o+='<rect x="0" y="292" width="500" height="48" fill="#1B5B58"/><rect x="0" y="288" width="500" height="6" fill="#2A7A74"/>';
    // balance
    o+='<rect x="312" y="252" width="170" height="38" rx="10" fill="#E7EEF0"/><rect x="336" y="260" width="122" height="22" rx="5" fill="#143B1D"/>';
    o+='<text x="397" y="272" text-anchor="middle" dominant-baseline="central" font-family="Baloo Bhaijaan 2,sans-serif" font-weight="800" font-size="19" fill="#7EE0A8" direction="ltr">'+(s.read==null?'':s.read)+'</text>';
    o+='<rect x="392" y="240" width="10" height="14" fill="#9FB4C7"/><rect x="346" y="232" width="102" height="9" rx="4" fill="#C8D6DD"/>';
    // tripod + burner
    o+='<path d="M60 204 L40 290 M220 204 L240 290" stroke="#9FB4C7" stroke-width="8" stroke-linecap="round"/><rect x="52" y="196" width="176" height="9" rx="4" fill="#9FB4C7"/>';
    o+='<path d="M110 196 L170 196 L140 214 Z" fill="#7C6F63"/>';
    o+='<rect x="108" y="280" width="64" height="10" rx="4" fill="#506670"/><rect x="134" y="228" width="12" height="54" fill="#6D8793"/>';
    if(s.flame) o+='<g class="flame"><path d="M140 228 C124 214 128 200 140 180 C152 200 156 214 140 228Z" fill="#F28C1B" opacity=".9"/><path d="M140 228 C132 218 134 208 140 196 C146 208 148 218 140 228Z" fill="#6FB6FF"/></g>';
    // crucible
    if(s.at==='bal') o+=crucible(397,232,s);
    else if(s.at==='tri') o+=crucible(140,196,s);
    else if(s.at==='bench') o+=crucible(250,288,s);
    // ribbon prep
    if(s.prep){
      o+='<rect x="140" y="110" width="220" height="56" rx="14" fill="#fff" opacity=".1"/>';
      o+='<path d="M158 140 q16 -22 32 0 t32 0 t32 0 t32 0 t32 0 t32 0" stroke="'+(s.clean>=3?'#F2F6F7':'#8D9A9E')+'" stroke-width="7" fill="none" stroke-linecap="round"/>';
      if(s.clean>=3) o+='<g stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M190 120l6-8M262 118l4-9M322 122l7-7"/></g>'; else o+='<circle cx="206" cy="136" r="4" fill="#4A5A5E"/><circle cx="280" cy="146" r="3.5" fill="#4A5A5E"/><circle cx="326" cy="136" r="4" fill="#4A5A5E"/>';
      o+='<text x="250" y="92" text-anchor="middle" font-family="Baloo Bhaijaan 2,sans-serif" font-weight="800" font-size="22" fill="#EAF6F3">شريط ماغنيسيوم رقم '+ar(s.piece+1)+'</text>';
    }
    return o+'</svg>';
  }
  function gearSVG(k){
    var g={eye:'<svg viewBox="0 0 56 56"><rect x="6" y="18" width="44" height="20" rx="10" fill="#9BD6F5" stroke="#fff" stroke-width="3"/><path d="M6 28H0M50 28h6" stroke="#fff" stroke-width="3"/></svg>',
      coat:'<svg viewBox="0 0 56 56"><path d="M18 6l10 8 10-8 14 10-6 12-6-4v26H16V24l-6 4L4 16z" fill="#fff" stroke="#EAF6F3" stroke-width="2"/><path d="M28 14v36" stroke="#9FB4C7" stroke-width="2"/></svg>',
      glove:'<svg viewBox="0 0 56 56"><path d="M14 50V26l-2-10a3 3 0 016-1l2 8V8a3 3 0 016 0v14l2-14a3 3 0 016 1l-1 15 3-8a3 3 0 015 2l-4 18c-1 7-5 12-12 12z" fill="#F2B24A" stroke="#fff" stroke-width="2"/></svg>'};
    return g[k];
  }

  slide({id:'lab',ch:5,title:'المختبر الافتراضي: حرق الماغنيسيوم',theme:'lab',tag:'نشاط عملي ٣-١',
   html:function(){return '<div class="lb">'+
     '<div class="lsteps" id="ls">'+STEPS.map(function(t,i){return '<div class="ls" data-i="'+i+'"><i>'+ar(i+1)+'</i><span>'+t+'</span></div>'}).join('')+'</div>'+
     '<div class="lwork"><div class="scene" id="sc"></div><div class="say" id="sy"></div><div class="ctl" id="ct"></div></div>'+
     '<div class="lnote"><div class="panel" style="padding:8px 12px"><table id="nb"><thead><tr><th>التجربة</th><th>Mg (g)</th><th>MgO (g)</th><th>O (g)</th></tr></thead><tbody></tbody></table></div><div class="lgraph" id="gr"></div></div>'+
    '</div>';},
   init:function(el){
    var S={step:0,gear:{},piece:-1,clean:0,sub:0,trials:[],cur:null,m:0.9,graphDone:false,heat:false,read:null,at:'none',content:'none',lid:'on',flame:false,hasOwn:false};
    var sc=$('#sc',el), sy=$('#sy',el), ct=$('#ct',el), tb=$('#nb tbody',el), gr=$('#gr',el);

    function paintScene(){
      sc.innerHTML=scene({read:S.read,at:S.at,content:S.content,lid:S.lid,flame:S.flame,heat:S.heat,clean:S.clean,piece:S.piece,prep:S.step===1&&S.piece>=0&&S.sub<9,});
    }
    function paintSteps(){ $$('.ls',el).forEach(function(d,i){d.className='ls'+(i<S.step?' done':(i===S.step?' cur':''))}) }
    function paintTable(){
      var rows=''; var byI={}; S.trials.forEach(function(t){byI[t.i]=t});
      var i; var order=S.trials.map(function(t){return t.i});
      for(i=0;i<8;i++){
        var t=byI[i];
        rows+=t?'<tr class="'+(t.fresh?'fresh':'')+'"><td class="'+(t.own?'':'q')+'">'+(t.own?'أنت':'مجموعة')+' '+ar(i+1)+'</td><td>'+f2(t.mg)+'</td><td>'+f2(t.mgo)+'</td><td>'+f2(t.o)+'</td></tr>':'<tr><td class="q">'+ar(i+1)+'</td><td class="q">—</td><td class="q">—</td><td class="q">—</td></tr>';
      }
      tb.innerHTML=rows; S.trials.forEach(function(t){t.fresh=false}); later(function(){$$('#nb tr.fresh',el).forEach(function(r){r.classList.remove('fresh')})},1400);
    }
    function paintGraph(){
      var X0=52,X1=366,Y0=210,Y1=18, sx=(X1-X0)/0.40, sy_=(Y0-Y1)/0.30;
      var g='<svg viewBox="0 0 380 250" role="img" aria-label="رسم بياني: كتلة الأكسجين مقابل كتلة الماغنيسيوم">';
      for(var k=0;k<=4;k++){var x=X0+k*0.1*sx; g+='<line x1="'+x+'" y1="'+Y1+'" x2="'+x+'" y2="'+Y0+'" stroke="#2E6462" stroke-width="1"/><text x="'+x+'" y="228" text-anchor="middle" font-family="Baloo Bhaijaan 2,sans-serif" font-size="14" fill="#A9CFC9" direction="ltr">'+(k/10).toFixed(1)+'</text>'}
      for(var k2=0;k2<=3;k2++){var y=Y0-k2*0.1*sy_; g+='<line x1="'+X0+'" y1="'+y+'" x2="'+X1+'" y2="'+y+'" stroke="#2E6462" stroke-width="1"/><text x="44" y="'+(y+5)+'" text-anchor="end" font-family="Baloo Bhaijaan 2,sans-serif" font-size="14" fill="#A9CFC9" direction="ltr">'+(k2/10).toFixed(1)+'</text>'}
      g+='<line x1="'+X0+'" y1="'+Y0+'" x2="'+X1+'" y2="'+Y0+'" stroke="#EAF6F3" stroke-width="2.5"/><line x1="'+X0+'" y1="'+Y1+'" x2="'+X0+'" y2="'+Y0+'" stroke="#EAF6F3" stroke-width="2.5"/>';
      g+='<text x="209" y="246" text-anchor="middle" font-family="Tajawal,sans-serif" font-weight="700" font-size="14" fill="#EAF6F3">كتلة Mg (g)</text><text transform="rotate(-90 12 114)" x="12" y="114" text-anchor="middle" font-family="Tajawal,sans-serif" font-weight="700" font-size="14" fill="#EAF6F3">كتلة O (g)</text>';
      if(S.step>=6){
        var m=S.m, xe=Math.min(0.40,0.30/m); g+='<line x1="'+X0+'" y1="'+Y0+'" x2="'+(X0+xe*sx)+'" y2="'+(Y0-m*xe*sy_)+'" stroke="#F28C1B" stroke-width="3.5" stroke-linecap="round"/>';
        if(S.graphDone){var be=0.67, xe2=0.30/be; g+='<line x1="'+X0+'" y1="'+Y0+'" x2="'+(X0+Math.min(0.4,xe2)*sx)+'" y2="'+(Y0-be*Math.min(0.4,xe2)*sy_)+'" stroke="#7EE0A8" stroke-width="2.5" stroke-dasharray="6 6"/>'}
      }
      S.trials.forEach(function(t){g+='<circle cx="'+(X0+t.mg*sx)+'" cy="'+(Y0-t.o*sy_)+'" r="'+(t.own?7:5.5)+'" fill="'+(t.own?'#F28C1B':'#7EE0A8')+'" stroke="#0C2B31" stroke-width="2"/>'});
      gr.innerHTML=g+'</svg>';
    }
    function setStep(n){S.step=n; paintSteps(); paintScene(); paintGraph()}
    function say_(h){sy.innerHTML=h}
    function ctl(h){ct.innerHTML=h; return ct}
    function btn(id,txt,cls){return '<button class="btn '+(cls||'')+'" type="button" id="'+id+'">'+txt+'</button>'}
    function nin(id,unit){return ninHTML(id,unit)}
    function numBox(id,ans,tol,onOk,onBad){
      var b=bindNum($('.nin[data-n="'+id+'"]',ct),ans,tol,function(ok){ if(ok) onOk(); else if(onBad) onBad() });
      return b;
    }
    function fbHTML(){return '<span class="fb" id="lfb" style="flex:1;min-width:160px"></span>'}
    function lfb(msg,k){say($('#lfb',ct),msg,k)}

    /* ---- phases ---- */
    function phaseSafety(){
      setStep(0);
      say_('<b>السلامة أولاً.</b> البس معدّات الحماية قبل ما تلمس أي شي. (شريط الماغنيسيوم سريع الاشتعال.)');
      ctl('<button class="gear" type="button" data-g="eye">'+gearSVG('eye')+'<span>نظارة واقية</span></button><button class="gear" type="button" data-g="coat">'+gearSVG('coat')+'<span>معطف المختبر</span></button><button class="gear" type="button" data-g="glove">'+gearSVG('glove')+'<span>قفازان واقيان</span></button>'+btn('go0','ابدأ التجربة','hide'));
      $$('.gear',ct).forEach(function(g){g.addEventListener('click',function(){
        g.classList.toggle('on'); S.gear[g.getAttribute('data-g')]=g.classList.contains('on');
        var all=S.gear.eye&&S.gear.coat&&S.gear.glove; $('#go0',ct).classList.toggle('hide',!all);
        if(all) say_('✓ جاهز. <b>اغسل يديك بعد انتهاء التجربة</b>، وتعامل مع البوتقة والغطاء الساخنين بحذر.');
      })});
      $('#go0',ct).addEventListener('click',function(){phasePick()});
    }
    function phasePick(){
      setStep(1); S.clean=0; S.content='none'; S.at='none'; S.read=null; S.lid='on'; S.flame=false; S.heat=false; S.sub=0;
      var used={}; S.trials.forEach(function(t){used[t.i]=true});
      say_('<b>اختر شريط ماغنيسيوم.</b> كل مجموعة في الصف تجرّب شريطاً بكتلة مختلفة.'+(S.hasOwn?' (التجارب بعد الأولى تُنفَّذ بسرعة.)':''));
      var h='';
      for(var i=0;i<8;i++) h+='<button class="btn ghost sm" type="button" data-i="'+i+'" '+(used[i]?'disabled':'')+'>شريط '+ar(i+1)+'</button>';
      if(S.trials.length>=1&&S.trials.length<8) h+=btn('grp','استلام نتائج بقية المجموعات','sm');
      if(S.trials.length>=4) h+=btn('toG','الرسم البياني ▸','acc sm');
      ctl(h);
      $$('button[data-i]',ct).forEach(function(b){b.addEventListener('click',function(){ S.piece=+b.getAttribute('data-i'); S.hasOwn?quickRun():phaseClean() })});
      var g=$('#grp',ct); if(g) g.addEventListener('click',importGroups);
      var tg=$('#toG',ct); if(tg) tg.addEventListener('click',phaseGraph);
      paintScene();
    }
    function importGroups(){
      var have={}; S.trials.forEach(function(t){have[t.i]=true});
      for(var i=0;i<8;i++) if(!have[i]) S.trials.push({i:i,mg:MG[i],mgo:MGO[i],o:r2(MGO[i]-MG[i]),own:false,fresh:true});
      paintTable(); paintGraph(); phasePick();
    }
    function phaseClean(){
      S.sub=0; S.clean=0; paintScene();
      say_('الشريط مغطّى بطبقة داكنة من الأكسيد. <b>نظّفه بالسنفرة</b> قبل الوزن.');
      ctl(btn('rub','نظّف بالسنفرة (٠/٣)'));
      $('#rub',ct).addEventListener('click',function(){
        S.clean++; paintScene(); this.textContent='نظّف بالسنفرة ('+ar(S.clean)+'/٣)';
        if(S.clean>=3){ this.classList.add('hide'); say_('✓ لمع الشريط. الآن نزنه.'); later(phaseWeigh,700) }
      });
    }
    function phaseWeigh(){
      setStep(2); S.sub=9; S.at='none'; S.content='none'; S.read=null; S.lid='on'; paintScene();
      say_('١) ضع <b>البوتقة مع غطائها</b> على الميزان، ثم صفّره. ٢) ضع الشريط داخل البوتقة.');
      ctl(btn('w1','ضع البوتقة والغطاء على الميزان'));
      $('#w1',ct).addEventListener('click',function(){
        S.at='bal'; S.read='x.xx'; paintScene(); ctl(btn('w2','صفّر الميزان (Tare)'));
        $('#w2',ct).addEventListener('click',function(){
          S.read='0.00'; paintScene(); say_('الميزان يقرأ <b>0.00 g</b> لأنه يطرح كتلة البوتقة. الآن ضع الشريط.'); ctl(btn('w3','ضع الشريط في البوتقة'));
          $('#w3',ct).addEventListener('click',function(){
            S.content='mg'; S.clean=3; S.read=f2(MG[S.piece]); paintScene();
            say_('<b>اقرأ الميزان</b> وسجّل كتلة الماغنيسيوم.');
            ctl('<span class="muted">كتلة Mg =</span>'+nin('m1','g')+fbHTML());
            numBox('m1',MG[S.piece],0.004,function(){ lfb('✓ سجّلتها في الدفتر','ok'); S.cur={i:S.piece,mg:MG[S.piece],mgo:null,o:null,own:true}; later(phaseHeat,900) },function(){lfb('اقرأ الرقم على شاشة الميزان','bad')});
          });
        });
      });
    }
    function phaseHeat(){
      setStep(3); S.sub=0; S.read=null; S.at='bal'; paintScene();
      say_('انقل البوتقة إلى <b>المثلث الحراري</b> على الحامل الثلاثي.');
      ctl(btn('h1','انقل البوتقة إلى الحامل'));
      $('#h1',ct).addEventListener('click',function(){
        S.at='tri'; paintScene(); say_('أشعل الموقد.'); ctl(btn('h2','أشعل الموقد'));
        $('#h2',ct).addEventListener('click',function(){
          S.flame=true; S.heat=true; paintScene(); say_('<b>افتح الغطاء قليلاً</b> ليدخل الهواء. لا ترفعه كاملاً حتى لا يتسرّب الدخان الأبيض.'); ctl(btn('h3','افتح الغطاء قليلاً'));
          $('#h3',ct).addEventListener('click',function(){
            S.lid='ajar'; paintScene(); say_('سخّن بقوة وراقب. (لا تنظر مباشرة إلى الوهج الأبيض!)'); ctl(btn('h4','سخّن'));
            $('#h4',ct).addEventListener('click',function(){
              this.disabled=true; S.content='burn'; paintScene(); say_('وهج أبيض ساطع ودخان أبيض... الماغنيسيوم يتحد مع أكسجين الهواء.');
              later(function(){ S.content='ash'; paintScene(); say_('انتهى الاحتراق. <b>أطفئ الموقد</b> واترك البوتقة تبرد.'); ctl(btn('h5','أطفئ الموقد وانتظر التبريد'));
                $('#h5',ct).addEventListener('click',function(){ S.flame=false; S.heat=false; S.lid='on'; paintScene(); this.disabled=true; say_('تبرّدت البوتقة...'); later(phaseWeigh2,1100) });
              },3200);
            });
          });
        });
      });
    }
    function phaseWeigh2(){
      setStep(4); S.sub=0; S.at='bal'; S.read='0.00'; paintScene();
      var i=S.cur.i, first=r2(Math.max(MGO[i]-0.02,MG[i]));
      say_('ضع البوتقة على الميزان (بنفس التصفير). نتأكد من <b>ثبات الكتلة</b> بالتسخين مرتين.');
      ctl(btn('x1','ضع البوتقة على الميزان'));
      $('#x1',ct).addEventListener('click',function(){
        S.read=f2(first); paintScene(); say_('القراءة <b>'+f2(first)+' g</b>. هل انتهى التفاعل؟ سخّن مرة ثانية وأعد الوزن.'); ctl(btn('x2','سخّن مرة ثانية وأعد الوزن'));
        $('#x2',ct).addEventListener('click',function(){
          var b=this; b.disabled=true; S.at='tri'; S.flame=true; S.heat=true; S.lid='ajar'; S.read=null; paintScene();
          later(function(){ S.flame=false; S.heat=false; S.lid='on'; S.at='bal'; S.read=f2(MGO[i]); paintScene();
            say_('القراءة الآن <b>'+f2(MGO[i])+' g</b>. أعد التسخين مرة أخيرة للتأكد من أن الكتلة ثابتة.'); ctl(btn('x3','سخّن وأعد الوزن للتأكد'));
            $('#x3',ct).addEventListener('click',function(){
              this.disabled=true; S.at='tri'; S.flame=true; S.heat=true; S.lid='ajar'; S.read=null; paintScene();
              later(function(){ S.flame=false; S.heat=false; S.lid='on'; S.at='bal'; S.read=f2(MGO[i]); paintScene();
                say_('✓ القراءة لم تتغير: <b>الكتلة ثبتت</b>. التفاعل اكتمل. سجّل كتلة أكسيد الماغنيسيوم.');
                ctl('<span class="muted">كتلة MgO =</span>'+nin('m2','g')+fbHTML());
                numBox('m2',MGO[i],0.004,function(){ S.cur.mgo=MGO[i]; lfb('✓','ok'); later(phaseCompute,700) },function(){lfb('اقرأ الرقم على الشاشة','bad')});
              },1700);
            });
          },1700);
        });
      });
    }
    function phaseCompute(){
      setStep(5); var t=S.cur;
      say_('الكتلة التي زادت هي كتلة <b>الأكسجين</b> المتحد مع الماغنيسيوم:<br><span class="eq" style="font-size:24px">m(O) = m(MgO) − m(Mg) = '+f2(t.mgo)+' − '+f2(t.mg)+'</span>');
      ctl('<span class="muted">كتلة O =</span>'+nin('m3','g')+fbHTML());
      numBox('m3',r2(t.mgo-t.mg),0.004,function(){ t.o=r2(t.mgo-t.mg); t.fresh=true; S.trials.push(t); S.hasOwn=true; S.cur=null; paintTable(); paintGraph(); lfb('✓ أُضيفت نقطة للرسم','ok'); later(phasePick,900) },function(){lfb('اطرح كتلة Mg من كتلة MgO','bad')});
    }
    function quickRun(){
      var i=S.piece; S.sub=9; S.at='tri'; S.content='burn'; S.flame=true; S.heat=true; S.lid='ajar'; S.clean=3; S.read=null; setStep(3); paintScene();
      say_('تنفيذ سريع: وزن Mg ← تسخين حتى ثبات الكتلة ← وزن MgO...'); ctl('');
      later(function(){ S.content='ash'; S.flame=false; S.heat=false; S.lid='on'; S.at='bal'; S.read=f2(MGO[i]); paintScene(); S.cur={i:i,mg:MG[i],mgo:MGO[i],o:null,own:true}; say_('m(Mg) = <b>'+f2(MG[i])+' g</b> · m(MgO) = <b>'+f2(MGO[i])+' g</b>'); later(phaseCompute,900) },2400);
    }
    function phaseGraph(){
      setStep(6); S.at='none'; S.read=null; S.content='none'; S.flame=false; paintScene();
      say_('ارسم <b>الخط الأنسب</b> لنقاطك: حرّك المؤشر حتى يمرّ الخط بأقرب ما يمكن من كل النقاط.');
      ctl('<input class="rng" id="sl" type="range" min="0.30" max="1.10" step="0.01" value="'+S.m+'" style="flex:1;min-width:200px" aria-label="ميل الخط"><span class="eq" style="font-size:26px;min-width:120px">ميل = <span id="sv">'+S.m.toFixed(2)+'</span></span>'+btn('ck','تحقق','sm'));
      var sl=$('#sl',ct); function u(){ S.m=+sl.value; $('#sv',ct).textContent=S.m.toFixed(2); sl.style.setProperty('--p',(100-(S.m-0.3)/0.8*100)+'%'); paintGraph() } sl.addEventListener('input',u); u();
      $('#ck',ct).addEventListener('click',function(){
        if(S.m>=0.60&&S.m<=0.74){ S.graphDone=true; paintGraph(); say_('✓ خط مستقيم يمرّ بنقطة الأصل، وميله <b>≈ 0.67</b>. الميل = كتلة O ÷ كتلة Mg.'); later(phaseConcl,1600) }
        else say_(S.m<0.6?'الخط تحت أغلب النقاط. ارفع الميل.':'الخط فوق أغلب النقاط. نزّل الميل.');
      });
    }
    function phaseConcl(){
      setStep(7); var q=0;
      function ask(txt,opts,okMsg,next){
        say_(txt); ctl(optsHTML(opts)+'<div class="fb" id="lfb" style="flex-basis:100%"></div>');
        bindMcq(ct,opts,$('#lfb',ct),function(){later(next,1200)});
      }
      ask('<b>ماذا يدل أن الخط مستقيم ويمر بنقطة الأصل؟</b>',[{t:'نسبة كتلة O إلى كتلة Mg ثابتة، فالصيغة ثابتة',ok:true,why:'صح: دائماً ٠٫٦٧ g أكسجين لكل ١ g ماغنيسيوم'},{t:'كلما زادت كتلة Mg قلّت كتلة O'},{t:'النقاط عشوائية'}],'',function(){
        say_('كل <b>١ g</b> ماغنيسيوم يتحد مع <b>٠٫٦٧ g</b> أكسجين. نقسم كل كتلة على Ar لنعرف نسبة الذرات:');
        ctl('<span class="eq" style="font-size:24px">Mg: 1 ÷ 24 =</span>'+nin('a1','','sm')+'<span class="eq" style="font-size:24px">O: 0.67 ÷ 16 =</span>'+nin('a2','','sm')+fbHTML());
        var d1=false,d2=false; function both(){ if(d1&&d2){ lfb('✓ الرقمان متساويان تقريباً، أي أن النسبة ١ : ١','ok'); later(formula,1300) } }
        numBox('a1',0.042,0.002,function(){d1=true; both()},function(){lfb('١ ÷ ٢٤ ≈ ٠٫٠٤٢','bad')});
        numBox('a2',0.042,0.002,function(){d2=true; both()},function(){lfb('٠٫٦٧ ÷ ١٦ ≈ ٠٫٠٤٢','bad')});
      });
      function formula(){
        ask('نسبة ذرات Mg إلى O = <b>١ : ١</b>. ما صيغة أكسيد الماغنيسيوم؟',[{t:'MgO',ok:true,why:'صح: أيون Mg²⁺ واحد مقابل O²⁻ واحد'},{t:'Mg<sub>2</sub>O'},{t:'MgO<sub>2</sub>'}],'',error);
      }
      function error(){
        ask('كتلة MgO في تجربتك أقل قليلاً مما توقعنا. <b>ما أحد الأسباب المحتملة؟</b>',[{t:'تسرّب دخان أكسيد الماغنيسيوم الأبيض عند رفع الغطاء',ok:true,why:'صح، ومن الأسباب أيضاً أن التفاعل لم يكتمل'},{t:'زادت كتلة الماغنيسيوم أثناء التسخين'},{t:'الميزان يقيس الحجم'}],'',finish);
      }
      function finish(){
        say_('<b>انتهى النشاط ✓</b> استنتجنا الصيغة MgO من نتائج التجربة. ارجع للدرس وأكمل.'); ctl(btn('bk','العودة إلى الدرس ▸','acc'));
        $('#bk',ct).addEventListener('click',next);
      }
    }
    paintTable(); paintGraph(); phaseSafety();
   },
   note:'<ul><li><b>الفكرة:</b> النشاط ٣-١ عملي (كتاب الطالب ص٥٦). المختبر الافتراضي لمن ما يتوفر له الحرق في المعمل، أو للمراجعة.</li><li>أرقام الجدول من السؤال ٣-٤ (٨ مجموعات): Mg من ٠٫٠٦ إلى ٠٫٣٠ g.</li><li>الإجابات: O = ٠٫٢٠ ، ٠٫١٨ ، ٠٫٠٨ ، ٠٫١٢ g للتجارب ٥–٨. ميل الخط ≈ ٠٫٦٧.</li><li>التسخين حتى ثبات الكتلة، والغطاء مفتوح قليلاً، وتنظيف الشريط بالسنفرة: من ملاحظات دليل المعلم.</li><li>احتياطات السلامة: نظارة، معطف، قفازان، حذر مع البوتقة الساخنة، الشريط بعيداً عن اللهب.</li></ul>'});
})();

