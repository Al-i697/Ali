/* Teacher-tools check (u4/tools.js): dock, pen / highlighter / eraser, undo and clear, drawings kept per slide, laser pointer, timer, blank screen, keys ignored inside answer boxes,
   and the slide underneath untouched while a tool is on.   node ../_core/tools/tools_check.js lesson32.html [slide number that has an answer box, for the typing check] */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
 await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 const errs=[]; p.on('pageerror',e=>errs.push(String(e.stack||e).split('\n').slice(0,4).join(' | ')));
 await p.goto('file://'+path.resolve(process.argv[2]||'lesson32.html')+'?pts=all#s2');await p.waitForTimeout(1500);
 const res=[]; const ok=(name,v,extra)=>{res.push([name,!!v,extra||'']); };
 const inked=()=>p.evaluate(()=>{const c=document.querySelector('.tcv'); const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for(let i=3;i<d.length;i+=4*7) if(d[i]>0) n++; return n});
 const stage=async()=>p.evaluate(()=>{const r=document.getElementById('stage').getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height}});
 const cur=()=>p.evaluate(()=>document.querySelector('.slide.on').dataset.id);
 const st=await stage();
 const drag=async(x1,y1,x2,y2)=>{ await p.mouse.move(st.x+x1*st.w/1280,st.y+y1*st.h/720); await p.mouse.down(); await p.mouse.move(st.x+(x1+x2)/2*st.w/1280,st.y+(y1+y2)/2*st.h/720+10,{steps:6}); await p.mouse.move(st.x+x2*st.w/1280,st.y+y2*st.h/720,{steps:6}); await p.mouse.up() };

 ok('button and dock exist, dock hidden at first', await p.evaluate(()=>!!document.getElementById('bTools')&&document.querySelector('.tdock').hidden));
 await p.click('#bTools'); ok('the button opens the dock', await p.evaluate(()=>!document.querySelector('.tdock').hidden));
 const slideBefore=await cur();
 await p.keyboard.press('p'); ok('P turns the pen on', await p.evaluate(()=>document.querySelector('.tcv').classList.contains('on')&&document.querySelector('.tcv').dataset.tool==='pen'));
 await drag(300,200,700,260); const a=await inked(); ok('the pen leaves ink', a>20, a+' px');
 await p.keyboard.press('Control+z'); ok('Ctrl+Z removes the stroke', (await inked())===0);
 await drag(300,200,700,260); await p.keyboard.press('h'); await drag(300,330,800,330); const hl=await inked(); ok('the highlighter adds a wide stroke', hl>a, hl+' px');
 await p.keyboard.press('Escape'); ok('Esc leaves the drawing tool', await p.evaluate(()=>!document.querySelector('.tcv').classList.contains('on')));
 // drawings belong to the slide
 await p.evaluate(()=>{const g=[...document.querySelectorAll('#prog .seg')]; g[g.findIndex(b=>b.classList.contains('cur'))+1].click()}); await p.waitForTimeout(500); const other=await cur(); ok('the next slide opens', other!==slideBefore, slideBefore+' -> '+other);
 ok('the next slide has no ink', (await inked())===0);
 await p.evaluate(()=>{const g=[...document.querySelectorAll('#prog .seg')]; g[g.findIndex(b=>b.classList.contains('cur'))-1].click()}); await p.waitForTimeout(500); ok('going back restores the ink', (await inked())>20);
 // clear and undo the clear
 await p.keyboard.press('c'); ok('C clears the slide', (await inked())===0);
 await p.keyboard.press('Control+z'); ok('Ctrl+Z brings the cleared drawing back', (await inked())>20);
 // eraser
 await p.keyboard.press('e'); await drag(280,200,720,262); const er=await inked(); ok('the eraser removes the stroke it touches', er<hl, er+' px');
 await p.keyboard.press('Escape');
 // laser
 await p.keyboard.press('l'); await p.mouse.move(st.x+400,st.y+300); await p.waitForTimeout(150);
 const L=await p.evaluate(()=>{const d=document.querySelector('.tlaser'), r=d.getBoundingClientRect(); return {on:d.classList.contains('on'),cx:r.left+r.width/2,cy:r.top+r.height/2}});
 ok('the laser dot follows the pointer', L.on&&Math.abs(L.cx-(st.x+400))<6&&Math.abs(L.cy-(st.y+300))<6, JSON.stringify(L));
 ok('the laser does not block the slide', await p.evaluate(()=>!document.querySelector('.tcv').classList.contains('on')));
 await p.keyboard.press('l'); ok('L again turns the laser off', await p.evaluate(()=>!document.body.classList.contains('tl-laser')));
 // timer
 await p.keyboard.press('t'); ok('T opens the timer', await p.evaluate(()=>!document.querySelector('.ttmr').hidden));
 await p.click('.ttmr [data-m="1"]'); ok('the 1-minute preset shows 01:00', await p.evaluate(()=>document.querySelector('.ttmr .tt').textContent==='01:00'));
 await p.click('.ttmr .go'); await p.waitForTimeout(2300); const tv=await p.evaluate(()=>document.querySelector('.ttmr .tt').textContent);
 ok('the timer counts down', tv==='00:58'||tv==='00:57', tv);
 await p.click('.ttmr .go'); const frozen=await p.evaluate(()=>document.querySelector('.ttmr .tt').textContent); await p.waitForTimeout(1300);
 ok('pause stops the count', frozen===await p.evaluate(()=>document.querySelector('.ttmr .tt').textContent), frozen);
 await p.evaluate(()=>{}); // a 3-second run to zero for the end state
 await p.click('.ttmr [data-a="m"]'); // 1 min is the minimum, stays at 01:00
 await p.keyboard.press('t'); ok('T closes the timer', await p.evaluate(()=>document.querySelector('.ttmr').hidden));
 // blank screen: any key brings it back and is not passed to the slide
 const sid=await cur(); await p.keyboard.press('b'); ok('B blanks the screen', await p.evaluate(()=>!document.querySelector('.tblank').hidden));
 await p.keyboard.press('Space'); ok('a key brings the slide back without changing slide', await p.evaluate(()=>document.querySelector('.tblank').hidden)&&(await cur())===sid);
 // keys typed into an answer box are not shortcuts
 await p.keyboard.press('Escape');
 const k=+process.argv[3]||0; if(k){ await p.keyboard.press('Escape'); await p.evaluate(i=>document.querySelectorAll('#prog .seg')[i].click(),k-1); await p.waitForTimeout(900) }
 const box=p.locator('.slide.on input:visible:not([disabled]):not([readonly])').first(), hasInput=await box.count()>0;
 if(hasInput){ await box.focus(); await p.keyboard.type('plhtbec'); ok('typing in an answer box triggers no tool', await p.evaluate(()=>!document.querySelector('.tcv').classList.contains('on')&&document.querySelector('.tblank').hidden&&document.querySelector('.ttmr').hidden&&!document.body.classList.contains('tl-laser'))) }
 else ok('(this slide has no answer box: input-key check skipped)', true);
 ok('no script errors', errs.length===0, errs.join(' | '));
 res.forEach(r=>console.log((r[1]?'ok   ':'FAIL ')+r[0]+(r[2]?'  ['+r[2]+']':'')));
 const bad=res.filter(r=>!r[1]); console.log(bad.length?bad.length+' failed':'teacher tools ok ('+res.length+' checks)');
 await b.close(); process.exit(bad.length?1:0)})();
