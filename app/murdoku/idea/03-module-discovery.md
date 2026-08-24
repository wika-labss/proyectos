---
id: "MOD-001"
title: "Descubrimiento y Arquitectura de Módulos — Murdoku"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-08-24"
updated_at: "2026-08-24"
audit_1_passed: true
audit_2_passed: true
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.  
> **Equivalencia:** Auditoría de Módulos → `docs/auditoria-modulos.md`.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** `Murdoku`
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `AUDIT_2_APROBADO`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01`, `FEAT-06` | `ERR-01`, `ERR-06` | `mod-murdoku-engine` | `engine / lógica` | Tablero, conflictos, solve, solución única |
| `MOD-02` | `FEAT-02` | `ERR-02` | `mod-crime-pieces` | `engine / datos` | Catálogo víctima/sospechosos/asesino |
| `MOD-03` | `FEAT-03` | `ERR-03` | `mod-board-sizes` | `engine / datos` | Tamaños 4/6/9 + geometría de regiones |
| `MOD-04` | `FEAT-04` | `ERR-04` | `mod-room-campaign` | `engine / lógica` | Orden habitaciones, unlock, estado campaña |
| `MOD-05` | `FEAT-05` | `ERR-05` | `mod-room-flavor` | `engine / datos` | Textos e IDs de skin por habitación |
| `MOD-06` | `FEAT-07` | `ERR-07` | `mod-offline-progress` | `infra` | Persistencia AsyncStorage |
| `MOD-07` | `FEAT-08` + UI | `ERR-08` | `mod-investigation-ui` | `UI / presentación` | Pantallas, board, tray, mapa |
| `MOD-08` | `FEAT-09` | `ERR-09` | `mod-android-release` | `infra` | Pipeline APK Release WIKA |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: `mod-murdoku-engine`

**Patrón:** Pure engine  
**Ruta en repositorio:** `src/engine/murdokuEngine.ts` (+ `types.ts`, `validate.ts`)

#### Contrato

- **Entradas:** `BoardSize`, `PieceId`, grid ` (PieceId | null)[][]`, acción `place | clear`, puzzle (`givens` + `solution`)
- **Salidas:** `BoardState` (`cells`, `conflicts[]`, `solved`, `isComplete`)
- **Dependencias:** `MOD-02` (ids válidos), `MOD-03` (regiones)
- **Reutilizable:** Sí (variantes puzzle)

#### Reglas de aislamiento

- Sin imports de React.
- Funciones puras: `placePiece`, `clearCell`, `findConflicts`, `isSolved`, `validatePuzzle`.
- `validatePuzzle`: comprueba solución única y coherencia con givens.

---

### Módulo `MOD-02`: `mod-crime-pieces`

**Patrón:** Pure catalog  
**Ruta:** `src/engine/crimePieces.ts`

#### Contrato

- **Entradas:** `pieceSetId` o lista explícita por nivel
- **Salidas:** `CrimePiece[]` (`id`, `kind: victim|suspect|killer`, `label`, `iconKey`)
- **Dependencias:** ninguna
- **Reutilizable:** Sí

#### Reglas de aislamiento

- Exactamente 1 `victim` y 1 `killer` por set; resto `suspect`.
- Cardinalidad del set = N del tablero.
- Labels únicos; sin lógica de tablero.

---

### Módulo `MOD-03`: `mod-board-sizes`

**Patrón:** Pure config  
**Ruta:** `src/engine/boardSizes.ts`

#### Contrato

- **Entradas:** `size: 4 | 6 | 9`
- **Salidas:** `{ n, boxRows, boxCols, mode: "basic"|"advanced" }`
- **Dependencias:** ninguna
- **Reutilizable:** Sí

#### Reglas de aislamiento

- Solo tamaños soportados V1: 4 (box 2×2), 6 (box 2×3), 9 (box 3×3).
- `regionOf(row, col)` puro.

---

### Módulo `MOD-04`: `mod-room-campaign`

**Patrón:** Pure engine / campaign  
**Ruta:** `src/engine/roomCampaign.ts`

#### Contrato

- **Entradas:** `CampaignState`, `roomId`, evento `completeRoom`
- **Salidas:** estado actualizado (`unlocked`, `completed`), siguiente room
- **Dependencias:** catálogo de rooms (ids + puzzle refs + size)
- **Reutilizable:** Patrón similar a match-3 países / tower niveles

#### Reglas de aislamiento

- Primera room siempre unlocked.
- Completar room i desbloquea i+1; no salta habitaciones.
- Sin UI.

**Catálogo V1 (mínimo):** `library`, `kitchen`, `basement`, `garden`.

---

### Módulo `MOD-05`: `mod-room-flavor`

**Patrón:** Pure content  
**Ruta:** `src/engine/roomFlavor.ts` o `src/content/rooms.ts`

#### Contrato

- **Entradas:** `roomId`
- **Salidas:** `{ title, blurb, skinKey }` (1–2 frases)
- **Dependencias:** ninguna
- **Reutilizable:** No (contenido Murdoku)

#### Reglas de aislamiento

- Fallback si falta blurb.
- No altera reglas del engine.

---

### Módulo `MOD-06`: `mod-offline-progress`

**Patrón:** Repository  
**Ruta:** `src/storage/offlineProgress.ts`

#### Contrato

- **Entradas:** `CampaignState`, borrador opcional de board
- **Salidas:** load/save; migrate version
- **Dependencias:** AsyncStorage
- **Reutilizable:** Patrón tower/sodoku/match-3

#### Reglas de aislamiento

- Schema versionado (`murdoku-progress-v1`).
- Corrupt → empty + flag `needsReset`.

---

### Módulo `MOD-07`: `mod-investigation-ui`

**Patrón:** Feature UI / expo-router screens  
**Ruta:** `app/*.tsx`, `src/components/`, `src/hooks/`

#### Contrato

- **Componentes exportados:** `CrimeBoard`, `PieceTray`, `RoomMap`, `FlavorBanner`, `VictoryPanel`, `PrimaryButton`
- **Props y tokens:** theme noir mansion (`04-application-design.md`)
- **Eventos:** `onSelectPiece`, `onCellPress`, `onClear`, `onRoomSelect`

#### Dependencias

- **Internas:** `MOD-01`…`MOD-06` vía hooks/providers
- **Prohibidas:** lógica de conflictos duplicada en UI (solo consume engine)

---

### Módulo `MOD-08`: `mod-android-release`

**Patrón:** Tooling  
**Ruta:** `scripts/verify-build.sh`, `scripts/build-apk.sh`, `app.json`

#### Contrato

- Package `com.wika.murdoku`; APK release sin Metro.
- Scripts alineados a tower/match-3.

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[app/ screens — expo-router]          MOD-07
       │
       ▼ consume
[hooks / GameProvider]
       │
       ├──► MOD-01 murdoku-engine
       │         ├── MOD-02 crime-pieces
       │         └── MOD-03 board-sizes
       ├──► MOD-04 room-campaign
       │         └── MOD-05 room-flavor
       └──► MOD-06 offline-progress
       │
[constants/theme.ts] ← MOD-07 only
[scripts / app.json] ← MOD-08
```

**Reglas:**

- Prohibidas importaciones circulares.
- `src/engine/` sin React.
- Estilos solo vía tokens/theme.

---

## 5. Matriz de Riesgos Arquitectónicos

| ID Módulo | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| `MOD-01` | Puzzles sin solución única | `Alto` | Smoke `validatePuzzle` por nivel |
| `MOD-01` | Confundir Latin square sin regiones | `Alto` | Regiones obligatorias en 02 + tests |
| `MOD-02` | Sets con N incorrecto | `Alto` | Assert `|pieces| === n` al load |
| `MOD-04` | Unlock saltado / progreso inconsistente | `Medio` | Transiciones puras + persistencia versionada |
| `MOD-07` | 9×9 ilegible / touch pequeño | `Alto` | Layout scroll/zoom mínimo + 44 dp |
| `MOD-06` | Storage corrupto | `Medio` | Reset seguro |

---

## 6. Evaluación de Reutilización WIKA

| Módulo | ¿Existe equivalente WIKA? | Decisión |
| :--- | :--- | :--- |
| `MOD-01` | Sudoku engine en sodoku nuevo | Adaptar patrón; **crear** Murdoku engine (piezas ≠ dígitos) |
| `MOD-04` | Campaña tower / países match-3 | **Reutilizar patrón** unlock secuencial |
| `MOD-06` | `offlineProgress` tower/match-3 | **Reutilizar patrón** AsyncStorage |
| `MOD-07` | UI kits design-system V3+ | **Theme local V1**; diferir DS a V3+ |
| `MOD-08` | scripts tower v1 | **Reutilizar** toolchain |

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

- **Aprobado por (Arquitecto):** `Cursor Agent (flujo WIKA)`
- **Fecha:** `2026-08-24`
- **audit_2_passed:** `true`
