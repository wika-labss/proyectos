# Assets UI — pack botones Sodoku (V3.2)

Copia de `recursos/recursos sodoku/assets-generados/` para Metro/Expo.

## Importante (Metro)
**No** usar `@2x` / `@3x` en el nombre del archivo dentro de `require()`.  
Metro interpreta esos sufijos como escala de densidad y busca el archivo base sin ellos.

Nombres correctos: `btn_sodoku_cta_full.png` (no `btn_sodoku_cta_full@3x.png`).

## Archivos

| Archivo | px | Cubre IDs |
|---------|----|-----------|
| `btn_sodoku_cta_full.png` | 1024×216 | H-01, I-02, V-01 |
| `btn_sodoku_cta_compact.png` | 1024×168 | H-02, I-01 |
| `btn_sodoku_cta_medium.png` | 660×144 | V-02…V-04, S-01 |
| `btn_sodoku_action_bar.png` | 1024×144 | G-01 |
| `btn_sodoku_action_bar_secondary.png` | 1024×144 | G-02, Y-01 |
| `btn_sodoku_clear_bar.png` | 1024×120 | G-N0 |
| `btn_sodoku_pill_link.png` | 600×108 | H-06 |
| `chip_sodoku_info_puntaje.png` | 288×192 | H-03 |
| `chip_sodoku_info_historico.png` | 288×192 | H-04 |
| `chip_sodoku_info_regalos.png` | 288×192 | H-05 |
| `key_sodoku_digit.png` | 108×132 | G-N1…9 |
| `tile_sodoku_level_unlocked.png` | 216×216 | L-* |
| `tile_sodoku_level_done.png` | 216×216 | L-* |
| `tile_sodoku_level_locked.png` | 216×216 | L-* |
