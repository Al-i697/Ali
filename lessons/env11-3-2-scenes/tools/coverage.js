/* Coverage check: every term, figure and key fact of student book 3-2 (pp. 87-101) and of the activity book that belongs to this section must appear somewhere on the slides (text of all slides, with every point shown and every card opened).
   node tools/coverage.js   (after python3 build.py) */
const {chromium}=require('playwright'); const path=require('path');
const TERMS=[
 /* student book: scientific terms boxes, with their English forms */
 ['الكربوهيدرات','Carbohydrate'],['ازدهار الطحالب','Algal bloom'],['العوالق النباتية','Phytoplankton'],
 ['ذاتية التغذية','Autotrophic'],['التمثيل الكيميائي','Chemosynthesis'],['التمثيل الضوئي','Photosynthesis'],['غير ذاتي التغذية','Heterotrophic'],
 ['العوالق الحيوانية','Zooplankton'],['مجدافيات الأرجل','Copepods'],['المثقبات','Foraminifera'],['الكريل','Krill'],['الدياتومات','Diatoms'],['الحيتان البالينية','Baleen whales'],['المحلّلات','Decomposers'],
 ['المفترس','Predator'],['الفريسة','Prey'],['الإنتاجية الأولية','Primary productivity'],['الإنتاجية','Productivity'],
 ['ذاتية التغذية الضوئية','Photoautotrophs'],['المنطقة الضوئية','Photic zone'],['الطحالب الكبيرة','Macroalgae'],['حشائش البحر','Seagrasses'],['المنحدر الحراري','Thermocline'],['تدرّج الكثافة','Pycnocline'],
 ['ذاتية التغذية الكيميائية','Chemoautotroph'],['محبة للظروف القاسية','Extremophiles'],['الفوهات المائية الحرارية','Hydrothermal vents'],['الإثراء الغذائي','Eutrophication'],['صافي الإنتاجية الأولية','Net primary productivity'],['الإنتاجية الثانوية','Secondary productivity'],
 ['هرم الأعداد','Pyramid of numbers'],['هرم الكتلة الحيوية','Pyramid of biomass'],['المحصول القائم','Standing crop'],['هرم الطاقة','Pyramid of energy'],['Cyanobacteria',''],
 /* activity book terms */
 ['المستوى الغذائي','Trophic level'],['الإطار البيئي','Niche'],['السلسلة الغذائية','Food chain'],['الشبكة الغذائية','Food web'],['الجرف القاري','Continental shelf'],['مواطن الحضانة','Nursery habitats'],['كفاءة نقل المستوى الغذائي','TLTE'],
 /* facts and figures */
 ['0.06','1%'],['160','مليار طن'],['نصف الأكسجين',''],['90%',''],['200','m'],['1977',''],['2000','7700'],['C = P + R + F + U',''],['10%',''],
 ['72567','4.54'],['531',''],['3434',''],['8.85',''],['9.43',''],['11.4',''],['13000','15220'],['1.18',''],['11.1',''],['16.7',''],['10800','392'],['11.78',''],['1.17',''],['1.10',''],
 ['6CO','C₆H₁₂O₆'],['32 ATP',''],['ATP',''],
 /* animals and plants named in the book */
 ['نجم البحر',''],['بلح البحر',''],['طحلب الكِلْب',''],['ثعلب البحر',''],['قنفذ البحر',''],['خروف البحر',''],['الكريل',''],['سمك القرش',''],['السوطيات الدوارة',''],['سمك المارلين',''],['أسماك الببغاء',''],['الفقمات',''],
 /* activity 3-2, 3-3 and the practical investigations */
 ['القارة المتجمدة الجنوبية',''],['أمشيتكا',''],['شيميا',''],['المانجروف',''],['سلمون شينوك',''],['المربع القياسي',''],['البوتر',''],['الإنتاجية الأولية الكلية',''],['المتغيرات الضابطة',''],
 /* exams */
 ['الفقمة الرمادية',''],['148396',''],['1732',''],['الصقر',''],['1600',''],
 /* end-of-unit */
 ['18754',''],['كاليفورنيا',''],['النرويجي',''],['5000','589'],
];
(async()=>{
  const file=path.resolve('lessone32s.html'); const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:720}});
  await p.goto('file://'+file+'?pts=all'); await p.waitForTimeout(1500);
  const n=await p.evaluate(()=>document.querySelectorAll('.prog .seg').length); let all='';
  for(let i=1;i<=n;i++){
    await p.goto('file://'+file+'?pts=all#s'+i); await p.reload(); await p.waitForTimeout(900);
    all+=await p.evaluate(()=>{ document.querySelectorAll('.slide.on .rx').forEach(e=>e.classList.remove('hide')); const s=document.querySelector('.slide.on'); const t=s.textContent+' '+(s.shadowRoot?s.shadowRoot.textContent:'')+' '+(document.querySelector('#note')?document.querySelector('#note').textContent:''); return t.replace(/\s+/g,' ') })+'\n';
    /* scene slides: the caption changes at every step, so walk through the steps (from the first) and add each caption */
    const sc=await p.evaluate(()=>{ const s=document.querySelector('.slide.on'); return s.shadowRoot?s.querySelectorAll('.scp').length:0 });
    if(sc){ await p.evaluate(()=>{}); for(let k=0;k<sc;k++){ await p.keyboard.press('ArrowRight'); await p.waitForTimeout(60) } /* back to step 0 */
      for(let k=0;k<sc;k++){ await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(120); all+=await p.evaluate(()=>{ const r=document.querySelector('.slide.on').shadowRoot; const c=r.querySelector('.cap'); return c?c.textContent:'' })+'\n' } }
  }
  const norm=s=>s.replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
  const hay=norm(all); let miss=[];
  TERMS.forEach(t=>{ t.filter(Boolean).forEach(x=>{ if(!hay.includes(norm(x))) miss.push(x) }) });
  console.log('slides read:',n,' items checked:',TERMS.reduce((a,t)=>a+t.filter(Boolean).length,0));
  console.log(miss.length?'MISSING: '+miss.join(' | '):'all items found');
  await b.close();
})();
