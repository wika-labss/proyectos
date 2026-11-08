@echo off
REM WIKA verify-build (Windows) — Arkanoid v1
cd /d "%~dp0.."
call npm run smoke
if errorlevel 1 exit /b 1
call npx tsc --noEmit
if errorlevel 1 exit /b 1
call npx expo export --platform android
if errorlevel 1 exit /b 1
echo Run bash scripts/verify-build.sh on a Unix shell for full APK gates.
