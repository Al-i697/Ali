#!/bin/bash
# usage: rd.sh book first [last]  -> cleaned OCR text of pdf pages
b=$1; a=$2; z=${3:-$2}
for ((i=a;i<=z;i++)); do f=$(printf "ocr_%s/p%03d.txt" $b $i); echo "##### $b pdf p$i"; sed 's/‎//g;s/‏//g' $f 2>/dev/null | grep -v '^\s*$'; done
