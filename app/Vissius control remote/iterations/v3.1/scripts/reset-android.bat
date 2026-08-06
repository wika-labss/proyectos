@echo off
setlocal
cd /d "%~dp0.."

echo === WIKA reset-android — Vissius Control Remote v3 ===
echo Removing android/ folder...
if exist android rmdir /s /q android

echo Running prebuild...
call npx expo prebuild --platform android
call node scripts/post-prebuild.js

echo Done. Open android\ in Android Studio with Gradle JDK 17.
endlocal
