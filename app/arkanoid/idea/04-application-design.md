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

### Menú y partida (8-bit unificado)
- Tipografía **Press Start 2P**. Paleta NES (`bit.*`). Sin radios redondos.
- Fondo: pack `inspiration/arkanoid-castle` + scanlines CRT.
- Marca **ARKANOID**, CTA **JUGAR**, secundario **COMO JUGAR**.
- Campo: ladrillos/pala/bola/cápsulas cuadrados, alto contraste.

### Level Clear / Game Over / Victory
- Mensaje claro + score + high score.
- CTAs: Continuar / Reintentar / Menú.

### Dirección visual V3 — 8-bit unificado

Menú y partida comparten la misma atmósfera (ya no hay dual futurista/retro).

| Token | Hex | Uso |
|-------|-----|-----|
| Night | `#0C0820` | Fondo |
| Panel | `#140C28` | Cajas pixel |
| Gold | `#F8D878` | CTA / HUD |
| Ink | `#F8F8F8` | Texto |
| Brick NES | `#F83800` `#FC9838` `#F8D878` `#00B800` `#3CBCFC` `#B8B8F8` | Filas |
| Font | Press Start 2P | Toda la UI |

---

## 6. Reglas de diseño de juego (contrato)

1. Rebotes clásicos: paredes, techo, pala (ángulo por impacto), ladrillos.
2. Exactamente **3** vidas al iniciar partida.
3. Score solo por ladrillos destruidos (100 / 200).
4. High score = máximo histórico local.
5. ≥ 3 niveles en V1; **V3: 33 niveles** fácil → difícil. Limpiar muro = avanzar; último = Victory.
6. V3: menú y partida comparten look 8-bit (Press Start 2P + pack Castillo).

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

V3 **sustituye** el flujo V2 (jefe, `/lose`, `/win`), **añade** cápsulas y fija **33 niveles**. El menú y la partida comparten look 8-bit.

### Flujo de pantallas V3

```
Menu (futurista)
├── [Jugar] ──► Game (retro)
├── [Cómo jugar] ──► HowTo (reglas + L E C S B D P)
└── Game
    ├── HUD: vidas (hasta 6) + score + nivel + poder activo
    ├── Playfield: fondo inspiration/arkanoid-castle + ladrillos + pala + bola(s) + cápsulas + láseres + puerta
    ├── [Pausa] overlay
    ├── ballLost → reset poderes → playing | Game Over overlay
    ├── level cleared | breakExit → Level Clear overlay → next | Victory overlay
    └── Game Over / Victory: score + high score · Reintentar / Menú
```

### Constantes de niveles V3

```ts
const LEVEL_COUNT = 33;
const BALL_SPEED_BASE = 280;
const BALL_SPEED_PER_LEVEL = 5; // índice 32 → 440 px/s
```

Alfabeto de fila (8 columnas): `n` normal, `h` hard, `.` vacío.  
HUD: `LV {levelIndex + 1}`. HowTo: `33 NIVELES`.

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
10. Victoria = limpiar el muro 33 o salir por Break en el último nivel. Sin jefe.
11. Única pista ambiente (Castillo) en loop desde que abre la app. Volumen **Ambiente** en Menú y Pausa.
12. Fondo de partida: pack independiente `recursos/inspiration/arkanoid-castle/` (`dracula-castle-playfield.png`).
13. 33 layouts fácil → difícil (Feature 06). Tutorial 1–6 solo normal; hard desde el 7; el 33 es muro hard completo.

### Inspiración visual V3

| Pack | Catálogo | Runtime |
|------|----------|---------|
| `arkanoid-castle` | `recursos/inspiration/arkanoid-castle/` | `assets/recursos/inspiration/arkanoid-castle/` |

### Audio ambiente (Feature 24)

| Dato | Clave | Default | UI |
|------|-------|---------|-----|
| Tema | fijado `castle` | `ambient-castle.mp3` | — |
| Volumen `ambient` | `arkanoid:v3:ambientVolume` | 0.45 | Slider Menú + Pausa |
| Volumen `sfx` | (reservado) | 0.80 | — (Feature 18) |

- [x] Auditoría 1 V3 (docs / módulos / ensamblado): `audits/auditoria-1-v3.md`
- [ ] Auditoría 2 V3: `audits/auditoria-release-v3.md` (código OK; APK pendiente)
