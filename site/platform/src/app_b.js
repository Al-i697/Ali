/* ---------- lesson host: the lesson runs in a frame, the class drawer sits beside it ---------- */
var host={id:'',w:null,d:null,poll:0,open:true,openRow:null,query:'',restAsk:0,slides:{},bgPrev:undefined,bgSaved:null};
function bgKey(){try{if(host.bgSaved===null) localStorage.removeItem('l31fx'); else localStorage.setItem('l31fx',host.bgSaved)}catch(e){}}
function pauseBg(){ if(host.bgPrev!==undefined) return; host.bgPrev=BG.tier(); try{host.bgSaved=localStorage.getItem('l31fx')}catch(e){host.bgSaved=null} BG.setTier(0); bgKey() }
function resumeBg(){ if(host.bgPrev===undefined) return; BG.setTier(host.bgPrev); bgKey(); if(host.bgSaved===null) BG.auto(true); host.bgPrev=undefined }

/* online the lesson is a page of the site; in the single-file copy (no server) the lesson text is inside this page and goes in through srcdoc, which keeps it same-origin */
function setFrame(L,n){
  var f=$('#lf'), t=window.OFFLINE_LESSONS&&OFFLINE_LESSONS[L.page];
  if(t){ f.removeAttribute('src'); f.srcdoc=t.replace('<head>','<head><script>try{location.hash="#s'+n+'"}catch(e){}<\/script>') }
  else { f.removeAttribute('srcdoc'); f.src=L.page+'#s'+n }
}
function showLesson(L){
  var d=D(), today=PL.todayISO();
  if(pending){ ctx={classId:pending.classId,date:today,period:pending.period||0,lesson:L.id,slide:0}; pending=null }
  else if(host.id!==L.id){ var cid=d.ui.lastClass&&PL.findClass(d,d.ui.lastClass)?d.ui.lastClass:(d.classes[0]?d.classes[0].id:''); ctx={classId:cid,date:today,period:0,lesson:L.id,slide:0} }
  ctx.lesson=L.id;
  if(ctx.classId&&PL.findClass(d,ctx.classId)) change(function(s){PL.setLastLesson(s,ctx.classId,L.id); s.ui.lastClass=ctx.classId; s.ui.course=L.course});
  $('#pg').classList.add('hide'); $('#lv').classList.remove('hide'); pauseBg(); layoutFrame();
  $$('[data-nav]').forEach(function(b){b.classList.remove('on')});
  if(host.id!==L.id){ host.id=L.id; host.w=null; host.d=null; ctx.slide=host.slides[L.id]||1; setFrame(L,ctx.slide) }
  host.restAsk=0; renderDrawer(); startPoll(); document.title=ar(L.code)+' '+L.title;
  /* when the lesson page can not be reached from here (the site opened as plain files), a button of our own opens the drawer */
  setTimeout(function(){ if(host.id===L.id&&!host.d) floatBtn(true) },2500);
}
function floatBtn(on){
  var b=$('#fbtn');
  if(!on){ if(b) b.remove(); return }
  if(b) return; b=document.createElement('button'); b.id='fbtn'; b.type='button'; b.className='gbtn'; b.style.cssText='position:absolute;left:14px;bottom:14px;z-index:20'; b.innerHTML=ic('users')+'الصف';
  b.addEventListener('click',toggleDrawer); $('#lv').firstChild.appendChild(b);
}
function hideLesson(){
  if($('#lv').classList.contains('hide')) return;
  stopPoll(); floatBtn(false); $('#lv').classList.add('hide'); $('#pick').classList.add('hide'); resumeBg();
  if(document.fullscreenElement&&document.exitFullscreen) try{document.exitFullscreen().catch(function(){})}catch(e){}
  $('#lf').removeAttribute('srcdoc'); $('#lf').src='about:blank'; host.id=''; host.w=null; host.d=null; document.title='منصة الدروس';
}
/* the slide the lesson shows: read from its progress bar (works in both ways of loading), else from its address */
function readSlide(){
  try{
    var segs=host.d&&host.d.querySelectorAll('#prog .seg'); if(segs&&segs.length){ for(var i=0;i<segs.length;i++) if(segs[i].classList.contains('cur')) return i+1 }
    var m=/#s(\d+)/.exec((host.w&&host.w.location.hash)||''); return m?+m[1]:0;
  }catch(e){return 0}
}
function startPoll(){ stopPoll(); host.poll=setInterval(function(){ var n=readSlide(); if(n&&n!==ctx.slide){ctx.slide=n; host.slides[ctx.lesson]=n; renderCtx()} },600) }
function stopPoll(){clearInterval(host.poll); host.poll=0}
function focusLesson(){ try{ if(host.w) host.w.focus() }catch(e){} }
function hostFullscreen(){ try{ var p=document.fullscreenElement?document.exitFullscreen():$('#lv').requestFullscreen(); if(p&&p.catch) p.catch(function(){toast('تعذّر ملء الشاشة من هذه الصفحة. استخدم F11 في المتصفح.')}) }catch(e){} }
function toggleDrawer(){ host.open=!host.open; $('#drawer').classList.toggle('open',host.open); layoutFrame(); updateClassBtn(); if(!host.open) focusLesson() }
/* the lesson player needs about 1000 px of width (its top bar and footer), so when the drawer leaves less the frame keeps that width and is scaled down to fit */
var MINW=1100;
function layoutFrame(){
  var wrap=$('#lfWrap'), f=$('#lf'); if(!wrap||!f) return; var W=wrap.clientWidth, H=wrap.clientHeight; if(!W||!H) return;
  var s=Math.min(1,W/MINW); f.style.width=(s<1?MINW:W)+'px'; f.style.height=(H/s)+'px'; f.style.transform=s<1?'scale('+s+')':'';
}

