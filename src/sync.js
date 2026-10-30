/* ───────── الربط بين الأجهزة (اختياري) ─────────
   كل جهاز يشتغل على بياناته المحلية حتى لو انقطع النت. الربط يرسل كل سجل جديد أو معدّل لخدمة سحابية (Supabase)
   بعد تشفيره على الجهاز نفسه (الخدمة ما تقرأ شيئاً)، ويستقبل سجلات الأجهزة الأخرى ويدمجها.
   • آخر تعديل على السجل يغلب (بترتيب الخدمة). الفواتير والسداد والمصروفات حركات جديدة فلا تتعارض أصلاً
   • الأرصدة والمخزون والورديات تُحسب من الحركات، فتتطابق في كل الأجهزة تلقائياً
   • ما يُرفع: حركات جديدة/معدّلة فقط (صندوق صادر محفوظ في القاعدة مع السجل نفسه، فلا يضيع شيء لو انقطع التطبيق) */
const SY={on:false,cfg:null,key:null,shop:'',cursor:0,seed:null,dirty:false,out:new Map(),fp:{},seen:new Map(),idx:{},devs:new Map(),
  st:'off',err:'',warn:'',last:0,fails:0,nextTry:0,joining:false,running:false,again:false,pt:0,onChange:null,onStatus:null};
const SY_LISTS={customers:()=>S.customers,suppliers:()=>S.suppliers,users:()=>S.users,stock:()=>STOCK};
const SY_KV=['customers','suppliers','users','products','stock'];
const SY_SEED=['shop','devs',...SY_KV,...DB.APPEND];
const SY_PAGE=400,SY_AGE=30,SY_PUSH=150;
const syKey=(s,id)=>s+':'+id;
const syT=r=>r.t!=null?r.t:r.start;

/* ── التشفير: المفتاح والمعرّف السري للمحل يُشتقان من الرمز السري الذي ينتقل بين الأجهزة فقط ── */
const syTE=new TextEncoder(),syTD=new TextDecoder();
const syHex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const syB64=u=>{let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);};
const syUn64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const syRand=n=>syHex(crypto.getRandomValues(new Uint8Array(n)));
async function syKeys(){
  const sha=s=>crypto.subtle.digest('SHA-256',syTE.encode(s));
  SY.shop=syHex(await sha('shop|'+SY.cfg.s));
  SY.key=await crypto.subtle.importKey('raw',await sha('key|'+SY.cfg.s),'AES-GCM',false,['encrypt','decrypt']);
}
async function syEnc(o){
  const iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},SY.key,syTE.encode(JSON.stringify(o)))),r=new Uint8Array(12+ct.length);
  r.set(iv);r.set(ct,12);return syB64(r);
}
async function syDec(s){
  let r;try{r=syUn64(s);return JSON.parse(syTD.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:r.subarray(0,12)},SY.key,r.subarray(12))));}
  catch(e){throw new Error('تعذّر فك التشفير — رمز الربط غير صحيح أو البيانات تالفة');}
}

