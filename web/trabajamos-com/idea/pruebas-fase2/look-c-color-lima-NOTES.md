# Look C: color Lima (electric lime)

**Branch:** `cursor/look-c-color-lima-aa58`  
**Base:** `cursor/look-c-tipo-jakarta-aa58` (C3 Jakarta)  
**Fecha:** 2026-11-04  
**Veredicto:** pendiente (Vissiuss)

## Design read

Reading this as: color recalibration of a Chilean oficios marketplace (home, results, public profile) for local customers, preserving the C3 Jakarta layout and type scale, with an electric-lime / charcoal / mist language and a CSS-only kinetic banner.

## Dials

| Dial | Value | Why |
| :--- | :--- | :--- |
| VARIANCE | match C3 | Grid, hero split, radii, and section order stay |
| MOTION | 7 | Entrance reveals stay. The banner drifts. Reduced motion freezes it |
| DENSITY | match C3 | Same 14 / 16 / 20 / 28 scale and spacing |

## Palette

One accent. No sunflower, no coral, no purple, no navy.

| Token | Hex | Role |
| :--- | :--- | :--- |
| `--lime` | `#c6f135` | Accent: CTAs, km badge, logo dot, header rule, banner stripes |
| `--charcoal` | `#121417` | Ink, header, hero ground, profile frame |
| `--mist` | `#f3f6ee` | Page ground and type on charcoal |

Derived steps stay in that family: `--lime-bright #d8f56c`, `--lime-deep #8eae14`, `--lime-soft #e4f3ae`, `--charcoal-mid #1e2420`, `--mist-deep #e2e8d8`. Shadows are charcoal-tinted, with a lime tint only on the search card.

Lime text sits on charcoal (header links, ghost CTA, active chips, TOC). On mist, text and the default focus ring are charcoal. Focus on charcoal chrome (header, menu, ghost CTA, ink block) uses lime. Primary buttons are lime fill with charcoal label.

## Banner technique

**Lima drift.** CSS only, `transform` on an oversized pseudo-element. No JavaScript.

The hero splash (`.tw-hero__splash`) and the profile banner (`.tw-profile__banner`) share a `::before` that is 128px wider than the box. Its background is a `repeating-linear-gradient` at 90deg with a 64px period: lime 12px, lime highlight 4px, charcoal 22px, mist pinstripe 4px, charcoal 22px.

`@keyframes lima-drift` runs `translate3d(-64px, 0, 0)` in 5.5s, linear, infinite. One period of travel lands on the same stripe, so the loop does not jump. `will-change: transform` is set only while that animation runs.

The profile `::after` is a mist sheen (`lima-sheen`, 6.8s, ease-in-out, alternate). The hero keeps the C3 ring and floats it (`lima-blob`, 8.5s, alternate).

`prefers-reduced-motion: reduce` does not declare those animations. The same media query sets `animation: none` on the banner layers and restores the ring to `rotate(-12deg)`, so the stripe field stays on its first frame.

## Typography

Unchanged from C3 Jakarta. Syne is the logo mark only. Plus Jakarta Sans is the UI face. Scale `--fs-sm 0.875rem` / `--fs-base 1rem` / `--fs-md 1.25rem` / `--fs-lg 1.75rem`. Tracking `0` on body and `-0.02em` on large titles. Element ids and the Contactar contract are unchanged.

## Skills

- `design-taste-frontend` at `web-design/external/taste-skill/skills/taste-skill/SKILL.md`. One accent, no purple AI, charcoal instead of pure black, CTA contrast, motion gated by `prefers-reduced-motion`.
- `redesign-skill` (`redesign-existing-projects`) at `web-design/external/taste-skill/skills/redesign-skill/SKILL.md`. Audit-first color cleanup on the existing stack. No framework change.
- Base structure and type: C3 Jakarta, branch `cursor/look-c-tipo-jakarta-aa58`.

## Capturas

- `look-c-color-lima-inicio.png`
- `look-c-color-lima-perfil.png`
- `look-c-color-lima-mobile.png`

Also under `/opt/cursor/artifacts/screenshots/`.

## Tests

`npm test` in `iterations/v1`: 64 passed (37 app + 27 reglas).
