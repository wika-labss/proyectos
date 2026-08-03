#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA Build Verification — Sodoku v2 ==="

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
