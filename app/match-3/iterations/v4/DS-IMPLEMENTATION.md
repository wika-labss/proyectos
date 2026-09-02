# DS-IMPLEMENTATION — Match-3 América v3.1 → v4

**Proyecto:** match-3  
**Input:** `iterations/v3.1/`  
**Output:** `iterations/v4/`  
**Expectativa:** `design-system/visual-expectation/match-3-v4/`  
**Fecha:** 2026-09-02

Implementación a petición del arquitecto (v4 + APK). Paleta night-cyan reusada.

## Tokens

Runtime: `src/design-system/tokens.ts`. Familia **night-cyan**.

Añadidos de layout: `playOverlayWidth` 92, `boardPanelChrome` 8.  
Precio tienda `SHOP_PRICE` 20000 · tope `GIFT_STOCK_CAP` 10 (`src/constants/game.ts`).

## Kit

| Spec | Runtime |
|------|---------|
| Match3DialogueBubble | `Match3DialogueBubble.tsx` (chrome PixelPanel + label RN) |
| Overlay partida | `Match3PlayOverlay.tsx` (busto + burbuja, no tapa board) |
| Tienda | `app/shop.tsx` grid 8, qty 0–10, COMPRAR off a 10 |

## Vistas

| Vista | Pantalla |
|-------|----------|
| Partida | overlay costado + grid 8×10 alineado |
| Tienda | 8 regalos, 20 000, máx. 10 |
| Ficha | burbuja al DAR |
| Home | CTA Tienda |

## Copy

`src/data/dialogues.ts` — español (regalo, país, matrimonio). Chrome PNG vacío.

## Preservado

- Engine, payout 3–200, viaje 500/1000, timer 150s
- Storage `match3:v3:progress`
- Package `com.wika.match3`

## Gate 2

Pendiente de firma del arquitecto. APK: `final/match-3-america-v4-release.apk`.
