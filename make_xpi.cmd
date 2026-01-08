@echo off

del ZebraStriping.xpi
tar -a -c -f ZebraStriping.zip manifest.json schema.json README.md images/* js/* _locales/*
ren ZebraStriping.zip ZebraStriping.xpi
dir ZebraStriping.xpi
