# Arkanoid — iterations/v2

Expo SDK 52 · React Native · Android package `com.wika.arkanoid`

Índice de todas las versiones: [`../README.md`](../README.md).

> **Histórico:** V2 es una rama experimental (jefe + `/lose` `/win`). **No** se usa como base de V3/V4.

## Reglas V2

- Pala táctil + bola + ladrillos (rebotes clásicos)
- 3 vidas; perder la bola resta una
- 3 niveles de ladrillos + **jefe** (8 hits, 1000 pts)
- Score 100 / 200 / 1000 + high score local (`arkanoid:v2:highScore`)
- Pantallas dedicadas **LOSER** (`/lose`) y **WIN** (`/win`)
- Menú futurista + partida retro

## Metadatos

| Campo | Valor |
|-------|-------|
| Versión APK | 1.0.0 |
| Rama Git | `cursor/arkanoid-v2-eb2a` |
| Estado | Histórico — gates smoke/tsc OK; descartado en contrato V3/V4 |
| Auditoría | [`auditoria-release-v2.md`](../../audits/auditoria-release-v2.md) |
| Informe | [`generation-report.md`](generation-report.md) |

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
