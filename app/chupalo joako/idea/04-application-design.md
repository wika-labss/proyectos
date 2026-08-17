# 04 — Diseño de aplicación

## Proyecto
Chupalo joako — Tetris Android (Expo / React Native)

## Versión
V1

## Objetivo
Ensamblar los módulos de `03-module-discovery.md` en una experiencia coherente: menú y partida **arcade de colores llamativos**, Tetris clásico (7 piezas, líneas, top-out), **sistema de puntos** y **dificultad que escala solo con el puntaje**.

---

## 1. Arquitectura de pantallas

```
Menu (arcade llamativo)
├── Marca Chupalo joako (hero)
├── High score
├── [Jugar] ──► Game
├── [Cómo jugar] ──► HowTo ──► Menu
└── (Android back)

Game
├── HUD: score + nivel (derivado del score)
├── Playfield: pozo 10×20 + pieza activa + stack
├── Preview: siguiente pieza (1)
├── Controles: ← → rotar soft-drop hard-drop
├── [Pausa] ──► Pause overlay ──► Reanudar | Menú
├── lock + líneas → score ↑ → si cruza umbral, gravityMs baja
└── top-out → Game Over
      ├── Score + High score
      ├── [Reintentar] → Game (score 0, nivel 1)
      └── [Menú] → Menu
```

---

## 2. Flujo principal de usuario

1. Abre app → **Menú** arcade (marca **Chupalo joako**, high score, CTA **Jugar**).
2. Toca **Jugar** → pozo vacío, score = 0, nivel = 1 (800 ms/celda), primera pieza + preview.
3. Mueve / rota / drop; al lock, líneas completas se borran y suman puntos.
4. Soft/hard drop también suman puntos.
5. Cada **500 puntos** sube el nivel (cap 10) y la pieza cae más rápido.
6. Si la siguiente pieza no entra en spawn → **Game Over**; se actualiza high score si corresponde.
7. Reintentar (nueva run) o volver al Menú.

---

## 3. Modelo de datos (conceptual)

```ts
type Cell = 0 | "I" | "O" | "T" | "S" | "Z" | "J" | "L";

type PieceType = Exclude<Cell, 0>;

type Piece = {
  type: PieceType;
  rot: 0 | 1 | 2 | 3;
  x: number;
  y: number;
};

type Board = {
  cols: 10;
  rows: 20;
  cells: Cell[]; // length cols*rows, row-major
};

type RunState = {
  status: "menu" | "playing" | "paused" | "locking" | "gameOver";
  board: Board;
  active: Piece | null;
  preview: PieceType;
  score: number;
  level: number;      // 1..10 = 1 + floor(score/500)
  gravityMs: number;  // tabla Feature 07
  highScore: number;
};

const COLS = 10;
const ROWS = 20;
const SCORE_PER_LEVEL = 500;
const MAX_LEVEL = 10;
const LOCK_DELAY_MS = 500;
const LINE_SCORES = { 1: 100, 2: 300, 3: 500, 4: 800 } as const;
const SOFT_DROP_PTS = 1;
const HARD_DROP_PTS = 2;
```

---

## 4. Relaciones entre módulos

| Emisor | Evento / dato | Consumidor |
|--------|---------------|------------|
| `tetris-controls` | `left/right/rotate/soft/hard/pause` | `game-loop` |
| `game-loop` | tick gravedad / lock delay | `tetris-engine` |
| `piece-bag` | `next` + `preview` | `game-loop` → spawn |
| `tetris-engine` | `linesCleared(n)` | `tetris-score` |
| `tetris-engine` | celdas de soft/hard drop | `tetris-score` |
| `tetris-engine` | `topOut` | `game-loop` → Game Over |
| `tetris-score` | `score` | `score-difficulty`, HUD |
| `score-difficulty` | `level`, `gravityMs` | `game-loop` (intervalo de caída) |
| `offline-progress` | hydrate/persist high score | Menu al abrir; Game Over |
| `vivid-playfield` | render colores | estado engine + preview |
| `tetris-screens` | navegación | Menu / Game / Pause / Game Over |

