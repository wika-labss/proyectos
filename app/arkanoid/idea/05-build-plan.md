# 05 — Plan de construcción

## Proyecto
Arkanoid — Breakout / Arkanoid Android (Expo / React Native)

## Versión
V1

## Objetivo
Construir la iteración `iterations/v1` siguiendo el flujo WIKA: documentación aprobada → módulos → ensamblado → código → APK Release.

---

## Alcance de la V1

| Incluido | No incluido |
|----------|-------------|
| Pala + bola + rebotes clásicos | Power-ups / multibola |
| Ladrillos normal (+ hard en niveles ≥ 2) | Online / leaderboards |
| 3 vidas + reset de bola | iOS |
| ≥ 3 niveles | Editor de niveles |
| Score 100/200 + high score local | Sonidos complejos (opcional) |
| Menú futurista intuitivo | Temas conmutables en runtime |
| Partida look retro | Física 3D |
| Pausa, Game Over, Victory, Cómo jugar | EAS Store submit |
| APK Release sin Metro | — |

---

## Módulos incluidos

1. `arkanoid-engine`
2. `brick-field`
3. `lives-system`
4. `arkanoid-score`
5. `game-loop`
6. `level-progress`
7. `offline-progress`
8. `paddle-controls`
9. `menu-futuristic`
10. `playfield-retro`
11. `arkanoid-screens`
12. `android-release`

---

## Stack y entorno (WIKA)

| Ítem | Valor |
|------|-------|
| Framework | Expo SDK **52** + React Native |
| Navegación | `expo-router` |
| Persistencia | `@react-native-async-storage/async-storage` |
| Render juego | React Native Views / Animated o canvas ligero (sin deps nativas extra en V1) |
| Node | 20 LTS |
| JDK | **17** (no 21/26) |
| Android | minSdk 24, compileSdk 35, targetSdk 34 |
| Kotlin | 1.9.25 vía `expo-build-properties` |
| Perfil target | **BUILD** → APK Release |
| Package sugerido | `com.wika.arkanoid` |

Regla WIKA: instalar `expo-*` / `react-native-*` con `npx expo install`; versiones `~` (nunca `^` en expo/RN).

---

## Orden de implementación

### Fase A — Bootstrap
1. Crear `iterations/v1/` (Expo SDK 52 + Router + TypeScript).
2. Configurar `app.json` / `expo-build-properties` (JDK/Kotlin/SDK).
3. Scripts: `start`, `typecheck`, `verify-build`, `build:apk` (patrón WIKA).

### Fase B — Motor puro
1. Implementar `arkanoid-engine` (step, paddle bounce, walls, ball lost).
2. Implementar `brick-field` (layouts × 3 niveles, hits).
3. Tests unitarios: rebote pala por zona; destruir ladrillo; ball lost; level clear.
4. `lives-system` (3 → 0) + `arkanoid-score` (100/200) + `level-progress`.

### Fase C — Loop + UI
1. `game-loop` con estados menu/playing/paused/ballLost/levelClear/gameOver/victory.
2. `playfield-retro` + HUD.
3. `paddle-controls` (drag + launch).
4. `menu-futuristic` + pantallas Level Clear / Game Over / Victory / HowTo.

### Fase D — Persistencia
1. `offline-progress` load/save (`arkanoid:v1:highScore`).
2. Actualizar high score en Game Over / Victory.

### Fase E — Release
1. `tsc` / typecheck limpio.
2. Gate `verify-build` WIKA.
3. Generar APK Release; validar sideload sin Metro.
4. `generation-report.md` en `iterations/v1/`.

---

## Dependencias externas

- Expo SDK 52 ecosystem
- AsyncStorage
- Dispositivo Android físico o emulador para smoke test (V1 no requiere hardware especial)

---

## Riesgos

| Riesgo | Plan |
|--------|------|
| Colisiones a alta velocidad | Substeps / clamp `dt` |
| Performance JS del loop | Target ~60fps con step simple O(bricks) |
| Build Android JDK incorrecto | Documentar JDK 17; fallar early en scripts |
| Diferencia visual menú vs juego diluida | Tokens separados; review de diseño en auditoría |

---

## Estrategia de pruebas

| Tipo | Qué |
|------|-----|
| Unitarias | Engine: wall/paddle bounce, brick destroy, ball lost |
| Unitarias | Lives: 3 pérdidas → game over |
| Unitarias | Score: normal 100, hard 200; high score max |
| Unitarias | Levels: clear → next; last → victory |
| Manual | Partida completa; menú CTA claro; look futurista vs retro |
| Build | typecheck + verify-build + APK instalable |

---

## Criterios de aprobación (DoD V1)

- [x] Documentación 01–05 completa
- [x] Auditoría de documentación APROBADA
- [x] Auditoría de módulos APROBADA
- [x] Auditoría de ensamblado APROBADA
- [x] Reglas clásicas jugables (pala, bola, ladrillos, vidas, niveles)
- [x] Menú futurista + partida retro
- [x] High score persiste
- [ ] APK Release instalable sin Metro
- [x] `generation-report.md` generado

---

## Orden WIKA (estado)

```
Idea → Preparación (01–05) ✓
     → Auditoría Documentación ✓
     → Auditoría Módulos ✓
     → Auditoría Ensamblado ✓
     → Construcción iterations/v1 ✓
     → Auditoría Release ← APK pendiente (local)
```

**Estado actual:** Código V1 listo; gates smoke/typecheck/export OK.  
**Siguiente:** `npm run apk` con JDK 17 + Android SDK → re-auditoría Release → `final/`.
