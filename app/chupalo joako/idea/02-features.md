# Funcionalidades

## Funcionalidades obligatorias

### Feature 01 — Pozo de juego (playfield)

Área rectangular fija en portrait. Contrato V1:

- **10 columnas × 20 filas visibles** (más 2 filas ocultas de spawn si el motor lo requiere).
- Celdas cuadradas; el pozo no se deforma con el dispositivo (letterbox / escala uniforme).
- Bordes laterales y suelo sólidos; el techo es zona de spawn / top-out.

### Feature 02 — Tetrominós (7 piezas)

Piezas clásicas, cada una con **color llamativo único**:

| Pieza | Forma | Color V1 |
|-------|-------|----------|
| I | palo 4 | Cyan neón `#00F0FF` |
| O | cuadrado 2×2 | Amarillo `#FFE600` |
| T | T | Magenta `#FF2BD6` |
| S | S | Lima `#7CFF00` |
| Z | Z | Rojo `#FF3B30` |
| J | J | Azul `#3B6BFF` |
| L | L | Naranja `#FF8A00` |

- Spawn centrado en la parte superior.
- Randomizer V1: **bolsa de 7** (7-bag): las 7 piezas aparecen una vez por bolsa, orden barajado.

### Feature 03 — Movimiento y rotación

- Mover izquierda / derecha de a 1 celda, con clamp a paredes y colisión con stack.
- Rotar 90° (sentido horario V1; antihorario deseable).
- Wall kick básico: si la rotación choca, intentar 1 celda izquierda y 1 derecha; si falla, no rotar.
- **No** permitir superposición con bloques fijos.

### Feature 04 — Gravedad y caída

- Soft drop: acelera la caída mientras el control está activo.
- Hard drop: fija la pieza en la posición más baja legal de inmediato.
- Lock: al apoyar en el stack/suelo, breve lock delay V1 (**500 ms**) o lock inmediato en hard drop.
- El intervalo de gravedad (**ms por celda**) lo define el **nivel de dificultad**, que depende del **puntaje** (Feature 07).

### Feature 05 — Limpieza de líneas

- Toda fila completa (10 celdas ocupadas) se elimina.
- Las filas superiores caen.
- Varias líneas en el mismo lock se resuelven juntas (single / double / triple / tetris).
- Feedback visual: flash o desaparición breve de la(s) fila(s).

### Feature 06 — Sistema de puntos

Puntos de la **partida actual** (reset a 0 al pulsar Jugar):

| Acción | Puntos |
|--------|--------|
| Soft drop | **1** por celda bajada |
| Hard drop | **2** por celda recorrida |
| 1 línea (single) | **100** |
| 2 líneas (double) | **300** |
| 3 líneas (triple) | **500** |
| 4 líneas (tetris) | **800** |

- El score de la sesión es visible en el HUD en todo momento.
- Al Game Over se compara con high score y se persiste si lo supera.

### Feature 07 — Dificultad por puntaje

La dificultad **no** avanza por número de líneas. Avanza **solo** cuando el puntaje de la partida cruza umbrales.

**Nivel** = `1 + floor(score / 500)`, cap en nivel **10**.

| Nivel | Puntaje mínimo | Gravedad (ms / celda) |
|-------|----------------|------------------------|
| 1 | 0 | 800 |
| 2 | 500 | 650 |
| 3 | 1000 | 520 |
| 4 | 1500 | 400 |
| 5 | 2000 | 300 |
| 6 | 2500 | 220 |
| 7 | 3000 | 160 |
| 8 | 3500 | 120 |
| 9 | 4000 | 90 |
| 10 | 4500+ | 70 |

- El nivel actual se muestra en el HUD.
- Al cruzar umbral, la gravedad cambia **en la siguiente celda de caída** (no rewind de pieza).
- Soft drop V1: usar `min(gravedadActual, 50 ms)` mientras el control está activo.

### Feature 08 — High score local

- Persistencia local del máximo puntaje.
- Visible en Menú y en Game Over.
- Sin rankings online.

### Feature 09 — Preview de siguiente pieza

- Mostrar la **próxima** pieza del bag (1 pieza) junto al pozo, con el mismo color llamativo.
- No revela más de 1 pieza en V1.

### Feature 10 — Game Over (top-out)

- Si la pieza nueva no puede colocarse en la posición de spawn → **Game Over**.
- No hay sistema de vidas en V1: una sola run hasta top-out.
- Pantalla Game Over: score, high score, Reintentar / Menú.

### Feature 11 — Menú principal (arcade llamativo)

Pantalla de menú con jerarquía clara:

1. Título / marca **Chupalo joako** hero.
2. Subtítulo corto: “Tetris. Colores. Puntos. Velocidad.”
3. CTA primario: **Jugar**.
4. High score visible.
5. Secundario: **Cómo jugar** (controles y reglas en 4–5 líneas).
6. Paleta saturada / neón sobre fondo oscuro; **sin** clutter de cards ni badges flotantes.

### Feature 12 — Pantallas de partida

1. **Game** — pozo, pieza activa, stack, preview, HUD (score, nivel, high score de referencia opcional).
2. **Pausa** — overlay; el juego no avanza; Reanudar / Menú.
3. **Game Over** — score, high score, Reintentar / Menú.
4. **Cómo jugar** — desde el menú.

### Feature 13 — Controles táctiles

V1 portrait, zona inferior o lateral al pozo:

- Izquierda / derecha (botones o zonas; repeat al mantener ~200 ms luego cada ~80 ms).
- Rotar (botón).
- Soft drop (mantener abajo).
- Hard drop (botón o swipe rápido hacia abajo).
- Pausa (icono discreto).

Área táctil mínima ≥ 44 dp.

### Feature 14 — 100% offline

Sin red, sin cuentas, sin analytics remotos, sin anuncios.

### Feature 15 — Persistencia local

Guardar al menos: `highScore` (número). Clave sugerida: `chupalo-joako:v1:highScore`.

### Feature 16 — Feedback básico

- Piezas con color saturado sólido + borde oscuro para contraste.
- Flash al limpiar líneas.
- HUD: score y nivel siempre visibles.
- Opcional V1: ghost piece (silueta de aterrizaje) — si entra en el mismo sprint, sí; no bloquea DoD si el tiempo aprieta (marcada deseable si se recorta).

### Feature 17 — APK Release (BUILD)

App nativa Android generada con pipeline WIKA (Expo prebuild + release), instalable sin Metro.

---

## Funcionalidades deseables

### Feature 18 — Ghost piece

Silueta de la pieza en la fila de aterrizaje.

### Feature 19 — Hold / reserva

Guardar una pieza y intercambiar (una vez por lock).

### Feature 20 — Rotación antihoraria + SRS wall kicks

Kick table más completa.

### Feature 21 — Sonidos / hápticos

Beep al rotar, lock, línea, tetris, level-up por puntaje.

### Feature 22 — Combo / back-to-back

Bonus si se limpian líneas en locks consecutivos.

---

## Fuera de alcance (V1)

- iOS
- Multijugador / online / leaderboards cloud
- Modo sprint / ultra / battle
- Vidas / continues
- Dificultad por número de líneas (el contrato es **por puntaje**)
- Tienda, IAP, anuncios
- Cuentas de usuario
- Landscape obligatorio
- Motor 3D
- Clon de assets o marca Tetris® (The Tetris Company)
