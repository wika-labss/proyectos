# Funcionalidades

## Funcionalidades principales

- [ ] **Tablero Sudoku 9×9** — Grilla interactiva con celdas fijas (pistas) y editables
- [ ] **20 niveles progresivos** — Dificultad escalable de fácil a experto
- [ ] **Generación de puzzles** — Cada nivel genera un puzzle único y válido con una sola solución
- [ ] **Entrada de números** — Teclado numérico táctil (1–9) con selección de celda
- [ ] **Validación en tiempo real** — Resaltar errores, conflictos en fila/columna/cuadrante
- [ ] **Sistema de pistas** — Revelar un número correcto (limitado por nivel)
- [ ] **Deshacer / Rehacer** — Historial de movimientos
- [ ] **Temporizador** — Cronómetro por partida con registro de mejor tiempo
- [ ] **Guardado automático** — Partida en curso y progreso de niveles persistidos localmente
- [ ] **Pantalla de selección de niveles** — Mapa o lista con niveles bloqueados/desbloqueados
- [ ] **Detección de victoria** — Confirmación al completar el puzzle correctamente

## Progresión de los 20 niveles

| Nivel | Dificultad | Pistas iniciales | Técnicas requeridas |
|-------|------------|------------------|---------------------|
| 1–4   | Fácil      | 42–46            | Lógica directa (naked singles) |
| 5–8   | Fácil+     | 38–41            | Singles ocultos básicos |
| 9–12  | Medio      | 32–37            | Pares desnudos, intersecciones |
| 13–16 | Difícil    | 26–31            | X-Wing básico, cadenas simples |
| 17–20 | Experto    | 20–25            | Técnicas avanzadas, mínimas pistas |

> Cada nivel desbloquea el siguiente al completarse. Los niveles pueden rejugar libremente una vez desbloqueados.

## Funcionalidades secundarias

- [ ] **Modo oscuro / claro** — Tema visual intercambiable
- [ ] **Estadísticas** — Partidas jugadas, ganadas, tiempo promedio, racha
- [ ] **Notas / candidatos** — Modo lápiz para marcar números posibles en una celda
- [ ] **Resaltar relacionados** — Al seleccionar un número, resaltar todas sus ocurrencias
- [ ] **Efectos de sonido** — Feedback auditivo al colocar número, error, victoria (silenciable)
- [ ] **Animaciones de victoria** — Celebración visual al completar un nivel

## Fuera de alcance (v1)

- Multijugador o partidas online
- Rankings globales / leaderboards
- Cuentas de usuario / autenticación
- Monetización (anuncios, compras in-app)
- Variantes de Sudoku (Killer, Hyper, Samurai)
- Modo diario con puzzle compartido globalmente
- Backend o sincronización en la nube

## Prioridad

| Funcionalidad | Prioridad | Notas |
|---------------|-----------|-------|
| Tablero 9×9 interactivo | Alta | Core del juego |
| 20 niveles con progresión | Alta | Requisito principal |
| Generación y validación de puzzles | Alta | Motor del juego |
| Guardado local y progreso | Alta | Esencial para retención |
| Teclado numérico y selección | Alta | UX móvil |
| Validación de errores | Alta | Feedback inmediato |
| Pantalla selección de niveles | Alta | Navegación principal |
| Pistas limitadas | Media | Ayuda progresiva |
| Notas / candidatos | Media | Jugadores intermedios |
| Temporizador y estadísticas | Media | Motivación |
| Deshacer / Rehacer | Media | Calidad de vida |
| Modo oscuro | Baja | Pulido visual |
| Sonidos y animaciones | Baja | Polish final |
