@echo off
setlocal
cd /d "%~dp0\.."

echo === WIKA — Sodoku nuevo: APK Release (NO Metro) ===
echo Perfil: BUILD/RELEASE — entregable sideload sin Metro
echo.

echo [1/4] TypeScript
call npx tsc --noEmit
if errorlevel 1 exit /b 1

echo.
echo [2/4] prebuild android
call npx expo prebuild --platform android --clean
if errorlevel 1 exit /b 1
call node scripts\post-prebuild.js
if errorlevel 1 exit /b 1

echo.
echo [3/4] gradle assembleRelease
cd android
call gradlew.bat assembleRelease
if errorlevel 1 exit /b 1
cd ..

echo.
echo [4/4] Resultado
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
