/* ---------- CSS of the infographic-style (scene) slides. It lives inside each slide's shadow root, so none of the player's own rules can touch it and its class names (chip, tile, cap ...) cannot clash. ---------- */
var SCN_CSS=`
:host{display:block}
*{box-sizing:border-box}
.r{position:absolute;left:0;top:0;width:1280px;height:720px;overflow:hidden;direction:rtl;color:#fff;font-family:Cairo,Tajawal,"Segoe UI",Tahoma,sans-serif;font-weight:600;font-size:16px;line-height:1.4;background:#06142e;user-select:none;-webkit-user-select:none}
.r img.bg{position:absolute;left:0;top:0;width:1280px;max-width:none;height:720px;display:block}
[data-s]{opacity:0;transition:opacity .6s ease,transform .6s ease;pointer-events:none}
[data-s].on{opacity:1}
@keyframes march{to{stroke-dashoffset:-36}}
@keyframes glow{0%,100%{opacity:.18}50%{opacity:.4}}
@keyframes nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(-6px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.01ms!important}}
.march{animation:march 1.4s linear infinite}
button{font-family:inherit}
button:focus-visible{outline:3px solid #fff;outline-offset:2px}

.ttl{position:absolute;left:36px;top:22px;font-size:30px;font-weight:800;line-height:1.3;background:rgba(5,19,44,.78);border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:6px 20px 8px;z-index:3}
.chip{position:absolute;padding:8px 14px 10px;border-radius:14px;background:rgba(5,19,44,.9);border:1px solid rgba(255,255,255,.2);font-size:21px;line-height:1.35;font-weight:800;transform:translateX(20px);z-index:3}
.chip.on{transform:none}
.chip small{display:block;font-weight:600;font-size:16px;line-height:1.4;color:#c6e6f6;margin-top:1px}
.chip.one{padding:7px 14px 8px}
.chip.hot{background:#ffd66b;color:#2a1c00;border-color:#fff}
.col{position:absolute;display:flex;flex-direction:column;gap:7px;z-index:3}
.col .chip{position:relative}
.en{direction:ltr;unicode-bidi:isolate;display:inline-block;color:#7fe6f5;font-weight:700;font-size:17px;margin-inline-start:5px}
.mk{display:inline-block;width:11px;height:11px;border-radius:50%;margin-inline-end:8px;vertical-align:1px}
.ld{position:absolute;inset:0;width:1280px;height:720px;pointer-events:none;z-index:2}
.cap{position:absolute;left:40px;right:40px;bottom:14px;min-height:60px;border-radius:18px;background:rgba(4,14,36,.88);border:1px solid rgba(255,255,255,.2);padding:10px 22px;font-size:22px;line-height:1.45;font-weight:700;display:flex;align-items:center;z-index:3;transition:opacity .35s}

.side .artw{position:absolute;left:36px;top:112px;width:487px;height:533px;border-radius:20px;overflow:hidden;box-shadow:0 0 0 2px rgba(255,255,255,.18),0 10px 30px rgba(0,0,0,.45)}
.side .artw img{width:100%;height:100%;object-fit:cover;display:block}
.side{background:#1c1a2f}
.side .t2{position:absolute;right:44px;top:14px;width:760px}
.side .t2 h1{margin:0;font-size:38px;line-height:1.25;font-weight:800}
.side .t2 p{margin:0;font-size:22px;color:#b7bcd9}
.side .t2 .en{font-size:29px}
.cards{position:absolute;left:556px;top:98px;width:688px;display:flex;flex-direction:column;gap:8px}
.c{border-radius:16px;background:#262449;border:1.5px solid rgba(255,255,255,.16);overflow:hidden;transform:translateY(14px)}
.c.on{transform:none}
.c .h{display:flex;align-items:center;gap:10px;padding:4px 16px 5px;font-size:20px;font-weight:800;line-height:1.3}
.c .b{padding:7px 16px 9px;font-size:19px;line-height:1.5;font-weight:600;color:#eef0fb}
.c .b b{color:#fff}
.h1{background:#4b5fa0}.h2{background:#c9822a}.h3{background:#1f8f93}.h4{background:#b94d46}.h5{background:#2f9a5e}
.hi{width:26px;height:26px;flex:none}
.flow{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:6px}
.fi{flex:1;text-align:center;font-size:15px;line-height:1.3;color:#d4d8f2;font-weight:600}
.fi svg{display:block;margin:0 auto 2px;height:46px;width:auto;max-width:100%}
.fa{font-size:30px;color:#ffd66b;font-weight:800;animation:nudge 1.6s ease-in-out infinite}
.stats{display:flex;gap:8px}
.stats div{flex:1;background:rgba(255,255,255,.08);border-radius:10px;padding:5px 8px;text-align:center;font-size:16px;line-height:1.35}
.stats div b{display:block;font-size:15px;color:#ffb8ae}
.stats div span{font-size:19px;font-weight:800}
.ex{margin-top:6px;font-size:18.5px}
.endbar{position:absolute;left:40px;bottom:30px;width:470px;text-align:center;font-size:21px;font-weight:800;line-height:1.4;color:#2a1c00;background:#ffd66b;border-radius:14px;padding:8px 14px;box-shadow:0 4px 14px rgba(0,0,0,.4);z-index:3}

.lead{position:absolute;left:250px;top:150px;width:780px;padding:24px 30px 22px;border-radius:24px;background:rgba(10,24,54,.94);border:1.5px solid rgba(255,255,255,.22);transition:opacity .6s,transform .6s;z-index:6}
.lead.gone{opacity:0;transform:scale(.96);pointer-events:none}
.lead .tag{display:inline-block;font-size:17px;font-weight:800;color:#2a1c00;background:#ffd66b;border-radius:999px;padding:2px 14px}
.lead .q{font-size:31px;font-weight:800;line-height:1.4;margin:10px 0 14px}
.lead .o{display:block;width:100%;text-align:right;font:inherit;font-size:24px;font-weight:700;color:#fff;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.22);border-radius:14px;padding:11px 16px;margin-bottom:10px;cursor:pointer}
.lead .o:hover{background:rgba(255,255,255,.18)}
.lead .o.ok{background:#1f8f5a;border-color:#6fe0a3}
.lead .o.bad{background:#a8463a;border-color:#ff9c8a}
.lead .fb{min-height:36px;font-size:22px;font-weight:700;line-height:1.4;color:#d6ecf7}
.lead .fb.ok{color:#8ff0bd}.lead .fb.bad{color:#ffb4a6}

.zw{position:absolute;inset:0;transform-origin:0 0;transition:transform .9s ease}
.rw{position:absolute;left:40px;right:40px;bottom:86px;padding:10px 16px 12px;border-radius:18px;background:rgba(5,19,44,.93);border:1px solid rgba(255,255,255,.22);z-index:4}
.rw h4{margin:0 0 6px;font-size:21px;font-weight:800;color:#ffd66b}
.tiles{display:flex;gap:10px;justify-content:center;direction:rtl}
.tile{width:152px;text-align:center;font-size:16px;font-weight:700;line-height:1.3}
.tile img{width:152px;height:101px;object-fit:cover;border-radius:12px;display:block;margin-bottom:4px;box-shadow:0 0 0 1px rgba(255,255,255,.18)}
.eq{background:linear-gradient(160deg,#1a2244,#0d1633)}
.eq .t3{position:absolute;right:44px;top:16px}
.eq .t3 h1{margin:0;font-size:34px;line-height:1.25;font-weight:800}
.eqt{position:absolute;left:0;right:0;top:84px;text-align:center;direction:ltr;font-size:52px;font-weight:800;letter-spacing:2px}
.eqt i{font-style:normal;display:inline-block;padding:0 12px;border-radius:12px;transition:background .4s,color .4s}
.eqt i.act{background:#ffd66b;color:#2a1c00}
.eqc{position:absolute;left:36px;right:36px;top:170px;display:flex;gap:12px;direction:ltr}
.ec{flex:1;min-width:0;border-radius:18px;background:#262449;border:1.5px solid rgba(255,255,255,.16);overflow:hidden;transform:translateY(14px);direction:rtl}
.ec.on{transform:none}
.ec .l{display:flex;align-items:center;gap:10px;padding:5px 14px;font-size:20px;font-weight:800}
.ec .l b{font-size:30px;direction:ltr}
.ec img{width:100%;height:140px;object-fit:contain;display:block;background:rgba(255,255,255,.06)}
.ec p{margin:0;padding:8px 12px 12px;font-size:18px;line-height:1.45;font-weight:600;color:#eef0fb}
.eqs{position:absolute;left:36px;right:36px;bottom:50px;padding:10px 16px 12px;border-radius:18px;background:#1f2a55;border:1.5px solid rgba(255,255,255,.2)}
.eqs h4{margin:0 0 6px;font-size:21px;font-weight:800;color:#ffd66b}
.eqs.ext{top:168px;bottom:auto;padding:12px 22px 14px}
.eqs.ext h4{font-size:25px;margin-bottom:8px}
.eqs.ext p{margin:6px 0;font-size:22px;line-height:1.55;font-weight:600;color:#eef0fb}
.eqs.ext p.f{color:#ffe9a6}
.eqs.ext ul{margin:4px 0 8px;padding-inline-start:30px;font-size:22px;line-height:1.55;font-weight:600}
.eqn{position:absolute;left:36px;right:36px;bottom:12px;text-align:center;font-size:20px;font-weight:700;color:#ffe9a6}

/* ribbon cards a little bigger for slides whose cards are short */
.big .cards{gap:10px;top:100px}
.big .c .h{font-size:23px;padding:6px 16px 7px}
.big .c .b{font-size:20.5px;line-height:1.5;padding:8px 18px 10px}
.big .hi{width:30px;height:30px}
.big .endbar{font-size:23px}

/* board: a free layout of icon tiles, labels, bars and boxes on a plain colour field */
.board{background:linear-gradient(160deg,#16305a,#0b1a38)}
.board .t3{position:absolute;right:44px;top:16px;font-size:34px;line-height:1.25;font-weight:800;margin:0}
.bi{position:absolute;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.07);box-shadow:0 0 0 1.5px rgba(255,255,255,.2);transform:scale(.92)}
.bi.on{transform:none}
.bi img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;display:block}
.bi.cv img{object-fit:cover}
.bi .bl{position:absolute;left:0;right:0;bottom:0;padding:3px 8px 5px;text-align:center;font-size:19px;font-weight:800;line-height:1.25;background:rgba(5,19,44,.86);color:#fff}
.bi{transition:transform .5s,opacity .6s,outline-color .4s;outline:0 solid transparent}
.bi.hl{outline:5px solid #ffd66b;outline-offset:3px;transform:scale(1.04)}
.bx{position:absolute;border-radius:16px;background:#262449;border:1.5px solid rgba(255,255,255,.18);overflow:hidden;transform:translateY(12px)}
.bx.on{transform:none}
.bx .h{padding:5px 14px 6px;font-size:22px;font-weight:800;line-height:1.3}
.bx .b{padding:8px 14px 10px;font-size:20px;line-height:1.5;font-weight:600;color:#eef0fb}
.bx .b b{color:#fff}
.bx.pl{background:rgba(5,19,44,.9)}
.bx.gold{background:#ffd66b;color:#2a1c00;border-color:#fff}
.bx.gold .b,.bx.gold .b b{color:#2a1c00}
.pyr{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:5px}
.pyr.top{justify-content:flex-start}
.pb{height:64px;border-radius:10px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:19px;font-weight:800;line-height:1.2;color:#fff;text-align:center;padding:0 10px;opacity:0;transform:scaleX(.6);transition:opacity .5s,transform .6s;min-width:0;border:1.5px solid rgba(255,255,255,.35)}
.pb.on{opacity:1;transform:none}
.pb img{height:66px;width:auto;flex:none;margin:-5px 0}
.pb small{font-size:15px;font-weight:700;opacity:.95}
.pt{position:absolute;font-size:19px;font-weight:800;color:#ffd66b;z-index:3}
.br{position:absolute;border-radius:14px;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 10px;font-size:25px;font-weight:800;line-height:1.3;color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.4);transform:scaleX(.94);transform-origin:right center}
.br.on{transform:none}
`;