/* ── رمز الربط: رابط المشروع + المفتاح العام + الرمز السري ── */
const syUrl=u=>{u=String(u||'').trim().replace(/\/+$/,'').replace(/\/rest\/v1$/,'');if(!/^https?:\/\/[A-Za-z0-9.-]+(:\d+)?$/.test(u))throw new Error('رابط المشروع غير صحيح، لازم يبدأ بـ https://');return u;};
const syCode=()=>'CAFE1.'+btoa(JSON.stringify({u:SY.cfg.u,k:SY.cfg.k,s:SY.cfg.s})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function syParse(t){
  const m=/^CAFE1\.([A-Za-z0-9_-]+)$/.exec(String(t||'').replace(/\s+/g,''));let o=null;
  if(m)try{const b=m[1].replace(/-/g,'+').replace(/_/g,'/');o=JSON.parse(atob(b+'='.repeat((4-b.length%4)%4)));}catch(e){}
  if(!o||typeof o.u!=='string'||typeof o.k!=='string'||typeof o.s!=='string'||o.s.length<16)throw new Error('رمز الربط غير صحيح، انسخه كاملاً من الجهاز الأول');
  return {u:syUrl(o.u),k:o.k,s:o.s};
}

/* ── الاتصال بالخدمة (دوال SQL عبر REST) ── */
async function syRpc(fn,args){
  const c=SY.cfg,ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),25000),h={apikey:c.k,'Content-Type':'application/json'};
  if(c.k.startsWith('eyJ'))h.Authorization='Bearer '+c.k;
  try{
    const r=await fetch(c.u+'/rest/v1/rpc/'+fn,{method:'POST',headers:h,body:JSON.stringify(args),signal:ctl.signal});
    if(!r.ok){let j=null;try{j=await r.json();}catch(e){}const m=(j&&(j.message||j.hint||j.error_description||j.msg))||'';
      if(/PGRST202|Could not find the function/.test(JSON.stringify(j||'')))throw new Error('كود الإعداد ما نُفّذ في Supabase بعد (SQL Editor ← Run)');
      if(r.status===401||r.status===403)throw new Error('المفتاح غير صحيح أو غير مسموح');
      throw new Error('الخدمة ردّت بخطأ '+r.status+(m?' · '+m:''));}
    return r.status===204?null:await r.json();
  }catch(e){if(e&&e.name==='AbortError')throw new TypeError('انتهت مهلة الاتصال');throw e;}
  finally{clearTimeout(tm);}
}
const syNet=e=>!!e&&(e.name==='TypeError'||navigator.onLine===false);

/* ── السجلات: كل شيء يُرفع كسجل (المخزن + الرقم) ── */
const syShop=()=>({store:S.store,vat:S.vat,rec:S.meta.rec,created:S.meta.created});
const syMap=s=>SY.idx[s]||(SY.idx[s]=new Map(S[s].map(r=>[r.id,r])));
const syRecs=k=>k==='products'?Object.entries(PROD):SY_LISTS[k]().map(r=>[r.id,r]);
function syFind(s,id){
  if(s==='shop')return syShop();
  if(s==='devs')return id===SY.cfg.dev?{id,dx:SY.cfg.dx,name:SY.cfg.name,at:SY.cfg.at}:null;
  if(s==='products')return PROD[id]||null;
  if(SY_LISTS[s])return SY_LISTS[s]().find(r=>r.id===id)||null;
  return syMap(s).get(id)||null;
}
const syPayload=e=>{if(e.del)return {s:e.s,id:e.id,del:1};const r=syFind(e.s,e.id);return r?{s:e.s,id:e.id,v:r}:null;};
SY.mark=(s,id,del,rec)=>{const k=syKey(s,id),e=SY.out.get(k);SY.out.set(k,{s,id,del:!!del,ver:(e?e.ver:0)+1});SY.dirty=true;if(rec&&SY.idx[s])SY.idx[s].set(id,rec);};
function syDiff(k){   /* القوائم الصغيرة (عملاء، أصناف...): نكتشف أي سجل تغيّر أو انحذف */
  const old=SY.fp[k]||(SY.fp[k]=new Map()),seen=new Set();
  for(const [id,r] of syRecs(k)){seen.add(id);const f=JSON.stringify(r,imgFp);if(old.get(id)!==f){old.set(id,f);SY.mark(k,id);}}
  for(const id of [...old.keys()])if(!seen.has(id)){old.delete(id);SY.mark(k,id,true);}
}
function syShopDiff(){const f=JSON.stringify(syShop(),imgFp);if(f!==SY.fp.shop){SY.fp.shop=f;SY.mark('shop','shop');}}
SY.kvChanged=k=>{if(k==='store'||k==='meta')syShopDiff();else if(SY_KV.includes(k))syDiff(k);};
function syInitFp(){SY.fp={};SY.idx={};for(const k of SY_KV)SY.fp[k]=new Map(syRecs(k).map(([id,r])=>[id,JSON.stringify(r,imgFp)]));SY.fp.shop=JSON.stringify(syShop(),imgFp);}

