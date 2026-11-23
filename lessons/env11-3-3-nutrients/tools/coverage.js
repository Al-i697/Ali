/* Coverage check: every term, figure and key fact of student book 3-3 (pp. 101-111, end-of-unit questions 3, 7, 11) and of the activity book that belongs to this section (activity 3-4, end-of-unit 3 and 4)
   must appear somewhere on the slides (text of all slides, with every point shown and every card opened, and the teacher notes)
   node tools/coverage.js   (after python3 build.py) */
const {chromium}=require('playwright'); const path=require('path');
const TERMS=[
 /* student book: scientific terms boxes, with their English forms */
 ['المغذي','Nutrient'],['التمثيل الغذائي','Assimilation'],['دورات المغذيات','Nutrient cycles'],['زمن البقاء','Residence time'],['الإخراج','Excretion'],
 ['التيار الصاعد','Upwelling'],['التيار الهابط','Downwelling'],['مصرف','Sink'],['مصدر','Source'],['الثلج البحري','Marine snow'],['الحصاد','Harvesting'],
 ['المنطقة الميتة','Dead zone'],['ازدهار الطحالب',''],['الفوهات المائية الحرارية',''],['المحللات',''],
 /* activity book terms */
 ['غير حيوي','Abiotic'],['حيوي','Biotic'],
 /* the elements and what they are used for */
 ['النيتروجين',''],['الكربون',''],['المغنيسيوم',''],['الكالسيوم',''],['الفسفور',''],['الكلوروفيل',''],['DNA',''],['الكبريت',''],['السيستين',''],['الميثيونين',''],['الحديد',''],
 ['السليلوز',''],['النشا',''],['الإنزيمات',''],['الهرمونات',''],['الكربوهيدرات',''],['الدهون',''],['البروتينات',''],
 /* forms of nutrients and the five processes */
 ['ذوبان غازات الغلاف الجوي',''],['الإخراج والتحلل',''],['الجريان السطحي',''],['النشاط التكتوني',''],['التعرية',''],['التجوية',''],['رماد',''],['الماجما',''],['يوريا',''],['الأمونيا',''],
 ['درجة حرارة الماء',''],['اختلاط الماء',''],['الرياح',''],['الشاطئ',''],['الإنتاجية',''],['العامل المحدد',''],['العوالق النباتية',''],['البكتيريا',''],['الفطريات',''],
 /* facts and figures of the tables and the text */
 ['17 000 000',''],['1 000 000',''],['100 000',''],['20 000',''],['2000',''],['19345',''],['10752',''],['2701',''],['1295',''],['416',''],['145',''],['0.50',''],['0.07',''],
 ['25%','5%'],['90.9',''],['2016',''],['120','kg'],['700',''],['3 مرات',''],['1500','km'],['1.7 مليون',''],['12 مليون',''],['13 000',''],['22 730',''],['2017',''],['1998',''],['2018',''],['13 084',''],['82 مليون',''],['5000',''],['1997',''],['77 مليار',''],['1950',''],
 /* case studies */
 ['السلمون',''],['الدببة',''],['النسور',''],['النترات',''],['كولومبيا البريطانية',''],['المسيسيبي',''],['خليج المكسيك',''],['NOAA',''],['الروبيان',''],['المحار',''],['الأراضي الرطبة',''],['سهول الفيضانات',''],['معالجة الفضلات',''],['الأسمدة',''],['الطحالب',''],
 /* the carbon cycle and the activity book */
 ['A','B'],['الاحتراق',''],['التنفّس',''],['التحلل',''],['الصفائح التكتونية',''],['تكوّن الصخور',''],['الرواسب',''],
 /* exams */
 ['التونة',''],['الصيد الجائر',''],['2024/2025',''],
];
(async()=>{
  const file=path.resolve('lessone33.html'); const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:720}});
  await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await p.goto('file://'+file+'?pts=all'); await p.waitForTimeout(1500);
  const n=await p.evaluate(()=>document.querySelectorAll('.prog .seg').length); let all='';
  for(let i=1;i<=n;i++){
    await p.goto('file://'+file+'?pts=all#s'+i); await p.reload(); await p.waitForTimeout(900);
    all+=await p.evaluate(()=>{ document.querySelectorAll('.slide.on .rx,.slide.on .cya').forEach(e=>e.classList.remove('hide')); const s=document.querySelector('.slide.on'); const t=s.textContent+' '+(document.querySelector('#note')?document.querySelector('#note').textContent:''); return t.replace(/\s+/g,' ') })+'\n';
  }
  const norm=s=>s.replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
  const hay=norm(all); let miss=[];
  TERMS.forEach(t=>{ t.filter(Boolean).forEach(x=>{ if(!hay.includes(norm(x))) miss.push(x) }) });
  console.log('slides read:',n,' items checked:',TERMS.reduce((a,t)=>a+t.filter(Boolean).length,0));
  console.log(miss.length?'MISSING: '+miss.join(' | '):'all items found');
  await b.close();
})();
