# 03 — Descubrimiento de módulos

## Proyecto
Chupalo joako — Tetris Android (Expo / React Native)

## Versión de documentación
V1

## Objetivo de esta etapa
Traducir `02-features.md` en módulos reutilizables con responsabilidades claras, entradas/salidas y dependencias. Priorizar motor puro (testable) separado de UI. Separar **puntuación** de **dificultad por puntaje** para que la gravedad nunca se calcule por líneas.

---

## Inventario de módulos (V1)

| Módulo | Tipo | Estado V1 | Justificación |
|--------|------|-----------|---------------|
| `tetris-engine` | core | **Nuevo** | Pozo, pieza activa, colisión, lock, line clear |
| `piece-bag` | core | **Nuevo** | Randomizer 7-bag + preview |
| `tetris-score` | core | **Nuevo** | Puntos por líneas y drops |
| `score-difficulty` | core | **Nuevo** | Umbrales de puntaje → nivel → gravedad |
| `game-loop` | core | **Nuevo** | Tick de gravedad, estados, pausa |
| `offline-progress` | infra | **Nuevo** | Persistencia local del high score |
| `tetris-controls` | ui | **Nuevo** | Input táctil (move / rotate / drops) |
| `vivid-playfield` | ui | **Nuevo** | Render pozo con paleta llamativa |
| `tetris-screens` | ui | **Nuevo** | Menú / Game / Pausa / Game Over / HowTo |
| `android-release` | infra | Reutilizar patrón WIKA | Pipeline APK Release Expo SDK 52 |

---

## Módulos — detalle

### `tetris-engine` (nuevo)

**Responsabilidad:** Reglas puras de Tetris sin UI ni timers: tablero, pieza activa, movimiento, rotación, lock, limpieza de líneas, top-out.

**Funcionalidades asociadas:** 01, 02, 03, 04 (lock/posición), 05, 10.

**API conceptual:**
```
createBoard(cols=10, rows=20): Board
spawn(board, piece): SpawnResult   // ok | topOut
tryMove(board, piece, dx, dy): Piece | null
tryRotateCW(board, piece): Piece | null   // wall kick ±1
hardDropY(board, piece): number
lock(board, piece): { board, linesCleared: number }
```

**Entradas:** tablero, pieza (tipo, rotación, x, y), comando de movimiento.

**Salidas:** nuevo estado; eventos `locked` | `linesCleared(n)` | `topOut` | `moved` | `rotated`.

**Reglas:**
- 10×20 visibles.
- No superposición con celdas ocupadas ni fuera de bordes laterales/suelo.
- `linesCleared` ∈ {0,1,2,3,4} por lock.
- No conoce puntaje, nivel ni colores.

**Reutilizable:** Sí (cualquier UI / plataforma JS).

**Dependencias:** `piece-bag` para el tipo a spawnear; no conoce score ni UI.

---

### `piece-bag` (nuevo)

**Responsabilidad:** Generar la secuencia de tetrominós (7-bag) y exponer la siguiente pieza.

**Funcionalidades asociadas:** 02, 09.

**API conceptual:**
```
createBag(): BagState
next(bag): { piece, bag, preview }
```

**Entradas:** ninguna de UI.

**Salidas:** tipo de pieza actual y **1** preview.

**Reutilizable:** Sí (otros falling-block).

**Dependencias:** ninguna.

---

### `tetris-score` (nuevo)

**Responsabilidad:** Sumar puntos de la run y comparar high score **en memoria**.

**Funcionalidades asociadas:** 06, 08.

**API conceptual:**
```
onSoftDrop(cells): scoreDelta   // 1 * cells
onHardDrop(cells): scoreDelta   // 2 * cells
onLinesCleared(n): scoreDelta   // 100/300/500/800
getScore(): number
considerHighScore(score): number
resetRunScore()
```

**Reglas V1:** tabla de Feature 06. No multiplica por nivel (el nivel afecta velocidad, no el valor de la línea).

**Entradas:** eventos de drop y `linesCleared` del engine.

**Salidas:** `score`, `highScore` (memoria).

**Reutilizable:** Sí (tabla de scoring intercambiable).

**Dependencias:** `offline-progress` para persistir high score.

---

### `score-difficulty` (nuevo)

**Responsabilidad:** Convertir **puntaje de la partida** en nivel (1–10) y en intervalo de gravedad (ms/celda).

**Funcionalidades asociadas:** 07.

