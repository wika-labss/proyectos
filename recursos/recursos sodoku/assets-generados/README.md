# Assets generados — pack botones Sodoku V3.1

Generados según `../informe-botones-v3.1.md` (tabla maestra + pack mínimo).  
Estilo: Cute Pink Aesthetic · paleta `#FFD6E7 #FFB7D5 #FFA3C8 #FFFFFF #FFF5F8`  
Referencia visual: `recursos/buttons/btn_002_cute_pink.png`

## Fecha
2026-08-18

## Archivos listos para UI (redimensionados al master @3x del informe)

| Archivo | px | Cubre IDs | Notas |
|---------|----|-----------|-------|
| `btn_sodoku_cta_full@3x.png` | 1024×216 | H-01, I-02, V-01 | CTA primario cápsula |
| `btn_sodoku_cta_compact@3x.png` | 1024×168 | H-02, I-01 | CTA secundario / compact |
| `btn_sodoku_cta_medium@3x.png` | 660×144 | V-02…V-04, S-01 | Victoria / volver |
| `btn_sodoku_action_bar@3x.png` | 1024×144 | G-01 Pista | Barra acción |
| `btn_sodoku_action_bar_secondary@3x.png` | 1024×144 | G-02 Reiniciar, Y-01 | Barra secundaria |
| `btn_sodoku_clear_bar@3x.png` | 1024×120 | G-N0 Borrar | NumberPad clear |
| `btn_sodoku_pill_link@3x.png` | 600×108 | H-06 | Link pill |
| `chip_sodoku_info_puntaje@3x.png` | 288×192 | H-03 | Chip info |
| `chip_sodoku_info_historico@3x.png` | 288×192 | H-04 | Chip info |
| `chip_sodoku_info_regalos@3x.png` | 288×192 | H-05 | Chip info |
| `key_sodoku_digit@3x.png` | 108×132 | G-N1…9 | Tecla vacía (dígito en código) |
| `tile_sodoku_level_unlocked@3x.png` | 216×216 | L-* disponible | Tile nivel |
| `tile_sodoku_level_done@3x.png` | 216×216 | L-* completado | Tile nivel |
| `tile_sodoku_level_locked@3x.png` | 216×216 | L-* bloqueado | Tile nivel |

## Uso en app
- Overlay de **texto en código** (centro vacío a propósito).
- Preferir `resizeMode="stretch"` o 9-slice en cápsulas anchas.
- Próximo paso código: cablear en `iterations/v3.1` (o V3.2) reemplazando flats.

## Nota
Masters crudos de generación (pre-crop) no se versionan; solo exports al tamaño del informe.