/* the lesson page is ours (same site): add a "class" button to its top bar, send its home button to the platform, keep full screen on the whole host */
function patchLesson(){
  var f=$('#lf'), w, d; try{w=f.contentWindow; d=f.contentDocument}catch(e){return}
  if(!d||!d.body||!d.querySelector('.app')||!host.id) return;
  host.w=w; host.d=d; floatBtn(false);
  var top=d.querySelector('header.top');
  if(top&&!d.getElementById('bClass')){
    var b=d.createElement('button'); b.type='button'; b.className='tbtn'; b.id='bClass'; b.setAttribute('aria-label','لوحة الصف');
    b.innerHTML='<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">'+PATH.users+'</svg><span></span>';
    top.insertBefore(b,d.getElementById('bNote')||null); b.addEventListener('click',toggleDrawer);
  }
  var hm=d.getElementById('bHome'); if(hm&&!hm.__p){hm.__p=1; hm.addEventListener('click',function(e){e.preventDefault(); e.stopPropagation(); var l=LESSONS[host.id], m=l&&/^([a-z]+)(\d+)$/.exec(l.course); go(m?termHash(m[2],m[1],l.sem):'home')},true)}
  var fs=d.getElementById('bFs'); if(fs&&!fs.__p){fs.__p=1; fs.addEventListener('click',function(e){e.stopImmediatePropagation(); e.preventDefault(); hostFullscreen()},true)}
  if(!d.__p){d.__p=1; d.addEventListener('keydown',function(e){ if((e.key==='f'||e.key==='F')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/^(input|textarea|select)$/i.test((e.target&&e.target.tagName)||'')){e.stopImmediatePropagation(); e.preventDefault(); hostFullscreen()} },true)}
  updateClassBtn(); focusLesson();
}
function updateClassBtn(){
  if(!host.d) return; var b=host.d.getElementById('bClass'); if(!b) return;
  var v=ctx.classId?PL.sessionView(D(),ctx):null, n=v?v.totals.students-v.totals.unrecorded:0;
  b.querySelector('span').textContent='الصف'+(v&&n?' '+ar(n):''); b.style.outline=host.open?'2px solid var(--accent)':'';
}

