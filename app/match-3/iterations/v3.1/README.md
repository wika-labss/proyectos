# Match-3 América — iterations/v3.1

Expo SDK 52 · React Native 0.76 · TypeScript · expo-router  
Package: `com.wika.match3` · version **3.1.1**

Contrato visual: Design System WIKA Gate 1 (`visual-expectation/match-3-v3/approval.md`).  
No modifica `iterations/v1/`, `v2/` ni `v3/`.

## Qué cambia vs V3

- Dual layer: paisaje `bg-night.png` + chrome 8-bit night-cyan
- Home 3 bloques (perfil horizontal, CTAs bisel, chip de monedas)
- Mapa América pixel + labels MX→AR + HUD Viajar
- Partida: gemas `gems.png`, HUD chips SCORE/MOVES/TIME/PÁNICO, tablero **8×10**
- Elenco: bustos `cast/{pais}.png` (no glifos)
- Inventario: sprites `gifts.png`
- Tokens en `src/design-system/` (0% hex en pantallas)

## Qué se preserva

- `src/engine/` (match-3, economía, afinidad)
- Timer 2:30, Fácil/Media, payout 3–200, viaje 500/1000
- Storage **`match3:v3:progress`** (progreso y monedas de V3 se conservan)
- Seed de test: `1_000_000` monedas

## Scripts

- `npm run web` — preview tipo emulador en el navegador (marco de teléfono)
- `npm run smoke` — engine + economía + viaje (sin RN)
- `npm run typecheck` — `tsc --noEmit`
- `npm run verify` — gate de build WIKA
- `npm run apk` / `apk:win` — APK Release sin Metro
- `bash scripts/sync-design-system.sh` — tokens/assets desde el repo design-system

APK publicado: `match-3-america-v3.1-release.apk` (~70 MB, Git LFS)


## Reglas

- Lógica pura en `src/engine/` (sin React)
- Estilos vía tokens night-cyan (0% hex en componentes)
- Labels en React Native, no en PNGs de producción
- Arte de inspiración con watermark **no** entra al APK
