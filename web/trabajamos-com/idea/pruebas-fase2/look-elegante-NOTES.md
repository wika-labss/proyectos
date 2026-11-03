# Look Elegante — notas de prueba (Team B)

| Campo | Valor |
| :--- | :--- |
| Cuándo | 2026-11-03 |
| Branch | `cursor/look-elegante-aa58` |
| Skills | `high-end-visual-design` (principios Soft Structuralism) · `design-taste-frontend` dials 5–6 / 4–5 / 3 · `redesign-skill` |
| Dirección | **Pearl Soft Structuralism** (expresión nueva; no recrea prueba 3) |
| Veredicto | Pendiente (Vissiuss) |

## Design read

Marketplace público de oficios (Chile) para clientes: calma high-end Soft Structuralism en expresión **perla fría + pizarra oceánica**, con tipografía presente y un solo acento.

## Qué se cambió

- Cabecera quieta (barra + wordmark Syne); **sin** isla de vidrio / hamburger floating pill.
- Home: marca hero-level (`eg-hero__brand`) + headline funcional + lead corto + búsqueda en double-bezel suave; sin chips de filtros.
- Resultados: lista editorial con distancia a la izquierda y hairlines (sin cards densas tipo job board).
- Perfil: columna editorial (orden Contacto → Ofertas → Portafolio → Localidad); sin banner LinkedIn / avatar circular; CTA `Contactar` pill con icono anidado.
- Tokens: papel `#f2f3f6`, tinta `#16191f`, acento único `#2f4f5c`; Syne + Plus Jakarta (self-hosted).
- Motion: reveal suave (`cubic-bezier(0.32, 0.72, 0, 1)`), respetando `prefers-reduced-motion`.

## Evitado a propósito

- Prueba 3 rechazada: island glass header, purple ethereal, OLED black.
- Cluster cream + terracotta + serif; Inter/Roboto/Arial como cara expresiva; gradientes morados; anatomía Indeed/LinkedIn.

## Contratos preservados

Ids/a11y de `04-html-design`: `#form-buscar`, `#q`, `#localidad`, `#usar-ubicacion`, `#ubicacion-actual`, `#estado-busqueda`, `#reintentar`, `#resultados`, Contactar + `#contacto-dato`, secciones de perfil.

## Capturas

- `look-elegante-inicio.png`
- `look-elegante-resultados.png`
- `look-elegante-perfil.png`
- `look-elegante-mobile.png`

También en `/opt/cursor/artifacts/screenshots/`.

## Tests

`npm test` — 64/64 passed.
