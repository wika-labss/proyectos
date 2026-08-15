# 04 — Diseño de aplicación

## Proyecto
Alvaro — Snake Android (Expo / React Native)

## Versión
V1

## Objetivo
Ensamblar los módulos de `03-module-discovery.md` en una experiencia coherente: Snake jugable, 3 vidas, score por tiempo vivo y high score local.

---

## 1. Arquitectura de pantallas

```
Home
├── High score (persistido)
└── [Jugar] ──► Game
                  ├── HUD: vidas (3) + score (tiempo vivo)
                  ├── Tablero snake + pelotita
                  ├── D-pad
                  └── colisión → lifeLost → (vidas>0 ? reset : Game Over)
                                    └── Game Over
                                          ├── Score final
                                          ├── High score (actualizado)
                                          ├── [Reintentar] → Game
                                          └── [Home] → Home
```

---

## 2. Flujo principal de usuario

1. Abre app → **Home** (marca **Alvaro**, high score, CTA Jugar).
2. Toca **Jugar** → partida nueva: serpiente corta, 1 pelotita, **3 vidas**, score = 0.
3. Mueve con D-pad; la serpiente avanza sola cada tick.
4. Come pelotita → **crece +1**; nueva pelotita en celda libre; score sigue subiendo por tiempo.
5. Choca → pierde 1 vida; si quedan vidas, reset de serpiente/food y continúa (score de sesión no se reinicia).
6. A 0 vidas → **Game Over**; se actualiza high score si corresponde.
7. Reintentar o volver a Home.

---

## 3. Modelo de datos (conceptual)

```ts
type Direction = "up" | "down" | "left" | "right";
type Cell = { x: number; y: number };

type EngineState = {
  width: number;          // celdas
  height: number;
  snake: Cell[];          // [0] = cabeza
  food: Cell;
  direction: Direction;
  pendingDirection?: Direction;
};

type RunState = {
  status: "idle" | "playing" | "paused" | "lifeLost" | "gameOver";
  lives: number;          // 0..3
  score: number;          // floor(aliveSec * 10)
  startedAtMs: number;
  accumulatedPausedMs: number;
  highScore: number;
};

// Constantes V1
const INITIAL_LIVES = 3;
const TICK_MS = 150;
const SCORE_PER_SECOND = 10;
const GRID = { width: 15, height: 20 }; // portrait-friendly
```

---

## 4. Relaciones entre módulos

| Emisor | Evento / dato | Consumidor |
|--------|---------------|------------|
| `snake-controls` | `queueDirection(dir)` | `game-loop` |
| `game-loop` | `onTick` → `step` | `snake-engine` |
| `snake-engine` | `ate` | UI (feedback), engine crece |
| `snake-engine` | `hitWall` / `hitSelf` | `lives-system` |
| `lives-system` | `lives`, `gameOver` | `game-loop`, UI HUD |
| `game-loop` | playing clock | `survival-score` |
| `survival-score` | `score` | HUD / Game Over |
| `survival-score` | `highScore` | `offline-progress`, Home, Game Over |
| `offline-progress` | hydrate/persist | Home al abrir; Game Over al cerrar run |

---

## 5. Navegación / UI

### Home
- Marca **Alvaro** como señal hero (no solo nav).
- Subtítulo corto: “Snake — sobrevive y crece”.
- High score prominente.
- CTA único primario: **Jugar**.

### Game
- Tablero a color contraste claro (serpiente / comida / fondo).
- HUD superior: `Vidas: ♥♥♥` (o contador) + `Score: N`.
- D-pad inferior; no cubrir el tablero.
- Sin overlays decorativos tipo badges flotantes.

### Game Over
- “Game Over”.
- Score de la partida + High score.
- Botones: **Reintentar**, **Home**.

### Dirección visual V1
- Atmósfera arcade sencilla (fondo con leve gradiente/patrón de grilla).
- Tipografía display jugable (evitar Inter/Roboto/Arial por defecto si hay alternativa Expo).
- Tokens sugeridos:

| Token | Hex | Uso |
|-------|-----|-----|
| Arena | `#0B1F17` | Fondo |
| Grid | `#143528` | Celdas |
| Snake | `#3DDC84` | Cuerpo |
| Head | `#A8FFCE` | Cabeza |
| Food | `#FF5A5F` | Pelotita |
| HUD | `#E8F5E9` | Texto |
| Accent | `#F4C542` | CTA / high score |

---

## 6. Reglas de diseño de juego (contrato)

1. Crecimiento **solo** al comer; +1 segmento por pelotita.
2. Exactamente **3** vidas al iniciar partida.
3. Score = tiempo vivo × 10 (solo en `playing`).
4. High score = máximo histórico local.
5. Input: máx. 1 dirección encolada por tick; sin 180°.

---

## 7. Riesgos de diseño

| Riesgo | Mitigación |
|--------|------------|
| Tick demasiado rápido en dispositivos lentos | `TICK_MS` configurable; medir en device |
| Controles cubren tablero en pantallas chicas | D-pad en zona safe-area inferior; grilla 15×20 |
| Doble tap / swipe erróneo | Cola de 1 comando; D-pad preferido en V1 |
| Score confuso vs comida | Copy en HUD: score es por tiempo; comida = crecimiento |

---

## 8. Criterios de aceptación de diseño

- [ ] Home → Jugar inicia partida con 3 vidas y score 0
- [ ] Comer pelotita crece +1 y respawnea comida
- [ ] Choque resta vida; a 0 → Game Over
- [ ] Score refleja tiempo vivo; high score persiste
- [ ] Controles responden sin invertir 180°
- [ ] Offline completo

---

## Criterio de salida — Diseño V1

- [x] Pantallas y flujos definidos
- [x] Contratos entre módulos
- [x] Modelo de datos
- [x] Tokens visuales definidos
- [x] Auditoría de ensamblado (`audits/auditoria-ensamblado.md` — APROBADO)
