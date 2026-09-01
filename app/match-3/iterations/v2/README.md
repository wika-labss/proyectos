# Match-3 América — iterations/v2

Expo SDK 52 · React Native 0.76 · TypeScript · expo-router

Contrato: `idea/` version 2.0.0. No modifica `iterations/v1/`.

## V2

- Perfil en Home: nombre, preferencia, avatar 8-bit (6 retratos)
- Pretendientes: 2H+2M por país; unlock = país
- Regalos en niveles pares; dar a pretendientes (+10 / +2)
- Afinidad: amigos / ligue / pareja / matrimonio; espejo amorio / infidelidad culposa
- Unlock país: 10 niveles + ≥3 regalos ganados (lifetime)

Arte diferido (placeholders): sprites de regalos, mapa ilustrado, retratos de elenco.

## Scripts

- `npm run smoke` — engine + afinidad + progreso (sin RN)
- `npm run typecheck` — `tsc --noEmit`
- `npm run verify` — gate de build WIKA
- `npm run apk` / `apk:win` — APK Release sin Metro

## Reglas

- Lógica pura en `src/engine/` (sin React)
- Estilos vía `src/constants/theme.ts` (0% hex en componentes)
- Package: `com.wika.match3`
- Storage: `match3:v2:progress`

## APK Release

- [`match-3-america-v2-release.apk`](./match-3-america-v2-release.apk) (~61 MB, Git LFS)
- Mirror: [`../../final/match-3-america-v2-release.apk`](../../final/match-3-america-v2-release.apk)

```bash
adb install -r match-3-america-v2-release.apk
```
