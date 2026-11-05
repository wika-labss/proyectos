#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npx expo prebuild --platform android
node scripts/post-prebuild.js
cd android
./gradlew assembleRelease
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
