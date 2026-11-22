/* ---------- shared pieces of the light primary-school look (skin 'sci'): small HTML builders, the virtual filtration workshop, a step-ordering game and a label-the-diagram game.
   Used by the Grade 5-6 science lessons; every piece works with a mouse, a pen or a finger on a classroom screen. ---------- */
var S6=(function(){
  var INK='#3A2418';
  function cloud(t,cls){ return '<span class="cloud'+(cls?' '+cls:'')+'">'+t+'</span>' }
  function nbox(t,cls){ return '<div class="nbox'+(cls?' '+cls:'')+'">'+t+'</div>' }
  function sticky(t,cls){ return '<div class="sticky'+(cls?' '+cls:'')+'">'+t+'</div>' }
  function down(){ return '<div class="dn-arrow" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 6v28M10 24l14 16 14-16" fill="none" stroke="'+INK+'" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' }
  function fig(svg,cap,sub,cls){ return '<div class="figbox'+(cls?' '+cls:'')+'">'+svg+(cap?'<div class="cap">'+cap+(sub?'<small>'+sub+'</small>':'')+'</div>':'')+'</div>' }
  function shuf(a,order){ return order.map(function(i){return a[i]}) }
  /* the teacher's own pictures (PIC is packed by the lesson: name -> data URI). pic(): a photo cut to fit its box, in the notebook frame; st(): a die-cut sticker. */
  function src(n){ return (typeof PIC!=='undefined'&&PIC[n])||'' }
  function pic(n,cls,style,pos){ return '<div class="photo'+(cls?' '+cls:'')+'"'+(style?' style="'+style+'"':'')+'><img src="'+src(n)+'" alt="" draggable="false"'+(pos?' style="object-position:'+pos+'"':'')+'></div>' }
  function st(n,cls,style){ return '<img class="stk6'+(cls?' '+cls:'')+'" src="'+src(n)+'" alt="" draggable="false"'+(style?' style="'+style+'"':'')+'>' }

  /* ================= the virtual filtration workshop =================
     flabHTML(keys) -> markup, bindFlab(root,keys,onPour): the student (or the teacher for the class) picks a mixture, predicts, pours, and sees what stays on the paper and what passes.
     The mixtures and what they do are in FLAB; the sand, flour, chalk and salt come from the student book's activity and the teacher's guide; the coffee is the teacher's own plan (من خطة المعلم). */
  var FLAB={
    coffee:{n:'ماء + قهوة',  solid:'#4A2A17', edge:'#2B1608', liq:'#CFA877', fil:'#B98A55', stay:true,  pass:'ماء بنّي صافٍ (جزء صغير من القهوة ذاب فيه)', left:'حبيبات القهوة', why:'حبيبات القهوة كبيرة فلا تمرّ من ثقوب الورقة، أما الماء فجزيئاته صغيرة فتمرّ.'},
    sand:  {n:'ماء + رمل',    solid:'#D9B66C', edge:'#8C6A25', liq:'#CDEBF7', fil:'#CDEBF7', stay:true,  pass:'ماء صافٍ', left:'حبيبات الرمل', why:'الرمل لا يذوب في الماء وحبيباته كبيرة، فبقيت على ورقة الترشيح.'},
    flour: {n:'ماء + دقيق',   solid:'#FFFDF5', edge:'#8C7A52', liq:'#E9E5D2', fil:'#D8EEF7', stay:true,  pass:'ماء', left:'الدقيق', why:'الدقيق لا يذوب في الماء، وجزيئاته لا تمرّ عبر ثقوب الورقة، فبقي عليها.'},
    chalk: {n:'ماء + طباشير', solid:'#F4F4F0', edge:'#8A8A80', liq:'#E4EEF0', fil:'#CDEBF7', stay:true,  pass:'ماء', left:'الطباشير', why:'الطباشير مادة غير قابلة للذوبان، فبقيت جزيئاتها على الورقة.'},
    salt:  {n:'ماء + ملح',    solid:null,      edge:'#8C8C8C', liq:'#D8ECF4', fil:'#D8ECF4', stay:false, pass:'الماء مع الملح الذائب', left:'لا شيء', why:'الملح ذاب في الماء وصار جزءاً من السائل، فمرّ كله مع الماء. الترشيح وحده لا يفصل الملح.'}
  };
  function flabHTML(keys,uid){
    var u=uid||'', one=keys.length===1;   /* uid: clip-path ids must differ when two labs are on different slides; one mixture: no choosing step */
    var chips=keys.map(function(k){ var m=FLAB[k]; return '<button type="button" class="fchip" data-m="'+k+'"><i style="background:'+(m.solid||'#fff')+'"></i>'+m.n+'</button>' }).join('');
    return '<div class="flab">'+
     '<div class="fscene"><svg viewBox="0 0 640 440" class="art flsvg" aria-hidden="true">'+
      '<defs><clipPath id="clS'+u+'"><rect x="52" y="190" width="126" height="168" rx="12"/></clipPath><clipPath id="clR'+u+'"><rect x="322" y="292" width="116" height="116" rx="12"/></clipPath><clipPath id="clP'+u+'"><path d="M312 138H448L382 214Z"/></clipPath></defs>'+
      '<rect x="40" y="410" width="560" height="14" rx="7" fill="#C9A560" stroke="'+INK+'" stroke-width="3"/>'+
      /* the mixture beaker */
      '<g id="fSrc"><rect id="fSrcL" x="52" y="190" width="126" height="168" fill="#CDEBF7" clip-path="url(#clS'+u+')" style="transition:y 3.2s linear,height 3.2s linear"/><g id="fSrcG" clip-path="url(#clS'+u+')" style="transition:opacity 3s linear 1s"></g>'+
      '<path d="M44 184L54 190V344Q54 360 70 360H160Q176 360 176 344V190L186 184" fill="none" stroke="'+INK+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>'+
      '<text x="116" y="392" text-anchor="middle" font-family="Cairo,Tajawal,sans-serif" font-size="22" font-weight="800" fill="'+INK+'" id="fSrcT"></text>'+
      '<path id="fStream" d="M188 186Q250 110 330 150" fill="none" stroke="#46B6E8" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 12" opacity="0"/>'+
      /* the funnel */
      '<path d="M296 130H466L394 216V268H366V216Z" fill="#DCEEF5" stroke="'+INK+'" stroke-width="4" stroke-linejoin="round"/>'+
      '<path d="M312 138H448L382 214Z" fill="#FFFDF5" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'+
      '<rect id="fFunL" x="300" y="214" width="160" height="0" fill="#CDEBF7" clip-path="url(#clP'+u+')" style="transition:y 1s ease-out,height 1s ease-out"/>'+
      '<g id="fPap" style="transition:opacity 2.4s ease-in 1.4s" opacity="0"></g>'+
      '<path d="M312 138H448L382 214Z" fill="none" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/>'+
      '<path d="M370 214V266M394 214V266" stroke="'+INK+'" stroke-width="4" fill="none"/>'+
      '<g id="fDrops" opacity="0"><circle class="fdr" cx="382" cy="272" r="5" fill="#46B6E8"/><circle class="fdr fd2" cx="382" cy="272" r="5" fill="#46B6E8"/><circle class="fdr fd3" cx="382" cy="272" r="5" fill="#46B6E8"/></g>'+
      /* the receiving beaker */
      '<rect id="fRecL" x="322" y="408" width="116" height="0" fill="#CDEBF7" clip-path="url(#clR'+u+')" style="transition:y 3.4s linear 1s,height 3.4s linear 1s"/>'+
      '<path d="M314 286L324 292V394Q324 410 340 410H420Q436 410 436 394V292L446 286" fill="none" stroke="'+INK+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<text x="380" y="436" text-anchor="middle" font-family="Cairo,Tajawal,sans-serif" font-size="22" font-weight="800" fill="'+INK+'">الكأس</text>'+
      '<text x="381" y="112" font-family="Cairo,Tajawal,sans-serif" font-size="22" font-weight="800" fill="'+INK+'" text-anchor="middle" id="fPapT" opacity="0">ورقة الترشيح</text>'+
     '</svg></div>'+
     '<div class="fpanel">'+
      (one?'':'<div class="fstep"><b>١</b> اختر المخلوط</div><div class="fchips">'+chips+'</div>')+
      '<div class="fstep fpredq hide"><b>'+(one?'١':'٢')+'</b> ماذا ستتوقع؟ <span class="fhint">اضغط إجابة قبل الصبّ</span></div>'+
      '<div class="fpred hide"><button type="button" class="fp" data-p="stay">سيبقى شيء على الورقة</button><button type="button" class="fp" data-p="pass">سيمرّ كله مع الماء</button></div>'+
      '<div class="fgo"><button type="button" class="btn acc" id="fPour" disabled>'+(one?'٢':'٣')+' · اسكب المخلوط ▸</button><button type="button" class="btn ghost sm hide" id="fAgain">أعد التجربة</button></div>'+
      '<div class="fres hide" id="fRes"></div>'+
     '</div></div>';
  }
  function bindFlab(root,keys,onPour){
    var cur=null, pred=null, busy=false, poured=false;
    var $r=function(s){return root.querySelector(s)}, $$r=function(s){return Array.prototype.slice.call(root.querySelectorAll(s))};
    var svg=$r('.flsvg');
    function grainsIn(n,x,y,w,h,col,edge,seed,r){ var s=seed,o='',i; function rn(){ s=(s*9301+49297)%233280; return s/233280 } for(i=0;i<n;i++) o+='<circle cx="'+(x+rn()*w).toFixed(1)+'" cy="'+(y+rn()*h).toFixed(1)+'" r="'+(r*(.75+rn()*.5)).toFixed(1)+'" fill="'+col+'" stroke="'+edge+'" stroke-width="1.6"/>'; return o }
    function reset(){
      busy=false; poured=false; pred=null;
      var m=cur&&FLAB[cur];
      var srcL=$r('#fSrcL'), rec=$r('#fRecL'), fun=$r('#fFunL'), pap=$r('#fPap'), g=$r('#fSrcG');
      [srcL,rec,fun,pap,g].forEach(function(e){ e.style.transition='none' });
      srcL.style.y='252px'; srcL.style.height='106px'; srcL.setAttribute('fill',m?m.liq:'#CDEBF7');
      rec.style.y='408px'; rec.style.height='0px'; rec.setAttribute('fill',m?m.fil:'#CDEBF7');
      fun.style.y='214px'; fun.style.height='0px'; fun.setAttribute('fill',m?m.liq:'#CDEBF7');
      pap.setAttribute('opacity','0'); pap.innerHTML=''; g.style.opacity='1'; g.innerHTML='';
      if(m&&m.solid){ g.innerHTML=grainsIn(30,56,300,118,52,m.solid,m.edge,13,6.5); pap.innerHTML=grainsIn(16,366,190,32,22,m.solid,m.edge,5,5.5)+'<path d="M360 212Q382 192 404 212Z" fill="'+m.solid+'" stroke="'+m.edge+'" stroke-width="1.6"/>' }
      $r('#fStream').setAttribute('opacity','0'); $r('#fDrops').setAttribute('opacity','0'); $r('#fPapT').setAttribute('opacity','0');
      $r('#fSrcT').textContent=m?m.n:'';
      void svg.getBoundingClientRect();
      [srcL,rec,fun,pap,g].forEach(function(e){ e.style.transition='' });
      var res=$r('#fRes'); res.classList.add('hide'); res.innerHTML='';
      $$r('.fp').forEach(function(b){ b.classList.remove('on','ok','no') });
      $r('#fPour').disabled=!m; $r('#fAgain').classList.add('hide');
      $r('.fpredq').classList.toggle('hide',!m); $r('.fpred').classList.toggle('hide',!m);
      $r('#fPour').classList.remove('hide');
    }
    function pour(){
      if(!cur||busy||poured) return; busy=true; poured=true; var m=FLAB[cur];
      $r('#fPour').disabled=true;
      $r('#fStream').setAttribute('opacity','1'); $r('#fStream').classList.add('flow'); $r('#fDrops').setAttribute('opacity','1'); $r('#fDrops').classList.add('go');
      var srcL=$r('#fSrcL'), fun=$r('#fFunL'), rec=$r('#fRecL');
      srcL.style.y='358px'; srcL.style.height='0px'; $r('#fSrcG').style.opacity='0';
      fun.style.y='168px'; fun.style.height='46px';
      setTimeout(function(){ fun.style.y='206px'; fun.style.height='8px' },1700);
      rec.style.y='356px'; rec.style.height='52px';
      if(m.solid){ $r('#fPap').setAttribute('opacity','1') }
      setTimeout(function(){
        $r('#fStream').classList.remove('flow'); $r('#fStream').setAttribute('opacity','0'); $r('#fDrops').classList.remove('go'); $r('#fDrops').setAttribute('opacity','0');
        $r('#fPapT').setAttribute('opacity','1');
        var good=pred===null?null:((pred==='stay')===m.stay);
        var res=$r('#fRes');
        res.innerHTML=(good===null?'':'<div class="fverd '+(good?'ok':'no')+'">'+(good?'توقّعك صحيح ✓':'توقّعك مختلف عن النتيجة')+'</div>')+
          '<ul><li><b>في الكأس:</b> '+m.pass+'</li><li><b>على الورقة:</b> '+m.left+'</li></ul><p class="fwhy">'+m.why+'</p>';
        res.classList.remove('hide'); res.classList.add('pop');
        $r('#fAgain').classList.remove('hide'); busy=false;
        root.setAttribute('data-done',cur);
        if(onPour) onPour(cur,good);
      },4700);
    }
    $$r('.fchip').forEach(function(c){ c.addEventListener('click',function(){ if(busy) return; cur=c.getAttribute('data-m'); $$r('.fchip').forEach(function(x){ x.classList.toggle('on',x===c) }); reset() }) });
    $$r('.fp').forEach(function(b){ b.addEventListener('click',function(){ if(busy||poured) return; pred=b.getAttribute('data-p'); $$r('.fp').forEach(function(x){ x.classList.toggle('on',x===b) }) }) });
    $r('#fPour').addEventListener('click',pour);
    $r('#fAgain').addEventListener('click',function(){ if(busy) return; reset() });
    if(keys.length===1) cur=keys[0];   /* a lab with one mixture starts with it on the bench */
    reset();
  }

  /* ================= put the steps in order (the closing activity) ================= */
  function orderHTML(steps,showOrder,intro){
    var cards=showOrder.map(function(i){ return '<button type="button" class="ocard" data-k="'+i+'"><span>'+steps[i]+'</span></button>' }).join('');
    var slots=steps.map(function(_,i){ return '<div class="oslot" data-n="'+i+'"><i>'+(i+1)+'</i><span class="ot"></span></div>' }).join('');
    return '<div class="ord"><div class="ocol"><div class="oh">'+(intro||'اضغط الخطوات بالترتيب الصحيح')+'</div><div class="ocards">'+cards+'</div></div><div class="ocol"><div class="oh">ترتيب العمل</div><div class="oslots">'+slots+'</div></div></div><div class="fb ofb"></div>';
  }
  function bindOrder(root,steps,onDone){
    var next=0, fb=root.querySelector('.ofb');
    Array.prototype.forEach.call(root.querySelectorAll('.ocard'),function(c){
      c.addEventListener('click',function(){
        if(c.classList.contains('used')) return;
        var k=+c.getAttribute('data-k');
        if(k===next){
          c.classList.add('used'); var sl=root.querySelector('.oslot[data-n="'+next+'"]'); sl.classList.add('on'); sl.querySelector('.ot').textContent=steps[k]; next++;
          say(fb,next<steps.length?'✓ أحسنت، ما الخطوة التي بعدها؟':'✓ ممتاز! هذه هي الطريقة كاملة','ok');
          if(next===steps.length&&onDone) onDone();
        }else{ c.classList.add('bad-b','shake'); setTimeout(function(){ c.classList.remove('bad-b','shake') },420); say(fb,'فكّر: ماذا نفعل أولاً قبل هذه الخطوة؟','bad') }
      });
    });
  }

  /* ================= label the diagram: tap a name, then tap its number on the picture =================
     items: [{t:'name', x:'42%', y:'30%', tx:'50%', ty:'30%'}]  (x,y = the number's spot; tx,ty = where the name appears once it is right; all as % of the picture box) */
  function labelHTML(svg,items,hint){
    var mk=items.map(function(l,i){ return '<button type="button" class="lmk" data-k="'+i+'" style="left:'+l.x+';top:'+l.y+'" aria-label="الرقم '+(i+1)+'">'+(i+1)+'</button><span class="ltxt" data-k="'+i+'" style="left:'+l.tx+';top:'+l.ty+'">'+l.t+'</span>' }).join('');
    return '<div class="lbl"><div class="lsvg"><div class="lwrap">'+svg+mk+'</div></div><div class="lside"><div class="oh">'+(hint||'اضغط الاسم ثم اضغط رقمه على الرسم')+'</div><div class="lchips">'+
      items.map(function(l,i){ return '<button type="button" class="lchip" data-k="'+i+'">'+l.t+'</button>' }).join('')+'</div><div class="fb lfb"></div></div></div>';
  }
  function bindLabel(root,items,onDone){
    var sel=null, got=0, fb=root.querySelector('.lfb');
    var chips=Array.prototype.slice.call(root.querySelectorAll('.lchip'));
    chips.forEach(function(c){ c.addEventListener('click',function(){ if(c.classList.contains('used')) return; chips.forEach(function(x){ x.classList.remove('sel') }); sel=c; c.classList.add('sel') }) });
    Array.prototype.forEach.call(root.querySelectorAll('.lmk'),function(m){
      m.addEventListener('click',function(){
        if(m.classList.contains('done')) return;
        if(!sel){ say(fb,'اختر اسماً أولاً','bad'); return }
        var k=+m.getAttribute('data-k');
        if(+sel.getAttribute('data-k')===k){
          m.classList.add('done'); sel.classList.add('used'); sel.classList.remove('sel');
          var t=root.querySelector('.ltxt[data-k="'+k+'"]'); if(t) t.classList.add('on'); sel=null; got++;
          say(fb,got<items.length?'✓ صحيح':'✓ ممتاز! سمّيت كل الأجزاء','ok'); if(got===items.length&&onDone) onDone();
        }else{ m.classList.add('shake'); setTimeout(function(){ m.classList.remove('shake') },420); say(fb,'ليس هذا الرقم، حاول مرة أخرى','bad') }
      });
    });
  }

  /* ================= a printable worksheet (one A4 page), opened from a button in the lesson index =================
     S6.worksheet({btn:'…', title:'…', sub:'…', cols:['…'], rows:[['…']], blocks:[{h:'…', n:3}], figure:'<svg…>'}) — black-and-white friendly; «طباعة» prints only the sheet. */
  function worksheet(o){
    var _b=boot;
    boot=function(){
      _b.apply(this,arguments);
      var sh=document.querySelector('#idx .sheet'), h3=sh&&sh.querySelector('h3');
      if(h3){
        h3.insertAdjacentHTML('afterend','<button class="wsbtn" id="bWs" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"/></svg>'+o.btn+'</button>');
        document.getElementById('bWs').addEventListener('click',function(){ var ix=document.getElementById('idx'); if(ix) ix.classList.remove('open'); open() });
      }
    };
    function html(){
      var th=o.cols.map(function(c){ return '<th>'+c+'</th>' }).join('');
      var tr=o.rows.map(function(r){ return '<tr>'+r.map(function(c,i){ return '<td'+(i===0?' class="w1"':'')+'>'+c+'</td>' }).join('')+'</tr>' }).join('');
      var bl=o.blocks.map(function(b){ var ln=''; for(var i=0;i<b.n;i++) ln+='<div class="wl"></div>'; return '<div class="wb"><b>'+b.h+'</b>'+ln+'</div>' }).join('');
      return '<div class="wsbox"><header><div><div class="wh1">'+o.title+'</div><div class="wh2">'+o.sub+'</div></div><div class="wfig">'+(o.figure||'')+'</div></header>'+
        '<div class="wname">الاسم: ............................................ الصف والشعبة: ................</div>'+
        '<table class="wt"><thead><tr>'+th+'</tr></thead><tbody>'+tr+'</tbody></table>'+bl+'</div>';
    }
    function open(){
      var ov=document.getElementById('wsov');
      if(!ov){
        ov=document.createElement('div'); ov.id='wsov'; ov.className='wsov'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-label',o.title);
        ov.innerHTML='<div class="wsbar"><button type="button" class="wprint">طباعة</button><button type="button" class="wclose">إغلاق</button></div><div class="wsheet"></div>';
        document.body.appendChild(ov);
        ov.querySelector('.wclose').addEventListener('click',close);
        ov.querySelector('.wprint').addEventListener('click',function(){ try{ window.print() }catch(e){} });
        ov.addEventListener('click',function(e){ if(e.target===ov) close() });
        document.addEventListener('keydown',function(e){ if(e.key==='Escape') close() });
      }
      ov.querySelector('.wsheet').innerHTML=html(); ov.classList.add('on'); document.documentElement.classList.add('ws-open');
    }
    function close(){ var ov=document.getElementById('wsov'); if(ov) ov.classList.remove('on'); document.documentElement.classList.remove('ws-open') }
    return {open:open,close:close,html:html};
  }
  return {worksheet:worksheet,INK:INK,pic:pic,st:st,cloud:cloud,nbox:nbox,sticky:sticky,down:down,fig:fig,shuf:shuf,FLAB:FLAB,flabHTML:flabHTML,bindFlab:bindFlab,orderHTML:orderHTML,bindOrder:bindOrder,labelHTML:labelHTML,bindLabel:bindLabel};
})();
