# 03 — Descubrimiento de módulos

## Proyecto
Arkanoid — Breakout / Arkanoid Android (Expo / React Native)

## Versión de documentación
V1 + refinamiento V3 (`vaus-capsules`)

## Objetivo de esta etapa
Traducir `02-features.md` en módulos reutilizables con responsabilidades claras, entradas/salidas y dependencias. Priorizar motor puro (testable) separado de UI. Separar **menú futurista** de **partida retro** como capas de presentación.

---

## Inventario de módulos (V1 + V2 histórico + V3)

| Módulo | Tipo | Estado V1 | Justificación |
|--------|------|-----------|---------------|
| `arkanoid-engine` | core | **Nuevo** | Pala, bola, ladrillos, colisiones, rebotes clásicos |
| `vaus-capsules` | core | **V3** | Cápsulas L/E/C/S/B/D/P (Feature 23) |
| `brick-field` | core | **Nuevo** | Layouts de niveles, hits restantes, clear level |
| `boss` | core | **V2 (histórico)** | Jefe móvil — no forma parte de V3 |
| `lives-system` | core | **Nuevo** | 3 vidas, pérdida por bola caída, game over |
| `arkanoid-score` | core | **Nuevo** | Puntos por ladrillo + jefe + high score en memoria |
| `game-loop` | core | **Nuevo** | Tick/frame, estados de partida, pausa |
| `level-progress` | core | **Nuevo** | Avance de niveles, victoria de partida |
| `offline-progress` | infra | **Nuevo** | Persistencia local del high score |
| `paddle-controls` | ui | **Nuevo** | Arrastre horizontal / launch |
| `menu-futuristic` | ui | **Nuevo** | Menú intuitivo, look futurista |
| `playfield-retro` | ui | **Nuevo** | Render partida look retro arcade |
| `arkanoid-screens` | ui | **Nuevo** | Orquestación de pantallas / navegación |
| `android-release` | infra | Reutilizar patrón WIKA | Pipeline APK Release Expo SDK 52 |
| `ambient-audio` | infra | **V3** | Loop ambiental + volumen por canal |

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

**Salidas:** nuevo estado; eventos `brickHit` | `brickDestroyed` | `ballLost` | `wallBounce` | `paddleBounce` | `cleared` | `capsuleSpawned` | `capsuleCaught` | `extraLife` | `breakExit`.

**V3:** el engine orquesta `vaus-capsules` (cápsulas, láseres, multibola, puerta). No conoce vidas ni score.

**Reglas:**
- Rebote en techo y laterales.
- Pérdida si `ball.y > bottom`.
- Ángulo de rebote en pala según punto de impacto (clásico).
- No atraviesa ladrillos (resolve un eje / lado de impacto).

**Reutilizable:** Sí (cualquier UI / plataforma JS).

**Dependencias:** `brick-field` para hits; `vaus-capsules` para spawn/apply; no conoce score ni UI.

---

### `vaus-capsules` (V3)

**Responsabilidad:** Cápsulas clásicas de la Vaus. Puro, sin React.

**API conceptual:**
```
maybeSpawnCapsule(brick, chance, rng): Capsule | null
applyCapsule(state, kind): WorldState
collectCapsules(state): { state, caught }
fireLaser(state): WorldState
powerLabel(power, doorOpen, slow): string | undefined
```

**Reglas (Feature 23):**
- L/E/C/S/D son poderes exclusivos (se sustituyen).
- P = vida extra (evento `extraLife`; no cambia el poder).
- B = abre puerta; no quita el resto.
- D = dos bolas extra; `ballLost` solo si no queda ninguna.
- Perder la última bola (`resetBall`) limpia poderes, cápsulas y láseres.

**Reutilizable:** Sí (otros breakout con power-ups de letra).

**Dependencias:** tipos del engine; `lives-system` consume `extraLife` desde el loop, no desde este módulo.

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
onExtraLife(lives): lives   // tope MAX_LIVES = 6
```

**Entradas:** evento `ballLost` / `extraLife` desde engine.

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

**Dependencias:** `arkanoid-engine`, `vaus-capsules`, `brick-field`, `lives-system`, `arkanoid-score`, `level-progress`, `paddle-controls`.

**V3:** el loop avanza cápsulas/láseres/extras aunque la bola primaria no esté lanzada. `breakExit` se trata como clear de nivel.

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

**Claves:** `arkanoid:v1:highScore` · `arkanoid:v2:highScore` · `arkanoid:v3:highScore`

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

**V3:** dibuja cápsulas (letra + color), láseres, bolas extra y puerta Break.

**Dependencias:** estado del `arkanoid-engine` / `game-loop`.

---

### `arkanoid-screens` (ui)

**Responsabilidad:** Navegación Menú / Game / Level Clear / **LOSER** / **WIN** / Pausa / Cómo jugar.

**V2 (histórico):** LOSER y WIN eran pantallas propias (`/lose`, `/win`).

**V3:** Game Over / Victoria / Level Clear vuelven a overlays (Feature 22). Cómo jugar lista L E C S B D P.

**Dependencias:** módulos ui + `game-loop`.

---

### `android-release` (infra)

**Responsabilidad:** Build APK Release según estándar WIKA (Expo 52, JDK 17, verify-build).

---

### `ambient-audio` (V3)

**Responsabilidad:** Cargar y reproducir el loop ambiental desde recursos; exponer volumen por canal.

**API conceptual:**
```
start(): Promise<void>
setTheme(id): Promise<themeId>  // busca archivo → stop actual → play loop
setVolume('ambient' | 'sfx', n)
getTheme(): themeId
getVolume(channel): number
stop(): Promise<void>
resolveAmbientTheme(id): { id, label, file }
```

**Recursos:**
- `recursos/audio/arkanoid-ambient-loop.mp3` → `ambient-loop.mp3` (Nebula)
- `recursos/audio/arkanoid-ambient-castle.mp3` → `ambient-castle.mp3` (Castillo)

**Reglas:**
- Arranque automático al montar el layout (no espera a Jugar).
- `setTheme` resuelve el id al archivo, detiene y descarga la pista en curso, carga la nueva y la deja en loop al volumen ambiente actual.
- Canal `ambient` ≠ canal `sfx`; el tema no altera esos volúmenes.
- Persistencia: `arkanoid:v3:ambientTheme` + `arkanoid:v3:ambientVolume`.
- Fallo de carga no tumba la app.

**Dependencias:** `expo-av` (`~`), AsyncStorage. Sin React en el manager; el hook/UI envuelven el módulo.

**Reutilizable:** Sí (otros juegos WIKA con un loop de menú/partida).

---

## Qué NO es módulo en V1

| Idea | Motivo |
|------|--------|
| Power-ups / multibola | **Hecho en V3** (`vaus-capsules`, Feature 23) |
| Online leaderboard | Offline-first |
| Physics engine 3D | 2D AABB / círculo-rectángulo basta |
| Audio engine complejo (SFX por evento) | Deseable (Feature 18). Loop ambiente = `ambient-audio` V3 |

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

## Criterio de salida — Descubrimiento V3

- [x] `vaus-capsules` con responsabilidad única (Feature 23)
- [x] Eventos `capsuleSpawned` / `capsuleCaught` / `extraLife` / `breakExit` en el engine
- [x] `boss` marcado histórico; V3 no lo consume
- [x] Auditoría de módulos V3 (`audits/auditoria-modulos-v3.md`)
