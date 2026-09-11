@echo off
setlocal
cd /d "%~dp0\.."

echo === WIKA Build Verification — Evaluacion Proyectos v1 ===

echo.
echo [1/2] Smoke
call npm run smoke
if errorlevel 1 exit /b 1

echo.
echo [2/2] TypeScript
call npx tsc --noEmit
if errorlevel 1 exit /b 1

echo.
echo V1 gates passed
