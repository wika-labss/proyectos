# Arkanoid — iterations/v4

Expo SDK 52 · React Native · package `com.wika.arkanoid` · versión 4.0.0

## Pack gráfico

| Asset | Uso |
|-------|-----|
| `assets/pack/boss.png` | Foto exacta del jefe (sprite, menú, icono, splash) |
| `assets/pack/win.png` | Fondo WIN |
| `assets/pack/lose.png` | Fondo LOSER |

Origen: `design-system/inspiration/arkanoid/`. Tokens: `src/design-system/tokens/overrides.json`.

## Reglas (igual que V3)

- **Jefe en todos los niveles** (4 / 6 / 8 hits)
- Hay que romper el muro **y** derrotar al jefe para avanzar
- 3 vidas; LOSER `/lose` y WIN `/win`
- Sprite del jefe: la foto del pack (`contain`; pueden quedar bordes)

## Scripts

| Comando | Uso |
|---------|-----|
| `npm start` | Metro / Expo Go |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke` | Gates del motor puro |
| `npm run apk` | APK Release (JDK 17) |