Sin ciclos: engine no lee score; difficulty solo lee score; UI no muta el tablero.

---

## 5. Navegación / UI

### Menú (arcade llamativo)
- Marca **Chupalo joako** como señal hero.
- Una frase: “Tetris. Colores. Puntos. Velocidad.”
- High score visible.
- CTA primario único: **Jugar**.
- Secundario: **Cómo jugar**.
- Fondo oscuro + acentos neón de la paleta de piezas; **sin** cards ni badges flotantes.

### Game
- Pozo centrado; celdas con color saturado + borde `#0A0A12`.
- Preview de 1 pieza a la derecha (o arriba en pantallas muy bajas).
- HUD superior: **SCORE** · **NIVEL**.
- Controles inferiores anchos (≥ 44 dp).
- Pausa discreta.

### Cómo jugar (copy V1)
1. Completa líneas horizontales.
2. I = 100, II = 300, III = 500, IIII = 800.
3. Cada 500 puntos el juego se acelera.
4. Si las piezas llegan arriba, se acaba la partida.

### Game Over
- Score + high score.
- CTAs: Reintentar / Menú.

---

## 6. Dirección visual V1 — colores llamativos

Fondo y UI:

| Token | Hex | Uso |
|-------|-----|-----|
| Void | `#07060F` | Fondo app / pozo |
| Panel | `#12101C` | HUD / controles |
| Neon text | `#F8F4FF` | Títulos |
| Accent | `#00F0FF` | CTA Jugar |
| Danger | `#FF3B30` | Game Over |

Piezas (obligatorio, alto contraste entre sí):

| Pieza | Hex |
|-------|-----|
| I | `#00F0FF` |
| O | `#FFE600` |
| T | `#FF2BD6` |
| S | `#7CFF00` |
| Z | `#FF3B30` |
| J | `#3B6BFF` |
| L | `#FF8A00` |

Ghost (si se implementa): mismo hue a ~30% opacity.

---

## 7. Reglas de diseño de juego (contrato)

1. Pozo 10×20; 7 tetrominós; 7-bag.
2. Puntos según tabla Feature 06; **sin** multiplicador por nivel.
3. Nivel y gravedad **solo** desde `score` (umbrales de 500, cap 10).
4. Game Over = top-out; **sin** vidas.
5. High score = máximo histórico local.
6. Look saturado / neón; cada pieza identificable a 1 m de distancia de pantalla.

---

## 8. Riesgos de diseño

| Riesgo | Mitigación |
|--------|------------|
| Controles tap vs gesto ambiguos | Botones explícitos + hit area ≥ 44 dp; DAS/ARR documentado |
| Gravedad nivel 10 demasiado justa en JS | `dt` acotado; lock delay 500 ms da ventana de slide |
| Colores poco distinguibles | Hex fijos; nunca recolorizar por nivel |
| Confundir “nivel” con “líneas” | HUD dice NIVEL derivado de SCORE; copy en Cómo jugar |
| Pozo ilegible en pantallas chicas | Escala uniforme; letterbox; no encoger controles bajo 44 dp |

---

## 9. Criterios de aceptación de diseño

- [ ] Menú → Jugar inicia score 0, nivel 1, gravedad 800 ms
- [ ] Líneas suman 100/300/500/800; drops suman 1 o 2 por celda
- [ ] Al llegar a 500, 1000, … puntos, sube nivel y baja `gravityMs`
- [ ] Top-out → Game Over; high score persiste
- [ ] Siete colores llamativos distintos en pieza activa, stack y preview
- [ ] Offline completo

---

## Criterio de salida — Diseño V1

- [x] Pantallas y flujos definidos
- [x] Contratos entre módulos
- [x] Modelo de datos
- [x] Tokens de paleta llamativa
- [x] Dificultad atada a puntaje
- [x] Auditoría de ensamblado (`audits/auditoria-ensamblado.md` — APROBADO)
