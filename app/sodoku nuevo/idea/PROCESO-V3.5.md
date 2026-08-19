# Proceso WIKA — Sodoku nuevo V3.5

## Objetivo

Alcanzar **~99% fidelidad** vs mockups aprobados regenerando el pack UI completo.

## Entradas

- Mockups: `design-system/visual-expectation/sodoku-nuevo-v3.2/*.png`
- Base código: `iterations/v3.4/`
- Pack legacy: `assets/recursos/ui/` (V3.2)

## Orden

1. Bootstrap v3.5 desde v3.4
2. Regenerar 15 PNG → `assets/recursos/ui-v5/`
3. Actualizar `sodoku-ui-kit` (assets + `actionHint`)
4. NumberPad → tecla ui-v5
5. BrandHeader → banner PNG
6. Game: pista `actionHint`
7. Storage v3.5 + versión 3.5.0
8. Catálogo `recursos/recursos sodoku/assets-v5/`
9. Validación + push

## Criterios salida

- [x] Pack ui-v5 (15 PNG) en runtime
- [x] Home banner + chips ui-v5
- [x] Game teclas + pista naranja ui-v5
- [x] Victory CTAs ui-v5
- [x] Storage v3.5:*
- [ ] APK Release local

## Assets ui-v5

| Archivo | Uso |
|---------|-----|
| `btn_sodoku_cta_full.png` | Jugar, Siguiente nivel |
| `btn_sodoku_cta_compact.png` | Inventario |
| `btn_sodoku_cta_medium.png` | Victory secundarios |
| `btn_sodoku_action_bar.png` | Reservado |
| `btn_sodoku_action_hint.png` | **Pista** (naranja) |
| `btn_sodoku_action_bar_secondary.png` | Reiniciar |
| `btn_sodoku_clear_bar.png` | Borrar NumberPad |
| `btn_sodoku_pill_link.png` | Ver niveles |
| `chip_sodoku_info_*.png` | Home info row |
| `key_sodoku_digit.png` | Tecla redonda |
| `tile_sodoku_level_*.png` | Grid niveles |
| `banner_sodoku.png` | Título Home/Victory |
