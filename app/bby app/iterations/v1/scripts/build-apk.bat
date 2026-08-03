@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0.."

echo === WIKA APK Release - BBY Light v1 ===
echo Genera un APK autonomo: el bundle JS va embebido, no necesita Metro.
echo.

set "SDK_DIR=%ANDROID_HOME%"
if "%SDK_DIR%"=="" set "SDK_DIR=%ANDROID_SDK_ROOT%"
if "%SDK_DIR%"=="" (
  echo ERROR: Define ANDROID_HOME con la ruta del SDK de Android.
  exit /b 1
)

echo [1/4] prebuild android
call npx expo prebuild --platform android || exit /b 1
call node scripts\post-prebuild.js || exit /b 1

echo.
echo [2/4] android\local.properties
set "SDK_FWD=!SDK_DIR:\=/!"
> android\local.properties echo sdk.dir=!SDK_FWD!
type android\local.properties

echo.
echo [3/4] gradle assembleRelease
cd android
call gradlew.bat assembleRelease || exit /b 1
cd ..

echo.
echo [4/4] Listo
echo APK: android\app\build\outputs\apk\release\app-release.apk
echo Instalar: adb install -r android\app\build\outputs\apk\release\app-release.apk
endlocal
