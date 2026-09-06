@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0\.."

echo === WIKA Build Verification — Arkanoid v3 ===
echo.

echo [1/7] Toolchain
if not defined JAVA_HOME (
  echo ERROR: Define JAVA_HOME apuntando a JDK 17.
  exit /b 1
)
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo ERROR: No existe %JAVA_HOME%\bin\java.exe
  exit /b 1
)
set "PATH=%JAVA_HOME%\bin;%PATH%"

for /f "tokens=3" %%v in ('"%JAVA_HOME%\bin\java.exe" -version 2^>^&1 ^| findstr /i "version"') do (
  set "JAVA_RAW=%%v"
  goto :got_java
)
:got_java
set "JAVA_RAW=!JAVA_RAW:"=!"
for /f "delims=. tokens=1" %%m in ("!JAVA_RAW!") do set "JAVA_MAJOR=%%m"
echo Java detectado: !JAVA_RAW!
if not "!JAVA_MAJOR!"=="17" (
  echo ERROR: WIKA requiere JDK 17. Detectado: !JAVA_MAJOR!
  exit /b 1
)

set "SDK_DIR=%ANDROID_HOME%"
if "%SDK_DIR%"=="" set "SDK_DIR=%ANDROID_SDK_ROOT%"
if "%SDK_DIR%"=="" (
  echo ERROR: Define ANDROID_HOME.
  exit /b 1
)

echo.
echo [2/7] Smoke
call npm run smoke
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
echo [6/7] Android SDK
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
echo All gates passed
echo APK: android\app\build\outputs\apk\release\app-release.apk
endlocal
