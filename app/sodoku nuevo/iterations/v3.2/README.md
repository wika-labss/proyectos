# Sodoku nuevo — iterations/v3.2

Diseño unificado con pack `recursos/recursos sodoku/assets-generados/`.

## Proceso
Ver `idea/PROCESO-V3.2.md` y `idea/V3.2.md`.

## Delta vs V3.1
- Kit UI `src/modules/sodoku-ui-kit/` (botones, chips, tiles)
- Assets en `assets/recursos/ui/`
- Storage `sodoku-nuevo:v3.2:*`

## Scripts
```bash
npm install
npm run typecheck
npm run smoke:v3
cmd /c "scripts\verify-build.bat"
```
