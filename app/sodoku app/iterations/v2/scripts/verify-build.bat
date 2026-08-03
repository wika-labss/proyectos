@echo off
echo === WIKA Build Verification — Sodoku v2 ===
cd /d "%~dp0.."

echo.
echo [1/5] expo-doctor
call npx expo-doctor
if errorlevel 1 exit /b 1

echo.
echo [2/5] TypeScript
call npx tsc --noEmit
if errorlevel 1 exit /b 1

echo.
echo [3/5] prebuild android
call npx expo prebuild --platform android
call node scripts/post-prebuild.js
if errorlevel 1 exit /b 1

echo.
echo [4/5] gradle assembleDebug
cd android
call gradlew assembleDebug
if errorlevel 1 exit /b 1
cd ..

echo.
echo [5/5] All gates passed
echo APK: android\app\build\outputs\apk\debug\app-debug.apk