/* ── حالة الربط المحفوظة ── */
SY.state=()=>({cfg:SY.cfg,cursor:SY.cursor,seed:SY.seed,out:[...SY.out.values()].map(e=>[e.s,e.id,e.del?1:0])});
SY.load=v=>{SY.cfg=v.cfg;SY.cursor=v.cursor||0;SY.seed=v.seed||null;SY.out=new Map();for(const [s,id,d] of v.out||[])SY.out.set(syKey(s,id),{s,id,del:!!d,ver:1});SY.on=!!SY.cfg;};
SY.status=()=>{if(SY.onStatus)SY.onStatus();};

/* ── الإرسال ── */
async function syPushList(list){
  const rows=[];
  await Promise.all(list.map(async e=>{const p=syPayload(e);if(p)rows.push({k:syKey(e.s,e.id),dev:SY.cfg.dev,d:await syEnc(p)});}));
  let chunk=[],sz=0;const send=async()=>{if(chunk.length)await syRpc('cafe_push',{p_shop:SY.shop,p_rows:chunk});chunk=[];sz=0;};
  for(const r of rows){if(sz+r.d.length>1200000)await send();chunk.push(r);sz+=r.d.length;}
  await send();
}
async function syFlush(){
  while(SY.out.size){
    const batch=[...SY.out.values()].slice(0,SY_PUSH),vers=batch.map(e=>[syKey(e.s,e.id),e.ver]);
    await syPushList(batch);
    for(const [k,v] of vers){const e=SY.out.get(k);if(e&&e.ver===v)SY.out.delete(k);}
    SY.dirty=true;
  }
}
const syIds=s=>s==='shop'?['shop']:s==='devs'?[SY.cfg.dev]:s==='products'?Object.keys(PROD):(SY_LISTS[s]?SY_LISTS[s]():S[s]).map(r=>r.id);
async function sySeed(prog){   /* رفع كل البيانات الموجودة أول مرة؛ يكمل من حيث وقف لو انقطع */
  let tot=0,done=0;const ids=SY_SEED.map(syIds);ids.forEach(a=>tot+=a.length);
  for(let n=0;n<SY.seed.n;n++)done+=ids[n].length;
  for(let n=SY.seed.n;n<SY_SEED.length;n++){
    const s=SY_SEED[n],a=ids[n];
    for(let i=n===SY.seed.n?SY.seed.i:0;i<a.length;i+=SY_PUSH){
      await syPushList(a.slice(i,i+SY_PUSH).map(id=>({s,id})));
      SY.seed={n,i:i+SY_PUSH};SY.dirty=true;persist();done=Math.min(tot,done+SY_PUSH);prog&&prog(done,tot);
    }
    SY.seed={n:n+1,i:0};
  }
  SY.cursor=await syRpc('cafe_head',{p_shop:SY.shop});   /* ما نحتاج نسحب ما رفعناه نحن */
  SY.seed=null;SY.dirty=true;persist();
}

