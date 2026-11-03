# Look C — tipo editorial (Team C2)

**Branch:** `cursor/look-c-tipo-editorial-aa58`  
**Base:** `cursor/look-colorido-aa58`  
**Fecha:** 2026-11-03  
**Scope:** tipografía + escala (colores/layout Colorido locked)

## Pairing

| Role | Face | Notes |
| :--- | :--- | :--- |
| Brand wordmark | **Syne** 800 | Hero + nav + CTAs — self-hosted |
| Titles / display copy | **Newsreader** 400–700 (+ italic lead) | OFL via `@fontsource/newsreader` → `public/assets/fonts/` |
| Body / UI / meta | **Plus Jakarta Sans** | Unchanged from Colorido |

No Inter. No purple. No color redesign.

## Scale table

| Token / role | Family | Size | Weight | Tracking | Line-height | Where |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **display** (`--fs-display`) | Syne | `clamp(2.55rem, 6.5vw + 0.55rem, 3.85rem)` | 800 | `-0.055em` | `0.92` | `.tw-hero__brand` |
| **title** (`--fs-title`) | Newsreader | `clamp(1.2rem, 1.6vw + 0.55rem, 1.65rem)` | 600 | `-0.012em` | `1.22` | `h1` / section titles |
| Hero headline | Newsreader | `clamp(1.12rem … 1.48rem)` | 600 | `-0.012em` | `1.22` | `#buscar-titulo` — subordinate to brand |
| Hero lead | Newsreader italic | `1.02rem` | 400 | 0 | `1.55` | `.tw-hero__lead` |
| Card title | Newsreader | `1.05rem` | 600 | `-0.012em` | `1.2` | `.tw-card__title` (tighter) |
| **body** (`--fs-body`) | Jakarta | `1.0625rem` | 400 | 0 | `1.62` | `body` |
| Card meta | Jakarta | `0.82rem` | 400–600 | `0–0.01em` | `1.3` | `.tw-card__who` / `__tag` |
| **meta** (`--fs-meta`) | Jakarta | `0.7–0.75rem` | 700 | `0.08em` | `1.35` | field labels, sort, chips |

## Fitting spaces

- **Hero:** more stage padding + brand→title air (`0.85rem`); brand ~2× headline so wordmark dominates.
- **Results:** denser card padding (`0.72rem`), smaller titles/meta, tighter list gap (`0.55rem`).
- **Mobile:** search stacks 1-col; fields/CTAs `min-height: 44px` (`--tap-min`).

## Capturas

- `look-c-tipo-editorial-inicio.png`
- `look-c-tipo-editorial-resultados.png`
- `look-c-tipo-editorial-perfil.png`
- `look-c-tipo-editorial-mobile.png`

Also under `/opt/cursor/artifacts/screenshots/`.

## Tests

`npm test` — **64 passed** (ids + Contactar invariants).
