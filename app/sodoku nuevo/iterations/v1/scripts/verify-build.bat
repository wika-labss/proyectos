@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0\.."

echo === WIKA — Sodoku nuevo: APK Release (NO Metro) ===
echo Perfil: BUILD/RELEASE — entregable sideload sin Metro
echo.

echo [0/5] Android SDK
set "SDK_DIR=%ANDROID_HOME%"
if "%SDK_DIR%"=="" set "SDK_DIR=%ANDROID_SDK_ROOT%"
if "%SDK_DIR%"=="" if exist "%LOCALAPPDATA%\Android\Sdk" set "SDK_DIR=%LOCALAPPDATA%\Android\Sdk"
if "%SDK_DIR%"=="" (
  echo ERROR: No se encontro Android SDK.
  echo Define ANDROID_HOME o instala Android Studio ^(SDK en %%LOCALAPPDATA%%\Android\Sdk^).
  exit /b 1
)
echo SDK: %SDK_DIR%

echo.
echo [1/5] TypeScript
call npx tsc --noEmit
if errorlevel 1 exit /b 1

echo.
echo [2/5] prebuild android
call npx expo prebuild --platform android --clean
if errorlevel 1 exit /b 1
call node scripts\post-prebuild.js
if errorlevel 1 exit /b 1

echo.
echo [3/5] android\local.properties
set "SDK_FWD=!SDK_DIR:\=/!"
> android\local.properties echo sdk.dir=!SDK_FWD!
type android\local.properties

echo.
echo [4/5] gradle assembleRelease
cd android
call gradlew.bat assembleRelease
if errorlevel 1 exit /b 1
cd ..

echo.
echo [5/5] Resultado
set APK=android\app\build\outputs\apk\release\app-release.apk
set UNSIGNED=android\app\build\outputs\apk\release\app-release-unsigned.apk

if exist "%APK%" (
  echo APK Release: %CD%\%APK%
) else if exist "%UNSIGNED%" (
  echo APK Release unsigned: %CD%\%UNSIGNED%
  echo Nota: firmar si el dispositivo lo exige.
) else (
  echo No se encontro APK release.
  exit /b 1
)

echo.
echo Instalar: adb install -r ^<ruta-apk^>
echo La app debe abrir SIN Metro.
endlocal
