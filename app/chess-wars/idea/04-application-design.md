---
id: "DES-001"
title: "Chess Wars — Diseño de Aplicación"
status: "AUDIT_3_APROBADO"
version: "1.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.  
> **Gate visual:** `visual_approval_passed: true` requiere visto bueno del arquitecto/stakeholder.  
> **Equivalencia:** Auditoría de Ensamblado (parte visual) → `docs/auditoria-ensamblado.md`.

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** `Chess Wars`
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `AUDIT_3_APROBADO` / visual aprobado
- **Dirección visual V1:** Estrategia “Wars” — fondo atmosférico oscuro, marca Chess Wars hero, tablero dominante en partida, sin cards innecesarias

---

## 2. Arquitectura General

Capas V1:

1. **expo-router** (`app/`) — rutas Home, Campaña, Partida, Cómo jugar, Resultado
2. **UI** (`src/components/`) — tablero, highlights, botones; consume `theme.ts`
3. **Modules** — progress store
4. **Engine** (`src/engine/`) — chess + AI puros
5. **Data** — batallas Wars
6. **Persistencia** — AsyncStorage

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-chess-engine` | Reglas y estado |
| `MOD-02` | `mod-chess-ai` | Rival Negras |
| `MOD-03` | `mod-campaign-wars` | 10 batallas |
| `MOD-04` | `mod-progress-store` | Progreso offline |
| `MOD-05` | `mod-screens` | Navegación y UI |

---

## 4. Relaciones entre Módulos

```text
GameScreen
  → onSelectSquare → chessEngine (MOD-01)
  → after player move → chessAi.chooseMove (MOD-02) → applyMove (MOD-01)
  → onTerminal → ResultScreen; si campaign win → progress.markBattleWon (MOD-04)
  → battleConfig desde MOD-03
```

---

## 5. Flujo Principal de Usuario

```text
Home → Partida rápida (elige dificultad) → Game → Resultado → Home
Home → Campaña Wars → lista 10 batallas → Game → Resultado → Campaña/Home
Home → Cómo jugar → Home
```

Estados de partida: `selecting`, `awaitingAi`, `check`, `won`, `lost`, `draw`.

---

## 6. Navegación (expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` | Home Chess Wars | `MOD-05`, `MOD-04` | `FEAT-05`, `FEAT-07` |
| `/campaign` | Lista 10 batallas | `MOD-05`, `MOD-03`, `MOD-04` | `FEAT-03` |
| `/play` | Partida rápida (query `difficulty`) | `MOD-01`, `MOD-02`, `MOD-05` | `FEAT-01`, `FEAT-02`, `FEAT-04` |
| `/play/[battleId]` | Batalla campaña | `MOD-01`–`MOD-05` | `FEAT-01`–`04`, `FEAT-06` |
| `/how-to` | Cómo jugar | `MOD-05` | `FEAT-05` |
| `/result` | Victoria / Derrota / Tablas | `MOD-05` | `FEAT-05` |

---

## 7. Consumo de Tokens y Theme

> Estilos derivados de `theme.ts` local V1. Profesionalización V3+ vía `design-system/` si aplica.

### Tokens clave V1 (Wars / estrategia)

| Token semántico | Uso en app | Valor |
| :--- | :--- | :--- |
| `background` | Fondo app | `#12161C` |
| `backgroundAlt` | Atmósfera / gradiente | `#1A2330` → `#2A1F18` |
| `surface` | Paneles HUD | `#243040` |
| `accent` | CTA primario | `#C4A35A` |
| `accentSecondary` | Secundario | `#6B8F71` |
| `text` | Texto principal | `#E8E6E3` |
| `textMuted` | Texto secundario | `#9AA3AD` |
| `danger` | Derrota / alerta | `#B33A3A` |
| `success` | Victoria | `#3D8B6E` |
| `board.light` | Casilla clara | `#D6C4A8` |
| `board.dark` | Casilla oscura | `#6B4F3A` |
| `legal` | Casilla legal | `#C4A35A88` |
| `selected` | Pieza seleccionada | `#E8C547` |
| `spacing.md` | Padding estándar | `16` |
| `spacing.lg` | Separación secciones | `24` |
| `radius.md` | Controles interactivos | `12` |
| `font.brand` | Marca Chess Wars | familia display en `theme.ts` (no Inter/Roboto/system) |
| `font.body` | UI body | familia sans en `theme.ts` |

