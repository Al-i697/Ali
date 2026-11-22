import sys
from playwright.sync_api import sync_playwright
html=sys.argv[1] if len(sys.argv)>1 else '/home/user/Ali/sci56/site/app.html'
key=sys.argv[2] if len(sys.argv)>2 else 'sci6~1-1'
out=sys.argv[3] if len(sys.argv)>3 else '/tmp/shot'
exec(open('/home/user/Ali/sci56/site/tools/tests.py').read().split("def pdf_pages")[0].split("URL = ")[0].split("STRATS")[0].split("html = next")[0])
import re
src=open('/home/user/Ali/sci56/site/tools/tests.py').read()
SEED=re.search(r"^SEED = (.*)$",src,re.M).group(1)
INIT=re.search(r"^INIT = (.*)$",src,re.M).group(1)
SEED=eval(SEED); INIT=eval(INIT.replace('SEED',repr(SEED)))
with sync_playwright() as p:
    b=p.chromium.launch(); errs=[]
    for name,vp in (('d',{'width':1400,'height':900}),('m',{'width':390,'height':844})):
        pg=b.new_page(viewport=vp,device_scale_factor=1); pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.add_init_script(INIT); pg.goto('file://'+html+'#'+key); pg.wait_for_timeout(900)
        pg.screenshot(path=f'{out}_{name}.png')
    print('errors',errs)
