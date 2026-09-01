# DS-IMPLEMENTATION — Match-3 América v3 → v3.1

**Proyecto:** match-3  
**Input:** `iterations/v3/`  
**Output:** `iterations/v3.1/`  
**Expectativa:** `design-system/visual-expectation/match-3-v3/` (Gate 1 APROBADO)  
**Fecha:** 2026-09-01

## Tokens

Runtime: `src/design-system/tokens.ts` + JSON en `src/design-system/tokens/`.

Familia **night-cyan**. Hex **solo** en tokens. Splash nativo `#001B2E`.

| Token | Uso |
|-------|-----|
| `colors.night` / `nightDeep` | Cards / scrim |
| `colors.cyan` / `cyanHi` | CTA, pines, bisel |
| `colors.cobalt` | Pretendientes |
| `colors.star` | Texto |
| `colors.coin` | Monedas / SCORE |
| `colors.panic` | Pánico |
| `fonts.pixel` | PressStart2P |

## Kit

| Spec DS | Runtime |
|---------|---------|
| Match3UiButton ×4 | `src/modules/match3-ui-kit/Match3UiButton.tsx` (bisel View; sheet en assets para sync) |
| Match3HudChip | `Match3HudChip.tsx` |
| Match3SuitorBust | `Match3SuitorBust.tsx` crop 2×2 h1/h2/m1/m2 |
| PixelPanel | `match3-visual/PixelPanel.tsx` outline negro + rim cian |
| NightScreen | `bg-night.png` + scrim |

`PrimaryButton` reexporta `Match3UiButton` (API `label`).

## Assets

| DS | App |
|----|-----|
| `screens/bg-night.png` | `assets/recursos/screens/bg-night.png` |
| `screens/map-americas.png` | `assets/recursos/screens/map-americas.png` |
| `gems.png` | `assets/recursos/ui/gems.png` |
| `gifts.png` | `assets/recursos/ui/gifts.png` |
| `btn-8bit-sheet.png` | `assets/recursos/ui/btn-8bit-sheet.png` |
| `cast/{mx,co,pe,br,ar}.png` | `assets/recursos/cast/` |

Sync: `scripts/sync-design-system.sh` (`DESIGN_SYSTEM_ROOT`).

No se copian refs con watermark de `inspiration/match-3/`.

## Vistas vs mockup

| ID | Mockup | Pantalla | Notas de fidelidad |
|----|--------|----------|--------------------|
| VIEW-01 | hero-home.png | `app/index.tsx` | 3 bloques sobre paisaje; perfil horizontal; diamante; chip C + monedas |
| VIEW-02 | hero-map.png | `app/map.tsx` | Mapa pixel; labels MX→AR (pines en PNG); HUD monedas / VIAJAR / costo |
| VIEW-04 | hero-play.png | `app/play/...` | HUD chips; FÁCIL lima; gemas faceta; grid **8×10** (prod) |
| Elenco | hero-suitors.png | `app/suitors` | Bustos + chip AMIGOS/LIGUE; nombres del catálogo real |

## Preservado

- Engine `src/engine/`
- Economía 3–200, viaje 500/1000, timer 150s
- Storage `match3:v3:progress` — las monedas/progreso V3 siguen valiendo
- Avatares de perfil del jugador (6 fotos); elenco usa bustos pixel

## Gate 2

Pendiente de firma del arquitecto en `design-system/delivery/match-3-v3-to-v3.1/delivery-approval.md`.
