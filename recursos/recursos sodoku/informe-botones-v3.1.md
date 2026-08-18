# Informe de botones — Sodoku nuevo V3.1 (reconstruido)

## Objetivo
Inventariar controles táctiles de `iterations/v3.1/` y especificar, por botón:
- tamaño de UI / asset
- formato técnico del archivo
- prompt sugerido para generar diseño gráfico Cute Pink alineado a función, tamaño y estilo

## Fecha
2026-08-18 (reconstrucción)

## Código auditado
`app/sodoku nuevo/iterations/v3.1/`

## Referencia de estilo (catálogo)
| Recurso | Archivo | Dimensión fuente |
|---------|---------|------------------|
| Botón base | `recursos/buttons/btn_002_cute_pink.png` | **1536×1024** PNG |
| Background Home | `recursos/backgrounds/2. Cute Pink Aesthetic/bg_002_cute_pink.png` | landscape PNG |
| Paleta | `#FFD6E7` `#FFB7D5` `#FFA3C8` `#FFFFFF` `#FFF5F8` | — |

Estilo objetivo: **Cute Pink Aesthetic / kawaii glossy** — cápsula horizontal, corazones, bordes dorados suaves, centro limpio para texto overlay, sin texto baked-in (salvo variantes de dígito).

---

# Resumen ejecutivo

| Categoría | Cantidad | Con asset gráfico hoy |
|-----------|----------|------------------------|
| CTA Home con `btn_002` | 2 | Sí |
| CTA flat fijos | 12 | No |
| Info / links Home | 4 | No |
| NumberPad (1–9 + Borrar) | 10 | No |
| Tiles de nivel | hasta 100 | No |
| Celdas tablero | 81 | No (no requieren banner) |

**Hallazgo:** solo **H-01 Jugar** y **H-02 Inventario** usan `btn_002`. El resto es flat.

---

# Especificaciones globales de asset

| Campo | Estándar recomendado |
|-------|----------------------|
| Contenedor | PNG **RGBA** (transparencia real, sin checkerboard bakeado) |
| Color space | sRGB |
| Densidad | Entregar **@1x + @2x + @3x** o un master @3x y exportar |
| Stretch | Zona central **9-slice / safe text area** limpia (sin ornamentación) para overlay de label en código |
| Texto en asset | **No** incluir label (excepto teclas 1–9 si se prefiere dígito dibujado) |
| Estilo | Misma familia que `btn_002_cute_pink`: glossy pink, hearts/wings opcionales, gold trim fino |
| Peso | CTA full ≤ 300 KB; chip/tecla ≤ 80 KB (comprimir PNG/WebP si el pipeline lo permite) |
| Naming | `btn_sodoku_<rol>_<variante>@Nx.png` |

### Tamaños master sugeridos (export)

| Rol UI | Uso en app (dp aprox.) | Master @3x (px) | Aspecto |
|--------|------------------------|-----------------|---------|
| CTA full / banner | max 340×72 (compact 340×56) | **1024×216** (o 1536×324) | ~4.7:1 cápsula |
| CTA medio | minWidth 220×48 | **660×144** | ~4.6:1 |
| Chip info | 96×64 | **288×192** | ~1.5:1 redondeado |
| Tecla número | 36×44 | **108×132** | ~0.8:1 |
| Borrar / barra | full width × 44 | **1024×132** | barra |
| Tile nivel | 72×72 | **216×216** | 1:1 |
| Link / text-btn | no PNG (tipografía) o pill 200×36 | **600×108** opcional | pill |

> El asset actual `btn_002` es **1536×1024** (~3:2), más “placa” que cápsula ancha. En app se **estira** a 340×72. Para nuevos assets, preferir masters **anchos** cercanos a 4.5–5:1 para menos distorsión.

---

# Tabla maestra — descripción, tamaño, formato y prompt

