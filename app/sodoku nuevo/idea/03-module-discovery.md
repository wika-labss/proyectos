# Descubrimiento de Módulos

Objetivo:
Identificar las capacidades necesarias para implementar las funcionalidades definidas en el proyecto.

---

## Módulo

### Nombre

sudoku-engine

### Responsabilidad

Generar, validar y resolver puzzles Sudoku 9×9 con solución única; detectar conflictos de fila/columna/bloque.

### Funcionalidades asociadas

- Feature 01 — Tablero Sudoku 9×9
- Feature 03 — Aviso de errores al jugador
- Feature 05 — 100% offline (sin API de puzzles)

### Entradas

- Nivel / dificultad
- Tablero parcial
- Movimiento (fila, columna, valor)

### Salidas

- Puzzle + solución
- Resultado de validación (válido / conflicto)
- Estado de completitud del tablero

### Dependencias

- Ninguna de red
- Tipado de tablero compartido con UI

### Reutilizable

Sí

### Observaciones

Motor puro, independiente de UI y de almacenamiento.

**V2 — calidad de puzzles (obligatorio):**

- Todo puzzle debe pasar `validatePuzzle()` → `countSolutions === 1`.
- No entregar fallbacks sin unicidad.
- Gate: `npm run validate:levels` genera/valida niveles 1–20 antes de release.

---

## Módulo

### Nombre

hints

### Responsabilidad

Otorgar hasta **3 pistas por nivel**: revelar el valor correcto de una celda vacía y marcarla como fija en la partida.

### Funcionalidades asociadas

- Feature 12 — Pistas de ayuda: 3 por nivel

### Entradas

- Tablero actual, solución, givens, pistas restantes, celda seleccionada (opcional)

### Salidas

- Celda revelada + pistas restantes decrementadas
- Estado deshabilitado si pistas = 0

### Dependencias

- sudoku-engine (solución)
- sudoku-board (aplicar valor)

### Reutilizable

Sí

### Observaciones

Al reiniciar nivel, pistas = 3.

---

## Módulo

### Nombre

sudoku-board

### Responsabilidad

Renderizar e interactuar con la grilla 9×9 (selección de celda, entrada numérica, bordes, estados visuales).

### Funcionalidades asociadas

- Feature 01 — Tablero Sudoku 9×9
- Feature 03 — Aviso de errores (números/celdas en rojo)
- Feature 09 — Identidad visual blanco / negro / rojo

### Entradas

- Estado del tablero
- Celda seleccionada
- Indicadores de error
- Tokens de tema

### Salidas

- Eventos de selección / colocación / borrado

### Dependencias

- sudoku-engine (validación)
- app-theme (colores)

### Reutilizable

Sí (UI de tablero Sudoku)

### Observaciones

No calcula reglas de Sudoku; delega en `sudoku-engine`.

---

## Módulo

### Nombre

level-progression

### Responsabilidad

Gestionar exactamente 20 niveles, desbloqueo secuencial, rejugabilidad y reinicio del nivel en curso.

### Funcionalidades asociadas

- Feature 02 — 20 niveles progresivos
- Feature 06 — Reinicio de nivel

### Entradas

- Nivel actual
- Evento de victoria / reinicio

### Salidas

- Lista de niveles con estado (bloqueado / desbloqueado / completado)
- Nivel activo / puzzle regenerado al reiniciar

### Dependencias

- sudoku-engine (nuevo puzzle al iniciar/reiniciar)
- local-storage (persistir desbloqueos)

### Reutilizable

Sí (patrón de progresión por niveles)

### Observaciones

—

---

## Módulo

### Nombre

scoring

### Responsabilidad

Calcular, mostrar y acumular puntaje del jugador.

### Funcionalidades asociadas

- Feature 04 — Puntaje
- Feature 10 — Persistencia local (puntaje)

### Entradas

- Eventos de juego (movimiento válido, error, victoria, reinicio)

### Salidas

- Puntaje de partida
- Puntaje acumulado / por nivel

### Dependencias

- local-storage

### Reutilizable

Sí

### Observaciones

Reglas de cálculo deben ser deterministas y locales.

---

## Módulo

### Nombre

local-storage

### Responsabilidad

Persistencia local de progreso, puntaje y partida relevante en el dispositivo.

### Funcionalidades asociadas

- Feature 05 — 100% offline
- Feature 10 — Persistencia local

### Entradas

- Clave / valor (progreso, settings de partida, puntaje)

### Salidas

- Datos restaurados al iniciar la app

### Dependencias

- Almacenamiento local del dispositivo (sin red)

### Reutilizable

Sí

### Observaciones

Capacidad transversal WIKA; sin backend.

---

## Módulo

### Nombre

home-branding

### Responsabilidad

Pantalla de inicio con marca de agua / logo VISSIUSS.

### Funcionalidades asociadas

- Feature 07 — Pantalla de inicio con marca de agua VISSIUSS
- Feature 13 — Home con iconos de progreso (puntaje, histórico, completados)

### Entradas

- Asset de logo (`idea/assets/vissiuss-logo.png`)
- Puntaje total, histórico local, niveles completados

### Salidas

- Pantalla de inicio renderizada con iconos de progreso
- Navegación hacia selección de nivel / continuar / histórico

### Dependencias

- app-theme
- Asset VISSIUSS

### Reutilizable

Parcial (patrón de home con marca; asset específico VISSIUSS)

### Observaciones

—

---

## Módulo

### Nombre

victory-feedback

### Responsabilidad

Mostrar el mensaje de victoria por nivel con la regla de signos de exclamación.

### Funcionalidades asociadas

- Feature 08 — Mensaje de ganador por nivel

### Entradas

- Número de nivel completado (1–20)

### Salidas

- Texto: `muy bien culiaitoo` + N signos `!` (N = nivel)
- Acciones: siguiente nivel / repetir / inicio

### Dependencias

- level-progression
- scoring (mostrar puntaje en victoria, opcional)

### Reutilizable

Parcial (regla de mensaje es específica del producto)

### Observaciones

Fórmula: `mensaje = "muy bien culiaitoo" + ("!" * nivel)`.

---

## Módulo

### Nombre

app-theme

### Responsabilidad

Tokens visuales obligatorios: fondo blanco, letras/números negros, bordes negros, errores en rojo.

### Funcionalidades asociadas

- Feature 09 — Identidad visual blanco / negro / rojo

### Entradas

- Tokens de color / tipografía

### Salidas

- Tema aplicado a pantallas y tablero

### Dependencias

- Ninguna

### Reutilizable

Sí (tema de alto contraste)

### Observaciones

Rojo exclusivo para errores.

---

## Mapeo Feature → Módulos

| Feature | Módulos |
|---------|---------|
| 01 Tablero 9×9 | sudoku-board, sudoku-engine |
| 02 20 niveles | level-progression |
| 03 Errores en rojo | sudoku-engine, sudoku-board, app-theme |
| 04 Puntaje | scoring, home-branding |
| 05 Offline | local-storage, sudoku-engine |
| 06 Reinicio | level-progression |
| 07 Home VISSIUSS | home-branding |
| 08 Mensaje ganador | victory-feedback |
| 09 Visual B/N/R | app-theme, sudoku-board |
| 10 Persistencia | local-storage, scoring, level-progression |
| 11 Motor solución única (V2) | sudoku-engine |
| 12 Pistas ×3 (V2) | hints, sudoku-board, sudoku-engine |
| 13 Home iconos progreso (V2) | home-branding, scoring, level-progression, local-storage |
| 14–16 Deseables | Fuera de V2 obligatoria |
