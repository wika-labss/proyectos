# Funcionalidades

## Funcionalidades obligatorias

### Feature 01 — Tablero Sudoku 9×9

Grilla interactiva 9×9 con celdas fijas (pistas) y celdas editables. Bordes negros; números en negro sobre fondo blanco.

### Feature 02 — 20 niveles progresivos

Exactamente 20 niveles. El nivel 1 inicia desbloqueado; completar un nivel desbloquea el siguiente. Los niveles desbloqueados pueden rejugarse.

### Feature 03 — Aviso de errores al jugador

Al colocar un número inválido o en conflicto (fila, columna o bloque 3×3), el error se muestra al jugador en **rojo**. No debe usarse rojo para otros estados.

### Feature 04 — Puntaje

Sistema de puntaje visible durante y/o al completar la partida. El puntaje se asocia al progreso del jugador y se persiste localmente.

### Feature 05 — 100% offline

La app es totalmente jugable sin conexión. Sin backend, sin APIs externas de puzzles, sin cuenta.

### Feature 06 — Reinicio de nivel

El jugador puede reiniciar el nivel en curso y volver a empezar ese puzzle/nivel sin salir de la app.

### Feature 07 — Pantalla de inicio con marca de agua VISSIUSS

Pantalla de inicio que muestra marca de agua / logo VISSIUSS. Recurso oficial: `idea/assets/vissiuss-logo.png`.

### Feature 08 — Mensaje de ganador por nivel

Al completar un nivel se muestra exactamente:

```text
muy bien culiaitoo
```

seguido de **un signo de exclamación por cada número de nivel**:

| Nivel | Mensaje |
|-------|---------|
| 1 | `muy bien culiaitoo!` |
| 2 | `muy bien culiaitoo!!` |
| 3 | `muy bien culiaitoo!!!` |
| … | … |
| 20 | `muy bien culiaitoo` + 20 signos `!` |

### Feature 09 — Identidad visual blanco / negro / rojo

- Fondo: blanco
- Letras: negras
- Celdas: bordes negros
- Números: negros
- Errores: rojo

### Feature 10 — Persistencia local

Guardar progreso de niveles, puntaje y partida relevante en el dispositivo entre sesiones.

---

## Funcionalidades deseables

### Feature 11 — Temporizador por partida

Cronómetro opcional por nivel.

### Feature 12 — Deshacer movimiento

Revertir el último número colocado.

### Feature 13 — Pistas limitadas

Revelar un número correcto con límite por nivel.

### Feature 14 — Notas / candidatos

Modo lápiz para marcar posibles números en una celda.

---

## Fuera de alcance

- iOS u otras plataformas (v1 solo Android)
- Multijugador / online
- Rankings globales
- Cuentas de usuario / autenticación
- Anuncios o compras in-app
- Variantes de Sudoku (Killer, Hyper, Samurai, etc.)
- Backend o sincronización en la nube
- Temas de color distintos al esquema blanco/negro/rojo-errores en v1
