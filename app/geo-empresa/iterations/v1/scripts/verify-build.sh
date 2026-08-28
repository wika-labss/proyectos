#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA Build Verification — Geo Empresa v1 ==="

echo "[1/5] Smoke"
npm run smoke

echo "[2/5] TypeScript"
npm run typecheck

echo "[3/5] Export bundle"
npx expo export --platform android

echo "[4/5] Prebuild android"
npx expo prebuild --platform android
node scripts/post-prebuild.js

echo "[5/5] Gradle assembleRelease (if SDK available)"
if [[ -n "${ANDROID_HOME:-}" || -f android/local.properties ]]; then
  cd android
  ./gradlew assembleRelease
  cd ..
  echo "APK: android/app/build/outputs/apk/release/app-release.apk"
else
  echo "SKIP: Android SDK not configured"
fi

echo "Verification complete"
