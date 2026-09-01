---
id: "FEAT-001"
title: "Match-3 América — Características V2"
status: "AUDIT_1_APROBADO"
version: "2.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-09-01"
audit_1_passed: true
audit_2_passed: true
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y este documento.  
> **Equivalencia:** Auditoría de Documentación → `docs/auditoria-documentacion.md`.  
> **Destino de código:** `iterations/v2/`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Match-3 América`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `AUDIT_1_APROBADO` — contrato V2

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | Motor Match-3 tablero 8×10 | `Crítica` | `MOD-01` |
| `FEAT-02` | `ERR-02` | Campaña 5 países × 10 niveles | `Crítica` | `MOD-03` |
| `FEAT-03` | `ERR-03` | Umbral de puntos y desbloqueo de nivel | `Crítica` | `MOD-01` |
| `FEAT-04` | `ERR-04` | Inventario de regalos; unlock país por lifetime | `Crítica` | `MOD-04` |
| `FEAT-05` | `ERR-05` | Hint idle 5s + botón pánico | `Crítica` | `MOD-01` |
| `FEAT-06` | `ERR-06` | Home, mapa, persistencia offline | `Crítica` | `MOD-05` |
| `FEAT-07` | `ERR-07` | Theme América / viaje + UI pantallas | `Alta` | `MOD-06` |
| `FEAT-08` | `ERR-08` | Perfil: nombre, preferencia, avatar 8-bit | `Crítica` | `MOD-07`, `MOD-10` |
| `FEAT-09` | `ERR-09` | Pretendientes 2H+2M por país | `Crítica` | `MOD-08` |
| `FEAT-10` | `ERR-04`, `ERR-10` | Regalos solo en niveles pares | `Crítica` | `MOD-04` |
| `FEAT-11` | `ERR-11` | Afinidad, pareja única, etiquetas espejo | `Crítica` | `MOD-09` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Motor Match-3 tablero 8×10

**Descripción:** Lógica pura: grilla 8 columnas × 10 filas, 5 tipos de gema, swap adyacente, match ≥3, gravedad, refill, puntuación y detección de movimientos válidos. Sin cambios de reglas respecto a V1.

#### Escenario 1.1: Swap válido genera match

- **Dado que** el tablero tiene dos gemas adyacentes cuyo intercambio crea un match ≥3
- **Cuando** el jugador hace swap
- **Entonces** se resuelven matches, aplica gravedad/refill y se suman puntos según fórmula

---

### Feature `FEAT-02`: Campaña 5 países × 10 niveles

**Descripción:** Mapa de América con exactamente 5 países en orden: México → Colombia → Perú → Brasil → Argentina. Cada país tiene 10 niveles secuenciales. Dificultad interna fácil/media oculta (impares fácil, pares media).

#### Escenario 2.1: País bloqueado

- **Dado que** el jugador no cumplió 10 niveles del país anterior o tiene &lt; 3 regalos ganados
- **Cuando** intenta abrir el siguiente país
- **Entonces** permanece bloqueado con feedback claro

---

### Feature `FEAT-03`: Umbral de puntos y desbloqueo de nivel

**Descripción:** Cada nivel define `minScore`. Victoria y unlock del siguiente nivel solo si `score >= minScore`. Fórmulas: fácil `800 + i×50`, media `1200 + i×75` (i = 0..9). Movimientos: fácil 25 / media 20.

---

### Feature `FEAT-04`: Inventario de regalos; unlock país

**Descripción:** El inventario lista ítems `recompensa 1`–`8` (placeholder visual V2). Desbloquear el siguiente país requiere completar los 10 niveles del actual **y** `rewardsGranted >= 3` (conteo lifetime, no stock actual). Entregar un regalo **consume** un ítem.

#### Escenario 4.1: Unlock país no depende del stock

- **Dado que** el jugador ganó ≥3 regalos y ya entregó algunos
- **Cuando** completa el nivel 10 del país actual
- **Entonces** el siguiente país se desbloquea aunque el inventario actual sea &lt; 3

---

### Feature `FEAT-05`: Hint idle 5s + botón pánico

**Descripción:** Tras 5 segundos sin input, se destaca un movimiento válido. Pánico: reshuffle; 1 uso por nivel.

---

### Feature `FEAT-06`: Home, mapa y persistencia offline

**Descripción:** Home VISSIUSS con Jugar / Inventario / Pretendientes. Persistencia local: perfil, país/nivel, scores, inventario, afinidad, `partnerId`, `rewardsGranted`. 100% offline. Storage key `match3:v2:progress`.

---

### Feature `FEAT-07`: Theme América / viaje + UI

**Descripción:** Pantallas Home, Mapa, Selector de niveles, Partida, Inventario, Pretendientes. Estilos vía `theme.ts` documentado en `04-application-design.md`.

---

### Feature `FEAT-08`: Perfil — nombre, preferencia, avatar 8-bit

**Descripción:** Primera visita a Home: formulario obligatorio. Nombre no vacío; preferencia `hombre` | `mujer` | `ambos`; avatar uno de 6 retratos pixel art (3 hombres `avatar-m1..m3`, 3 mujeres `avatar-w1..w3`). Nombre y preferencia inmutables. Avatar visible en Home; se puede cambiar tocando el retrato. Preferencia filtra pretendientes visibles, **no** el grid de avatares del jugador.

#### Escenario 8.1: Onboarding una vez

- **Dado que** `profile` es `null`
- **Cuando** el jugador confirma nombre, preferencia y avatar
- **Entonces** se persiste el perfil y Home pasa a saludo + retrato + CTAs

#### Escenario 8.2: Cambiar solo el avatar

- **Dado que** ya hay perfil
- **Cuando** el jugador toca el retrato en Home y elige otro de los 6
- **Entonces** se actualiza `avatarId` sin pedir de nuevo nombre ni preferencia

---

### Feature `FEAT-09`: Pretendientes 2H+2M por país

**Descripción:** 20 personajes (IDs `{countryId}-{h1|h2|m1|m2}`). Visible/interactuable solo si el país está desbloqueado. Preferencia `hombre` muestra `h1/h2`; `mujer` muestra `m1/m2`; `ambos` muestra los 4. V2 usa iniciales + color de slot (retratos de elenco diferidos).

#### Escenario 9.1: País bloqueado

- **Dado que** Colombia no está desbloqueado
- **Cuando** el jugador abre Pretendientes
- **Entonces** el grupo Colombia aparece bloqueado y no se puede regalar

---

### Feature `FEAT-10`: Regalos solo en niveles pares

**Descripción:** Al ganar un nivel, `grantRandomReward` solo si `levelNumber` ∈ {2,4,6,8,10}. Niveles impares no otorgan ítem. Pool aleatorio 1–8.

#### Escenario 10.1: Nivel impar sin regalo

- **Dado que** el jugador gana el nivel 1 (índice 0)
- **Cuando** se cierra la victoria
- **Entonces** el inventario no crece y `rewardsGranted` no incrementa

#### Escenario 10.2: Nivel par con regalo

- **Dado que** el jugador gana el nivel 2
- **Cuando** se cierra la victoria
- **Entonces** el inventario aumenta 1 ítem aleatorio y `rewardsGranted += 1`

---

### Feature `FEAT-11`: Afinidad, pareja única, etiquetas espejo

**Descripción:** Motor puro. Entregar regalo: slot coincidente +10, otro +2. Umbrales del personaje pareja (`partnerId` o aún sin pareja): 50 amigos, 69 ligue, 120 pareja, 200 matrimonio. El primero en cruzar 120 fija `partnerId`. Los demás: 50 amigos, 69 ligue, 120 amorio, 200 infidelidad culposa. No hay segunda pareja ni matrimonio.

#### Escenario 11.1: Primer 120

- **Dado que** `partnerId` es null y un pretendiente pasa de 110 a 120
- **Cuando** se aplica el regalo
- **Entonces** ese ID queda como `partnerId` con estado pareja

#### Escenario 11.2: Espejo

- **Dado que** ya hay pareja
- **Cuando** otro pretendiente alcanza 120 / 200
- **Entonces** los estados son amorio / infidelidad culposa, no pareja / matrimonio

---

## 4. Funcionalidades Deseables (diseño visual diferido — post-V2)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-12` | Sprites de los 8 regalos | `Media` | Sustituir placeholder texto/color; mismos IDs `recompensa N` |
| `FEAT-13` | Mapa ilustrado de América | `Media` | Sustituir lista de países V1; mismos `countryId` |
| `FEAT-14` | Retratos de 20 pretendientes | `Media` | Sustituir iniciales+color; mismos suitor IDs |
| `FEAT-15` | Más países de América | `Baja` | Fuera de V2 |
| `FEAT-16` | Boosters / obstáculos | `Baja` | Hielo, cadenas |

