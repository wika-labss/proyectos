@echo off
echo === Reparando build Android Sodoku ===

cd /d "%~dp0"

echo.
echo [1/5] Instalando dependencias correctas...
call npx expo install --fix
call npm install expo-build-properties

echo.
echo [2/5] Regenerando carpeta android...
call npx expo prebuild --clean --platform android

echo.
echo [3/5] Aplicando fix Kotlin 1.9.24...
powershell -Command "(Get-Content android\build.gradle) -replace \"'1.9.25'\", \"'1.9.24'\" | Set-Content android\build.gradle"
echo android.kotlinVersion=1.9.24>> android\gradle.properties

echo.
echo [4/5] Limpiando Gradle...
cd android
call gradlew clean

echo.
echo [5/5] Compilando APK debug...
call gradlew assembleDebug

echo.
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo === BUILD OK ===
    echo APK: %cd%\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo === BUILD FALLIDO ===
    echo Ejecuta manualmente: gradlew assembleDebug --stacktrace
)

pause
