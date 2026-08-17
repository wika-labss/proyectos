@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0\.."

echo === WIKA — Sodoku nuevo V2: APK Release (NO Metro) ===
echo.

echo [0/6] Android SDK
set "SDK_DIR=%ANDROID_HOME%"
if "%SDK_DIR%"=="" set "SDK_DIR=%ANDROID_SDK_ROOT%"
if "%SDK_DIR%"=="" if exist "%LOCALAPPDATA%\Android\Sdk" set "SDK_DIR=%LOCALAPPDATA%\Android\Sdk"
if "%SDK_DIR%"=="" (
  echo ERROR: No se encontro Android SDK. Define ANDROID_HOME.
  exit /b 1
)
echo SDK: %SDK_DIR%

echo.
echo [1/6] validate:levels
call npm run validate:levels
if errorlevel 1 exit /b 1

echo.
echo [2/6] TypeScript
call npx tsc --noEmit
if errorlevel 1 exit /b 1

echo.
echo [3/6] prebuild android
call npx expo prebuild --platform android --clean
if errorlevel 1 exit /b 1
call node scripts\post-prebuild.js
if errorlevel 1 exit /b 1

echo.
echo [4/6] android\local.properties
set "SDK_FWD=!SDK_DIR:\=/!"
> android\local.properties echo sdk.dir=!SDK_FWD!
type android\local.properties

echo.
echo [5/6] gradle assembleRelease
cd android
call gradlew.bat assembleRelease
if errorlevel 1 exit /b 1
cd ..

echo.
echo [6/6] Resultado
set APK=android\app\build\outputs\apk\release\app-release.apk
set UNSIGNED=android\app\build\outputs\apk\release\app-release-unsigned.apk
if exist "%APK%" (
  echo APK Release: %CD%\%APK%
) else if exist "%UNSIGNED%" (
  echo APK Release unsigned: %CD%\%UNSIGNED%
) else (
  echo No se encontro APK release.
  exit /b 1
)
endlocal
