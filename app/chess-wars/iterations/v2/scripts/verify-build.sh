#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA Build Verification — AI Chess Wars v2 ==="

echo ""
echo "[1/7] Toolchain"
if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: Java not found. Install JDK 17 (WIKA standard)."
  exit 1
fi
echo "Java: $(java -version 2>&1 | head -n1)"

echo ""
echo "[2/7] Smoke (classic + evolutive)"
npm run smoke

echo ""
echo "[3/7] TypeScript"
npx tsc --noEmit

echo ""
echo "[4/7] Bundle JS"
npx expo export --platform android

echo ""
echo "[5/7] prebuild android"
npx expo prebuild --platform android
node scripts/post-prebuild.js

echo ""
echo "[6/7] Android SDK"
LOCAL_PROPS="$ROOT/android/local.properties"
SDK_DIR="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [[ -f "$LOCAL_PROPS" ]]; then
  echo "Using existing android/local.properties"
elif [[ -n "$SDK_DIR" && -d "$SDK_DIR" ]]; then
  echo "sdk.dir=$SDK_DIR" > "$LOCAL_PROPS"
else
  echo "ERROR: Android SDK not configured."
  exit 1
fi

echo ""
echo "[7/7] gradle assembleRelease"
cd android
./gradlew assembleRelease
cd ..

echo ""
echo "All gates passed"
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
