# Generation / validation report — Chupalo joako V1

## Date
2026-08-17

## Gates

| Gate | Result |
|------|--------|
| `npm run smoke` | **PASSED** (engine, bag, score, difficulty-by-score) |
| `npm run typecheck` | **PASSED** |
| `npx expo export --platform android` | **PASSED** |
| `npm run apk` / `assembleRelease` | Pendiente (JDK 17 + Android SDK en máquina local) |

## Implementación

| Feature | Estado |
|---------|--------|
| Pozo 10×20 + 7 tetrominós + 7-bag | Sí (`tetris-engine`, `piece-bag`) |
| Move / rotación CW / wall kick ±1 | Sí |
| Soft drop + hard drop + lock delay 500 ms | Sí (`game-loop`) |
| Line clear 1–4 | Sí |
| Score 100/300/500/800 + 1/2 por celda drop | Sí (`tetris-score`) |
| Dificultad por umbrales de puntaje (500 pts) | Sí (`score-difficulty`) |
| Preview 1 pieza | Sí |
| Paleta neón por pieza | Sí (`vivid-playfield`) |
| Menú / Cómo jugar / Pausa / Game Over | Sí (`tetris-screens`) |
| High score local | Sí (`chupalo-joako:v1:highScore`) |
| Offline | Sí |

## Stack
Expo SDK 52 · React Native 0.76.9 · package `com.wika.chupalojoako`

## Notes
APK Release: ejecutar `npm run apk` con JDK 17 y Android SDK (`BUILD-APK.md`).
