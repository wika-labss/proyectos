# Arkanoid — iterations/v3

Expo SDK 52 · React Native · Android package `com.wika.arkanoid` · versión **3.0.3**

Fuente de verdad: `app/arkanoid/idea/`. Flujo de este ciclo: `app/arkanoid/audits/flujo-wika-v3.md`. Este README no copia `idea/`.

Índice de todas las versiones: [`../README.md`](../README.md).

## Reglas V3 (sin delta V2)

V3 es el juego **clásico** (misma base que V1). **No incluye** los cambios de V2:

- Sin jefe / nivel 4
- Sin rutas `/lose` ni `/win`
- Game Over y Victoria son overlays sobre Game
- 33 niveles de ladrillos, de fácil a difícil; victoria al limpiar el último muro
- Cápsulas Vaus: **L** láser, **E** enlarge, **C** catch, **S** slow, **B** break, **D** disrupt, **P** vida extra
- Audio ambiente: MP3 Castillo en loop; **no se carga al abrir la app** — arranca al pulsar **JUGAR** (~500 ms después). Si falla, la partida sigue. Slider en pausa. Ver [`auditoria-audio-arranque-v3.md`](../../audits/auditoria-audio-arranque-v3.md).
- Fondo de partida: pack `inspiration/arkanoid-castle`
- Score 100 / 200 + high score `arkanoid:v3:highScore`
- UI 8-bit unificada (Press Start 2P, paleta NES, fondo Castillo)

## Metadatos

| Campo | Valor |
|-------|-------|
| Versión APK | 3.0.3 (`versionCode` 4) |
| Rama Git | `cursor/arkanoid-v3-classic-eb2a` |
| Estado | Código OK; sideload físico pendiente (ERR-V3-05) |
| Errores conocidos | [`errores-v3.md`](../../audits/errores-v3.md) |
| Informe | [`generation-report.md`](generation-report.md) |

## Scripts

| Comando | Uso |
|---------|-----|
| `npm start` | Metro / Expo Go |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke` | Gates del motor puro |
| `npm run verify` | Gates WIKA + APK Release (JDK 17 + Android SDK) |
| `npm run apk` | APK Release (Linux/mac) |
| `npm run apk:win` | APK Release (Windows) |

## Build APK

Ver `BUILD-APK.md`. Requiere **JDK 17** y Android SDK.
