/* ───────── واجهة الربط بين الأجهزة ───────── */
const SYNC_SQL=__SYNC_SQL__;
const SY_ST={ok:['bg-emerald-500','متزامن','text-emerald-500'],busy:['bg-amber-400','جاري المزامنة','text-amber-600'],pend:['bg-amber-400','بانتظار الإرسال','text-amber-600'],offline:['bg-gray-400','بدون اتصال','text-gray-500'],err:['bg-red-500','مشكلة بالمزامنة','text-red-500']};
const syLetter=dx=>String.fromCharCode(65+dx);

function syChip(){
  const c=$('#sync-chip');if(!c)return;const v=SY.view();
  c.classList.toggle('hidden',!v.on);c.classList.toggle('flex',v.on);
  if(!v.on)return;const [dot,txt]=SY_ST[v.st]||SY_ST.ok;
  c.innerHTML=`<span class="w-1.5 h-1.5 ${dot} rounded-full ${v.st==='busy'?'animate-pulse':''}"></span><span class="hidden sm:inline">${txt}${v.pend?` (${v.pend})`:''}</span>`;
}
function syncStatusHTML(v){
  const [dot,txt,col]=SY_ST[v.st]||SY_ST.ok;
  const sub=v.st==='offline'?'ما في اتصال بالإنترنت الحين. بياناتك محفوظة على هذا الجهاز وتُرسل لوحدها أول ما يرجع النت'
    :v.st==='err'?esc(v.err||'خطأ غير معروف')+' — البرنامج يعيد المحاولة لوحده'
    :v.seed?'جاري رفع بياناتك الأولى للخدمة، لا تقفل البرنامج'
    :v.pend?`${v.pend} تغيير ينتظر الإرسال`
    :v.last?`آخر مزامنة ${hm(v.last)}`:'';
  return `<div class="flex items-center gap-2 font-black text-sm ${col}"><span class="w-2.5 h-2.5 ${dot} rounded-full"></span>${txt}</div>${sub?`<p class="text-[11px] text-gray-400 font-bold mt-1 leading-5">${sub}</p>`:''}${v.warn?`<p class="text-[11px] text-amber-600 font-bold mt-1 leading-5">${esc(v.warn)}</p>`:''}`;
}
function syncCard(){
  const v=SY.view(),head=`<div class="flex items-center gap-3"><div class="w-12 h-12 bg-blue-50 dark:bg-blue-950 text-primary rounded-2xl flex items-center justify-center text-xl">${ic('fa-globe')}</div><div><h3 class="font-black text-sm">ربط الأجهزة</h3><p class="text-[11px] text-gray-400">خلّ الكاشير والمدير على جهازين وتتطابق البيانات بينهم خلال ثواني</p></div></div><hr class="dark:border-gray-800">`;
  if(!v.on)return `<div id="sync-card" class="${CARD} p-6 space-y-4">${head}
    <p class="text-xs text-gray-500 font-bold leading-6">الحين كل جهاز يشتغل لحاله. لو فعّلت الربط، كل فاتورة وسداد ومصروف وتعديل صنف يظهر في الأجهزة الثانية تلقائياً، وتشتغل بدون نت وتتزامن بعدين. بياناتك تُرسل <b>مشفّرة من الجهاز</b>، فالخدمة نفسها ما تقدر تقرأها.</p>
    <div><button data-a="sync-on" class="${BTN}">${ic('fa-globe')}<span>تفعيل الربط</span></button></div></div>`;
  const devs=v.devs.map(d=>`<tr><td class="p-3 font-bold">${esc(d.name||'جهاز')}${d.me?' <span class="text-[10px] text-primary">(هذا الجهاز)</span>':''}</td><td class="p-3 text-center"><span dir="ltr" class="font-mono text-gray-500">${d.dx?syLetter(d.dx):'بدون حرف'}</span></td></tr>`).join('');
  return `<div id="sync-card" class="${CARD} p-6 space-y-4">${head}
    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">${syncStatusHTML(v)}</div>
    <div class="overflow-x-auto border dark:border-gray-700 rounded-xl"><table class="w-full text-right text-xs"><thead class="bg-gray-50 dark:bg-gray-800 text-gray-500"><tr><th class="p-3">الجهاز</th><th class="p-3 text-center">حرف الفواتير</th></tr></thead><tbody class="divide-y dark:divide-gray-700">${devs}</tbody></table></div>
    <p class="text-[10px] font-bold text-gray-400 leading-5">فواتير كل جهاز لها حرف في أولها (مثل B1001) حتى ما يتكرر رقم بين جهازين. فواتير الجهاز الأول بدون حرف.</p>
    <div class="flex flex-wrap gap-3"><button data-a="sync-now" class="${BTN_GRAY} px-5">${ic('fa-history','ml-1')} مزامنة الآن</button><button data-a="sync-code" class="${BTN} px-5">${ic('fa-key')}<span>رمز ربط جهاز جديد</span></button><button data-a="sync-off" class="${BTN_GRAY} px-5 text-red-500">${ic('fa-link-slash','ml-1')} إيقاف الربط</button></div></div>`;
}
function syncCardRefresh(){const el=$('#sync-card');if(el)el.outerHTML=syncCard();}
SY.onStatus=()=>{syChip();if(S.user&&S.page==='settings'&&!S.m)syncCardRefresh();if(S.m&&S.m.type==='syi')$('#syi-body').innerHTML=syncStatusHTML(SY.view());};

