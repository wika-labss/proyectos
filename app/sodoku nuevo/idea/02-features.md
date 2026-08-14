# Funcionalidades

## Funcionalidades obligatorias

### Feature 01 — Tablero Sudoku 9×9

Grilla interactiva 9×9 con celdas fijas (pistas iniciales del puzzle) y celdas editables. Bordes negros; números en negro sobre fondo blanco.

### Feature 02 — 20 niveles progresivos

Exactamente 20 niveles. El nivel 1 inicia desbloqueado; completar un nivel desbloquea el siguiente. Los niveles desbloqueados pueden rejugarse.

### Feature 03 — Aviso de errores al jugador

Al colocar un número inválido o en conflicto (fila, columna o bloque 3×3), el error se muestra al jugador en **rojo**. No debe usarse rojo para otros estados.

### Feature 04 — Puntaje

Sistema de puntaje visible en partida y en home (icono). Persistido localmente.

### Feature 05 — 100% offline

La app es totalmente jugable sin conexión. Sin backend, sin APIs externas de puzzles, sin cuenta.

### Feature 06 — Reinicio de nivel

El jugador puede reiniciar el nivel en curso y volver a empezar ese puzzle/nivel sin salir de la app.

### Feature 07 — Pantalla de inicio con marca de agua VISSIUSS

Pantalla de inicio con marca de agua / logo VISSIUSS. Recurso: `idea/assets/vissiuss-logo.png`.

### Feature 08 — Mensaje de ganador por nivel

Al completar un nivel: `muy bien culiaitoo` + un `!` por cada número de nivel (nivel 1 → 1 signo, …, nivel 20 → 20 signos).

### Feature 09 — Identidad visual blanco / negro / rojo

- Fondo: blanco
- Letras: negras
- Celdas: bordes negros
- Números: negros
- Errores: rojo

### Feature 10 — Persistencia local

Guardar progreso de niveles, puntaje, histórico local y partida relevante entre sesiones.

### Feature 11 — Motor de puzzles con solución única (V2)

Todo puzzle entregado al jugador debe:

1. Ser un Sudoku 9×9 válido.
2. Tener **exactamente una solución**.
3. Ser resoluble (al menos una solución existe; y no más de una).

Reglas del motor:

- Generación + verificación `countSolutions === 1` **obligatoria**.
- **Prohibido** entregar fallbacks sin verificar unicidad.
- Si no se alcanza el target de pistas iniciales manteniendo unicidad, se acepta un puzzle con **más pistas** siempre que conserve solución única.
- Validar los 20 niveles (script/gate) antes de considerar V2 lista.

### Feature 12 — Pistas de ayuda: 3 por nivel (V2)

En cada partida de nivel el jugador tiene **exactamente 3 pistas**.

- Una pista revela el número correcto de una celda vacía (seleccionada si aplica, o la primera vacía).
- La celda revelada queda como valor fijo de la partida (no editable).
- Al agotar las 3, el botón de pista se deshabilita.
- Al reiniciar el nivel, el contador de pistas vuelve a 3.

### Feature 13 — Home con iconos de progreso (V2)

La pantalla principal muestra, además del CTA Jugar y la marca VISSIUSS:

| Icono / bloque | Contenido |
|----------------|-----------|
| Puntaje | Puntaje total acumulado |
| Histórico | Historial local de partidas/victorias (resumen persistido) |
| Completados | Cantidad / listado de niveles completados |

---

## Funcionalidades deseables

### Feature 14 — Temporizador por partida

Cronómetro opcional por nivel.

### Feature 15 — Deshacer movimiento

Revertir el último número colocado.

### Feature 16 — Notas / candidatos

Modo lápiz para marcar posibles números en una celda.

---

## Fuera de alcance

- iOS u otras plataformas (solo Android)
- Multijugador / online
- Rankings globales
- Cuentas de usuario / autenticación
- Anuncios o compras in-app
- Variantes de Sudoku (Killer, Hyper, Samurai, etc.)
- Backend o sincronización en la nube
- Temas distintos al esquema blanco/negro/rojo-errores
