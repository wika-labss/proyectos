@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0.."

echo === WIKA Build Verification - Vissius Control Remote v3 ===
echo.

echo [1/7] Toolchain
if not defined JAVA_HOME (
  echo ERROR: Define JAVA_HOME apuntando a JDK 17.
  exit /b 1
)

set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
if not exist "!JAVA_EXE!" (
  echo ERROR: No existe "!JAVA_EXE!"
  exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%PATH%"

"!JAVA_EXE!" -version 2>&1 | findstr /I /C:"version \"17" /C:"version \"17." >nul
if errorlevel 1 (
  echo ERROR: WIKA requiere JDK 17 para Gradle.
  "!JAVA_EXE!" -version 2>&1
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
echo [2/7] expo-doctor
call npx expo-doctor
if errorlevel 1 exit /b 1

echo.
echo [3/7] TypeScript
call npx tsc --noEmit
if errorlevel 1 exit /b 1

echo.
echo [4/7] Bundle JS
call npx expo export --platform android
if errorlevel 1 exit /b 1

echo.
echo [5/7] prebuild android
call npx expo prebuild --platform android
if errorlevel 1 exit /b 1
call node scripts\post-prebuild.js
if errorlevel 1 exit /b 1

echo.
echo [6/7] android\local.properties
set "SDK_FWD=!SDK_DIR:\=/!"
> android\local.properties echo sdk.dir=!SDK_FWD!
type android\local.properties

echo.
echo [7/7] gradle assembleRelease
cd android
call gradlew.bat assembleRelease
if errorlevel 1 exit /b 1
cd ..

echo.
echo Listo.
echo APK: android\app\build\outputs\apk\release\app-release.apk
endlocal
