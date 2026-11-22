#!/usr/bin/env python3
"""One-time setup after unzipping: make the tools work from this folder instead of /home/claude/work."""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(ROOT, "site")
MAIN_BASE = os.path.join(ROOT, "main-site-src", "app_base.html")

repl = [("/home/claude/work", SITE),
        ("/mnt/user-data/outputs/src-backup/app_base.html", MAIN_BASE)]
changed = 0
for f in glob.glob(os.path.join(SITE, "tools", "*")):
    if not os.path.isfile(f) or f.endswith((".pyc", ".pdf")):
        continue
    try:
        s = open(f, encoding="utf-8").read()
    except Exception:
        continue
    t = s
    for a, b in repl:
        t = t.replace(a, b)
    if t != s:
        open(f, "w", encoding="utf-8").write(t)
        changed += 1
print(f"paths updated in {changed} tool files")
print("next:  cd site && python3 tools/build.py && bash tools/check.sh")