**Regla:** 0% hex en componentes; solo en `theme.ts` / tokens.

---

## 8. Matriz Preview Visual vs Componentes de Código

| ID Vista | ID Módulo | Componente / Pantalla | Tokens | Referencia wireframe |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-01` | `MOD-05` | `HomeScreen` | `background`, `accent`, `font.brand` | ASCII §9 |
| `VIEW-02` | `MOD-05` | `CampaignScreen` | `surface`, `accent`, `textMuted` | ASCII §9 |
| `VIEW-03` | `MOD-01/05` | `GameScreen` + `ChessBoard` | `board.*`, `legal`, `selected` | ASCII §9 |
| `VIEW-04` | `MOD-05` | `HowToScreen` | `text`, `surface` | ASCII §9 |
| `VIEW-05` | `MOD-05` | `ResultScreen` | `success`, `danger`, `accent` | ASCII §9 |

---

## 9. Layout Visual (wireframe / ASCII)

### VIEW-01 Home

```text
┌─────────────────────────────────────┐
│                                     │
│           CHESS WARS                │  ← brand hero
│     Estrategia offline · VISSIUSS   │
│                                     │
│        [  Partida rápida  ]         │
│        [  Campaña Wars    ]         │
│        [  Cómo jugar      ]         │
│                                     │
└─────────────────────────────────────┘
```

### VIEW-02 Campaña

```text
┌─────────────────────────────────────┐
│  ←  Campaña Wars                    │
│                                     │
│  Batalla 1  .........  [Jugar]      │
│  Batalla 2  .........  [Jugar]      │
│  Batalla 3  .........  [Bloqueada]  │
│  ...                                │
│  Batalla 10 ........  [Bloqueada]   │
└─────────────────────────────────────┘
```

### VIEW-03 Partida

```text
┌─────────────────────────────────────┐
│  Batalla N / Rápida · Turno Blancas │
├─────────────────────────────────────┤
│                                     │
│          [  TABLERO 8×8  ]          │
│                                     │
├─────────────────────────────────────┤
│  Capturas · Estado (jaque)          │
└─────────────────────────────────────┘
```

### VIEW-04 Cómo jugar / VIEW-05 Resultado

```text
Cómo jugar: reglas breves + volver
Resultado: Victoria | Derrota | Tablas + [Reintentar] [Home]
```

---

## 10. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Tablero pequeño en móviles | `Alto` | Casillas full-width; área táctil máxima |
| Confusión de turno durante IA | `Medio` | Bloquear input + indicador “Pensando…” |
| Theme local vs design-system V3+ | `Medio` | Migrar tokens en V3+ pipeline |

---

## 11. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [x] Navegación y flujo principal definidos.
- [x] Todos los módulos V1 incorporados sin huérfanos.
- [x] Tokens/theme documentados.
- [x] Wireframe ASCII revisado por arquitecto.
- [x] Sin dependencias circulares.

### Checklist auditoría de ensamblado (Gate 3B)

- [x] `05-build-plan.md` coherente con este diseño.
- [x] Estrategia de build y riesgos alineados.
- [x] `audits/auditoria-ensamblado.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobación visual (Arquitecto / Stakeholder):** `WIKA Lead QA / agente auditoría`
- **Fecha visual:** `2026-08-21`
- **visual_approval_passed:** `true`

- **Aprobación ensamblado (Arquitecto):** `WIKA Lead QA / agente auditoría`
- **Fecha ensamblado:** `2026-08-21`
- **audit_3_passed:** `true`
