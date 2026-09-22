# DS-IMPLEMENTATION — Arkanoid v4 → v5

**Expectativa:** `design-system/visual-expectation/arkanoid-v4/` (Gate 1 APROBADO 2026-09-22, juaking1312)  
**Tokens:** `design-system/tokens/arkanoid-v4/overrides.json` → `src/design-system/`  
**Reformulación:** total de UI sobre fork v4 silent; `src/engine/` preservado  
**Gate 2:** no firmado (arquitecto). No se declara `expectation_compliance: 100%`.

## Base

Copia de `origin/cursor/arkanoid-v4-silent-eb2a` → `app/arkanoid/iterations/v5/`.  
`iterations/v4/` no se edita y no se incluye en este PR.

## Qué cambió

| Área | v4 silent | v5 vs VE |
|------|-----------|----------|
| Home | columna gold centrada | left hero ~65% + rail derecho JUGAR / COMO JUGAR / AVATAR |
| Rail | ausente | expand hacia la izquierda, width+opacity 240 ms, un activo |
| Pala | PanResponder sobre tablero, teleport + grant=launch | slider bajo el campo; lerp; tablero solo lanza |
| HUD | fila de textos | chip panel + avatar 12×12 + vidas/score/LV |
| Avatar | 0 | 4 retratos pixel locales + picker + `arkanoid:v5:avatar` |
| Mundo | pack Castillo | sol a bandas + grid + void (mismo chrome menú/partida) |
| Theme | NES gold `#0C0820` | paleta cuantizada night/panel/pink/cyan |
| Font | context `false` / System en home | Press Start cargada; chrome en `PixelText` |
| Storage | `arkanoid:v4:highScore` | `arkanoid:v5:highScore` (no borra v4) |

## Preservado

- `src/engine/**` (cero edits)
- `useArkanoidGame` reglas (vidas, 33 niveles, cápsulas, scores)
- Fade de expo-router
- Sin MP3 / expo-av / jefe / `/win` `/lose`

## Kit (en la iteración; catálogo DS ausente)

`src/modules/arkanoid-ui-kit/`: `RailButton`, `PaddleSlider`, `HudChip`, `AvatarPortrait`, `AvatarPicker`, `VaporwaveBackdrop`, `ChromeButton`.

Avatares **redibujados** como grillas 12×12 (dirección `hero-avatar.png`). No se recortó el PNG de inspiración al APK.

## Tokens

Oficiales publicados post Gate 1. Sync: `bash scripts/sync-design-system.sh`.  
Hex en `app.json` splash/adaptive = token `night` (Expo JSON no importa TS).

## Verify

- `npm run typecheck` — a correr en esta entrega
- `npm run smoke` — a correr en esta entrega
- `npm run verify` / APK — no ejecutado (SDK Android / JDK)

## Honestidad vs 100%

Layout, rail, slider+lerp, HUD chip, avatar local y paleta siguen `design-summary.md`. El PNG home **no** es el wireframe (menú izquierdo baked-in no se copió). Gate 2 lo firma el arquitecto.
