#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA Build Verification — BBY Light v1 ==="

echo ""
echo "[1/6] Toolchain"

if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: Java not found. Install JDK 17 (WIKA standard)."
  exit 1
fi

echo "Java: $(java -version 2>&1 | head -n1)"
if java -version 2>&1 | grep -qE 'version "(21|22|23|24|25|26)\.'; then
  echo "WARNING: WIKA requires JDK 17 for Gradle. Point JAVA_HOME at a JDK 17 install if Gradle fails."
fi

echo ""
echo "[2/6] expo-doctor"
npx expo-doctor

echo ""
echo "[3/6] TypeScript"
npx tsc --noEmit

echo ""
echo "[4/6] prebuild android"
npx expo prebuild --platform android
node scripts/post-prebuild.js

# The SDK path must be written after prebuild: prebuild treats a directory that
# only holds local.properties as a malformed project and wipes it.
echo ""
echo "[5/6] Android SDK"
LOCAL_PROPS="$ROOT/android/local.properties"
SDK_DIR="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"

if [[ -f "$LOCAL_PROPS" ]]; then
  echo "Using existing android/local.properties"
elif [[ -n "$SDK_DIR" && -d "$SDK_DIR" ]]; then
  echo "sdk.dir=$SDK_DIR" > "$LOCAL_PROPS"
  echo "Wrote android/local.properties from ANDROID_HOME"
else
  echo "ERROR: Android SDK not configured."
  echo "Export ANDROID_HOME, or copy scripts/local.properties.example to android/local.properties"
  exit 1
fi

echo ""
echo "[6/6] gradle assembleDebug"
cd android
./gradlew assembleDebug
cd ..

echo ""
echo "All gates passed"
echo "APK: android/app/build/outputs/apk/debug/app-debug.apk"
