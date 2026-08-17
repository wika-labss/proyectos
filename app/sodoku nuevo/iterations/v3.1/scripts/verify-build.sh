#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA — Sodoku nuevo: APK Release (NO Metro) ==="
echo "Perfil: BUILD/RELEASE — entregable sideload sin Metro"
echo ""

echo "[1/4] TypeScript"
npx tsc --noEmit

echo ""
echo "[2/4] prebuild android"
npx expo prebuild --platform android --clean
node scripts/post-prebuild.js

echo ""
echo "[3/4] gradle assembleRelease"
cd android
./gradlew assembleRelease
cd ..

APK="android/app/build/outputs/apk/release/app-release.apk"
UNSIGNED="android/app/build/outputs/apk/release/app-release-unsigned.apk"

echo ""
echo "[4/4] Resultado"
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
