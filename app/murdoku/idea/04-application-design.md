---
id: "DES-001"
title: "Diseño de Aplicación — Murdoku"
status: "BORRADOR"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-08-24"
updated_at: "2026-08-24"
audit_1_passed: false
audit_2_passed: false
visual_approval_passed: false
audit_3_passed: false
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.  
> **Gate visual:** `visual_approval_passed: true` requiere visto bueno del arquitecto/stakeholder.  
> **Equivalencia:** Auditoría de Ensamblado (parte visual) → `docs/auditoria-ensamblado.md`.

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** `Murdoku`
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `PENDIENTE_APROBACION_VISUAL`
- **Dirección visual V1:** “Noir mansion” — misterio estilizado, no gore. Habitaciones como skins de escena.

---

## 2. Arquitectura General

Capas V1 (Expo SDK 52 + expo-router):

1. **`app/`** — pantallas (home, mapa, intro, play, victory).
2. **`src/hooks/` / providers** — puente UI ↔ engine; rehidratan progreso.
3. **`src/engine/`** — Murdoku puro (tablero, piezas, campaña, flavor).
4. **`src/storage/`** — AsyncStorage progreso.
5. **`src/constants/theme.ts`** — tokens noir mansion.
6. **`scripts/`** — verify + APK.

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-murdoku-engine` | Lógica de colocación y victoria |
| `MOD-02` | `mod-crime-pieces` | Identidades del crimen |
| `MOD-03` | `mod-board-sizes` | Geometría 4/6/9 |
| `MOD-04` | `mod-room-campaign` | Unlock de habitaciones |
| `MOD-05` | `mod-room-flavor` | Textos / skin keys |
| `MOD-06` | `mod-offline-progress` | Persistencia |
| `MOD-07` | `mod-investigation-ui` | Toda la UI |
| `MOD-08` | `mod-android-release` | Entregable APK |

---

## 4. Relaciones entre Módulos

```text
Home → Mapa (MOD-04+05+07)
         → Intro flavor (MOD-05)
         → Play: PieceTray + CrimeBoard (MOD-07)
              → place/clear → MOD-01 (+02+03)
              → on solved → MOD-04 completeRoom → MOD-06 save
         → Victory → Mapa
```

Estados UI: `loading` (rehydrate), `ready`, `conflict`, `solved`, `empty` (sin progreso → primera room), `error` (storage).

---

## 5. Flujo Principal de Usuario

```text
[Home] → [Mapa habitaciones] → [Intro caso] → [Tablero investigación]
      → [Caso resuelto] → [Mapa / siguiente habitación]
```

---

## 6. Navegación (expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` | Home | `MOD-07` | `FEAT-08` |
| `/map` | Mapa de habitaciones | `MOD-04`, `MOD-05`, `MOD-07` | `FEAT-04` |
| `/case/[roomId]` | Intro + flavor | `MOD-05`, `MOD-07` | `FEAT-05` |
| `/play/[roomId]` | Tablero | `MOD-01`–`03`, `MOD-07` | `FEAT-01`–`03`, `FEAT-06` |
| `/victory/[roomId]` | Caso resuelto | `MOD-04`, `MOD-07` | `FEAT-04` |

---

## 7. Consumo de Tokens y Theme

> Theme local V1 en `src/constants/theme.ts`. Profesionalización V3+ vía `design-system/` más adelante.

### Tokens clave V1 (Noir mansion)

| Token semántico | Uso en app | Valor / referencia |
| :--- | :--- | :--- |
| `background` | Fondo app | `#1A1520` (noche mansión) |
| `surface` | Paneles, celdas | `#2A2333` |
| `text` | Texto principal | `#F2EDE6` |
| `textMuted` | Flavor / bloqueado | `#A89B8C` |
| `accent` | CTA / pieza seleccionada | `#C4A35A` (latón) |
| `error` | Conflicto / celda inválida | `#C45C5C` |
| `border` | Grid / cards | `#3D3448` |
| `victim` | Ficha víctima | `#E8D5A3` |
| `suspect` | Ficha sospechoso | `#7A9EBF` |
| `killer` | Ficha asesino | `#8B3A4A` |
| `spacing.md` | Padding estándar | `16 dp` |
| `radius.md` | Cards habitación | `12 dp` |

