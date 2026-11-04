# Look C — color coral

**Branch:** `cursor/look-c-color-coral-aa58`  
**Base:** `cursor/look-c-tipo-jakarta-aa58` @ `0d3578ce` (C3 Jakarta)  
**Fecha:** 2026-11-04  
**Scope:** paleta y movimiento del banner. Tipografía y layout de C3 intactos (Syne solo en el logo; Plus Jakarta Sans en la UI; escala 14 / 16 / 20 / 28).

## Skills

| Skill | Uso |
| :--- | :--- |
| **design-taste-frontend** (color role) | Un solo acento, saturación bajo 80% (~77% en `#e85d4c`). Neutros de una sola familia cálida. Color lock: el coral recorre header, hero, CTAs, chips, tags y enlaces. Sin gradiente púrpura de IA. |
| **redesign-existing-projects** (contrast check) | Botones: tinta `#1c1412` sobre coral `#e85d4c` = 5.27:1. Hover `#ff8d7c` = 8.08:1. Enlaces y labels chicos sobre papel usan coral profundo `#b83c2e` = 5.30:1. Placeholders `#7a6158` sobre papel = 5.36:1. Texto sobre tinta (papel, lead, meta) = 17 / 13 / 8.3:1. Foco: anillo coral. |
| Base **C3 Jakarta** | Estructura, ids de búsqueda/perfil y contrato Contactar sin rediseño. |

## Paleta

| Rol | Token | Hex |
| :--- | :--- | :--- |
| Acento | `--coral` | `#e85d4c` |
| Acento hover (relleno) | `--coral-hot` | `#ff8d7c` |
| Acento de texto sobre papel | `--coral-deep` | `#b83c2e` |
| Tinta | `--ink` | `#1c1412` |
| Papel | `--paper` | `#fff6f3` |
| Superficie | `--surface` | `#fffaf8` |
| Texto sobre tinta | `--on-ink` / `--on-ink-soft` / `--on-ink-muted` | `#fff6f3` / `#f3d5cb` / `#c9a89e` |
| Secundario sobre papel | `--ink-soft` / `--ink-faint` | `#5c463f` / `#7a6158` |

Sombras teñidas con la tinta (`rgba(28, 20, 18, …)`) y un glow coral solo en el CTA. El bloque de contacto pasa de `tw-block--sun` a `tw-block--coral` (mismo layout, tinte coral).

## Banner

Técnica: **stripe drift** con `transform: translate3d` en un `::before` más ancho que el recorte. Solo transform (más el velo estático del perfil en `::after`). Sin video.

| Superficie | Gradiente | Desplazamiento de un periodo | Duración |
| :--- | :--- | :--- | :--- |
| Hero `.tw-hero__splash` | franjas a −18°, periodo 112px | −362.44px | 32s linear infinite |
| Perfil `.tw-profile__banner` | franjas a 115°, periodo 72px, cuña de tinta fija | +79.44px | 28s linear infinite |

`prefers-reduced-motion: reduce` no aplica la animación y fuerza `animation: none` en esos pseudo-elementos: el banner queda en el fotograma quieto. Comprobado en Chrome: dos capturas con motion reducido difieren 0 px; con motion, la franja del hero se mueve.

## Capturas

- `look-c-color-coral-inicio.png` (1280×900)
- `look-c-color-coral-perfil.png` (1280×1400)
- `look-c-color-coral-mobile.png` (390×844)

También en `/opt/cursor/artifacts/screenshots/`.

## Tests

`npm test` — 64 passed.
