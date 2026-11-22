import sys
from playwright.sync_api import sync_playwright
key, out = sys.argv[1], sys.argv[2]
SEED='if(!localStorage.getItem("sci56-smart-planner:v2")){localStorage.setItem("sci56-smart-planner:v2", JSON.stringify({v:2, meta:{teacher:"", school:"معهد العلوم الإسلامية"}, lessons:{}, profile:{name:"أ. اختبار", school:"معهد العلوم الإسلامية", courses:["chem10","chem11"]}}))}'
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1300,'height':1000}); pg.add_init_script(SEED)
    pg.goto('file:///home/user/Ali/sci56/site/app.html#'+key); pg.wait_for_timeout(500)
    pg.emulate_media(media='print'); pg.pdf(path=out,format='A4',print_background=True); b.close()
