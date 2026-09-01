---
id: "DES-001"
title: "Match-3 América — Diseño de Aplicación V2"
status: "READY_FOR_CONSTRUCTION"
version: "2.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-09-01"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.  
> **Gate visual:** `visual_approval_passed: true`.  
> **Código:** `iterations/v2/`.

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** `Match-3 América`
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `ENSAMBLADO_APROBADO` — `ready_for_construction` para V2
- **Dirección visual V2:** Viaje por América + capa relacional; avatares jugador 8-bit; placeholders de regalos, mapa y elenco (arte diferido FEAT-12–14)

---

## 2. Arquitectura General

1. **expo-router** (`app/`) — Home, Mapa, Niveles, Play, Inventario, Pretendientes
2. **UI** (`src/components/`) — tablero, botones, avatar; consume `theme.ts`
3. **Modules** — hint, inventory/progress, profile
4. **Engine** — `match3Engine` + `affinity`
5. **Data** — países, niveles, suitors, avatars
6. **Assets** — `assets/avatars/*.png` (6 retratos 8-bit)
7. **Persistencia** — AsyncStorage `match3:v2:progress`

---

## 3. Módulos Utilizados en V2

`MOD-01` … `MOD-10` según `03-module-discovery.md`.

---

## 4. Relaciones entre Módulos

```text
HomeScreen
  → saveProfile / updateAvatar (MOD-07/05/10)
PlayScreen
  → useIdleHint → match3Engine
  → onWin → grant si nivel par (MOD-04/05)
SuitorDetail
  → applyGift (MOD-09) + consumeReward (MOD-04)
```

---

## 5. Flujo Principal de Usuario

```text
Home (onboarding si sin perfil) → Mapa → Niveles → Partida
Home → Pretendientes → Ficha → Dar regalo
Home → Inventario
Partida victoria nivel par → +1 recompensa
```

---

## 6. Navegación (expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` | Home / onboarding | `MOD-06`, `MOD-07`, `MOD-10` | `FEAT-06`, `FEAT-08` |
| `/map` | Mapa 5 países (lista placeholder) | `MOD-06`, `MOD-03`, `MOD-05` | `FEAT-02` |
| `/country/[id]` | Lista 10 niveles | `MOD-06`, `MOD-03` | `FEAT-02` |
| `/play/[countryId]/[level]` | Partida | `MOD-01`–`MOD-06` | `FEAT-01`–`05` |
| `/inventory` | Inventario (texto) | `MOD-04`, `MOD-06` | `FEAT-04` |
| `/suitors` | Lista pretendientes | `MOD-08`, `MOD-06` | `FEAT-09` |
| `/suitors/[id]` | Ficha + dar regalo | `MOD-08`, `MOD-09`, `MOD-04` | `FEAT-11` |

---

## 7. Consumo de Tokens y Theme

> Estilos derivados de `theme.ts` local. 0% hex en componentes.

### Tokens V1 reutilizados

`background` `#0B3D2E`, `backgroundAlt` `#145A32`, `backgroundDeep` `#1A5276`, `surface` `#F4F7F5`, `accent` `#E67E22`, `accentSecondary` `#2980B9`, `text` `#1C2833`, `textOnDark` `#F8F9F9`, `danger` `#C0392B`, `hint` `#F1C40F`, `gem.*`, `spacing.md` 16, `spacing.lg` 24, `radius.md` 12, `font.brand`, `font.body`.

### Tokens V2 — relaciones y slots

| Token | Uso | Valor |
| :--- | :--- | :--- |
| `relation.none` | Sin umbral | `#566573` |
| `relation.amigos` | ≥50 | `#27AE60` |
| `relation.ligue` | ≥69 | `#F4D03F` |
| `relation.pareja` | ≥120 primario | `#E67E22` |
| `relation.matrimonio` | ≥200 primario | `#8E44AD` |
| `relation.amorio` | ≥120 espejo | `#E74C3C` |
| `relation.infidelidad` | ≥200 espejo | `#C0392B` |
| `slot.h1` / `slot.h2` | Iniciales hombre | `#2980B9` / `#1A5276` |
| `slot.m1` / `slot.m2` | Iniciales mujer | `#E67E22` / `#C0392B` |

