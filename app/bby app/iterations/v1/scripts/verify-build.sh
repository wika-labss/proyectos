#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA Build Verification — BBY Light v1 ==="

echo ""
echo "[0/5] Environment checks"

if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: Java not found. Install JDK 17 (WIKA standard)."
  exit 1
fi

JAVA_VERSION="$(java -version 2>&1 | head -n1)"
echo "Java: $JAVA_VERSION"
if java -version 2>&1 | grep -qE 'version "21\.|version "22\.|version "23\.|version "26\.'; then
  echo "WARNING: WIKA requires JDK 17 for Gradle. Set JAVA_HOME to JDK 17 if the build fails."
fi

SDK_DIR="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
LOCAL_PROPS="$ROOT/android/local.properties"

if [[ -f "$LOCAL_PROPS" ]]; then
  echo "Found android/local.properties"
elif [[ -n "$SDK_DIR" && -d "$SDK_DIR" ]]; then
  mkdir -p "$ROOT/android"
  echo "sdk.dir=$SDK_DIR" > "$LOCAL_PROPS"
  echo "Created android/local.properties from ANDROID_HOME"
else
  echo "ERROR: Android SDK not configured."
  echo "Set ANDROID_HOME or copy scripts/local.properties.example to android/local.properties"
  exit 1
fi

echo ""
echo "[1/5] expo-doctor"
npx expo-doctor

echo ""
echo "[2/5] TypeScript"
npx tsc --noEmit

echo ""
echo "[3/5] prebuild android"
npx expo prebuild --platform android
node scripts/post-prebuild.js

echo ""
echo "[4/5] gradle assembleDebug"
cd android
./gradlew assembleDebug
cd ..

echo ""
echo "[5/5] All gates passed"
echo "APK: android/app/build/outputs/apk/debug/app-debug.apk"
