# 04 — Diseño de aplicación

## Proyecto
Tower — Tower Defense Android (Expo / React Native)

## Versión
V1

## Objetivo
Ensamblar los módulos de `03-module-discovery.md` en una experiencia coherente: campaña de **15 mapas distintos**, **4 torres**, oleadas que escalan, economía, vidas de base y progresión local.

---

## 1. Arquitectura de pantallas

```
Menu (marca Tower hero)
├── [Jugar] / [Continuar] ──► LevelSelect
├── [Cómo jugar] ──► HowTo ──► Menu
└── (Android back)

LevelSelect (15 nodos)
├── nivel desbloqueado ──► Game (cargar mapa + waves)
└── nivel bloqueado → feedback

Game
├── Battlefield: path + pads + torres + enemigos
├── HUD: vidas · oro · oleada i/N · nivel
├── Barra 4 torres (Arquera, Cañón, Hielo, Francotirador)
├── [Pausa] ──► Pause ──► Reanudar | Menú
├── wave cleared → WaveBreak → siguiente oleada
├── last wave cleared → LevelVictory → next | LevelSelect
├── lives == 0 → Defeat → Reintentar | LevelSelect | Menú
└── level 15 won → CampaignVictory
```

---

## 2. Flujo principal de usuario

1. Abre app → **Menú** con marca **Tower**, CTA Jugar/Continuar.
2. Entra al **selector** de 15 niveles (1 desbloqueado al inicio).
3. Elige nivel → carga mapa único + oro inicial + 20 vidas + oleada 1.
4. Selecciona un tipo de torre y la coloca en un pad libre si tiene oro.
5. Oleadas spawnean; torres atacan automáticamente; enemigos que llegan restan vidas.
6. Supera todas las oleadas → victoria de nivel → desbloquea siguiente.
7. Pierde todas las vidas → derrota → reintentar.
8. Completa nivel 15 → victoria de campaña.

---

## 3. Modelo de datos (conceptual)

```ts
type Vec2 = { x: number; y: number };

type TowerKind = "archer" | "cannon" | "frost" | "sniper";

type TowerTypeDef = {
  id: TowerKind;
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireCooldownMs: number;
  splashRadius?: number;   // cannon
  slowFactor?: number;     // frost 0..1
  slowDurationMs?: number; // frost
};

type EnemyKind = "grunt" | "runner" | "tank" | "boss";

type MapDefinition = {
  id: string;
  name: string;
  levelIndex: number; // 0..14
  path: Vec2[];       // waypoints spawn → base
  pads: { id: string; x: number; y: number }[];
  palette: { bg: string; path: string; accent: string; deco: string };
  motif: string;      // "pradera" | "bosque" | ... único
};

type Wave = {
  index: number;
  spawns: { kind: EnemyKind; count: number; intervalMs: number }[];
};

type PlacedTower = {
  id: string;
  kind: TowerKind;
  padId: string;
  pos: Vec2;
  cooldownUntil: number;
};

type Enemy = {
  id: string;
  kind: EnemyKind;
  hp: number;
  speed: number;
  pathT: number; // progreso 0..1
  slowUntil?: number;
  rewardGold: number;
  baseDamage: number;
};

type RunState = {
  status:
    | "menu"
    | "levelSelect"
    | "playing"
    | "paused"
    | "waveBreak"
    | "levelVictory"
    | "defeat"
    | "campaignVictory";
  levelIndex: number; // 0..14
  waveIndex: number;
  lives: number;      // 0..20
  gold: number;
  towers: PlacedTower[];
  enemies: Enemy[];
  maxUnlockedLevel: number; // 1..15
  campaignComplete: boolean;
};

// Constantes V1
const LEVEL_COUNT = 15;
const TOWER_KIND_COUNT = 4;
const INITIAL_BASE_LIVES = 20;
```

---

## 4. Relaciones entre módulos

