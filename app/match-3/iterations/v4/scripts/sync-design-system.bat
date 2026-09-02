@echo off
REM Copia tokens + generated-assets del repo design-system al runtime v3.1.
set ROOT=%~dp0..
if "%DESIGN_SYSTEM_ROOT%"=="" (
  echo Set DESIGN_SYSTEM_ROOT to the design-system checkout.
  exit /b 1
)
set DS=%DESIGN_SYSTEM_ROOT%
set DEST=%ROOT%\src\design-system\tokens
if not exist "%DEST%" mkdir "%DEST%"
copy /Y "%DS%\tokens\night-cyan\colors.json" "%DEST%\colors.json"
copy /Y "%DS%\tokens\night-cyan\spacing.json" "%DEST%\spacing.json"
copy /Y "%DS%\tokens\night-cyan\radius.json" "%DEST%\radius.json"
copy /Y "%DS%\tokens\night-cyan\typography.json" "%DEST%\typography.json"
copy /Y "%DS%\tokens\match-3-v3\overrides.json" "%DEST%\match-3-overrides.json"
copy /Y "%DS%\generated-assets\match-3\screens\bg-night.png" "%ROOT%\assets\recursos\screens\bg-night.png"
copy /Y "%DS%\generated-assets\match-3\screens\map-americas.png" "%ROOT%\assets\recursos\screens\map-americas.png"
copy /Y "%DS%\generated-assets\match-3\gems.png" "%ROOT%\assets\recursos\ui\gems.png"
copy /Y "%DS%\generated-assets\match-3\gifts.png" "%ROOT%\assets\recursos\ui\gifts.png"
copy /Y "%DS%\generated-assets\match-3\btn-8bit-sheet.png" "%ROOT%\assets\recursos\ui\btn-8bit-sheet.png"
copy /Y "%DS%\generated-assets\match-3\cast\*.png" "%ROOT%\assets\recursos\cast\"
echo Synced design-system to v3.1
