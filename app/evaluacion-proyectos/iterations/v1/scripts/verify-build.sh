#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== WIKA Build Verification — Evaluación Proyectos v1 ==="

echo ""
echo "[1/2] Smoke (validación + API eval_*)"
npm run smoke

echo ""
echo "[2/2] TypeScript"
npx tsc --noEmit

echo ""
echo "V1 gates passed (APK release fuera de alcance)"