---

## 8. Matriz Preview Visual vs Componentes

| ID Vista | ID Módulo | Componente / Pantalla | Tokens | Referencia |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-01` | `MOD-06` | Home con perfil | `accent`, `font.brand` | ASCII §9 |
| `VIEW-02` | `MOD-06` | MapScreen (placeholder lista) | `accentSecondary` | V1 |
| `VIEW-03` | `MOD-06` | CountryLevelsScreen | `surface` | V1 |
| `VIEW-04` | `MOD-01/06` | PlayScreen | `gem.*` | V1 |
| `VIEW-05` | `MOD-04/06` | InventoryScreen | `surface` | Placeholder ítem |
| `VIEW-06` | `MOD-07/10` | Onboarding + AvatarGrid | `surface`, `accent` | ASCII §9 |
| `VIEW-07` | `MOD-08/06` | SuitorList | `slot.*`, `locked` | ASCII §9 |
| `VIEW-08` | `MOD-09/06` | SuitorDetail | `relation.*` | ASCII §9 |

---

## 9. Layout Visual (wireframe / ASCII)

### VIEW-06 Home onboarding

```text
┌─────────────────────────────────────┐
│           VISSIUSS                  │
│        Match-3 América              │
│  Nombre: [______________]           │
│  Preferencia: [H] [M] [Ambos]       │
│  Avatar:                            │
│   [m1] [m2] [m3]                    │
│   [w1] [w2] [w3]                    │
│         [ Continuar ]               │
└─────────────────────────────────────┘
```

### VIEW-01 Home con perfil

```text
┌─────────────────────────────────────┐
│  [8bit]  Hola, {username}           │
│           VISSIUSS                  │
│     [ Jugar ] [ Pretendientes ]     │
│     [ Inventario ]                  │
│  Puntaje  Histórico  Regalos        │
└─────────────────────────────────────┘
```

### VIEW-07 Pretendientes

```text
┌─────────────────────────────────────┐
│  Pretendientes                      │
│  México (unlock)                    │
│   [D] Diego  amigos  50             │
│   [M] Mateo  —                      │
│  Colombia (lock)                    │
│   ○ Santiago · ○ Andrés …           │
└─────────────────────────────────────┘
```

### VIEW-08 Ficha

```text
┌─────────────────────────────────────┐
│  Camila · México                    │
│  Afinidad  50  [====    ] amigos    │
│  Inventario:                        │
│   recompensa 3  (+10)  [Dar]        │
│   recompensa 1  (+2)   [Dar]        │
└─────────────────────────────────────┘
```

### Placeholders vs arte diferido

| Superficie | V2 | Post-V2 (FEAT-12–14) |
| :--- | :--- | :--- |
| Regalos | etiqueta `recompensa N` | sprite 8 ítems |
| Mapa | lista de 5 países | ilustración América |
| Pretendientes | iniciales + `slot.*` | 20 retratos |

---

## 10. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Grid 6 avatares apretado | `Medio` | 3×2; celdas ≥ 44 dp |
| Placeholders percibidos como incompletos | `Medio` | Documentar FEAT-12–14 en Home/Inventario no; en idea/ |
| Hint molesto | `Medio` | Solo 5s idle |

---

## 11. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [x] Navegación y flujo definidos.
- [x] Módulos V2 sin huérfanos.
- [x] Tokens/theme documentados.
- [x] Wireframe revisado.
- [x] Sin dependencias circulares.

### Checklist auditoría de ensamblado (Gate 3B)

- [x] `05-build-plan.md` coherente.
- [x] `audits/auditoria-ensamblado.md` `[APROBADO]`.

### Registro de visto bueno

- **Aprobación visual:** `WIKA Lead QA / agente auditoría`
- **Fecha visual:** `2026-09-01`
- **visual_approval_passed:** `true`
- **Aprobación ensamblado:** `WIKA Lead QA / agente auditoría`
- **Fecha ensamblado:** `2026-09-01`
- **audit_3_passed:** `true`
