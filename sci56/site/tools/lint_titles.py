import re, sys, glob
for p in sorted(glob.glob('data/sci*_s*_u*_l*.py')):
    s = open(p, encoding='utf-8').read()
    for m in re.finditer(r'\bR\("([^"]+)",\s*"([^"]+)"', s):
        t, st = m.group(1), m.group(2)
        if st != "بطاقة الخروج" and len(t) > 18 and t != "تعلم قبلي وتمهيد":
            print(p, len(t), t)
