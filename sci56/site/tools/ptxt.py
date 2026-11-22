"""Normalized text of PDF pages. Usage: ptxt.py file.pdf FIRST [LAST] [--raw]"""
import sys, subprocess, re, unicodedata
f=sys.argv[1]; a=int(sys.argv[2]); b=int(sys.argv[3]) if len(sys.argv)>3 and sys.argv[3].isdigit() else a
mode='-raw' if '--raw' in sys.argv else '-layout'
for p in range(a,b+1):
    t=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),mode,f,'-'],capture_output=True).stdout.decode('utf-8','replace')
    t=unicodedata.normalize('NFKC',t)
    t=re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f‪-‮‎‏]','',t)
    print(f'=== p{p}'); print('\n'.join(l.rstrip() for l in t.splitlines() if l.strip()))
