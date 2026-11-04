# Look C — color cobalto (sobre tipo Jakarta C3)

**Branch:** `cursor/look-c-color-cobalto-aa58`  
**Base:** `cursor/look-c-tipo-jakarta-aa58`  
**Fecha:** 2026-11-04  
**Veredicto:** pendiente (Vissiuss)

## Palette

Un solo sistema. El cobalto es campo de marca, plano. El albaricoque es acento (relleno, filete, franja), nunca texto encima del cobalto.

| Token | Hex | Rol |
| :--- | :--- | :--- |
| Cobalto | `#2f5bff` | Header, hero, bloque de portafolio, pastillas, rail de resultados |
| Cobalto profundo | `#1e42d4` | Misma tinta, un paso más oscuro (hover de campo, franja, enlaces) |
| Albaricoque | `#ffb085` | CTAs, badge km, inicial, `.com`, franjas, subrayados |
| Albaricoque profundo | `#e89468` | Hover del acento |
| Tinta | `#0e1320` | Texto sobre papel y sobre albaricoque |
| Papel | `#f4f6ff` | Fondo de página y texto sobre cobalto (`--on-brand`) |

El par cobalto/albaricoque no llega a 3:1. Por eso el texto sobre cobalto es papel y el texto sobre albaricoque es tinta. Sin malla, sin radiales, sin glow: la página es un degradado plano papel → papel profundo y las sombras son tinta.

Distinto de sunflower (`#f5c400` + navy), de coral y de lima. El cobalto no se trata como azul corporativo de job-board: ocupa el campo entero.

## Banner

El banner estático del perfil (`.tw-profile__banner`) pasa a ser un banner en movimiento.

- `::before` pinta franjas con `repeating-linear-gradient` a 90° (período **96px**: albaricoque, albaricoque profundo, cobalto, cobalto profundo).
- El pseudo es más grande que el banner, gira −16° y se traslada con `translate3d` exactamente un período. Solo `transform` (taste-skill §6.A). El bucle es continuo y sin salto.
- `::after` deja el corte diagonal de cobalto plano (42%) para que el campo de marca no se disuelva en las franjas.
- `@media (prefers-reduced-motion: no-preference)` activa `tw-banner-drift` (14s, linear, infinite).
- Con `prefers-reduced-motion: reduce` la animación queda en `none` y el banner se **congela** en el primer cuadro (franjas visibles, sin recorrido).

## Tipo y estructura

Lock de **C3 Jakarta**: Plus Jakarta Sans en títulos y UI, Syne solo en el logotipo y en la marca del hero. Escala 14 / 16 / 20 / 28, tracking de producto. Grilla del hero, ficha de resultados y perfil (inicial, H1, Contactar, TOC, bloques) no se rehacen. Ids de búsqueda y el contrato Contactar siguen igual.

## Skills

- `web-design/external/taste-skill/skills/taste-skill` — un acento por sistema, sin malla morada ni glow; motion solo en `transform`/`opacity`; `prefers-reduced-motion` obligatorio.
- `skills/indeed-cl-inspired` — anatomía Qué / Dónde / Buscar y listado, sin piel Indeed.
- `skills/linkedin-profile-inspired` — banner + identidad + Contactar + secciones, sin piel LinkedIn.
- Tipo heredado de C3 Jakarta (`cursor/look-c-tipo-jakarta-aa58`), no una skill de dirección nueva.

## Capturas

- `look-c-color-cobalto-inicio.png`
- `look-c-color-cobalto-perfil.png`
- `look-c-color-cobalto-mobile.png`

También en `/opt/cursor/artifacts/screenshots/`.

## Tests

`npm test` — 64 passed.
