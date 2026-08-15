# 03 — Descubrimiento de módulos

## Proyecto
Alvaro — Snake Android (Expo / React Native)

## Versión de documentación
V1

## Objetivo de esta etapa
Traducir `02-features.md` en módulos reutilizables con responsabilidades claras, entradas/salidas y dependencias. Priorizar motor puro (testable) separado de UI.

---

## Inventario de módulos (V1)

| Módulo | Tipo | Estado V1 | Justificación |
|--------|------|-----------|---------------|
| `snake-engine` | core | **Nuevo** | Grilla, movimiento, crecimiento, colisiones, spawn de pelotitas |
| `lives-system` | core | **Nuevo** | 3 vidas, pérdida por choque, señal de game over |
| `survival-score` | core | **Nuevo** | Puntaje por tiempo vivo + comparación high score |
| `game-loop` | core | **Nuevo** | Tick/intervalo, pausa, estados de partida |
| `offline-progress` | infra | **Nuevo** | Persistencia local del high score |
| `snake-controls` | ui | **Nuevo** | D-pad / input de dirección con cola de 1 comando |
| `snake-screens` | ui | **Nuevo** | Home, Game, Game Over |
| `android-release` | infra | Reutilizar patrón WIKA | Pipeline APK Release Expo SDK 52 |

---

## Módulos — detalle

### `snake-engine` (nuevo)

**Responsabilidad:** Reglas puras del Snake sin UI ni timers.

**API conceptual:**
```
createGame(width, height): GridState
step(state, direction): StepResult
  // mueve cabeza, detecta comida/colisión, crece si come, spawnea food
spawnFood(state): Cell
isOpposite(a, b): boolean
```

**Entradas:** tamaño de grilla, dirección actual, estado (snake[], food, growing).

**Salidas:** nuevo estado, eventos `ate` | `hitWall` | `hitSelf` | `boardFull`.

**Reglas:**
- Crecer **+1** solo al comer pelotita.
- No permitir 180° (validado aquí o en controls; una sola capa debe rechazarlo).
- Food siempre en celda libre.

**Reutilizable:** Sí (cualquier UI / plataforma JS).

**Dependencias:** ninguna de UI ni storage.

---

### `lives-system` (nuevo)

**Responsabilidad:** Contar vidas y decidir si la partida continúa.

**API conceptual:**
```
initialLives = 3
onCollision(lives): { lives: number, gameOver: boolean }
resetSnakeOnLifeLost(): void  // señal; el engine reinicia pose
```

**Entradas:** evento de colisión desde `snake-engine`.

**Salidas:** `livesRemaining`, `gameOver`.

**Reglas:**
- Partida nueva → 3 vidas.
- Colisión con vidas > 1 → vidas−1 + reset serpiente.
- Colisión con vidas = 1 → vidas 0 + Game Over.

**Reutilizable:** Sí (patrón de vidas para otros juegos).

**Dependencias:** consume eventos de `snake-engine`; no conoce score.

---

### `survival-score` (nuevo)

**Responsabilidad:** Calcular puntaje por tiempo vivo y gestionar high score en memoria.

**API conceptual:**
```
startRun(nowMs)
tickScore(nowMs): score   // score = floor(elapsedSec * 10)
pause() / resume()
endRun(): finalScore
getHighScore(): number
considerHighScore(score): number  // max(score, high)
```

**Entradas:** reloj monotónico / timestamps; señales playing/paused/gameOver.

**Salidas:** `score`, `highScore`.

**Reglas V1:**
- Solo cuenta tiempo en estado `playing`.
- Comer pelotitas **no** suma puntos directos.
- High score se actualiza al Game Over (o en vivo si se desea; V1 al menos al cerrar run).

**Reutilizable:** Sí (scoring por supervivencia).

**Dependencias:** `offline-progress` para persistir high score.

---

### `game-loop` (nuevo)

**Responsabilidad:** Orquestar ticks, estados y coordinación engine ↔ lives ↔ score.

**Estados:**
```
idle → playing → lifeLost (brief) → playing → gameOver
              ↘ paused ⇄ playing
```

**API conceptual:**
```
startGame()
queueDirection(dir)
onTick()
pause() / resume()
```

**Dependencias:** `snake-engine`, `lives-system`, `survival-score`, `snake-controls`.

---

### `offline-progress` (nuevo)

**Responsabilidad:** Persistir high score localmente (AsyncStorage).

**API conceptual:**
```
loadHighScore(): Promise<number>
saveHighScore(n): Promise<void>
```

**Clave sugerida:** `alvaro:v1:highScore`

**Reutilizable:** patrón WIKA de persistencia local.

**Dependencias:** AsyncStorage (Expo).

---

### `snake-controls` (ui)

**Responsabilidad:** Capturar input de dirección y encolar máximo 1 cambio por tick.

**V1:** D-pad on-screen (↑ ↓ ← →).

**Dependencias:** `game-loop` (queueDirection).

---

### `snake-screens` (ui)

**Responsabilidad:** Home (Jugar + high score), Game (HUD vidas/score + tablero), Game Over (score, high, reintentar).

**Dependencias:** `game-loop`, `survival-score`, `offline-progress`.

---

### `android-release` (infra)

**Responsabilidad:** Build APK Release según estándar WIKA (Expo 52, JDK 17, verify-build).

---

## Qué NO es módulo en V1

| Idea | Motivo |
|------|--------|
| Power-ups / obstáculos | Fuera de alcance |
| Online leaderboard | Offline-first |
| Audio engine complejo | Deseable; no bloquea V1 |
| Physics engine | Snake es grilla discreta |

---

## Orden de construcción sugerido (módulos)

1. `snake-engine` (puro + tests unitarios de crecimiento/colisión)
2. `lives-system`
3. `survival-score` + `offline-progress`
4. `game-loop`
5. `snake-controls` + `snake-screens`
6. `android-release` (APK)

---

## Criterio de salida — Descubrimiento V1

- [x] Módulos identificados con responsabilidad única
- [x] Crecimiento por pelotita, 3 vidas y score por tiempo vivo cubiertos
- [x] Dependencias explícitas
- [x] Fuera de alcance claro
- [x] Auditoría de módulos (`audits/auditoria-modulos.md` — APROBADO)
