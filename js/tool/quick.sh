#!/bin/bash

pwd=$(pwd)
cwd=$(dirname $0)

cat "$pwd/$cwd/../../test_resources/tests.json" |\
  # select only each 500th line
  perl -e '$cnt=0; while(<>){ $cnt++; if ($cnt % 500 == 0) { print $_; } }' \
  > "$pwd/$cwd/../../test_resources/quick-tests.json"

echo
echo "    quick-tests.json generated"
echo 
