# Funcionalidades

## Funcionalidades obligatorias

### Feature 01 — Tablero Snake (grilla)

Área de juego rectangular en grilla. La serpiente ocupa celdas consecutivas (cabeza + cuerpo). Una pelotita ocupa una celda libre. El tablero no se desplaza (viewport fijo).

### Feature 02 — Movimiento continuo

La serpiente avanza automáticamente a intervalo fijo (tick). El jugador solo cambia dirección (arriba / abajo / izquierda / derecha). No se permite giro de 180° inmediato (no invertir hacia el segmento siguiente).

### Feature 03 — Pelotitas y crecimiento

- En todo momento hay **exactamente 1 pelotita** en el tablero (salvo frame de respawn).
- Al comer una pelotita: la serpiente **crece +1 segmento** y aparece una nueva pelotita en celda libre aleatoria.
- Si no hay celdas libres (tablero lleno) → victoria / fin especial documentado en diseño (V1: Game Over como “tablero completo” o pantallazo de victoria corta).

### Feature 04 — Sistema de 3 vidas

- Cada partida nueva comienza con **3 vidas**.
- Condiciones de pérdida de vida:
  - Choque con borde del tablero.
  - Choque de la cabeza con el propio cuerpo.
- Al perder una vida (si quedan > 0):
  - Se detiene el tick brevemente.
  - Se reinicia la serpiente a posición/longitud inicial.
  - Se respawnea 1 pelotita.
  - El **tiempo vivo / score de la partida continúa** (no se reinicia el contador de puntaje de la sesión).
- Al llegar a **0 vidas** → Game Over.

### Feature 05 — Puntaje por tiempo vivo

- El puntaje de la partida es función del **tiempo vivo** mientras el juego está en estado `playing` (no en pausa, no en pantalla entre vidas si se elige freeze; ver diseño).
- Regla V1 (explícita):
  - `score = floor(segundos_vivos * 10)` (10 puntos por segundo vivo).
  - El score **sube solo con el tiempo**; comer pelotitas **no suma puntos directos** (sí aumenta dificultad al crecer).
- Al Game Over se compara con el high score local y se actualiza si es mayor.

### Feature 06 — Máximo puntaje (high score)

- Persistencia local del máximo puntaje alcanzado.
- Visible en Home y en pantalla de Game Over.
- Sin rankings online.

### Feature 07 — Controles táctiles

Una de estas dos opciones (definir en diseño; V1 recomienda **D-pad on-screen**):

| Opción | Descripción |
|--------|-------------|
| A (V1) | Botones dirección (↑ ↓ ← →) en zona inferior |
| B | Swipe sobre el tablero |

Anti-doble-input: encolar como máximo 1 cambio de dirección por tick.

### Feature 08 — Pantallas mínimas

1. **Home** — título Alvaro / Snake, high score, botón Jugar.
2. **Game** — tablero, vidas, score en vivo, controles.
3. **Game Over** — score final, high score, Reintentar / Home.

### Feature 09 — 100% offline

Sin red, sin cuentas, sin analytics remotos, sin anuncios.

### Feature 10 — Persistencia local

Guardar al menos: `highScore` (número). Opcional V1: último score (no obligatorio).

### Feature 11 — Feedback básico

- Actualización visual inmediata al comer (crecimiento + nueva pelotita).
- Indicador claro de vidas restantes (p. ej. ❤️×3 o “Vidas: 3”).
- Score visible en tiempo real durante la partida.

### Feature 12 — APK Release (BUILD)

App nativa Android generada con pipeline WIKA (Expo prebuild + release), instalable sin Metro.

---

## Funcionalidades deseables

### Feature 13 — Pausa

Botón pausa / reanudar (el tiempo vivo no corre en pausa).

### Feature 14 — Velocidad creciente

Aumentar velocidad (reducir intervalo de tick) cada N pelotitas comidas.

### Feature 15 — Sonidos / hápticos

Beep o vibración al comer / al perder vida.

### Feature 16 — Temas visuales

Paletas alternativas (retro LCD, neon, etc.).

---

## Fuera de alcance (V1)

- iOS
- Multijugador / online / leaderboards cloud
- Power-ups, obstáculos móviles, laberintos
- Tienda, IAP, anuncios
- Cuentas de usuario
- Modo landscape obligatorio
- Editor de mapas
