---
id: "FEAT-001"
title: "Chess Wars — Características V1"
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

- **Nombre del Proyecto:** `Chess Wars`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `READY_FOR_CONSTRUCTION` — Gates 1–3B aprobados

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | Motor de ajedrez FIDE básico | `Crítica` | `MOD-01` |
| `FEAT-02` | `ERR-02` | IA rival Fácil / Media | `Crítica` | `MOD-02` |
| `FEAT-03` | `ERR-03` | Campaña Wars (10 batallas) | `Crítica` | `MOD-03` |
| `FEAT-04` | `ERR-04` | Tablero interactivo y jugada táctil | `Crítica` | `MOD-05` |
| `FEAT-05` | `ERR-05` | Home, Cómo jugar, resultados | `Crítica` | `MOD-05` |
| `FEAT-06` | `ERR-06` | Persistencia offline de campaña | `Crítica` | `MOD-04` |
| `FEAT-07` | `ERR-07` | Theme Wars + UI coherente | `Alta` | `MOD-05` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Motor de ajedrez FIDE básico

**Descripción:** Lógica pura en `src/engine/`: posición 8×8, generación de movimientos legales, aplicación de jugadas, detección de jaque, jaque mate, ahogado, enroque, peón doble paso, captura al paso, promoción a dama. Sin React.

#### Escenario 1.1: Movimiento legal

- **Dado que** es turno de Blancas y hay un peón en e2 con e3/e4 libres
- **Cuando** se aplica el movimiento e2→e4
- **Entonces** el peón queda en e4, el turno pasa a Negras y el estado es válido

#### Escenario 1.2: Movimiento ilegal / deja rey en jaque

- **Dado que** un movimiento dejaría al rey propio en jaque o viola reglas de pieza
- **Cuando** se intenta aplicar
- **Entonces** el motor lo rechaza y el tablero no cambia

#### Escenario 1.3: Jaque mate y ahogado

- **Dado que** el bando activo no tiene movimientos legales
- **Cuando** se evalúa el estado
- **Entonces** si está en jaque → mate (derrota de ese bando); si no → ahogado (tablas)

---

### Feature `FEAT-02`: IA rival Fácil / Media

**Descripción:** Rival negro offline. Fácil: profundidad baja + ruido. Media: profundidad mayor + evaluación material/movilidad. Tiempo de respuesta acotado para no congelar UI.

#### Escenario 2.1: Respuesta legal de la IA

- **Dado que** el jugador acaba de mover
- **Cuando** es turno de Negras
- **Entonces** la IA elige un movimiento legal y lo aplica; nunca deja al rey negro en jaque ilegal

#### Escenario 2.2: Selección de dificultad

- **Dado que** el jugador inicia partida rápida
- **Cuando** elige Fácil o Media
- **Entonces** la partida usa esa configuración de IA hasta el final

---

### Feature `FEAT-03`: Campaña Wars (10 batallas)

**Descripción:** Campaña secuencial de 10 batallas. Batallas 1–4 IA Fácil; 5–10 IA Media. Solo la batalla desbloqueada es jugable; ganar desbloquea la siguiente.

#### Escenario 3.1: Desbloqueo

- **Dado que** la batalla N está desbloqueada y el jugador gana (mate al rey negro)
- **Cuando** termina la partida
- **Entonces** se desbloquea N+1 (si N &lt; 10) y se registra victoria

#### Escenario 3.2: Batalla bloqueada

- **Dado que** la batalla K &gt; máxima desbloqueada
- **Cuando** el jugador intenta abrirla
- **Entonces** permanece bloqueada con feedback claro

---

### Feature `FEAT-04`: Tablero interactivo y jugada táctil

**Descripción:** UI de tablero 8×8: tap pieza → highlight casillas legales → tap destino → mover. Indicador de turno, piezas capturadas (opcional HUD), bloqueo de input durante turno IA.

#### Escenario 4.1: Selección y movimiento

