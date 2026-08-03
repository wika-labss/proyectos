# Prompt IA

## Instrucciones para el agente

Genera una aplicación móvil de Sudoku completa y funcional basada en la documentación de este proyecto. El código debe generarse en `iterations/v1/` y estar listo para ejecutarse con Expo en Android e iOS.

### Qué construir

Un juego de Sudoku con **20 niveles progresivos**, interfaz táctil optimizada para móvil, funcionamiento offline y persistencia local del progreso.

## Reglas de generación

1. **Stack obligatorio:** React Native + Expo SDK 52 + TypeScript + Expo Router + Zustand + AsyncStorage
2. **Seguir la arquitectura** definida en `03-architecture.md` — respetar estructura de carpetas y módulos
3. **Implementar funcionalidades** de `02-features.md` en orden de prioridad (Alta → Media → Baja)
4. **Respetar el diseño** de `04-design.md` — paleta de colores, tipografía, layout, flujos UX
5. **20 niveles exactos** con la progresión de dificultad de `02-features.md` (tabla de pistas y dificultad)
6. **Motor de puzzles propio** — generador + solucionador + validador en `src/engine/`; no usar APIs externas
7. **Código limpio** — componentes pequeños, tipos estrictos, sin `any`, funciones puras en el engine
8. **Persistencia** — guardar progreso, partida activa y settings en AsyncStorage automáticamente
9. **Offline-first** — cero dependencia de red; todo funciona sin conexión
10. **Una sola mano** — teclado numérico en la parte inferior, tablero arriba
11. **Seguir `06-build-environment.md`** — manifiesto de dependencias y toolchain nativo completo

## Dependencias técnicas (WIKA — obligatorio)

Antes de entregar, ejecutar:

```bash
npx expo install --fix
npx expo-doctor
```

Checklist según `06-build-environment.md`:

- [ ] `expo-asset` incluido
- [ ] `expo-build-properties` incluido
- [ ] `react-native-screens` ~4.4.0
- [ ] Plugins en app.json (expo-router, expo-asset, expo-build-properties)
- [ ] Kotlin 1.9.25 en expo-build-properties

## Gates de verificación (bloqueantes v2)

| Gate | Comando |
|------|---------|
| Dependencias | `npx expo-doctor` → 0 errores |
| TypeScript | `npx tsc --noEmit` |
| Metro | `npx expo start` |
| Prebuild | `npx expo prebuild --platform android` |
| APK debug | `./gradlew assembleDebug` → BUILD SUCCESSFUL |

## Restricciones adicionales

- **NO** usar backend, Firebase, Supabase ni servicios en la nube
- **NO** incluir anuncios, compras in-app ni autenticación
- **NO** usar librerías de Sudoku pre-hechas (ej. sudoku-gen); implementar el algoritmo
- **NO** usar Redux, MobX ni Context API para estado global; usar Zustand
- **NO** hardcodear puzzles; generar dinámicamente por nivel
- Máximo **3 pistas** por partida en niveles 1–10, **2 pistas** en 11–16, **1 pista** en 17–20
- El proyecto debe poder iniciarse con `npx expo start` sin configuración adicional

## Resultado esperado

```text
iterations/v1/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx              # Pantalla inicio
│   ├── levels.tsx             # 20 niveles
│   ├── game/[levelId].tsx     # Juego
│   └── settings.tsx
├── src/
│   ├── components/            # Board, Cell, NumberPad, LevelCard, Timer, HintButton
│   ├── engine/                # generator, solver, validator, difficulty
│   ├── stores/                # gameStore, progressStore, settingsStore
│   ├── hooks/                 # useGame, useTimer
│   ├── types/                 # Board, Cell, Level, GameState
│   ├── constants/             # levels (20), theme
│   └── utils/                 # storage wrapper
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

### Criterios de aceptación para v1

- [ ] `npx expo start` ejecuta sin errores
- [ ] Tablero 9×9 renderiza y acepta input táctil
- [ ] Los 20 niveles aparecen en pantalla de selección con estados correctos
- [ ] Nivel 1 desbloqueado por defecto; completar desbloquea el siguiente
- [ ] Puzzles se generan con dificultad acorde al nivel
- [ ] Errores se resaltan visualmente sin bloquear el juego
- [ ] Pistas funcionan con límite por nivel
- [ ] Progreso persiste al cerrar y reabrir la app
- [ ] Pantalla de victoria muestra tiempo y permite avanzar
- [ ] Modo oscuro funcional desde ajustes
- [ ] UI usable en pantalla de 5" (iPhone SE) y 6.7" (iPhone Pro Max)

### Criterios técnicos WIKA (bloqueantes v2)

- [ ] `npx expo-doctor` sin errores
- [ ] Manifiesto de `06-build-environment.md` completo
- [ ] `npx expo prebuild --platform android` exitoso
- [ ] `./gradlew assembleDebug` → BUILD SUCCESSFUL
- [ ] App instalable en dispositivo Android físico

### Orden de implementación sugerido

1. Configuración (`package.json`, `app.json`) según `06-build-environment.md`
2. Tipos y constantes (`types/`, `constants/levels.ts`, `constants/theme.ts`)
3. Motor de puzzles (`engine/generator.ts`, `solver.ts`, `validator.ts`, `difficulty.ts`)
4. Stores con persistencia (`stores/`, `utils/storage.ts`)
5. Componentes UI (`components/Board.tsx`, `Cell.tsx`, `NumberPad.tsx`)
6. Pantallas (`app/index.tsx`, `levels.tsx`, `game/[levelId].tsx`)
7. Features secundarias (notas, deshacer, timer, pistas, estadísticas)
8. Polish (animaciones victoria, sonidos, modo oscuro)
9. **`npx expo install --fix` + `npx expo-doctor` + verificar gates de build**
