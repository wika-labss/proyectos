# 05 — Plan de construcción

## Proyecto
Chupalo joako — Tetris Android (Expo / React Native)

## Versión
V1

## Objetivo
Construir la iteración `iterations/v1` siguiendo el flujo WIKA: documentación aprobada → módulos → ensamblado → código → APK Release.

---

## Alcance de la V1

| Incluido | No incluido |
|----------|-------------|
| Pozo 10×20 + 7 tetrominós + 7-bag | Hold / reserva |
| Move, rotación CW, wall kick ±1 | SRS completo / iOS |
| Soft drop + hard drop + lock delay 500 ms | Online / leaderboards |
| Line clear 1–4 | Vidas / continues |
| Score 100/300/500/800 + 1/2 por celda drop | Multiplicador por nivel |
| Dificultad por umbrales de **puntaje** (500 pts) | Dificultad por líneas |
| Preview 1 pieza | Ghost piece (deseable) |
| Menú arcade llamativo + paleta neón | Sonidos complejos |
| Pausa, Game Over, Cómo jugar | EAS Store submit |
| High score local | Marca / assets Tetris® |
| APK Release sin Metro | — |

---

## Módulos incluidos

1. `tetris-engine`
2. `piece-bag`
3. `tetris-score`
4. `score-difficulty`
5. `game-loop`
6. `offline-progress`
7. `tetris-controls`
8. `vivid-playfield`
9. `tetris-screens`
10. `android-release`

---

## Stack y entorno (WIKA)

| Ítem | Valor |
|------|-------|
| Framework | Expo SDK **52** + React Native |
| Navegación | `expo-router` |
| Persistencia | `@react-native-async-storage/async-storage` |
| Render juego | React Native Views (grilla de celdas); sin deps nativas extra en V1 |
| Node | 20 LTS |
| JDK | **17** (no 21/26) |
| Android | minSdk 24, compileSdk 35, targetSdk 34 |
| Kotlin | 1.9.25 vía `expo-build-properties` |
| Perfil target | **BUILD** → APK Release |
| Package sugerido | `com.wika.chupalojoako` |

Regla WIKA: instalar `expo-*` / `react-native-*` con `npx expo install`; versiones `~` (nunca `^` en expo/RN).

---

## Orden de implementación

### Fase A — Bootstrap
1. Crear `iterations/v1/` (Expo SDK 52 + Router + TypeScript).
2. Configurar `app.json` / `expo-build-properties` (JDK/Kotlin/SDK).
3. Scripts: `start`, `typecheck`, `verify-build`, `build:apk` (patrón WIKA).

### Fase B — Motor puro
1. `tetris-engine`: spawn, move, rotate+kick, lock, line clear, top-out.
2. `piece-bag`: 7-bag + preview.
3. Tests unitarios: I-horizontal lock 4 líneas → tetris; rotación contra pared; spawn bloqueado → top-out; pieza no atraviesa stack.
4. `tetris-score` (tabla Feature 06) + `score-difficulty` (500 pts → nivel, gravityMs).

### Fase C — Loop + UI
1. `game-loop`: gravedad según `gravityMs(score)`, lock delay, pausa.
2. `vivid-playfield` + HUD score/nivel + preview (hex Feature 02).
3. `tetris-controls` (botones + DAS/ARR).
4. `tetris-screens`: Menú / Game / Pause / Game Over / HowTo.

### Fase D — Persistencia
1. `offline-progress` load/save (`chupalo-joako:v1:highScore`).
2. Actualizar high score en Game Over.

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
| Tick JS inestable en nivel 10 (70 ms) | Clamp `dt`; no saltar celdas de más de 1 por substep |
| Controles torpes | Botones grandes; DAS 200 ms / ARR 80 ms |
| Build Android JDK incorrecto | Documentar JDK 17; fallar early en scripts |
| Dificultad implementada por líneas “por costumbre Tetris” | Test: 4 líneas con score < 500 **no** suben nivel; score 500 **sí** |
| Paleta lavada en OLED | Hex saturados fijos; borde oscuro en cada celda |

---

## Estrategia de pruebas

| Tipo | Qué |
|------|-----|
| Unitarias | Engine: move/rotate/kick, lock, clear 1–4, top-out |
| Unitarias | Bag: una bolsa contiene exactamente las 7 piezas |
| Unitarias | Score: 1→100, 2→300, 3→500, 4→800; soft 1/celda; hard 2/celda |
| Unitarias | Difficulty: score 0→lv1/800ms; 499→lv1; 500→lv2/650ms; 4500→lv10/70ms |
| Unitarias | Difficulty **no** usa líneas: 8 líneas con score mock 100 → sigue lv1 |
| Manual | Partida completa; colores distinguibles; high score persiste al matar app |
| Build | typecheck + verify-build + APK instalable |

---

## Criterios de aprobación (DoD V1)

- [x] Documentación 01–05 completa
- [x] Auditoría de documentación APROBADA
- [x] Auditoría de módulos APROBADA
- [x] Auditoría de ensamblado APROBADA
- [x] 7 tetrominós + líneas + top-out jugables
- [x] Puntos según tabla; HUD score + nivel
- [x] Dificultad avanza con umbrales de puntaje
- [x] Paleta llamativa aplicada
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
