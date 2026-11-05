#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Inter Galaxia — APK teléfono standalone (Cloud Agent / Linux) ==="

JAVA17="${JAVA_HOME:-}"
if [[ -d /usr/lib/jvm/java-17-openjdk-amd64 ]]; then
  export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
fi
echo "Java: $(java -version 2>&1 | head -n1)"

SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-/workspace/android-sdk}}"
if [[ ! -d "$SDK" ]]; then
  echo "ERROR: Android SDK not found. Set ANDROID_HOME."
  exit 1
fi
export ANDROID_HOME="$SDK"

echo "[1/4] expo export (embedded bundle)"
npx expo export --platform android

echo "[2/4] expo prebuild android"
npx expo prebuild --platform android --no-install
echo "sdk.dir=$SDK" > android/local.properties

if grep -q '^newArchEnabled=' android/gradle.properties; then
  sed -i 's/^newArchEnabled=.*/newArchEnabled=false/' android/gradle.properties
else
  echo "newArchEnabled=false" >> android/gradle.properties
fi
if grep -q '^reactNativeArchitectures=' android/gradle.properties; then
  sed -i 's/^reactNativeArchitectures=.*/reactNativeArchitectures=arm64-v8a/' android/gradle.properties
fi

# Release embebe el bundle JS; debug omite bundling y pide Metro en el teléfono.
echo "[3/4] gradle assembleRelease (JS embebido, firma debug keystore)"
cd android
./gradlew assembleRelease
cd ..

OUT="android/app/build/outputs/apk/release/app-release.apk"
ART="/opt/cursor/artifacts/inter-galaxia-debug.apk"
mkdir -p "$(dirname "$ART")"
cp "$OUT" "$ART"

echo "[4/4] Done"
echo "APK: $OUT"
echo "Artifact: $ART"