| Emisor | Evento / dato | Consumidor |
|--------|---------------|------------|
| `tower-placement-ui` | place(kind, padId) | `game-loop` → `td-engine` / `economy` / `build-zones` |
| `game-loop` | `step(dt)` | `td-engine` |
| `td-engine` | `enemyKilled` | `economy` |
| `td-engine` | `enemyLeaked` | `base-lives` |
| `td-engine` | `waveCleared` | `wave-system` / UI WaveBreak |
| `td-engine` | `levelWon` / `levelLost` | `level-campaign` / pantallas |
| `map-catalog` | MapDefinition | `battlefield-view`, `path-system`, `build-zones` |
| `tower-combat` | damage / slow / splash | enemigos en engine |
| `offline-progress` | hydrate/persist | Menu / LevelSelect / fin de nivel |
| `tower-screens` | navegación | estados `game-loop` |

---

## 5. Navegación / UI

### Menú
- Marca **Tower** como señal hero (no solo nav).
- Una frase corta: “Defiende la base. Domina quince frentes.”
- CTA primario: **Jugar** (o **Continuar** si hay progreso).
- Secundario: **Cómo jugar**.
- Atmósfera: fortaleza / horizonte de batalla; tipografía display; sin cards innecesarias.

### Selector de niveles
- 15 nodos en recorrido vertical o path de campaña.
- Bloqueados atenuados; actual resaltado; completados con check.

### Game
- Mapa a full bleed del área de juego (path + pads + decor del motif).
- HUD superior compacto: vidas · oro · oleada · nivel.
- Barra inferior fija con **4** torres (icono + costo).
- Highlight de pads al seleccionar torre.
- Pausa discreta.

### Dirección visual V1 — variedad por mapa

Cada nivel usa `palette` + `motif` propios (ver Feature 05). Tokens globales de UI:

| Token | Hex | Uso |
|-------|-----|-----|
| Night | `#0B1220` | Fondo menú |
| Steel | `#1C2A3A` | Barras / HUD |
| Gold | `#E6B422` | Oro / CTA secundario |
| Ember | `#E85D04` | CTA primario / alerta |
| Mist | `#E8EEF7` | Texto principal |
| Danger | `#D62828` | Vidas bajas / leak |

---

## 6. Reglas de diseño de juego (contrato)

1. Exactamente **15** niveles; exactamente **4** torres.
2. Cada mapa tiene path+pads+paleta **distintos**.
3. Oleadas y dificultad **escalan** con el nivel (Feature 04).
4. Vidas de base = **20** por nivel; leak → resta; 0 → derrota.
5. Oro: inicial + kills − costos de torre.
6. Targeting V1: enemigo más avanzado en path dentro de rango.
7. Un solo path lógico por mapa en V1.
8. Progresión secuencial local (desbloqueo N+1).

---

## 7. Riesgos de diseño

| Riesgo | Mitigación |
|--------|------------|
| 15 mapas se sienten clones | Checklist de silueta path + pads + paleta únicos en `map-catalog` |
| Balance imposible en primer pass | Tabla de multipliers en `wave-system`; tunear post-smoke |
| Pads demasiado escasos/abundantes | Contar pads por mapa (rango V1: 6–14) |
| Performance con muchos enemigos | Cap por oleada; step O(towers×enemies) acotado |
| UX de colocación confusa | Highlight pads + costo visible + rechazo claro sin oro |

---

## 8. Criterios de aceptación de diseño

- [ ] Menú → selector → nivel 1 jugable con 4 torres y mapa Pradera
- [ ] Niveles 1–15 cargan mapas distintos
- [ ] Oleadas aumentan en niveles altos
- [ ] Leak reduce vidas; a 0 → derrota
- [ ] Clear última oleada → victoria; desbloquea siguiente
- [ ] Nivel 15 clear → victoria campaña
- [ ] Progreso persiste offline
- [ ] Offline completo

---

## Criterio de salida — Diseño V1

- [x] Pantallas y flujos definidos
- [x] Contratos entre módulos
- [x] Modelo de datos
- [x] 15 mapas + 4 torres + escalado documentados
- [x] Auditoría de ensamblado (`audits/auditoria-ensamblado.md` — APROBADO)
