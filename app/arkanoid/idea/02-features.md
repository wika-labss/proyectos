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

**Estado V3:** hecho  
**Módulos:** `brick-field`, `level-progress`, `arkanoid-engine`, `arkanoid-screens`

- V1: al menos **3 niveles** con layouts distintos.
- **V3: exactamente 33 niveles** (`LEVEL_COUNT = 33`), de más fácil a más difícil.
- Completar nivel → overlay Level Clear → siguiente (vidas se conservan).
- Completar el **33** → overlay Victory + high score. Sin jefe y sin `/win`.
- V2 añadió un jefe; **V3 retira ese delta** (ver Feature 22).

#### Contrato de dificultad (V3)

| Tramo | Niveles | Regla |
|-------|---------|-------|
| Tutorial | 1–6 | Solo ladrillos **normal**. El muro crece (2 → 7 filas). |
| Hard entra | 7–12 | 6 filas. Aparecen **hard**; la proporción hard sube. |
| Formas | 13–20 | 6–7 filas. Pasillos, tablero y fortalezas. |
| Mayoría hard | 21–26 | 7–8 filas. Casi todo hard. |
| Finales | 27–33 | 8 filas. El 33 es muro hard completo. |

Alfabeto de layout: `n` normal (1 hit), `h` hard (2 hits), `.` vacío. 8 columnas.  
Velocidad de bola: `280 + nivelIndex * 5` px/s (el 33 no se vuelve injugable).  
Los hits necesarios no pueden caer más de 12 respecto del pico anterior (curva fácil → difícil).

#### Escenarios BDD

- **Dado que** el jugador toca Jugar, **cuando** carga el campo, **entonces** está en el nivel 1 (índice 0), solo ladrillos normales, y el HUD muestra `LV 1`.
- **Dado que** limpia el muro del nivel N (N < 33), **cuando** continúa, **entonces** carga el nivel N+1 y las vidas se conservan.
- **Dado que** limpia el muro del nivel 33, **cuando** se resuelve el clear, **entonces** aparece overlay Victory sobre Game y no existe ruta `/win`.
- **Dado que** se carga el nivel 7 o posterior, **cuando** `loadLevel` termina, **entonces** hay al menos un ladrillo hard.
- **Dado que** se carga el nivel 33, **cuando** `loadLevel` termina, **entonces** todos los ladrillos son hard.
- **Dado que** hay B activo en el nivel 33, **cuando** la pala sale por la puerta, **entonces** también hay victoria (mismo camino que clear).

### Feature 20 — Jefe (V2)

- Tras 3 niveles de ladrillos, el nivel 4 es un **jefe** móvil.
- El jefe patrulla horizontalmente, rebota en laterales y requiere **8 impactos**.
- Derrotar al jefe otorga **1000** pts y abre la pantalla **WIN**.
- Guardianes (ladrillos hard) flanquean al jefe; no bloquean la victoria si el jefe ya cayó.

### Feature 21 — Pantallas LOSER y WIN (V2)

- **LOSER** (`/lose`): derrota a 0 vidas. Título explícito, score, high score, Reintentar / Menú.
- **WIN** (`/win`): victoria al derrotar al jefe. Título explícito, score, high score, Jugar de nuevo / Menú.
- Ya no se resuelven como overlays sobre Game; son rutas propias.

### Feature 22 — V3 sin delta V2

- V3 **no incluye** jefe, nivel 4, ni rutas `/lose` y `/win`.
- Game Over y Victoria vuelven a ser overlays sobre Game (como V1).
- Victoria = limpiar el muro del nivel 33.
- High score: `arkanoid:v3:highScore`.
- El código de V2 permanece en `iterations/v2/` como histórico.

### Feature 23 — Cápsulas Vaus (V3)

**Estado:** hecho (V3)  
**Módulo:** `vaus-capsules` (+ `arkanoid-engine`, `lives-system`, `playfield-retro`, `game-loop`)

Al destruir ladrillos pueden caer cápsulas. Atraparlas con la pala aplica:

