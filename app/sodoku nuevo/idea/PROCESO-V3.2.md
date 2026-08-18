# Proceso WIKA — Sodoku nuevo V3.2

## Objetivo
Documentar el proceso seguido para pasar de **auditoría/arte en `recursos sodoku`** a **iteración jugable V3.2**.

## Línea de tiempo del flujo

1. **Idea / Features (V3)** — 100 niveles, rewards, inventario, home acciones/info.  
2. **Construcción V3** — `iterations/v3/` + auditorías prep APROBADO; Release APK pendiente local.  
3. **V3.1 test** — pistas infinitas + Home con `bg_002` / `btn_002` Cute Pink.  
4. **Carpeta `recursos/recursos sodoku`** — auditoría V3.1 + informe de botones (tamaños, formatos, prompts).  
5. **Generación de arte** — pack PNG en `recursos/recursos sodoku/assets-generados/` según informe.  
6. **V3.2 (esta iteración)** — cablear pack en `iterations/v3.2/`, documentar y auditar.

## Entradas de diseño (fuente de verdad)

| Recurso | Ruta |
|---------|------|
| Informe botones | `recursos/recursos sodoku/informe-botones-v3.1.md` |
| Pack generado | `recursos/recursos sodoku/assets-generados/*.png` |
| Paleta | `#FFD6E7 #FFB7D5 #FFA3C8 #FFFFFF #FFF5F8` |
| BG Home | `iterations/v3.2/assets/recursos/bg_002_cute_pink.png` (heredado) |
| UI kit app | `iterations/v3.2/assets/recursos/ui/` (copia del pack) |

## Mapeo pack → pantallas

| Asset | Pantallas / controles |
|-------|------------------------|
| `btn_sodoku_cta_full` | Home Jugar; Inventario Jugar; Victory siguiente |
| `btn_sodoku_cta_compact` | Home Inventario; Inventario Inicio |
| `btn_sodoku_cta_medium` | Victory Repetir/Inventario/Inicio; Score Volver |
| `btn_sodoku_action_bar` | Game Pista |
| `btn_sodoku_action_bar_secondary` | Game Reiniciar; History Volver |
| `btn_sodoku_clear_bar` | NumberPad Borrar |
| `btn_sodoku_pill_link` | Home “Ver todos los niveles” |
| `chip_sodoku_info_*` | Home Puntaje / Histórico / Regalos |
| `key_sodoku_digit` | NumberPad 1–9 |
| `tile_sodoku_level_*` | Levels grid (unlocked/done/locked) |

## Orden de construcción V3.2

1. Bootstrap `iterations/v3.2` desde `v3.1`  
2. Copiar pack → `assets/recursos/ui/`  
3. Implementar `SodokuUiButton` / chips / tiles / NumberPad gráfico  
4. Reemplazar flats en Home, Game, Levels, Inventory, Score, History, Victory  
5. Storage keys `sodoku-nuevo:v3.2:*`  
6. `typecheck` + `smoke`  
7. Auditorías documentación / módulos / ensamblado V3.2  

## Criterios de salida

- [x] Todo CTA flat del informe P0–P3 usa asset del pack (o componente tipado del kit)
- [x] NumberPad y tiles de nivel usan assets del pack
- [x] Proceso documentado en este archivo + `V3.2.md`
- [ ] APK Release en máquina local (fuera de cloud)

## Fuera de alcance V3.2

- Nuevos niveles / cambiar reglas de rewards  
- Desactivar ∞ pistas (sigue flag test; producción futura V3.3)  
- Regenerar arte (usar pack existente)