**API conceptual:**
```
levelFromScore(score): 1..10     // 1 + floor(score/500), cap 10
gravityMs(level): number         // tabla Feature 07
softDropMs(level): number        // min(gravityMs, 50)
```

**Entradas:** `score` actual (no líneas, no tiempo).

**Salidas:** `level`, `gravityMs`.

**Reglas:** única fuente de verdad de dificultad. El game-loop **no** incrementa nivel por líneas.

**Reutilizable:** Sí (cualquier juego “más puntos = más ritmo”).

**Dependencias:** ninguna (función pura sobre score).

---

### `game-loop` (nuevo)

**Responsabilidad:** Orquestar gravedad por tiempo, lock delay, estados y coordinación engine ↔ score ↔ difficulty ↔ controls.

**Funcionalidades asociadas:** 04, 07, 10, 12.

**Estados:**
```
menu → playing ⇄ paused
              → locking → playing | gameOver (topOut)
              → gameOver
```

**API conceptual:**
```
startGame()
onFrame(dt)
pause() / resume()
applyInput(cmd)
```

**Tick:** acumular `dt`; cada `gravityMs(levelFromScore(score))` intentar `tryMove(..., 0, +1)`; si no puede bajar, iniciar lock delay 500 ms (hard drop salta a lock).

**Dependencias:** `tetris-engine`, `piece-bag`, `tetris-score`, `score-difficulty`, `tetris-controls`.

---

### `offline-progress` (nuevo)

**Responsabilidad:** Persistir high score (AsyncStorage).

**Funcionalidades asociadas:** 08, 15.

**API conceptual:**
```
loadHighScore(): Promise<number>
saveHighScore(n): Promise<void>
```

**Clave sugerida:** `chupalo-joako:v1:highScore`

**Dependencias:** AsyncStorage (Expo).

**Reutilizable:** Sí (mismo patrón que Alvaro / Arkanoid).

---

### `tetris-controls` (ui)

**Responsabilidad:** Capturar input táctil y mapear a comandos: `left` | `right` | `rotateCW` | `softDrop` | `hardDrop` | `pause`. Repeat DAS/ARR en laterales.

**Funcionalidades asociadas:** 13.

**Entradas:** gestos / botones.

**Salidas:** comandos al `game-loop`.

**Dependencias:** `game-loop`.

**Reutilizable:** Parcial (controles de falling-block).

---

### `vivid-playfield` (ui)

**Responsabilidad:** Render del pozo, pieza activa, stack y preview con **paleta llamativa** (hex de Feature 02), fondo oscuro, HUD score + nivel.

**Funcionalidades asociadas:** 02, 09, 11–12, 16.

**Dependencias:** estado del `tetris-engine` / `game-loop` / `score-difficulty`.

**Reutilizable:** No (skin de este producto).

---

### `tetris-screens` (ui)

**Responsabilidad:** Navegación Menú / Game / Pausa / Game Over / Cómo jugar.

**Funcionalidades asociadas:** 11, 12, 10.

**Dependencias:** módulos ui + `game-loop` + `offline-progress`.

**Reutilizable:** No.

---

### `android-release` (infra)

**Responsabilidad:** Build APK Release según estándar WIKA (Expo 52, JDK 17, verify-build).

**Funcionalidades asociadas:** 17.

**Reutilizable:** Sí (patrón WIKA).

---

## Qué NO es módulo en V1

| Idea | Motivo |
|------|--------|
| Hold / reserva | Deseable Feature 19 |
| SRS completo | Wall kick ±1 basta en V1 |
| Audio engine | Deseable |
| Dificultad por líneas | **Prohibido por contrato** — usa `score-difficulty` |
| Vidas | Fuera de alcance |
| Online leaderboard | Offline-first |

---

## Orden de construcción sugerido (módulos)

1. `tetris-engine` + `piece-bag` (puro + tests de colisión / líneas / top-out)
2. `tetris-score` + `score-difficulty` (tabla de puntos + umbrales 500)
3. `offline-progress`
4. `game-loop` (gravedad según score)
5. `tetris-controls` + `vivid-playfield` + `tetris-screens`
6. `android-release` (APK)

---

## Criterio de salida — Descubrimiento V1

- [x] Módulos identificados con responsabilidad única
- [x] Reglas Tetris (pozo, 7 piezas, líneas, top-out) cubiertas
- [x] Puntos y dificultad por puntaje en módulos separados
- [x] Paleta llamativa como módulo de presentación
- [x] Dependencias explícitas
- [x] Fuera de alcance claro
- [x] Auditoría de módulos (`audits/auditoria-modulos.md` — APROBADO)
