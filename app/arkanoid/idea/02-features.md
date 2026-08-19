# Funcionalidades

## Funcionalidades obligatorias

### Feature 01 — Campo de juego (área fija)

Área rectangular fija (viewport portrait). Contiene:

- **Pala** en la franja inferior.
- **Bola** en movimiento continuo mientras el estado es `playing`.
- **Muro de ladrillos** en la zona superior (filas × columnas).
- Bordes izquierdo, derecho y superior sólidos (rebote); borde inferior = pérdida de bola.

### Feature 02 — Pala (paddle)

- Control táctil: arrastre horizontal en la zona de juego / pala.
- La pala no sale de los límites laterales.
- Al lanzar (inicio de vida o nivel): la bola puede partir desde la pala o con un toque “Launch”.
- Ángulo de rebote clásico: el punto de impacto en la pala altera la dirección horizontal de la bola (borde izquierdo → más a la izquierda, centro → más vertical, borde derecho → más a la derecha).

### Feature 03 — Bola y rebotes (reglas clásicas)

- Velocidad constante por nivel (o ligeramente creciente por nivel; V1: constante dentro del nivel).
- Rebote elástico en paredes laterales y techo.
- Rebote en pala según Feature 02.
- Colisión con ladrillo → destruye el ladrillo (si es de 1 hit) y rebota.
- Si la bola cruza el borde inferior → pérdida de vida.

### Feature 04 — Ladrillos

- Grid de ladrillos (V1 sugerido: 8 columnas × 5–6 filas, configurable por nivel).
- Tipos V1:
  - **Normal (1 hit):** se destruye al primer impacto.
  - **Resistente (2 hits):** opcional en niveles ≥ 2 (cambiar color al primer golpe).
- Al destruir todos los ladrillos del nivel → **nivel completado**.

### Feature 05 — Sistema de 3 vidas

- Cada partida nueva comienza con **3 vidas**.
- Perder la bola (borde inferior) → vidas − 1.
- Si quedan vidas > 0: reset de pala/bola en posición inicial; ladrillos restantes se mantienen.
- A **0 vidas** → Game Over.

### Feature 06 — Niveles

- V1: al menos **3 niveles** con layouts distintos (más ladrillos / filas / resistentes).
- Completar nivel → pantalla breve de victoria de nivel → siguiente nivel (vidas se conservan).
- Completar el último nivel **y derrotar al jefe** → victoria de partida (WIN) + actualización de high score.

### Feature 20 — Jefe (V2)

- Tras 3 niveles de ladrillos, el nivel 4 es un **jefe** móvil.
- El jefe patrulla horizontalmente, rebota en laterales y requiere **8 impactos**.
- Derrotar al jefe otorga **1000** pts y abre la pantalla **WIN**.
- Guardianes (ladrillos hard) flanquean al jefe; no bloquean la victoria si el jefe ya cayó.

### Feature 21 — Pantallas LOSER y WIN (V2)

- **LOSER** (`/lose`): derrota a 0 vidas. Título explícito, score, high score, Reintentar / Menú.
- **WIN** (`/win`): victoria. Título explícito, score, high score, Jugar de nuevo / Menú.
- V3: fondos ilustrados desde `inspiration/arkanoid/lose.png` y `win.png`.

### Feature 22 — Jefe en todos los niveles (V3)

- Cada nivel incluye un jefe móvil (arte `inspiration/arkanoid/boss.png`).
- Hits: nivel 1 = 4, nivel 2 = 6, nivel 3 = 8.
- Para completar un nivel hay que **destruir el muro y derrotar al jefe**.
- WIN solo al completar el último nivel con ambos objetivos.

### Feature 23 — Pack gráfico Design System (V4)

- El pack `inspiration/arkanoid` (`boss.png`, `win.png`, `lose.png`) es la identidad visual de runtime.
- Menú y Cómo jugar usan la foto del jefe como fondo.
- WIN / LOSER usan `win.png` / `lose.png`.
- El sprite del jefe es **la misma foto** (`contain`; pueden quedar bordes).
- Tokens oficiales en `iterations/v4/src/design-system/tokens/overrides.json`.
- High score: `arkanoid:v4:highScore`.

### Feature 07 — Puntuación

- Puntos por ladrillo destruido (V1):
  - Normal: **100** pts.
  - Resistente (al destruirse): **200** pts.
- Bonus opcional V1: +50 pts por vida restante al completar partida (deseable; no bloquea).
- Score de la sesión visible en HUD; al Game Over / Victory se compara con high score.

### Feature 08 — High score local

- Persistencia local del máximo puntaje.
- Visible en Menú y en Game Over / Victory.
- Sin rankings online.

### Feature 09 — Menú principal (futurista + intuitivo)

Pantalla de menú con jerarquía clara y una sola acción primaria:

1. Título / marca **Arkanoid** hero.
2. CTA primario: **Jugar**.
3. Acciones secundarias: **High score** (o score visible inline), **Cómo jugar** (breves reglas), opcional **Salir** (Android back).
4. Diseño **futurista**: tipografía display, gradientes/neon controlados, atmósfera sci-fi; **sin** clutter de cards ni badges flotantes.
5. Un solo job: elegir jugar o consultar info; no stats strips ni listados densos.

### Feature 10 — Pantallas de partida (diseño retro)

1. **Game** — campo, HUD (vidas, score, nivel), pala, bola, ladrillos; look **retro arcade** (paleta limitada, ladrillos planos, sensación 8-bit/16-bit).
2. **Level Clear** — “Nivel N completado”, CTA Continuar.
3. **Game Over** — score, high score, Reintentar / Menú.
4. **Victory** — partida completada, score, high score, Menú / Reintentar.

### Feature 11 — Pausa

Botón pausa en Game; overlay simple; el juego no avanza en pausa. Reanudar / Menú.

### Feature 12 — 100% offline

Sin red, sin cuentas, sin analytics remotos, sin anuncios.

### Feature 13 — Persistencia local

Guardar al menos: `highScore` (número). Opcional V1: último nivel alcanzado (no obligatorio).

### Feature 14 — Feedback básico

- Desaparición / flash del ladrillo al romper.
- Indicador de vidas (p. ej. iconos o “Vidas: 3”).
- Score y nivel visibles en HUD.

### Feature 15 — APK Release (BUILD)

App nativa Android generada con pipeline WIKA (Expo prebuild + release), instalable sin Metro.

---

## Funcionalidades deseables

### Feature 16 — Power-ups clásicos

Cápsulas al romper ladrillos: expandir pala, multibola, ralentizar bola (subset Arkanoid clásico).

### Feature 17 — Más niveles / layouts

Pack de 5–10 niveles con patrones geométricos.

### Feature 18 — Sonidos / hápticos

Beep al rebote / romper ladrillo / perder vida.

### Feature 19 — Temas visuales

Alternar paleta retro CRT vs neon futurista en partida.

---

## Fuera de alcance (V1)

- iOS
- Multijugador / online / leaderboards cloud
- Editor de niveles
- Tienda, IAP, anuncios
- Cuentas de usuario
- Landscape obligatorio
- Física 3D / motor externo pesado
- Clon exacto de assets comerciales Taito (usar diseño original WIKA inspirado en el género)
