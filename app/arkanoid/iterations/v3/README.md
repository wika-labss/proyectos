# Arkanoid — iterations/v3

Expo SDK 52 · React Native · Android package `com.wika.arkanoid` · versión 3.0.0

## Reglas V3 (sin delta V2)

V3 es el juego **clásico** (misma base que V1). **No incluye** los cambios de V2:

- Sin jefe / nivel 4
- Sin rutas `/lose` ni `/win`
- Game Over y Victoria son overlays sobre Game
- 3 niveles de ladrillos; victoria al limpiar el último muro
- Cápsulas Vaus: **L** láser, **E** enlarge, **C** catch, **S** slow, **B** break, **D** disrupt, **P** vida extra
- Audio ambiente en loop al iniciar; volumen **Ambiente** independiente (menú y pausa)
- Score 100 / 200 + high score `arkanoid:v3:highScore`
- Menú futurista + partida retro

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
