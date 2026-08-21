---
id: "MOD-001"
title: "Match-3 América — Arquitectura de Módulos"
status: "AUDIT_2_APROBADO"
version: "1.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
audit_2_passed: true
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.  
> **Equivalencia:** Auditoría de Módulos → `docs/auditoria-modulos.md`.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** `Match-3 América`
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `AUDIT_2_APROBADO` — listo para diseño / ensamblado

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01`, `FEAT-03`, `FEAT-05` | `ERR-01`, `ERR-03`, `ERR-05` | `mod-match3-engine` | `engine / lógica` | Tablero 8×10, match, score, hint, reshuffle |
| `MOD-02` | `FEAT-05` | `ERR-05` | `mod-hint-timer` | `lógica / UI bridge` | Idle 5s → solicitar hint al engine |
| `MOD-03` | `FEAT-02` | `ERR-02` | `mod-levels-america` | `data` | 5 países × 10 niveles (moves, minScore, difficulty) |
| `MOD-04` | `FEAT-04` | `ERR-04` | `mod-inventory` | `lógica + persist` | Pool recompensas 1–8; conteo para unlock país |
| `MOD-05` | `FEAT-06` | `ERR-06` | `mod-progress-store` | `persistencia` | País/nivel unlock, scores, histórico |
| `MOD-06` | `FEAT-07`, `FEAT-06` | `ERR-07`, `ERR-06` | `mod-screens` | `UI / presentación` | Home, Mapa, Niveles, Partida, Inventario |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: `mod-match3-engine`

**Patrón:** Pure engine  
**Ruta en repositorio:** `src/engine/match3Engine.ts` (+ tipos en `src/engine/types.ts`)

#### Contrato

- **Entradas:** `createBoard()`, `swap(board, a, b)`, `tickResolve(state)`, `findHintMove(board)`, `hasValidMoves(board)`, `reshuffle(board)`, `applyScore(matches, combo)`
- **Salidas:** `GameState` `{ board, score, movesLeft, minScore, panicUsesLeft, status }`
- **Dependencias:** Ninguna de React; RNG inyectable para tests
- **Reutilizable:** Sí (otros Match-3 WIKA)

#### Reglas de aislamiento

- No importa React ni componentes de `MOD-06`
- Expone funciones puras testeables
- Tablero fijo: `COLS=8`, `ROWS=10`, `GEM_TYPES=5`

#### API mínima esperada

```text
GemType = 0..4
Board = GemType[10][8]   // rows × cols
findMatches(board) -> Match[]
resolveMatches(state) -> state
applyGravity / refill
swap / findHintMove / hasValidMoves / reshuffle
isWon(state) <=> score >= minScore && status === 'won'
isLost(state) <=> movesLeft === 0 && score < minScore
```

---

### Módulo `MOD-02`: `mod-hint-timer`

**Patrón:** Hook / controller en frontera UI  
**Ruta:** `src/modules/hint/useIdleHint.ts`

#### Contrato

- **Entradas:** `idleMs=5000`, eventos `onUserInput`, `onAnimating`
- **Salidas:** `hintMove | null`; llama `findHintMove` de `MOD-01`
- **Dependencias:** `MOD-01`; React solo en el hook (no en engine)

#### Reglas

- Timer se reinicia en input, swap, cascada o pánico
- Hint se limpia al tocar el tablero

---

### Módulo `MOD-03`: `mod-levels-america`

**Patrón:** Data module  
**Ruta:** `src/data/countries.ts`, `src/data/levels.ts`

#### Contrato

- **Entradas:** `countryId`, `levelIndex` (0..9)
- **Salidas:** `{ countryId, levelId, difficulty, moves, minScore, rewardOnClear: true }`
- **Países (orden fijo):**

| Orden | countryId | Nombre |
| :---: | :--- | :--- |
| 1 | `mx` | México |
| 2 | `co` | Colombia |
| 3 | `pe` | Perú |
| 4 | `br` | Brasil |
| 5 | `ar` | Argentina |

- **Dificultad:** índice impar local = `easy` (25 moves, minScore `800+i*50`); par = `medium` (20 moves, `1200+i*75`)
- **Reutilizable:** No (contenido del producto)

---

### Módulo `MOD-04`: `mod-inventory`

**Patrón:** Service + store  
**Ruta:** `src/modules/inventory/`

#### Contrato

- **Entradas:** `grantRandomReward()`, `listRewards()`, `count()`
- **Salidas:** lista de `{ id: 'recompensa N', grantedAt }`
- **Dependencias:** AsyncStorage vía `MOD-05` o store propio
- **Regla unlock país:** `count() >= 3` además de 10 niveles del país previo

#### Pool V1

```text
recompensa 1 … recompensa 8
```

Sin tienda ni canje en V1.

---

### Módulo `MOD-05`: `mod-progress-store`

**Patrón:** Repository / AsyncStorage  
**Ruta:** `src/modules/progress/`

#### Contrato

- **Entradas:** eventos de victoria/derrota, unlock país
- **Salidas:** `{ unlockedCountryIndex, unlockedLevelByCountry, totalScore, history[] }`
- **Dependencias:** `@react-native-async-storage/async-storage`
- **Reglas:** México nivel 1 siempre desbloqueado al primer launch

---

### Módulo `MOD-06`: `mod-screens`

**Patrón:** Feature screens (expo-router)  
**Ruta:** `app/`, `src/components/`

#### Contrato

- **Componentes exportados:** `HomeScreen`, `MapScreen`, `CountryLevelsScreen`, `PlayScreen`, `InventoryScreen`
- **Props y tokens:** mapeo a `theme.ts` (`04-application-design.md`)
- **Eventos:** `onPlay`, `onPanic`, `onSelectCountry`, `onSelectLevel`

#### Dependencias

- **Internas:** `MOD-01` … `MOD-05`, `constants/theme`
- **Prohibidas:** lógica de match dentro de pantallas (delegar a engine)

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[app/ screens — expo-router]  MOD-06
       │
       ├──► MOD-02 hint-timer
       │         │
       │         ▼
       ├──► MOD-01 match3-engine
       │
       ├──► MOD-03 levels-america
       │
       ├──► MOD-04 inventory
       │         │
       └───────► MOD-05 progress-store
                       │
                       ▼
              AsyncStorage (local)
```