| ID | Botón / control | Pantalla | Función | Tamaño UI (dp) | Formato asset requerido | Prompt sugerido (diseño gráfico) | Estado V3.1 |
|----|-----------------|----------|---------|----------------|-------------------------|----------------------------------|---------------|
| H-01 | **Jugar** | Home | CTA primario → continuar nivel | max **340×72** | PNG RGBA; cápsula ~**1024×216** @3x; safe-area central ≥60% ancho; sin texto; stretchable | `Cute pink aesthetic mobile game CTA button, wide horizontal capsule 1024x216, glossy bubblegum pink (#FFA3C8 #FFB7D5 #FFD6E7), soft gold trim, small heart ornaments only on left/right ends, EMPTY clean center panel for text overlay, kawaii magical girl UI, transparent background, no letters, no watermark, high detail 3D resin look` | Ya usa `btn_002` (stretch) |
| H-02 | **Inventario** | Home | CTA secundario → inventario | max **340×56** compact | Mismo master que H-01 o variante **1024×168**; PNG RGBA; sin texto | `Same cute pink capsule button family as magical girl UI, slightly shorter 1024x168, softer secondary emphasis, empty center for label "Inventario", transparent PNG, no text baked in` | Ya usa `btn_002` compact |
| H-03 | **Puntaje** | Home | Info → score | **96×~64** chip | PNG RGBA **288×192** @3x; icono estrella/score + área valor; o chip vacío | `Cute pink info chip 288x192, rounded squircle, pastel pink glass, tiny gold star icon on top half, empty lower half for numeric score overlay, kawaii UI, transparent background, no numbers drawn` | Flat |
| H-04 | **Histórico** | Home | Info → history | **96×~64** chip | PNG RGBA **288×192**; icono lista/reloj | `Cute pink info chip 288x192 matching pastel palette #FFD6E7 #FFA3C8, small scroll/list glyph, empty space for history count, transparent PNG, no text` | Flat |
| H-05 | **Regalos** | Home | Info → gifts count / inventory | **96×~64** chip | PNG RGBA **288×192**; icono regalo/heart | `Cute pink gift info chip 288x192, kawaii wrapped gift or heart present icon, soft blush #FFF5F8 panel, empty zone for gift count number, transparent background` | Flat |
| H-06 | **Ver todos los niveles** | Home | Link → levels grid | texto / opcional pill **200×36** | Preferir tipografía; si PNG: **600×108** pill sin texto | `Minimal cute pink text-pill button 600x108, subtle outline #FFA3C8, almost flat pastel fill #FFF5F8, empty center for link label, transparent PNG` | Flat link |
| G-01 | **Pista (∞)** | Game | Usa pista (infinita en test) | full width × **~48** | PNG RGBA barra **1024×144**; safe center; icono bombilla/estrella lateral opcional | `Wide cute pink game action bar 1024x144, glossy pink capsule, small sparkle/hint star on left end only, large empty center for text "Pista", mobile puzzle UI, transparent PNG, no text` | Flat |
| G-02 | **Reiniciar nivel** | Game | Regenera puzzle | full width × **~48** | PNG RGBA **1024×144** variante secundaria (más clara) | `Wide secondary cute pink button bar 1024x144, lighter blush fill #FFF5F8 with pink border, small refresh arrows motif on right end, empty center for label, transparent PNG, kawaii soft UI` | Flat |
| G-N1…9 | Dígitos **1–9** | Game NumberPad | Inserta número | **36×44** c/u | PNG RGBA set **108×132** @3x ×9 (o 1 tecla vacía + dígito en código) | `Single cute pink keypad key 108x132, rounded rectangle, glossy pink #FFA3C8, soft gold micro-edge, EMPTY center for digit overlay OR include bold white digit {N}, matching kawaii sudoku pad, transparent background` | Flat |
| G-N0 | **Borrar** | Game NumberPad | Limpia celda | full width × **~40** | PNG RGBA **1024×120** barra secundaria | `Cute pink erase/clear bar button 1024x120, soft white-pink #FFF5F8 body, rose outline, tiny eraser or X heart icon left, empty center for "Borrar", transparent PNG` | Flat |
| G-C* | Celdas 9×9 | Tablero | Selecciona celda | celda flexible (~screen/9) | **No asset botón**; estados vía color (selected `#FFD6E7`, error rojo) | _(N/A — no generar banner)_ `Optional: subtle pink cell highlight texture 128x128 seamless soft blush, very low contrast` | Pressable celda |
| L-* | Tile **Nivel N** | Levels | Abre nivel desbloqueado | **72×72** | PNG RGBA tile **216×216**; estados: disponible / completado / locked (3 assets o tints) | `Cute pink level select tile 216x216, rounded squircle, pastel pink glossy frame, empty center for level number overlay, variants: unlocked, completed with small heart check, locked with soft padlock, transparent PNG, no numbers` | Flat cards |
| I-01 | **Inicio** | Inventario | Vuelve a Home | full / **~340×56** | Reusar CTA compact H-02 master | `Reuse cute pink capsule CTA 1024x168 empty center, home/house mini icon optional left, kawaii style consistent with btn_002 family` | Flat → migrar a `CutePinkButton` |
| I-02 | **Jugar** | Inventario | Ir a niveles | full / **~340×56** | Reusar CTA H-01/H-02 | `Same cute pink primary capsule as play CTA, empty center for "Jugar", transparent PNG` | Flat → migrar |
| S-01 | **Volver** | Puntaje | `router.back()` | ~**220×48** | PNG RGBA **660×144** o reusar compact | `Medium cute pink back button 660x144 capsule, small chevron or heart-arrow left, empty center for "Volver", pastel pink glossy, transparent PNG` | Flat |
| Y-01 | **Volver** | Histórico | `router.back()` | full width × **~48** | Igual S-01 / barra **1024×144** | `Same family as score back button, wide 1024x144 optional, empty label area, cute pink aesthetic, transparent PNG` | Flat |
| V-01 | **Siguiente nivel** / **Ver niveles** | Victoria | Avanza o lista | min **220×48** primario | PNG RGBA **660×144** o full **1024×144**; énfasis celebración | `Celebratory cute pink primary CTA 1024x144, brighter glossy #FFA3C8, sparkles and tiny hearts on ends, empty center for "Siguiente nivel", victory screen mobile UI, transparent PNG, no text` | Flat P0 |
| V-02 | **Repetir** | Victoria | Rejuega nivel | min **220×48** | PNG RGBA **660×144** secundaria | `Secondary cute pink button 660x144, softer blush fill, small replay arrows motif, empty center for "Repetir", transparent PNG` | Flat P0 |
| V-03 | **Inventario** | Victoria | Ver regalos | min **220×48** | PNG RGBA **660×144**; icono regalo | `Cute pink button 660x144 with tiny gift icon left, empty center for "Inventario", matches magical girl pink UI, transparent PNG` | Flat P0 |
| V-04 | **Inicio** | Victoria | Home | min **220×48** | PNG RGBA **660×144** | `Cute pink home navigation button 660x144, soft capsule, optional house glyph, empty center for "Inicio", transparent PNG` | Flat P0 |

