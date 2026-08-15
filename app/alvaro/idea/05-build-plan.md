# 05 — Plan de construcción

## Proyecto
Alvaro — Snake Android (Expo / React Native)

## Versión
V1

## Objetivo
Construir la iteración `iterations/v1` siguiendo el flujo WIKA: documentación aprobada → módulos → ensamblado → código → APK Release.

---

## Alcance de la V1

| Incluido | No incluido |
|----------|-------------|
| Snake en grilla con tick | Power-ups / obstáculos |
| Crecimiento +1 por pelotita | Online / leaderboards |
| 3 vidas + reset entre vidas | iOS |
| Score por tiempo vivo (`×10`) | Sonidos complejos (opcional) |
| High score local | Velocidad dinámica (deseable) |
| Home / Game / Game Over + D-pad | Temas múltiples |
| APK Release sin Metro | EAS Store submit |

---

## Módulos incluidos

1. `snake-engine`
2. `lives-system`
3. `survival-score`
4. `game-loop`
5. `offline-progress`
6. `snake-controls`
7. `snake-screens`
8. `android-release`

---

## Stack y entorno (WIKA)

| Ítem | Valor |
|------|-------|
| Framework | Expo SDK **52** + React Native |
| Navegación | `expo-router` |
| Persistencia | `@react-native-async-storage/async-storage` |
| Node | 20 LTS |
| JDK | **17** (no 21/26) |
| Android | minSdk 24, compileSdk 35, targetSdk 34 |
| Kotlin | 1.9.25 vía `expo-build-properties` |
| Perfil target | **BUILD** → APK Release |
| Package sugerido | `com.wika.alvaro` |

Regla WIKA: instalar `expo-*` / `react-native-*` con `npx expo install`; versiones `~` (nunca `^` en expo/RN).

---

## Orden de implementación

### Fase A — Bootstrap
1. Crear `iterations/v1/` (Expo SDK 52 + Router + TypeScript).
2. Configurar `app.json` / `expo-build-properties` (JDK/Kotlin/SDK).
3. Scripts: `start`, `typecheck`, `verify-build`, `build:apk` (patrón WIKA).

### Fase B — Motor puro
1. Implementar `snake-engine` (step, food, growth, collisions).
2. Tests unitarios: crecer al comer; hit wall/self; no 180°.
3. Implementar `lives-system` (3 → 0).
4. Implementar `survival-score` (tiempo × 10).

### Fase C — Loop + UI
1. `game-loop` con estados playing / lifeLost / gameOver / paused (paused opcional).
2. Pantallas Home / Game / Game Over.
3. D-pad + cola de dirección.
4. HUD vidas + score.

### Fase D — Persistencia
1. `offline-progress` load/save high score (`alvaro:v1:highScore`).
2. Actualizar high score en Game Over.

### Fase E — Release
1. `tsc` / typecheck limpio.
2. `expo export` o gate `verify-build` WIKA.
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
| Performance del tick en JS | Mantener engine O(n) simple; tick ≥ 120 ms |
| Build Android JDK incorrecto | Documentar JDK 17; fallar early en scripts |
| Controles torpes | Preferir D-pad; área táctil ≥ 44 dp |

---

## Estrategia de pruebas

| Tipo | Qué |
|------|-----|
| Unitarias | Engine: eat→grow, collision, spawn food libre |
| Unitarias | Lives: 3 colisiones → game over |
| Unitarias | Score: 2.4 s → 24 puntos; pausa no suma |
| Manual | Partida completa en device; high score persiste al matar app |
| Build | typecheck + verify-build + APK instalable |

---

## Criterios de aprobación (DoD V1)

- [x] Documentación 01–05 completa
- [x] Auditoría de documentación APROBADA
- [x] Auditoría de módulos APROBADA
- [x] Auditoría de ensamblado APROBADA
- [x] Serpiente crece al comer pelotita
- [x] 3 vidas funcionan hasta Game Over
- [x] Score = tiempo vivo × 10; high score persiste
- [ ] APK Release instalable sin Metro
- [x] `generation-report.md` generado

---

## Orden WIKA (estado)

```
Idea → Preparación (01–05)
     → Auditoría Documentación ✓
     → Auditoría Módulos ✓
     → Auditoría Ensamblado ✓
     → Construcción iterations/v1 ✓
     → Auditoría Release ← APK pendiente (local)
```

**Estado actual:** Código V1 listo; gates smoke/typecheck/export OK.  
**Siguiente:** `npm run apk` con JDK 17 + Android SDK → re-auditoría Release → `final/`.
