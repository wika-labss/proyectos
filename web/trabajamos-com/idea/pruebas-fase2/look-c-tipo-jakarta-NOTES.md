# Look C — tipo Jakarta utilitarian (C3)

**Branch:** `cursor/look-c-tipo-jakarta-aa58`  
**Base:** `cursor/look-colorido-aa58`  
**Fecha:** 2026-11-03  
**Veredicto:** pendiente (Vissiuss)

## Design read

Typography-only fit on locked **Look Colorido** (sunflower `#f5c400` + navy `#0c1b33`). Soften Syne into a predictable product UI face: **Plus Jakarta Sans** for titles/UI; **Syne** reserved for the `trabajamos` / `trabajamos.com` logo mark.

## Type dials

| Token | Value | Role |
| :--- | :--- | :--- |
| `--font-logo` | Syne | Logo + hero brand mark only |
| `--font-ui` / body | Plus Jakarta Sans | Titles, CTAs, cards, profile |
| Scale | 14 / 16 / 20 / 28 (`rem`) | `--fs-sm` / `--fs-base` / `--fs-md` / `--fs-lg` |
| Tracking | `0` body; `-0.02em` large titles | Predictable product density |

## What changed (type fit only)

- Replaced Syne-as-display with Jakarta for h1–h3, cards, CTAs, profile, chips, buttons
- Card titles + profile H1: 2-line clamp, no collision with km badge / Contactar
- Search strip: equal field/CTA heights (`3.5rem`), optical label/input baselines
- Mobile (390×844): smaller hero brand/title/lead + shorter splash so Qué/Dónde/Buscar sits above the fold
- Colors, layout concept, element ids, and Contactar contracts unchanged

## Capturas

- `look-c-tipo-jakarta-inicio.png`
- `look-c-tipo-jakarta-resultados.png`
- `look-c-tipo-jakarta-perfil.png`
- `look-c-tipo-jakarta-mobile.png`

Also under `/opt/cursor/artifacts/screenshots/`.

## Tests

`npm test` — 64 passed.
