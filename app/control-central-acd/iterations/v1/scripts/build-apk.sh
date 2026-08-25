#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA APK Release — Control Central ACD v1 ==="
echo "Genera un APK autonomo: el bundle JS va embebido, no necesita Metro."

if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: Java no encontrado. Instala JDK 17."
  exit 1
fi

echo ""
echo "Java: $(java -version 2>&1 | head -n1)"

echo ""
echo "[1/4] prebuild android"
npx expo prebuild --platform android
node scripts/post-prebuild.js

echo ""
echo "[2/4] Android SDK"
LOCAL_PROPS="$ROOT/android/local.properties"
SDK_DIR="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"

if [[ -f "$LOCAL_PROPS" ]]; then
  echo "Usando android/local.properties existente"
elif [[ -n "$SDK_DIR" && -d "$SDK_DIR" ]]; then
  echo "sdk.dir=$SDK_DIR" > "$LOCAL_PROPS"
else
  echo "ERROR: SDK de Android no configurado."
  exit 1
fi

echo ""
echo "[3/4] gradle assembleRelease"
cd android
./gradlew assembleRelease
cd ..

echo ""
echo "[4/4] Listo"
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
