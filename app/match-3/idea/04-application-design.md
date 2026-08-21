---
id: "DES-001"
title: "Match-3 América — Diseño de Aplicación"
status: "BORRADOR"
version: "1.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
audit_2_passed: false
visual_approval_passed: false
audit_3_passed: false
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.  
> **Gate visual:** `visual_approval_passed: true` requiere visto bueno del arquitecto/stakeholder.  
> **Equivalencia:** Auditoría de Ensamblado (parte visual) → `docs/auditoria-ensamblado.md`.

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** `Match-3 América`
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `PENDIENTE_APROBACION_VISUAL`
- **Dirección visual V1:** Viaje por América — mapa continental, países como nodos, partida limpia sin cards en HUD

---

## 2. Arquitectura General

Capas V1:

1. **expo-router** (`app/`) — rutas Home, Mapa, Niveles, Play, Inventario
2. **UI** (`src/components/`) — tablero, HUD, botones; consume `theme.ts`
3. **Modules** — hint-timer, inventory, progress
4. **Engine** (`src/engine/`) — lógica Match-3 pura
5. **Data** — países y niveles América
6. **Persistencia** — AsyncStorage

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-match3-engine` | Lógica de partida |
| `MOD-02` | `mod-hint-timer` | Sugerencia a los 5s |
| `MOD-03` | `mod-levels-america` | Contenido 50 niveles |
| `MOD-04` | `mod-inventory` | Recompensas |
| `MOD-05` | `mod-progress-store` | Progreso offline |
| `MOD-06` | `mod-screens` | Navegación y UI |

---

## 4. Relaciones entre Módulos

```text
PlayScreen
  → useIdleHint (MOD-02) → findHintMove (MOD-01)
  → onSwap → match3Engine (MOD-01)
  → onPanic → reshuffle (MOD-01) + consume panicUses
  → onWin → inventory.grant + progress.unlock (MOD-04/05)
  → levelConfig desde MOD-03
```

---

## 5. Flujo Principal de Usuario

```text
Home → Mapa (5 países) → Niveles del país → Partida 8×10
                         ↘ Inventario
Partida → (idle 5s) Hint
Partida → Pánico → Reshuffle
Partida → Victoria (score≥minScore) → Recompensa → Unlock nivel/país
```

Estados: `idle`, `swapping`, `resolving`, `hint`, `won`, `lost`, `empty-inventory` (solo inventario vacío).

---

## 6. Navegación (expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` | Home VISSIUSS | `MOD-06`, `MOD-05` | `FEAT-06`, `FEAT-07` |
| `/map` | Mapa 5 países | `MOD-06`, `MOD-03`, `MOD-05` | `FEAT-02` |
| `/country/[id]` | Lista 10 niveles | `MOD-06`, `MOD-03`, `MOD-05` | `FEAT-02` |
| `/play/[countryId]/[level]` | Partida | `MOD-01`–`MOD-06` | `FEAT-01`–`05` |
| `/inventory` | Inventario | `MOD-04`, `MOD-06` | `FEAT-04` |

---

## 7. Consumo de Tokens y Theme

> Estilos derivados de `theme.ts` local V1. Profesionalización V3+ vía `design-system/` si aplica.

### Tokens clave V1 (América / viaje)

| Token semántico | Uso en app | Valor |
| :--- | :--- | :--- |
| `background` | Fondo app | `#0B3D2E` (verde profundo continente) |
| `backgroundAlt` | Gradiente / atmósfera | `#145A32` → `#1A5276` |
| `surface` | Paneles HUD | `#F4F7F5` |
| `accent` | CTA primario / país activo | `#E67E22` |
| `accentSecondary` | Secundario mapa | `#2980B9` |
| `text` | Texto principal | `#1C2833` |
| `textOnDark` | Texto sobre fondo | `#F8F9F9` |
| `danger` | Botón pánico | `#C0392B` |
| `hint` | Resalte swap sugerido | `#F1C40F` |
| `gem.red` | Gema 0 | `#E74C3C` |
| `gem.blue` | Gema 1 | `#3498DB` |
| `gem.green` | Gema 2 | `#27AE60` |
| `gem.yellow` | Gema 3 | `#F4D03F` |
| `gem.purple` | Gema 4 | `#8E44AD` |
| `spacing.md` | Padding estándar | `16` |
| `spacing.lg` | Separación secciones | `24` |
| `radius.md` | Controles interactivos | `12` |
| `font.brand` | Marca VISSIUSS | familia display documentada en `theme.ts` (no Inter/Roboto/system) |
| `font.body` | UI body | familia sans documentada en `theme.ts` |

