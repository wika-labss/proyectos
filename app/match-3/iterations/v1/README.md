# Match-3 América — iterations/v1

Expo SDK 52 · React Native 0.76 · TypeScript · expo-router

## Scripts

- `npm run smoke` — engine + levels + progress (sin RN)
- `npm run typecheck` — `tsc --noEmit`
- `npm run verify` — gate de build WIKA
- `npm run apk` / `apk:win` — APK Release sin Metro

## Reglas

- Lógica pura en `src/engine/` (sin React)
- Estilos vía `src/constants/theme.ts` (0% hex en componentes)
- Package: `com.wika.match3`