**Reglas:**

- Prohibidas importaciones circulares.
- `src/engine/` sin imports de React.
- Estilos solo vía tokens/theme documentados.
- `MOD-03` es data estática; no depende de UI.

---

## 5. Matriz de Riesgos Arquitectónicos

| ID Módulo | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| `MOD-01` | Tablero sin jugadas / reshuffle lento | `Alto` | Smoke `hasValidMoves` + reshuffle acotado |
| `MOD-02` | Hint se dispara durante animación | `Medio` | Pausar idle mientras `animating` |
| `MOD-03` | minScore desbalanceado | `Medio` | Fórmulas fijas + tunear en data |
| `MOD-04` | Unlock país confuso | `Medio` | UI muestra faltantes (niveles + count) |
| `MOD-05` | Corrupción de save | `Medio` | Schema versionado + defaults |
| `MOD-06` | Hex hardcoded | `Alto` | Checklist 0% hex; theme único |

---

## 6. Evaluación de Reutilización WIKA

| Módulo | ¿Existe equivalente WIKA? | Decisión |
| :--- | :--- | :--- |
| `MOD-01` | No (engines Snake/Tetris/TD distintos) | Crear nuevo |
| `MOD-04`/`MOD-05` | Patrón inventario/progreso en Sodoku nuevo | Reutilizar patrón, no código compartido |
| `MOD-06` | Home Jugar/Inventario Sodoku | Reutilizar UX pattern |
| UI kit | `sodoku-ui-kit` (V3+) | Diferir; theme local V1 |

---

## 7. Puerta de Enlace y Firma de Auditoría de Módulos

### Checklist

- [x] Toda feature obligatoria tiene al menos un módulo.
- [x] Sin módulos duplicados ni responsabilidades superpuestas.
- [x] Dependencias y riesgos documentados.
- [x] Reutilización WIKA evaluada.
- [x] Grafo sin ciclos.
- [x] `audits/auditoria-modulos.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `WIKA Lead QA / agente auditoría`
- **Fecha:** `2026-08-21`
- **audit_2_passed:** `true`
