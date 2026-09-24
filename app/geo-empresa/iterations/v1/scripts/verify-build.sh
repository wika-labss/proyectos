#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA Build Verification — Geo Empresa v1 ==="

echo "[1/4] Smoke"
npm run smoke

echo "[2/4] TypeScript"
npx tsc --noEmit

if ! command -v java >/dev/null 2>&1 || [[ -z "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" && ! -f android/local.properties ]]; then
  echo "[3/4] APK omitido (sin JDK/SDK en este entorno). Smoke + typecheck OK."
  exit 0
fi

echo "[3/4] Bundle + prebuild"
npx expo export --platform android
npx expo prebuild --platform android
node scripts/post-prebuild.js

echo "[4/4] assembleRelease"
cd android
./gradlew assembleRelease
cd ..
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
