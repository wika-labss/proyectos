@echo off
REM WIKA verify-build (Windows) — Pet Care Assistant v1
setlocal
cd /d "%~dp0\.."

echo === WIKA Build Verification — Pet Care Assistant v1 ===

echo.
echo [1/5] Smoke
call npm run smoke
if errorlevel 1 exit /b 1

echo.
echo [2/5] TypeScript
call npx tsc --noEmit
if errorlevel 1 exit /b 1

echo.
echo [3/5] Bundle JS
call npx expo export --platform android
if errorlevel 1 exit /b 1

echo.
echo [4/5] prebuild android
call npx expo prebuild --platform android
if errorlevel 1 exit /b 1
call node scripts\post-prebuild.js
if errorlevel 1 exit /b 1

echo.
echo [5/5] gradle assembleRelease
if not exist android\local.properties (
  if defined ANDROID_HOME (
    echo sdk.dir=%ANDROID_HOME:\=\\% > android\local.properties
  ) else (
    echo ERROR: Configura ANDROID_HOME o android\local.properties
    exit /b 1
  )
)
cd android
call gradlew.bat assembleRelease
if errorlevel 1 exit /b 1
cd ..

echo.
echo All gates passed
echo APK: android\app\build\outputs\apk\release\app-release.apk
