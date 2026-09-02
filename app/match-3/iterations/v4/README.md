# Match-3 América — iterations/v4

Expo SDK 52 · React Native 0.76 · TypeScript · expo-router  
Package: `com.wika.match3` · version **4.0.0**

Contrato visual: Design System WIKA (`visual-expectation/match-3-v4/`).  
No modifica `iterations/v1/`, `v2/`, `v3/` ni `v3.1/`.

## Qué cambia vs v3.1

- Tablero 8×10 grande (cell máx. 52, chrome 2px)
- Cameo aleatorio 7s (saludo → regalos +10 → despedida)
- Diálogo breve al DAR un regalo (español)
- Tienda: 8 regalos × 20 000 · máximo 10 por tipo
- CTA **Tienda** en Home

## Qué se preserva

- `src/engine/` (match-3, economía, afinidad)
- Timer 2:30, Fácil/Media, payout 3–200, viaje 500/1000
- Storage **`match3:v3:progress`**
- Seed de test: `1_000_000` monedas

## Scripts

- `npm run web` — preview tipo emulador
- `npm run smoke` — engine + economía + tienda + diálogos
- `npm run typecheck`
- `npm run apk` — APK Release sin Metro

APK: `match-3-america-v4-release.apk` (Git LFS)
