# Look colorido — NOTES (Team C)

**Branch:** `cursor/look-colorido-aa58`  
**Fecha:** 2026-11-03  
**Veredicto:** pendiente (Vissiuss)

## Design read

Reading this as: redesign overhaul of a Chilean oficios marketplace (home + results + public profile) for local customers, with a modern colorful energetic language, leaning toward **sunflower + navy** color-block composition — not Indeed sterile chrome, not organic sage 4b, not purple AI gradients.

## Dials

| Dial | Value | Why |
| :--- | :--- | :--- |
| VARIANCE | 8–9 | Asymmetric hero (copy + striped splash), offset result cards, non-centered brand |
| MOTION | 7–8 | Hero brand/title/search staged rise; splash slide-in; scroll reveals on cards/blocks |
| DENSITY | 4–5 | Usable search density without job-board cockpit packing |

## Palette (one system)

- **Navy** `#0c1b33` / mid `#16325a` — ink, header, hero ground, profile borders
- **Sunflower** `#f5c400` — CTAs, brand accent, distance badges, left card stripe
- **Paper** `#eef3fb` — cool wash (not cream/terracotta)
- Type: **Syne** display + **Plus Jakarta Sans** body (no Inter)

## What changed

- Shared chrome: navy header bar with sunflower underline + `.com` accent
- Home: full color-block hero; brand as hero signal; Qué/Dónde/Buscar in elevated sunflower-shadow strip; striped splash plane
- Results: navy title strip; cards with sunflower left rail + km badge (not flat white list)
- Profile: striped banner; square sunflower initial; chunky Contactar; alternating sun/ink section blocks
- Preserved search/profile element ids and Contactar contracts for `buscar.js` / tests

## Avoided (rejected / forbidden)

- Purple-indigo AI gradients, glow spam, emoji UI, Inter as brand face
- Cream + terracotta + serif craft default
- Soft Structuralism teal island / organic sage 4b
- Corporate Indeed blue + sterile LinkedIn grey skins (IA content order kept only)

## Capturas

- `look-colorido-inicio.png`
- `look-colorido-resultados.png`
- `look-colorido-perfil.png`
- `look-colorido-mobile.png`

Also mirrored under `/opt/cursor/artifacts/screenshots/`.

## Tests

`npm test` — 64 passed.
