#!/bin/sh
f=${1:-/home/claude/work/app.html}
node -e "
const fs=require('fs');const h=fs.readFileSync('$f','utf8');
fs.writeFileSync('/home/claude/work/tools/_check.js',h.slice(h.lastIndexOf('<script>')+8,h.lastIndexOf('</script>')));" && node --check /home/claude/work/tools/_check.js && echo "syntax ok"
