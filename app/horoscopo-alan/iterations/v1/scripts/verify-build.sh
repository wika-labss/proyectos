#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA Build Verification — Horóscopo Alan v1 ==="

echo ""
echo "[1/5] Smoke"
npm run smoke

echo ""
echo "[2/5] TypeScript"
npm run typecheck

echo ""
echo "[3/5] Bundle JS"
npx expo export --platform android

echo ""
echo "[4/5] prebuild android"
npx expo prebuild --platform android
node scripts/post-prebuild.js

echo ""
echo "[5/5] Android SDK + gradle"
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

cd android
./gradlew assembleRelease
cd ..

echo ""
echo "All gates passed"
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
