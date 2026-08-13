#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA — Sodoku nuevo: APK Release (NO Metro) ==="
echo "Perfil: BUILD/RELEASE — entregable sideload sin Metro"
echo ""

SDK_DIR="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [[ -z "$SDK_DIR" && -d "${HOME}/Android/Sdk" ]]; then
  SDK_DIR="${HOME}/Android/Sdk"
fi
if [[ -z "$SDK_DIR" ]]; then
  echo "ERROR: No se encontró Android SDK."
  echo "Define ANDROID_HOME o instala Android Studio."
  exit 1
fi
echo "SDK: $SDK_DIR"

echo ""
echo "[1/5] TypeScript"
npx tsc --noEmit

echo ""
echo "[2/5] prebuild android"
npx expo prebuild --platform android --clean
node scripts/post-prebuild.js

echo ""
echo "[3/5] android/local.properties"
printf 'sdk.dir=%s\n' "$SDK_DIR" > android/local.properties
cat android/local.properties

echo ""
echo "[4/5] gradle assembleRelease"
cd android
./gradlew assembleRelease
cd ..

APK="android/app/build/outputs/apk/release/app-release.apk"
UNSIGNED="android/app/build/outputs/apk/release/app-release-unsigned.apk"

echo ""
echo "[5/5] Resultado"
if [[ -f "$APK" ]]; then
  echo "APK Release: $ROOT/$APK"
elif [[ -f "$UNSIGNED" ]]; then
  echo "APK Release (unsigned): $ROOT/$UNSIGNED"
  echo "Nota: firmar antes de instalar en dispositivo si el sistema lo exige."
else
  echo "No se encontró APK release. Revisar salida de Gradle."
  exit 1
fi

echo ""
echo "Instalar (ejemplo): adb install -r <ruta-apk>"
echo "La app debe abrir SIN Metro."
