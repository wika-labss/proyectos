---
id: "FEAT-001"
title: "AI Chess Wars — Características V1"
status: "AUDIT_1_APROBADO"
version: "1.1.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
audit_2_passed: true
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y este documento.  
> **Equivalencia:** Auditoría de Documentación → `docs/auditoria-documentacion.md`.  
> **Visión completa (contexto):** Ranked, economía Núcleos/Créditos, eventos, zonas dinámicas → **V2+** (ver fuera de alcance).

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `AI Chess Wars`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `READY_FOR_CONSTRUCTION` — contrato V1.1; código en `iterations/v2/`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | Motor ajedrez FIDE básico | `Crítica` | `MOD-01` |
| `FEAT-02` | `ERR-02` | IA rival Fácil / Media | `Crítica` | `MOD-02` |
| `FEAT-03` | `ERR-03` | Modo Clásico (sin evoluciones) | `Crítica` | `MOD-01`, `MOD-06` |
| `FEAT-04` | `ERR-04` | Evolutive Quick: nodos, XP, evoluciones, habilidades | `Crítica` | `MOD-03` |
| `FEAT-05` | `ERR-05` | Loadout prepartida (1 pasiva) | `Alta` | `MOD-04` |
| `FEAT-06` | `ERR-06` | UI Home/Lobby/Prepartida/Tablero/Postpartida | `Crítica` | `MOD-06` |
| `FEAT-07` | `ERR-07` | Progresión local mínima | `Alta` | `MOD-05` |
| `FEAT-08` | `ERR-08` | Tutorial interactivo corto | `Alta` | `MOD-06` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Motor ajedrez FIDE básico

**Descripción:** Lógica pura: movimientos legales, jaque/mate/ahogado, enroque, al paso, promoción a dama. Base compartida por Clásico y Evolutive.

#### Escenario 1.1: Movimiento legal

- **Dado que** es turno de Blancas
- **Cuando** aplica un movimiento legal
- **Entonces** el estado se actualiza y el turno pasa a Negras

#### Escenario 1.2: Ilegal / auto-jaque

- **Dado que** un movimiento dejaría al rey en jaque
- **Cuando** se intenta
- **Entonces** el motor lo rechaza

---

### Feature `FEAT-02`: IA rival Fácil / Media

**Descripción:** Rival negro offline. En Evolutive, la IA también puede usar nodos/evoluciones con heurística simple (V1: prioriza capturas y evolucionar si puede).

#### Escenario 2.1: Respuesta legal

- **Dado que** el jugador movió
- **Cuando** es turno de la IA
- **Entonces** juega un movimiento legal (y opcionalmente evoluciona/habilidad si reglas Evolutive lo permiten)

---

### Feature `FEAT-03`: Modo Clásico

**Descripción:** Ajedrez puro. Sin nodos en tablero, sin XP, sin botón evolucionar/habilidad, sin loadout.

#### Escenario 3.1: Sin capa Wars

- **Dado que** el modo es Clásico
- **Cuando** se renderiza el tablero
- **Entonces** no hay nodos ni HUD de Energía/XP de evolución

---

### Feature `FEAT-04`: Evolutive Quick (núcleo diferencial)

**Descripción:** Partida rápida con:
- 4 nodos de energía fijos (`c3`,`f3`,`c6`,`f6`)
- Energía del jugador (0–5)
- XP por pieza; umbral 3 → elegible a evolucionar (coste 2 Energía; 1 vez/pieza/partida)
- Evoluciones V1: Peón→Dron, Torre→Fortaleza, Caballo→Interceptor (habilidad 1 uso)
- Alfil/Dama/Rey no evolucionan en V1

#### Escenario 4.1: Controlar nodo

- **Dado que** el jugador mueve una pieza a un nodo vacío o captura en nodo
- **Cuando** se resuelve el movimiento
- **Entonces** Energía += 1 (cap 5) y la pieza gana +1 XP

#### Escenario 4.2: Evolucionar

- **Dado que** una torre propia tiene XP ≥ 3 y Energía ≥ 2 y aún no evolucionó
- **Cuando** el jugador confirma evolución → Fortaleza
- **Entonces** gasta 2 Energía, la pieza queda marcada evolucionada y habilita habilidad Fortaleza (1 uso)

#### Escenario 4.3: Habilidad Dron

- **Dado que** un peón es Dron con habilidad disponible
- **Cuando** activa teleport a casilla ortogonal ≤2 vacía/legal según reglas V1
- **Entonces** se mueve ahí sin captura (V1: solo casillas vacías) y consume el uso

#### Escenario 4.4: Fortaleza

- **Dado que** Fortaleza activa su habilidad
- **Cuando** el rival intentaría capturarla en su siguiente turno
- **Entonces** la captura es ilegal / bloqueada hasta que expire el buff (1 turno rival)

#### Escenario 4.5: Interceptor

- **Dado que** Caballo→Interceptor usa habilidad tras un movimiento de caballo normal **o** como acción especial (V1: acción en su turno: un salto de caballo extra a casilla legal)
- **Cuando** confirma el salto
- **Entonces** se aplica y el uso queda consumido; luego termina el turno salvo que la regla documente “extra after move” — **V1 fija:** habilidad = movimiento extra de caballo que **consume el turno** si se usa sola, o si se usa justo después de mover el interceptor en el mismo turno (doble salto), el segundo salto cierra el turno

