/* ---------- motion: one transition per slide change, and a different entrance effect for each block ---------- */
var MOT=(function(){
  var TRS=['push','fade','wipe','zoom','cover','split','blinds','flythrough','pan','circle','flip','gallery','uncover','clock','rotate','flash'];
  var TR_MS={fade:560,push:700,cover:700,uncover:700,zoom:600,flythrough:760,wipe:760,split:760,circle:820,clock:920,blinds:820,flip:920,gallery:820,rotate:700,pan:760,flash:700};
  var CALM_TR=['push','cover','fade'];
  var FULL=['fade','flyR','flyL','flyT','flyB','float','zoom','growTurn','swivel','wipeR','wipeL','wipeB','wipeT','splitH','splitV','shape','diamond','wheel','bars','bounce'];
  var CALM=['fade','float','flyB','flyR','flyL','zoom'], SOFT=['float','fade','flyB'];
  var LEAF='.frm,.panel,.mod,.pr,.opt,.qd,.rc,.mrc,.pq,.goal,.tq,.icard,.gbar,.gbox,.cbox,.callout,.fblk,.flow,.yn,.zr,.pill,.btn,.lead,.big,.sm,h2,h3,h4,p,svg,img,.pic,table,.tile,.score,.team,.stp,.atab,.fsum,.fcmp,.sent,.ls,.lwork,.mslot,.imgwrap,.eq,.say,.nin,.sel,.dots,.gi';
  function rng(seed){var s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}

  /* which transition and which entrance family a slide change uses (the later slide of the pair decides, so going back mirrors going forward) */
  function plan(i,prev,tier){
    var hi=prev<0?i:Math.max(i,prev), tr='fade', pool=[];
    if(tier===1){tr=CALM_TR[hi%3];pool=CALM}
    else if(tier===2){tr=TRS[(hi*7+3)%TRS.length];pool=FULL}
    return {tr:tr,pool:pool,seed:i*131+7,ms:TR_MS[tr]+60,tier:tier};
  }
  function mark(el,pl,dir){
    el.className=el.className.replace(/\btr-\S+/g,'').replace(/\s+/g,' ').trim();
    el.style.setProperty('--dx',dir>0?-1:1); el.style.setProperty('--tdur',(pl.ms-60)+'ms'); el.classList.add('tr-'+pl.tr);
  }
  function unmark(el){el.className=el.className.replace(/\btr-\S+/g,'').replace(/\s+/g,' ').trim()}

  /* blocks that should enter one by one: skip wrappers without a look of their own, hidden steps and anything already animated or transformed */
  function wrapper(n){
    var cs=getComputedStyle(n);
    if(cs.backgroundImage!=='none'||parseFloat(cs.borderTopWidth)>0||parseFloat(cs.borderLeftWidth)>0||parseFloat(cs.borderBottomWidth)>0) return false;
    var bg=cs.backgroundColor; return !bg||bg==='transparent'||bg==='rgba(0, 0, 0, 0)';
  }
  function collect(n,d,out){
    for(var i=0;i<n.children.length;i++){
      var e=n.children[i], cs=getComputedStyle(e);
      if(cs.display==='none'||cs.visibility==='hidden'||cs.position==='absolute'||cs.position==='fixed'||parseFloat(cs.opacity)<1||cs.transform!=='none'||cs.animationName!=='none') continue;
      var r=e.getBoundingClientRect(); if(r.width<8||r.height<8) continue;
      if(d<3&&e.children.length>1&&!e.matches(LEAF)&&wrapper(e)) collect(e,d+1,out); else out.push(e);
    }
  }
  var TR_NOTE='';
  var DUR={bounce:780,swivel:760,wheel:820,bars:760,shape:760,diamond:780,growTurn:720};
  function enter(el,pl){
    if(!pl.pool.length) return;
    var root=el.querySelector('.body')||el, T=[], rnd=rng(pl.seed), pool=pl.pool.slice(), k, j, last='';
    for(k=pool.length-1;k>0;k--){j=Math.floor(rnd()*(k+1));var t=pool[k];pool[k]=pool[j];pool[j]=t}
    collect(root,0,T); T=T.slice(0,16);
    var base=pl.tr==='fade'?200:Math.round(TR_MS[pl.tr]*.5), step=70;
    T.forEach(function(t,n){
      var eff=pool[n%pool.length]; if(eff===last) eff=pool[(n+1)%pool.length]; last=eff;
      t.classList.add('fx','e-'+eff); t.style.setProperty('--fdl',(base+Math.min(n,9)*step)+'ms'); t.style.setProperty('--fd',(DUR[eff]||680)+'ms');
      var done=function(ev){ if(ev&&ev.target!==t) return; t.classList.remove('fx','e-'+eff); t.style.removeProperty('--fdl'); t.style.removeProperty('--fd'); t.removeEventListener('animationend',done) };
      t.addEventListener('animationend',done); setTimeout(done,base+9*step+1400);
    });
  }
  return {plan:plan,mark:mark,unmark:unmark,enter:enter};
})();
