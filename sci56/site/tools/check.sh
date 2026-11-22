#!/bin/sh
f=${1:-/home/user/Ali/sci56/site/app.html}
node -e "
const fs=require('fs');const h=fs.readFileSync('$f','utf8');
fs.writeFileSync('/home/user/Ali/sci56/site/tools/_check.js',h.slice(h.lastIndexOf('<script>')+8,h.lastIndexOf('</script>')));" && node --check /home/user/Ali/sci56/site/tools/_check.js && echo "syntax ok"
