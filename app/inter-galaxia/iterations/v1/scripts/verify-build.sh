#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Inter Galaxia — verify-build (WIKA gates) ==="

echo "[gate] expo-doctor"
npx --yes expo-doctor

echo "[gate] typescript"
npx tsc --noEmit

echo "[gate] expo export (android bundle)"
npx expo export --platform android

echo "=== All gates passed ==="
