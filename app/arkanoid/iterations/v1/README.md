# Arkanoid — iterations/v1

Expo SDK 52 · React Native · Android package `com.wika.arkanoid`

## Reglas V1

- Pala táctil + bola + ladrillos (rebotes clásicos)
- 3 vidas; perder la bola resta una
- Score 100 / 200 + high score local (`arkanoid:v1:highScore`)
- 3 niveles; menú futurista + partida retro

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
