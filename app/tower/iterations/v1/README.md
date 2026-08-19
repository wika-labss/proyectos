# Tower Defense — iterations/v1

Expo SDK 52 · React Native · Android package `com.wika.tower`

## Reglas V1

- 15 niveles / mapas con diseño distinto
- 4 torres: Arquera, Cañón, Hielo, Francotirador
- Oleadas y dificultad escalan con el nivel
- 20 vidas de base · oro · campaña local (`tower:v1:campaign`)

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
