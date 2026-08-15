# 03 — Descubrimiento de módulos

## Proyecto
Arkanoid — Breakout / Arkanoid Android (Expo / React Native)

## Versión de documentación
V1

## Objetivo de esta etapa
Traducir `02-features.md` en módulos reutilizables con responsabilidades claras, entradas/salidas y dependencias. Priorizar motor puro (testable) separado de UI. Separar **menú futurista** de **partida retro** como capas de presentación.

---

## Inventario de módulos (V1)

| Módulo | Tipo | Estado V1 | Justificación |
|--------|------|-----------|---------------|
| `arkanoid-engine` | core | **Nuevo** | Pala, bola, ladrillos, colisiones, rebotes clásicos |
| `brick-field` | core | **Nuevo** | Layouts de niveles, hits restantes, clear level |
| `lives-system` | core | **Nuevo** | 3 vidas, pérdida por bola caída, game over |
| `arkanoid-score` | core | **Nuevo** | Puntos por ladrillo + high score en memoria |
| `game-loop` | core | **Nuevo** | Tick/frame, estados de partida, pausa |
| `level-progress` | core | **Nuevo** | Avance de niveles, victoria de partida |
| `offline-progress` | infra | **Nuevo** | Persistencia local del high score |
| `paddle-controls` | ui | **Nuevo** | Arrastre horizontal / launch |
| `menu-futuristic` | ui | **Nuevo** | Menú intuitivo, look futurista |
| `playfield-retro` | ui | **Nuevo** | Render partida look retro arcade |
| `arkanoid-screens` | ui | **Nuevo** | Orquestación de pantallas / navegación |
| `android-release` | infra | Reutilizar patrón WIKA | Pipeline APK Release Expo SDK 52 |

---

## Módulos — detalle

### `arkanoid-engine` (nuevo)

**Responsabilidad:** Reglas puras de Arkanoid sin UI ni timers: posición pala/bola, velocidad, rebotes, detección de pérdida.

**API conceptual:**
```
createWorld(width, height): WorldState
setPaddleX(state, x): WorldState
launchBall(state): WorldState
step(state, dtMs): StepResult
  // mueve bola, colisiones paredes/pala/ladrillos, eventos
```

**Entradas:** tamaño del campo, `dt`, input de pala, estado (paddle, ball, bricks).

**Salidas:** nuevo estado; eventos `brickHit` | `brickDestroyed` | `ballLost` | `wallBounce` | `paddleBounce`.

**Reglas:**
- Rebote en techo y laterales.
- Pérdida si `ball.y > bottom`.
- Ángulo de rebote en pala según punto de impacto (clásico).
- No atraviesa ladrillos (resolve un eje / lado de impacto).

**Reutilizable:** Sí (cualquier UI / plataforma JS).

**Dependencias:** `brick-field` para hits; no conoce score ni UI.

---

### `brick-field` (nuevo)

**Responsabilidad:** Definir layouts por nivel y estado de hits de cada ladrillo.

**API conceptual:**
```
loadLevel(levelIndex): Brick[]
hitBrick(id): { bricks, destroyed, cleared }
isCleared(bricks): boolean
```

**Tipos V1:** `normal` (1 hit), `hard` (2 hits, niveles ≥ 2).

**Reutilizable:** Sí (otros breakout).

**Dependencias:** ninguna de UI.

---

### `lives-system` (nuevo)

**Responsabilidad:** Contar vidas y decidir game over.

**API conceptual:**
```
initialLives = 3
onBallLost(lives): { lives, gameOver }
```

**Entradas:** evento `ballLost` desde engine.

**Salidas:** `livesRemaining`, `gameOver`.

**Reutilizable:** Sí (patrón vidas; similar a Alvaro).

**Dependencias:** consume eventos del engine; no conoce score.

---

### `arkanoid-score` (nuevo)

