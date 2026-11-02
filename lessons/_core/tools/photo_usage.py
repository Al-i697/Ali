"""Which background photographs each lesson uses, and which photographs more than one lesson shares.
Run from anywhere:  python3 photo_usage.py
Retired photographs (the teacher cancelled them) are marked RETIRED; a lesson that still uses one needs to be rebuilt with new photos."""
import os, re, glob
HERE = os.path.dirname(os.path.abspath(__file__)); CORE = os.path.join(HERE, '..'); LESSONS = os.path.join(CORE, '..')
RETIRED = re.compile(r'^u_')
scenes = open(os.path.join(CORE, 'u4', 'scenes.js')).read()
scene_bg = {m.group(1): re.findall(r"bg:'(\w+)'", m.group(2)) for m in re.finditer(r"R\('(\w+)'\s*,\s*\{([^\n]*)\}\);?", scenes)}
use = {}
for cfg in sorted(glob.glob(os.path.join(LESSONS, '4-*', 'src', 'config.js'))):
    lesson = cfg.split(os.sep)[-3]
    text = open(cfg).read()
    keys = set()
    for name in re.findall(r"['\"](\w+)['\"]", text):
        if name in scene_bg: keys.update(scene_bg[name])           # a living-engine scene
        elif re.match(r'^(?:u|nb|s)_\w+$', name): keys.add(name)      # a still photograph named directly
    use[lesson] = keys
by = {}
for l, ks in use.items():
    for k in ks: by.setdefault(k, []).append(l)
for l, ks in use.items():
    print('%s: %d photos' % (l, len(ks)))
    for k in sorted(ks): print('   %-14s %s%s' % (k, ', '.join(by[k]) if len(by[k]) > 1 else 'only here', '   RETIRED' if RETIRED.match(k) else ''))
shared = sorted(k for k, v in by.items() if len(v) > 1)
print('\nshared by more than one lesson: %s' % (', '.join(shared) or 'none'))