- **Dado que** es turno del jugador
- **Cuando** toca una pieza blanca y luego una casilla legal
- **Entonces** se ejecuta el movimiento y se dispara el turno de la IA

#### Escenario 4.2: Cancelar selección

- **Dado que** hay una pieza seleccionada
- **Cuando** toca la misma pieza u otra casilla ilegal no destino
- **Entonces** la selección se limpia o se cambia según reglas UX documentadas en `04`

---

### Feature `FEAT-05`: Home, Cómo jugar, resultados

**Descripción:** Home con CTAs: Partida rápida, Campaña Wars, Cómo jugar. Pantallas de victoria / derrota / tablas con volver a Home o reintentar. Cómo jugar resume reglas básicas V1.

#### Escenario 5.1: Navegación Home

- **Dado que** el usuario abre la app
- **Cuando** pulsa Campaña Wars
- **Entonces** ve la lista/mapa de 10 batallas con estado bloqueado/desbloqueado

#### Escenario 5.2: Fin de partida

- **Dado que** hay mate o tablas
- **Cuando** el motor emite estado terminal
- **Entonces** se muestra pantalla de resultado con acciones claras

---

### Feature `FEAT-06`: Persistencia offline de campaña

**Descripción:** AsyncStorage guarda batalla máxima desbloqueada y contador de victorias. Partida rápida no requiere persistir tablero mid-game en V1 (opcional abandonar = perder progreso de esa partida).

#### Escenario 6.1: Restaurar progreso

- **Dado que** el jugador ganó la batalla 3
- **Cuando** cierra y reabre la app sin red
- **Entonces** la batalla 4 está desbloqueada

---

### Feature `FEAT-07`: Theme Wars + UI coherente

**Descripción:** Identidad visual estratégica (tablero oscuro, acentos belicosos sobrios). Tokens en `theme.ts` según `04-application-design.md`. Sin hex sueltos en componentes.

#### Escenario 7.1: Tokens

- **Dado que** se renderizan pantallas principales
- **Cuando** se inspeccionan estilos
- **Entonces** colores/spacing vienen de tokens documentados

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-08` | Repetición triple / 50 movimientos | `Media` | Tablas avanzadas |
| `FEAT-09` | Jugar Negras / elegir bando | `Media` | V1 fijo Blancas |
| `FEAT-10` | IA Hard / hints de jugada | `Baja` | Fuera de V1 |
| `FEAT-11` | Guardar partida en curso | `Media` | Resume mid-game |

---

## 5. Fuera de Alcance

- Multijugador, reloj competitivo, Stockfish nativo
- iOS, ads, IAP, backend, cuentas
- Variantes de ajedrez
- Análisis de apertura / PGN completo
- Pipeline `design-system/` (V3+)

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Rendimiento** | Smoke engine &lt; 30s; IA Media &lt; 2s tipico por jugada | `npm run smoke` / manual |
| `NFR-02` | **Build** | APK release sin Metro | `scripts/build-apk.sh` |
| `NFR-03` | **Fidelidad visual** | 100% tokens documentados | Revisión `04-application-design.md` |
| `NFR-04` | **Offline** | Flujo completo sin red | Prueba manual |
| `NFR-05` | **Aislamiento** | `src/engine/` sin React | typecheck + review |

---

## 7. Mapeo de UI y Componentes (si aplica)

| Componente UI | Pantalla / Vista | Tokens | Estado mockup |
| :--- | :--- | :--- | :--- |
| `PrimaryButton` | Home | `accent`, `spacing.md` | Wireframe en `04` |
| `BattleList` | Campaña | `surface`, `accent` | Wireframe en `04` |
| `ChessBoard` | Partida | `board.light`, `board.dark`, `piece.*` | Wireframe en `04` |
| `SquareHighlight` | Partida | `legal`, `selected` | Wireframe en `04` |
| `ResultBanner` | Victoria/Derrota | `success`, `danger` | Wireframe en `04` |

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
