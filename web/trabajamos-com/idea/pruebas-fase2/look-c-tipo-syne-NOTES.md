# Look C tipo Syne — NOTES (Typography C1)

**Branch:** `cursor/look-c-tipo-syne-aa58`  
**Base:** `cursor/look-colorido-aa58`  
**Fecha:** 2026-11-03  
**Scope:** fonts / lettering only (Look Colorido palette + layout locked)

## Direction

**Syne denso / compacto** — keep Syne display + Plus Jakarta Sans body; tighten tracking and clamp maxima; denser body/meta so Qué/Dónde, CTAs, cards and profile names fit at 390px and 1280px without clipping.

## Type scale

| Token / role | Size | LH | Tracking | Face |
| :--- | :--- | :--- | :--- | :--- |
| Body | `0.96875rem` (15.5px) | `1.42` | — | Plus Jakarta Sans |
| Meta / help / who / tag | `0.8125rem` (13px) | `1.35` | — | Plus Jakarta Sans |
| Logo (header) | `clamp(1.25–1.55rem)` | `1.08` | `-0.06em` | Syne 800 |
| Brand (hero) | `clamp(1.35–1.85rem)` | `1.08` | `-0.06em` | Syne 800 |
| H1 page | `clamp(1.65–2.4rem)` | `1.08` | `-0.055em` | Syne 800 |
| H1 hero (`#buscar-titulo`) | `clamp(1.3–1.85rem)` | `1.08` | `-0.055em` | Syne 800 |
| Profile name | `clamp(1.45–2.05rem)` | `1.08` | `-0.055em` | Syne 800 |
| H2 | `clamp(1.15–1.3rem)` | `1.15` | `-0.04em` | Syne 800 |
| Card / offer title | `clamp(1.05–1.15rem)` | `1.12` | `-0.04em` | Syne 800 |
| Field input / CTA | `~0.97–1rem` | `1.1–1.3` | CTA `-0.02em` | Body / Syne |

## Fit fixes

- Search grid: `minmax(0,1fr)` + field `min-width:0` + input ellipsis so long comuna strings don’t blow the strip.
- Headings: `text-wrap: pretty` (hero title keeps `balance`); cards/profile use `overflow-wrap: anywhere`.
- CTAs: denser padding/min-height; `nowrap` on desktop, normal wrap on mobile full-width.
- Result head / card columns: flex/grid `min-width:0` to stop orphan overflow.

## Capturas

- `look-c-tipo-syne-inicio.png`
- `look-c-tipo-syne-resultados.png`
- `look-c-tipo-syne-perfil.png`
- `look-c-tipo-syne-mobile.png`

Mirrored under `/opt/cursor/artifacts/screenshots/`.

## Tests

`npm test` — **64 passed**.
