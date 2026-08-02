@echo off
echo === Reparando build Android Sodoku ===

cd /d "%~dp0"

echo.
echo [1/4] Instalando dependencias correctas...
call npx expo install --fix
call npm install expo-build-properties

echo.
echo [2/4] Regenerando carpeta android...
call npx expo prebuild --clean --platform android

echo.
echo [3/4] Forzando Kotlin 1.9.25...
powershell -Command "(Get-Content android\build.gradle) -replace \"'1.9.24'\", \"'1.9.25'\" | Set-Content android\build.gradle"
findstr /V "android.kotlinVersion" android\gradle.properties > android\gradle.properties.tmp
move /Y android\gradle.properties.tmp android\gradle.properties
echo android.kotlinVersion=1.9.25>> android\gradle.properties

echo.
echo [4/4] Limpiando y compilando...
cd android
call gradlew clean
call gradlew assembleDebug

echo.
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo === BUILD OK ===
    echo APK: %cd%\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo === BUILD FALLIDO ===
    echo Ejecuta: gradlew assembleDebug --stacktrace
)

pause
