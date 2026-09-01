# Match-3 América — iterations/v3

Expo SDK 52 · React Native 0.76 · TypeScript · expo-router

Contrato: `idea/` version 3.0.0. No modifica `iterations/v1/` ni `v2/`.

## V3

- Home en 3 bloques animados: identidad, CTAs, monedas
- Partida: timer 2:30, dificultad Fácil/Media visible, `minScore`
- Payout: `clamp(round(3 + 197 * remainingSec / 150), 3, 200)`
- Viaje: 10 niveles del país + 500 monedas (1000 si hay pareja)
- Tablero: swap → pop → gravedad/refill con `resolveOnce` y `Animated`
- Seed de test: `1_000_000` monedas
- Perfil, pretendientes y afinidad de V2

Arte diferido (FEAT-15–17): sprites de regalos, mapa ilustrado, retratos de elenco.

## Scripts

- `npm run smoke` — engine + economía + viaje (sin RN)
- `npm run typecheck` — `tsc --noEmit`
- `npm run verify` — gate de build WIKA
- `npm run apk` / `apk:win` — APK Release sin Metro

## Reglas

- Lógica pura en `src/engine/` (sin React)
- Estilos vía `src/constants/theme.ts` (0% hex en componentes)
- Package: `com.wika.match3`
- Storage: `match3:v3:progress`

## APK Release

[`match-3-america-v3-release.apk`](./match-3-america-v3-release.apk) (~61 MB, Git LFS). Autónomo, sin Metro.

```bash
adb install -r match-3-america-v3-release.apk
```
