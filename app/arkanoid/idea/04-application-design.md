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
├── level cleared → Level Clear → next Game | Boss | WIN
└── LOSER / WIN (rutas propias)
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
6. Completa el último muro → jefe → **WIN** al derrotarlo; actualiza high score si corresponde.
7. Desde LOSER / WIN: Reintentar o volver al Menú.

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
const LEVEL_COUNT = 4; // 3 muros + jefe
const SCORE_NORMAL = 100;
const SCORE_HARD = 200;
const SCORE_BOSS = 1000;
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

---

## 9. Contrato V3 (vigente)

V3 **sustituye** el flujo V2 (jefe, `/lose`, `/win`) y **añade** cápsulas. El menú futurista y la partida retro no cambian.

### Flujo de pantallas V3

```
Menu (futurista)
├── [Jugar] ──► Game (retro)
├── [Cómo jugar] ──► HowTo (reglas + L E C S B D P)
└── Game
    ├── HUD: vidas (hasta 6) + score + nivel + poder activo
    ├── Playfield: ladrillos + pala + bola(s) + cápsulas + láseres + puerta
    ├── [Pausa] overlay
    ├── ballLost → reset poderes → playing | Game Over overlay
    ├── level cleared | breakExit → Level Clear overlay → next | Victory overlay
    └── Game Over / Victory: score + high score · Reintentar / Menú
```

### Modelo de datos V3 (añadido)

```ts
type CapsuleKind = "L" | "E" | "C" | "S" | "B" | "D" | "P";
type ExclusivePower = "laser" | "enlarge" | "catch" | "slow" | "disrupt";

type WorldState = {
  // ...campos V1
  extraBalls: Ball[];
  capsules: Capsule[];
  lasers: Laser[];
  power: ExclusivePower | null;
  slow: boolean;
  doorOpen: boolean;
  doorExit: boolean;
  laserCooldownMs: number;
};
```

### Relación de módulos V3

| Emisor | Evento | Consumidor |
|--------|--------|------------|
| `arkanoid-engine` | `capsuleSpawned` / `capsuleCaught` | `playfield-retro`, HUD |
| `vaus-capsules` | `extraLife` | `lives-system` (tope 6) |
| `vaus-capsules` | `breakExit` | `level-progress` (mismo camino que clear) |
| `playfield-retro` | render L/E/C/S/B/D/P | tokens `capsuleColor` |

### Tokens de cápsula (partida retro)

| Código | Color | Uso |
|--------|-------|-----|
| L | rojo | Láser |
| E | verde | Enlarge |
| C | cian | Catch |
| S | naranja | Slow |
| B | magenta | Break |
| D | azul | Disrupt |
| P | gris | Player |

### Reglas de diseño V3

7. Cápsulas caen al destruir ladrillos; recogerlas es el único input extra (más toque para láser/relanzar Catch).
8. L/E/C/S/D se sustituyen. P y B no quitan el poder actual.
9. Perder la última bola limpia poderes. Un nivel nuevo nace limpio.
10. Victoria = limpiar el muro 3 o salir por Break en el último nivel. Sin jefe.
11. Loop ambiental al abrir la app. Tema (Nebula / Castillo) y volumen **Ambiente** en Menú y Pausa; el tema no mueve el volumen.

### Audio ambiente (Feature 24)

| Dato | Clave | Default | UI |
|------|-------|---------|-----|
| Tema | `arkanoid:v3:ambientTheme` | `nebula` | Chips Menú + Pausa |
| Volumen `ambient` | `arkanoid:v3:ambientVolume` | 0.45 | Slider Menú + Pausa |
| Volumen `sfx` | (reservado) | 0.80 | — (Feature 18) |

Cambio de tema: buscar archivo → detener actual → reproducir nueva pista en bucle.

- [ ] Auditoría de ensamblado V3 (pendiente; release en `audits/auditoria-release-v3.md`)
