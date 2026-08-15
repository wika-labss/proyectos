# Generation / validation report — Alvaro V1

## Date
2026-08-15

## Gates

| Gate | Result |
|------|--------|
| `npm run smoke` | **PASSED** (growth, collisions, lives, score) |
| `npm run typecheck` | **PASSED** |
| `npx expo export --platform android` | **PASSED** |
| `npm run apk` / `assembleRelease` | Pendiente (JDK 17 + Android SDK en máquina local) |

## Implementación

| Feature | Estado |
|---------|--------|
| Crece +1 al comer pelotita | Sí (`snake-engine`) |
| 3 vidas + reset entre vidas | Sí (`lives-system` + loop) |
| Score = tiempo vivo × 10 | Sí (`survival-score`) |
| High score local | Sí (`alvaro:v1:highScore`) |
| Home / Game / Game Over + D-pad | Sí |
| Offline | Sí |

## Stack
Expo SDK 52 · React Native 0.76.9 · package `com.wika.alvaro`

## Notes
APK Release: ejecutar `npm run apk` con JDK 17 y Android SDK (`BUILD-APK.md`).
