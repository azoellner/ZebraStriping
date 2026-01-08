@echo off

del /q ZebraStriping.xpi

if not exist ZebraStriping.xpi (
    wzzip -arP ZebraStriping.xpi manifest.json schema.json README.md images js _locales
) else (
    echo Error: Could not create new .xpi file. Old file seems to be blocked.
    exit /b 1
)
