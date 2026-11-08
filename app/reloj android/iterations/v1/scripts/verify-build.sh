#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA Build Verification — Reloj Android v1 ==="

echo ""
echo "[1/6] expo-doctor"
npx expo-doctor

echo ""
echo "[2/6] TypeScript"
npx tsc --noEmit

echo ""
echo "[3/6] expo export"
npx expo export --platform android

echo ""
echo "[4/6] prebuild android"
npx expo prebuild --platform android
node scripts/post-prebuild.js

echo ""
echo "[5/6] gradle assembleRelease"
cd android
./gradlew assembleRelease
cd ..

echo ""
echo "[6/6] All gates passed"
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
