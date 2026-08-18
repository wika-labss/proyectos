# Informe de botones — Sodoku nuevo V3.1

## Objetivo
Inventariar **todos los controles táctiles tipo botón** en `iterations/v3.1/` para guiar rediseño con el catálogo `recursos/` (Cute Pink Aesthetic).

## Fecha
2026-08-18

## Código auditado
`app/sodoku nuevo/iterations/v3.1/`

## Asset gráfico disponible (V3.1)
| Asset | Ruta en iteración | Origen catálogo |
|-------|-------------------|-----------------|
| Botón Cute Pink | `assets/recursos/btn_002_cute_pink.png` | `recursos/buttons/btn_002_cute_pink.png` |
| Background | `assets/recursos/bg_002_cute_pink.png` | `recursos/backgrounds/2. Cute Pink Aesthetic/` |

Componente wrapper: `src/components/CutePinkButton.tsx`

---

# Resumen ejecutivo

| Categoría | Cantidad |
|-----------|----------|
| CTA con asset `btn_002` | **2** |
| CTA flat (Pressable + estilo tema) | **12** |
| Info / navegación secundaria (chips / links) | **4** |
| Teclado numérico (dígitos + borrar) | **10** |
| Selector de nivel (dinámico, hasta 100) | **hasta 100** |
| Celdas tablero Sudoku | **81** |
| **Total controles táctiles fijos (sin niveles/celdas)** | **28** |

**Hallazgo clave:** solo la Home aplica el botón gráfico Cute Pink. El resto de la app aún usa botones flat.

---

# Inventario por pantalla

## 1. Home — `app/index.tsx`

| ID | Label / control | Tipo | Asset / estilo | Destino / acción |
|----|-----------------|------|----------------|------------------|
| H-01 | **Jugar** | CTA primario | `CutePinkButton` → `btn_002_cute_pink.png` | `/game/{continueLevelId}` |
| H-02 | **Inventario** | CTA secundario | `CutePinkButton` compact → `btn_002` | `/inventory` |
| H-03 | **Puntaje** | Info button | Flat `infoBtn` (sin asset) | `/score` |
| H-04 | **Histórico** | Info button | Flat `infoBtn` | `/history` |
| H-05 | **Regalos** | Info button | Flat `infoBtn` | `/inventory` |
| H-06 | **Ver todos los niveles** | Link text | Flat underline | `/levels` |

**Usa `btn_002`:** H-01, H-02  
**Pendiente asset:** H-03 … H-06

---

## 2. Juego — `app/game/[levelId].tsx` + componentes

| ID | Label / control | Tipo | Asset / estilo | Acción |
|----|-----------------|------|----------------|--------|
| G-01 | **Pista (∞)** | CTA | Flat `action` (rosa sólido) | `useHint()` — infinito en test |
| G-02 | **Reiniciar nivel** | CTA secundario | Flat `actionSecondary` | `resetLevel()` |
| G-N1…G-N9 | Dígitos **1–9** | NumberPad | Flat `btn` | `placeNumber(n)` |
| G-N0 | **Borrar** | NumberPad | Flat `clear` | `clearCell()` |
| G-C** | Celdas 9×9 | Tablero | Celda `Pressable` | `selectCell(row,col)` |

Archivos: `NumberPad.tsx`, `SudokuBoard.tsx`

**Usa `btn_002`:** ninguno  
**Prioridad rediseño CTA:** G-01, G-02

---

## 3. Niveles — `app/levels.tsx`

| ID | Label / control | Tipo | Asset / estilo | Acción |
|----|-----------------|------|----------------|--------|
| L-** | Nivel `{id}` (1–100 desbloqueados) | Grid card | Flat `card` + Link | `/game/{id}` |

**Usa `btn_002`:** ninguno  
**Nota:** volumen alto (hasta 100); no conviene un banner `btn_002` por celda — usar chip/tile Cute Pink tipado.

---

## 4. Inventario — `app/inventory.tsx`

| ID | Label / control | Tipo | Asset / estilo | Acción |
|----|-----------------|------|----------------|--------|
| I-01 | **Inicio** | CTA | Flat `primary` | `router.replace('/')` |
| I-02 | **Jugar** | CTA | Flat `secondary` | `/levels` |

**Usa `btn_002`:** ninguno — **candidatos directos a `CutePinkButton`**

---

## 5. Puntaje — `app/score.tsx`

| ID | Label / control | Tipo | Asset / estilo | Acción |
|----|-----------------|------|----------------|--------|
| S-01 | **Volver** | CTA | Flat `btn` | `router.back()` |

**Usa `btn_002`:** ninguno

---

## 6. Histórico — `app/history.tsx`

| ID | Label / control | Tipo | Asset / estilo | Acción |
|----|-----------------|------|----------------|--------|
| Y-01 | **Volver** | CTA | Flat `back` | `router.back()` |

**Usa `btn_002`:** ninguno

---

## 7. Victoria — `app/victory.tsx`

| ID | Label / control | Tipo | Asset / estilo | Acción |
|----|-----------------|------|----------------|--------|
| V-01 | **Siguiente nivel** / **Ver niveles** | CTA primario | Flat `btnPrimary` | next level o `/levels` |
| V-02 | **Repetir** | CTA | Flat `btn` | `/game/{levelId}` |
| V-03 | **Inventario** | CTA | Flat `btn` | `/inventory` |
| V-04 | **Inicio** | CTA | Flat `btn` | `/` |

**Usa `btn_002`:** ninguno — **alta prioridad** (pantalla emocional post-regalo)

---

# Clasificación por estilo visual

| Estilo | IDs |
|--------|-----|
| Gráfico `btn_002_cute_pink` | H-01, H-02 |
| Flat tema rosa (sin PNG) | H-03…H-06, G-01, G-02, G-N*, I-01, I-02, S-01, Y-01, V-01…V-04, L-* |
| Celda tablero | G-C* |

---

# Matriz de migración sugerida (próxima iteración)

| Prioridad | Botones | Acción recomendada |
|-----------|---------|-------------------|
| P0 | V-01 … V-04, I-01, I-02 | Reusar `CutePinkButton` + `btn_002` |
| P1 | G-01 Pista, G-02 Reiniciar | `CutePinkButton` compact o variante más angosta |
| P2 | S-01, Y-01, H-06 | `CutePinkButton` compact o link tipado |
| P3 | H-03…H-05 info | Chips Cute Pink (no necesariamente banner completo) |
| P4 | NumberPad 1–9 / Borrar | Teclas tipadas (no `btn_002` full-width) |
| P5 | Levels grid / celdas | Tokens de color; no asset banner |

---

# Controles que NO son botones de UI de navegación

- Header nativo Expo Router (`Stack.Screen`) — back del sistema
- `ActivityIndicator` de carga (no interactivo)

---

# Conclusión

V3.1 introduce el **patrón gráfico Cute Pink solo en Home (2 botones)**.  
Quedan **~12 CTA flat fijos** + NumberPad + grids como deuda visual explícita para unificar con `recursos/buttons/btn_002_cute_pink.png` (u otras variantes del catálogo).

Ver también: `auditoria-v3.1.md` en esta misma carpeta.
