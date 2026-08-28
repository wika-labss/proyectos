#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA APK Release — Geo Empresa v1 ==="

echo "[1/4] prebuild android"
npx expo prebuild --platform android
node scripts/post-prebuild.js

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

echo "[3/4] gradle assembleRelease"
cd android
chmod +x gradlew
./gradlew assembleRelease
cd ..

echo "[4/4] Listo"
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
