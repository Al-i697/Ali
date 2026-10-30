d='src/'
css=open(d+'style.css').read()+open(d+'theme.css').read()+open(d+'theme3.css').read()+open(d+'theme4.css').read()+open(d+'theme5.css').read()
js=''.join(open(d+f).read()+'\n' for f in ['engine.js','assets.js','art.js','bg.js','motion.js','deck_a.js','deck_b.js','slides_b.js','deck_c.js','lab_main.js','past.js','tail.js'])
html='''<title>الكتل النسبية ٣-١</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800&family=Tajawal:wght@400;500;700&family=STIX+Two+Text:ital,wght@1,600&display=swap" rel="stylesheet">
<style>
%s
</style>
<script>
document.documentElement.lang="ar";document.documentElement.dir="rtl";
(function(){
'use strict';
%s
})();
</script>
''' % (css, js)
open('lesson31.html','w').write(html); print(len(html))