/* ── الاستقبال والدمج ── */
const syReplace=(o,v)=>{for(const k in o)delete o[k];Object.assign(o,v);};
function syInsert(a,r){let i=a.length;const t=syT(r);while(i>0&&syT(a[i-1])>t)i--;a.splice(i,0,r);return i;}
function syApply(items){   /* items بترتيب الخدمة؛ كله متزامن حتى ما يتخلل تعديل محلي بين الدمج وتسجيل البصمات */
  persist();   /* أي تغيير محلي معلّق يدخل الصادر قبل ما ندمج */
  const w=[],kvT=new Set(),apT=new Set(),ch=new Set();let rebuild=false;
  for(const {seq,p} of items){
    const {s,id}=p;if(SY.out.has(syKey(s,id)))continue;   /* عندنا تعديل أحدث لم يُرفع بعد، فيغلب */
    if(s==='devs'){SY.devs.set(id,{...p.v,seq});ch.add(s);continue;}
    if(s==='shop'){syReplace(S.store,p.v.store);S.vat=!!p.v.vat;S.meta.rec=p.v.rec||null;S.meta.created=p.v.created||0;kvT.add('store');kvT.add('meta');SY.fp.shop=JSON.stringify(syShop(),imgFp);}
    else if(s==='products'){if(p.del)delete PROD[id];else if(PROD[id])syReplace(PROD[id],p.v);else PROD[id]=p.v;kvT.add(s);}
    else if(SY_LISTS[s]){const a=SY_LISTS[s](),i=a.findIndex(r=>r.id===id);if(p.del){if(i>=0)a.splice(i,1);}else if(i>=0)syReplace(a[i],p.v);else a.push(p.v);kvT.add(s);}
    else if(DB.APPEND.includes(s)&&!p.del){
      const m=syMap(s),old=m.get(id);
      if(old){syReplace(old,p.v);w.push([s,old]);rebuild=true;}
      else{const at=syInsert(S[s],p.v);m.set(id,p.v);w.push([s,p.v]);apT.add(s);if(s==='invoices'&&at<S.invoices.length-1)rebuild=true;}
    }else continue;
    ch.add(s);
  }
  if(!ch.size)return;
  const v=kvVals();
  for(const k of kvT){
    if(SY_KV.includes(k))SY.fp[k]=new Map(syRecs(k).map(([id,r])=>[id,JSON.stringify(r,imgFp)]));
    PS.kv[k]=JSON.stringify(v[k],imgFp);w.push(['kv',{k,v:v[k]}]);
  }
  for(const c of apT)PS.lens[c]=S[c].length;
  if(rebuild||kvT.size)S.rev++;
  if(!SY.joining)enqueueWrite(w);
  if(ch.has('shifts'))syFixShifts();
  if(SY.onChange&&!SY.joining)SY.onChange(ch);
}
function syFixShifts(){   /* لو انفتحت ورديتان في نفس اللحظة من جهازين: نقفل الأقدم تلقائياً والأحدث تبقى */
  const open=S.shifts.filter(s=>!s.end);if(open.length<2)return;
  const last=open[open.length-1];
  for(const s of open.slice(0,-1)){s.end=last.start;s.auto=true;s.expected=drawer(s.id);s.counted=s.expected;s.diff=0;touch('shifts',s);}
  persist();
}
async function syPull(prog,total){
  let n=0;
  for(;;){
    const rows=await syRpc('cafe_pull',{p_shop:SY.shop,p_after:SY.cursor,p_lim:SY_PAGE}),more=rows.length>=SY_PAGE;
    const fresh=rows.filter(r=>r.dev!==SY.cfg.dev&&r.seq>(SY.seen.get(r.k)||0));
    let bad=0;const dec=await Promise.all(fresh.map(async r=>{try{return {seq:r.seq,p:await syDec(r.d)};}catch(e){if(SY.joining)throw e;bad++;return null;}}));
    const items=dec.filter(Boolean);   /* سجل تالف ما يوقف المزامنة كلها: نتجاوزه ونعرض تنبيه */
    if(bad)SY.warn=`تعذّرت قراءة ${bad} سجل من الخدمة وتم تجاوزها`;
    if(items.length)syApply(items);
    for(const r of rows)SY.seen.set(r.k,r.seq);
    /* السجلات الأحدث من 30 ثانية نعيد سحبها مرة ثانية للاحتياط (قد تتأخر عملية كتابة أخذت رقماً أقدم) */
    let j=-1;for(let i=0;i<rows.length;i++)if(rows[i].age>=SY_AGE)j=i;
    if(more&&j<0)j=rows.length-1;
    if(j>=0){SY.cursor=rows[j].seq;SY.dirty=true;for(const [k,q] of SY.seen)if(q<=SY.cursor)SY.seen.delete(k);}
    n+=rows.length;prog&&prog(n,total||n);
    if(!more)return n;
  }
}

