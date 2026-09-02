#!/usr/bin/env bash
set -euo pipefail
# Copia tokens + generated-assets del repo design-system al runtime v3.1.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DS="${DESIGN_SYSTEM_ROOT:-$(cd "$ROOT/../../../../../design-system" 2>/dev/null && pwd || true)}"
if [[ -z "${DS}" || ! -d "$DS/tokens/night-cyan" ]]; then
  echo "Set DESIGN_SYSTEM_ROOT to the design-system checkout."
  echo "Tried sibling ../../../design-system from proyectos root."
  exit 1
fi

DEST_TOKENS="$ROOT/src/design-system/tokens"
mkdir -p "$DEST_TOKENS" "$ROOT/assets/recursos/screens" "$ROOT/assets/recursos/ui" "$ROOT/assets/recursos/cast"
cp "$DS/tokens/night-cyan/colors.json" "$DEST_TOKENS/colors.json"
cp "$DS/tokens/night-cyan/spacing.json" "$DEST_TOKENS/spacing.json"
cp "$DS/tokens/night-cyan/radius.json" "$DEST_TOKENS/radius.json"
cp "$DS/tokens/night-cyan/typography.json" "$DEST_TOKENS/typography.json"
cp "$DS/tokens/match-3-v3/overrides.json" "$DEST_TOKENS/match-3-overrides.json"

AS="$DS/generated-assets/match-3"
cp "$AS/screens/bg-night.png" "$ROOT/assets/recursos/screens/bg-night.png"
cp "$AS/screens/map-americas.png" "$ROOT/assets/recursos/screens/map-americas.png"
cp "$AS/gems.png" "$ROOT/assets/recursos/ui/gems.png"
cp "$AS/gifts.png" "$ROOT/assets/recursos/ui/gifts.png"
cp "$AS/btn-8bit-sheet.png" "$ROOT/assets/recursos/ui/btn-8bit-sheet.png"
cp "$AS/cast/"*.png "$ROOT/assets/recursos/cast/"
echo "Synced design-system → v3.1 ($DS)"
