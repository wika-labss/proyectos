@echo off
setlocal
cd /d "%~dp0\.."
echo === WIKA APK Release — Arkanoid v1 ===
echo Genera un APK autonomo: el bundle JS va embebido, no necesita Metro.
echo.

where java >nul 2>&1
if errorlevel 1 (
  echo ERROR: Java no encontrado. Instala JDK 17 y configura JAVA_HOME.
  exit /b 1
)

echo Java:
java -version 2>&1
echo.

echo [1/4] prebuild android
call npx expo prebuild --platform android
if errorlevel 1 exit /b 1
call node scripts\post-prebuild.js
if errorlevel 1 exit /b 1

echo.
echo [2/4] Android SDK
if not exist android\local.properties (
  if defined ANDROID_HOME (
    echo sdk.dir=%ANDROID_HOME:\=/% > android\local.properties
    echo Escrito android\local.properties desde ANDROID_HOME
  ) else if defined ANDROID_SDK_ROOT (
    echo sdk.dir=%ANDROID_SDK_ROOT:\=/% > android\local.properties
    echo Escrito android\local.properties desde ANDROID_SDK_ROOT
  ) else (
    echo ERROR: Android SDK no configurado.
    echo Define ANDROID_HOME o copia scripts\local.properties.example a android\local.properties
    exit /b 1
  )
) else (
  echo Usando android\local.properties existente
)

echo.
echo [3/4] gradle assembleRelease
cd android
call gradlew.bat assembleRelease
if errorlevel 1 exit /b 1
cd ..

echo.
echo [4/4] Listo
set APK=android\app\build\outputs\apk\release\app-release.apk
set UNSIGNED=android\app\build\outputs\apk\release\app-release-unsigned.apk

if exist "%APK%" (
  echo APK: %CD%\%APK%
) else if exist "%UNSIGNED%" (
  echo APK unsigned: %CD%\%UNSIGNED%
) else (
  echo ERROR: No se encontro el APK release.
  exit /b 1
)

echo Instalar: adb install -r "%APK%"
echo La app debe abrir SIN Metro.
endlocal
