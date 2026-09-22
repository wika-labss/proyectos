#!/usr/bin/env bash
# Copia tokens oficiales DS → src/design-system/overrides.json
# Uso: bash scripts/sync-design-system.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DS="${ROOT}/../../../../../design-system/tokens/arkanoid-v4/overrides.json"
if [[ ! -f "${DS}" ]]; then
  DS="$(cd "${ROOT}/../../../../.." && pwd)/design-system/tokens/arkanoid-v4/overrides.json"
fi
DEST="${ROOT}/src/design-system/overrides.json"
if [[ ! -f "${DS}" ]]; then
  echo "No se encontró tokens/arkanoid-v4/overrides.json. Theme local ya alineado a VE." >&2
  exit 0
fi
cp "${DS}" "${DEST}"
echo "Sincronizado ${DS} → ${DEST}"
echo "Revisar src/design-system/tokens.ts si el JSON cambió."
