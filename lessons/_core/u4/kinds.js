/* the kind of every slide, shown with one fixed colour and one fixed word (teacher's request, November 2026):
   تمهيد (lead-in) · شرح (explanation) · مثال (worked example) · نشاط (activity or lab) · تدريب (questions to answer) · امتحان (past exams) · تذكرة خروج · الواجب.
   Where it shows: a pill above the title (opposite corner to the page badge), a coloured line under each segment of the progress bar,
   the word in the footer, and a colour key plus a small tag on every row of the lesson index.
   The kind is worked out from the slide's id, title and tag; a lesson can override any slide with  var KINDS={slideId:'act',...}  in src/pages.js.
   Shared by every lesson: build(..., kinds=True) in _core/tools/u4build.py adds this file and u4/kinds.css. */
(function(){
  var K={
    intro:['تمهيد'],
    learn:['شرح'],
    ex:['مثال'],
    act:['نشاط'],
    ask:['تدريب'],
    exam:['امتحان'],
    exit:['تذكرة خروج'],
    hw:['الواجب']
  };
  var ORDER=['intro','learn','ex','act','ask','exam','exit','hw'];
  /* suggested minutes for a slide of each kind (used in the teacher notes) */
  var MIN={intro:3,learn:4,ex:6,act:10,ask:6,exam:6,exit:3,hw:1};
  function kindOf(o){
    var id=o.id||'', t=o.title||'', tg=o.tag||'';
    if(typeof KINDS!=='undefined'&&KINDS[id]) return KINDS[id];
    if(id==='goals') return 'intro';
    if(id==='hw') return 'hw';
    if(/^(tk\d*|final)$/.test(id)||/^تذكرة/.test(t)) return 'exit';
    if(/^(past|exq|noo)/.test(id)||/امتحان/.test(t)||/امتحان/.test(tg)) return 'exam';
    if(/^lab/.test(id)||/^(نشاط|المختبر)/.test(t)||/سباق|مسابقة/.test(t+' '+tg)) return 'act';
    if(/^مثال/.test(t)) return 'ex';
    if(/^(سؤال|أسئلة|السؤال|السؤالان|تمرين|ورقة العمل|كتاب النشاط|كتاب الطالب)/.test(t)||/^eou/.test(id)) return 'ask';
    return o.ch===0?'intro':'learn';
  }
  var _s=slide;
  slide=function(o){
    var k=kindOf(o); o.kind=k;
    var oi=o.init;
    o.init=function(el){
      var hd=el.querySelector('.hd');
      if(hd&&!hd.querySelector('.kd')){
        var b=document.createElement('span'); b.className='kd'; b.setAttribute('data-k',k); b.setAttribute('data-kd',K[k][0]);
        b.innerHTML='<i></i><span>'+K[k][0]+'</span>'; hd.appendChild(b);
      }
      if(oi) return oi.apply(this,arguments);
    };
    _s(o);
  };
  /* the bar, the footer and the index (built by boot) */
  var _boot=boot;
  boot=function(){
    _boot.apply(this,arguments);
    $$('.seg',PROG).forEach(function(b,j){ var s=SLIDES[j]; if(s&&s.kind){ b.setAttribute('data-k',s.kind); b.title=(s.title||'الغلاف')+' · '+K[s.kind][0] } });
    var sh=$('.sheet',IDX);
    if(sh){
      var used={}; SLIDES.forEach(function(s){ if(s.kind) used[s.kind]=1 });
      var key='<div class="kkey" aria-label="ألوان أنواع الشرائح">'+ORDER.filter(function(k){return used[k]}).map(function(k){return '<span data-k="'+k+'"><i></i>'+K[k][0]+'</span>'}).join('')+'</div>';
      var tot=0; SLIDES.forEach(function(s){ if(s.kind) tot+=MIN[s.kind]||0 });
      key+='<p class="ktot">الزمن المقترح للدرس كاملاً نحو <b>'+ar(tot)+'</b> دقيقة (تقريبي، يكفي أكثر من حصة: اختر منه ما يناسب حصتك).</p>';
      var h3=$('h3',sh); if(h3) h3.insertAdjacentHTML('afterend',key);
      $$('.it',sh).forEach(function(b){ var s=SLIDES[+b.getAttribute('data-i')]; if(s&&s.kind){ b.setAttribute('data-k',s.kind); b.insertAdjacentHTML('beforeend','<b class="kl">'+K[s.kind][0]+'</b>') } });
    }
    paintChrome();
  };
  var _pc=paintChrome;
  paintChrome=function(){
    _pc.apply(this,arguments);
    var s=SLIDES[CUR], sm=WHERE&&WHERE.querySelector('small');
    if(s&&s.kind&&sm&&!/^\s*(تمهيد|شرح|مثال|نشاط|تدريب|امتحان|تذكرة خروج|الواجب) ·/.test(sm.textContent)) sm.textContent=K[s.kind][0]+' · '+sm.textContent;
    /* the suggested time for a slide of this kind, at the top of the teacher note (a rough guide, ours: «من عندي») */
    var h4=NOTE&&NOTE.querySelector('h4'); if(s&&s.kind&&h4&&!NOTE.querySelector('.tmin')) h4.insertAdjacentHTML('afterend','<p class="tmin">⏱ الزمن المقترح: <b>'+mins(MIN[s.kind])+'</b> <small>(تقريبي)</small></p>');
  };
  function mins(m){ return m===1?'دقيقة':(m===2?'دقيقتان':ar(m)+(m<=10?' دقائق':' دقيقة')) }
  window.SLIDEKIND={K:K,ORDER:ORDER,MIN:MIN,of:kindOf};
})();
