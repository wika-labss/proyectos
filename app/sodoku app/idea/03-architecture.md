# Arquitectura

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework móvil | **React Native + Expo SDK 52** |
| Lenguaje | TypeScript (strict mode) |
| Navegación | Expo Router (file-based routing) |
| Estado global | Zustand |
| Persistencia | AsyncStorage (progreso, settings, partida activa) |
| Estilos | StyleSheet nativo + tokens de diseño centralizados |
| Testing | Jest + React Native Testing Library |
| Build | EAS Build (Android APK/AAB + iOS IPA) |

## Estructura del proyecto

```text
app/sodoku app/
├── idea/                          # Documentación WIKA
├── iterations/v1/                 # Código generado por IA
│   ├── app/                       # Expo Router — pantallas
│   │   ├── _layout.tsx            # Layout raíz + providers
│   │   ├── index.tsx              # Pantalla inicio
│   │   ├── levels.tsx             # Selección de 20 niveles
│   │   ├── game/[levelId].tsx     # Pantalla de juego
│   │   └── settings.tsx           # Configuración
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.tsx          # Grilla 9×9
│   │   │   ├── Cell.tsx           # Celda individual
│   │   │   ├── NumberPad.tsx      # Teclado 1–9
│   │   │   ├── LevelCard.tsx      # Tarjeta de nivel
│   │   │   ├── Timer.tsx          # Cronómetro
│   │   │   └── HintButton.tsx     # Botón de pista
│   │   ├── engine/
│   │   │   ├── generator.ts       # Generación de puzzles
│   │   │   ├── solver.ts          # Solucionador (backtracking)
│   │   │   ├── validator.ts       # Validación de movimientos
│   │   │   └── difficulty.ts     # Config de 20 niveles
│   │   ├── stores/
│   │   │   ├── gameStore.ts       # Estado de partida activa
│   │   │   ├── progressStore.ts   # Niveles desbloqueados/completados
│   │   │   └── settingsStore.ts   # Tema, sonido, etc.
│   │   ├── hooks/
│   │   │   ├── useGame.ts         # Lógica de juego
│   │   │   └── useTimer.ts        # Cronómetro
│   │   ├── types/
│   │   │   └── index.ts           # Board, Cell, Level, GameState
│   │   ├── constants/
│   │   │   ├── levels.ts          # Definición de 20 niveles
│   │   │   └── theme.ts           # Colores, tipografía, espaciado
│   │   └── utils/
│   │       └── storage.ts         # Wrapper AsyncStorage
│   ├── assets/                    # Iconos, splash, fuentes
│   ├── app.json                   # Config Expo
│   ├── package.json
│   └── tsconfig.json
├── review.md
└── final/
```

## Componentes principales

### Motor de puzzles (`src/engine/`)

- **generator.ts** — Genera una grilla completa válida, luego elimina celdas según la dificultad del nivel manteniendo solución única
- **solver.ts** — Backtracking para verificar solución única y resolver puzzles
- **validator.ts** — Valida movimientos del jugador (conflictos fila/columna/cuadrante 3×3)
- **difficulty.ts** — Mapea nivel (1–20) a cantidad de pistas, técnicas y pistas disponibles

### Capa de estado (`src/stores/`)

- **gameStore** — Tablero actual, celda seleccionada, historial undo/redo, modo notas, pistas usadas
- **progressStore** — Niveles desbloqueados, tiempos récord, estrellas por nivel
- **settingsStore** — Tema claro/oscuro, sonido on/off, vibración

### Capa de UI (`src/components/` + `app/`)

- Pantallas con Expo Router
- Componentes reutilizables desacoplados del estado via props/hooks

## Flujo de datos

```text
Usuario toca celda
  → gameStore.setSelectedCell(row, col)
  → Usuario toca número en NumberPad
  → validator.checkMove(board, row, col, value)
  → Si válido: gameStore.applyMove() + persist to AsyncStorage
  → Si inválido: resaltar celda en rojo
  → solver.isComplete(board)?
    → Sí: progressStore.completeLevel() + navegar a pantalla victoria
    → No: continuar
```

```text
App inicia
  → progressStore.load() from AsyncStorage
  → settingsStore.load() from AsyncStorage
  → Si hay partida activa: gameStore.restore()
  → Mostrar pantalla inicio
```

## Decisiones técnicas

| Decisión | Elección | Justificación |
|----------|----------|---------------|
| React Native + Expo | Sí | Un solo codebase para Android e iOS, ecosistema maduro, builds con EAS |
| Sin backend | Sí | v1 es offline-first; reduce complejidad y costos |
| Generación local | Sí | No depende de API externa; funciona sin conexión |
| Zustand vs Redux | Zustand | Menos boilerplate, suficiente para el scope del juego |
| AsyncStorage vs SQLite | AsyncStorage | Datos simples (progreso, settings); no requiere queries complejas |
| Expo Router | Sí | Navegación declarativa basada en archivos, integrada con Expo |
| TypeScript strict | Sí | Seguridad de tipos en lógica de juego crítica |

## Algoritmo de generación (resumen)

1. Crear grilla 9×9 vacía
2. Llenar diagonal de 3 cuadrantes 3×3 con números aleatorios válidos
3. Resolver el resto con backtracking → grilla completa
4. Eliminar celdas según `cluesCount` del nivel
5. Verificar que quede **exactamente una solución**
6. Si no, reintentar desde paso 4
7. Retornar puzzle + solución (solución almacenada para pistas)
