# Arkanoid — iterations/v5

Expo SDK 52 · React Native · Android package `com.wika.arkanoid` · versión **5.0.0**

Fuente de verdad visual: `design-system/visual-expectation/arkanoid-v4/` (Gate 1 APROBADO).  
Contrato funcional: `app/arkanoid/idea/`. Este README no copia `idea/`.

Base: fork silencioso de `origin/cursor/arkanoid-v4-silent-eb2a` → `iterations/v4` (no editada).

## Reglas V5

V4 clásico **sin audio** + chrome VE vaporwave:

- Sin MP3, sin `expo-av`, sin jefe / `/lose` / `/win`
- 33 niveles, cápsulas L E C S B D P
- High score `arkanoid:v5:highScore` (no borra la key v4)
- Avatar local `arkanoid:v5:avatar`
- Home left hero / right rail · slider + lerp · HUD chip
- `src/engine/` intacto

## Metadatos

| Campo | Valor |
|-------|-------|
| Versión APK | 5.0.0 (`versionCode` 6) |
| Look | 8-bit vaporwave (VE v4) |
| Informe DS | [`DS-IMPLEMENTATION.md`](DS-IMPLEMENTATION.md) |

## Scripts

| Comando | Uso |
|---------|-----|
| `npm start` | Metro / Expo Go |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke` | Gates del motor puro + “no hay mp3” |
| `npm run apk` | APK Release (Linux/mac) |
