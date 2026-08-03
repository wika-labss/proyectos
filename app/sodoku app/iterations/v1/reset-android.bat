@echo off
setlocal enabledelayedexpansion

echo ============================================
echo  RESET COMPLETO BUILD ANDROID - SODOKU
echo ============================================

cd /d "%~dp0"

echo.
echo [1/7] Corrigiendo dependencias Expo...
call npx expo install --fix
call npx expo install react-native-screens@~4.4.0 expo-build-properties

echo.
echo [2/7] Eliminando carpeta android antigua...
if exist android rmdir /s /q android

echo.
echo [3/7] Regenerando proyecto Android...
call npx expo prebuild --platform android

echo.
echo [4/7] Forzando Kotlin 1.9.25...
powershell -Command "(Get-Content android\build.gradle) -replace \"'1.9.24'\", \"'1.9.25'\" | Set-Content android\build.gradle"

REM Eliminar lineas kotlinVersion viejas y poner una sola
findstr /V /I "android.kotlinVersion" android\gradle.properties > android\gradle.properties.tmp 2>nul
if exist android\gradle.properties.tmp move /Y android\gradle.properties.tmp android\gradle.properties
echo.>> android\gradle.properties
echo android.kotlinVersion=1.9.25>> android\gradle.properties

echo.
echo [5/7] Verificando que NO quede 1.9.24...
findstr /S /I /C:"1.9.24" android\*.gradle android\*.properties 2>nul
if %ERRORLEVEL%==0 (
    echo ADVERTENCIA: Aun hay referencias a 1.9.24 arriba. Corrigelas manualmente.
) else (
    echo OK - No hay 1.9.24 en archivos gradle
)

echo.
echo [6/7] Limpiando Gradle...
cd android
call gradlew --stop
if exist .gradle rmdir /s /q .gradle
call gradlew clean

echo.
echo [7/7] Compilando APK debug...
call gradlew assembleDebug --stacktrace > ..\build-log.txt 2>&1
set BUILD_RESULT=%ERRORLEVEL%

echo.
echo === ERRORES KOTLIN (si hay) ===
findstr /R /C:"^e: " ..\build-log.txt

echo.
if %BUILD_RESULT%==0 (
    echo ============================================
    echo  BUILD OK
    echo  APK: %cd%\app\build\outputs\apk\debug\app-debug.apk
    echo ============================================
) else (
    echo ============================================
    echo  BUILD FALLIDO - log completo en build-log.txt
    echo ============================================
)

cd ..
pause