/* ---------- the class drawer ---------- */
function buildDrawer(){
  $('#drawer').innerHTML='<div class="dr-in"><div class="glass dr">'+
   '<div class="dr-h"><b>الصف</b><select id="dClass" aria-label="الشعبة"></select><div style="flex:1"></div><button class="ib" type="button" id="bEye" aria-label="إخفاء تسجيلات السلوك"></button><button class="ib" type="button" id="bX" aria-label="إغلاق اللوحة">'+ic('close')+'</button></div>'+
   '<div id="dEmpty" class="empty hide"><p>ما أضفت شعبة بعد. أضف شعبتك مرة واحدة وتبقى جاهزة في كل درس.</p><button class="gbtn" type="button" data-act="newclass">'+ic('plus')+'إضافة شعبة</button><button class="sbtn" type="button" data-act="import">'+ic('up2')+'استيراد نسخة</button></div>'+
   '<div id="dBody" style="display:flex;flex-direction:column;gap:10px;flex:1;min-height:0">'+
   '<div class="ctx"><input id="dDate" type="date" aria-label="تاريخ الحصة"><select id="dPer" aria-label="رقم الحصة"></select><span class="tag" id="dLs" style="max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span></div>'+
   '<div class="sum3"><div class="g"><b id="sPart">٠</b>شاركوا</div><div class="y"><b id="sSkip">٠</b>لم يشاركوا</div><div><b id="sRest">٠</b>لم يُسجَّل</div></div>'+
   '<div class="tools"><label class="sq">'+ic('search')+'<input id="dQ" type="search" placeholder="ابحث باسم الطالب" aria-label="بحث"></label><button class="ib" type="button" id="bRand" aria-label="اختر طالباً" title="اختر طالباً">'+ic('dice')+'</button></div>'+
   '<div class="slist" id="slist"></div><div class="dr-f"><button class="sbtn" type="button" id="bRest">لم يشارك لمن تبقّى</button></div></div></div></div>';
  var per='<option value="0">الحصة: غير محددة</option>'; for(var i=1;i<=8;i++) per+='<option value="'+i+'">الحصة '+ar(i)+'</option>'; $('#dPer').innerHTML=per;
  $('#drawer').addEventListener('click',onDrawerClick);
  $('#drawer').addEventListener('change',onDrawerChange);
  $('#dQ').addEventListener('input',function(e){host.query=e.target.value; renderList()});
}
function renderCtx(){
  var l=LESSONS[ctx.lesson]; $('#dLs').textContent=(l?ar(l.code):'')+(ctx.slide?' · شريحة '+ar(ctx.slide):''); $('#dLs').title=l?l.title:''; updateClassBtn();
}
function renderDrawer(){
  if(!$('#dClass')) buildDrawer();
  var d=D(), has=d.classes.length>0; $('#dEmpty').classList.toggle('hide',has); $('#dBody').style.display=has?'flex':'none'; $('#dClass').style.display=has?'':'none';
  $('#bEye').innerHTML=ic(d.ui.hideBehavior?'eyeoff':'eye'); $('#bEye').classList.toggle('on',d.ui.hideBehavior);
  if(!has){updateClassBtn(); return}
  if(!PL.findClass(d,ctx.classId)) ctx.classId=d.ui.lastClass&&PL.findClass(d,d.ui.lastClass)?d.ui.lastClass:d.classes[0].id;
  $('#dClass').innerHTML=d.classes.map(function(c){return '<option value="'+esc(c.id)+'"'+(c.id===ctx.classId?' selected':'')+'>'+esc(c.name)+'</option>'}).join('');
  $('#dDate').value=ctx.date; $('#dDate').max=PL.todayISO(); $('#dPer').value=String(ctx.period||0);
  renderCtx(); renderList();
}
function renderList(){
  var d=D(), v=PL.sessionView(d,ctx); if(!v) return;
  $('#sPart').textContent=ar(v.totals.participating); $('#sSkip').textContent=ar(v.totals.didNot); $('#sRest').textContent=ar(v.totals.unrecorded);
  var rest=$('#bRest'); rest.disabled=!v.totals.unrecorded; rest.textContent=host.restAsk?'تأكيد: «لم يشارك» لـ '+ar(v.totals.unrecorded)+' طلاب':'لم يشارك لمن تبقّى'; rest.classList.toggle('on',!!host.restAsk);
  var q=PL.normAr(host.query), hide=d.ui.hideBehavior;
  var html=v.rows.map(function(r){
    var s=r.student; if(q&&PL.normAr(s.name).indexOf(q)<0) return '';
    var cls='stu'+(r.n>0?' has':(r.n===0?' zero':'')), cnt=r.n===null?'—':(r.n===0?'لا':ar(r.n));
    var recs=hide?'':r.recs.map(function(x){return '<button type="button" class="tag '+(x.kind==='positive'?'good':x.kind==='negative'?'bad':'')+'" data-rm="'+esc(x.id)+'" title="احذف التسجيل">'+esc(x.reason||x.note)+' ×</button>'}).join('');
    var rs='';
    if(host.openRow&&host.openRow.sid===s.id){
      var kind=host.openRow.kind;
      rs='<div class="rs">'+PL.REASONS[kind].map(function(t){return '<button type="button" data-sid="'+esc(s.id)+'" data-kind="'+kind+'" data-reason="'+esc(t)+'">'+esc(t)+'</button>'}).join('')+'</div>'+
         '<div class="cust"><input type="text" maxlength="80" placeholder="سبب آخر" aria-label="سبب آخر" data-cust="'+esc(s.id)+'"><button type="button" class="sbtn mini" data-cust-ok="'+esc(s.id)+'" data-kind="'+kind+'">حفظ</button></div>';
    }
    return '<div class="'+cls+'" data-sid="'+esc(s.id)+'"><button class="nm" type="button" data-a="tap" aria-label="'+esc(s.name)+': شارك"><span class="nt"><span>'+esc(s.name)+'</span><span class="prev">قبل: '+ar(r.before.participated)+'/'+ar(r.before.recorded)+'</span></span><span class="cnt" title="'+(r.n===0?'لم يشارك':'')+'">'+cnt+'</span></button>'+
      '<div class="acts"><button type="button" data-a="minus" aria-label="تراجع">'+ic('minus')+'</button><button type="button" data-a="skip" aria-label="لم يشارك">'+ic('skip')+'</button><button class="pos" type="button" data-a="pos" aria-label="سلوك حسن">'+ic('up')+'</button><button class="neg dn" type="button" data-a="neg" aria-label="سلوك غير حسن">'+ic('up')+'</button></div>'+
      '<div class="recs">'+recs+'</div>'+rs+'</div>';
  }).join('');
  $('#slist').innerHTML=html||'<p class="hint" style="padding:12px">'+(q?'لا يوجد طالب بهذا الاسم.':'لا طلاب في هذه الشعبة.')+'</p>';
  updateClassBtn();
}
function sidOf(el){var r=el.closest('[data-sid]'); return r?r.getAttribute('data-sid'):''}
function onDrawerChange(e){
  var t=e.target, d=D();
  if(t.id==='dClass'){ ctx.classId=t.value; host.openRow=null; change(function(s){s.ui.lastClass=ctx.classId; PL.setLastLesson(s,ctx.classId,ctx.lesson)}); renderDrawer() }
  else if(t.id==='dDate'){ if(PL.validDate(t.value)&&t.value<=PL.todayISO()){ctx.date=t.value; host.openRow=null; renderList()} else {t.value=ctx.date; toast('اختر تاريخاً لا يتجاوز اليوم.')} }
  else if(t.id==='dPer'){ ctx.period=+t.value||0; host.openRow=null; renderList() }
}
function addRecord(sid,kind,reason){
  var r=null; change(function(s){r=PL.addRec(s,ctx,sid,kind,reason,'')}); host.openRow=null; if(!r) toast('تعذّر تسجيل الملاحظة.'); renderList();
}
function onDrawerClick(e){
  var b=e.target.closest('button'); if(!b) return; var pointer=e.detail>0;
  if(b.id==='bX'){toggleDrawer(); return}
  if(b.id==='bEye'){ change(function(s){s.ui.hideBehavior=!s.ui.hideBehavior}); renderDrawer(); toast(D().ui.hideBehavior?'تسجيلات السلوك مخفية عن الشاشة وتبقى محفوظة.':'تسجيلات السلوك ظاهرة.'); if(pointer) focusLesson(); return }
  if(b.id==='bRand'){ pickRandom(); return }
  if(b.id==='bRest'){
    if(!host.restAsk){ host.restAsk=1; renderList(); setTimeout(function(){ if(host.restAsk){host.restAsk=0; renderList()} },4000); return }
    var n=0; host.restAsk=0; change(function(s){n=PL.markRest(s,ctx)}); renderList(); toast('سُجّل «لم يشارك» لـ '+ar(n)+' من الطلاب.'); if(pointer) focusLesson(); return;
  }
  if(b.hasAttribute('data-rm')){
    var id=b.getAttribute('data-rm'), sess=PL.getSession(D(),ctx,false), rec=sess&&sess.recs.filter(function(x){return x.id===id})[0], sc=Object.assign({},ctx);
    if(rec){ var keep=JSON.parse(JSON.stringify(rec)); change(function(s){PL.delRec(s,sc,id)}); renderList(); toast('حُذف التسجيل.',function(){change(function(s){var ss=PL.getSession(s,sc,true); ss.recs.push(keep)}); renderList()}) }
    return;
  }
  if(b.hasAttribute('data-reason')){ addRecord(b.getAttribute('data-sid'),b.getAttribute('data-kind'),b.getAttribute('data-reason')); if(pointer) focusLesson(); return }
  if(b.hasAttribute('data-cust-ok')){ var sid=b.getAttribute('data-cust-ok'), inp=$('[data-cust="'+sid+'"]'); if(inp&&inp.value.trim()) addRecord(sid,b.getAttribute('data-kind'),inp.value); return }
  if(b.hasAttribute('data-act')){ return }
  var a=b.getAttribute('data-a'); if(!a) return; var sid2=sidOf(b); if(!sid2) return;
  var sess2=PL.getSession(D(),ctx,false), cur=sess2&&sess2.part[sid2]!==undefined?sess2.part[sid2]:null;
  if(a==='tap'){ change(function(s){PL.setPart(s,ctx,sid2,(cur||0)+1)}); host.openRow=null }
  else if(a==='minus'){ change(function(s){PL.setPart(s,ctx,sid2,cur>1?cur-1:null)}) }
  else if(a==='skip'){ change(function(s){PL.setPart(s,ctx,sid2,cur===0?null:0)}) }
  else if(a==='pos'||a==='neg'){ var kind=a==='pos'?'positive':'negative'; host.openRow=(host.openRow&&host.openRow.sid===sid2&&host.openRow.kind===kind)?null:{sid:sid2,kind:kind} }
  renderList(); if(pointer&&(a==='tap'||a==='minus'||a==='skip')) focusLesson();
}

