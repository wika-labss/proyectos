---
id: "FEAT-001"
title: "Especificación de Requerimientos — Murdoku"
status: "BORRADOR"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-24"
updated_at: "2026-08-24"
audit_1_passed: false
audit_2_passed: false
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y este documento.  
> **Equivalencia:** Auditoría de Documentación → `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Murdoku`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `PENDIENTE_AUDITORIA_DOCUMENTACION`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01`, `ERR-06` | Motor Murdoku (colocar, validar, resolver) | `Crítica` | `mod-murdoku-engine` |
| `FEAT-02` | `ERR-02` | Catálogo de piezas del crimen | `Crítica` | `mod-crime-pieces` |
| `FEAT-03` | `ERR-03` | Modos de tablero 4×4 / 6×6 / 9×9 | `Crítica` | `mod-board-sizes` |
| `FEAT-04` | `ERR-04` | Campaña de habitaciones + desbloqueo | `Crítica` | `mod-room-campaign` |
| `FEAT-05` | `ERR-05` | Ambientación y pistas ligeras por habitación | `Alta` | `mod-room-flavor` |
| `FEAT-06` | `ERR-06` | Feedback de conflicto (fila / columna / región) | `Crítica` | `mod-murdoku-engine`, `mod-investigation-ui` |
| `FEAT-07` | `ERR-07` | Persistencia offline de progreso | `Crítica` | `mod-offline-progress` |
| `FEAT-08` | `ERR-08` | UI de investigación (home, mapa, tablero, victoria) | `Crítica` | `mod-investigation-ui` |
| `FEAT-09` | `ERR-09` | APK Release sin Metro | `Crítica` | `mod-android-release` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Motor Murdoku

**Descripción:** Lógica pura de puzzle: tablero N×N, celdas vacías o con pieza, colocación/retiro, detección de conflictos y victoria cuando el tablero está completo y válido. Cada puzzle V1 tiene **solución única**.

**Reglas V1:**

| Tamaño | Unicidad fila | Unicidad columna | Regiones (cajas) |
|--------|---------------|------------------|------------------|
| 4×4 | Sí | Sí | 2×2 (obligatorio) |
| 6×6 | Sí | Sí | 2×3 (obligatorio) |
| 9×9 | Sí | Sí | 3×3 (obligatorio) |

**Símbolos:** exactamente N piezas distintas del catálogo (`FEAT-02`) para tablero N×N.

#### Escenario 1.1: Flujo exitoso (Happy Path)

- **Dado que** `el jugador tiene un puzzle 4×4 parcialmente relleno con pistas fijas`
- **Cuando** `completa todas las celdas sin conflictos de fila, columna ni región`
- **Entonces** `el motor marca `solved: true` y emite victoria`

#### Escenario 1.2: Manejo de errores

- **Dado que** `una colocación genera duplicado en fila, columna o región`
- **Cuando** `se evalúa el tablero`
- **Entonces** `la celda/conflicto queda marcado; `solved` permanece false; no hay crash`

---

### Feature `FEAT-02`: Catálogo de piezas del crimen

**Descripción:** En lugar de dígitos, cada símbolo es un **elemento narrativo** con `id`, `kind` y presentación visual.

**Kinds V1:**

| `kind` | Rol | Notas |
|--------|-----|-------|
| `victim` | Víctima | Exactamente 1 identidad por puzzle; ficha especial |
| `suspect` | Sospechoso | Varios; cada uno con nombre/etiqueta única |
| `killer` | Asesino | Exactamente 1 identidad por puzzle; pieza clave |

Para N=4: 1 víctima + 2 sospechosos + 1 asesino (ejemplo).  
Para N=6 / N=9: se amplía el set de sospechosos hasta completar N identidades únicas.  
**Regla de juego:** cada identidad aparece **exactamente una vez** por fila, columna y región (equivalente al dígito 1…N del Sudoku).

#### Escenario 2.1: Flujo exitoso

- **Dado que** `el puzzle carga su `pieceSet` de tamaño N`
- **Cuando** `el jugador abre el selector de piezas`
- **Entonces** `ve víctima, sospechosos y asesino con icono/etiqueta distintos`

#### Escenario 2.2: Manejo de errores

- **Dado que** `un puzzle define menos o más de N piezas, o 0 víctimas / 0 asesinos`
- **Cuando** `el engine valida el catálogo del nivel`
- **Entonces** `falla en smoke/load con error explícito; no arranca partida corrupta`

---

### Feature `FEAT-03`: Modos de tablero (básico / avanzado)

**Descripción:**

- **Modo básico:** tableros 4×4 y 6×6 para introducir la mecánica.
- **Modo avanzado:** tableros 9×9 con más sospechosos y complejidad.

El mapa de habitaciones asigna tamaño por nivel (p. ej. primeras habitaciones 4×4, luego 6×6, luego 9×9).

#### Escenario 3.1: Flujo exitoso

- **Dado que** `el jugador elige una habitación de modo básico`
- **Cuando** `entra a jugar`
- **Entonces** `el tablero es 4×4 o 6×6 según el nivel, con regiones correctas`

#### Escenario 3.2: Manejo de errores

- **Dado que** `un nivel declara tamaño no soportado (p. ej. 5×5)`
- **Cuando** `se carga`
- **Entonces** `se rechaza el nivel en smoke; no se muestra tablero inválido`

---

### Feature `FEAT-04`: Campaña de habitaciones + desbloqueo

**Descripción:** Cada nivel es una **habitación** de la mansión/edificio. V1 mínimo:

| Orden | Habitación | Ambientación (resumen) | Tamaño sugerido |
|-------|------------|------------------------|-----------------|
| 1 | Biblioteca | Estanterías, libros | 4×4 |
| 2 | Cocina | Utensilios, manchas | 4×4 o 6×6 |
| 3 | Sótano | Oscuro, cajas, herramientas | 6×6 |
| 4 | Jardín | Huellas, objetos enterrados | 9×9 |

Al resolver un escenario se desbloquea el siguiente. Habitaciones bloqueadas no son jugables.

#### Escenario 4.1: Flujo exitoso

- **Dado que** `Biblioteca está resuelta`
- **Cuando** `el jugador vuelve al mapa`
- **Entonces** `Cocina aparece desbloqueada y se puede iniciar`

#### Escenario 4.2: Manejo de errores

- **Dado que** `Sótano sigue bloqueado`
- **Cuando** `el jugador intenta abrirlo`
- **Entonces** `ve estado bloqueado / mensaje; no entra al tablero`

---

### Feature `FEAT-05`: Ambientación y pistas ligeras

**Descripción:** Cada habitación aporta atmósfera detectivesca sin novela larga: título, 1–2 líneas de flavor (pista o diálogo breve) y skin de fondo/tokens asociados. No altera las reglas del motor salvo el `pieceSet` y el puzzle.

#### Escenario 5.1: Flujo exitoso

- **Dado que** `el jugador entra a la Cocina`
- **Cuando** `se muestra la intro del caso`
- **Entonces** `ve nombre de habitación + texto corto de pista y el tablero con skin coherente`

#### Escenario 5.2: Empty / fallback

- **Dado que** `falta el texto de flavor de un nivel`
- **Cuando** `carga la partida`
- **Entonces** `usa fallback genérico (“Investiga la escena”) y no crashea`

---

### Feature `FEAT-06`: Feedback de conflicto

**Descripción:** Al colocar una pieza, si hay duplicado en fila, columna o región, se resalta la celda conflictiva (y opcionalmente las celdas en conflicto). La victoria exige cero conflictos y tablero lleno.

#### Escenario 6.1: Flujo exitoso

- **Dado que** `el jugador coloca una pieza válida`
- **Cuando** `se valida`
- **Entonces** `no hay highlight de error; puede continuar`

#### Escenario 6.2: Conflicto

- **Dado que** `el asesino ya está en la columna 3`
- **Cuando** `se coloca el mismo asesino en otra fila de la columna 3`
- **Entonces** `ambas celdas (o la nueva) muestran estado error; no se puede “resolver caso”`

---

### Feature `FEAT-07`: Persistencia offline

**Descripción:** Guarda en dispositivo: habitaciones desbloqueadas, resueltas, y opcionalmente borrador de tablero en curso. 100% offline (AsyncStorage).

#### Escenario 7.1: Flujo exitoso

- **Dado que** `el jugador resolvió Biblioteca y cierra la app`
- **Cuando** `la reabre`
- **Entonces** `Biblioteca sigue resuelta y Cocina desbloqueada, sin red`

#### Escenario 7.2: Manejo de errores

- **Dado que** `el storage está corrupto`
- **Cuando** `arranca la app`
- **Entonces** `empty state seguro + opción de reiniciar progreso (confirmación destructiva)`

---

### Feature `FEAT-08`: UI de investigación

**Descripción:** Pantallas V1: Home → Mapa de habitaciones → Intro de caso → Tablero (selector de piezas + grid) → Victoria / Derrota no aplica (solo resolver o salir). Controles: seleccionar pieza, tocar celda, borrar celda, comprobar / auto-detectar victoria.

#### Escenario 8.1: Flujo exitoso

- **Dado que** `el usuario abre la app`
- **Cuando** `elige Jugar → habitación desbloqueada → coloca piezas hasta completar`
- **Entonces** `ve pantalla de caso resuelto y CTA al mapa`

#### Escenario 8.2: Primer uso

- **Dado que** `no hay progreso`
- **Cuando** `abre el mapa`
- **Entonces** `solo Biblioteca (o primera habitación) está desbloqueada`

---

### Feature `FEAT-09`: APK Release sin Metro

**Descripción:** Entregable nativo Android según pipeline WIKA, instalable por sideload.

#### Escenario 9.1: Flujo exitoso

- **Dado que** `toolchain WIKA (JDK 17, SDK) está listo`
- **Cuando** `se ejecuta el pipeline APK`
- **Entonces** `existe APK release que arranca Home → mapa → partida`

#### Escenario 9.2: Manejo de errores

- **Dado que** `falta JDK o falla prebuild`
- **Cuando** `corre verify/apk`
- **Entonces** `falla de forma explícita; no APK a medias`

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-10` | Retos con coartadas (restricciones extra de posición) | `Alta` | Reglas adicionales por sospechoso |
| `FEAT-11` | Más habitaciones (salón, ático, invernadero…) | `Alta` | Extiende campaña |
| `FEAT-12` | Pista / hint de una celda | `Media` | Similar a hint idle de match-3 |
| `FEAT-13` | Notas a lápiz en celdas | `Media` | UX Sudoku clásica |
| `FEAT-14` | Generador procedural con solución única | `Media` | Fuera de catálogo fijo |
| `FEAT-15` | Audio ambiente / SFX detectivesco | `Baja` | Post-V1 |
| `FEAT-16` | Diarios / dossier desbloqueable | `Baja` | Narrativa extendida |

