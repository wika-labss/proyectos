#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DS="${DESIGN_SYSTEM_ROOT:-$(cd "$ROOT/../../../../../design-system" 2>/dev/null && pwd || true)}"
if [[ -z "${DS}" || ! -d "$DS/tokens/ember-keep" ]]; then
  echo "Set DESIGN_SYSTEM_ROOT to the design-system repo."
  exit 1
fi
DEST="$ROOT/src/design-system/tokens"
mkdir -p "$DEST/ember-keep"
cp "$DS/tokens/ember-keep/"*.json "$DEST/ember-keep/"
cp "$DS/tokens/tower-v4/overrides.json" "$DEST/tower-v4-overrides.json"
ASSETS="$ROOT/assets/recursos"
mkdir -p "$ASSETS"
cp "$DS/generated-assets/tower/"*.png "$ASSETS/"
echo "Synced ember-keep tokens and tower assets."
