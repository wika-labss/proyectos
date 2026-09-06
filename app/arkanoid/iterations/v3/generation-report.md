# Generation / validation report — Arkanoid V3

## Date
2026-09-06

## Intención

V3 **sin los cambios de V2**. Misma jugabilidad que V1, más el contrato de `idea/`:

- Feature 06 / 17: 33 layouts, fácil → difícil. Victoria al limpiar el 33.
- Feature 22: sin jefe, sin `/lose` `/win` (overlays).
- Feature 23: cápsulas Vaus L E C S B D P.
- Feature 24: única pista `ambient-castle.mp3` en loop (menú y partida). Volumen `ambient` independiente.
- UI 8-bit + pack `inspiration/arkanoid-castle`.

Flujo WIKA: `audits/flujo-wika-v3.md`.  
Fuente de verdad: `idea/` (no se copia aquí).

## Contexto de generación

```
idea/ 01–05
+ audits/auditoria-1-v3.md
+ review.md
+ iterations/v1
+ iterations/v2 (qué no copiar)
```

## Archivos del incremento 33 niveles

| Rol | Ruta |
|-----|------|
| Tabla de layouts | `src/engine/levelLayouts.ts` |
| Carga / hits | `src/engine/brickField.ts` |
| Constante | `src/constants/game.ts` (`LEVEL_COUNT = 33`, `BALL_SPEED_PER_LEVEL = 5`) |
| HowTo | `app/how-to.tsx` |
| Smoke | `scripts/smoke-v1.ts` |

## Gates

| Gate | Result |
|------|--------|
| `npm run smoke` | **PASSED** (classic + 33 levels + cápsulas + canal ambiente) |
| `npm run typecheck` | **PASSED** |
| `npx expo export --platform android` | **PASSED** (962 modules; font + Castillo PNG + MP3) |
| APK Release | Pendiente JDK 17 local |

## Features cubiertas

1–8, 9–11, 13–14, 16–17, 18 (ambiente; SFX de beep sigue deseable), 22, 23, 24.

## Delta vs V2 (retirado)

| Feature V2 | En V3 |
|------------|-------|
| Jefe móvil / nivel 4 | No |
| `/lose` LOSER | No (overlay Game Over) |
| `/win` WIN | No (overlay Victoria) |
| High score v2 | `arkanoid:v3:highScore` |

## Audio (runtime V3)

| Canal | Clave | Default |
|-------|-------|---------|
| tema | fijado `castle` | `ambient-castle.mp3` |
| ambient | `arkanoid:v3:ambientVolume` | 0.45 |
| sfx | `arkanoid:v3:sfxVolume` | 0.80 (reservado) |

## Stack
Expo SDK 52 · React Native 0.76.9 · `expo-av` · package `com.wika.arkanoid` · version `3.0.0`