> **Aclaración V1 Interceptor:** En el turno del jugador, puede (a) mover como caballo normal, o (b) si habilidad disponible, realizar **hasta dos** saltos de caballo en el mismo turno (el segundo consume la habilidad). No puede capturar dos veces si el primero ya capturó — segundo salto solo a vacías o captura única en el segundo (máx. una captura en la secuencia).

---

### Feature `FEAT-05`: Loadout prepartida

**Descripción:** Solo en Evolutive. Elegir exactamente 1 pasiva: `A` +1 Energía inicial · `B` +1 XP extra por captura.

#### Escenario 5.1: Aplicar loadout

- **Dado que** eligió `A`
- **Cuando** inicia la partida
- **Entonces** Energía inicial = 1 (en lugar de 0)

---

### Feature `FEAT-06`: UI flujo de pantallas V1

**Descripción:** Home (marca AI Chess Wars + Jugar) → Lobby de modos (Clásico / Evolutive Quick) → Prepartida (dificultad IA + loadout si Evolutive) → Tablero (HUD Energía, XP pieza seleccionada, Evolucionar, Habilidad) → Postpartida (resultado, XP meta, rematch/home).

#### Escenario 6.1: Navegación

- **Dado que** el usuario está en Home
- **Cuando** pulsa Jugar → Evolutive Quick
- **Entonces** llega a prepartida y luego al tablero con nodos visibles

---

### Feature `FEAT-07`: Progresión local mínima

**Descripción:** AsyncStorage: `gamesPlayed`, `wins`, `tutorialDone`. Sin monedas ni árbol de desbloqueo de pago. (El árbol completo de la visión = V2+.)

#### Escenario 7.1: Persistir

- **Dado que** el jugador gana una partida
- **Cuando** cierra y reabre
- **Entonces** `wins` y `gamesPlayed` se conservan

---

### Feature `FEAT-08`: Tutorial corto

**Descripción:** Overlay/pantalla única la primera vez: nodos dan Energía; XP → evolucionar; habilidades 1 uso. Se puede saltar.

#### Escenario 8.1: Primera vez

- **Dado que** `tutorialDone = false`
- **Cuando** entra a Evolutive por primera vez
- **Entonces** se muestra tutorial; al cerrar, `tutorialDone = true`

---

## 4. Funcionalidades Deseables (V1.1 / Visión)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-09` | Zonas de poder dinámicas por ronda | `Media` | Visión; fuera V1 |
| `FEAT-10` | Más ramas (2–4) por tipo de pieza | `Media` | Visión |
| `FEAT-11` | Arena Ranked + ELO | `Alta` | Requiere online V2+ |
| `FEAT-12` | Economía Créditos/Núcleos + pase | `Alta` | V2+; anti-P2W |
| `FEAT-13` | Eventos temporales | `Media` | V2+ |
| `FEAT-14` | Colección skins (solo estética) | `Media` | V1.1+ |
| `FEAT-15` | Matchmaking por poder efectivo | `Media` | Con Ranked |

---

## 5. Fuera de Alcance

- Ranked, ELO, online, IAP, anuncios, monedas premium
- Eventos, zonas dinámicas, árbol de desbloqueo largo
- Stockfish nativo, iOS, backend
- Ventajas competitivas de pago

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Rendimiento** | Smoke engine+evolución &lt; 30s; IA Media &lt; 2s/jugada típica | `npm run smoke` |
| `NFR-02` | **Build** | APK release sin Metro | `scripts/build-apk.sh` |
| `NFR-03` | **Fidelidad visual** | 100% tokens documentados | `04` |
| `NFR-04` | **Offline** | Flujo completo sin red | Manual |
| `NFR-05` | **Aislamiento** | `src/engine/` sin React; evolución en módulo dedicado | review |
| `NFR-06` | **Integridad Clásico** | 0 fugas de mecánicas Wars en modo Clásico | smoke + QA |

---

## 7. Mapeo de UI y Componentes

| Componente UI | Pantalla | Tokens | Estado |
| :--- | :--- | :--- | :--- |
| `PrimaryButton` | Home / Lobby | `accent` | Wireframe `04` |
| `ModeCard` | Lobby | `surface` | Wireframe `04` |
| `LoadoutPicker` | Prepartida | `accentSecondary` | Wireframe `04` |
| `ChessBoard` + nodos | Tablero | `board.*`, `node` | Wireframe `04` |
| `EvolveBar` / `AbilityButton` | Tablero HUD | `accent`, `danger` | Wireframe `04` |
| `PostMatchSummary` | Postpartida | `success`/`danger` | Wireframe `04` |

---

## 8. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist

- [x] Frontmatter vinculado a `PROB-001`
- [x] RTM 1:1 `ERR`→`FEAT`
- [x] BDD por feature obligatoria
- [x] NFRs medibles
- [x] Deseables/visión vs V1 diferenciados
- [x] `audits/auditoria-documentacion.md` APROBADO

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `WIKA Lead QA / agente auditoría`
- **Fecha:** `2026-08-21`
- **audit_1_passed:** `true`
