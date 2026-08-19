# Proceso WIKA — Sodoku nuevo V3.4

## Objetivo

Aplicar visual-expectation aprobada (`design-system/visual-expectation/sodoku-nuevo-v3.2/`).

## Entradas

- Mockups: `design-system/visual-expectation/sodoku-nuevo-v3.2/*.png`
- Tokens DS: `src/design-system/` (heredado V3.3)
- Base código: `iterations/v3.3/`

## Orden

1. Bootstrap v3.4 desde v3.3
2. Copiar mockups → `assets/recursos/v4/reference/`
3. Generar assets runtime V4 (fondos, emblema, tecla redonda)
4. Módulo `sodoku-visual` (BrandHeader, CuteScreenBackground, GameStatusBar, VictoryCelebration)
5. Pantallas Home / Game / Victory
6. NumberPad variant v4
7. Storage v3.4
8. Validación + auditorías

## Criterios salida

- [x] Home usa bg_home_v4 + emblema
- [x] Game usa bg_game_v4 + status chips + teclas redondas
- [x] Victory usa celebración V4 + fondo home
- [ ] APK Release local

## Siguiente (V3.5 opcional)

Regenerar pack completo `assets/recursos/ui/` desde mockups para fidelidad pixel-perfect.
