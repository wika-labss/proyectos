#!/usr/bin/env bash
set -euo pipefail

echo "=== WIKA Build Verification — Vissius Control Remote v1 ==="

echo "[1/4] expo-doctor"
npx expo-doctor

echo "[2/4] TypeScript"
npx tsc --noEmit

echo "[3/4] expo export (Android bundle)"
npx expo export --platform android --output-dir dist-verify

echo "[4/4] Paleta en theme.ts"
grep -q "F7B9AD" src/constants/theme.ts
grep -q "E83A17" src/constants/theme.ts
grep -q "000000" src/constants/theme.ts

echo "=== All DEV gates passed ==="