**Regla:** 0% hex en componentes; solo en `theme.ts` / tokens.

---

## 8. Matriz Preview Visual vs Componentes de Código

| ID Vista | ID Módulo | Componente / Pantalla | Tokens | Referencia wireframe |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-01` | `MOD-06` | `HomeScreen` | `background`, `accent`, `font.brand` | ASCII §9 |
| `VIEW-02` | `MOD-06` | `MapScreen` | `accentSecondary`, `surface` | ASCII §9 |
| `VIEW-03` | `MOD-06` | `CountryLevelsScreen` | `surface`, `text` | ASCII §9 |
| `VIEW-04` | `MOD-01/06` | `PlayScreen` + `GameBoard` | `gem.*`, `hint`, `danger` | ASCII §9 |
| `VIEW-05` | `MOD-04/06` | `InventoryScreen` | `surface`, `text` | ASCII §9 |

---

## 9. Layout Visual (wireframe / ASCII)

### VIEW-01 Home

```text
┌─────────────────────────────────────┐
│           VISSIUSS                  │  ← brand hero
│        Match-3 América              │
│                                     │
│     [  Jugar  ]   [ Inventario ]    │  ← CTAs
│                                     │
│  Puntaje    Histórico   Recompensas │  ← info
└─────────────────────────────────────┘
```

### VIEW-02 Mapa países

```text
┌─────────────────────────────────────┐
│  América — tu viaje                 │
│                                     │
│  ● México        (desbloqueado)     │
│  ○ Colombia      (lock: 10 lvl+3rw) │
│  ○ Perú                             │
│  ○ Brasil                           │
│  ○ Argentina                        │
│                                     │
│  Recompensas: n/3 para siguiente    │
└─────────────────────────────────────┘
```

### VIEW-04 Partida

```text
┌─────────────────────────────────────┐
│ País · Nivel k/10   Score/minScore  │
│ Movimientos: n      Pánico: 1       │
├─────────────────────────────────────┤
│                                     │
│         Tablero 8 × 10              │
│         (gemas / hint glow)         │
│                                     │
├─────────────────────────────────────┤
│ [ Pánico ]              [ Salir ]   │
└─────────────────────────────────────┘
```

Sin cards en hero/home decorativos; el inventario sí puede listar ítems como contenedores de interacción.

---

## 10. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Tablero 8×10 apretado en móviles chicos | `Alto` | Celdas flex; safe area; HUD compacto |
| Hint molesto | `Medio` | Solo tras 5s idle; se cancela al tocar |
| Mapa de países genérico | `Medio` | Nombres reales + orden fijo; accent por país en V1.1+ |
| Theme local vs DS V3+ | `Medio` | Migrar tokens en pipeline V3+ |

---

## 11. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [x] Navegación y flujo principal definidos.
- [x] Todos los módulos V1 incorporados sin huérfanos.
- [x] Tokens/theme documentados.
- [ ] Wireframe o preview revisado por arquitecto.
- [x] Sin dependencias circulares.

### Checklist auditoría de ensamblado (Gate 3B)

- [x] `05-build-plan.md` coherente con este diseño.
- [x] Estrategia de build y riesgos alineados.
- [ ] `audits/auditoria-ensamblado.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobación visual (Arquitecto / Stakeholder):** `________________________`
- **Fecha visual:** `YYYY-MM-DD`
- **visual_approval_passed:** `false` → `true` al aprobar preview

- **Aprobación ensamblado (Arquitecto):** `________________________`
- **Fecha ensamblado:** `YYYY-MM-DD`
- **audit_3_passed:** `false` → `true` al aprobar ensamblado
