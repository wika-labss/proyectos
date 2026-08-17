# Chupalo joako Tetris — iterations/v1

Expo SDK 52 · React Native · Android package `com.wika.chupalojoako`

## Reglas V1

- Pozo 10×20 · 7 tetrominós · 7-bag
- Puntos: 100/300/500/800 + drops
- Dificultad por umbrales de **puntaje** (cada 500 pts)
- High score local (`chupalo-joako:v1:highScore`)
- Paleta neón por pieza

## Scripts

| Comando | Uso |
|---------|-----|
| `npm start` | Metro / Expo Go |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke` | Gates del motor puro |
| `npm run verify` | Gates WIKA + APK Release (JDK 17 + Android SDK) |
| `npm run apk` | Solo APK Release |

## Build APK

Ver `BUILD-APK.md`. Requiere **JDK 17** y Android SDK.