**Skins por habitación (`skinKey`):** ajustan `surface`/`background` sutilmente (biblioteca más cálida, sótano más oscuro, jardín más verdoso) sin hex en componentes — solo keys → theme.

---

## 8. Matriz Preview Visual vs Componentes de Código

| ID Vista | ID Módulo | Componente / Pantalla | Tokens | Referencia wireframe |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-01` | `MOD-07` | `HomeScreen` | `background`, `accent`, `text` | ASCII §9 |
| `VIEW-02` | `MOD-07` | `RoomMap` | `surface`, `textMuted`, `accent` | ASCII §9 |
| `VIEW-03` | `MOD-07` | `CaseIntro` | `text`, `textMuted` | ASCII §9 |
| `VIEW-04` | `MOD-01/07` | `CrimeBoard` + `PieceTray` | `surface`, `border`, `error`, piece tokens | ASCII §9 |
| `VIEW-05` | `MOD-07` | `VictoryPanel` | `accent`, `surface` | ASCII §9 |

---

## 9. Layout Visual (wireframe / ASCII)

### VIEW-01 Home

```text
┌─────────────────────────────────────┐
│           M U R D O K U             │
│     Investiga. Coloca. Resuelve.    │
│                                     │
│         [ Entrar a la mansión ]     │
└─────────────────────────────────────┘
```

### VIEW-02 Mapa

```text
┌─────────────────────────────────────┐
│ Habitaciones de la mansión          │
├─────────────────────────────────────┤
│ [Biblioteca] desbloqueada / hecha   │
│ [Cocina]     desbloqueada           │
│ [Sótano]     🔒                     │
│ [Jardín]     🔒                     │
└─────────────────────────────────────┘
```

### VIEW-04 Tablero

```text
┌─────────────────────────────────────┐
│ Biblioteca · pista corta…           │
├─────────────────────────────────────┤
│  ┌──┬──┬──┬──┐                      │
│  │  │  │  │  │   CrimeBoard         │
│  ├──┼──┼──┼──┤                      │
│  │  │██│  │  │   ██ = conflicto     │
│  └──┴──┴──┴──┘                      │
├─────────────────────────────────────┤
│ [V] [S1] [S2] [A]   PieceTray       │
│ [Borrar celda]                      │
└─────────────────────────────────────┘
```

---

## 10. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Tablero 9×9 no cabe / touch pequeño | `Alto` | Padding reducido + celdas ≥ 44 dp; scroll vertical si hace falta |
| Theme “sangriento” vs audiencia casual | `Medio` | Noir estilizado; sin gore; labels neutros |
| Flavor que distrae del puzzle | `Medio` | Máx. 2 líneas; no overlays flotantes en grid |
| Hex hardcoded por skin | `Alto` | Solo keys en theme; 0% hex en componentes |

---

## 11. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [x] Navegación y flujo principal definidos.
- [x] Todos los módulos V1 incorporados sin huérfanos.
- [x] Tokens/theme documentados.
- [x] Wireframe ASCII listo para revisión arquitectónica.
- [x] Sin dependencias circulares (ver 03).
- [ ] Visto bueno arquitecto/stakeholder.

### Checklist auditoría de ensamblado (Gate 3B)

- [ ] `05-build-plan.md` coherente con este diseño.
- [ ] Estrategia de build y riesgos alineados.
- [ ] `audits/auditoria-ensamblado.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobación visual (Arquitecto / Stakeholder):** `________________________`
- **Fecha visual:** `YYYY-MM-DD`
- **visual_approval_passed:** `false` → `true` al aprobar preview

- **Aprobación ensamblado (Arquitecto):** `________________________`
- **Fecha ensamblado:** `YYYY-MM-DD`
- **audit_3_passed:** `false` → `true` al aprobar ensamblado