---

## 5. Fuera de Alcance

- iOS, landscape obligatorio, cuentas, backend, ads, IAP, multijugador.
- Novela visual / diálogos largos / branching.
- Coartadas y reglas especiales (FEAT-10) en V1.
- Editor de puzzles para el usuario final.
- Contenido sangriento gráfico explícito (mantener misterio cartoon / noir estilizado).

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Rendimiento** | Engine smoke &lt; 30s | `npm run verify` |
| `NFR-02` | **Build** | APK release sin Metro | `scripts/build-apk.sh` |
| `NFR-03` | **Fidelidad visual** | 100% tokens en theme; 0% hex en UI | Revisión `04` + código |
| `NFR-04` | **Offline** | Flujo Home→mapa→partida sin red | Prueba manual / smoke |
| `NFR-05` | **Corrección** | Todo puzzle V1 con solución única | Smoke `validatePuzzle` |
| `NFR-06` | **Touch** | Celdas / piezas ≥ 44 dp | QA visual |
| `NFR-07` | **Privacidad** | Sin red ni analytics | Dependencias / manifest |

---

## 7. Mapeo de UI y Componentes (si aplica)

| Componente UI | Pantalla / Vista | Tokens | Estado mockup |
| :--- | :--- | :--- | :--- |
| `PrimaryButton` | Home, victoria | `accent`, `spacing.md` | `PENDIENTE` (ASCII en 04) |
| `RoomMap` | Mapa habitaciones | `surface`, `border`, `textMuted` | `PENDIENTE` |
| `RoomCard` | Mapa | `surface`, `accent` si unlock | `PENDIENTE` |
| `FlavorBanner` | Intro / HUD | `text`, `textMuted` | `PENDIENTE` |
| `CrimeBoard` | Tablero | `surface`, `border`, `error` | `PENDIENTE` |
| `PieceTray` | Tablero | `accent`, `spacing.sm` | `PENDIENTE` |
| `ConflictCell` | Tablero | `error` | `PENDIENTE` |
| `VictoryPanel` | Post-caso | `accent`, `surface` | `PENDIENTE` |

---

## 8. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist

- [x] Frontmatter YAML vinculado a `PROB-001`.
- [x] RTM 1:1 con IDs `ERR-XX` de `01-problem.md`.
- [x] Escenarios BDD por feature obligatoria.
- [x] NFRs con métricas verificables.
- [x] Deseables y fuera de alcance diferenciados.
- [ ] `audits/auditoria-documentacion.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha:** `YYYY-MM-DD`
- **audit_1_passed:** `false` → `true` al aprobar
