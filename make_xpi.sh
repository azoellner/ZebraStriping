#!/usr/bin/env bash

# set -o xtrace

rm -f ZebraStriping.xpi
zip -r ZebraStriping.zip manifest.json schema.json README.md images/* js/* _locales/* > /dev/null
mv ZebraStriping.zip ZebraStriping.xpi
ls -l ZebraStriping.xpi
file ZebraStriping.xpi
