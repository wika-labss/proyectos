#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npx expo prebuild --platform android
node scripts/post-prebuild.js
node scripts/patch-expo-gradle.js
SDK_DIR="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
echo "sdk.dir=$SDK_DIR" > android/local.properties
cd android
chmod +x gradlew
./gradlew assembleRelease
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