/* "choose a student": a random one among those not recorded yet */
function pickRandom(){
  var v=PL.sessionView(D(),ctx); if(!v) return;
  var pool=v.rows.filter(function(r){return r.n===null}); if(!pool.length) pool=v.rows; if(!pool.length) return;
  var box=$('#pick'), who=$('#who'), t=0, target=pool[Math.floor(Math.random()*pool.length)], red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  box.classList.remove('hide'); box.classList.add('rolling'); $('#pickBtns').classList.add('hide');
  (function step(){ t++; who.textContent=pool[Math.floor(Math.random()*pool.length)].student.name;
    if(t<(red?1:16)){ setTimeout(step,60+t*14) } else { who.textContent=target.student.name; box.classList.remove('rolling'); $('#pickBtns').classList.remove('hide'); box.setAttribute('data-who',target.student.id); $('#pickYes').focus() } })();
}
function bindPick(){
  $('#pickYes').addEventListener('click',function(){ var sid=$('#pick').getAttribute('data-who'), sess=PL.getSession(D(),ctx,false), cur=sess&&sess.part[sid]!==undefined?sess.part[sid]:null; change(function(s){PL.setPart(s,ctx,sid,(cur||0)+1)}); $('#pick').classList.add('hide'); renderList(); focusLesson() });
  $('#pickNo').addEventListener('click',pickRandom);
  $('#pickX').addEventListener('click',function(){$('#pick').classList.add('hide'); focusLesson()});
}
