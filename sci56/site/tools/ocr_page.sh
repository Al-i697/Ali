#!/bin/sh
# usage: ocr_page.sh book.pdf outdir page
pdf=$1; out=$2; p=$3; n=$(printf %03d $p)
[ -s $out/p$n.txt ] && exit 0
pdftoppm -f $p -l $p -r 200 -png $pdf $out/tmp$n >/dev/null 2>&1
img=$(ls $out/tmp$n*.png 2>/dev/null | head -1)
TESSDATA_PREFIX=/home/user/Ali/sci56/site/tess/data OMP_THREAD_LIMIT=1 tesseract $img $out/p$n -l ara+eng --psm 4 >/dev/null 2>&1
rm -f $out/tmp$n*.png