**Responsabilidad:** Sumar puntos por destrucción de ladrillos y gestionar high score en memoria.

**API conceptual:**
```
onBrickDestroyed(type): scoreDelta
getScore(): number
considerHighScore(score): number
resetRunScore()
```

**Reglas V1:** normal = 100; hard = 200 al destruirse.

**Dependencias:** `offline-progress` para persistir high score.

---

### `game-loop` (nuevo)

**Responsabilidad:** Orquestar frame loop, estados y coordinación engine ↔ lives ↔ score ↔ levels.

**Estados:**
```
menu → playing → paused ⇄ playing
              → ballLost (brief) → playing | gameOver
              → levelClear → playing (next) | victory
              → gameOver | victory
```

**API conceptual:**
```
startGame()
onFrame(dt)
pause() / resume()
launch()
```

**Dependencias:** `arkanoid-engine`, `brick-field`, `lives-system`, `arkanoid-score`, `level-progress`, `paddle-controls`.

---

### `level-progress` (nuevo)

**Responsabilidad:** Índice de nivel, carga de layout, victoria de partida.

**API conceptual:**
```
currentLevel: 0..N-1
onLevelCleared(): nextLevel | victory
```

**V1:** ≥ 3 niveles.

---

### `offline-progress` (nuevo)

**Responsabilidad:** Persistir high score (AsyncStorage).

**API conceptual:**
```
loadHighScore(): Promise<number>
saveHighScore(n): Promise<void>
```

**Clave sugerida:** `arkanoid:v1:highScore`

**Dependencias:** AsyncStorage (Expo).

---

### `paddle-controls` (ui)

**Responsabilidad:** Capturar arrastre horizontal y gesto/botón de launch; mapear a coordenadas del mundo.

**Dependencias:** `game-loop` / engine `setPaddleX`, `launchBall`.

---

### `menu-futuristic` (ui)

**Responsabilidad:** Pantalla de menú con diseño **futurista** e intuitivo: marca hero, CTA Jugar, high score, Cómo jugar.

**Tokens visuales (menú):** neon/cyan sobre fondo profundo, tipografía display; sin cards innecesarias.

**Dependencias:** `offline-progress`, navegación a Game.

---

### `playfield-retro` (ui)

**Responsabilidad:** Render del campo con look **retro arcade**: ladrillos planos por color, pala/bola simples, HUD clásico.

**Dependencias:** estado del `arkanoid-engine` / `game-loop`.

---

### `arkanoid-screens` (ui)

**Responsabilidad:** Navegación Menú / Game / Level Clear / Game Over / Victory / Pausa / Cómo jugar.

**Dependencias:** módulos ui + `game-loop`.

---

### `android-release` (infra)

**Responsabilidad:** Build APK Release según estándar WIKA (Expo 52, JDK 17, verify-build).

---

## Qué NO es módulo en V1

| Idea | Motivo |
|------|--------|
| Power-ups / multibola | Deseable; fuera de V1 obligatorio |
| Online leaderboard | Offline-first |
| Physics engine 3D | 2D AABB / círculo-rectángulo basta |
| Audio engine complejo | Deseable |

---

## Orden de construcción sugerido (módulos)

1. `arkanoid-engine` + `brick-field` (puro + tests de colisión/rebote)
2. `lives-system` + `arkanoid-score` + `level-progress`
3. `offline-progress`
4. `game-loop`
5. `paddle-controls` + `playfield-retro` + `menu-futuristic` + `arkanoid-screens`
6. `android-release` (APK)

---

## Criterio de salida — Descubrimiento V1

- [x] Módulos identificados con responsabilidad única
- [x] Reglas clásicas (pala, bola, ladrillos, vidas, niveles, score) cubiertas
- [x] Separación menú futurista vs partida retro
- [x] Dependencias explícitas
- [x] Fuera de alcance claro
- [x] Auditoría de módulos (`audits/auditoria-modulos.md` — APROBADO)
