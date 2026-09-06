@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0\.."

echo === WIKA APK Release - Arkanoid v3 ===
echo Genera un APK autonomo: el bundle JS va embebido, no necesita Metro.
echo.

echo [1/5] Toolchain
if not defined ANDROID_HOME (
  if exist "%LOCALAPPDATA%\Android\Sdk" set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
)
if not defined JAVA_HOME (
  for /d %%D in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do (
    if exist "%%D\bin\java.exe" set "JAVA_HOME=%%D"
  )
)
if not defined JAVA_HOME (
  echo ERROR: Define JAVA_HOME apuntando a JDK 17.
  echo   set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17"
  echo O instala Temurin 17 y deja la carpeta en Eclipse Adoptium.
  exit /b 1
)
set "JAVA_HOME=%JAVA_HOME:"=%"
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo ERROR: No existe "%JAVA_HOME%\bin\java.exe"
  echo JAVA_HOME actual: %JAVA_HOME%
  exit /b 1
)

set "JAVA_VER_FILE=%TEMP%\wika-arkanoid-java-ver.txt"
"%JAVA_HOME%\bin\java.exe" -version >"%JAVA_VER_FILE%" 2>&1
type "%JAVA_VER_FILE%"
findstr /c:"version \"17" "%JAVA_VER_FILE%" >nul
if errorlevel 1 (
  echo.
  echo ERROR: WIKA requiere JDK 17 para Gradle.
  echo   set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17"
  exit /b 1
)
echo JDK 17 OK

set "SDK_DIR=%ANDROID_HOME%"
if "%SDK_DIR%"=="" set "SDK_DIR=%ANDROID_SDK_ROOT%"
if "%SDK_DIR%"=="" (
  echo ERROR: Define ANDROID_HOME con la ruta del SDK de Android.
  echo   set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
  exit /b 1
)
echo SDK: %SDK_DIR%

set "PATH=%CD%\node_modules\.bin;%JAVA_HOME%\bin;%PATH%"

if not exist "node_modules\expo-font\package.json" (
  echo.
  echo [1b] npm install en iterations\v3
  call npm install
  if errorlevel 1 exit /b 1
)
if not exist "node_modules\expo-font\package.json" (
  echo ERROR: falta expo-font. Corre npm install dentro de iterations\v3
  exit /b 1
)

echo.
echo [2/5] prebuild android
if exist "node_modules\.bin\expo.cmd" (
  call node_modules\.bin\expo.cmd prebuild --platform android
) else (
  call npx --no -- expo prebuild --platform android
)
if errorlevel 1 exit /b 1

echo.
echo [3/5] post-prebuild
call node scripts\post-prebuild.js
if errorlevel 1 exit /b 1

echo.
echo [4/5] android\local.properties
set "SDK_FWD=%SDK_DIR:\=/%"
> android\local.properties echo sdk.dir=%SDK_FWD%
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
echo Instalar: adb install -r android\app\build\outputs\apk\release\app-release.apk
endlocal
