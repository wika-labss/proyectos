---
id: "FEAT-001"
title: "Match-3 América — Características V1"
status: "AUDIT_1_APROBADO"
version: "1.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
audit_2_passed: true
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y este documento.  
> **Equivalencia:** Auditoría de Documentación → `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Match-3 América`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `AUDIT_1_APROBADO` — listo para auditoría de módulos

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | Motor Match-3 tablero 8×10 | `Crítica` | `MOD-01` |
| `FEAT-02` | `ERR-02` | Campaña 5 países × 10 niveles | `Crítica` | `MOD-03` |
| `FEAT-03` | `ERR-03` | Umbral de puntos y desbloqueo de nivel | `Crítica` | `MOD-01` |
| `FEAT-04` | `ERR-04` | Recompensas e inventario; unlock país | `Crítica` | `MOD-04` |
| `FEAT-05` | `ERR-05` | Hint idle 5s + botón pánico | `Crítica` | `MOD-01` |
| `FEAT-06` | `ERR-06` | Home, mapa, persistencia offline | `Crítica` | `MOD-05` |
| `FEAT-07` | `ERR-07` | Theme América / viaje + UI pantallas | `Alta` | `MOD-06` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Motor Match-3 tablero 8×10

**Descripción:** Lógica pura: grilla 8 columnas × 10 filas, 5 tipos de gema, swap adyacente, match ≥3, gravedad, refill, puntuación y detección de movimientos válidos.

#### Escenario 1.1: Swap válido genera match

- **Dado que** el tablero tiene dos gemas adyacentes cuyo intercambio crea un match ≥3
- **Cuando** el jugador hace swap
- **Entonces** se resuelven matches, aplica gravedad/refill y se suman puntos según fórmula V1

#### Escenario 1.2: Swap inválido

- **Dado que** el intercambio no produce match
- **Cuando** el jugador intenta el swap
- **Entonces** las gemas vuelven a su posición y no se consume movimiento

---

### Feature `FEAT-02`: Campaña 5 países × 10 niveles

**Descripción:** Mapa de América con exactamente 5 países en orden: México → Colombia → Perú → Brasil → Argentina. Cada país tiene 10 niveles secuenciales. Dificultad interna fácil/media oculta (impares fácil, pares media).

#### Escenario 2.1: Avance dentro del país

- **Dado que** el nivel 1 del país actual está desbloqueado
- **Cuando** el jugador completa niveles con umbral de puntos
- **Entonces** se desbloquean hasta el nivel 10 del mismo país en orden

#### Escenario 2.2: País bloqueado

- **Dado que** el jugador no cumplió 10 niveles del país anterior o tiene &lt; 3 recompensas
- **Cuando** intenta abrir el siguiente país
- **Entonces** permanece bloqueado con feedback claro

---

### Feature `FEAT-03`: Umbral de puntos y desbloqueo de nivel

**Descripción:** Cada nivel define `minScore`. Victoria y unlock del siguiente nivel solo si `score >= minScore`. Fórmulas: fácil `800 + i×50`, media `1200 + i×75` (i = 0..9). Movimientos: fácil 25 / media 20.

#### Escenario 3.1: Victoria con umbral

- **Dado que** el jugador alcanza `minScore` antes de agotar movimientos
- **Cuando** se evalúa fin de nivel
- **Entonces** el nivel cuenta como completado y se habilita N+1

#### Escenario 3.2: Derrota por movimientos

- **Dado que** `movesLeft = 0` y `score < minScore`
- **Cuando** termina la resolución de cascadas
- **Entonces** se muestra derrota; el siguiente nivel no se desbloquea

---

### Feature `FEAT-04`: Recompensas e inventario; unlock país

**Descripción:** Al completar un nivel (con umbral) se otorga exactamente 1 recompensa aleatoria del pool `recompensa 1` … `recompensa 8` al inventario local (solo visualización). Desbloquear el siguiente país requiere completar los 10 niveles del actual **y** tener ≥ 3 ítems en inventario.

#### Escenario 4.1: Otorgar recompensa

- **Dado que** el jugador gana un nivel
- **Cuando** se cierra la victoria
- **Entonces** el inventario aumenta en 1 ítem aleatorio (1–8)

#### Escenario 4.2: Unlock país

