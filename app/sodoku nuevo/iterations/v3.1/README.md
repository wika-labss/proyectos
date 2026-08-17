# Sodoku nuevo — iterations/v3.1 (test)

Modo test sobre V3.

## Delta vs V3
- **Pistas infinitas** (`INFINITE_HINTS` en `src/constants/testMode.ts`)
- Home rediseñada con recursos **Cute Pink Aesthetic**:
  - `assets/recursos/bg_002_cute_pink.png`
  - `assets/recursos/btn_002_cute_pink.png`
  - paleta `assets/recursos/paleta de colores.md` → `#FFD6E7 #FFB7D5 #FFA3C8 #FFFFFF #FFF5F8`

## Origen recursos
`proyectos/recursos/backgrounds/2. Cute Pink Aesthetic/`  
`proyectos/recursos/buttons/btn_002_cute_pink.png`

## Scripts
```bash
npm install
npm run typecheck
npm run smoke:v3
npm run validate:levels
cmd /c "scripts\verify-build.bat"
```
