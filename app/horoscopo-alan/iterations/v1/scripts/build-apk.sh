#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA APK Release — Horóscopo Alan v1 ==="

if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: Java not found. Install JDK 17."
  exit 1
fi

npx expo prebuild --platform android
node scripts/post-prebuild.js

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

echo "APK: android/app/build/outputs/apk/release/app-release.apk"
