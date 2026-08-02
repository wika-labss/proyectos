# Diseño

## Experiencia de usuario

El juego debe sentirse **calmado, claro y satisfactorio**. Interacción con una sola mano: el tablero ocupa la zona superior y el teclado numérico la inferior. Feedback inmediato en cada acción (colocar número, error, pista, victoria). Sin pantallas de carga innecesarias — transiciones suaves entre niveles.

Principios UX:
- **Claridad** — El tablero es el protagonista; UI mínima alrededor
- **Progresión visible** — El jugador siempre sabe en qué nivel está y cuánto falta
- **Perdón** — Deshacer, pistas y validación no destructiva (no penalizar errores con game over)
- **Accesibilidad** — Contraste alto, targets táctiles ≥ 44×44 pt

## Pantallas / Vistas

| Pantalla | Descripción |
|----------|-------------|
| **Inicio** | Logo, botón "Jugar" (continúa o va a niveles), acceso a ajustes y estadísticas |
| **Selección de niveles** | Grid scrollable de 20 tarjetas numeradas con estado (bloqueado/desbloqueado/completado) y estrellas |
| **Juego** | Tablero 9×9 centrado, barra superior (nivel, timer, pistas restantes), teclado numérico inferior, toolbar (notas, deshacer, borrar) |
| **Victoria** | Modal/pantalla con tiempo, estrellas ganadas, botón "Siguiente nivel" o "Repetir" |
| **Ajustes** | Toggle tema oscuro/claro, sonido, vibración, reiniciar progreso |
| **Estadísticas** | Niveles completados, tiempo total, mejor racha, promedio por dificultad |

## Flujos de usuario

### Flujo principal — Jugar un nivel

1. Usuario abre la app → Pantalla inicio
2. Toca "Jugar" → Selección de niveles
3. Selecciona un nivel desbloqueado → Carga puzzle → Pantalla juego
4. Toca celda vacía → Toca número en teclado → Número se coloca
5. Si error → Celda se resalta en rojo temporalmente
6. Completa el tablero → Pantalla victoria con tiempo y estrellas
7. Toca "Siguiente nivel" → Desbloquea y carga nivel N+1

### Flujo secundario — Usar pista

1. En pantalla juego, toca botón "Pista"
2. Si quedan pistas → Revela número correcto en celda seleccionada (o celda vacía aleatoria)
3. Decrementa contador de pistas
4. Si no quedan → Botón deshabilitado con tooltip

### Flujo secundario — Modo notas

1. Toca botón "Lápiz" → Activa modo notas
2. Toca celda → Toca número → Se agrega como candidato pequeño en la celda
3. Toca "Lápiz" de nuevo → Vuelve a modo entrada normal

## Estilo visual

### Paleta de colores

| Token | Claro | Oscuro | Uso |
|-------|-------|--------|-----|
| `background` | `#F8F9FA` | `#1A1B2E` | Fondo general |
| `surface` | `#FFFFFF` | `#252640` | Tablero, tarjetas |
| `primary` | `#4A6CF7` | `#6B8AFF` | Botones, selección activa |
| `text` | `#1A1A2E` | `#E8E8F0` | Números fijos, títulos |
| `textSecondary` | `#6B7280` | `#9CA3AF` | Labels, números del jugador |
| `accent` | `#F59E0B` | `#FBBF24` | Estrellas, victoria |
| `error` | `#EF4444` | `#F87171` | Errores, conflictos |
| `success` | `#10B981` | `#34D399` | Nivel completado |
| `gridLine` | `#D1D5DB` | `#374151` | Líneas del tablero |
| `gridLineBold` | `#6B7280` | `#9CA3AF` | Líneas de cuadrante 3×3 |
| `highlight` | `#DBEAFE` | `#1E3A5F` | Fila/columna/cuadrante seleccionado |
| `highlightSame` | `#BFDBFE` | `#2D4A6F` | Mismo número resaltado |

### Tipografía

| Elemento | Fuente | Tamaño | Peso |
|----------|--------|--------|------|
| Números fijos (pistas) | System / SF Pro | 22sp | Bold |
| Números del jugador | System / SF Pro | 22sp | Regular |
| Notas/candidatos | System / SF Pro | 10sp | Regular |
| Título pantalla | System / SF Pro | 24sp | Bold |
| Labels / botones | System / SF Pro | 16sp | Medium |

### Componentes UI

- **Celdas:** Cuadradas, ratio 1:1, borde fino; cuadrantes 3×3 con borde grueso
- **Teclado numérico:** 9 botones en fila (o 3×3 grid), altura mínima 48dp
- **Tarjetas de nivel:** Bordes redondeados (12px), sombra sutil, icono de candado si bloqueado, estrellas doradas si completado
- **Botones de acción:** Pill shape, icono + label, área táctil generosa

## Responsive / Accesibilidad

- **Pantallas:** Adaptar tamaño de celda al ancho disponible (min 36dp, max 44dp)
- **Orientación:** Solo portrait en v1
- **Contraste:** Ratio mínimo 4.5:1 (WCAG AA) en texto sobre fondo
- **Daltonismo:** No depender solo del color rojo para errores; agregar icono ✕ o subrayado
- **Tamaño táctil:** Mínimo 44×44 pt en todos los elementos interactivos
- **Lectores de pantalla:** Labels en celdas ("Fila 3, Columna 5, vacía"), anuncio de errores y victoria
- **Reducir movimiento:** Respetar `prefers-reduced-motion`; desactivar animaciones de victoria
