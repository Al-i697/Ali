/* the fertiliser bag (NPK 5-10-5): an application of percentage by mass at the END of the lesson, after the activity and before the book questions (the teacher's order, not the decks') */
slide({id:'npk',ch:6,title:'سماد على كيس... وأرقام',tag:'تصويت',
 html:function(){return ''+
  '<div class="frm brk" style="width:300px;flex:none;align-self:center;padding:14px">'+bagArt()+'</div>'+
  '<div class="col grow" style="gap:12px">'+
   '<p class="lead" style="font-size:28px"><b>ماذا تعني الأرقام ٥-١٠-٥ المطبوعة على الكيس؟</b></p>'+
   pollHTML(['عدد ذرات كل عنصر داخل الكيس','النسبة المئوية (بالكتلة) للنيتروجين N والفوسفور P والبوتاسيوم K في السماد','رقم الدفعة وتاريخ الإنتاج'])+
   '<div style="display:flex;gap:12px;align-items:center"><button class="btn acc sm" type="button" id="rv">اكشف الإجابة</button><span class="sm muted">اضغط + مقابل كل يد مرفوعة</span></div>'+
   '<div class="panel hide" id="calc" style="display:none"><p class="big" style="font-size:27px">لو كيس السماد <b class="num">20 kg</b>: كم كيلوجراماً من النيتروجين (٥٪) فيه؟</p><div style="display:flex;align-items:center;gap:18px;margin-top:8px">'+ninHTML('n','kg','sm')+'<div class="fb" style="flex:1"></div></div></div>'+
  '</div>';},
 init:function(el){
  var p=bindPoll($('.poll',el),1,function(){var c=$('#calc',el); c.style.display=''; c.classList.remove('hide'); c.classList.add('up')});
  $('#rv',el).addEventListener('click',function(){p.reveal(); this.classList.add('hide')});
  var fb=$('#calc .fb',el);
  bindNum($('#calc .nin',el),1,0.01,function(ok){ if(ok) say(fb,'✓ ٥٪ من ٢٠ kg = ١ kg. النسب تتحول لكميات حقيقية!','ok'); else say(fb,'ركّز: ٥٪ من ٢٠ kg','bad') });
 },
 note:'<ul><li>الإجابة (ب): ٥٪ نيتروجين، ١٠٪ فوسفور، ٥٪ بوتاسيوم (كتاب الطالب ص٥٣، الصورة ٣-١: «الأرقام ٥-١٠-٥ المطبوعة على الكيس تشير إلى النسب المئوية لتلك المغذّيات في السماد»).</li><li>موضع الشريحة بطلب المعلم: في آخر الدرس، تطبيقاً على النسبة المئوية بالكتلة. الكتاب نفسه يذكر الكيس في مقدمة الموضوع (ص٥٢–٥٣) وفي سؤال نهاية الوحدة ١ (كبريتات الأمونيوم)؛ يمكن نقلها للبداية بسطر واحد.</li><li>السؤال الحسابي (كيس ٢٠ kg) من عندي.</li></ul>'});
