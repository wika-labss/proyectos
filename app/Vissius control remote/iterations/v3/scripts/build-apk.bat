@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0.."

echo === WIKA APK Release - Vissius Control Remote v3 ===
echo Genera un APK autonomo: el bundle JS va embebido, no necesita Metro.
echo.

echo [1/5] Toolchain
if not defined JAVA_HOME (
  echo ERROR: Define JAVA_HOME apuntando a JDK 17.
  echo   PowerShell:
  echo   $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
  exit /b 1
)

set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
if not exist "!JAVA_EXE!" (
  echo ERROR: No existe "!JAVA_EXE!"
  echo Comprueba JAVA_HOME ^(rutas con espacios deben ir entre comillas^).
  exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%PATH%"

"!JAVA_EXE!" -version 2>&1 | findstr /I /C:"version \"17" /C:"version \"17." >nul
if errorlevel 1 (
  echo.
  echo ERROR: WIKA requiere JDK 17 para Gradle.
  "!JAVA_EXE!" -version 2>&1
  echo.
  echo PowerShell:
  echo   $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
  exit /b 1
)

for /f "delims=" %%L in ('"!JAVA_EXE!" -version 2^>^&1 ^| findstr /I "version"') do echo Java detectado: %%L

set "SDK_DIR=%ANDROID_HOME%"
if "!SDK_DIR!"=="" set "SDK_DIR=%ANDROID_SDK_ROOT%"
if "!SDK_DIR!"=="" (
  echo ERROR: Define ANDROID_HOME con la ruta del SDK de Android.
  exit /b 1
)
echo SDK: !SDK_DIR!

echo.
echo [2/5] prebuild android
call npx expo prebuild --platform android
if errorlevel 1 exit /b 1

echo.
echo [3/5] post-prebuild
call node scripts\post-prebuild.js
if errorlevel 1 exit /b 1

echo.
echo [4/5] android\local.properties
set "SDK_FWD=!SDK_DIR:\=/!"
> android\local.properties echo sdk.dir=!SDK_FWD!
type android\local.properties

echo.
echo [5/5] gradle assembleRelease
cd android
call gradlew.bat assembleRelease
if errorlevel 1 exit /b 1
cd ..

echo.
echo Listo.
echo APK: android\app\build\outputs\apk\release\app-release.apk
endlocal