Los IDs de país, suitor y regalo **no cambian** cuando se haga el pase de arte.

---

## 5. Fuera de Alcance

- Unity/Godot/Phaser
- Backend, cuentas, ads, IAP
- iOS / multijugador
- Cambiar nombre o preferencia post-onboarding
- Ruptura / segunda pareja
- Pipeline `design-system/` (reservado V3+)
- Modificar `iterations/v1/`

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Rendimiento** | Smoke engine + afinidad | `npm run smoke` |
| `NFR-02` | **Build** | Typecheck limpio V2 | `npm run typecheck` |
| `NFR-03` | **Fidelidad visual** | 100% tokens documentados | Revisión `04` |
| `NFR-04` | **Offline** | Flujo completo sin red | Prueba manual |
| `NFR-05` | **Aislamiento** | `src/engine/` sin React | typecheck + review |

---

## 7. Mapeo de UI y Componentes

| Componente UI | Pantalla / Vista | Tokens | Estado mockup |
| :--- | :--- | :--- | :--- |
| `PrimaryButton` | Home | `accent`, `spacing.md` | Wireframe en `04` |
| `AvatarGrid` | Home onboarding | `surface`, `accent` | VIEW-06 |
| `CountryMap` | Mapa | `surface`, `accent` | Placeholder lista |
| `GameBoard` | Partida | `gem.*`, `board` | Wireframe en `04` |
| `InventoryList` | Inventario | `surface`, `text` | Placeholder ítem |
| `SuitorList` | Pretendientes | `relation.*` | VIEW-07 |
| `SuitorDetail` | Ficha | `relation.*` | VIEW-08 |

---

## 8. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist

- [x] Frontmatter YAML vinculado a `PROB-001`.
- [x] RTM 1:1 con IDs `ERR-XX` de `01-problem.md`.
- [x] Escenarios BDD por feature nueva V2.
- [x] NFRs con métricas verificables.
- [x] Deseables (arte diferido) y fuera de alcance diferenciados.
- [x] `audits/auditoria-documentacion.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `WIKA Lead QA / agente auditoría`
- **Fecha:** `2026-09-01`
- **audit_1_passed:** `true`
