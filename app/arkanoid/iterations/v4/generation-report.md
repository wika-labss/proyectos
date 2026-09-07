# Generation / validation report — Arkanoid V4

## Date
2026-09-06

## Intención

V4 = V3 **sin archivo MP3 ni `expo-av`**. Mismo juego clásico (33 niveles, cápsulas, overlays, 8-bit). Feature 24 queda histórica en `iterations/v3`.

Fuente de verdad: `idea/` (no se copia aquí).  
Flujo: `audits/flujo-wika-v4.md`.

## Contexto de generación

```
idea/ 01–05 (V4: Feature 24 retirada)
+ audits V3 (errores de audio)
+ iterations/v3 (base; se quita ambient-audio)
+ iterations/v2 (qué NO copiar)
```

## Delta vs V3

| V3 | V4 |
|----|----|
| `ambient-castle.mp3` / `expo-av` | **Ausentes** |
| `ambient-audio` + slider | **Ausentes** |
| High score `arkanoid:v3:highScore` | `arkanoid:v4:highScore` |
| version 3.0.3 | 4.0.0 / versionCode 5 |

## Gates

| Gate | Result |
|------|--------|
| `npm run smoke` | **PASSED** — classic + 33 levels + cápsulas; no MP3 |
| `npm run typecheck` | **PASSED** |
| APK Release | pendiente sideload |

## Stack
Expo SDK 52 · React Native 0.76.9 · **sin expo-av** · package `com.wika.arkanoid` · version `4.0.0`
