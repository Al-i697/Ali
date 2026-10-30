"""Build lesson31.html: the shared core in ../_core plus this lesson's src/.   python3 build.py [--standalone]"""
import sys
core, d = '../_core/', 'src/'
css = ''.join(open(core + f).read() + '\n' for f in ['style.css', 'theme.css', 'theme3.css', 'theme4.css', 'theme5.css'])
js = ''.join(open(f).read() + '\n' for f in [d + 'config.js', core + 'engine.js', d + 'assets.js', d + 'art.js', core + 'bg.js', core + 'motion.js',
                                              d + 'deck_a.js', d + 'deck_b.js', d + 'slides_b.js', d + 'deck_c.js', d + 'lab_main.js', d + 'past.js', d + 'tail.js'])
if '--standalone' in sys.argv: js = js.replace("home:'index.html'", "home:''")
html = '''<title>الكتل النسبية ٣-١</title>
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
open('lesson31.html', 'w').write(html); print(len(html))
