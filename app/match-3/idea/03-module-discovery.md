---
id: "MOD-001"
title: "Match-3 América — Arquitectura de Módulos V2"
status: "AUDIT_2_APROBADO"
version: "2.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-09-01"
audit_1_passed: true
audit_2_passed: true
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.  
> **Equivalencia:** Auditoría de Módulos → `docs/auditoria-modulos.md`.  
> **Código:** `iterations/v2/`.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** `Match-3 América`
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `AUDIT_2_APROBADO`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01`, `FEAT-03`, `FEAT-05` | `ERR-01`, `ERR-03`, `ERR-05` | `mod-match3-engine` | `engine / lógica` | Tablero 8×10, match, score, hint, reshuffle |
| `MOD-02` | `FEAT-05` | `ERR-05` | `mod-hint-timer` | `lógica / UI bridge` | Idle 5s → solicitar hint al engine |
| `MOD-03` | `FEAT-02` | `ERR-02` | `mod-levels-america` | `data` | 5 países × 10 niveles |
| `MOD-04` | `FEAT-04`, `FEAT-10` | `ERR-04`, `ERR-10` | `mod-inventory` | `lógica + persist` | Cadencia pares; consume al regalar; unlock por lifetime |
| `MOD-05` | `FEAT-06`, `FEAT-08` | `ERR-06`, `ERR-08` | `mod-progress-store` | `persistencia` | Progreso, perfil, afinidad, partnerId |
| `MOD-06` | `FEAT-07`, `FEAT-06` | `ERR-07`, `ERR-06` | `mod-screens` | `UI / presentación` | Home, Mapa, Niveles, Partida, Inventario, Pretendientes |
| `MOD-07` | `FEAT-08` | `ERR-08` | `mod-profile` | `lógica` | Validar/guardar nombre, preferencia, avatarId |
| `MOD-08` | `FEAT-09` | `ERR-09` | `mod-suitors` | `data` | 20 pretendientes; filtro por país y preferencia |
| `MOD-09` | `FEAT-11` | `ERR-11` | `mod-affinity-engine` | `engine / lógica` | Delta regalos, umbrales, pareja única, espejo |
| `MOD-10` | `FEAT-08` | `ERR-08` | `mod-avatars` | `data + assets` | Catálogo 6 retratos 8-bit |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: `mod-match3-engine`

**Patrón:** Pure engine  
**Ruta:** `src/engine/match3Engine.ts`

Contrato V1 intacto: `createBoard`, `swap`, `findHintMove`, `hasValidMoves`, `reshuffle`. Sin imports de React. Tablero `COLS=8`, `ROWS=10`, `GEM_TYPES=5`.

---

### Módulo `MOD-02`: `mod-hint-timer`

**Ruta:** `src/modules/hint/useIdleHint.ts` — idle 5s → `findHintMove`.

---

### Módulo `MOD-03`: `mod-levels-america`

**Ruta:** `src/data/countries.ts`, `src/data/levels.ts`

| Orden | countryId | Nombre |
| :---: | :--- | :--- |
| 1 | `mx` | México |
| 2 | `co` | Colombia |
| 3 | `pe` | Perú |
| 4 | `br` | Brasil |
| 5 | `ar` | Argentina |

`rewardOnClear` efectivo: `levelNumber % 2 === 0`.

---

### Módulo `MOD-04`: `mod-inventory`

**Ruta:** `src/modules/progress/progressStore.ts` (grant/consume)

- `grantRandomReward` solo en victoria de nivel par
- `rewardsGranted` incrementa en grant, no decrementa al entregar
- `consumeReward(id)` quita un ítem para `applyGift`
- Unlock país: 10 niveles + `rewardsGranted >= 3`

---

### Módulo `MOD-05`: `mod-progress-store`

**Ruta:** `src/modules/progress/`  
**Key:** `match3:v2:progress`

Salidas: `{ profile, unlockedCountryIndex, unlockedLevelByCountry, totalScore, inventory, history, affinityBySuitor, partnerId, rewardsGranted }`

México nivel 1 siempre desbloqueado. `profile` null hasta onboarding.

---

### Módulo `MOD-06`: `mod-screens`

**Ruta:** `app/`, `src/components/`

Pantallas: Home (onboarding o saludo), Mapa, Niveles, Play, Inventario, SuitorList, SuitorDetail.

Prohibido: lógica de match o afinidad dentro de pantallas (delegar a engines).

---

### Módulo `MOD-07`: `mod-profile`

**Ruta:** funciones en `progressStore` / helpers `src/modules/profile/`

Entradas: `username` trim no vacío, `preference`, `avatarId` del catálogo.  
Salidas: `saveProfile`, `updateAvatar`. Nombre/preferencia no se reescriben.

---

### Módulo `MOD-08`: `mod-suitors`

**Ruta:** `src/data/suitors.ts`

IDs `{countryId}-{slot}` slot `h1|h2|m1|m2`.

- México: Diego, Mateo, Camila, Valentina
- Colombia: Santiago, Andrés, Isabella, Sofía
- Perú: Joaquín, Lucas, Lucía, Emilia
- Brasil: Thiago, Gabriel, Beatriz, Ana
- Argentina: Facundo, Nicolás, Martina, Julieta

`visibleSuitors(preference, unlockedCountryIndex)` filtra género y país.

---

### Módulo `MOD-09`: `mod-affinity-engine`

**Patrón:** Pure engine  
**Ruta:** `src/engine/affinity.ts`

```text
giftDelta(giftN, slot) -> 10 | 2
applyGift(affinityState, suitorId, giftN, slot) -> affinityState
relationshipStatus(affinity, isPartner, hasPartner) -> Status
```

`partnerId` se asigna la primera vez que alguien cruza 120; no se reemplaza.

Aislamiento: sin React.

---

### Módulo `MOD-10`: `mod-avatars`

**Ruta:** `src/data/avatars.ts`, `assets/avatars/*.png`

IDs: `avatar-m1`, `avatar-m2`, `avatar-m3`, `avatar-w1`, `avatar-w2`, `avatar-w3`.

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[app/ screens — expo-router]  MOD-06
       │
       ├──► MOD-02 hint-timer ──► MOD-01 match3-engine
       ├──► MOD-03 levels-america
       ├──► MOD-08 suitors
       ├──► MOD-10 avatars
       ├──► MOD-07 profile
       ├──► MOD-04 inventory
       └───────► MOD-05 progress-store
                       │
                       ├──► MOD-09 affinity-engine
                       ▼
              AsyncStorage (local)
```

**Reglas:** prohibidas circulares; `src/engine/` sin React; estilos solo tokens; `MOD-03`/`MOD-08`/`MOD-10` data estática.

---

## 5. Matriz de Riesgos Arquitectónicos

| ID Módulo | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| `MOD-01` | Tablero sin jugadas | `Alto` | Smoke `hasValidMoves` + reshuffle |
| `MOD-04` | Unlock bloqueado por regalar | `Alto` | `rewardsGranted` lifetime |
| `MOD-05` | Save V1 incompatible | `Medio` | Key `match3:v2:progress` + defaults |
| `MOD-09` | Dos personajes a 120 el mismo tick | `Medio` | Un solo `applyGift` a la vez; primer 120 gana |
| `MOD-06` | Hex hardcoded | `Alto` | Checklist 0% hex; theme único |
| `MOD-10` | Assets faltantes | `Medio` | Catálogo con require local; smoke lista 6 IDs |

---

## 6. Evaluación de Reutilización WIKA

| Módulo | ¿Existe equivalente WIKA? | Decisión |
| :--- | :--- | :--- |
| `MOD-01` | V1 match-3 | Portar a v2 sin cambiar reglas |
| `MOD-09` | No | Crear nuevo engine puro |
| `MOD-08`/`MOD-10` | No | Data de producto |
| UI kit | sodoku V3+ | Diferir; theme local V2 |

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
- **Fecha:** `2026-09-01`
- **audit_2_passed:** `true`
