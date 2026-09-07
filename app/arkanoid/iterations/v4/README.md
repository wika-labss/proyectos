# Arkanoid — iterations/v4

Expo SDK 52 · React Native · Android package `com.wika.arkanoid` · versión **4.0.0**

Fuente de verdad: `app/arkanoid/idea/`. Flujo: `app/arkanoid/audits/flujo-wika-v4.md`. Este README no copia `idea/`.

Índice de todas las versiones: [`../README.md`](../README.md).

## Reglas V4

V3 clásico **sin audio**:

- Sin MP3, sin `expo-av`, sin slider de ambiente
- Sin jefe / `/lose` / `/win`
- 33 niveles, cápsulas L E C S B D P
- High score `arkanoid:v4:highScore`
- UI 8-bit; fondo de partida pack Castillo (PNG, no sonido)

## Metadatos

| Campo | Valor |
|-------|-------|
| Versión APK | 4.0.0 (`versionCode` 5) |
| Rama Git | `cursor/arkanoid-v4-silent-eb2a` |
| Estado | Código OK; sideload pendiente |
| Auditoría | [`auditoria-release-v4.md`](../../audits/auditoria-release-v4.md) |
| Informe | [`generation-report.md`](generation-report.md) |

## Scripts

| Comando | Uso |
|---------|-----|
| `npm start` | Metro / Expo Go |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke` | Gates del motor puro + “no hay mp3” |
| `npm run apk` | APK Release (Linux/mac) |
| `npm run apk:win` | APK Release (Windows) |

## Build APK

Ver `BUILD-APK.md`. JDK **17**.
