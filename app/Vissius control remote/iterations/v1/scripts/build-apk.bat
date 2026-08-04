@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0.."

echo === WIKA APK Release - Vissius Control Remote v1 ===
echo Genera un APK autonomo: el bundle JS va embebido, no necesita Metro.
echo.

echo [1/5] Toolchain
where java >nul 2>&1
if errorlevel 1 (
  echo ERROR: Java no encontrado en PATH. Instala JDK 17.
  exit /b 1
)

for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do (
  set "JAVA_RAW=%%v"
  goto :got_java
)
:got_java
set "JAVA_RAW=!JAVA_RAW:"=!"
for /f "delims=. tokens=1" %%m in ("!JAVA_RAW!") do set "JAVA_MAJOR=%%m"
echo Java detectado: !JAVA_RAW!

if not "!JAVA_MAJOR!"=="17" (
  echo.
  echo ERROR: WIKA requiere JDK 17 para Gradle. Detectado: !JAVA_MAJOR!
  echo Usa el JBR de Android Studio:
  echo   set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
  echo   set "PATH=%%JAVA_HOME%%\bin;%%PATH%%"
  exit /b 1
)

set "SDK_DIR=%ANDROID_HOME%"
if "%SDK_DIR%"=="" set "SDK_DIR=%ANDROID_SDK_ROOT%"
if "%SDK_DIR%"=="" (
  echo ERROR: Define ANDROID_HOME con la ruta del SDK de Android.
  exit /b 1
)
echo SDK: %SDK_DIR%

echo.
echo [2/5] prebuild android
call npx expo prebuild --platform android || exit /b 1

echo.
echo [3/5] post-prebuild
call node scripts\post-prebuild.js || exit /b 1

echo.
echo [4/5] android\local.properties
set "SDK_FWD=!SDK_DIR:\=/!"
> android\local.properties echo sdk.dir=!SDK_FWD!
type android\local.properties

echo.
echo [5/5] gradle assembleRelease
cd android
call gradlew.bat assembleRelease || exit /b 1
cd ..

echo.
echo Listo.
echo APK: android\app\build\outputs\apk\release\app-release.apk
echo Instalar: adb install -r android\app\build\outputs\apk\release\app-release.apk
endlocal
