---
id: "DES-001"
title: "AI Chess Wars — Diseño de Aplicación"
status: "AUDIT_3_APROBADO"
version: "1.1.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true`.  
> **Dirección visual V1:** Futurista sobrio — marca **AI Chess Wars** hero, tablero dominante, nodos con glow contenido, sin cards en hero.

## 1. Identificación

- **Proyecto:** `AI Chess Wars`
- **Estado:** Gates visual + ensamblado aprobados
- **Docs base:** 01 | 02 | 03

---

## 2. Arquitectura General

1. expo-router pantallas  
2. UI components + theme  
3. loadout + meta-progress  
4. evolution layer + chess AI  
5. chess engine puro  

---

## 3. Módulos en V1

| ID | Nombre | Rol |
| :--- | :--- | :--- |
| MOD-01 | chess-engine | Base FIDE |
| MOD-02 | chess-ai | Rival |
| MOD-03 | evolution-layer | Wars |
| MOD-04 | loadout | Prepartida |
| MOD-05 | meta-progress | Persistencia |
| MOD-06 | screens | UX |

---

## 4. Relaciones

```text
PreMatch → loadout(A|B) → createEvolutiveState
GameScreen
  → applyMove(engine)
  → evolution.onMoveResolved
  → AI.choose (puede evolve/ability)
  → HUD: Energy, Evolve, Ability
PostMatch → meta-progress++
```

Clásico: omite loadout y evolution-layer.

---

## 5. Flujo principal

```text
Home → Lobby → Prepartida → Tablero → Postpartida → Home/Rematch
                 ↘ Tutorial (primera Evolutive)
```

Estados tablero Evolutive: `selecting`, `awaitingAi`, `evolvePrompt`, `abilityTargeting`, `check`, `ended`.

---

## 6. Navegación (expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` | Home | MOD-06,05 | FEAT-06,07 |
| `/lobby` | Lobby modos | MOD-06 | FEAT-03,04,06 |
| `/prematch` | Dificultad + loadout | MOD-04,06 | FEAT-05 |
| `/play/classic` | Tablero clásico | MOD-01,02,06 | FEAT-01–03 |
| `/play/evolutive` | Tablero Wars | MOD-01–04,06 | FEAT-04–06 |
| `/result` | Postpartida | MOD-05,06 | FEAT-06,07 |

---

## 7. Tokens V1 (futurista)

| Token | Uso | Valor |
| :--- | :--- | :--- |
| `background` | Fondo | `#0B1020` |
| `backgroundAlt` | Atmósfera | `#121A33` → `#1A1430` |
| `surface` | HUD | `#1C2744` |
| `accent` | CTA / marca | `#5CE1E6` |
| `accentSecondary` | Evolución | `#A78BFA` |
| `text` | Principal | `#E8EEF8` |
| `textMuted` | Secundario | `#8B97B0` |
| `success` | Victoria | `#3DDC97` |
| `danger` | Derrota / alerta | `#FF5C7A` |
| `board.light` | Casilla | `#2A3555` |
| `board.dark` | Casilla | `#161D33` |
| `node` | Nodo energía | `#F5C542` |
| `legal` | Highlight | `#5CE1E688` |
| `selected` | Selección | `#F5C542` |
| `spacing.md` | 16 | |
| `font.brand` | Display (no Inter/Roboto/system) | en `theme.ts` |

0% hex fuera de `theme.ts`.

---

## 8. Matriz vistas

| ID | Pantalla | Tokens | Wireframe |
| :--- | :--- | :--- | :--- |
| VIEW-01 | Home | brand, accent | §9 |
| VIEW-02 | Lobby | surface, accent | §9 |
| VIEW-03 | Prepartida | accentSecondary | §9 |
| VIEW-04 | Tablero Evolutive | board, node, HUD | §9 |
| VIEW-05 | Postpartida | success/danger | §9 |

---

## 9. Wireframes ASCII

### VIEW-01 Home

```text
┌─────────────────────────────────────┐
│         AI CHESS WARS               │  brand hero
│   Evoluciona. Domina. Offline.      │
│                                     │
│            [  Jugar  ]              │
│         Victorias: N                │
└─────────────────────────────────────┘
```

### VIEW-02 Lobby

```text
│  Clásico          │  Evolutive Quick │
│  Ajedrez puro     │  Nodos + evo     │
```

### VIEW-03 Prepartida

```text
IA: (Fácil | Media)
Loadout: (A +1 Energía) (B +1 XP captura)   ← solo Evolutive
[ Empezar ]
```

### VIEW-04 Tablero

```text
Energía ◆◆◇◇◇   │  [Evolucionar] [Habilidad]
┌───────────────────────────────┐
│  tablero 8×8 · nodos ★        │
└───────────────────────────────┘
Pieza sel: XP 2/3 · tipo
```

### VIEW-05 Postpartida

```text
Victoria / Derrota / Tablas
+stats meta
[ Rematch ] [ Lobby ] [ Home ]
```

---

## 10. Riesgos de diseño

| Riesgo | Mitigación |
| :--- | :--- |
| HUD clutter | Máx. 2 acciones contextuales |
| Nodos poco visibles | Token `node` + icono ★ |
| Confusión Clásico vs Evolutive | Lobby con copy claro |

---

## 11. Firmas

- [x] Gate 3A visual — wireframe aprobado
- [x] Gate 3B ensamblado — coherente con `05`
- **visual_approval_passed:** `true`
- **audit_3_passed:** `true`
- **Fecha:** `2026-08-21`
- **Arquitecto:** `WIKA Lead QA / agente auditoría`