/* ── الدورة: إرسال ثم استقبال ── */
async function syRun(){
  if(!SY.on||SY.joining)return;
  if(SY.running){SY.again=true;return;}
  SY.running=true;SY.st='busy';SY.status();
  try{
    if(SY.seed)await sySeed();
    await syFlush();await syPull();
    SY.err='';SY.fails=0;SY.nextTry=0;SY.last=Date.now();SY.st=SY.out.size?'pend':'ok';
  }catch(e){
    SY.fails++;SY.err=(e&&e.message)||String(e);SY.st=syNet(e)?'offline':'err';SY.nextTry=Date.now()+Math.min(60000,5000*2**Math.min(SY.fails,4));
    if(!syNet(e))console.error(e);
  }
  finally{SY.running=false;SY.status();}
  if(SY.dirty)persist();
  if(SY.again){SY.again=false;syRun();}
}
SY.kick=()=>{if(!SY.on||SY.joining||Date.now()<SY.nextTry)return;clearTimeout(SY.pt);SY.pt=setTimeout(syRun,300);};
SY.start=async()=>{
  if(!SY.on)return;
  try{await syKeys();}catch(e){SY.on=false;return;}
  syInitFp();SY.st='busy';startTimers();syRun();
};

/* ── تفعيل الربط على جهاز فيه بيانات (الجهاز الأول) ── */
async function syEnable(url,key,name,prog){
  if(SY.on)throw new Error('الربط مفعّل مسبقاً');
  SY.cfg={u:syUrl(url),k:String(key||'').trim(),s:btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18)))).replace(/\+/g,'-').replace(/\//g,'_'),dev:syRand(4),dx:0,name:name||'الجهاز الرئيسي',at:Date.now()};
  if(!SY.cfg.k)throw new Error('الصق المفتاح العام (Publishable key أو anon)');
  if(/^sb_secret_/.test(SY.cfg.k)||(SY.cfg.k.startsWith('eyJ')&&/"role"\s*:\s*"service_role"/.test((()=>{try{return atob(SY.cfg.k.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'));}catch(e){return '';}})())))throw new Error('هذا مفتاح سري (secret / service_role) — لا تستخدمه هنا أبداً. انسخ المفتاح العام Publishable أو anon');
  try{
    await syKeys();
    const n=await syRpc('cafe_count',{p_shop:SY.shop});if(n)throw new Error('هذا المحل فيه بيانات مسبقة');
  }catch(e){SY.cfg=null;throw e;}
  SY.cursor=0;SY.out=new Map();SY.seen=new Map();SY.devs=new Map();SY.seed={n:0,i:0};SY.on=true;SY.dirty=true;syInitFp();persist();
  startTimers();
  await sySeed(prog);
  SY.st='ok';SY.last=Date.now();SY.status();syRun();
}
let syTimers=false;
function startTimers(){if(syTimers)return;syTimers=true;setInterval(()=>{if(SY.on&&!document.hidden&&Date.now()>=SY.nextTry)syRun();},5000);window.addEventListener('online',()=>{SY.nextTry=0;syRun();});document.addEventListener('visibilitychange',()=>{if(!document.hidden){SY.nextTry=0;syRun();}});}

/* ── ربط جهاز جديد (فارغ) برمز من الجهاز الأول: يسحب كل البيانات ثم يسجّل نفسه ── */
async function syJoin(code,name,prog){
  if(S.users.length)throw new Error('هذا الجهاز فيه بيانات، الربط للجهاز الجديد فقط');
  const o=syParse(code);SY.cfg={...o,dev:syRand(4),dx:0,name:name||'جهاز جديد',at:Date.now()};
  const reset=()=>{S.users=[];S.customers=[];S.suppliers=[];Object.keys(PROD).forEach(k=>delete PROD[k]);STOCK.length=0;for(const c of DB.APPEND)S[c]=[];S.meta={uid:1,created:0,lastBackup:0,rec:null,dx:0};S.nextInv=1001;S.vat=false;S.store={name:'',desc:'',phone:'',qr:'',logo:'',float:'0.000'};S.rev++;};
  let total=0;
  try{await syKeys();total=await syRpc('cafe_count',{p_shop:SY.shop});}catch(e){SY.cfg=null;throw e;}
  if(!total){SY.cfg=null;throw new Error('ما لقيت بيانات بهذا الرمز، تأكد أنه رمز المحل الصحيح');}
  FROZEN=true;SY.joining=true;SY.on=true;SY.cursor=0;SY.out=new Map();SY.seen=new Map();SY.devs=new Map();SY.idx={};SY.fp={};
  try{
    await pchain;reset();
    await syPull(prog,total);
    if(!S.users.length||!S.meta.created)throw new Error('بيانات المحل ناقصة، حاول مرة ثانية بعد قليل');
    const used=new Set([...SY.devs.values()].map(d=>d.dx));let dx=1;while(used.has(dx))dx++;
    SY.cfg.dx=dx;S.meta.dx=dx;S.meta.uid=1;S.nextInv=dx*1e6+1001;S.ui.close.float=S.store.float||'0.000';
    syInitFp();SY.mark('devs',SY.cfg.dev);
    const v=kvVals(),ops=[];
    for(const k in v)if(k!=='meta')ops.push(['kv',{k,v:v[k]}]);
    for(const c of DB.APPEND)S[c].forEach(r=>ops.push([c,r]));
    ops.push(['kv',{k:'sync',v:SY.state()}]);
    for(let i=0;i<ops.length;i+=3000)await DB.putMany(ops.slice(i,i+3000));
    await DB.putMany([['kv',{k:'meta',v:v.meta}]]);   /* الأخير: وجوده يعني أن الانضمام اكتمل */
    for(const k in v)PS.kv[k]=JSON.stringify(v[k],imgFp);for(const c of DB.APPEND)PS.lens[c]=S[c].length;
    SY.dirty=false;
  }catch(e){reset();SY.on=false;SY.cfg=null;SY.joining=false;FROZEN=false;throw e;}
  SY.joining=false;FROZEN=false;startTimers();SY.st='busy';SY.status();
  await syRun();
  /* لو جهازان انضمّا بنفس اللحظة وأخذا نفس الرقم: صاحب المعرّف الأكبر يأخذ رقماً جديداً */
  const clash=[...SY.devs.values()].find(d=>d.dx===SY.cfg.dx&&d.id!==SY.cfg.dev&&d.id<SY.cfg.dev);
  if(clash){const used=new Set([...SY.devs.values()].map(d=>d.dx));let dx=1;while(used.has(dx))dx++;SY.cfg.dx=dx;S.meta.dx=dx;S.nextInv=dx*1e6+1001;SY.mark('devs',SY.cfg.dev);SY.dirty=true;persist();}
}
function syOff(){
  SY.on=false;SY.cfg=null;SY.key=null;SY.out=new Map();SY.seed=null;SY.warn='';SY.fp={};SY.idx={};SY.seen=new Map();SY.devs=new Map();SY.st='off';SY.err='';clearTimeout(SY.pt);
  enqueueWrite([['kv',{k:'sync',v:null}]]);SY.status();
}
SY.view=()=>({on:SY.on,warn:SY.warn,st:SY.running?'busy':SY.err?(SY.st==='offline'?'offline':'err'):SY.out.size?'pend':SY.st,err:SY.err,pend:SY.out.size,last:SY.last,seed:!!SY.seed,dx:SY.cfg?SY.cfg.dx:0,name:SY.cfg?SY.cfg.name:'',
  devs:SY.on?[{id:SY.cfg.dev,dx:SY.cfg.dx,name:SY.cfg.name,me:true},...[...SY.devs.values()].filter(d=>d.id!==SY.cfg.dev)]:[]});