---

# Inventario por pantalla (referencia rápida)

## Home `app/index.tsx`
H-01, H-02 (`btn_002`) · H-03, H-04, H-05 (chips) · H-06 (link)

## Game `app/game/[levelId].tsx` + `NumberPad` + `SudokuBoard`
G-01, G-02 · G-N1…9, G-N0 · G-C* (celdas)

## Levels `app/levels.tsx`
L-* tiles 1–100

## Inventario / Score / History / Victory
I-01, I-02 · S-01 · Y-01 · V-01…V-04

---

# Pack mínimo recomendado para producción gráfica

Entregar en `recursos/recursos sodoku/assets-pendientes/` (cuando se generen):

| Archivo sugerido | Cubre IDs | Master px |
|------------------|-----------|-----------|
| `btn_sodoku_cta_full@3x.png` | H-01, I-02, V-01 | 1024×216 |
| `btn_sodoku_cta_compact@3x.png` | H-02, I-01, V-02…V-04, S-01 | 1024×168 / 660×144 |
| `btn_sodoku_action_bar@3x.png` | G-01 | 1024×144 |
| `btn_sodoku_action_bar_secondary@3x.png` | G-02, Y-01, G-N0 | 1024×144 |
| `chip_sodoku_info_{puntaje,historico,regalos}@3x.png` | H-03…H-05 | 288×192 |
| `key_sodoku_digit@3x.png` (+ opcional 1–9) | G-N1…9 | 108×132 |
| `tile_sodoku_level_{unlocked,done,locked}@3x.png` | L-* | 216×216 |

---

# Matriz de prioridad

| Prioridad | IDs | Motivo |
|-----------|-----|--------|
| P0 | V-01…V-04, I-01, I-02 | Pantallas post-victoria / inventario; reusan CTA |
| P1 | G-01, G-02 | Acciones de partida más visibles |
| P2 | S-01, Y-01, H-06 | Navegación secundaria |
| P3 | H-03…H-05 | Chips info Home |
| P4 | G-N* | NumberPad (set pequeño repetible) |
| P5 | L-* | Tiles (3 estados, no 100 arts distintos) |

---

# Prompt base reutilizable (copiar/pegar)

```text
Design a mobile game UI button asset for an Android Sudoku app ("Sodoku nuevo"),
Cute Pink Aesthetic / kawaii magical-girl style matching palette
#FFD6E7 #FFB7D5 #FFA3C8 #FFFFFF #FFF5F8 with optional soft gold trim.
Shape: [CAPSULA ANCHA / CHIP / TECLA / TILE] exactly [W]x[H] pixels.
Leave a clean empty center safe-area for text overlay in code.
Ornaments only on edges (hearts, wings, sparkles). Glossy resin 3D look.
Transparent background (PNG RGBA). No baked-in text, no watermark, no checkerboard.
Function of button: [FUNCION]. Visual emphasis: [PRIMARIO/SECUNDARIO/INFO].
```

---

# Conclusión

1. Hoy solo **2** botones tienen arte (`btn_002`); el resto es flat.  
2. Nuevos assets deben ser **más anchos** que 1536×1024 para el uso real 340×72.  
3. Usar la **tabla maestra** + **prompt base** para encargar el pack P0→P5.  
4. Celdas del tablero **no** requieren botón banner.

Ver también: `auditoria-v3.1.md` en esta carpeta.
