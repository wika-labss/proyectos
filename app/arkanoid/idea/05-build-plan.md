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
| Unitarias | Engine: wall/paddle bounce, brick destroy, ball lost, cápsulas L–P |
| Unitarias | Audio: clamp de volumen ambiente 0–1; canales independientes |
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
- [ ] Reglas clásicas jugables (pala, bola, ladrillos, vidas, niveles)
- [ ] Menú futurista + partida retro
- [ ] High score persiste
- [ ] APK Release instalable sin Metro
- [ ] `generation-report.md` generado

---

## Orden WIKA (estado)

El ciclo oficial (`wika-fundaments/workflows/application-lifecycle.md`):

```
Idea → Preparación (idea/01–05)
     → Auditoría 1 (docs / módulos / ensamblado)
     → Generación IA (iterations/vN)
     → Auditoría 2 (release)
     → Refinamiento
     → Aprobación (final/)  — aún no
     → Demo / Publicación  — aún no
```

Aplicado a Arkanoid:

```
Preparación V1 (01–05) ✓
     → Auditoría Documentación V1 ✓
     → Auditoría Módulos V1 ✓
     → Auditoría Ensamblado V1 ✓
     → Generación iterations/v1 ✓
     → Auditoría Release V1 (código OK; APK pendiente)
     → Refinamiento V2 (jefe + /lose /win) — histórico en iterations/v2
     → Refinamiento V3 ← ACTUAL
           Preparación: idea/ actualizada (Features 22 + 23)
           Auditoría 1 V3: docs / módulos / ensamblado
           Generación: iterations/v3 (V1 − delta V2 + cápsulas)
           Auditoría 2: audits/auditoria-release-v3.md
     → Aprobación / final/  — bloqueado hasta APK + visto del arquitecto
```

**Estado actual:** V3 generado con cápsulas L E C S B D P. Gates smoke/tsc/export OK.  
**Siguiente:** APK local → aprobación del arquitecto.

---

## Plan de construcción V3 (cápsulas)

| Paso | Módulo | Feature | Archivos | Estado |
|------|--------|---------|----------|--------|
| V3-01 | docs | 22, 23 | `idea/01`–`05` | done |
| V3-02 | auditoría 1 | 23 | `audits/auditoria-release-v3.md` | en curso |
| V3-03 | `vaus-capsules` | 23 | `src/engine/capsules.ts` | done |
| V3-04 | `arkanoid-engine` | 23 | `arkanoidEngine.ts`, `types.ts` | done |
| V3-05 | `lives-system` | 23 P | `livesSystem.ts` (`onExtraLife`) | done |
| V3-06 | `game-loop` | 23 | `useArkanoidGame.ts` | done |
| V3-07 | `playfield-retro` / HUD / HowTo | 23 | `Playfield.tsx`, `Hud.tsx`, `how-to.tsx` | done |
| V3-08 | smoke | 23 | `scripts/smoke-v1.ts` | done |
| V3-09 | generación | — | `generation-report.md`, `review.md` | done |
| V3-10 | `ambient-audio` | 24 | `src/modules/ambient-audio/`, `assets/recursos/audio/` | done |
| V3-11 | APK | 15 | `npm run apk` | pending |

### Contexto obligatorio usado (regla WIKA)

```
idea/ (oficial, priorizada)
+ audits/ V1 y V3
+ iterations/v1/review.md  (vía review.md de proyecto)
+ iterations/v2/ (histórico: qué NO copiar)
+ iterations/v3/ (base clásica, luego cápsulas)
```

No se copian los documentos de `idea/` dentro de `iterations/`.

---

## Delta V2

| Incluido | Notas |
|----------|-------|
| Módulo `boss` | Jefe móvil, 8 hits, 1000 pts |
| Nivel 4 | Guardianes + jefe |
| `/lose` | Pantalla LOSER dedicada |
| `/win` | Pantalla WIN dedicada |
| High score | Clave `arkanoid:v2:highScore` |

## Delta V3

| Incluido | Notas |
|----------|-------|
| Jugabilidad | Igual que V1 (3 niveles, overlays) |
| Jefe / `/lose` / `/win` | **Retirados** |
| High score | Clave `arkanoid:v3:highScore` |
| Cápsulas Vaus | L E C S B D P |
| Audio ambiente | Loop desde `recursos/audio`; volumen canal `ambient` |