/* ── تفعيل الربط (الجهاز الأول): خطوات إنشاء الحساب المجاني ثم اللصق ── */
function syncWizard(){
  S.m={type:'syw'};
  modal(`${mHead(ic('fa-globe','text-primary ml-2'),'تفعيل الربط بين الأجهزة')}<div class="space-y-4">
   <ol class="text-xs text-gray-600 dark:text-gray-300 font-bold leading-7 space-y-2 list-decimal pr-5">
    <li>افتح <span dir="ltr" class="font-mono text-primary">supabase.com</span> وسجّل بحساب مجاني (جوجل أو GitHub)، ثم <b>New project</b>. اختر أي اسم، ومنطقة قريبة (مثل Mumbai)، واكتب أي رمز لقاعدة البيانات واحفظه. انتظر دقيقة لين يجهز.</li>
    <li>من القائمة افتح <b>SQL Editor</b> ← <b>New query</b>، والصق الكود اللي بتنسخه من الزر تحت، ثم اضغط <b>Run</b>. لازم يطلع <span dir="ltr" class="font-mono">Success</span>.</li>
    <li>اضغط زر <b>Connect</b> فوق في صفحة المشروع وانسخ <b>Project URL</b> (يبدأ بـ https وينتهي بـ supabase.co). وانسخ المفتاح العام من <b>Settings ← API Keys</b>: <b>Publishable key</b> (يبدأ بـ sb_publishable)، أو <b>anon</b> في تبويب Legacy لو موجود. <b>لا تنسخ secret / service_role</b>. والصقهما تحت.</li></ol>
   <button data-a="sync-sql" class="${BTN_GRAY} w-full">${ic('fa-copy','ml-1')} نسخ كود الإعداد (للخطوة 2)</button>
   <div><label class="${LBL}">Project URL</label><input id="sy-url" dir="ltr" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="https://xxxxxxxx.supabase.co" class="${INP} text-left"></div>
   <div><label class="${LBL}">المفتاح العام (Publishable key أو anon)</label><input id="sy-key" dir="ltr" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="sb_publishable_...  أو  eyJ..." class="${INP} text-left"></div>
   <div><label class="${LBL}">اسم هذا الجهاز</label><input id="sy-name" value="الجهاز الرئيسي" class="${INP}"></div>
   <p id="sy-err" class="hidden text-center text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/40 rounded-2xl py-3 px-3 leading-6"></p>
   <div id="sy-prog" class="hidden"><div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"><div id="sy-bar" class="h-full bg-primary" style="width:0%"></div></div><p id="sy-pt" class="text-[11px] text-gray-400 font-bold text-center mt-2">جاري رفع بياناتك...</p></div>
   ${mActions('id="sy-go" data-a="sync-go"','ربط وبدء الرفع')}</div>`,'max-w-lg');
}
function showSyncCode(){
  const code=syCode();S.m={type:'syc'};
  modal(`${mHead(ic('fa-key','text-amber-500 ml-2'),'رمز ربط جهاز جديد')}<div class="space-y-4">
   <p class="text-xs text-gray-500 font-bold leading-6">على الجهاز الجديد افتح البرنامج (أول شاشة) واضغط «عندي محل مربوط»، والصق هذا الرمز. <b class="text-red-500">هذا الرمز مفتاح الدخول لبيانات المحل</b>، أرسله لأجهزتك فقط (واتساب لنفسك مثلاً) ولا تنشره.</p>
   <textarea readonly dir="ltr" rows="4" class="${INP} text-left font-mono text-[10px] select-all" id="sy-code">${esc(code)}</textarea>
   <div class="grid grid-cols-2 gap-2"><button data-a="sync-copy" class="${BTN_GRAY}">${ic('fa-copy','ml-1')} نسخ</button><button data-a="sync-share" class="${BTN_GRAY}">${ic('fa-share-nodes','ml-1')} مشاركة</button></div>
   <button data-a="close-modal" class="${BTN} w-full">تم</button></div>`,'max-w-lg');
}
const syCopy=(t,ok)=>{try{navigator.clipboard.writeText(t).then(()=>showToast(ok),()=>showToast('حدّد النص وانسخه يدوياً','error'));}catch(e){showToast('حدّد النص وانسخه يدوياً','error');}};
Object.assign(A,{
 'sync-on':()=>syncWizard(),
 'sync-sql':()=>syCopy(SYNC_SQL,'تم نسخ كود الإعداد'),
 'sync-go':async()=>{
   const url=$('#sy-url').value,key=$('#sy-key').value,name=$('#sy-name').value.trim(),err=$('#sy-err'),b=$('#sy-go');
   err.classList.add('hidden');b.disabled=true;const pg=$('#sy-prog');
   try{
     await syEnable(url,key,name,(d,t)=>{pg.classList.remove('hidden');const bar=$('#sy-bar');if(bar){bar.style.width=Math.round(d*100/Math.max(1,t))+'%';$('#sy-pt').textContent=`جاري رفع بياناتك... ${d} من ${t}`;}});
     closeModal();render();showSyncCode();showToast('تم تفعيل الربط');
   }catch(e){
     if(SY.on){closeModal();render();showToast('انقطع الرفع، يكمل لوحده أول ما يرجع الاتصال','error');return;}
     const bt=$('#sy-go');if(bt)bt.disabled=false;err.textContent=(e&&e.message)||String(e);err.classList.remove('hidden');
   }
 },
 'sync-code':()=>showSyncCode(),
 'sync-copy':()=>syCopy(syCode(),'تم نسخ الرمز'),
 'sync-share':()=>{const t=syCode();try{if(navigator.share)navigator.share({title:'رمز ربط '+S.store.name,text:t}).catch(()=>{});else syCopy(t,'تم نسخ الرمز');}catch(e){syCopy(t,'تم نسخ الرمز');}},
 'sync-now':()=>{SY.nextTry=0;syRun();showToast('جاري المزامنة...');},
 'sync-info':()=>{S.m={type:'syi'};modal(`${mHead(ic('fa-globe','text-primary ml-2'),'حالة الربط')}<div class="space-y-4"><div id="syi-body" class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">${syncStatusHTML(SY.view())}</div><div class="flex gap-3"><button data-a="sync-now" class="flex-1 ${BTN}">مزامنة الآن</button><button data-a="close-modal" class="flex-1 ${BTN_GRAY}">إغلاق</button></div></div>`);},
 'sync-off':()=>{S.m={type:'syo'};modal(`${mHead(ic('fa-link-slash','text-red-500 ml-2'),'إيقاف الربط')}<div class="space-y-4"><p class="text-xs text-gray-500 font-bold leading-6">بتوقف المزامنة على هذا الجهاز بس، وبياناته تبقى عليه كما هي. الأجهزة الثانية تكمل لحالها ولا تشوف تغييراته بعد الحين. لو رجعت فعّلت الربط بعدين يبدأ ربط جديد.</p>${mActions('data-a="sync-off-ok"','إيقاف الربط','bg-red-500 text-white px-5 py-3 rounded-2xl font-bold text-xs')}</div>`);},
 'sync-off-ok':()=>{syOff();closeModal();render();showToast('تم إيقاف الربط');}
});

