# 04 — Diseño de aplicación

## Proyecto
Arkanoid — Breakout / Arkanoid Android (Expo / React Native)

## Versión
V1

## Objetivo
Ensamblar los módulos de `03-module-discovery.md` en una experiencia coherente: menú **futurista e intuitivo**, partida **retro** con reglas de Arkanoid clásico, 3 vidas, niveles, score y high score local.

---

## 1. Arquitectura de pantallas

```
Menu (futurista)
├── Marca Arkanoid (hero)
├── High score
├── [Jugar] ──► Game (retro)
├── [Cómo jugar] ──► HowTo ──► Menu
└── (Android back)

Game
├── HUD: vidas + score + nivel
├── Playfield retro: ladrillos + pala + bola
├── Controles: drag pala + launch
├── [Pausa] ──► Pause overlay ──► Reanudar | Menú
├── ballLost → (vidas>0 ? reset ball : Game Over)
├── level cleared → Level Clear → next Game | Victory
└── Game Over / Victory
      ├── Score + High score
      ├── [Reintentar] → Game (nivel 1)
      └── [Menú] → Menu
```

---

## 2. Flujo principal de usuario

1. Abre app → **Menú** futurista (marca **Arkanoid**, high score, CTA **Jugar**).
2. Toca **Jugar** → Nivel 1: muro de ladrillos, pala, bola en pala, **3 vidas**, score = 0.
3. Launch → bola en movimiento; arrastra pala; rebota y rompe ladrillos (reglas clásicas).
4. Pierde bola → −1 vida; si quedan vidas, re-launch; si 0 → **Game Over**.
5. Limpia ladrillos → **Level Clear** → siguiente nivel (vidas se conservan).
6. Completa último nivel → **Victory**; actualiza high score si corresponde.
7. Desde Game Over / Victory: Reintentar o volver al Menú.

---

## 3. Modelo de datos (conceptual)

```ts
type Vec2 = { x: number; y: number };

type BrickType = "normal" | "hard";
type Brick = {
  id: string;
  x: number; y: number; w: number; h: number;
  type: BrickType;
  hitsLeft: number; // normal=1, hard=2
};

type WorldState = {
  width: number;
  height: number;
  paddle: { x: number; y: number; w: number; h: number };
  ball: { pos: Vec2; vel: Vec2; r: number; launched: boolean };
  bricks: Brick[];
};

type RunState = {
  status:
    | "menu"
    | "playing"
    | "paused"
    | "ballLost"
    | "levelClear"
    | "gameOver"
    | "victory";
  lives: number;       // 0..3
  score: number;
  levelIndex: number;  // 0..LEVEL_COUNT-1
  highScore: number;
};

// Constantes V1
const INITIAL_LIVES = 3;
const LEVEL_COUNT = 3;
const SCORE_NORMAL = 100;
const SCORE_HARD = 200;
const BALL_SPEED_BASE = 280; // px/s aprox. en coords lógicas
```

---

## 4. Relaciones entre módulos

| Emisor | Evento / dato | Consumidor |
|--------|---------------|------------|
| `paddle-controls` | `setPaddleX` / `launch` | `game-loop` → engine |
| `game-loop` | `step(dt)` | `arkanoid-engine` |
| `arkanoid-engine` | `brickHit` / `brickDestroyed` | `brick-field`, `arkanoid-score` |
| `brick-field` | `cleared` | `level-progress` |
| `arkanoid-engine` | `ballLost` | `lives-system` |
| `lives-system` | `lives`, `gameOver` | `game-loop`, HUD |
| `level-progress` | next / victory | `game-loop`, pantallas |
| `arkanoid-score` | `score` / `highScore` | HUD, Menu, Game Over |
| `offline-progress` | hydrate/persist | Menu al abrir; fin de run |
| `menu-futuristic` | CTA Jugar | `arkanoid-screens` → Game |
| `playfield-retro` | render | estado engine |

---

## 5. Navegación / UI

### Menú (futurista)
- Marca **Arkanoid** como señal hero (no solo nav).
- Una frase corta: “Rompe el muro. Sobrevive al rebote.”
- High score visible.
- CTA primario único: **Jugar**.
- Secundario: **Cómo jugar** (reglas en 3–4 líneas).
- Atmósfera: fondo profundo con gradiente/scanlines sutiles; acentos cyan/magenta controlados; tipografía display; **sin** cards ni badges flotantes.

### Game (retro)
- Campo con ladrillos por color (filas tipo arcade).
- Pala y bola simples, alto contraste.
- HUD superior: vidas · score · nivel.
- Controles: drag sobre pala / zona inferior; tap para launch si no lanzada.
- Pausa discreta (icono), sin overlays decorativos.

### Level Clear / Game Over / Victory
- Mensaje claro + score + high score.
- CTAs: Continuar / Reintentar / Menú.

### Dirección visual V1 — dos atmósferas

**Menú (futurista)**

| Token | Hex | Uso |
|-------|-----|-----|
| Void | `#050B18` | Fondo |
| Nebula | `#0E1A33` → `#1A0B2E` | Gradiente |
| Neon | `#2EE6D6` | CTA / acentos |
| Magenta | `#E84AFF` | Detalles secundarios |
| Text | `#E8F4FF` | Títulos |

**Partida (retro)**

| Token | Hex | Uso |
|-------|-----|-----|
| CRT | `#1A1020` | Fondo campo |
| Brick1–N | `#E74C3C` `#E67E22` `#F1C40F` `#2ECC71` `#3498DB` `#9B59B6` | Filas |
| Paddle | `#ECF0F1` | Pala |
| Ball | `#FFFFFF` | Bola |
| HUD | `#F5EE9E` | Texto score |

---

## 6. Reglas de diseño de juego (contrato)

1. Rebotes clásicos: paredes, techo, pala (ángulo por impacto), ladrillos.
2. Exactamente **3** vidas al iniciar partida.
3. Score solo por ladrillos destruidos (100 / 200).
4. High score = máximo histórico local.
5. ≥ 3 niveles; limpiar muro = avanzar; último nivel = Victory.
6. Menú futurista ≠ look de partida retro (dos skins conscientes).

---

## 7. Riesgos de diseño

| Riesgo | Mitigación |
|--------|------------|
| Colisiones “túnel” a alta velocidad | `dt` acotado; substeps si es necesario |
| Pala torpe en pantallas chicas | Hit area amplia; clamp a bordes |
| Menú demasiado “busy” futurista | Un CTA primario; cero cards; copy mínimo |
| Confusión visual menú vs juego | Tokens separados documentados arriba |

---

## 8. Criterios de aceptación de diseño

- [ ] Menú → Jugar inicia nivel 1 con 3 vidas y score 0
- [ ] Bola/pala/ladrillos siguen reglas clásicas
- [ ] Perder bola resta vida; a 0 → Game Over
- [ ] Limpiar nivel avanza; último nivel → Victory
- [ ] Score y high score correctos y persistidos
- [ ] Menú se percibe futurista; partida se percibe retro
- [ ] Offline completo

---

## Criterio de salida — Diseño V1

- [x] Pantallas y flujos definidos
- [x] Contratos entre módulos
- [x] Modelo de datos
- [x] Tokens menú futurista + partida retro
- [x] Auditoría de ensamblado (`audits/auditoria-ensamblado.md` — APROBADO)
