---
id: "MOD-001"
title: "Chess Wars — Arquitectura de Módulos"
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

- **Nombre del Proyecto:** `Chess Wars`
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `AUDIT_2_APROBADO` — listo para diseño de aplicación

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01` | `ERR-01` | `mod-chess-engine` | `engine / lógica` | Reglas FIDE básicas, estado, legalidad |
| `MOD-02` | `FEAT-02` | `ERR-02` | `mod-chess-ai` | `engine / lógica` | Elección de jugada Negras Fácil/Media |
| `MOD-03` | `FEAT-03` | `ERR-03` | `mod-campaign-wars` | `data` | 10 batallas + config IA por batalla |
| `MOD-04` | `FEAT-06` | `ERR-06` | `mod-progress-store` | `persistencia` | Unlock campaña + victorias offline |
| `MOD-05` | `FEAT-04`, `FEAT-05`, `FEAT-07` | `ERR-04`, `ERR-05`, `ERR-07` | `mod-screens` | `UI / presentación` | Home, Campaña, Partida, Cómo jugar, Resultado |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: `mod-chess-engine`

**Patrón:** Pure engine  
**Ruta en repositorio:** `src/engine/chessEngine.ts` (+ `types.ts`, helpers de movimiento)

#### Contrato

- **Entradas:** `createInitialState()`, `getLegalMoves(state, from)`, `applyMove(state, move)`, `inCheck(state, side)`, `getGameResult(state)`
- **Salidas:** `GameState` `{ board, sideToMove, castling, enPassant, halfmove, fullmove, status }`
- **Dependencias:** Ninguna de React; RNG no requerido en engine base
- **Reutilizable:** Sí (futuros títulos de ajedrez WIKA)

#### Reglas de aislamiento

- No importa React ni componentes de `MOD-05`
- Expone funciones puras testeables
- Promoción V1: siempre a Dama

#### API mínima esperada

```text
Piece = { type: K|Q|R|B|N|P, color: w|b }
Square = 0..63 o {file,rank}
Move = { from, to, promotion? }
createInitialState() -> GameState
getLegalMoves(state, from?) -> Move[]
applyMove(state, move) -> GameState
isCheckmate / isStalemate / isInsufficientMaterial
```

---

### Módulo `MOD-02`: `mod-chess-ai`

**Patrón:** Pure engine (depende de MOD-01)  
**Ruta:** `src/engine/chessAi.ts`

#### Contrato

- **Entradas:** `GameState`, `difficulty: 'easy' | 'medium'`
- **Salidas:** `Move` legal para el bando activo (Negras en V1)
- **Dependencias:** `MOD-01` únicamente
- **Reutilizable:** Sí

#### Reglas

- Fácil: profundidad 1–2 + evaluación material + ruido
- Media: profundidad 2–3 + material + movilidad
- Debe devolver solo movimientos legales de `getLegalMoves`
- Sin Stockfish / nativos

---

### Módulo `MOD-03`: `mod-campaign-wars`

**Patrón:** Data module  
**Ruta:** `src/data/battles.ts`

#### Contrato

- **Entradas:** `battleId` (1..10)
- **Salidas:** `{ battleId, title, difficulty: 'easy'|'medium' }`
- **Tabla V1:**

| Batalla | Dificultad |
| :---: | :--- |
| 1–4 | `easy` |
| 5–10 | `medium` |

- **Reutilizable:** No (contenido del producto)

---

### Módulo `MOD-04`: `mod-progress-store`

**Patrón:** Repository / AsyncStorage  
**Ruta:** `src/modules/progress/`

#### Contrato

- **Entradas:** `markBattleWon(battleId)`, `load()`, `reset()`
- **Salidas:** `{ maxUnlockedBattle: 1..10, wins: number }`
- **Dependencias:** `@react-native-async-storage/async-storage`
- **Reglas:** Batalla 1 siempre desbloqueada al primer launch

---

### Módulo `MOD-05`: `mod-screens`

**Patrón:** Feature screens (expo-router)  
**Ruta:** `app/`, `src/components/`

#### Contrato

- **Componentes exportados:** `HomeScreen`, `CampaignScreen`, `GameScreen`, `HowToScreen`, `ResultScreen`
- **Props y tokens:** mapeo a `theme.ts` (`04-application-design.md`)
- **Eventos:** `onQuickPlay`, `onSelectBattle`, `onSelectSquare`, `onRetry`

#### Dependencias

- **Internas:** `MOD-01` … `MOD-04`, `constants/theme`
- **Prohibidas:** lógica de reglas dentro de pantallas (delegar a engine)

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[app/ screens — expo-router]  MOD-05
       │
       ├──► MOD-02 chess-ai
       │         │
       │         ▼
       ├──► MOD-01 chess-engine
       │
       ├──► MOD-03 campaign-wars
       │
       └───────► MOD-04 progress-store
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
| `MOD-01` | Bugs de enroque / al paso / jaque | `Alto` | Smoke de reglas + suite de posiciones |
| `MOD-02` | IA lenta o ilegal | `Alto` | Profundidad acotada; solo `getLegalMoves` |
| `MOD-03` | Desbalance campaña | `Medio` | Fácil→Media por tramos fijos |
| `MOD-04` | Corrupción de save | `Medio` | Schema versionado + defaults |
| `MOD-05` | Hex hardcoded / tablero ilegible | `Alto` | Checklist 0% hex; casillas táctiles grandes |

---

## 6. Evaluación de Reutilización WIKA

| Módulo | ¿Existe equivalente WIKA? | Decisión |
| :--- | :--- | :--- |
| `MOD-01` | No (engines Tetris/TD/Match-3 distintos) | Crear nuevo |
| `MOD-02` | No | Crear nuevo |
| `MOD-04` | Patrón progreso en Tower / Match-3 / Sudoku | Reutilizar patrón, no código compartido |
| `MOD-05` | Home + campaña en Tower | Reutilizar UX pattern |
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
