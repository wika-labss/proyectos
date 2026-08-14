# Paleta Pinki Cute — referencia de diseño

Fuente canónica también en `diseño ui.md`. Esta hoja consolida tokens para implementación en `iterations/v3`.

## Tokens

| Token | Hex | Uso |
|-------|-----|-----|
| `color.soft-pink` | `#FFB6D5` | Fondos, chips suaves, atmósfera |
| `color.hot-pink` | `#FF69B4` | CTA primario (**Jugar**), acentos activos |
| `color.soft-purple` | `#D291FF` | Secundarios, highlights |
| `color.deep-purple` | `#8A2BE2` | Títulos / énfasis fuerte |
| `color.soft-black` | `#1A1A1A` | Texto principal |
| `color.soft-white` | `#FFF0F6` | Superficies claras, contraste con texto |

## Aplicación por pantalla

| Pantalla | Fondo | Primario | Texto |
|----------|-------|----------|-------|
| Home | soft-white + soft-pink gradient/atmósfera | hot-pink | soft-black |
| Game | soft-white | hot-pink (celda activa) / deep-purple (fijos) | soft-black |
| Inventario | soft-white | soft-purple | soft-black |
| Victoria | soft-pink atmósfera | hot-pink CTA | soft-black |

## Referencias visuales
- `image.png`
- `ChatGPT Image 14 ago 2026, 11_13_38.png`
- `diseño ui.md`

## Reglas
- No volver a blanco/negro plano de V1/V2 como look principal.
- Evitar purple-on-white genérico AI: aquí el rosa es el ancla de marca; el púrpura es apoyo.
- Marca **VISSIUSS** debe leerse como señal hero en Home, no solo watermark minúsculo.