/* ── ربط جهاز جديد من شاشة البداية ── */
async function tryJoin(){
  const code=$('#jn-code').value,name=($('#jn-name').value||'').trim()||'جهاز جديد',b=$('#jn-btn'),pg=$('#jn-prog');
  $('#jn-err').classList.add('hidden');b.disabled=true;pg.classList.remove('hidden');$('#jn-bar').style.width='0%';
  try{
    await syJoin(code,name,(d,t)=>{$('#jn-bar').style.width=Math.round(d*100/Math.max(1,t))+'%';$('#jn-pt').textContent=`جاري سحب البيانات... ${d} من ${t}`;});
    $('#jn-code').value='';pg.classList.add('hidden');showAuth();showToast('تم ربط الجهاز، سجّل دخولك بحسابك');
  }catch(e){pg.classList.add('hidden');errMsg('#jn-err',(e&&e.message)||String(e));}
  finally{b.disabled=false;}
}

/* ── تحديث الشاشة لما توصل بيانات من جهاز ثاني: ما نلمسها لو فيه نافذة مفتوحة أو حقل قيد الكتابة ── */
SY.onChange=()=>{
  if(!S.user)return;
  if(!S.users.includes(S.user)){A.logout();showToast('أُزيل هذا الحساب من جهاز آخر','error');return;}
  S.dirtyRemote=true;
};
function uiBusy(){
  const open=id=>!$(id).classList.contains('hidden'),ae=document.activeElement;
  return open('#app-modal')||open('#invoice-preview-modal')||open('#whatsapp-modal')||(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName));
}
setInterval(()=>{
  if(!S.dirtyRemote||!S.user||uiBusy())return;
  S.dirtyRemote=false;
  if(S.page==='pos'){renderChrome();drawGrid();}else render();
},1200);
