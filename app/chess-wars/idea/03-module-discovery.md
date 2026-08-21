---
id: "MOD-001"
title: "AI Chess Wars — Arquitectura de Módulos"
status: "AUDIT_2_APROBADO"
version: "1.1.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
audit_2_passed: true
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true`.  
> **Equivalencia:** `docs/auditoria-modulos.md`.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** `AI Chess Wars`
- **Base:** `01-problem.md` | `02-features.md`
- **Estado de gatekeeping:** `AUDIT_2_APROBADO`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature | ID Problema | Nombre | Tipo | Responsabilidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01`, `FEAT-03` | `ERR-01`, `ERR-03` | `mod-chess-engine` | engine | Reglas FIDE / estado base |
| `MOD-02` | `FEAT-02` | `ERR-02` | `mod-chess-ai` | engine | IA Fácil/Media (+ uso evolutivo básico) |
| `MOD-03` | `FEAT-04` | `ERR-04` | `mod-evolution-layer` | engine | Nodos, Energía, XP, evoluciones, habilidades |
| `MOD-04` | `FEAT-05` | `ERR-05` | `mod-loadout` | lógica | Pasivas A/B prepartida |
| `MOD-05` | `FEAT-07` | `ERR-07` | `mod-meta-progress` | persistencia | gamesPlayed, wins, tutorialDone |
| `MOD-06` | `FEAT-06`, `FEAT-08`, `FEAT-03` | `ERR-06`, `ERR-08`, `ERR-03` | `mod-screens` | UI | Flujo pantallas + tutorial |

---

## 3. Desglose de Arquitectura Modular

### `MOD-01` `mod-chess-engine`

**Ruta:** `src/engine/chessEngine.ts`  
**Contrato:** `createInitialState`, `getLegalMoves`, `applyMove`, `inCheck`, resultados mate/ahogado.  
**Aislamiento:** Sin React; sin conocer evoluciones (el tablero base no interpreta habilidades).

### `MOD-02` `mod-chess-ai`

**Ruta:** `src/engine/chessAi.ts`  
**Contrato:** `chooseAiMove(state, difficulty, evolutiveContext?)` → movimiento legal; en Evolutive puede proponer `evolve`/`ability` vía API de `MOD-03` si es ventajoso y simple.  
**Deps:** `MOD-01`, opcional `MOD-03`.

### `MOD-03` `mod-evolution-layer`

**Ruta:** `src/engine/evolution/` (`nodes.ts`, `xp.ts`, `evolve.ts`, `abilities.ts`)  
**Contrato:**
- Nodos fijos `c3,f3,c6,f6`
- `onMoveResolved(baseState, move) -> EvolutiveState` (energía, xp, flags)
- `canEvolve(pieceId)`, `evolve(pieceId, branch)`, `canUseAbility`, `useAbility`
- Integración: genera movimientos extra legales solo cuando habilidad activa lo requiere (Dron teleport / Interceptor segundo salto / Fortaleza inmunidad)

**Aislamiento:** No importa UI. Puede envolver o decorar `GameState` en `EvolutiveGameState`.

### `MOD-04` `mod-loadout`

**Ruta:** `src/modules/loadout/`  
**Contrato:** `LoadoutId = 'A' | 'B'`; `applyLoadout(initialEvolutiveState, id)`.

### `MOD-05` `mod-meta-progress`

**Ruta:** `src/modules/progress/`  
**Contrato:** load/save `{ gamesPlayed, wins, tutorialDone }` AsyncStorage.

### `MOD-06` `mod-screens`

**Ruta:** `app/`, `src/components/`  
**Pantallas:** Home, Lobby, Prepartida, Game (classic|evolutive), Postpartida, Tutorial overlay.  
**Deps:** todos los anteriores + `theme.ts`.  
**Prohibido:** reglas de ajedrez/evolución inline en pantallas.

---

## 4. Grafo de Dependencias

```text
MOD-06 screens
  ├── MOD-04 loadout
  ├── MOD-05 progress
  ├── MOD-02 AI
  │     ├── MOD-01 engine
  │     └── MOD-03 evolution
  └── MOD-03 evolution ──► MOD-01 engine
```

Sin ciclos. `MOD-01` no importa `MOD-03`.

---

## 5. Matriz de Riesgos

| Módulo | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| `MOD-01` | Bugs FIDE | Alto | Smoke posiciones |
| `MOD-03` | Habilidades rotas / fugas a Clásico | Alto | Flag `mode`; tests Clásico sin nodos |
| `MOD-02` | IA ignora o abusa evolución | Medio | Heurística acotada |
| `MOD-06` | HUD sobrecargado | Medio | Wireframe `04`; una acción primaria |

---

## 6. Reutilización WIKA

| Módulo | Equivalente | Decisión |
| :--- | :--- | :--- |
| `MOD-01`/`02` | Prototipo `iterations/v1` engine | Reutilizar/adaptar código engine; no campaña Wars |
| `MOD-03` | Ninguno | Crear nuevo |
| `MOD-05` | Patrón progress Match-3/Tower | Reutilizar patrón |
| UI kit V3+ | design-system | Diferir |

---

## 7. Puerta de Enlace

- [x] Features obligatorias cubiertas
- [x] Sin duplicidad / sin ciclos
- [x] Riesgos y reutilización documentados
- [x] `audits/auditoria-modulos.md` APROBADO

- **Aprobado por:** `WIKA Lead QA / agente auditoría`
- **Fecha:** `2026-08-21`
- **audit_2_passed:** `true`