- **Dado que** los 10 niveles del país están completados y `inventoryCount >= 3`
- **Cuando** el jugador abre el mapa
- **Entonces** el siguiente país del orden queda desbloqueado

---

### Feature `FEAT-05`: Hint idle 5s + botón pánico

**Descripción:** Tras 5 segundos sin input/animación de jugada, se destaca un movimiento válido (`findHintMove`). Botón pánico: reshuffle del tablero preservando score, movimientos restantes y objetivos; 1 uso por nivel; también usable/auto cuando `!hasValidMoves`.

#### Escenario 5.1: Hint por idle

- **Dado que** hay movimientos válidos y no hay interacción por 5 s
- **Cuando** vence el timer
- **Entonces** se resalta un par de celdas intercambiables; al tocar se limpia el hint

#### Escenario 5.2: Pánico

- **Dado que** el jugador tiene 1 uso de pánico restante en el nivel
- **Cuando** pulsa el botón pánico (o el motor detecta 0 jugadas)
- **Entonces** el tablero se reshufflea con ≥1 jugada válida y el uso queda consumido

---

### Feature `FEAT-06`: Home, mapa y persistencia offline

**Descripción:** Home VISSIUSS con acciones Jugar / Inventario e info Puntaje / Histórico / Recompensas. Persistencia local: país/nivel desbloqueados, scores, inventario, histórico de victorias. 100% offline.

#### Escenario 6.1: Persistir progreso

- **Dado que** el jugador completó un nivel
- **Cuando** cierra y reabre la app sin red
- **Entonces** el progreso, puntaje e inventario se restauran

---

### Feature `FEAT-07`: Theme América / viaje + UI

**Descripción:** Pantallas Home, Mapa de países, Selector de niveles, Partida (HUD + tablero + pánico), Inventario. Estilos vía `theme.ts` documentado en `04-application-design.md`.

#### Escenario 7.1: Navegación principal

- **Dado que** el usuario está en Home
- **Cuando** pulsa Jugar
- **Entonces** ve el mapa de 5 países y puede entrar al país desbloqueado

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-08` | Más países de América | `Media` | Fuera de V1 |
| `FEAT-09` | Boosters / obstáculos | `Media` | Hielo, cadenas, etc. |
| `FEAT-10` | Usos extra de pánico | `Baja` | Solo 1 en V1 |

---

## 5. Fuera de Alcance

- Unity/Godot/Phaser
- Backend, cuentas, ads, IAP
- iOS / multijugador
- Boosters permanentes y obstáculos avanzados
- Más de 5 países o más de 10 niveles por país en V1
- Pipeline `design-system/` (reservado V3+)

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Rendimiento** | Smoke engine &lt; 30s | `npm run verify` / smoke |
| `NFR-02` | **Build** | APK release sin Metro | `scripts/build-apk.sh` |
| `NFR-03` | **Fidelidad visual** | 100% tokens documentados | Revisión `04-application-design.md` |
| `NFR-04` | **Offline** | Flujo completo sin red | Prueba manual |
| `NFR-05` | **Aislamiento** | `src/engine/` sin React | typecheck + review |

---

## 7. Mapeo de UI y Componentes (si aplica)

| Componente UI | Pantalla / Vista | Tokens | Estado mockup |
| :--- | :--- | :--- | :--- |
| `PrimaryButton` | Home | `accent`, `spacing.md` | Wireframe en `04` |
| `CountryMap` | Mapa | `surface`, `accent` | Wireframe en `04` |
| `GameBoard` | Partida | `gem.*`, `board` | Wireframe en `04` |
| `PanicButton` | Partida | `danger`, `accent` | Wireframe en `04` |
| `HintHighlight` | Partida | `hint` | Wireframe en `04` |
| `InventoryList` | Inventario | `surface`, `text` | Wireframe en `04` |

---

## 8. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist

- [x] Frontmatter YAML vinculado a `PROB-001`.
- [x] RTM 1:1 con IDs `ERR-XX` de `01-problem.md`.
- [x] Escenarios BDD por feature obligatoria.
- [x] NFRs con métricas verificables.
- [x] Deseables y fuera de alcance diferenciados.
- [x] `audits/auditoria-documentacion.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `WIKA Lead QA / agente auditoría`
- **Fecha:** `2026-08-21`
- **audit_1_passed:** `true`