| Código | Nombre | Efecto |
|--------|--------|--------|
| L | Láser | La Vaus dispara y rompe bloques |
| E | Enlarge | Alarga la nave |
| C | Catch | Atrapa la bola; toca para relanzar |
| S | Slow | Ralentiza la bola |
| B | Break | Abre puerta lateral; salir avanza de nivel |
| D | Disrupt | Divide la bola en tres |
| P | Player | Vida extra (máx. 6) |

Las cápsulas L/E/C/S/D se sustituyen entre sí. P y B no quitan el resto. Perder la última bola resetea poderes.

#### Escenarios BDD

- **Dado que** un ladrillo se destruye, **cuando** el azar decide soltar cápsula, **entonces** cae una de L/E/C/S/B/D/P y el HUD/playfield la muestran.
- **Dado que** la pala atrapa L, **cuando** la bola ya está en juego, **entonces** la Vaus dispara hacia arriba y el disparo puede romper ladrillos.
- **Dado que** la pala atrapa E, **cuando** se aplica, **entonces** la nave se alarga y sustituye L/C/S/D.
- **Dado que** hay C activo, **cuando** la bola toca la pala, **entonces** se pega; un toque la relanza.
- **Dado que** hay S activo, **cuando** la bola se mueve, **entonces** su velocidad es menor que la del nivel.
- **Dado que** hay B activo, **cuando** la pala sale por la puerta derecha, **entonces** se avanza de nivel (o victoria si era el último).
- **Dado que** la bola está en juego y se atrapa D, **cuando** se aplica, **entonces** hay tres bolas; solo se pierde vida al caer la última.
- **Dado que** se atrapa P, **cuando** hay menos de 6 vidas, **entonces** vidas + 1 y el poder actual no se borra.

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

**Hecho en V3** (Feature 23): L, E, C, S, B, D, P.

### Feature 17 — Más niveles / layouts

**Hecho en V3.** El contrato oficial está en Feature 06.  
Implementación: `brick-field` lee 33 layouts (`levelLayouts.ts`). No se inventan tipos de ladrillo extra.

### Feature 18 — Sonidos / hápticos

Beep al rebote / romper ladrillo / perder vida. **No bloquea V3.** El loop ambiental es Feature 24.

### Feature 24 — Audio ambiente en bucle (V3)

**Estado:** hecho (V3)  
**Módulo:** `ambient-audio`

- Única pista: el MP3 subido (Castillo). Catálogo: `recursos/audio/arkanoid-ambient-castle.mp3`. Runtime: `ambient-castle.mp3` (misma pieza, encode móvil ≤ 64 kbps / ≤ 2 MB).
- El menú y **Jugar** son el camino crítico. Abrir la app **no** carga `expo-av`. El loop Castillo arranca al pulsar **Jugar**, cuando la partida ya está en pantalla.
- Reproducción Android: `MediaPlayer` + URI local (stream). No ExoPlayer con `shouldPlay: true` sobre el asset embebido.
- Si `expo-av` o el MP3 fallan, la app sigue; el usuario puede iniciar la partida.
- El volumen **ambiente** es un canal propio (menú y pausa), independiente de un futuro canal SFX.
- Persistencia: `arkanoid:v3:ambientVolume`. El tema queda fijado a `castle`.

#### Escenarios BDD

- **Dado que** se abre la app, **cuando** el layout monta, **entonces** el menú es usable y no se importa `expo-av`.
- **Dado que** el usuario toca Jugar, **cuando** la partida está en pantalla, **entonces** se pide el loop Castillo.
- **Dado que** `expo-av` o el MP3 fallan, **cuando** el usuario toca Jugar, **entonces** la partida arranca igual.
- **Dado que** el audio cargó, **cuando** el usuario navega a partida o pausa, **entonces** la misma pista sigue sonando.
- **Dado que** el usuario mueve el control de ambiente, **cuando** suelta un valor, **entonces** solo cambia el volumen; no cambia de archivo.

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
